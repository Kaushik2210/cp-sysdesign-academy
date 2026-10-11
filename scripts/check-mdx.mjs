/* Compiles every lesson MDX file; prints one line per failure and exits 1 if any fail.
 * Plain ESM (not tsx) because next-mdx-remote/serialize needs native ESM resolution. Usage: node scripts/check-mdx.mjs [id-prefix] */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import { serialize } from "next-mdx-remote/serialize";

const only = process.argv[2];
const root = path.join(process.cwd(), "content");
const failures = [];
let count = 0;

for (const track of ["cp", "sd"]) {
  const tdir = path.join(root, track);
  if (!fs.existsSync(tdir)) continue;
  for (const mod of fs.readdirSync(tdir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const file of fs.readdirSync(path.join(tdir, mod.name)).filter((f) => f.endsWith(".mdx"))) {
      const id = `${track}/${mod.name}/${file.replace(/\.mdx$/, "")}`;
      if (only && !id.startsWith(only)) continue;
      count++;
      const src = matter(fs.readFileSync(path.join(tdir, mod.name, file), "utf8")).content;
      try {
        await serialize(src, { blockJS: false, mdxOptions: { remarkPlugins: [remarkGfm] } });
      } catch (e) {
        const msg = String(e && e.message ? e.message : e).split("\n").slice(0, 3).join(" ");
        failures.push(`${id}: MDX does not compile: ${msg}`);
      }
    }
  }
}

if (failures.length) {
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log(`MDX compiles: ${count} files`);