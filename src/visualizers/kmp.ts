import type { Step } from "./types";

export interface KmpFrame {
  phase: "prefix" | "match";
  /** Upper row: the pattern itself while building the prefix function, the text while matching. */
  top: string;
  /** Lower row: the pattern, shifted right by `offset` columns. */
  bottom: string;
  offset: number;
  /** Column of the character pair being compared, in top-row coordinates. */
  col: number | null;
  /** How many characters of the bottom row (from its start) are already known to match. */
  good: number;
  verdict: "equal" | "different" | null;
  pattern: string;
  pi: (number | null)[];
  /** Start positions of full matches found so far. */
  found: number[];
}

export const MAX_TEXT = 24;
export const MAX_PATTERN = 10;
export const DEFAULT_KMP = ["abababcabababab", "ababab"].join("\n");

export function parseKmp(input: string): { text: string; pattern: string } {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length !== 2) throw new Error("Enter two lines: the text, then the pattern to find in it.");
  const [text, pattern] = lines;
  for (const [name, s] of [["text", text], ["pattern", pattern]] as const) if (!/^[a-z0-9]+$/.test(s)) throw new Error(`The ${name} may only use lowercase letters and digits, with no spaces.`);
  if (text.length > MAX_TEXT) throw new Error(`Keep the text to ${MAX_TEXT} characters or fewer.`);
  if (pattern.length > MAX_PATTERN) throw new Error(`Keep the pattern to ${MAX_PATTERN} characters or fewer.`);
  return { text, pattern };
}

export const KMP_CODE = [
  "pi[0] = 0; k = 0                      # prefix function of the pattern",
  "for i = 1 to m-1:",
  "    while k > 0 and p[i] != p[k]: k = pi[k-1]",
  "    if p[i] == p[k]: k += 1",
  "    pi[i] = k",
  "j = 0                                  # now scan the text",
  "for i = 0 to n-1:",
  "    while j > 0 and t[i] != p[j]: j = pi[j-1]",
  "    if t[i] == p[j]: j += 1",
  "    if j == m: record a match at i-m+1; j = pi[j-1]",
];

export function kmpSteps(input: string): Step<KmpFrame>[] {
  const { text, pattern: p } = parseKmp(input);
  const m = p.length;
  const pi: (number | null)[] = Array(m).fill(null);
  const found: number[] = [];
  const steps: Step<KmpFrame>[] = [];
  const snap = (line: number, note: string, f: Pick<KmpFrame, "phase" | "top" | "offset" | "col" | "good" | "verdict">) =>
    steps.push({ line, note, state: { ...f, bottom: p, pattern: p, pi: [...pi], found: [...found] } });

  pi[0] = 0;
  snap(0, "A single character has no proper border, so pi[0] = 0. pi[i] will be the length of the longest proper prefix of p[0..i] that is also a suffix of it.", { phase: "prefix", top: p, offset: 0, col: 0, good: 0, verdict: null });

  /** One round of the shared "compare, fall back on mismatch" loop. Returns the new matched length. */
  const advance = (phase: "prefix" | "match", top: string, i: number, start: number): number => {
    let k = start;
    const [fallLine, eqLine] = phase === "prefix" ? [2, 3] : [7, 8];
    for (;;) {
      const eq = top[i] === p[k];
      const frame = { phase, top, offset: i - k, col: i, good: k, verdict: (eq ? "equal" : "different") as KmpFrame["verdict"] };
      if (eq) {
        snap(eqLine, `${phase === "prefix" ? "p" : "t"}[${i}] = "${top[i]}" equals p[${k}] = "${p[k]}": the border grows to ${k + 1}.`, frame);
        return k + 1;
      }
      if (k === 0) {
        snap(eqLine, `"${top[i]}" differs from p[0] = "${p[0]}" and nothing is matched yet, so move on.`, frame);
        return 0;
      }
      snap(fallLine, `"${top[i]}" differs from p[${k}] = "${p[k]}". Instead of restarting, fall back to pi[${k - 1}] = ${pi[k - 1]}: the pattern slides so its first ${pi[k - 1]} characters stay lined up.`, frame);
      k = pi[k - 1]!;
    }
  };

  let k = 0;
  for (let i = 1; i < m; i++) {
    k = advance("prefix", p, i, k);
    pi[i] = k;
    snap(4, `pi[${i}] = ${k}.`, { phase: "prefix", top: p, offset: i - k, col: i, good: k, verdict: null });
  }

  let j = 0;
  snap(5, `The prefix function is ready: [${pi.join(", ")}]. Now scan the text, never moving the text pointer backwards.`, { phase: "match", top: text, offset: 0, col: null, good: 0, verdict: null });
  for (let i = 0; i < text.length; i++) {
    j = advance("match", text, i, j);
    if (j === m) {
      found.push(i - m + 1);
      snap(9, `All ${m} characters matched: the pattern occurs at position ${i - m + 1}. Fall back to pi[${m - 1}] = ${pi[m - 1]} to look for an overlapping occurrence.`, { phase: "match", top: text, offset: i - m + 1, col: i, good: m, verdict: "equal" });
      j = pi[m - 1]!;
    }
  }
  snap(
    6,
    found.length ? `Done: the pattern occurs at position${found.length === 1 ? "" : "s"} ${found.join(", ")}.` : "Done: the pattern does not occur in the text.",
    { phase: "match", top: text, offset: 0, col: null, good: 0, verdict: null },
  );
  return steps;
}
