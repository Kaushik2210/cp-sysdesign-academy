/* Runs every reference solution against every test case. Exit 1 on any failure.
 * Python (python3/python), Java (single-file `java Main.java`), C++ (g++), JavaScript (node).
 * A missing toolchain is skipped locally with a warning, but is an error when CI=true. */
import { getAllProblems } from "../src/lib/content/problems";
import { Verifier, type Lang } from "./lib/runner";

const only = process.argv[2]; // optional id prefix filter, e.g. `pnpm verify m05-`
const v = new Verifier();
for (const p of getAllProblems().filter((x) => !only || x.id.startsWith(only))) {
  for (const [lang, code] of Object.entries(p.solutions)) {
    v.check(`${p.id}/${lang}`, lang as Lang, code, p.tests);
  }
}
v.finish("verify-solutions");