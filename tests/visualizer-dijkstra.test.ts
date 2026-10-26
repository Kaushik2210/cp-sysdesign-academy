import { describe, expect, it } from "vitest";
import { DEFAULT_GRAPH, dijkstraSteps, parseGraph } from "../src/visualizers/dijkstra";

/** Reference: Bellman-Ford on the same parsed graph (undirected). */
function reference(input: string): (number | null)[] {
  const { nodes, edges, source } = parseGraph(input);
  const d: number[] = Array(nodes.length).fill(Infinity);
  d[source] = 0;
  for (let k = 0; k < nodes.length; k++)
    for (const e of edges) {
      if (d[e.u] + e.w < d[e.v]) d[e.v] = d[e.u] + e.w;
      if (d[e.v] + e.w < d[e.u]) d[e.u] = d[e.v] + e.w;
    }
  return d.map((x) => (x === Infinity ? null : x));
}
const last = <T>(a: T[]) => a[a.length - 1];

function randomGraph(seed: number): string {
  let x = seed;
  const rnd = (m: number) => ((x = (x * 1664525 + 1013904223) >>> 0) % m);
  const n = 3 + rnd(6);
  const lines = ["N0", `N0 N1 ${rnd(12)}`];
  const m = n - 1 + rnd(6);
  for (let i = 0; i < m && lines.length <= 16; i++) {
    const a = i < n - 1 && seed % 3 ? i : rnd(n);
    let b = i < n - 1 && seed % 3 ? i + 1 : rnd(n);
    if (a === b) b = (b + 1) % n;
    lines.push(`N${a} N${b} ${rnd(12)}`);
  }
  return lines.join("\n");
}

describe("parseGraph", () => {
  it("parses nodes in order of first appearance", () => {
    const g = parseGraph("A\nA B 3\nB C 0");
    expect(g.nodes).toEqual(["A", "B", "C"]);
    expect(g.edges).toEqual([{ u: 0, v: 1, w: 3 }, { u: 1, v: 2, w: 0 }]);
  });
  it("gives friendly errors", () => {
    expect(() => parseGraph("A")).toThrow(/source node/);
    expect(() => parseGraph("A B\nA B 1")).toThrow(/single node/);
    expect(() => parseGraph("A\nA B -2")).toThrow(/non-negative/);
    expect(() => parseGraph("A\nA B x")).toThrow(/whole number/);
    expect(() => parseGraph("A\nA B")).toThrow(/u v weight/);
    expect(() => parseGraph("A\nA A 1")).toThrow(/Self-loop/);
    expect(() => parseGraph("Z\nA B 1")).toThrow(/does not appear/);
    expect(() => parseGraph("A\nA B 100")).toThrow(/99/);
    expect(() => parseGraph("A\n" + Array.from({ length: 9 }, (_, i) => `A N${i} 1`).join("\n"))).toThrow(/at most 8 nodes/);
  });
});

describe("dijkstraSteps", () => {
  it("default graph has hand-checked distances A=0 B=3 C=1 D=4 E=7 F=8", () => {
    const f = last(dijkstraSteps(DEFAULT_GRAPH)).state;
    expect(f.nodes).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(f.dist).toEqual([0, 3, 1, 4, 7, 8]);
  });
  it("matches Bellman-Ford on 80 random graphs, including unreachable nodes", () => {
    for (let seed = 1; seed <= 80; seed++) {
      const g = randomGraph(seed);
      expect(last(dijkstraSteps(g)).state.dist, g).toEqual(reference(g));
    }
  });
  it("nodes become final in non-decreasing distance order", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const order: number[] = [];
      let prev: boolean[] = [];
      for (const s of dijkstraSteps(randomGraph(seed))) {
        s.state.done.forEach((d, i) => d && !prev[i] && order.push(s.state.dist[i]!));
        prev = s.state.done;
      }
      expect(order).toEqual([...order].sort((a, b) => a - b));
    }
  });
  it("the tree edges reconstruct each shortest distance", () => {
    const f = last(dijkstraSteps(DEFAULT_GRAPH)).state;
    f.nodes.forEach((_, v) => {
      if (v === f.source) return;
      const e = f.edges[f.treeEdge[v]!];
      const p = e.u === v ? e.v : e.u;
      expect(f.dist[v]).toBe(f.dist[p]! + e.w);
    });
  });
  it("shows a stale entry being skipped when a shorter path is found later", () => {
    const steps = dijkstraSteps("A\nA B 10\nA C 1\nC B 1");
    expect(steps.some((s) => /stale/.test(s.note))).toBe(true);
    expect(last(steps).state.dist).toEqual([0, 2, 1]);
  });
  it("zero-weight edges and a disconnected source work", () => {
    expect(last(dijkstraSteps("A\nA B 0\nB C 0")).state.dist).toEqual([0, 0, 0]);
    const f = last(dijkstraSteps("A\nB C 1\nA D 2")).state;
    expect(f.nodes).toEqual(["B", "C", "A", "D"]); // numbered by first appearance\n    expect(f.dist).toEqual([null, null, 0, 2]);
    expect(last(dijkstraSteps("A\nB C 1\nA D 2")).note).toMatch(/cannot be reached/);
  });
});
