/* Runs every reference solution against every test case. Exit 1 on any failure.
 * Python (python3/python), Java (single-file `java Main.java`), C++ (g++), JavaScript (node).
 * A missing toolchain is skipped locally with a warning, but is an error when CI=true. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAllProblems } from "../src/lib/content/problems";
import { normalize } from "../src/lib/runner/judge";

const CI = process.env.CI === "true";
const TIMEOUT_MS = 15_000;

function has(cmd: string, args: string[]): boolean {
  return spawnSync(cmd, args, { stdio: "ignore" }).status === 0;
}

const python = ["python3", "python"].find((c) => has(c, ["--version"]));
const toolchains = {
  python: !!python,
  javascript: has("node", ["--version"]),
  java: has("java", ["-version"]),
  cpp: has("g++", ["--version"]),
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "verify-"));
let failures = 0;
let checks = 0;
const skipped = new Set<string>();

function runTests(label: string, cmd: string, args: string[], cwd: string, tests: { input: string; output: string }[]) {
  tests.forEach((t, i) => {
    checks++;
    const r = spawnSync(cmd, args, { input: t.input, cwd, encoding: "utf8", timeout: TIMEOUT_MS });
    if (r.status !== 0) {
      failures++;
      console.error(`FAIL ${label} test ${i + 1}: exit ${r.status} ${r.error ?? ""}\n${r.stderr}`);
    } else if (normalize(r.stdout) !== normalize(t.output)) {
      failures++;
      console.error(`FAIL ${label} test ${i + 1}: wrong answer\n expected: ${t.output.trim().slice(0, 120)}\n got:      ${r.stdout.trim().slice(0, 120)}`);
    }
  });
}

const only = process.argv[2]; // optional id prefix filter, e.g. `pnpm verify cp3-`
for (const p of getAllProblems().filter((x) => !only || x.id.startsWith(only))) {
  for (const [lang, code] of Object.entries(p.solutions)) {
    const label = `${p.id}/${lang}`;
    if (!toolchains[lang as keyof typeof toolchains]) {
      skipped.add(lang);
      if (CI) {
        failures++;
        console.error(`FAIL ${label}: toolchain for ${lang} missing in CI`);
      }
      continue;
    }
    const dir = fs.mkdtempSync(path.join(tmp, `${p.id}-${lang}-`));
    if (lang === "python") {
      fs.writeFileSync(path.join(dir, "sol.py"), code);
      runTests(label, python!, ["sol.py"], dir, p.tests);
    } else if (lang === "javascript") {
      // Same readLine() contract as public/workers/js-worker.js.
      const shim =
        "const __l=require('fs').readFileSync(0,'utf8').split('\\n');let __i=0;const readLine=()=>__i<__l.length?__l[__i++]:null;\n";
      fs.writeFileSync(path.join(dir, "sol.js"), shim + code);
      runTests(label, "node", ["sol.js"], dir, p.tests);
    } else if (lang === "java") {
      fs.writeFileSync(path.join(dir, "Main.java"), code);
      runTests(label, "java", ["Main.java"], dir, p.tests);
    } else if (lang === "cpp") {
      fs.writeFileSync(path.join(dir, "sol.cpp"), code);
      const exe = path.join(dir, process.platform === "win32" ? "sol.exe" : "sol");
      const c = spawnSync("g++", ["-O2", "-std=c++17", "-o", exe, "sol.cpp"], { cwd: dir, encoding: "utf8" });
      if (c.status !== 0) {
        failures++;
        console.error(`FAIL ${label}: compile error\n${c.stderr}`);
      } else runTests(label, exe, [], dir, p.tests);
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
if (skipped.size) console.warn(`Skipped (no toolchain): ${[...skipped].join(", ")}`);
if (failures) {
  console.error(`verify-solutions: ${failures} failure(s) in ${checks} test runs.`);
  process.exit(1);
}
console.log(`verify-solutions: ${checks} test runs passed.`);
