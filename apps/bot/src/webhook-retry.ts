/** Give up (mark failed) after this many attempts. */
export const MAX_ATTEMPTS = 6;

/** Exponential-ish backoff (minutes) keyed by the attempt just made. */
export function backoffMs(attempts: number): number {
  const minutes = [1, 5, 15, 60, 180, 360];
  return (minutes[Math.min(attempts, minutes.length - 1)] ?? 360) * 60_000;
}

/** The columns a failed attempt writes back to its `WebhookDelivery` row. */
export type FailedAttempt = {
  status: "pending" | "failed";
  attempts: number;
  lastError: string | null;
  nextAttemptAt: Date;
};

/**
 * State after one failed attempt: count it, back off, and give up once
 * MAX_ATTEMPTS is reached. Every failure goes through here, including an
 * exception thrown while building the body, so no row can be retried forever.
 */
export function failedAttempt(
  previousAttempts: number,
  error: string | null,
  now: number = Date.now(),
): FailedAttempt {
  const attempts = previousAttempts + 1;
  return {
    status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
    attempts,
    lastError: error === null ? null : error.slice(0, 500),
    nextAttemptAt: new Date(now + backoffMs(attempts)),
  };
}
