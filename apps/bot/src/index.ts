import { ActivityType, Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";

import { registerCommands } from "./commands.js";
import { assertConfig, config } from "./config.js";
import { handleFormsAutocomplete, handleFormsCommand } from "./forms.js";
import { syncAllGuilds, syncGuild } from "./guilds.js";
import { deliverPendingNotifications } from "./notifications.js";
import { handleReviewButton, isReviewButton } from "./review-actions.js";
import { deliverPendingWebhooks } from "./webhooks.js";

/**
 * MSK Forms Discord bot — multi-tenant (concept §11).
 * Links Discord guilds to MSK Forms on invite, serves the `/forms` command
 * (6a), and delivers status/message DMs from the outbox (6b).
 */

/** How often to drain the notification outbox. */
const POLL_MS = 15_000;

export function createClient(): Client {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, async (c) => {
    console.info(`[bot] Logged in as ${c.user.tag} — ${c.guilds.cache.size} guild(s).`);
    // Member-list subtitle (custom status). Global to the bot; configurable via BOT_ACTIVITY.
    if (config.activity) {
      c.user.setPresence({
        status: "online",
        activities: [{ name: "MSK Forms", type: ActivityType.Custom, state: config.activity }],
      });
    }
    await syncAllGuilds(c);
    // Drain the outboxes now, then poll on an interval. Webhook delivery is pure
    // HTTP (no Discord client needed) but shares the same Prisma-capable process.
    void deliverPendingNotifications(c);
    void deliverPendingWebhooks();
    setInterval(() => void deliverPendingNotifications(c), POLL_MS);
    setInterval(() => void deliverPendingWebhooks(), POLL_MS);
  });

  // The bot was added to a server → link it (owner becomes MSK Forms owner).
  client.on(Events.GuildCreate, (guild) => {
    syncGuild(guild)
      .then(() => console.info(`[bot] Linked guild ${guild.name} (${guild.id}).`))
      .catch((err) => console.error(`[bot] Failed to link guild ${guild.id}:`, err));
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isAutocomplete()) {
        await handleFormsAutocomplete(interaction);
        return;
      }
      if (interaction.isButton() && isReviewButton(interaction.customId)) {
        await handleReviewButton(interaction);
        return;
      }
      if (interaction.isChatInputCommand() && interaction.commandName === "forms") {
        await handleFormsCommand(interaction);
      }
    } catch (err) {
      console.error("[bot] Interaction handler error:", err);
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction
          .reply({
            content: "Something went wrong. Please try again.",
            flags: MessageFlags.Ephemeral,
          })
          .catch(() => undefined);
      }
    }
  });

  return client;
}

async function main(): Promise<void> {
  assertConfig();
  await registerCommands();
  const client = createClient();
  await client.login(config.token);
}

// Only start when run directly (not on test import).
if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error("[bot] Fatal error:", err);
    process.exit(1);
  });
}
