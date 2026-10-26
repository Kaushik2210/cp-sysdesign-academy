/* Builds public/search-index.json (lessons, problems, patterns, templates and glossary terms). */
import fs from "node:fs";
import { getAllLessons, getLessonSource } from "../src/lib/content/loader";
import { getAllProblems } from "../src/lib/content/problems";
import { getPatterns } from "../src/lib/content/patterns";
import { getTemplates } from "../src/lib/content/templates";
import { getGlossary } from "../src/lib/content/glossary";
import { getInsights } from "../src/lib/content/market";
import { getRoadmap } from "../src/lib/content/roadmap";
import { getQuestions } from "../src/lib/content/questions";
import { getTradeoffSheets } from "../src/lib/content/tradeoffs";
import { extractHeadings } from "../src/lib/content/toc";

export interface SearchDoc {
  id: string;
  kind: "lesson" | "problem" | "glossary" | "template" | "pattern" | "market" | "roadmap" | "question" | "cheatsheet" | "sandbox";
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

for (const i of getInsights()) {
  docs.push({
    id: `market:${i.id}`,
    kind: "market",
    title: i.source.name,
    href: `/market/#${i.topic}`,
    tags: ["hiring", "market", i.topic].join(" "),
    text: `${i.finding} ${i.implication}`,
  });
}

for (const p of getRoadmap()) {
  docs.push({
    id: `roadmap:${p.id}`,
    kind: "roadmap",
    title: `Roadmap phase ${p.order}: ${p.title}`,
    href: `/roadmap/#${p.id}`,
    tags: "roadmap plan learning path",
    text: `${p.goal} ${p.when}`,
  });
}

for (const q of getQuestions()) {
  docs.push({
    id: `question:${q.id}`,
    kind: "question",
    title: q.title,
    href: "/mock/",
    tags: ["interview", "mock", q.kind, q.level].join(" "),
    text: q.prompt,
  });
}

docs.push({
  id: "sandbox:consistent-hashing",
  kind: "sandbox",
  title: "Consistent hashing sandbox",
  href: "/sandbox/consistent-hashing/",
  tags: "sandbox simulator consistent hashing ring virtual nodes sharding",
  text: "Add and remove nodes on a hash ring and see which keys move compared with hash mod N.",
});

docs.push({
  id: "sandbox:rate-limiter",
  kind: "sandbox",
  title: "Rate limiter sandbox",
  href: "/sandbox/rate-limiter/",
  tags: "sandbox simulator rate limiting token bucket fixed window sliding window",
  text: "Compare fixed window, sliding window and token bucket rate limiting on the same traffic.",
});

docs.push({
  id: "sandbox:cache",
  kind: "sandbox",
  title: "Cache eviction sandbox",
  href: "/sandbox/cache/",
  tags: "sandbox simulator cache eviction lru lfu fifo hit ratio",
  text: "Step through LRU, LFU and FIFO evictions and compare hit ratios on different traffic.",
});

docs.push({
  id: "sandbox:load-balancer",
  kind: "sandbox",
  title: "Load balancer sandbox",
  href: "/sandbox/load-balancer/",
  tags: "sandbox simulator load balancing round robin least connections power of two choices ip hash",
  text: "Compare round robin, least connections, power of two choices, weighted and hash-based load balancing on identical traffic.",
});

for (const s of getTradeoffSheets()) {
  docs.push({
    id: `cheatsheet:${s.id}`,
    kind: "cheatsheet",
    title: s.title,
    href: `/cheatsheets/tradeoffs/#${s.id}`,
    tags: ["cheatsheet", "trade-offs", ...s.tags].join(" "),
    text: `${s.summary} ${s.options.map((o) => o.name).join(" ")}`,
  });
}

docs.push({
  id: "cheatsheet:numbers",
  kind: "cheatsheet",
  title: "Numbers cheat sheet: latency, powers of two, availability nines",
  href: "/cheatsheets/numbers/",
  tags: "cheatsheet numbers latency estimation availability qps storage",
  text: "Latency numbers every engineer should know, powers of two, common sizes and estimators for traffic, storage, bandwidth and availability.",
});

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/search-index.json", JSON.stringify(docs));
console.log(`search index: ${docs.length} documents`);
