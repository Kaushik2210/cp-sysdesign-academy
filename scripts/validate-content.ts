/* Fails (exit 1) on invalid frontmatter, MDX syntax errors, unknown prerequisites/problems, duplicate orders
 * or quiz ids, invalid problem files, and broken internal links. Optional arg: lesson-id prefix filter. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { getAllLessons, getLessonSource } from "../src/lib/content/loader";
import { getAllProblems } from "../src/lib/content/problems";
import { getPatterns } from "../src/lib/content/patterns";
import { getTemplates } from "../src/lib/content/templates";
import { getGlossary } from "../src/lib/content/glossary";

const only = process.argv[2]; // e.g. `cp/math-basics`
const errors: string[] = [];
let lessons: ReturnType<typeof getAllLessons> = [];
try {
  lessons = getAllLessons();
} catch (e) {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
}

const ids = new Set(lessons.map((l) => l.id));
const pathSlugs = fs.existsSync("content/paths")
  ? fs.readdirSync("content/paths").map((f) => f.replace(/\.json$/, ""))
  : [];
const routes = new Set<string>([
  "/",
  "/cp/",
  "/sd/",
  "/dashboard/",
  "/review/",
  "/paths/",
  "/patterns/",
  "/templates/",
  "/glossary/",
  ...getTemplates().map((t) => `/templates/${t.slug}/`),
  ...pathSlugs.map((s) => `/paths/${s}/`),
  ...lessons.map((l) => l.href),
]);

const problemIds = new Set<string>();
try {
  for (const p of getAllProblems()) {
    if (problemIds.has(p.id)) errors.push(`duplicate problem id ${p.id}`);
    problemIds.add(p.id);
  }
} catch (e) {
  errors.push(String(e instanceof Error ? e.message : e));
}

try {
  for (const pat of getPatterns()) {
    for (const l of pat.lessons) if (!ids.has(l)) errors.push(`pattern "${pat.id}": unknown lesson "${l}"`);
  }
} catch (e) {
  errors.push(String(e instanceof Error ? e.message : e));
}

try {
  for (const tpl of getTemplates()) {
    for (const l of tpl.lessons) if (!ids.has(l)) errors.push(`template "${tpl.slug}": unknown lesson "${l}"`);
  }
} catch (e) {
  errors.push(String(e instanceof Error ? e.message : e));
}

try {
  const terms = getGlossary();
  const termIds = new Set(terms.map((t) => t.id));
  for (const t of terms) {
    for (const r of t.related) if (!termIds.has(r)) errors.push(`glossary "${t.id}": unknown related term "${r}"`);
    if (t.related.includes(t.id)) errors.push(`glossary "${t.id}": lists itself as related`);
    for (const l of t.lessons) if (!ids.has(l)) errors.push(`glossary "${t.id}": unknown lesson "${l}"`);
  }
} catch (e) {
  errors.push(String(e instanceof Error ? e.message : e));
}

const quizIds = new Map<string, string>();
const seen = new Map<string, string>();

async function main() {
  for (const l of lessons) {
    // Global checks run on everything; per-file compile only for the filtered set.
    const src = getLessonSource(l);
    for (const m of src.matchAll(/<Quiz\s+id="([^"]+)"/g)) {
      if (quizIds.has(m[1])) errors.push(`${l.id}: duplicate quiz id "${m[1]}" (also ${quizIds.get(m[1])})`);
      quizIds.set(m[1], l.id);
    }
    if (only && !l.id.startsWith(only)) continue;

    const key = `${l.track}/${l.module}#${l.order}`;
    if (seen.has(key)) errors.push(`${l.id}: duplicate order ${l.order} (also ${seen.get(key)})`);
    seen.set(key, l.id);

    for (const p of l.prerequisites) if (!ids.has(p)) errors.push(`${l.id}: unknown prerequisite "${p}"`);
    for (const p of l.problems) if (!problemIds.has(p)) errors.push(`${l.id}: unknown problem "${p}"`);
    for (const m of src.matchAll(/<Problem\s+id="([^"]+)"/g)) {
      if (!problemIds.has(m[1])) errors.push(`${l.id}: <Problem id="${m[1]}"> does not exist`);
      if (!l.problems.includes(m[1])) errors.push(`${l.id}: problem "${m[1]}" used but missing from frontmatter problems[]`);
    }

    for (const m of src.matchAll(/\]\((\/[^)#\s]*)(?:#[^)]*)?\)|href="(\/[^"#]*)(?:#[^"]*)?"/g)) {
      const target = (m[1] ?? m[2]).replace(/\/?$/, "/");
      if (!routes.has(target)) errors.push(`${l.id}: broken internal link ${m[1] ?? m[2]}`);
    }

  }

  // MDX syntax check runs in a plain-ESM child process (next-mdx-remote needs native ESM resolution).
  const mdx = spawnSync(process.execPath, ["scripts/check-mdx.mjs", ...(only ? [only] : [])], { encoding: "utf8" });
  if (mdx.status !== 0) {
    errors.push(...(mdx.stderr || mdx.stdout).trim().split("\n").map((s) => s.replace(/^ - /, "")));
  }

  if (errors.length) {
    console.error(`Content validation failed:\n - ${errors.join("\n - ")}`);
    process.exit(1);
  }
  const checked = lessons.filter((l) => !only || l.id.startsWith(only)).length;
  console.log(`Content OK: ${checked} lessons checked (${lessons.length} total, ${problemIds.size} problems).`);
}

void path;
main();
