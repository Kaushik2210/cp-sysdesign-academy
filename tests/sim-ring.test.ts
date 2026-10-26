import { describe, expect, it } from "vitest";
import { hash32, mulberry32, zipfSampler } from "../src/lib/sim/rng";
import { HashRing, assignKeys, loadStats, makeKeys, modLookup, movedFraction } from "../src/lib/sim/ring";

const ringOf = (n: number, vnodes: number) => {
  const r = new HashRing(vnodes);
  for (let i = 0; i < n; i++) r.addNode(`node-${i}`);
  return r;
};

describe("rng and hash", () => {
  it("is deterministic and well spread", () => {
    expect(hash32("a")).toBe(hash32("a"));
    expect(hash32("a")).not.toBe(hash32("b"));
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    const r = mulberry32(1);
    const xs = Array.from({ length: 2000 }, () => r());
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
    expect(xs.reduce((s, x) => s + x, 0) / xs.length).toBeGreaterThan(0.45);
  });
  it("zipf sampling favours small indexes", () => {
    const s = zipfSampler(100, 1.1, mulberry32(7));
    const draws = Array.from({ length: 5000 }, s);
    expect(draws.every((d) => d >= 0 && d < 100)).toBe(true);
    expect(draws.filter((d) => d < 10).length).toBeGreaterThan(draws.filter((d) => d >= 50).length);
  });
});

describe("HashRing", () => {
  const keys = makeKeys(10_000);

  it("returns null on an empty ring and is deterministic", () => {
    expect(new HashRing(10).lookup("x")).toBeNull();
    const r = ringOf(4, 50);
    expect(r.lookup("hello")).toBe(r.lookup("hello"));
  });

  it("adding a node only moves keys TO the new node, about 1/(N+1) of them", () => {
    const r = ringOf(4, 100);
    const before = assignKeys(keys, (k) => r.lookup(k));
    r.addNode("node-new");
    const after = assignKeys(keys, (k) => r.lookup(k));
    for (const [k, node] of before) {
      if (after.get(k) !== node) expect(after.get(k)).toBe("node-new");
    }
    const moved = movedFraction(before, after);
    expect(moved).toBeGreaterThan(0.12);
    expect(moved).toBeLessThan(0.28); // ideal is 1/5 = 0.20
  });

  it("removing a node only moves the keys that node owned", () => {
    const r = ringOf(5, 100);
    const before = assignKeys(keys, (k) => r.lookup(k));
    r.removeNode("node-2");
    const after = assignKeys(keys, (k) => r.lookup(k));
    for (const [k, node] of before) {
      if (node !== "node-2") expect(after.get(k)).toBe(node);
      else expect(after.get(k)).not.toBe("node-2");
    }
  });

  it("hash mod N reshuffles most keys when a node is added, the ring does not", () => {
    const names = (n: number) => Array.from({ length: n }, (_, i) => `node-${i}`);
    const modMoved = movedFraction(assignKeys(keys, modLookup(names(4))), assignKeys(keys, modLookup(names(5))));
    expect(modMoved).toBeGreaterThan(0.7); // theory: 1 - 1/5 = 0.8
    const r = ringOf(4, 100);
    const before = assignKeys(keys, (k) => r.lookup(k));
    r.addNode("node-4");
    expect(movedFraction(before, assignKeys(keys, (k) => r.lookup(k)))).toBeLessThan(0.3);
  });

  it("more virtual nodes spread load more evenly", () => {
    const stats = (v: number) => {
      const r = ringOf(8, v);
      return loadStats(assignKeys(keys, (k) => r.lookup(k)), r.nodes);
    };
    expect(stats(200).stdDevPercent).toBeLessThan(stats(1).stdDevPercent);
    expect(stats(200).maxOverMean).toBeLessThan(1.3);
  });

  it("loadStats counts every key exactly once", () => {
    const r = ringOf(3, 20);
    const s = loadStats(assignKeys(keys, (k) => r.lookup(k)), r.nodes);
    expect(Object.values(s.counts).reduce((a, b) => a + b, 0)).toBe(keys.length);
  });
});