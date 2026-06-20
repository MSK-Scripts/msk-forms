import { prisma } from "@msk-forms/db";
import type { MessageNotification, StatusChangeNotification } from "@msk-forms/shared";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  EmbedBuilder,
  type Client,
} from "discord.js";

import { config } from "./config.js";
import { statusUrl } from "./urls.js";

const MSK_GREEN = 0x00e676;
const BATCH = 25;
/** Discord error code: "Cannot send messages to this user" (DMs closed / no mutual guild). */
const CANNOT_DM = 50007;

/** Guards against overlapping ticks if a batch outlives the poll interval. */
let running = false;

type PendingRow = {
  id: string;
  type: string;
  payload: unknown;
  user: { discordId: string } | null;
};

/** A status-change or message DM, ready to send. */
function buildMessage(row: PendingRow): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} | null {
  const payload = row.payload as Partial<StatusChangeNotification & MessageNotification>;
  if (!payload?.submissionId) return null;

  const url = statusUrl(config.apiBaseUrl, payload.submissionId);
  const embed = new EmbedBuilder()
    .setColor(MSK_GREEN)
    .setTitle(payload.formTitle ?? "Your submission")
    .setURL(url)
    .setFooter({ text: "MSK Forms" });

  if (row.type === "status_change") {
    embed.setDescription(`Your status is now **${payload.toStatusLabel ?? payload.toStatus}**.`);
  } else if (row.type === "message" && payload.message) {
    embed.setDescription(`New message from the team:\n\n> ${payload.message}`);
  } else {
    return null;
  }

  const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("View status").setURL(url),
  );
  return { embeds: [embed], components: [button] };
}

/**
 * Try to deliver one notification. Returns true when the row should be marked
 * read — on success, when there's no recipient, or on a permanent "can't DM"
 * error. Returns false for transient failures so the next tick retries.
 */
async function deliverOne(client: Client, row: PendingRow): Promise<boolean> {
  const discordId = row.user?.discordId;
  if (!discordId) return true;

  const message = buildMessage(row);
  if (!message) {
    console.warn(`[bot] notification ${row.id} has an unrecognised payload — dropping.`);
    return true;
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
      where: { readAt: null, type: { in: ["status_change", "message"] } },
      orderBy: { createdAt: "asc" },
      take: BATCH,
      select: {
        id: true,
        type: true,
        payload: true,
        user: { select: { discordId: true } },
      },
    })) as PendingRow[];

    for (const row of pending) {
      if (await deliverOne(client, row)) {
        await prisma.notification.update({
          where: { id: row.id },
          data: { readAt: new Date() },
        });
      }
    }
  } catch (err) {
    console.error("[bot] notification delivery error:", err);
  } finally {
    running = false;
  }
}
