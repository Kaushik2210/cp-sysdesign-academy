import { describe, expect, it } from "vitest";
import { DEFAULT_KMP, kmpSteps, parseKmp } from "../src/visualizers/kmp";

const last = <T>(a: T[]) => a[a.length - 1];

/** Definition: longest proper prefix of p[0..i] that is also a suffix of it. */
function naivePi(p: string): number[] {
  return Array.from({ length: p.length }, (_, i) => {
    const s = p.slice(0, i + 1);
    for (let len = i; len > 0; len--) if (s.slice(0, len) === s.slice(s.length - len)) return len;
    return 0;
  });
}
const naiveFind = (t: string, p: string) => {
  const out: number[] = [];
  for (let i = 0; i + p.length <= t.length; i++) if (t.startsWith(p, i)) out.push(i);
  return out;
};

function randomCase(seed: number) {
  let x = seed;
  const rnd = (m: number) => ((x = (x * 1664525 + 1013904223) >>> 0) % m);
  const alpha = "ab".slice(0, 1 + rnd(2) + (seed % 2));
  const word = (len: number) => Array.from({ length: len }, () => alpha[rnd(alpha.length)]).join("");
  return { text: word(1 + rnd(24)), pattern: word(1 + rnd(8)) };
}

describe("parseKmp", () => {
  it("parses text and pattern", () => {
    expect(parseKmp("abc\nbc")).toEqual({ text: "abc", pattern: "bc" });
  });
  it("gives friendly errors", () => {
    expect(() => parseKmp("abc")).toThrow(/two lines/);
    expect(() => parseKmp("ab c\nb")).toThrow(/lowercase letters and digits/);
    expect(() => parseKmp("abc\nB")).toThrow(/pattern may only/);
    expect(() => parseKmp("a".repeat(25) + "\na")).toThrow(/24/);
    expect(() => parseKmp("abc\n" + "a".repeat(11))).toThrow(/10/);
  });
});

describe("kmpSteps", () => {
  it("the prefix function equals the definition on 200 random patterns", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { text, pattern } = randomCase(seed);
      const f = last(kmpSteps(`${text}\n${pattern}`)).state;
      expect(f.pi, pattern).toEqual(naivePi(pattern));
    }
  });
  it("finds exactly the occurrences a naive search finds, including overlaps", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { text, pattern } = randomCase(seed);
      expect(last(kmpSteps(`${text}\n${pattern}`)).state.found, `${text} / ${pattern}`).toEqual(naiveFind(text, pattern));
    }
  });
  it("hand-checked default: pi of ababab and occurrences at 0 and 7", () => {
    const f = last(kmpSteps(DEFAULT_KMP)).state;
    expect(f.pi).toEqual([0, 0, 1, 2, 3, 4]);
    // text abababcabababab: "ababab" at 0, and at 7 ("abababab" at 7..14 also matches at 9)
    expect(f.found).toEqual(naiveFind("abababcabababab", "ababab"));
    expect(f.found).toEqual([0, 7, 9]);
  });
  it("the text pointer never moves backwards and the work is linear", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { text, pattern } = randomCase(seed);
      const steps = kmpSteps(`${text}\n${pattern}`);
      const cols = steps.filter((s) => s.state.phase === "match" && s.state.col !== null && s.line !== 9).map((s) => s.state.col!);
      for (let i = 1; i < cols.length; i++) expect(cols[i]).toBeGreaterThanOrEqual(cols[i - 1]);
      // each character causes at most (fallbacks + 1) comparisons and fallbacks are paid for by earlier advances
      expect(steps.length).toBeLessThanOrEqual(4 * (text.length + pattern.length) + 10);
    }
  });
  it("every compare step really compares the characters it highlights", () => {
    for (const s of kmpSteps(DEFAULT_KMP)) {
      const f = s.state;
      if (f.col === null || f.verdict === null || s.line === 9) continue;
      const bottomIdx = f.col - f.offset;
      expect(bottomIdx).toBe(f.good);
      expect(f.verdict === "equal").toBe(f.top[f.col] === f.bottom[bottomIdx]);
    }
  });
  it("handles a pattern longer than the text, and a single character", () => {
    expect(last(kmpSteps("ab\nabc")).state.found).toEqual([]);
    expect(last(kmpSteps("aaaa\na")).state.found).toEqual([0, 1, 2, 3]);
    expect(last(kmpSteps("xyz\nq")).note).toMatch(/does not occur/);
  });
});
