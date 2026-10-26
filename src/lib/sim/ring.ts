import { hash32 } from "./rng";

export const RING_SIZE = 4294967296; // 2^32 positions

export interface RingPoint {
  pos: number;
  node: string;
}

/** Consistent-hash ring with virtual nodes. Keys map to the first point clockwise from their hash. */
export class HashRing {
  private pts: RingPoint[] = [];
  private members = new Set<string>();

  constructor(public readonly vnodes: number) {}

  get nodes(): string[] {
    return [...this.members];
  }

  get points(): readonly RingPoint[] {
    return this.pts;
  }

  addNode(id: string): void {
    if (this.members.has(id)) return;
    this.members.add(id);
    for (let i = 0; i < this.vnodes; i++) this.pts.push({ pos: hash32(`${id}#${i}`), node: id });
    this.pts.sort((a, b) => a.pos - b.pos || a.node.localeCompare(b.node));
  }

  removeNode(id: string): void {
    if (!this.members.delete(id)) return;
    this.pts = this.pts.filter((p) => p.node !== id);
  }

  /** Node responsible for a key, or null if the ring is empty. */
  lookup(key: string): string | null {
    if (this.pts.length === 0) return null;
    const h = hash32(key);
    let lo = 0;
    let hi = this.pts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.pts[mid].pos < h) lo = mid + 1;
      else hi = mid;
    }
    return this.pts[lo % this.pts.length].node; // wrap around the ring
  }
}

/** Map every key to its node. */
export function assignKeys(keys: string[], lookup: (key: string) => string | null): Map<string, string | null> {
  return new Map(keys.map((k) => [k, lookup(k)]));
}

/** The naive alternative: hash(key) mod N over an ordered node list. */
export function modLookup(nodes: string[]): (key: string) => string | null {
  return (key) => (nodes.length ? nodes[hash32(key) % nodes.length] : null);
}

/** Fraction of keys whose owner changed between two assignments (keys missing from either are ignored). */
export function movedFraction(before: Map<string, string | null>, after: Map<string, string | null>): number {
  let moved = 0;
  let total = 0;
  for (const [k, node] of before) {
    if (!after.has(k)) continue;
    total++;
    if (after.get(k) !== node) moved++;
  }
  return total ? moved / total : 0;
}

export interface LoadStats {
  counts: Record<string, number>;
  mean: number;
  max: number;
  min: number;
  /** Largest node load divided by the mean: 1 is perfectly even. */
  maxOverMean: number;
  /** Standard deviation as a percentage of the mean. */
  stdDevPercent: number;
}

export function loadStats(assignments: Map<string, string | null>, nodes: string[]): LoadStats {
  const counts: Record<string, number> = Object.fromEntries(nodes.map((n) => [n, 0]));
  for (const node of assignments.values()) if (node && node in counts) counts[node]++;
  const vals = Object.values(counts);
  if (!vals.length) return { counts, mean: 0, max: 0, min: 0, maxOverMean: 0, stdDevPercent: 0 };
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  return {
    counts,
    mean,
    max: Math.max(...vals),
    min: Math.min(...vals),
    maxOverMean: mean ? Math.max(...vals) / mean : 0,
    stdDevPercent: mean ? (Math.sqrt(variance) / mean) * 100 : 0,
  };
}

export const makeKeys = (n: number): string[] => Array.from({ length: n }, (_, i) => `key-${i}`);