import { prisma } from "@msk-forms/db";
import {
  parseBotConfig,
  parseFormSettings,
  type LogNotification,
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
import { fmt, guildStrings } from "./guild-i18n.js";
import { dmStrings, localizedStatus } from "./i18n.js";
import { postBranded } from "./posting.js";
import { grantAcceptedRole } from "./roles.js";
import { dashboardSubmissionUrl, statusUrl } from "./urls.js";

const MSK_GREEN = 0x00e676;
const LOG_RED = 0xff5252;
const LOG_BLURPLE = 0x5865f2;
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
function buildMessage(
  row: PendingRow,
  locale: string | undefined,
): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} | null {
  const payload = row.payload as Partial<StatusChangeNotification & MessageNotification>;
  if (!payload?.submissionId) return null;

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

  // Resolve the review channel: the per-form override wins over the guild's
  // bot config. Look both up via the submission this notification is about.
  const sub = await prisma.submission.findUnique({
    where: { id: payload.submissionId },
    select: { form: { select: { settings: true } }, guild: { select: { botConfig: true } } },
  });
  const botCfg = parseBotConfig(sub?.guild.botConfig);
  const channelId =
    parseFormSettings(sub?.form.settings).reviewChannelId ?? botCfg.reviewChannelId;
  if (!channelId) return true; // no review channel configured → nothing to do
  const s = guildStrings(botCfg.locale);

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased() || !channel.isSendable()) {
      console.warn(`[bot] review channel ${channelId} not usable — dropping ${row.id}.`);
      return true;
    }

    const url = dashboardSubmissionUrl(config.apiBaseUrl, row.guildId, payload.submissionId);
    const lines = [`**${s.applicant}:** ${payload.applicantName ?? s.anonymous}`];
    if (payload.preview?.length) lines.push("", ...payload.preview.map((l) => `• ${l}`));

    const embed = new EmbedBuilder()
      .setColor(MSK_GREEN)
      .setTitle(fmt(s.reviewTitle, { form: payload.formTitle ?? "form" }))
      .setURL(url)
      .setDescription(lines.join("\n").slice(0, 4000))
      .setFooter({ text: "MSK Forms" });

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`sub:accept:${payload.submissionId}`)
        .setStyle(ButtonStyle.Success)
        .setLabel(s.btnAccept),
      new ButtonBuilder()
        .setCustomId(`sub:reject:${payload.submissionId}`)
        .setStyle(ButtonStyle.Danger)
        .setLabel(s.btnReject),
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(s.btnOpenDashboard).setURL(url),
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

/** Per-action presentation for the guild activity log: emoji, title, colour. */
const LOG_PRESENTATION: Record<string, { emoji: string; title: string; color: number }> = {
  submission_created: { emoji: "📝", title: "New submission", color: MSK_GREEN },
  status_changed: { emoji: "🔄", title: "Status changed", color: LOG_BLURPLE },
  message_sent: { emoji: "💬", title: "Message sent to applicant", color: LOG_BLURPLE },
  submission_withdrawn: { emoji: "↩️", title: "Submission withdrawn", color: LOG_RED },
  submission_deleted: { emoji: "🗑️", title: "Submission deleted", color: LOG_RED },
  role_granted: { emoji: "✅", title: "Role granted", color: MSK_GREEN },
  form_created: { emoji: "✨", title: "Form created", color: MSK_GREEN },
  form_updated: { emoji: "✏️", title: "Form updated", color: LOG_BLURPLE },
  form_deleted: { emoji: "🗑️", title: "Form deleted", color: LOG_RED },
  form_posted: { emoji: "📤", title: "Form posted", color: LOG_BLURPLE },
  member_added: { emoji: "➕", title: "Member added", color: MSK_GREEN },
  member_role_changed: { emoji: "👤", title: "Member role changed", color: LOG_BLURPLE },
  member_removed: { emoji: "➖", title: "Member removed", color: LOG_RED },
  bot_config_updated: { emoji: "⚙️", title: "Bot config updated", color: LOG_BLURPLE },
  branding_updated: { emoji: "🎨", title: "Branding updated", color: LOG_BLURPLE },
  domain_updated: { emoji: "🌐", title: "Domain updated", color: LOG_BLURPLE },
};

/**
 * Post one activity-log entry to the guild's configured log channel. Drops
 * (marks read) when there's no guild, no configured log channel, or the channel
 * is permanently unreachable; retries on transient errors.
 */
async function deliverLog(client: Client, row: PendingRow): Promise<boolean> {
  if (!row.guildId) return true;
  const payload = row.payload as Partial<LogNotification>;
  if (!payload?.action) return true;

  const guild = await prisma.guild.findUnique({
    where: { id: row.guildId },
    select: { botConfig: true },
  });
  const botCfg = parseBotConfig(guild?.botConfig);
  const channelId = botCfg.logChannelId;
  if (!channelId) return true; // no log channel configured → nothing to do
  const s = guildStrings(botCfg.locale);

  const meta = LOG_PRESENTATION[payload.action] ?? {
    emoji: "•",
    title: payload.action,
    color: LOG_BLURPLE,
  };

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased() || !channel.isSendable()) {
      console.warn(`[bot] log channel ${channelId} not usable — dropping ${row.id}.`);
      return true;
    }

    const fields: { name: string; value: string; inline?: boolean }[] = [];
    if (payload.formTitle)
      fields.push({ name: s.logField.form, value: payload.formTitle, inline: true });
    if (payload.applicantName)
      fields.push({ name: s.logField.applicant, value: payload.applicantName, inline: true });
    if (payload.actorName)
      fields.push({ name: s.logField.by, value: payload.actorName, inline: true });
    if (payload.action === "status_changed" && payload.toStatus) {
      const to = payload.toStatusLabel ?? payload.toStatus;
      fields.push({
        name: s.logField.status,
        value: payload.fromStatus ? `${payload.fromStatus} → ${to}` : to,
        inline: true,
      });
    }
    if (payload.detail)
      fields.push({ name: s.logField.details, value: payload.detail.slice(0, 1024) });

    const embed = new EmbedBuilder()
      .setColor(meta.color)
      .setTitle(`${meta.emoji} ${s.log[payload.action!] ?? meta.title}`)
      .setFooter({ text: "MSK Forms" })
      .setTimestamp();
    if (fields.length) embed.addFields(fields);

    const components: ActionRowBuilder<ButtonBuilder>[] = [];
    if (payload.submissionId) {
      const url = dashboardSubmissionUrl(config.apiBaseUrl, row.guildId, payload.submissionId);
      components.push(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(s.btnOpenDashboard).setURL(url),
        ),
      );
    }

    await postBranded(channel, row.guildId, { embeds: [embed], components });
    return true;
  } catch (err) {
    if (err instanceof DiscordAPIError && CHANNEL_GONE.includes(Number(err.code))) {
      console.warn(`[bot] log channel ${channelId} gone (${err.code}) — dropping ${row.id}.`);
      return true;
    }
    console.error(`[bot] failed to post log entry to ${channelId}:`, err);
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
  if (row.type === "log") return deliverLog(client, row);

  const discordId = row.user?.discordId;
  if (!discordId) return true;

  // DM in the applicant's own locale; fall back to the guild's configured bot
  // language when the applicant has none (rare — OAuth users always have one).
  let dmLocale = row.user?.locale || undefined;
  if (!dmLocale) {
    const p = row.payload as { submissionId?: string };
    if (p.submissionId) {
      const sub = await prisma.submission.findUnique({
        where: { id: p.submissionId },
        select: { guild: { select: { botConfig: true } } },
      });
      dmLocale = parseBotConfig(sub?.guild.botConfig).locale || undefined;
    }
  }

  const message = buildMessage(row, dmLocale);
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
      where: {
        readAt: null,
        type: { in: ["status_change", "message", "submission_review", "log"] },
      },
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
