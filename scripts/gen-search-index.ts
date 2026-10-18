/* Builds public/search-index.json (lessons, problems, patterns, templates and glossary terms). */
import fs from "node:fs";
import { getAllLessons, getLessonSource } from "../src/lib/content/loader";
import { getAllProblems } from "../src/lib/content/problems";
import { getPatterns } from "../src/lib/content/patterns";
import { getTemplates } from "../src/lib/content/templates";
import { getGlossary } from "../src/lib/content/glossary";
import { extractHeadings } from "../src/lib/content/toc";

export interface SearchDoc {
  id: string;
  kind: "lesson" | "problem" | "glossary" | "template" | "pattern";
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

for (const p of getPatterns()) {
  docs.push({
    id: `pattern:${p.id}`,
    kind: "pattern",
    title: p.technique,
    href: "/patterns/",
    tags: p.tags.join(" "),
    text: `${p.signal} ${p.why}`,
  });
}

for (const tpl of getTemplates()) {
  docs.push({
    id: `template:${tpl.slug}`,
    kind: "template",
    title: tpl.title,
    href: `/templates/${tpl.slug}/`,
    tags: tpl.tags.join(" "),
    text: `${tpl.summary} ${tpl.complexity}`,
  });
}

for (const term of getGlossary()) {
  docs.push({
    id: `glossary:${term.id}`,
    kind: "glossary",
    title: term.term,
    href: `/glossary/#${term.id}`,
    tags: ["glossary", ...term.aliases].join(" "),
    text: term.definition,
  });
}

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/search-index.json", JSON.stringify(docs));
console.log(`search index: ${docs.length} documents`);
