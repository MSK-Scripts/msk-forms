import {
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "./config.js";

/**
 * MSK Forms Discord bot — multi-tenant (concept §11).
 * Phase 0: scaffolding, slash command registration, ready handler.
 */

const commands = [
  new SlashCommandBuilder()
    .setName("forms")
    .setDescription("MSK Forms — manage forms")
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List active forms of this guild"),
    )
    .addSubcommand((sub) =>
      sub.setName("setup").setDescription("Open the setup wizard in the dashboard"),
    )
    .toJSON(),
];

export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.info(`[bot] Registered ${commands.length} slash command(s).`);
}

export function createClient(): Client {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, (c) => {
    console.info(`[bot] Logged in as ${c.user.tag} — ${c.guilds.cache.size} guild(s).`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "forms") return;

    const sub = interaction.options.getSubcommand();
    if (sub === "setup") {
      await interaction.reply({
        content: `🔧 Setup in the dashboard: ${config.apiBaseUrl}/dashboard`,
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({ content: "📋 No forms yet (Phase 0).", ephemeral: true });
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
