/**
 * Who did it, in the shape the activity log expects. The Discord ID travels
 * with the name so a log entry stays attributable after a rename.
 */
export function actor(user: { username: string; discordId: string } | null | undefined): {
  actorName?: string;
  actorId?: string;
} {
  if (!user) return {};
  return { actorName: user.username, actorId: user.discordId };
}
