import { acceptedRoleIdsOf, parseIdList, type BotConfig } from "@msk-forms/shared";

/** The bot settings form's fields, all as typed text. */
export interface BotConfigValues {
  channel: string;
  logChannel: string;
  /** A bot locale, or "" for not set. */
  locale: string;
  role: string;
  postName: string;
}

export const botConfigValuesOf = (config: BotConfig): BotConfigValues => ({
  channel: config.reviewChannelId ?? "",
  logChannel: config.logChannelId ?? "",
  locale: config.locale ?? "",
  role: acceptedRoleIdsOf(config).join(", "),
  postName: config.postName ?? "",
});

/**
 * The PATCH body for `/api/guilds/[guildId]/bot-config`. The route replaces
 * the whole config, so an empty field is left out and ends up unset. That
 * matters for the locale: unset, applicant DMs go out in each applicant's own
 * Discord language, so "not set" must not be saved as English.
 */
export function botConfigBody(values: BotConfigValues): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (values.channel.trim()) body.reviewChannelId = values.channel.trim();
  if (values.logChannel.trim()) body.logChannelId = values.logChannel.trim();
  if (values.locale) body.locale = values.locale;
  const roleIds = parseIdList(values.role);
  if (roleIds.length > 0) body.acceptedRoleIds = roleIds;
  if (values.postName.trim()) body.postName = values.postName.trim();
  return body;
}
