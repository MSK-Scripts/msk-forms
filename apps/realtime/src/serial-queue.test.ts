import { describe, expect, it } from "vitest";

import { createSerialQueue } from "./serial-queue.js";

/** A task that records when it starts and ends, and finishes on demand. */
function deferredTask(log: string[], name: string) {
  let finish!: () => void;
  const task = () =>
    new Promise<string>((resolve) => {
      log.push(`start ${name}`);
      finish = () => {
        log.push(`end ${name}`);
        resolve(name);
      };
    });
  return { task, finish: () => finish() };
}

describe("createSerialQueue", () => {
  it("never starts a task while the previous one is still running", async () => {
    const log: string[] = [];
    const run = createSerialQueue();
    const a = deferredTask(log, "a");
    const b = deferredTask(log, "b");

    const first = run(a.task);
    const second = run(b.task);
    await Promise.resolve();
    await Promise.resolve();
    expect(log).toEqual(["start a"]);

    a.finish();
    await first;
    await new Promise((r) => setTimeout(r, 0));
    expect(log).toEqual(["start a", "end a", "start b"]);

    b.finish();
    await expect(second).resolves.toBe("b");
  });

  it("keeps going after a task fails and still reports the failure", async () => {
    const run = createSerialQueue();
    const failing = run(async () => {
      throw new Error("boom");
    });
    const next = run(async () => "ok");

    await expect(failing).rejects.toThrow("boom");
    await expect(next).resolves.toBe("ok");
  });
});
