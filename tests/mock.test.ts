import { describe, expect, it } from "vitest";
import { PHASES, currentPhase, dimensionStats, formatClock, overallPercent, type MockAttempt } from "../src/lib/mock";

const attempt = (scores: Record<string, number>, kind: MockAttempt["kind"] = "system-design"): MockAttempt => ({
  id: Math.random().toString(36).slice(2),
  questionId: "q",
  kind,
  date: "2026-10-26T10:00:00Z",
  secondsUsed: 2000,
  scores,
  coverage: 0.5,
  notes: "",
});

describe("phases", () => {
  it("ends every kind's timeline at exactly 1 with increasing boundaries", () => {
    for (const phases of Object.values(PHASES)) {
      expect(phases.at(-1)!.until).toBe(1);
      for (let i = 1; i < phases.length; i++) expect(phases[i].until).toBeGreaterThan(phases[i - 1].until);
    }
  });
  it("follows the 45-minute framework boundaries for system design", () => {
    const total = 45 * 60;
    expect((currentPhase("system-design", 0, total) as { id: string }).id).toBe("clarify");
    expect((currentPhase("system-design", 5 * 60 + 1, total) as { id: string }).id).toBe("estimate");
    expect((currentPhase("system-design", 20 * 60, total) as { id: string }).id).toBe("high-level");
    expect((currentPhase("system-design", 44 * 60, total) as { id: string }).id).toBe("summary");
    expect(currentPhase("system-design", total, total)).toBe("overtime");
  });
});

describe("formatClock", () => {
  it("formats minutes and seconds and clamps negatives", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(125)).toBe("02:05");
    expect(formatClock(-5)).toBe("00:00");
    expect(formatClock(45 * 60)).toBe("45:00");
  });
});

describe("history analysis", () => {
  it("averages per dimension, weakest first, per kind only", () => {
    const stats = dimensionStats(
      [attempt({ a: 4, b: 2 }), attempt({ a: 2, b: 2 }), attempt({ a: 1 }, "behavioral")],
      "system-design",
    );
    expect(stats).toEqual([
      { id: "b", average: 2, count: 2 },
      { id: "a", average: 3, count: 2 },
    ]);
  });
  it("computes overall percent of the maximum", () => {
    expect(overallPercent({ a: 4, b: 4 })).toBe(100);
    expect(overallPercent({ a: 2, b: 2 })).toBe(50);
    expect(overallPercent({})).toBe(0);
  });
});