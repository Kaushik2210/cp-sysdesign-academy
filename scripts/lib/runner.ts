/* Shared helpers for scripts that execute user-facing code (reference solutions, templates). */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { normalize } from "../../src/lib/runner/judge";

export type Lang = "python" | "javascript" | "java" | "cpp";
export interface Case {
  input: string;
  output: string;
}

const CI = process.env.CI === "true";
const TIMEOUT_MS = 15_000;

function has(cmd: string, args: string[]): boolean {
  return spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
}

export const python = ["python3", "python"].find((c) => has(c, ["--version"]));
export const toolchains: Record<Lang, boolean> = {
  python: !!python,
  javascript: has("node", ["--version"]),
  java: has("java", ["-version"]),
  cpp: has("g++", ["--version"]),
};

/** Collects results across many programs so scripts can print one summary and exit code. */
export class Verifier {
  failures = 0;
  checks = 0;
  skipped = new Set<string>();
  private tmp = fs.mkdtempSync(path.join(os.tmpdir(), "verify-"));

  private runTests(label: string, cmd: string, args: string[], cwd: string, tests: Case[]) {
    tests.forEach((t, i) => {
      this.checks++;
      const r = spawnSync(cmd, args, { input: t.input, cwd, encoding: "utf8", timeout: TIMEOUT_MS });
      if (r.status !== 0) {
        this.failures++;
        console.error(`FAIL ${label} test ${i + 1}: exit ${r.status} ${r.error ?? ""}\n${r.stderr}`);
      } else if (normalize(r.stdout) !== normalize(t.output)) {
        this.failures++;
        console.error(
          `FAIL ${label} test ${i + 1}: wrong answer\n expected: ${t.output.trim().slice(0, 120)}\n got:      ${r.stdout.trim().slice(0, 120)}`,
        );
      }
    });
  }

  /** Runs `code` in `lang` against all tests. A missing toolchain is skipped locally and a failure in CI. */
  check(label: string, lang: Lang, code: string, tests: Case[]) {
    if (!toolchains[lang]) {
      this.skipped.add(lang);
      if (CI) {
        this.failures++;
        console.error(`FAIL ${label}: toolchain for ${lang} missing in CI`);
      }
      return;
    }
    const dir = fs.mkdtempSync(path.join(this.tmp, `${label.replace(/[^\w-]/g, "_")}-`));
    if (lang === "python") {
      fs.writeFileSync(path.join(dir, "sol.py"), code);
      this.runTests(label, python!, ["sol.py"], dir, tests);
    } else if (lang === "javascript") {
      // Same readLine() contract as public/workers/js-worker.js.
      const shim =
        "const __l=require('fs').readFileSync(0,'utf8').split('\\n');let __i=0;const readLine=()=>__i<__l.length?__l[__i++]:null;\n";
      fs.writeFileSync(path.join(dir, "sol.js"), shim + code);
      this.runTests(label, "node", ["sol.js"], dir, tests);
    } else if (lang === "java") {
      fs.writeFileSync(path.join(dir, "Main.java"), code);
      this.runTests(label, "java", ["Main.java"], dir, tests);
    } else {
      fs.writeFileSync(path.join(dir, "sol.cpp"), code);
      const exe = path.join(dir, process.platform === "win32" ? "sol.exe" : "sol");
      const c = spawnSync("g++", ["-O2", "-std=c++17", "-o", exe, "sol.cpp"], { cwd: dir, encoding: "utf8" });
      if (c.status !== 0) {
        this.failures++;
        console.error(`FAIL ${label}: compile error\n${c.stderr}`);
      } else this.runTests(label, exe, [], dir, tests);
    }
  }

  /** Prints the summary and exits non-zero on failure. */
  finish(name: string) {
    fs.rmSync(this.tmp, { recursive: true, force: true });
    if (this.skipped.size) console.warn(`Skipped (no toolchain): ${[...this.skipped].join(", ")}`);
    if (this.failures) {
      console.error(`${name}: ${this.failures} failure(s) in ${this.checks} test runs.`);
      process.exit(1);
    }
    console.log(`${name}: ${this.checks} test runs passed.`);
  }
}