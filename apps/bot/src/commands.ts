import { ChannelType, REST, Routes, SlashCommandBuilder } from "discord.js";

import { config } from "./config.js";

/**
 * The `/forms` command (concept §11):
 *  - `list`  — list this guild's live forms (anyone)
 *  - `post`  — post a form to a channel as an embed with a link (managers only;
 *              enforced in the handler via the Manage Server permission)
 *  - `setup` — link to the dashboard
 */
export const commands = [
  new SlashCommandBuilder()
    .setName("forms")
    .setDescription("MSK Forms — manage and share forms")
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List this guild's live forms"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("post")
        .setDescription("Post a form to a channel")
        .addStringOption((opt) =>
          opt
            .setName("form")
            .setDescription("Which form to post")
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Target channel (defaults to here)")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("setup").setDescription("Open the dashboard to configure forms"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("language")
        .setDescription("Set the bot's language for this server (managers only)")
        .addStringOption((opt) =>
          opt
            .setName("locale")
            .setDescription("Language")
            .setRequired(true)
            .addChoices(
              { name: "English", value: "en" },
              { name: "Deutsch", value: "de" },
              { name: "Magyar", value: "hu" },
              { name: "Français", value: "fr" },
              { name: "Español", value: "es" },
              { name: "Português", value: "pt" },
              { name: "Polski", value: "pl" },
            ),
        ),
    )
    .toJSON(),
];

/** Register the global slash commands with Discord. */
export async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.info(`[bot] Registered ${commands.length} slash command(s).`);
}
