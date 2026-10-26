import { describe, expect, it } from "vitest";
import { POLICIES, createCache, generateAccessTrace, runOptimal, runTrace, stepTrace } from "../src/lib/sim/cache";

const seq = (s: string) => s.split(" ");

describe("eviction behaviour on hand-checked sequences", () => {
  it("LRU evicts the least recently used", () => {
    const steps = stepTrace("lru", 2, seq("A B A C"));
    expect(steps.map((s) => s.hit)).toEqual([false, false, true, false]);
    expect(steps[3].evicted).toBe("B"); // A was just used
    expect(steps[3].state).toEqual(["C", "A"]);
  });
  it("FIFO evicts the oldest insertion even if it was just used", () => {
    const steps = stepTrace("fifo", 2, seq("A B A C"));
    expect(steps[3].evicted).toBe("A");
    expect(steps[3].state).toEqual(["C", "B"]);
  });
  it("LFU evicts the least frequently used and breaks ties by recency", () => {
    const steps = stepTrace("lfu", 2, seq("A A B C"));
    expect(steps[3].evicted).toBe("B"); // A has frequency 2
    const tie = stepTrace("lfu", 2, seq("A B C"));
    expect(tie[2].evicted).toBe("A"); // equal frequency: A is least recently used
  });
  it("capacity one evicts on every different key", () => {
    const steps = stepTrace("lru", 1, seq("A B A"));
    expect(steps.map((s) => s.hit)).toEqual([false, false, false]);
  });
  it("rejects a zero capacity", () => {
    expect(() => createCache("lru", 0)).toThrow();
  });
});

describe("hit-ratio properties", () => {
  const trace = generateAccessTrace("zipf", 6000, 500, 50, 4);

  it("hits plus misses equal the trace length", () => {
    for (const p of POLICIES) {
      const r = runTrace(p, 50, trace);
      expect(r.hits + r.misses).toBe(trace.length);
      expect(r.hitRatio).toBeGreaterThanOrEqual(0);
      expect(r.hitRatio).toBeLessThanOrEqual(1);
    }
  });
  it("a bigger LRU cache never has a lower hit ratio (stack property)", () => {
    const small = runTrace("lru", 20, trace).hitRatio;
    const medium = runTrace("lru", 60, trace).hitRatio;
    const large = runTrace("lru", 200, trace).hitRatio;
    expect(medium).toBeGreaterThanOrEqual(small);
    expect(large).toBeGreaterThanOrEqual(medium);
  });
  it("the offline optimal policy is at least as good as every real policy", () => {
    const opt = runOptimal(50, trace).hitRatio;
    for (const p of POLICIES) expect(opt).toBeGreaterThanOrEqual(runTrace(p, 50, trace).hitRatio);
  });
  it("on popularity-skewed traffic LFU and LRU both beat FIFO", () => {
    const fifo = runTrace("fifo", 50, trace).hitRatio;
    expect(runTrace("lru", 50, trace).hitRatio).toBeGreaterThan(fifo);
    expect(runTrace("lfu", 50, trace).hitRatio).toBeGreaterThan(fifo);
  });
  it("a loop slightly larger than the cache gives LRU and FIFO zero hits while optimal still hits", () => {
    const loop = generateAccessTrace("loop", 400, 1000, 10);
    expect(runTrace("lru", 10, loop).hits).toBe(0);
    expect(runTrace("fifo", 10, loop).hits).toBe(0);
    expect(runOptimal(10, loop).hitRatio).toBeGreaterThan(0.7);
  });
  it("optimal matches a hand-worked example", () => {
    // Capacity 2, trace A B C A B. At C the cache holds {A, B}; A is needed at index 3 and B at index 4,
    // so OPT evicts B (used farthest ahead) and keeps A, giving exactly one hit (the second A).
    expect(runOptimal(2, seq("A B C A B")).hits).toBe(1);
  });
});

describe("trace generation", () => {
  it("is deterministic for a seed and stays inside the universe", () => {
    const a = generateAccessTrace("uniform", 500, 20, 5, 2);
    expect(a).toEqual(generateAccessTrace("uniform", 500, 20, 5, 2));
    expect(new Set(a).size).toBeLessThanOrEqual(20);
  });
});