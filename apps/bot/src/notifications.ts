import { prisma } from "@msk-forms/db";
import {
  parseBotConfig,
  type MessageNotification,
  type StatusChangeNotification,
  type SubmissionReviewNotification,
} from "@msk-forms/shared";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  EmbedBuilder,
  type Client,
} from "discord.js";

import { config } from "./config.js";
import { dmStrings, localizedStatus } from "./i18n.js";
import { postBranded } from "./posting.js";
import { grantAcceptedRole } from "./roles.js";
import { dashboardSubmissionUrl, statusUrl } from "./urls.js";

const MSK_GREEN = 0x00e676;
const BATCH = 25;
/** Discord error code: "Cannot send messages to this user" (DMs closed / no mutual guild). */
const CANNOT_DM = 50007;
/** Permanent channel errors: Unknown Channel / Missing Access / Missing Permissions. */
const CHANNEL_GONE = [10003, 50001, 50013];

/** Guards against overlapping ticks if a batch outlives the poll interval. */
let running = false;

type PendingRow = {
  id: string;
  type: string;
  payload: unknown;
  guildId: string | null;
  user: { discordId: string; locale: string } | null;
};

/** A status-change or message DM, localized to the applicant's locale. */
function buildMessage(row: PendingRow): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} | null {
  const payload = row.payload as Partial<StatusChangeNotification & MessageNotification>;
  if (!payload?.submissionId) return null;

  const locale = row.user?.locale;
  const s = dmStrings(locale);
  const url = statusUrl(config.apiBaseUrl, payload.submissionId);
  const embed = new EmbedBuilder()
    .setColor(MSK_GREEN)
    .setTitle(payload.formTitle ?? s.title)
    .setURL(url)
    .setFooter({ text: "MSK Forms" });

  if (row.type === "status_change") {
    embed.setDescription(s.statusNow(localizedStatus(locale, payload.toStatus, payload.toStatusLabel)));
  } else if (row.type === "message" && payload.message) {
    embed.setDescription(s.newMessage(payload.message));
  } else {
    return null;
  }

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(s.viewStatus).setURL(url),
  );
  return { embeds: [embed], components: [button] };
}

/**
 * Post the "new submission" review embed to the guild's configured review
 * channel. Drops (marks read) when there's no guild, no configured channel, or
 * the channel is permanently unreachable; retries on transient errors.
 */
async function deliverReview(client: Client, row: PendingRow): Promise<boolean> {
  if (!row.guildId) return true;
  const payload = row.payload as Partial<SubmissionReviewNotification>;
  if (!payload?.submissionId) return true;

  const guild = await prisma.guild.findUnique({
    where: { id: row.guildId },
    select: { botConfig: true },
  });
  const channelId = parseBotConfig(guild?.botConfig).reviewChannelId;
  if (!channelId) return true; // no review channel configured → nothing to do

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased() || !channel.isSendable()) {
      console.warn(`[bot] review channel ${channelId} not usable — dropping ${row.id}.`);
      return true;
    }

    const url = dashboardSubmissionUrl(config.apiBaseUrl, row.guildId, payload.submissionId);
    const lines = [`**Applicant:** ${payload.applicantName ?? "Anonymous"}`];
    if (payload.preview?.length) lines.push("", ...payload.preview.map((l) => `• ${l}`));

    const embed = new EmbedBuilder()
      .setColor(MSK_GREEN)
      .setTitle(`New submission — ${payload.formTitle ?? "form"}`)
      .setURL(url)
      .setDescription(lines.join("\n").slice(0, 4000))
      .setFooter({ text: "MSK Forms" });

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`sub:accept:${payload.submissionId}`)
        .setStyle(ButtonStyle.Success)
        .setLabel("Accept"),
      new ButtonBuilder()
        .setCustomId(`sub:reject:${payload.submissionId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel("Reject"),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Open in dashboard").setURL(url),
    );

    await postBranded(channel, row.guildId, { embeds: [embed], components: [buttons] });
    return true;
  } catch (err) {
    if (err instanceof DiscordAPIError && CHANNEL_GONE.includes(Number(err.code))) {
      console.warn(`[bot] review channel ${channelId} gone (${err.code}) — dropping ${row.id}.`);
      return true;
    }
    console.error(`[bot] failed to post review embed to ${channelId}:`, err);
    return false;
  }
}

/**
 * Try to deliver one notification. Returns true when the row should be marked
 * read — on success, when there's no recipient, or on a permanent "can't DM"
 * error. Returns false for transient failures so the next tick retries.
 */
async function deliverOne(client: Client, row: PendingRow): Promise<boolean> {
  if (row.type === "submission_review") return deliverReview(client, row);

  const discordId = row.user?.discordId;
  if (!discordId) return true;

  const message = buildMessage(row);
  if (!message) {
    console.warn(`[bot] notification ${row.id} has an unrecognised payload — dropping.`);
    return true;
  }

  // Grant the accepted role on acceptance — this covers every non-button path
  // (web review, bulk actions, automations). The Accept button grants directly;
  // roles.add is idempotent, so a double grant here is harmless.
  if (row.type === "status_change") {
    const payload = row.payload as Partial<StatusChangeNotification>;
    if (payload?.toStatus === "accepted" && payload.submissionId) {
      await grantAcceptedRole(client, payload.submissionId);
    }
  }

  try {
    const user = await client.users.fetch(discordId);
    await user.send(message);
    return true;
  } catch (err) {
    if (err instanceof DiscordAPIError && Number(err.code) === CANNOT_DM) {
      console.warn(`[bot] can't DM user ${discordId} — dropping notification ${row.id}.`);
      return true;
    }
    console.error(`[bot] failed to DM user ${discordId}:`, err);
    return false;
  }
}

/** Deliver all pending outbox notifications as applicant DMs. */
export async function deliverPendingNotifications(client: Client): Promise<void> {
  if (running) return;
  running = true;
  try {
    const pending = (await prisma.notification.findMany({
      where: { readAt: null, type: { in: ["status_change", "message", "submission_review"] } },
      orderBy: { createdAt: "asc" },
      take: BATCH,
      select: {
        id: true,
        type: true,
        payload: true,
        guildId: true,
        user: { select: { discordId: true, locale: true } },
      },
    })) as PendingRow[];

    // Deliver each row independently (one failure must not abort the batch),
    // collect the ones to retire, then mark them all read in a single write.
    const deliveredIds: string[] = [];
    for (const row of pending) {
      try {
        if (await deliverOne(client, row)) deliveredIds.push(row.id);
      } catch (err) {
        console.error(`[bot] delivery failed for notification ${row.id}:`, err);
      }
    }
    if (deliveredIds.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: deliveredIds } },
        data: { readAt: new Date() },
      });
    }
  } catch (err) {
    console.error("[bot] notification delivery error:", err);
  } finally {
    running = false;
  }
}
