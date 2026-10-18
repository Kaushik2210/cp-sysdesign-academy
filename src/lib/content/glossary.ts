import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/** One glossary entry. `related` and `lessons` are validated by `pnpm validate`. */
export const termSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  term: z.string().min(2),
  /** One or two precise sentences. */
  definition: z.string().min(25),
  aliases: z.array(z.string()).default([]),
  /** Ids of other glossary terms. */
  related: z.array(z.string()).default([]),
  /** Lesson ids ("sd/module/slug") that explain it in depth. */
  lessons: z.array(z.string()).default([]),
});
export type GlossaryTerm = z.infer<typeof termSchema>;

/** Terms live in content/extras/glossary/*.json, one array per topic. */
const DIR = path.join(process.cwd(), "content", "extras", "glossary");

export function getGlossary(): GlossaryTerm[] {
  if (!fs.existsSync(DIR)) return [];
  const terms = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => z.array(termSchema).parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))));
  const seen = new Set<string>();
  for (const t of terms) {
    if (seen.has(t.id)) throw new Error(`Duplicate glossary id "${t.id}"`);
    seen.add(t.id);
  }
  return terms.sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }));
}