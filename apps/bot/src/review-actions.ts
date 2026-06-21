import { changeSubmissionStatus, prisma } from "@msk-forms/db";
import {
  DEFAULT_STATUSES,
  parseBotConfig,
  parseFormSettings,
  type StatusChangeNotification,
} from "@msk-forms/shared";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
} from "discord.js";

import { config } from "./config.js";
import { dashboardSubmissionUrl } from "./urls.js";

const ACTION_STATUS = { accept: "accepted", reject: "rejected" } as const;
type Action = keyof typeof ACTION_STATUS;

const statusLabel = (key: string) =>
  DEFAULT_STATUSES.find((s) => s.key === key)?.label ?? key;

/** True if this button belongs to the review workflow. */
export function isReviewButton(customId: string): boolean {
  return customId.startsWith("sub:");
}

/**
 * Handle an Accept/Reject button on a review embed: change the submission's
 * status, DM the applicant (via the outbox), grant the accepted role, and
 * update the message. Mirrors the web events route's status-change logic.
 */
export async function handleReviewButton(interaction: ButtonInteraction): Promise<void> {
  const [, rawAction, submissionId] = interaction.customId.split(":");
  if ((rawAction !== "accept" && rawAction !== "reject") || !submissionId) return;
  const action = rawAction as Action;

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({
      content: "You need the **Manage Server** permission to review submissions.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      status: true,
      userId: true,
      guildId: true,
      form: { select: { title: true, settings: true } },
      guild: { select: { discordGuildId: true, botConfig: true } },
    },
  });
  if (!submission || submission.guild.discordGuildId !== interaction.guildId) {
    await interaction.reply({ content: "Submission not found.", flags: MessageFlags.Ephemeral });
    return;
  }

  const toStatus = ACTION_STATUS[action];

  // Idempotent, race-safe transition shared with the web review route.
  const notify: StatusChangeNotification | null = submission.userId
    ? {
        submissionId,
        formTitle: submission.form.title,
        toStatus,
        toStatusLabel: statusLabel(toStatus),
      }
    : null;
  const { changed } = await changeSubmissionStatus({
    submissionId,
    toStatus,
    notify:
      submission.userId && notify
        ? { userId: submission.userId, type: "status_change", payload: notify }
        : null,
  });

  if (changed && action === "accept" && submission.userId) {
    // Per-form accepted role overrides the guild-wide default.
    const roleId =
      parseFormSettings(submission.form.settings).acceptedRoleId ??
      parseBotConfig(submission.guild.botConfig).acceptedRoleId;
    if (roleId) await grantRole(interaction, submission.userId, roleId);
  }

  await updateMessage(interaction, submission.guildId, submissionId, toStatus);
}

/** Grant the accepted role to the applicant. Best-effort — never throws. */
async function grantRole(
  interaction: ButtonInteraction,
  applicantUserId: string,
  roleId: string,
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: applicantUserId },
      select: { discordId: true },
    });
    if (!user?.discordId || !interaction.guild) return;
    const member = await interaction.guild.members.fetch(user.discordId);
    await member.roles.add(roleId);
  } catch (err) {
    const code = err instanceof DiscordAPIError ? ` (${err.code})` : "";
    console.error(`[bot] could not grant role ${roleId}${code}:`, (err as Error).message);
  }
}

/** Edit the review message: show the decision and disable the action buttons. */
async function updateMessage(
  interaction: ButtonInteraction,
  guildId: string,
  submissionId: string,
  toStatus: string,
): Promise<void> {
  const accepted = toStatus === "accepted";
  const base = interaction.message.embeds[0];
  const embed = (base ? EmbedBuilder.from(base) : new EmbedBuilder())
    .setColor(accepted ? 0x00e676 : 0xff5252)
    .addFields({ name: "Decision", value: accepted ? "✅ Accepted" : "❌ Rejected" });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("sub:decided")
      .setStyle(accepted ? ButtonStyle.Success : ButtonStyle.Danger)
      .setLabel(accepted ? "Accepted" : "Rejected")
      .setDisabled(true),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Open in dashboard")
      .setURL(dashboardSubmissionUrl(config.apiBaseUrl, guildId, submissionId)),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}
