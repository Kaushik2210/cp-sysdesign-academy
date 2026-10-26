import { mulberry32, zipfSampler } from "./rng";

export type Policy = "lru" | "lfu" | "fifo";

export const POLICY_LABEL: Record<Policy | "opt", string> = {
  lru: "LRU (least recently used)",
  lfu: "LFU (least frequently used)",
  fifo: "FIFO (first in, first out)",
  opt: "Optimal (offline, cannot be built)",
};

export interface Access {
  key: string;
  hit: boolean;
  /** Key removed to make room, if any. */
  evicted?: string;
  /** Cache contents after the access, ordered by how likely each is to be evicted last (safest first). */
  state: string[];
}

export interface Cache {
  access(key: string): { hit: boolean; evicted?: string };
  /** Keys ordered safest-to-evict first (most recently / frequently / newly inserted first). */
  snapshot(): string[];
}

export function createCache(policy: Policy, capacity: number): Cache {
  if (capacity < 1) throw new Error("capacity must be at least 1");
  if (policy === "lfu") return lfu(capacity);
  return ordered(policy, capacity);
}

/** LRU and FIFO share an insertion-ordered Map; LRU additionally moves a key to the end on every hit. */
function ordered(policy: "lru" | "fifo", capacity: number): Cache {
  const map = new Map<string, true>();
  return {
    access(key) {
      if (map.has(key)) {
        if (policy === "lru") {
          map.delete(key);
          map.set(key, true);
        }
        return { hit: true };
      }
      let evicted: string | undefined;
      if (map.size >= capacity) {
        evicted = map.keys().next().value as string; // oldest entry
        map.delete(evicted);
      }
      map.set(key, true);
      return { hit: false, evicted };
    },
    snapshot: () => [...map.keys()].reverse(),
  };
}

/** Evict the key with the lowest use count; break ties by evicting the least recently used. */
function lfu(capacity: number): Cache {
  const entries = new Map<string, { freq: number; last: number }>();
  let clock = 0;
  return {
    access(key) {
      clock++;
      const e = entries.get(key);
      if (e) {
        e.freq++;
        e.last = clock;
        return { hit: true };
      }
      let evicted: string | undefined;
      if (entries.size >= capacity) {
        let worst: string | undefined;
        for (const [k, v] of entries) {
          const w = worst ? entries.get(worst)! : undefined;
          if (!w || v.freq < w.freq || (v.freq === w.freq && v.last < w.last)) worst = k;
        }
        evicted = worst;
        entries.delete(worst!);
      }
      entries.set(key, { freq: 1, last: clock });
      return { hit: false, evicted };
    },
    snapshot: () =>
      [...entries.entries()]
        .sort((a, b) => b[1].freq - a[1].freq || b[1].last - a[1].last)
        .map(([k]) => k),
  };
}

/** Step through a trace, recording each access and the resulting cache contents. */
export function stepTrace(policy: Policy, capacity: number, trace: string[]): Access[] {
  const cache = createCache(policy, capacity);
  return trace.map((key) => {
    const r = cache.access(key);
    return { key, hit: r.hit, evicted: r.evicted, state: cache.snapshot() };
  });
}

export interface RunStats {
  hits: number;
  misses: number;
  hitRatio: number;
}

export function runTrace(policy: Policy, capacity: number, trace: string[]): RunStats {
  const cache = createCache(policy, capacity);
  let hits = 0;
  for (const k of trace) if (cache.access(k).hit) hits++;
  return { hits, misses: trace.length - hits, hitRatio: trace.length ? hits / trace.length : 0 };
}

/** Belady's optimal policy: on a miss with a full cache, evict the key whose next use is farthest away. */
export function runOptimal(capacity: number, trace: string[]): RunStats {
  const n = trace.length;
  const nextUse: number[] = new Array(n);
  const seen = new Map<string, number>();
  for (let i = n - 1; i >= 0; i--) {
    nextUse[i] = seen.get(trace[i]) ?? Infinity;
    seen.set(trace[i], i);
  }
  const inCache = new Map<string, number>(); // key -> index of its next use
  let hits = 0;
  for (let i = 0; i < n; i++) {
    const k = trace[i];
    if (inCache.has(k)) {
      hits++;
      inCache.set(k, nextUse[i]);
      continue;
    }
    if (inCache.size >= capacity) {
      let victim = "";
      let far = -1;
      for (const [key, nu] of inCache) {
        if (nu > far) {
          far = nu;
          victim = key;
        }
      }
      inCache.delete(victim);
    }
    inCache.set(k, nextUse[i]);
  }
  return { hits, misses: n - hits, hitRatio: n ? hits / n : 0 };
}

export type TraceKind = "zipf" | "uniform" | "loop";

export const TRACE_LABEL: Record<TraceKind, string> = {
  zipf: "Popular keys dominate (Zipf)",
  uniform: "Every key equally likely",
  loop: "Looping scan slightly bigger than the cache",
};

/** Key access traces over `universe` keys. `loop` cycles through capacity+1 keys, the worst case for LRU and FIFO. */
export function generateAccessTrace(kind: TraceKind, length: number, universe: number, capacity: number, seed = 1): string[] {
  const rand = mulberry32(seed);
  const out: string[] = [];
  if (kind === "loop") {
    const span = Math.min(universe, capacity + 1);
    for (let i = 0; i < length; i++) out.push(`k${i % span}`);
  } else if (kind === "uniform") {
    for (let i = 0; i < length; i++) out.push(`k${Math.floor(rand() * universe)}`);
  } else {
    const draw = zipfSampler(universe, 1.0, rand);
    for (let i = 0; i < length; i++) out.push(`k${draw()}`);
  }
  return out;
}

export const POLICIES: Policy[] = ["lru", "lfu", "fifo"];