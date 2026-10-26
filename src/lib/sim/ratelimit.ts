import { mulberry32 } from "./rng";

export type Algorithm = "fixed" | "log" | "sliding" | "bucket";

export const ALGORITHM_LABEL: Record<Algorithm, string> = {
  fixed: "Fixed window counter",
  log: "Sliding window log (exact)",
  sliding: "Sliding window counter",
  bucket: "Token bucket",
};

export interface Limiter {
  /** Decide whether a request arriving at time `t` (ms, non-decreasing) is allowed. */
  allow(t: number): boolean;
}

/** Count requests per fixed interval; resets at each boundary. */
export function fixedWindow(limit: number, windowMs: number): Limiter {
  let win = -1;
  let count = 0;
  return {
    allow(t) {
      const w = Math.floor(t / windowMs);
      if (w !== win) {
        win = w;
        count = 0;
      }
      if (count < limit) {
        count++;
        return true;
      }
      return false;
    },
  };
}

/** Exact: remember every allowed timestamp and count those in the last windowMs. */
export function slidingLog(limit: number, windowMs: number): Limiter {
  const times: number[] = [];
  return {
    allow(t) {
      while (times.length && times[0] <= t - windowMs) times.shift();
      if (times.length < limit) {
        times.push(t);
        return true;
      }
      return false;
    },
  };
}

/** Approximation: weight the previous window's count by how much of it still overlaps the sliding window. */
export function slidingCounter(limit: number, windowMs: number): Limiter {
  let win = 0;
  let prev = 0;
  let curr = 0;
  return {
    allow(t) {
      const w = Math.floor(t / windowMs);
      if (w !== win) {
        prev = w === win + 1 ? curr : 0;
        curr = 0;
        win = w;
      }
      const elapsed = (t - w * windowMs) / windowMs;
      if (prev * (1 - elapsed) + curr < limit) {
        curr++;
        return true;
      }
      return false;
    },
  };
}

/** Tokens refill steadily up to `capacity`; each allowed request spends one. Rejections spend nothing. */
export function tokenBucket(capacity: number, refillPerSecond: number): Limiter {
  let tokens = capacity;
  let last = 0;
  return {
    allow(t) {
      tokens = Math.min(capacity, tokens + ((t - last) / 1000) * refillPerSecond);
      last = t;
      if (tokens >= 1) {
        tokens -= 1;
        return true;
      }
      return false;
    },
  };
}

/** Build a limiter for "limit requests per windowSeconds". The token bucket uses capacity = limit. */
export function makeLimiter(algo: Algorithm, limit: number, windowSeconds: number): Limiter {
  const windowMs = windowSeconds * 1000;
  switch (algo) {
    case "fixed":
      return fixedWindow(limit, windowMs);
    case "log":
      return slidingLog(limit, windowMs);
    case "sliding":
      return slidingCounter(limit, windowMs);
    case "bucket":
      return tokenBucket(limit, limit / windowSeconds);
  }
}

export type Pattern = "steady" | "poisson" | "burst" | "boundary" | "spike";

export const PATTERN_LABEL: Record<Pattern, string> = {
  steady: "Steady traffic just under the limit",
  poisson: "Random arrivals at the limit rate",
  burst: "One big burst, then quiet",
  boundary: "Bursts either side of a window boundary",
  spike: "Calm, then a sustained spike",
};

/** Request arrival times in ms over `durationMs`, deterministic for a given seed. */
export function generateTrace(pattern: Pattern, limit: number, windowSeconds: number, durationMs: number, seed = 1): number[] {
  const windowMs = windowSeconds * 1000;
  const out: number[] = [];
  const rand = mulberry32(seed);
  switch (pattern) {
    case "steady": {
      const gap = windowMs / Math.max(1, limit - 1); // slightly under the limit rate
      for (let t = 0; t < durationMs; t += gap) out.push(Math.round(t));
      break;
    }
    case "poisson": {
      const meanGap = windowMs / limit;
      let t = 0;
      while (t < durationMs) {
        t += -Math.log(1 - rand()) * meanGap;
        if (t < durationMs) out.push(Math.round(t));
      }
      break;
    }
    case "burst": {
      const at = Math.round(windowMs * 0.4);
      for (let i = 0; i < limit * 3; i++) out.push(at + i * 2);
      break;
    }
    case "boundary": {
      // `limit` requests just before each window boundary and `limit` just after it.
      for (let b = windowMs; b < durationMs; b += windowMs) {
        for (let i = 0; i < limit; i++) out.push(b - 1 - (limit - 1 - i) * 3);
        for (let i = 0; i < limit; i++) out.push(b + i * 3);
      }
      break;
    }
    case "spike": {
      const calmGap = (windowMs / Math.max(1, limit)) * 2;
      for (let t = 0; t < durationMs * 0.4; t += calmGap) out.push(Math.round(t));
      const spikeGap = windowMs / Math.max(1, limit) / 3;
      for (let t = durationMs * 0.4; t < durationMs; t += spikeGap) out.push(Math.round(t));
      break;
    }
  }
  return out.sort((a, b) => a - b);
}

export interface SimEvent {
  t: number;
  allowed: boolean;
}

export interface SimResult {
  events: SimEvent[];
  allowed: number;
  rejected: number;
  /** The most allowed requests inside any interval of one window length: the real rate the backend saw. */
  maxInWindow: number;
}

/** Largest number of timestamps inside any half-open interval of `windowMs`. Two-pointer sweep. */
export function maxInWindow(times: number[], windowMs: number): number {
  let best = 0;
  let lo = 0;
  for (let hi = 0; hi < times.length; hi++) {
    while (times[hi] - times[lo] >= windowMs) lo++;
    best = Math.max(best, hi - lo + 1);
  }
  return best;
}

export function simulate(limiter: Limiter, trace: number[], windowMs: number): SimResult {
  const events = trace.map((t) => ({ t, allowed: limiter.allow(t) }));
  const allowedTimes = events.filter((e) => e.allowed).map((e) => e.t);
  return { events, allowed: allowedTimes.length, rejected: events.length - allowedTimes.length, maxInWindow: maxInWindow(allowedTimes, windowMs) };
}

export const ALGORITHMS: Algorithm[] = ["fixed", "log", "sliding", "bucket"];