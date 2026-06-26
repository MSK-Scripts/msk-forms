import { changeSubmissionStatus, prisma } from "@msk-forms/db";
import { DEFAULT_STATUSES, parseBotConfig, type StatusChangeNotification } from "@msk-forms/shared";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
} from "discord.js";

import { config } from "./config.js";
import { guildStrings, type GuildStrings } from "./guild-i18n.js";
import { grantAcceptedRole } from "./roles.js";
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

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      status: true,
      userId: true,
      guildId: true,
      form: { select: { title: true } },
      guild: { select: { discordGuildId: true, botConfig: true } },
    },
  });
  const s = guildStrings(submission ? parseBotConfig(submission.guild.botConfig).locale : undefined);

  if (!submission || submission.guild.discordGuildId !== interaction.guildId) {
    await interaction.reply({ content: s.submissionNotFound, flags: MessageFlags.Ephemeral });
    return;
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: s.reviewNeedManage, flags: MessageFlags.Ephemeral });
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
    actorName: interaction.user.username,
    toStatusLabel: statusLabel(toStatus),
    notify:
      submission.userId && notify
        ? { userId: submission.userId, type: "status_change", payload: notify }
        : null,
  });

  if (changed && action === "accept") {
    // Grant the accepted role via the shared path (per-form role → guild default).
    await grantAcceptedRole(interaction.client, submissionId);
  }

  await updateMessage(interaction, submission.guildId, submissionId, toStatus, s);
}

/** Edit the review message: show the decision and disable the action buttons. */
async function updateMessage(
  interaction: ButtonInteraction,
  guildId: string,
  submissionId: string,
  toStatus: string,
  s: GuildStrings,
): Promise<void> {
  const accepted = toStatus === "accepted";
  const base = interaction.message.embeds[0];
  const embed = (base ? EmbedBuilder.from(base) : new EmbedBuilder())
    .setColor(accepted ? 0x00e676 : 0xff5252)
    .addFields({ name: s.decision, value: accepted ? s.decisionAccepted : s.decisionRejected });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("sub:decided")
      .setStyle(accepted ? ButtonStyle.Success : ButtonStyle.Danger)
      .setLabel(accepted ? s.btnAccepted : s.btnRejected)
      .setDisabled(true),
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel(s.btnOpenDashboard)
      .setURL(dashboardSubmissionUrl(config.apiBaseUrl, guildId, submissionId)),
  );

  await interaction.update({ embeds: [embed], components: [row] });
}
