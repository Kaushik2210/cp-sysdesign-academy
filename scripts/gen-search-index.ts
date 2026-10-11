/* Builds public/search-index.json (lessons, problems, and optional glossary/templates). */
import fs from "node:fs";
import path from "node:path";
import { getAllLessons, getLessonSource } from "../src/lib/content/loader";
import { getAllProblems } from "../src/lib/content/problems";
import { extractHeadings } from "../src/lib/content/toc";

export interface SearchDoc {
  id: string;
  kind: "lesson" | "problem" | "glossary" | "template";
  title: string;
  href: string;
  tags: string;
  text: string;
}

const strip = (md: string) =>
  md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const docs: SearchDoc[] = [];
const lessons = getAllLessons();
const problemHref = new Map<string, string>();

for (const l of lessons) {
  const src = getLessonSource(l);
  const heads = extractHeadings(src)
    .map((h) => h.text)
    .join(" ");
  docs.push({
    id: l.id,
    kind: "lesson",
    title: l.title,
    href: l.href,
    tags: l.tags.join(" "),
    text: `${heads} ${strip(src).slice(0, 1200)}`,
  });
  for (const p of l.problems) if (!problemHref.has(p)) problemHref.set(p, l.href);
}

for (const p of getAllProblems()) {
  const href = problemHref.get(p.id);
  if (!href) continue;
  docs.push({
    id: `problem:${p.id}`,
    kind: "problem",
    title: p.title,
    href,
    tags: p.tags.join(" "),
    text: `rating ${p.rating} ${strip(p.statement)}`,
  });
}

// Optional extras: content/extras/glossary.json = [{ term, definition, href? }]
const glossary = path.join(process.cwd(), "content", "extras", "glossary.json");
if (fs.existsSync(glossary)) {
  const terms = JSON.parse(fs.readFileSync(glossary, "utf8")) as {
    term: string;
    definition: string;
    href?: string;
  }[];
  for (const t of terms) {
    docs.push({
      id: `glossary:${t.term}`,
      kind: "glossary",
      title: t.term,
      href: t.href ?? "/sd/glossary/",
      tags: "glossary",
      text: t.definition,
    });
  }
}

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/search-index.json", JSON.stringify(docs));
console.log(`search index: ${docs.length} documents`);
