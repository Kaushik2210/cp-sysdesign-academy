/* Fails (exit 1) on invalid frontmatter, unknown prerequisites/problems, duplicate orders, broken internal links. */
import fs from "node:fs";
import path from "node:path";
import { getAllLessons, getLessonSource } from "../src/lib/content/loader";

const errors: string[] = [];
let lessons: ReturnType<typeof getAllLessons> = [];
try {
  lessons = getAllLessons();
} catch (e) {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
}

const ids = new Set(lessons.map((l) => l.id));
const routes = new Set<string>(["/", "/cp/", "/sd/", "/dashboard/", "/review/", ...lessons.map((l) => l.href)]);
const problemsDir = path.join(process.cwd(), "content", "problems");

const seen = new Map<string, string>();
for (const l of lessons) {
  const key = `${l.track}/${l.module}#${l.order}`;
  if (seen.has(key)) errors.push(`${l.id}: duplicate order ${l.order} (also ${seen.get(key)})`);
  seen.set(key, l.id);

  for (const p of l.prerequisites) if (!ids.has(p)) errors.push(`${l.id}: unknown prerequisite "${p}"`);
  for (const p of l.problems) {
    if (!fs.existsSync(path.join(problemsDir, `${p}.json`))) errors.push(`${l.id}: unknown problem "${p}"`);
  }

  const src = getLessonSource(l);
  const links = [...src.matchAll(/\]\((\/[^)#\s]*)(?:#[^)]*)?\)|href="(\/[^"#]*)(?:#[^"]*)?"/g)];
  for (const m of links) {
    const target = (m[1] ?? m[2]).replace(/\/?$/, "/");
    if (!routes.has(target)) errors.push(`${l.id}: broken internal link ${m[1] ?? m[2]}`);
  }
}

if (errors.length) {
  console.error(`Content validation failed:\n - ${errors.join("\n - ")}`);
  process.exit(1);
}
console.log(`Content OK: ${lessons.length} lessons validated.`);
