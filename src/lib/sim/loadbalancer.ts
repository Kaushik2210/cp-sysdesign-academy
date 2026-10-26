import { hash32, mulberry32 } from "./rng";

export type LbPolicy = "rr" | "random" | "lc" | "p2c" | "wrr" | "iphash";

export const LB_LABEL: Record<LbPolicy, string> = {
  rr: "Round robin",
  random: "Random",
  lc: "Least connections",
  p2c: "Power of two choices",
  wrr: "Weighted round robin",
  iphash: "IP hash (sticky)",
};

export const LB_POLICIES: LbPolicy[] = ["rr", "random", "lc", "p2c", "wrr", "iphash"];

export interface LbConfig {
  /** Relative speed of each server: a server with speed 2 finishes work twice as fast. */
  speeds: number[];
  requests: number;
  /** Fraction of total capacity the traffic uses on average (0..1). */
  utilization: number;
  /** If true, 10% of requests cost 20 units and the rest 1 (like uploads among small reads). */
  heavyTail: boolean;
  /** Number of distinct clients, used by IP hash. */
  clients: number;
  seed: number;
}

export interface Workload {
  arrivals: number[];
  costs: number[];
  clientIds: number[];
}

/** Generate one workload so every policy is judged on exactly the same requests. */
export function makeWorkload(cfg: LbConfig): Workload {
  const rand = mulberry32(cfg.seed);
  const meanCost = cfg.heavyTail ? 0.9 * 1 + 0.1 * 20 : 1;
  const capacity = cfg.speeds.reduce((a, b) => a + b, 0);
  const rate = (cfg.utilization * capacity) / meanCost; // requests per time unit
  const arrivals: number[] = [];
  const costs: number[] = [];
  const clientIds: number[] = [];
  let t = 0;
  for (let i = 0; i < cfg.requests; i++) {
    t += -Math.log(1 - rand()) / rate;
    arrivals.push(t);
    costs.push(cfg.heavyTail && rand() < 0.1 ? 20 : 1);
    clientIds.push(Math.floor(rand() * cfg.clients));
  }
  return { arrivals, costs, clientIds };
}

export interface LbResult {
  policy: LbPolicy;
  mean: number;
  p50: number;
  p99: number;
  /** Requests sent to each server. */
  counts: number[];
  /** Total work (sum of costs) each server received. */
  work: number[];
  /** Busiest server's work divided by the average: 1 is perfectly even. */
  workImbalance: number;
}

const percentile = (sorted: number[], p: number) => (sorted.length ? sorted[Math.floor(p * (sorted.length - 1))] : 0);

export function simulateLb(policy: LbPolicy, cfg: LbConfig, w: Workload): LbResult {
  const n = cfg.speeds.length;
  const rand = mulberry32(cfg.seed + 101);
  const busyUntil = new Array<number>(n).fill(0);
  const inflight: number[][] = Array.from({ length: n }, () => []); // finish times still in the future
  const counts = new Array<number>(n).fill(0);
  const work = new Array<number>(n).fill(0);
  const latencies: number[] = [];
  let rr = 0;
  const swrr = new Array<number>(n).fill(0); // smooth weighted round robin state
  const weightSum = cfg.speeds.reduce((a, b) => a + b, 0);

  const active = (s: number, t: number) => {
    const list = inflight[s];
    while (list.length && list[0] <= t) list.shift();
    return list.length;
  };

  const pick = (t: number, client: number): number => {
    switch (policy) {
      case "rr":
        return rr++ % n;
      case "random":
        return Math.floor(rand() * n);
      case "lc": {
        let best = 0;
        for (let s = 1; s < n; s++) {
          const a = active(s, t);
          const b = active(best, t);
          if (a < b || (a === b && counts[s] < counts[best])) best = s;
        }
        return best;
      }
      case "p2c": {
        const a = Math.floor(rand() * n);
        let b = Math.floor(rand() * (n - 1));
        if (b >= a) b++;
        if (n === 1) return 0;
        return active(a, t) <= active(b, t) ? a : b;
      }
      case "wrr": {
        // Smooth weighted round robin (as used by nginx): spreads picks of heavy servers evenly.
        let best = 0;
        for (let s = 0; s < n; s++) {
          swrr[s] += cfg.speeds[s];
          if (swrr[s] > swrr[best]) best = s;
        }
        swrr[best] -= weightSum;
        return best;
      }
      case "iphash":
        return hash32(`client-${client}`) % n;
    }
  };

  for (let i = 0; i < w.arrivals.length; i++) {
    const t = w.arrivals[i];
    const s = pick(t, w.clientIds[i]);
    const start = Math.max(t, busyUntil[s]);
    const finish = start + w.costs[i] / cfg.speeds[s];
    busyUntil[s] = finish;
    inflight[s].push(finish);
    counts[s]++;
    work[s] += w.costs[i];
    latencies.push(finish - t);
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const meanWork = work.reduce((a, b) => a + b, 0) / n;
  return {
    policy,
    mean: latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1),
    p50: percentile(sorted, 0.5),
    p99: percentile(sorted, 0.99),
    counts,
    work,
    workImbalance: meanWork ? Math.max(...work) / meanWork : 0,
  };
}

export function compareAll(cfg: LbConfig): LbResult[] {
  const w = makeWorkload(cfg);
  return LB_POLICIES.map((p) => simulateLb(p, cfg, w));
}