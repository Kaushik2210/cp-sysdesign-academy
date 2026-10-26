import { describe, expect, it } from "vitest";
import { DEFAULT_SEGTREE, parseSegtree, segtreeSteps } from "../src/visualizers/segtree";

const last = <T>(a: T[]) => a[a.length - 1];

function randomCase(seed: number) {
  let x = seed;
  const rnd = (m: number) => ((x = (x * 1664525 + 1013904223) >>> 0) % m);
  const n = 1 + rnd(8);
  const values = Array.from({ length: n }, () => rnd(21) - 10);
  const lines = [values.join(" ")];
  for (let i = 0; i < 10; i++) {
    if (rnd(2)) {
      const a = rnd(n);
      const b = rnd(n);
      lines.push(`query ${Math.min(a, b)} ${Math.max(a, b)}`);
    } else lines.push(`update ${rnd(n)} ${rnd(21) - 10}`);
  }
  return { n, values, text: lines.join("\n") };
}

describe("parseSegtree", () => {
  it("parses values and operations", () => {
    expect(parseSegtree("1 2 3\nquery 0 2\nupdate 1 -5")).toEqual({ values: [1, 2, 3], ops: [{ kind: "query", l: 0, r: 2 }, { kind: "update", i: 1, v: -5 }] });
  });
  it("gives friendly errors", () => {
    expect(() => parseSegtree("")).toThrow(/Line 1/);
    expect(() => parseSegtree("a b")).toThrow(/whole numbers/);
    expect(() => parseSegtree("1 2 3 4 5 6 7 8 9")).toThrow(/at most 8/);
    expect(() => parseSegtree("1000")).toThrow(/-999 and 999/);
    expect(() => parseSegtree("1 2\nquery 0 2")).toThrow(/positions are 0 to 1/);
    expect(() => parseSegtree("1 2\nquery 1 0")).toThrow(/left end/);
    expect(() => parseSegtree("1 2\nupdate 0 x")).toThrow(/new value/);
    expect(() => parseSegtree("1 2\nsum 0 1")).toThrow(/Unknown operation/);
  });
});

describe("segtreeSteps", () => {
  it("every query answer equals a naive sum, and updates are reflected, on 120 random cases", () => {
    for (let seed = 1; seed <= 120; seed++) {
      const { values, text } = randomCase(seed);
      const a = [...values];
      const lines = text.split("\n").slice(1);
      const steps = segtreeSteps(text);
      let si = 0;
      for (const line of lines) {
        const [k, p, q] = line.split(" ");
        if (k === "update") a[Number(p)] = Number(q);
        else {
          const want = a.slice(Number(p), Number(q) + 1).reduce((s, v) => s + v, 0);
          const done = steps.slice(si + 1).find((s) => s.line === 4 && s.state.op === `query(${p}, ${q})`)!;
          expect(done.state.answer, text + "\n" + line).toBe(want);
          si = steps.indexOf(done);
        }
      }
    }
  });
  it("the nodes used cover the query range exactly once", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { text } = randomCase(seed);
      for (const s of segtreeSteps(text)) {
        if (s.line !== 4) continue;
        const m = /query\((\d+), (\d+)\)/.exec(s.state.op)!;
        const covered: number[] = [];
        for (const k of s.state.used) for (let i = s.state.lo[k]!; i <= s.state.hi[k]!; i++) covered.push(i);
        covered.sort((x, y) => x - y);
        expect(covered).toEqual(Array.from({ length: Number(m[2]) - Number(m[1]) + 1 }, (_, i) => Number(m[1]) + i));
      }
    }
  });
  it("a query touches far fewer stored nodes than elements for a long range", () => {
    const steps = segtreeSteps("1 1 1 1 1 1 1 1\nquery 0 7");
    const q = last(steps.filter((s) => s.line === 4));
    expect(q.state.used).toEqual([1]); // the root alone answers the whole range
    expect(q.state.answer).toBe(8);
  });
  it("after an update every internal node equals the sum of its children and the root equals the array sum", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { text } = randomCase(seed);
      const f = last(segtreeSteps(text)).state;
      f.sum.forEach((s, k) => {
        if (s === null || f.lo[k] === f.hi[k]) return;
        expect(s).toBe(f.sum[2 * k]! + f.sum[2 * k + 1]!);
      });
      expect(f.sum[1]).toBe(f.values.reduce((t, v) => t + v, 0));
    }
  });
  it("default script: hand-checked answers", () => {
    // a = 5 3 8 6 2 7 4 1: query 2..6 = 8+6+2+7+4 = 27; set a[3]=10; query 0..4 = 5+3+8+10+2 = 28; query 5..5 = 7
    const answers = segtreeSteps(DEFAULT_SEGTREE)
      .filter((s) => s.line === 4)
      .map((s) => s.state.answer);
    expect(answers).toEqual([27, 28, 7]);
  });
  it("single-element array works", () => {
    const steps = segtreeSteps("4\nquery 0 0\nupdate 0 9\nquery 0 0");
    expect(steps.filter((s) => s.line === 4).map((s) => s.state.answer)).toEqual([4, 9]);
  });
});
