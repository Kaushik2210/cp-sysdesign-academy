import { describe, expect, it } from "vitest";
import { DEFAULT_KNAPSACK, knapsackSteps, parseKnapsack } from "../src/visualizers/knapsack";

const last = <T>(a: T[]) => a[a.length - 1];

/** Brute force over all subsets. */
function brute(input: string): number {
  const { items, capacity } = parseKnapsack(input);
  let best = 0;
  for (let mask = 0; mask < 1 << items.length; mask++) {
    let w = 0;
    let v = 0;
    items.forEach((it, i) => mask & (1 << i) && ((w += it.weight), (v += it.value)));
    if (w <= capacity) best = Math.max(best, v);
  }
  return best;
}

function randomCase(seed: number): string {
  let x = seed;
  const rnd = (m: number) => ((x = (x * 1664525 + 1013904223) >>> 0) % m);
  const cap = 1 + rnd(12);
  const items = Array.from({ length: 1 + rnd(6) }, () => `${1 + rnd(9)} ${rnd(30)}`);
  return [String(cap), ...items].join("\n");
}

describe("parseKnapsack", () => {
  it("parses capacity and items", () => {
    expect(parseKnapsack("5\n2 3\n4 7")).toEqual({ capacity: 5, items: [{ weight: 2, value: 3 }, { weight: 4, value: 7 }] });
  });
  it("gives friendly errors", () => {
    expect(() => parseKnapsack("")).toThrow(/Line 1/);
    expect(() => parseKnapsack("5")).toThrow(/Line 1/);
    expect(() => parseKnapsack("0\n1 1")).toThrow(/between 1 and 12/);
    expect(() => parseKnapsack("13\n1 1")).toThrow(/between 1 and 12/);
    expect(() => parseKnapsack("5\n1")).toThrow(/weight value/);
    expect(() => parseKnapsack("5\n0 4")).toThrow(/at least 1/);
    expect(() => parseKnapsack("5\n-1 4")).toThrow(/weight value/);
    expect(() => parseKnapsack("5\n" + Array(7).fill("1 1").join("\n"))).toThrow(/at most 6/);
  });
});

describe("knapsackSteps", () => {
  it("dp[n][W] equals brute force on 150 random instances", () => {
    for (let seed = 1; seed <= 150; seed++) {
      const input = randomCase(seed);
      const f = last(knapsackSteps(input)).state;
      expect(f.table[f.items.length][f.capacity], input).toBe(brute(input));
    }
  });
  it("the traceback picks items that fit and add up to the optimum", () => {
    for (let seed = 1; seed <= 150; seed++) {
      const input = randomCase(seed);
      const f = last(knapsackSteps(input)).state;
      const weight = f.chosen.reduce((s, i) => s + f.items[i - 1].weight, 0);
      const value = f.chosen.reduce((s, i) => s + f.items[i - 1].value, 0);
      expect(weight, input).toBeLessThanOrEqual(f.capacity);
      expect(value, input).toBe(f.table[f.items.length][f.capacity]);
    }
  });
  it("hand-checked default: best value 90 by taking items 2 and 4", () => {
    // capacity 10, items (5,10) (4,40) (6,30) (3,50): take weights 4+3=7 for 90 (adding 5 -> 12 > 10; adding 6 -> 13 > 10)
    const f = last(knapsackSteps(DEFAULT_KNAPSACK)).state;
    expect(f.table[4][10]).toBe(90);
    expect([...f.chosen].sort()).toEqual([2, 4]);
  });
  it("rows are non-decreasing in capacity and in item count", () => {
    const t = last(knapsackSteps(DEFAULT_KNAPSACK)).state.table as number[][];
    for (let i = 0; i < t.length; i++) for (let w = 1; w < t[i].length; w++) expect(t[i][w]).toBeGreaterThanOrEqual(t[i][w - 1]);
    for (let i = 1; i < t.length; i++) for (let w = 0; w < t[i].length; w++) expect(t[i][w]).toBeGreaterThanOrEqual(t[i - 1][w]);
  });
  it("each filled cell was computed from the two cells it highlights", () => {
    const { items } = parseKnapsack(DEFAULT_KNAPSACK);
    for (const s of knapsackSteps(DEFAULT_KNAPSACK)) {
      if (s.line !== 5 || !s.state.current) continue;
      const [i, w] = s.state.current;
      const skip = s.state.table[s.state.skip![0]][s.state.skip![1]]!;
      const take = s.state.take ? s.state.table[s.state.take[0]][s.state.take[1]]! + items[i - 1].value : -Infinity;
      expect(s.state.table[i][w]).toBe(Math.max(skip, take));
    }
  });
  it("an item heavier than the capacity is never taken", () => {
    const f = last(knapsackSteps("3\n9 99\n2 5")).state;
    expect(f.chosen).toEqual([2]);
    expect(f.table[2][3]).toBe(5);
  });
  it("all-zero values choose nothing", () => {
    const steps = knapsackSteps("5\n2 0\n3 0");
    expect(last(steps).state.chosen).toEqual([]);
    expect(last(steps).note).toMatch(/take nothing/);
  });
});
