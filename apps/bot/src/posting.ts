import { prisma } from "@msk-forms/db";
import { parseBotConfig } from "@msk-forms/shared";
import type { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SendableChannels } from "discord.js";

import { config } from "./config.js";

const WEBHOOK_NAME = "MSK Forms";

interface BrandedPayload {
  embeds: EmbedBuilder[];
  components?: ActionRowBuilder<ButtonBuilder>[];
}

/**
 * Post a message to a channel using the guild's per-guild appearance, if set:
 * when `botConfig.postName` is configured, send through a bot-owned webhook with
 * that display name and the guild's branding logo as the avatar. Components
 * still work because the webhook is owned by this application. Falls back to a
 * normal bot message when no appearance is set, on threads, or if the bot lacks
 * Manage-Webhooks permission.
 *
 * `guildId` is the MSK Forms guild UUID (not the Discord guild id).
 */
export async function postBranded(
  channel: SendableChannels,
  guildId: string,
  payload: BrandedPayload,
): Promise<void> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { botConfig: true, branding: true },
  });
  const postName = parseBotConfig(guild?.botConfig).postName;

  // No per-guild appearance configured → post as the bot.
  if (!postName) {
    await channel.send(payload);
    return;
  }

  const logoKey = (guild?.branding as { logoKey?: string } | null)?.logoKey;
  const avatarURL = logoKey ? `${config.apiBaseUrl}/api/guilds/${guildId}/logo` : undefined;

  try {
    // Webhooks only exist on standard text channels, not threads.
    if (!("fetchWebhooks" in channel) || !("createWebhook" in channel)) {
      throw new Error("channel has no webhook support");
    }
    const selfId = channel.client.user?.id;
    const hooks = await channel.fetchWebhooks();
    const existing = hooks.find((w) => w.owner?.id === selfId && w.name === WEBHOOK_NAME);
    const hook = existing ?? (await channel.createWebhook({ name: WEBHOOK_NAME }));

    await hook.send({
      username: postName.slice(0, 80),
      avatarURL,
      embeds: payload.embeds,
      components: payload.components,
    });
  } catch (err) {
    console.warn("[bot] branded webhook post failed, posting as bot:", (err as Error).message);
    await channel.send(payload);
  }
}
