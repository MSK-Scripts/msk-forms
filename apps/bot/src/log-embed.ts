import type { LogAction, LogNotification } from "@msk-forms/shared";
import type { APIEmbed, APIEmbedField } from "discord.js";

import type { GuildStrings } from "./guild-i18n.js";

const GREEN = 0x00e676;
const RED = 0xff5252;
const BLURPLE = 0x5865f2;
const AMBER = 0xffb300;

/** Discord embed limits we stay under. */
const MAX_FIELD_VALUE = 1024;
const MAX_TITLE = 256;

/**
 * Emoji and colour per action. Typed as a full record so adding a log action
 * without deciding how it looks is a compile error, not a bullet point.
 */
const PRESENTATION: Record<LogAction, { emoji: string; color: number }> = {
  submission_created: { emoji: "📝", color: GREEN },
  status_changed: { emoji: "🔄", color: BLURPLE },
  message_sent: { emoji: "💬", color: BLURPLE },
  note_added: { emoji: "🗒️", color: BLURPLE },
  submission_archived: { emoji: "📦", color: BLURPLE },
  submission_restored: { emoji: "📤", color: BLURPLE },
  submission_withdrawn: { emoji: "↩️", color: RED },
  submission_deleted: { emoji: "🗑️", color: RED },
  submissions_exported: { emoji: "📥", color: AMBER },
  role_granted: { emoji: "✅", color: GREEN },
  form_created: { emoji: "✨", color: GREEN },
  form_updated: { emoji: "✏️", color: BLURPLE },
  form_deleted: { emoji: "🗑️", color: RED },
  form_posted: { emoji: "📤", color: BLURPLE },
  categories_updated: { emoji: "🗂️", color: BLURPLE },
  member_added: { emoji: "➕", color: GREEN },
  member_role_changed: { emoji: "👤", color: AMBER },
  member_access_changed: { emoji: "🔑", color: AMBER },
  member_removed: { emoji: "➖", color: RED },
  bot_config_updated: { emoji: "⚙️", color: BLURPLE },
  branding_updated: { emoji: "🎨", color: BLURPLE },
  statuses_updated: { emoji: "🏷️", color: BLURPLE },
  status_messages_updated: { emoji: "✉️", color: BLURPLE },
  domain_updated: { emoji: "🌐", color: AMBER },
  handle_updated: { emoji: "🔗", color: BLURPLE },
  login_config_updated: { emoji: "🔐", color: AMBER },
  captcha_updated: { emoji: "🛡️", color: AMBER },
  webhook_created: { emoji: "🪝", color: AMBER },
  webhook_updated: { emoji: "🪝", color: AMBER },
  webhook_deleted: { emoji: "🪝", color: RED },
  api_key_created: { emoji: "🗝️", color: AMBER },
  api_key_revoked: { emoji: "🗝️", color: RED },
  plan_changed: { emoji: "💳", color: BLURPLE },
  dpa_accepted: { emoji: "📄", color: GREEN },
};

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Discord snowflake, so a stored value can never smuggle markup into a mention. */
const SNOWFLAKE = /^\d{17,20}$/;

/**
 * "name (<@id>)" when both are known. The mention renders as a clickable user in
 * Discord and survives renames; embeds never ping, so it is safe to include.
 */
export function formatActor(name: string | undefined, id: string | undefined): string | null {
  const mention = id && SNOWFLAKE.test(id) ? `<@${id}>` : null;
  if (name && mention) return `${name} (${mention})`;
  return name ?? mention;
}

/**
 * Build the activity-log embed as plain Discord API JSON. The same object is
 * sent by the bot into the log channel and POSTed to audit-log webhooks, so both
 * sinks show identical entries. Returns null for a payload without a known
 * action.
 */
export function buildLogEmbed(
  payload: Partial<LogNotification>,
  s: GuildStrings,
  opts: { dashboardUrl?: string | null } = {},
): APIEmbed | null {
  const action = payload.action;
  if (!action || !(action in PRESENTATION)) return null;
  const meta = PRESENTATION[action];

  const fields: APIEmbedField[] = [];
  const actor = formatActor(payload.actorName, payload.actorId);
  if (actor)
    fields.push({ name: s.logField.by, value: clip(actor, MAX_FIELD_VALUE), inline: true });
  if (payload.formTitle)
    fields.push({
      name: s.logField.form,
      value: clip(payload.formTitle, MAX_FIELD_VALUE),
      inline: true,
    });
  if (payload.applicantName)
    fields.push({
      name: s.logField.applicant,
      value: clip(payload.applicantName, MAX_FIELD_VALUE),
      inline: true,
    });
  if (action === "status_changed" && payload.toStatus) {
    const to = payload.toStatusLabel ?? payload.toStatus;
    fields.push({
      name: s.logField.status,
      value: clip(payload.fromStatus ? `${payload.fromStatus} → ${to}` : to, MAX_FIELD_VALUE),
      inline: true,
    });
  }
  if (payload.detail)
    fields.push({ name: s.logField.details, value: clip(payload.detail, MAX_FIELD_VALUE) });

  const at =
    payload.at && !Number.isNaN(Date.parse(payload.at)) ? payload.at : new Date().toISOString();

  return {
    title: clip(`${meta.emoji} ${s.log[action]}`, MAX_TITLE),
    color: meta.color,
    ...(opts.dashboardUrl ? { url: opts.dashboardUrl } : {}),
    ...(fields.length ? { fields } : {}),
    timestamp: at,
    footer: { text: "MSK Forms" },
  };
}
