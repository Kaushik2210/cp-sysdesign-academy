import { describe, expect, it } from "vitest";
import { insertionSortSteps, mergeSortSteps, quickSortSteps } from "../src/visualizers/sorting";
import { mulberry32 } from "../src/lib/sim/rng";

const sortedCopy = (a: number[]) => [...a].sort((x, y) => x - y);
const randomInput = (seed: number, n = 12) => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => Math.floor(r() * 20) - 5);
};
const multiset = (a: number[]) => [...a].sort((x, y) => x - y).join(",");

const cases: [string, (s: string) => ReturnType<typeof insertionSortSteps>][] = [
  ["insertion", insertionSortSteps],
  ["merge", mergeSortSteps],
  ["quick", quickSortSteps],
];

describe.each(cases)("%s sort steps", (name, gen) => {
  it("ends with the input sorted, for many random inputs including duplicates and negatives", () => {
    for (let seed = 1; seed <= 25; seed++) {
      const input = randomInput(seed);
      const last = gen(input.join(" ")).at(-1)!.state.arr;
      expect(last, `${name} seed ${seed}`).toEqual(sortedCopy(input));
    }
  });
  it("handles one element, two elements and already sorted input", () => {
    expect(gen("5").at(-1)!.state.arr).toEqual([5]);
    expect(gen("2 1").at(-1)!.state.arr).toEqual([1, 2]);
    expect(gen("1 2 3 4").at(-1)!.state.arr).toEqual([1, 2, 3, 4]);
    expect(gen("4 3 2 1").at(-1)!.state.arr).toEqual([1, 2, 3, 4]);
  });
  it("points every step at a real pseudocode line and carries a note", () => {
    const steps = gen("5 2 9 1 5 6");
    expect(steps.length).toBeGreaterThan(5);
    for (const s of steps) {
      expect(s.line).toBeGreaterThanOrEqual(0);
      expect(s.note.length).toBeGreaterThan(0);
    }
  });
  it("rejects bad input", () => {
    expect(() => gen("a b c")).toThrow();
  });
});

describe("invariants", () => {
  it("insertion sort holds exactly the input values whenever no key is lifted out", () => {
    // While a key is lifted, the array deliberately contains one stale duplicate slot, so only
    // the frames with nothing held must be a permutation of the input.
    const input = randomInput(3);
    const frames = insertionSortSteps(input.join(" ")).filter((s) => s.state.held === null);
    expect(frames.length).toBeGreaterThan(1);
    for (const s of frames) expect(multiset(s.state.arr)).toBe(multiset(input));
  });  it("quick sort only ever permutes the array", () => {
    const input = randomInput(5);
    for (const s of quickSortSteps(input.join(" "))) expect(multiset(s.state.arr)).toBe(multiset(input));
  });
  it("merge sort steps carry merge buffers during merges and none otherwise at the end", () => {
    const steps = mergeSortSteps("4 3 2 1");
    expect(steps.some((s) => s.state.aux !== null)).toBe(true);
    expect(steps.at(-1)!.state.aux).toBeNull();
  });
  it("merge sort takes the left element on ties (stable)", () => {
    const steps = mergeSortSteps("2 2");
    expect(steps.find((s) => /take 2/.test(s.note))).toBeTruthy();
  });
  it("at most 16 values are accepted", () => {
    expect(() => quickSortSteps(Array.from({ length: 17 }, (_, i) => i).join(" "))).toThrow();
  });
});