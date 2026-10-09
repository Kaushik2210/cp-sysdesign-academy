import GithubSlugger from "github-slugger";
import type { Heading } from "./loader";

/** Extract h2/h3 headings (ids match rehype-slug) while skipping fenced code. */
export function extractHeadings(source: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fenced = false;
  for (const line of source.split("\n")) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^(#{1,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[`*_]/g, "");
    const id = slugger.slug(text);
    if (m[1].length > 1) out.push({ depth: m[1].length as 2 | 3, text, id });
  }
  return out;
}
