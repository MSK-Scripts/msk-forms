// Turn an error into a single log line.
//
// This exists because of a measured incident, not on principle. Handing a
// DiscordAPIError to console.error prints the whole outgoing request body and a
// stack trace — roughly 1.8 KB per failure. While 50278 was missing from
// TERMINAL_DM_CODES (see delivery-policy.ts), five undeliverable rows produced
// 2.6 million such failures on a poller that runs every 15 seconds, and a 4.8 GB
// log file. Rotation caps that damage now, but the cheaper fix is not to write
// 1.8 KB for a failure that is going to repeat.
//
// What has to survive the trim is the error *code*. 50278 is what identified
// that bug; the message alone reads the same as the transient 50007 and would
// not have.
//
// Deliberately free of discord.js and Prisma imports, like delivery-policy.ts:
// both error shapes are read structurally, so this stays unit-testable and keeps
// working for whatever throws next.

const MAX_MESSAGE_LENGTH = 200;

/**
 * First non-empty line, capped. Some libraries put a multi-line dump in
 * `message` itself, so trimming the object is not enough on its own — and
 * Prisma's messages *start* with a newline, so taking literally the first line
 * yields an empty string and throws away the only readable part.
 */
function firstLine(text: string): string {
  const line =
    text
      .split("\n")
      .find((candidate) => candidate.trim() !== "")
      ?.trim() ?? "";
  return line.length > MAX_MESSAGE_LENGTH ? `${line.slice(0, MAX_MESSAGE_LENGTH)}…` : line;
}

/**
 * A compact, greppable description: `[50278] Cannot send messages to this user`.
 *
 * Use this wherever a failure can repeat. A one-off fatal error is worth its
 * full stack trace and should keep passing the error object itself.
 */
export function describeError(err: unknown): string {
  if (err === null || err === undefined) return String(err);
  if (typeof err !== "object") return firstLine(String(err));

  const e = err as { code?: unknown; status?: unknown; message?: unknown; name?: unknown };
  const tags: string[] = [];

  // Discord sends 50278, Prisma sends ECONNREFUSED or P2021. Either way this is
  // the part that identifies the failure.
  if (e.code !== undefined && e.code !== null && e.code !== "") tags.push(String(e.code));
  if (typeof e.status === "number") tags.push(`HTTP ${e.status}`);

  // `||` rather than a presence check: a message of "\n\n" is present but
  // yields nothing once collapsed, and should fall through to the name.
  const message =
    (typeof e.message === "string" ? firstLine(e.message) : "") ||
    (typeof e.name === "string" ? firstLine(e.name) : "") ||
    "unknown error";

  return tags.length > 0 ? `[${tags.join(" ")}] ${message}` : message;
}
