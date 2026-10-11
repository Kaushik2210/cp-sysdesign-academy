/* Post-build link checker: every internal href/src in out/**.html must resolve to a file. Exit 1 on broken links. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (!fs.existsSync(OUT)) {
  console.error("out/ not found; run `pnpm build` first.");
  process.exit(1);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const exists = (url: string): boolean => {
  let p = decodeURIComponent(url.split("#")[0].split("?")[0]);
  if (base && p.startsWith(base)) p = p.slice(base.length) || "/";
  const full = path.join(OUT, p);
  return (
    fs.existsSync(full) &&
    (fs.statSync(full).isFile() || fs.existsSync(path.join(full, "index.html")))
  ) || fs.existsSync(full + ".html");
};

const broken = new Map<string, string[]>();
let checked = 0;
for (const file of walk(OUT).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?][^"]*|\/)"/g)) {
    const url = m[1];
    if (url.startsWith("//")) continue;
    checked++;
    if (!exists(url)) {
      const rel = path.relative(OUT, file);
      broken.set(url, [...(broken.get(url) ?? []), rel]);
    }
  }
}

if (broken.size) {
  for (const [url, pages] of broken) console.error(`BROKEN ${url}  (in ${pages.slice(0, 3).join(", ")})`);
  process.exit(1);
}
console.log(`check-links: ${checked} internal references OK`);
