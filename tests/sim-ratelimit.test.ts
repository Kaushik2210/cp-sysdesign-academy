import { describe, expect, it } from "vitest";
import { mulberry32 } from "../src/lib/sim/rng";
import { ALGORITHMS, generateTrace, makeLimiter, maxInWindow, simulate, tokenBucket } from "../src/lib/sim/ratelimit";

const run = (algo: Parameters<typeof makeLimiter>[0], trace: number[], limit = 10, windowS = 1) =>
  simulate(makeLimiter(algo, limit, windowS), trace, windowS * 1000);

describe("maxInWindow", () => {
  it("finds the densest interval and uses half-open windows", () => {
    expect(maxInWindow([0, 100, 200, 1000], 1000)).toBe(3);
    expect(maxInWindow([0, 1000, 2000], 1000)).toBe(1);
    expect(maxInWindow([], 1000)).toBe(0);
  });
});

describe("fixed window", () => {
  it("allows 2x the limit across a window boundary (the classic flaw)", () => {
    const trace = generateTrace("boundary", 10, 1, 2500);
    const r = run("fixed", trace);
    expect(r.maxInWindow).toBe(20);
  });
  it("rejects the excess inside one window", () => {
    const r = run("fixed", Array.from({ length: 15 }, (_, i) => i * 10));
    expect(r.allowed).toBe(10);
    expect(r.rejected).toBe(5);
  });
});

describe("sliding window log (exact)", () => {
  it("never exceeds the limit in any window, even at boundaries", () => {
    expect(run("log", generateTrace("boundary", 10, 1, 4500)).maxInWindow).toBeLessThanOrEqual(10);
  });
  it("holds the limit on random traffic for many seeds", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const trace = generateTrace("poisson", 10, 1, 6000, seed);
      expect(run("log", trace).maxInWindow).toBeLessThanOrEqual(10);
    }
  });
});

describe("sliding window counter (approximate)", () => {
  it("is far stricter than fixed window at the boundary but may exceed the limit slightly", () => {
    const trace = generateTrace("boundary", 10, 1, 2500);
    const sliding = run("sliding", trace).maxInWindow;
    expect(sliding).toBeLessThan(run("fixed", trace).maxInWindow);
    expect(sliding).toBeLessThanOrEqual(15);
  });
});

describe("token bucket", () => {
  it("allows a burst up to capacity, then the refill rate", () => {
    const b = tokenBucket(5, 1);
    const burst = Array.from({ length: 10 }, () => b.allow(0));
    expect(burst.filter(Boolean)).toHaveLength(5);
    expect(b.allow(500)).toBe(false); // only half a token so far
    expect(b.allow(1000)).toBe(true); // one full token refilled
    expect(b.allow(1000)).toBe(false);
  });
  it("never lets total allowed exceed capacity plus refill over the run", () => {
    const trace = generateTrace("poisson", 10, 1, 8000, 3);
    const r = simulate(tokenBucket(10, 10), trace, 1000);
    expect(r.allowed).toBeLessThanOrEqual(10 + 10 * 8);
  });
  it("rejections do not consume tokens", () => {
    const b = tokenBucket(1, 1);
    expect(b.allow(0)).toBe(true);
    for (let t = 1; t < 900; t += 100) expect(b.allow(t)).toBe(false);
    expect(b.allow(1000)).toBe(true);
  });
});

describe("traffic patterns", () => {
  it("are deterministic per seed and sorted", () => {
    const a = generateTrace("poisson", 10, 1, 5000, 9);
    expect(a).toEqual(generateTrace("poisson", 10, 1, 5000, 9));
    expect(a).not.toEqual(generateTrace("poisson", 10, 1, 5000, 10));
    expect([...a].sort((x, y) => x - y)).toEqual(a);
  });
  it("steady traffic just under the limit is fully allowed by every algorithm", () => {
    const trace = generateTrace("steady", 10, 1, 4000);
    for (const algo of ALGORITHMS) expect(run(algo, trace).rejected).toBe(0);
  });
  it("a single large burst is cut to about the limit by every algorithm", () => {
    const trace = generateTrace("burst", 10, 1, 3000);
    for (const algo of ALGORITHMS) expect(run(algo, trace).allowed).toBeLessThanOrEqual(11);
  });
  it("the rng used for traces is the shared deterministic one", () => {
    expect(mulberry32(5)()).toBe(mulberry32(5)());
  });
});