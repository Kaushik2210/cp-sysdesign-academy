import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/** One row of the Pattern Library: "when you see this signal, reach for this technique". */
export const patternSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  signal: z.string().min(10),
  technique: z.string().min(3),
  why: z.string().min(20),
  /** Typical complexity once the technique is applied. */
  complexity: z.string().min(2),
  tags: z.array(z.string()).min(1),
  /** Lesson ids ("cp/module/slug") that teach it. Empty means the lesson is planned. */
  lessons: z.array(z.string()).default([]),
  /** Typical constraint hint, e.g. "n up to 2*10^5". */
  constraints: z.string().optional(),
});
export type Pattern = z.infer<typeof patternSchema>;

const FILE = path.join(process.cwd(), "content", "extras", "patterns.json");

export function getPatterns(): Pattern[] {
  if (!fs.existsSync(FILE)) return [];
  const data = z.array(patternSchema).parse(JSON.parse(fs.readFileSync(FILE, "utf8")));
  const seen = new Set<string>();
  for (const p of data) {
    if (seen.has(p.id)) throw new Error(`Duplicate pattern id "${p.id}"`);
    seen.add(p.id);
  }
  return data;
}