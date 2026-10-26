/** Deterministic helpers so every simulation is reproducible from a seed. */

/** mulberry32: a tiny, fast seeded generator returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a followed by a murmur-style finalizer: well-mixed 32-bit hash of a string. */
export function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Sample an integer from a Zipf-like distribution over 0..n-1 (a few hot items, a long tail). */
export function zipfSampler(n: number, skew: number, rand: () => number): () => number {
  const cdf: number[] = [];
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += 1 / Math.pow(i, skew);
    cdf.push(sum);
  }
  return () => {
    const x = rand() * sum;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
}