import { describe, expect, it } from "vitest";

import { formScheduleStatus, isFormOpenNow } from "./schedule.js";

const now = new Date("2026-06-22T12:00:00Z");
const h = (n: number) => new Date(now.getTime() + n * 3_600_000);

describe("formScheduleStatus", () => {
  it("is open with no schedule", () => {
    expect(formScheduleStatus(null, null, now).state).toBe("open");
  });

  it("is scheduled before openAt", () => {
    const s = formScheduleStatus(h(5), null, now);
    expect(s.state).toBe("scheduled");
    expect(s.msUntilOpen).toBe(5 * 3_600_000);
  });

  it("is open after openAt", () => {
    expect(formScheduleStatus(h(-1), null, now).state).toBe("open");
  });

  it("is closed at/after closeAt", () => {
    expect(formScheduleStatus(null, h(-1), now).state).toBe("closed");
    expect(formScheduleStatus(null, now, now).state).toBe("closed");
  });

  it("flags endingSoon within 24h", () => {
    expect(formScheduleStatus(null, h(5), now).endingSoon).toBe(true);
    expect(formScheduleStatus(null, h(30), now).endingSoon).toBe(false);
  });

  it("does not flag endingSoon when not open", () => {
    expect(formScheduleStatus(h(1), h(1.5), now).endingSoon).toBe(false);
  });

  it("isFormOpenNow honours the window", () => {
    expect(isFormOpenNow(h(-1), h(1), now)).toBe(true);
    expect(isFormOpenNow(h(1), h(2), now)).toBe(false);
    expect(isFormOpenNow(h(-2), h(-1), now)).toBe(false);
  });
});
