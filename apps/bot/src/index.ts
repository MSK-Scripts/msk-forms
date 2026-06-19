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
 * MSK Forms Discord-Bot — Multi-Tenant (Konzept.md §11).
 * Phase 0: Grundgerüst, Slash-Command-Registrierung, Ready-Handler.
 */

const commands = [
  new SlashCommandBuilder()
    .setName("forms")
    .setDescription("MSK Forms — Formulare verwalten")
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Aktive Formulare dieser Guild anzeigen"),
    )
    .addSubcommand((sub) =>
      sub.setName("setup").setDescription("Setup-Wizard im Dashboard öffnen"),
    )
    .toJSON(),
];

export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.info(`[bot] ${commands.length} Slash-Command(s) registriert.`);
}

export function createClient(): Client {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, (c) => {
    console.info(`[bot] Eingeloggt als ${c.user.tag} — ${c.guilds.cache.size} Guild(s).`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "forms") return;

    const sub = interaction.options.getSubcommand();
    if (sub === "setup") {
      await interaction.reply({
        content: `🔧 Setup im Dashboard: ${config.apiBaseUrl}/dashboard`,
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({ content: "📋 Noch keine Formulare (Phase 0).", ephemeral: true });
  });

  return client;
}

async function main(): Promise<void> {
  await registerCommands();
  const client = createClient();
  await client.login(config.token);
}

// Nur starten, wenn direkt ausgeführt (nicht bei Test-Import).
if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error("[bot] Fataler Fehler:", err);
    process.exit(1);
  });
}
