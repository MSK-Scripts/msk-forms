/**
 * The part of an ioredis client that `whenReady` needs. Kept structural so the
 * helper stays free of `server-only` and can be unit-tested with a fake.
 */
export interface ReadyAwareClient {
  status: string;
  once(event: "ready", listener: () => void): unknown;
  off(event: "ready", listener: () => void): unknown;
}

// States of the *initial* connection attempt. "reconnecting" is deliberately
// missing: during an outage the caller should fail fast instead of waiting.
const CONNECTING = new Set(["wait", "connecting", "connect"]);

/**
 * Resolves once the client is ready, or after `timeoutMs` at the latest.
 *
 * With `enableOfflineQueue: false`, ioredis rejects every command until the
 * connection is ready ("Stream isn't writeable"). The client is created lazily
 * on the first rate-limited request, so without this wait that first request
 * after every process start skipped the limiter. Never rejects: if the
 * connection does not come up in time, the command itself fails and the caller
 * falls open as before.
 */
export function whenReady(client: ReadyAwareClient, timeoutMs: number): Promise<void> {
  if (!CONNECTING.has(client.status)) return Promise.resolve();

  return new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      client.off("ready", done);
      resolve();
    };
    const timer = setTimeout(done, timeoutMs);
    client.once("ready", done);
  });
}
