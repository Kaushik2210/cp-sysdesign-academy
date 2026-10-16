/* Checks every external URL found in content/ (lesson MDX, problem JSON). Not part of CI (network flakiness);
 * run manually: `pnpm check-external`. Exit 1 only on definite failures (404/410/DNS); 403/429/5xx are warnings. */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

// Allows balanced "(...)" inside URLs (e.g. Wikipedia titles) but stops at a closing paren of markdown links.
const urlRe = /https?:\/\/(?:[^\s()"'<>\]`\\]|\([^\s()]*\))+/g;
const where = new Map<string, Set<string>>();
for (const f of walk(ROOT).filter((x) => /\.(mdx|json)$/.test(x))) {
  const text = fs.readFileSync(f, "utf8");
  for (const m of text.matchAll(urlRe)) {
    const url = m[0].replace(/[.,;:]+$/, "");
    if (!where.has(url)) where.set(url, new Set());
    where.get(url)!.add(path.relative(ROOT, f));
  }
}

async function check(url: string): Promise<{ url: string; status: number | string }> {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "Mozilla/5.0 (link-checker for cp-sysdesign-academy)" },
      });
      if (res.status !== 405 && !(method === "HEAD" && res.status >= 400)) return { url, status: res.status };
      if (method === "GET") return { url, status: res.status };
    } catch (e) {
      if (method === "GET") return { url, status: String((e as Error).cause ?? e).slice(0, 60) };
    }
  }
  return { url, status: "unknown" };
}

async function main() {
  const urls = [...where.keys()];
  const results: { url: string; status: number | string }[] = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (i < urls.length) results.push(await check(urls[i++]));
    }),
  );
  const hard = results.filter((r) => r.status === 404 || r.status === 410 || typeof r.status === "string");
  const soft = results.filter((r) => typeof r.status === "number" && r.status >= 400 && !hard.includes(r));
  for (const r of hard) console.error(`DEAD ${r.status} ${r.url}\n     in ${[...where.get(r.url)!].slice(0, 3).join(", ")}`);
  for (const r of soft) console.warn(`WARN ${r.status} ${r.url}`);
  console.log(`checked ${urls.length} urls: ${hard.length} dead, ${soft.length} warnings`);
  if (hard.length) process.exit(1);
}

main();
