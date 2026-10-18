/* Runs every template (Python, Java, C++) against its meta.json tests. Exit 1 on any failure. */
import { getTemplates } from "../src/lib/content/templates";
import { Verifier } from "./lib/runner";

const only = process.argv[2]; // optional slug prefix
const v = new Verifier();
for (const t of getTemplates().filter((x) => !only || x.slug.startsWith(only))) {
  v.check(`${t.slug}/python`, "python", t.code.python, t.tests);
  v.check(`${t.slug}/java`, "java", t.code.java, t.tests);
  v.check(`${t.slug}/cpp`, "cpp", t.code.cpp, t.tests);
}
v.finish("verify-templates");