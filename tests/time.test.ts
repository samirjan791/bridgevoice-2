import { describe, expect, it } from "vitest";
import {
  buildTimeContext,
  dayPeriodFromHour,
  greetingForHour,
  greetingForPeriod,
} from "@/lib/chat/time";

describe("dayPeriodFromHour covers all four periods", () => {
  it("morning is 05:00–11:59", () => {
    expect(dayPeriodFromHour(5)).toBe("morning");
    expect(dayPeriodFromHour(8)).toBe("morning");
    expect(dayPeriodFromHour(11)).toBe("morning");
  });
  it("afternoon is 12:00–17:59", () => {
    expect(dayPeriodFromHour(12)).toBe("afternoon");
    expect(dayPeriodFromHour(15)).toBe("afternoon");
    expect(dayPeriodFromHour(17)).toBe("afternoon");
  });
  it("evening is 18:00–21:59", () => {
    expect(dayPeriodFromHour(18)).toBe("evening");
    expect(dayPeriodFromHour(20)).toBe("evening");
    expect(dayPeriodFromHour(21)).toBe("evening");
  });
  it("night is 22:00–04:59", () => {
    expect(dayPeriodFromHour(22)).toBe("night");
    expect(dayPeriodFromHour(0)).toBe("night");
    expect(dayPeriodFromHour(2)).toBe("night");
    expect(dayPeriodFromHour(4)).toBe("night");
  });
});

describe("period greetings", () => {
  it("greets by period, never a good-night farewell at night", () => {
    expect(greetingForPeriod("morning")).toBe("Good morning");
    expect(greetingForPeriod("afternoon")).toBe("Good afternoon");
    expect(greetingForPeriod("evening")).toBe("Good evening");
    expect(greetingForPeriod("night")).toBe("Working late");
    expect(greetingForHour(23)).not.toMatch(/good night/i);
    expect(greetingForHour(9)).toBe("Good morning");
    expect(greetingForHour(14)).toBe("Good afternoon");
    expect(greetingForHour(19)).toBe("Good evening");
  });
});

describe("buildTimeContext", () => {
  it("formats a fixed client time with date, both clocks, and period", () => {
    // 2026-11-04 09:26 America/Chicago = 15:26 UTC.
    const ctx = buildTimeContext({
      epochMs: Date.UTC(2026, 10, 4, 15, 26),
      timeZone: "America/Chicago",
    });
    expect(ctx).toContain("Wednesday, November 4, 2026");
    expect(ctx).toContain("9:26 AM");
    expect(ctx).toContain("09:26");
    expect(ctx).toContain("morning");
  });
  it("returns null without client time, or with a wildly wrong clock", () => {
    expect(buildTimeContext(undefined)).toBeNull();
    expect(
      buildTimeContext({ epochMs: Date.now() + 30 * 24 * 3600 * 1000, timeZone: "UTC" }),
    ).toBeNull();
    expect(
      buildTimeContext({ epochMs: Date.now(), timeZone: "Not/AZone" }),
    ).toBeNull();
  });
});
