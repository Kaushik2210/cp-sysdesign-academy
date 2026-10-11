import { describe, expect, it } from "vitest";
import { judge, normalize } from "../src/lib/runner/judge";
import type { RunResult } from "../src/lib/runner/types";
import { dueCards, newCard, review } from "../src/lib/srs/sm2";
import { binarySearchSteps, bubbleSortSteps, slidingWindowSteps, twoPointersSteps } from "../src/visualizers/algorithms";

const ok = (stdout: string): RunResult => ({ status: "ok", stdout, stderr: "", timeMs: 1 });

describe("judge", () => {
  const tests = [
    { input: "1", output: "1\n" },
    { input: "2", output: "2\n" },
  ];
  it("normalizes trailing whitespace", () => {
    expect(normalize("a  \r\nb\n\n")).toBe("a\nb");
  });
  it("returns AC when all pass", async () => {
    const r = await judge(async (_l, _c, stdin) => ok(stdin + "\n"), "python", "", tests);
    expect(r.verdict).toBe("AC");
    expect(r.passed).toBe(2);
  });
  it("stops at first WA", async () => {
    const r = await judge(async () => ok("9\n"), "python", "", tests);
    expect(r).toMatchObject({ verdict: "WA", passed: 0, firstFail: 0 });
    expect(r.outcomes).toHaveLength(1);
  });
  it("maps timeout to TLE and error to RE", async () => {
    const tle = await judge(async () => ({ ...ok(""), status: "timeout" }), "python", "", tests);
    const re = await judge(async () => ({ ...ok(""), status: "error" }), "python", "", tests);
    expect(tle.verdict).toBe("TLE");
    expect(re.verdict).toBe("RE");
  });
});

describe("sm2", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  it("schedules 1, 6, then ease-scaled intervals", () => {
    let c = newCard({ id: "x", prompt: "p", answer: "a" }, day0);
    c = review(c, 4, day0);
    expect(c.interval).toBe(1);
    c = review(c, 4, day0);
    expect(c.interval).toBe(6);
    c = review(c, 5, day0);
    expect(c.interval).toBe(15); // round(6 * ease 2.5)
  });
  it("lapses reset repetitions and never drop ease below 1.3", () => {
    let c = newCard({ id: "x", prompt: "p", answer: "a" }, day0);
    for (let i = 0; i < 20; i++) c = review(c, 0, day0);
    expect(c.reps).toBe(0);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });
  it("lists due cards", () => {
    const c = review(newCard({ id: "x", prompt: "p", answer: "a" }, day0), 4, day0);
    expect(dueCards([c], day0)).toHaveLength(0);
    expect(dueCards([c], new Date("2026-01-03T00:00:00Z"))).toHaveLength(1);
  });
});

describe("visualizer generators", () => {
  it("binary search finds the target and ends on the found step", () => {
    const steps = binarySearchSteps("1 3 5 7 9 11\n7");
    const last = steps[steps.length - 1];
    expect(last.state.found).toBe(3);
  });
  it("binary search reports absence", () => {
    const last = binarySearchSteps("1 3 5\n4").at(-1)!;
    expect(last.state.found).toBe(-1);
  });
  it("binary search takes at most floor(log2 n)+1 probes", () => {
    const nums = Array.from({ length: 24 }, (_, i) => i * 2).join(" ");
    const probes = binarySearchSteps(`${nums}\n37`).filter((s) => s.line === 2).length;
    expect(probes).toBeLessThanOrEqual(Math.floor(Math.log2(24)) + 1);
  });
  it("bubble sort sorts", () => {
    expect(bubbleSortSteps("5 1 4 2 8 3").at(-1)!.state.arr).toEqual([1, 2, 3, 4, 5, 8]);
  });
  it("rejects bad input", () => {
    expect(() => binarySearchSteps("a b\n1")).toThrow();
  });
});

describe("two pointers and sliding window", () => {
  it("finds the pair", () => {
    const last = twoPointersSteps("1 2 4 7 11 15 19\n18").at(-1)!;
    expect(last.state.found).toEqual([3, 4]);
  });
  it("reports no pair", () => {
    expect(twoPointersSteps("1 2 3\n100").at(-1)!.state.found).toBeNull();
  });
  it("sliding window matches brute force", () => {
    const a = [2, 1, 5, 1, 3, 2, 9, 1];
    const k = 3;
    let best = -Infinity;
    for (let i = 0; i + k <= a.length; i++) best = Math.max(best, a.slice(i, i + k).reduce((x, y) => x + y, 0));
    expect(slidingWindowSteps(`${a.join(" ")}\n${k}`).at(-1)!.state.best).toBe(best);
  });
  it("rejects bad k", () => {
    expect(() => slidingWindowSteps("1 2 3\n5")).toThrow();
  });
});