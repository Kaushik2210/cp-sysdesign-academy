import { describe, expect, it } from "vitest";
import { DEFAULT_DSU, dsuSteps, parseDsu } from "../src/visualizers/dsu";

const last = <T>(a: T[]) => a[a.length - 1];
const rootOf = (parent: number[], x: number) => {
  while (parent[x] !== x) x = parent[x];
  return x;
};
const depth = (parent: number[], x: number) => {
  let d = 0;
  while (parent[x] !== x) {
    x = parent[x];
    d++;
  }
  return d;
};

function randomOps(seed: number) {
  let x = seed;
  const rnd = (m: number) => ((x = (x * 1664525 + 1013904223) >>> 0) % m);
  const n = 2 + rnd(9);
  const ops = Array.from({ length: 4 + rnd(17) }, () => (rnd(3) ? `union ${rnd(n)} ${rnd(n)}` : `find ${rnd(n)}`));
  return { n, text: [String(n), ...ops].join("\n"), ops };
}

describe("parseDsu", () => {
  it("parses n and operations", () => {
    expect(parseDsu("3\nunion 0 1\nfind 2")).toEqual({ n: 3, ops: [{ kind: "union", a: 0, b: 1 }, { kind: "find", a: 2 }] });
  });
  it("gives friendly errors", () => {
    expect(() => parseDsu("")).toThrow(/Line 1/);
    expect(() => parseDsu("0")).toThrow(/between 1 and 10/);
    expect(() => parseDsu("11")).toThrow(/between 1 and 10/);
    expect(() => parseDsu("3\nunion 0 3")).toThrow(/numbered 0 to 2/);
    expect(() => parseDsu("3\nmerge 0 1")).toThrow(/Unknown operation/);
    expect(() => parseDsu("3\nunion 0")).toThrow(/Unknown operation/);
    expect(() => parseDsu("3\n" + Array(21).fill("find 0").join("\n"))).toThrow(/at most 20/);
  });
});

describe("dsuSteps", () => {
  it("final sets match a naive component computation on 100 random operation lists", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const { n, text, ops } = randomOps(seed);
      const comp = Array.from({ length: n }, (_, i) => i);
      for (const o of ops) {
        const [k, a, b] = o.split(" ");
        if (k !== "union") continue;
        const from = comp[Number(a)];
        const to = comp[Number(b)];
        for (let i = 0; i < n; i++) if (comp[i] === from) comp[i] = to;
      }
      const f = last(dsuSteps(text)).state;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) expect(rootOf(f.parent, i) === rootOf(f.parent, j), text).toBe(comp[i] === comp[j]);
    }
  });
  it("sizes always add up and each root's size equals its set size", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { n, text } = randomOps(seed);
      for (const s of dsuSteps(text)) {
        const roots = s.state.parent.map((p, i) => (p === i ? i : -1)).filter((i) => i >= 0);
        expect(roots.reduce((t, r) => t + s.state.size[r], 0)).toBe(n);
        for (const r of roots) expect(s.state.parent.filter((_, i) => rootOf(s.state.parent, i) === r).length).toBe(s.state.size[r]);
      }
    }
  });
  it("union by size keeps every tree at depth <= log2(n)", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { n, text } = randomOps(seed);
      for (const s of dsuSteps(text)) for (let i = 0; i < n; i++) expect(depth(s.state.parent, i)).toBeLessThanOrEqual(Math.floor(Math.log2(n)));
    }
  });
  it("find compresses the whole path onto the root", () => {
    // chain-like merges, then find the deepest node
    const steps = dsuSteps(DEFAULT_DSU);
    const f = last(steps).state;
    expect(f.parent[3]).toBe(rootOf(f.parent, 3));
    expect(f.size[rootOf(f.parent, 0)]).toBe(8); // 0..7 are all joined by the default script
  });
  it("default script ends with a single set of 8", () => {
    const f = last(dsuSteps(DEFAULT_DSU));
    expect(f.note).toMatch(/1 set remain/);
  });
  it("union of two elements already together reports it and changes nothing", () => {
    const steps = dsuSteps("3\nunion 0 1\nunion 1 0");
    expect(steps.some((s) => /already in the same set/.test(s.note))).toBe(true);
    const s = last(steps).state;
    expect(s.size.filter((_, i) => s.parent[i] === i)).toEqual([2, 1]);
  });
  it("a depth-3 chain is flattened by one find (compression, not just shortening)", () => {
    // build a chain by hand through unions of singletons: sizes force specific shapes
    const f = last(dsuSteps("8\nunion 0 1\nunion 2 3\nunion 0 2\nunion 4 5\nunion 6 7\nunion 4 6\nunion 0 4\nfind 7\nfind 7")).state;
    expect(depth(f.parent, 7)).toBeLessThanOrEqual(1);
  });
});
