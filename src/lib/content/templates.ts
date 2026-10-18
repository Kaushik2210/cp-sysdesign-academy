import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/** A copy-paste algorithm template. Each template is a complete program per language, executed in CI. */
export const templateMetaSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(20),
  complexity: z.string().min(2),
  tags: z.array(z.string()).min(1),
  /** Lesson ids that teach the technique (may be empty while the lesson is planned). */
  lessons: z.array(z.string()).default([]),
  /** Markdown: how to adapt and use the template, and its pitfalls. */
  usage: z.string().min(20),
  /** stdin -> stdout cases the template program must pass. */
  tests: z.array(z.object({ input: z.string(), output: z.string() })).min(3),
});

export interface Template extends z.infer<typeof templateMetaSchema> {
  slug: string;
  code: { python: string; java: string; cpp: string };
}

const DIR = path.join(process.cwd(), "content", "templates");

export function getTemplates(): Template[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(DIR, d.name);
      const meta = templateMetaSchema.parse(JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8")));
      const read = (f: string) => {
        const file = path.join(dir, f);
        if (!fs.existsSync(file)) throw new Error(`Template ${d.name} is missing ${f}`);
        return fs.readFileSync(file, "utf8");
      };
      return { ...meta, slug: d.name, code: { python: read("main.py"), java: read("Main.java"), cpp: read("main.cpp") } };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}