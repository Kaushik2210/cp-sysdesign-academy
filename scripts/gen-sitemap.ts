/* Writes public/sitemap.xml, public/robots.txt and public/stats.json (lesson/problem counts for badges). */
import fs from "node:fs";
import { getAllLessons } from "../src/lib/content/loader";
import { getAllProblems } from "../src/lib/content/problems";
import { getTemplates } from "../src/lib/content/templates";

const site = (process.env.SITE_URL ?? "https://example.github.io").replace(/\/$/, "");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const lessons = getAllLessons();
const paths = ["/", "/cp/", "/sd/", "/dashboard/", "/review/", "/paths/", "/patterns/", "/templates/", "/glossary/", "/market/", "/roadmap/", "/mock/", "/sandbox/", "/sandbox/consistent-hashing/", "/sandbox/rate-limiter/", "/cheatsheets/", "/cheatsheets/numbers/", "/cheatsheets/tradeoffs/", ...getTemplates().map((t) => `/templates/${t.slug}/`), ...lessons.map((l) => l.href)];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  paths.map((p) => `  <url><loc>${site}${base}${p}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/sitemap.xml", xml);
fs.writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site}${base}/sitemap.xml\n`);
const stats = {
  lessons: lessons.length,
  problems: getAllProblems().length,
  cp: lessons.filter((l) => l.track === "cp").length,
  sd: lessons.filter((l) => l.track === "sd").length,
};
fs.writeFileSync("public/stats.json", JSON.stringify(stats));
console.log(`sitemap: ${paths.length} urls; stats:`, JSON.stringify(stats));
