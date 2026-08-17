// When to stop trying to deliver an outbox row.
//
// Kept free of discord.js and Prisma so the policy itself is unit-testable:
// getting this wrong is not loud. A row that can never succeed and is never
// retired simply stays at the head of the queue, and since the poller takes a
// fixed batch ordered by age, enough of them starve every newer notification.

/**
 * Discord error codes that mean "this DM will never arrive", as opposed to
 * "not right now". Both are 403s and both look alike in a log:
 *
 *   50007  Cannot send messages to this user (DMs closed)
 *   50278  Cannot send messages to this user due to having no mutual guilds
 *
 * 50278 was missing here until 2026-08-18, so applicants who left the guild
 * left behind a row that was retried every 15 seconds indefinitely.
 */
export const TERMINAL_DM_CODES = [50007, 50278] as const;

export function isTerminalDmCode(code: unknown): boolean {
  return (TERMINAL_DM_CODES as readonly number[]).includes(Number(code));
}

/**
 * Give up after this many failed attempts. The backoff below spreads them over
 * roughly two hours, which outlasts a normal Discord incident without letting a
 * permanently broken row live forever.
 */
export const MAX_DELIVERY_ATTEMPTS = 8;

const BASE_DELAY_MS = 30_000;
const MAX_DELAY_MS = 30 * 60_000;

/** Exponential backoff, capped. `attempts` is the number of failures so far. */
export function retryDelayMs(attempts: number): number {
  const n = Math.min(Math.max(0, Math.trunc(attempts)), 20);
  return Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** n);
}

/** When a row that just failed for the `attempts`-th time may be tried again. */
export function nextAttemptAt(attempts: number, now: Date): Date {
  return new Date(now.getTime() + retryDelayMs(attempts));
}

/** True once a row has burned through its attempts and should be retired. */
export function isExhausted(attempts: number): boolean {
  return attempts >= MAX_DELIVERY_ATTEMPTS;
}
