import { logGuildActivitySafe, Prisma, prisma } from "@msk-forms/db";
import { parseBotConfig } from "@msk-forms/shared";
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
import { fmt, guildStrings } from "./guild-i18n.js";
import { postBranded } from "./posting.js";
import { dashboardUrl, formUrl } from "./urls.js";

const MSK_GREEN = 0x00e676;

/** Native display names for the bot's supported locales. */
const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  hu: "Magyar",
  fr: "Français",
  es: "Español",
  pt: "Português",
  pl: "Polski",
};

/** Resolve the MSK Forms guild id + its configured bot locale, or null if not linked. */
async function resolveGuild(
  discordGuildId: string,
): Promise<{ id: string; locale: string } | null> {
  const guild = await prisma.guild.findUnique({
    where: { discordGuildId },
    select: { id: true, botConfig: true },
  });
  if (!guild) return null;
  return { id: guild.id, locale: parseBotConfig(guild.botConfig).locale ?? "en" };
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
  const guild = await resolveGuild(interaction.guildId);
  if (!guild) {
    await interaction.respond([]);
    return;
  }

  const query = interaction.options.getFocused().toLowerCase();
  const forms = await liveForms(guild.id);
  await interaction.respond(
    forms
      .filter((f) => f.title.toLowerCase().includes(query) || f.slug.includes(query))
      .slice(0, 25)
      .map((f) => ({ name: f.title.slice(0, 100), value: f.slug })),
  );
}

/** Handle the `/forms` chat command (list / post / setup / language). */
export async function handleFormsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const sub = interaction.options.getSubcommand();

  if (sub === "setup") {
    const guild = interaction.guildId ? await resolveGuild(interaction.guildId) : null;
    const s = guildStrings(guild?.locale);
    await interaction.reply({
      content: fmt(s.setup, { url: dashboardUrl(config.apiBaseUrl, guild?.id) }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!interaction.guildId || !interaction.guild) {
    await interaction.reply({
      content: guildStrings(undefined).serverOnly,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const guild = await resolveGuild(interaction.guildId);
  if (!guild) {
    await interaction.reply({
      content: guildStrings(undefined).notLinked,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const guildId = guild.id;
  const s = guildStrings(guild.locale);

  if (sub === "language") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: s.languageNeedManage, flags: MessageFlags.Ephemeral });
      return;
    }
    const choice = interaction.options.getString("locale", true);
    const current = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { botConfig: true },
    });
    const next = { ...parseBotConfig(current?.botConfig), locale: choice };
    await prisma.guild.update({
      where: { id: guildId },
      data: { botConfig: next as Prisma.InputJsonValue },
    });
    await logGuildActivitySafe(guildId, {
      action: "bot_config_updated",
      actorName: interaction.user.username,
      detail: `language → ${LOCALE_NAMES[choice] ?? choice}`,
    });
    // Confirm in the newly chosen language.
    await interaction.reply({
      content: fmt(guildStrings(choice).languageSet, { lang: LOCALE_NAMES[choice] ?? choice }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === "list") {
    const forms = await liveForms(guildId);
    if (forms.length === 0) {
      await interaction.reply({ content: s.noLiveForms, flags: MessageFlags.Ephemeral });
      return;
    }
    const lines = forms.map((f) => `• **${f.title}** — ${formUrl(config.apiBaseUrl, f.slug)}`);
    await interaction.reply({ content: lines.join("\n"), flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === "post") {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: s.postNeedManage, flags: MessageFlags.Ephemeral });
      return;
    }

    const slug = interaction.options.getString("form", true);
    const form = await prisma.form.findFirst({
      where: { slug, guildId, status: "live" },
      select: { slug: true, title: true, description: true },
    });
    if (!form) {
      await interaction.reply({ content: s.postFormUnavailable, flags: MessageFlags.Ephemeral });
      return;
    }

    const channelOption = interaction.options.getChannel("channel");
    const channelId = channelOption?.id ?? interaction.channelId;
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased() || !channel.isSendable()) {
      await interaction.reply({ content: s.postCantPost, flags: MessageFlags.Ephemeral });
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
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(s.btnOpenForm).setURL(url),
    );

    await postBranded(channel, guildId, { embeds: [embed], components: [row] });
    await logGuildActivitySafe(guildId, {
      action: "form_posted",
      actorName: interaction.user.username,
      formTitle: form.title,
      detail: `Posted in #${channel.name}`,
    });
    await interaction.reply({
      content: fmt(s.posted, { title: form.title, channel: `<#${channel.id}>` }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
}
