import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";

import { registerCommands } from "./commands.js";
import { config } from "./config.js";
import { handleFormsAutocomplete, handleFormsCommand } from "./forms.js";
import { syncAllGuilds, syncGuild } from "./guilds.js";

/**
 * MSK Forms Discord bot — multi-tenant (concept §11).
 * Slice 6a: links Discord guilds to MSK Forms on invite, and serves the
 * `/forms` command (list live forms, post a form to a channel, open setup).
 */

export function createClient(): Client {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, async (c) => {
    console.info(`[bot] Logged in as ${c.user.tag} — ${c.guilds.cache.size} guild(s).`);
    await syncAllGuilds(c);
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
