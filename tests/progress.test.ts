import { describe, expect, it } from "vitest";
import { computeAchievements, currentStreak, longestStreak, weakestTopics } from "../src/lib/achievements";

const empty = { completed: {}, problems: {}, quizzes: {}, cards: {}, activity: {} };

describe("streaks", () => {
  const today = new Date("2026-03-10T12:00:00Z");
  it("counts consecutive days ending today", () => {
    const a = { "2026-03-10": 1, "2026-03-09": 2, "2026-03-08": 1, "2026-03-05": 4 };
    expect(currentStreak(a, today)).toBe(3);
    expect(longestStreak(a)).toBe(3);
  });
  it("keeps the streak alive until the end of the next day", () => {
    expect(currentStreak({ "2026-03-09": 1, "2026-03-08": 1 }, today)).toBe(2);
    expect(currentStreak({ "2026-03-07": 1 }, today)).toBe(0);
  });
});

describe("achievements", () => {
  it("awards by thresholds", () => {
    const got = computeAchievements({
      ...empty,
      completed: { a: "x" },
      problems: { p: { attempts: 1, solved: true, last: "AC", tags: ["dp"] } },
    });
    const ids = got.filter((g) => g.earned).map((g) => g.id);
    expect(ids).toEqual(["first-lesson", "first-ac"]);
  });
});

describe("weakestTopics", () => {
  it("ranks by miss rate", () => {
    const w = weakestTopics({
      ...empty,
      problems: { p: { attempts: 3, solved: false, last: "WA", tags: ["graphs"] } },
      quizzes: { q: { correct: 3, total: 4, tags: ["math"] } },
    });
    expect(w[0].tag).toBe("graphs");
    expect(w.map((x) => x.tag)).toContain("math");
  });
});