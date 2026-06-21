import { prisma } from "@msk-forms/db";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";

import { config } from "./config.js";
import { postBranded } from "./posting.js";
import { dashboardUrl, formUrl } from "./urls.js";

const MSK_GREEN = 0x00e676;

/** Find the MSK Forms guild id for a Discord guild, or null if not linked. */
async function resolveGuildId(discordGuildId: string): Promise<string | null> {
  const guild = await prisma.guild.findUnique({
    where: { discordGuildId },
    select: { id: true },
  });
  return guild?.id ?? null;
}

/** The guild's live forms, newest first (capped for Discord's 25-choice limit). */
async function liveForms(guildId: string, take = 25) {
  return prisma.form.findMany({
    where: { guildId, status: "live" },
    orderBy: { updatedAt: "desc" },
    take,
    select: { slug: true, title: true, description: true },
  });
}

/** Autocomplete for `/forms post form:` — live forms filtered by the input. */
export async function handleFormsAutocomplete(
  interaction: AutocompleteInteraction,
): Promise<void> {
  if (interaction.commandName !== "forms" || !interaction.guildId) {
    await interaction.respond([]);
    return;
  }
  const guildId = await resolveGuildId(interaction.guildId);
  if (!guildId) {
    await interaction.respond([]);
    return;
  }

  const query = interaction.options.getFocused().toLowerCase();
  const forms = await liveForms(guildId);
  await interaction.respond(
    forms
      .filter((f) => f.title.toLowerCase().includes(query) || f.slug.includes(query))
      .slice(0, 25)
      .map((f) => ({ name: f.title.slice(0, 100), value: f.slug })),
  );
}

/** Handle the `/forms` chat command (list / post / setup). */
export async function handleFormsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const sub = interaction.options.getSubcommand();

  if (sub === "setup") {
    const guildId = interaction.guildId ? await resolveGuildId(interaction.guildId) : null;
    await interaction.reply({
      content: `🔧 Configure your forms in the dashboard: ${dashboardUrl(config.apiBaseUrl, guildId ?? undefined)}`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!interaction.guildId || !interaction.guild) {
    await interaction.reply({
      content: "This command can only be used inside a server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const guildId = await resolveGuildId(interaction.guildId);
  if (!guildId) {
    await interaction.reply({
      content: "This server isn't linked yet. Re-invite the bot or visit the dashboard.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === "list") {
    const forms = await liveForms(guildId);
    if (forms.length === 0) {
      await interaction.reply({
        content: "No live forms yet. Create one in the dashboard and set it to *live*.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const lines = forms.map((f) => `• **${f.title}** — ${formUrl(config.apiBaseUrl, f.slug)}`);
    await interaction.reply({ content: lines.join("\n"), flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === "post") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: "You need the **Manage Server** permission to post forms.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const slug = interaction.options.getString("form", true);
    const form = await prisma.form.findFirst({
      where: { slug, guildId, status: "live" },
      select: { slug: true, title: true, description: true },
    });
    if (!form) {
      await interaction.reply({
        content: "That form isn't available (not found, not live, or not in this server).",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const channelOption = interaction.options.getChannel("channel");
    const channelId = channelOption?.id ?? interaction.channelId;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased() || !channel.isSendable()) {
      await interaction.reply({
        content: "I can't post in that channel. Pick a text channel I can send messages in.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const url = formUrl(config.apiBaseUrl, form.slug);
    const embed = new EmbedBuilder()
      .setColor(MSK_GREEN)
      .setTitle(form.title)
      .setURL(url)
      .setFooter({ text: "MSK Forms" });
    if (form.description) embed.setDescription(form.description);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Open form").setURL(url),
    );

    await postBranded(channel, guildId, { embeds: [embed], components: [row] });
    await interaction.reply({
      content: `✅ Posted **${form.title}** in <#${channel.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
}
