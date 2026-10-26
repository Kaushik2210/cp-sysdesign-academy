import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const sheetSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(5),
    /** One sentence: what decision this sheet helps with. */
    summary: z.string().min(20),
    options: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), name: z.string() })).min(2).max(3),
    /** Each row compares every option on one dimension. */
    rows: z.array(z.object({ dimension: z.string(), values: z.record(z.string(), z.string().min(3)) })).min(4),
    /** When to choose each option. */
    choose: z.record(z.string(), z.array(z.string().min(8)).min(2)),
    watchOut: z.array(z.string().min(15)).min(1),
    tags: z.array(z.string()).min(1),
    lessons: z.array(z.string()).default([]),
  })
  .superRefine((s, ctx) => {
    const ids = s.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "duplicate option ids" });
    for (const row of s.rows) {
      const keys = Object.keys(row.values).sort().join(",");
      if (keys !== [...ids].sort().join(",")) ctx.addIssue({ code: "custom", message: `row "${row.dimension}" must have exactly one value per option` });
    }
    for (const id of ids) if (!s.choose[id]) ctx.addIssue({ code: "custom", message: `missing "choose" guidance for option "${id}"` });
    for (const id of Object.keys(s.choose)) if (!ids.includes(id)) ctx.addIssue({ code: "custom", message: `"choose" has unknown option "${id}"` });
  });
export type TradeoffSheet = z.infer<typeof sheetSchema>;

const DIR = path.join(process.cwd(), "content", "extras", "cheatsheets", "tradeoffs");

/** Sheets live in content/extras/cheatsheets/tradeoffs/*.json (arrays). */
export function getTradeoffSheets(): TradeoffSheet[] {
  if (!fs.existsSync(DIR)) return [];
  const all = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => z.array(sheetSchema).parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))));
  const seen = new Set<string>();
  for (const s of all) {
    if (seen.has(s.id)) throw new Error(`Duplicate trade-off sheet id "${s.id}"`);
    seen.add(s.id);
  }
  return all;
}