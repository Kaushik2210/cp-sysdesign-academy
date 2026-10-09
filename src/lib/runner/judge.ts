import type { Language, RunOptions, RunResult } from "./types";

export type Verdict = "AC" | "WA" | "TLE" | "RE";

export interface TestCase {
  input: string;
  output: string;
  hidden?: boolean;
}

export interface TestOutcome {
  verdict: Verdict;
  timeMs: number;
  actual: string;
  expected: string;
  stderr: string;
}

export interface JudgeReport {
  verdict: Verdict;
  passed: number;
  total: number;
  outcomes: TestOutcome[];
  /** Index of the first failing test, if any. */
  firstFail?: number;
}

/** Whitespace-insensitive at line ends and at the end of output, like most judges. */
export function normalize(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export type RunFn = (
  language: Language,
  code: string,
  stdin: string,
  opts?: RunOptions,
) => Promise<RunResult>;

/** Run `code` on every test; stops at the first non-AC verdict, like ICPC-style judging. */
export async function judge(
  run: RunFn,
  language: Language,
  code: string,
  tests: TestCase[],
  opts: RunOptions = {},
): Promise<JudgeReport> {
  const outcomes: TestOutcome[] = [];
  for (const t of tests) {
    const r = await run(language, code, t.input, opts);
    let verdict: Verdict = "AC";
    if (r.status === "timeout") verdict = "TLE";
    else if (r.status !== "ok") verdict = "RE";
    else if (normalize(r.stdout) !== normalize(t.output)) verdict = "WA";
    outcomes.push({
      verdict,
      timeMs: r.timeMs,
      actual: r.stdout,
      expected: t.output,
      stderr: r.stderr,
    });
    if (verdict !== "AC") break;
  }
  const failIdx = outcomes.findIndex((o) => o.verdict !== "AC");
  return {
    verdict: failIdx === -1 ? "AC" : outcomes[failIdx].verdict,
    passed: outcomes.filter((o) => o.verdict === "AC").length,
    total: tests.length,
    outcomes,
    firstFail: failIdx === -1 ? undefined : failIdx,
  };
}
