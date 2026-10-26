import { describe, expect, it } from "vitest";
import { LB_POLICIES, compareAll, makeWorkload, simulateLb, type LbConfig } from "../src/lib/sim/loadbalancer";

const base: LbConfig = { speeds: [1, 1, 1, 1, 1], requests: 8000, utilization: 0.8, heavyTail: true, clients: 200, seed: 7 };
const by = (cfg: LbConfig) => Object.fromEntries(compareAll(cfg).map((r) => [r.policy, r]));

describe("workload", () => {
  it("is deterministic and shared across policies", () => {
    expect(makeWorkload(base)).toEqual(makeWorkload(base));
    expect(makeWorkload(base)).not.toEqual(makeWorkload({ ...base, seed: 8 }));
  });
  it("has increasing arrival times and the requested heavy-tail mix", () => {
    const w = makeWorkload(base);
    expect([...w.arrivals].sort((a, b) => a - b)).toEqual(w.arrivals);
    const heavy = w.costs.filter((c) => c === 20).length / w.costs.length;
    expect(heavy).toBeGreaterThan(0.07);
    expect(heavy).toBeLessThan(0.13);
  });
});

describe("policies", () => {
  it("round robin sends the same number of requests to every server (within one)", () => {
    const rr = by(base).rr;
    expect(Math.max(...rr.counts) - Math.min(...rr.counts)).toBeLessThanOrEqual(1);
  });

  it("least connections and power of two choices beat round robin and random on tail latency with heavy-tailed work (every seed)", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const r = by({ ...base, seed });
      expect(r.lc.p99, `lc vs rr p99, seed ${seed}`).toBeLessThan(r.rr.p99);
      expect(r.lc.mean, `lc vs rr mean, seed ${seed}`).toBeLessThan(r.rr.mean);
      expect(r.p2c.p99, `p2c vs random p99, seed ${seed}`).toBeLessThan(r.random.p99);
      expect(r.p2c.mean, `p2c vs random mean, seed ${seed}`).toBeLessThan(r.random.mean);
    }
  });

  it("round robin spreads request COUNT evenly while the work can still be uneven", () => {
    const rr = by(base).rr;
    expect(rr.workImbalance).toBeGreaterThan(1); // same counts, different costs
  });

  it("weighted round robin respects server speeds", () => {
    const cfg = { ...base, speeds: [1, 3], heavyTail: false, utilization: 0.7 };
    const wrr = by(cfg).wrr;
    expect(wrr.counts[1] / wrr.counts[0]).toBeGreaterThan(2.9);
    expect(wrr.counts[1] / wrr.counts[0]).toBeLessThan(3.1);
    // Unweighted round robin overloads the slow server, so its tail latency is far worse.
    expect(wrr.p99).toBeLessThan(by(cfg).rr.p99);
  });

  it("IP hash always sends a client to the same server", () => {
    const w = makeWorkload({ ...base, requests: 3000 });
    const r = simulateLb("iphash", { ...base, requests: 3000 }, w);
    expect(r.counts.reduce((a, b) => a + b, 0)).toBe(3000);
    // With few clients the load is lumpy compared with round robin.
    const few = by({ ...base, clients: 8 }).iphash;
    expect(few.workImbalance).toBeGreaterThan(by({ ...base, clients: 8 }).lc.workImbalance);
  });

  it("with a single server every policy behaves identically", () => {
    const cfg = { ...base, speeds: [1], requests: 1000, utilization: 0.5 };
    const all = compareAll(cfg);
    for (const r of all) {
      expect(r.mean).toBeCloseTo(all[0].mean, 9);
      expect(r.counts).toEqual([1000]);
    }
  });

  it("latency is never below the service time and counts add up", () => {
    const cfg = { ...base, heavyTail: false, utilization: 0.3, requests: 2000 };
    for (const r of compareAll(cfg)) {
      expect(r.mean).toBeGreaterThanOrEqual(1);
      expect(r.counts.reduce((a, b) => a + b, 0)).toBe(2000);
    }
    expect(LB_POLICIES).toHaveLength(6);
  });
});