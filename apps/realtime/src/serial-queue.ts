/**
 * Runs async tasks strictly one after another.
 *
 * A single `pg.Client` must not get a new `query()` while one is still running:
 * pg 8 queues it internally and logs a DeprecationWarning, pg 9 removes that
 * queue. The LISTEN client in this service looks up the guild for every
 * notification, and notifications can arrive faster than a lookup finishes, so
 * those lookups go through this queue.
 */
export function createSerialQueue(): <T>(task: () => Promise<T>) => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve();

  return <T>(task: () => Promise<T>): Promise<T> => {
    const result = tail.then(task);
    // The chain only waits for completion; a failure stays with its caller.
    tail = result.catch(() => undefined);
    return result;
  };
}
