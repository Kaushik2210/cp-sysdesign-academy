import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const numbersSchema = z.object({
  /** Orders of magnitude, mirrored from the estimation lesson. `ns` is the central estimate. */
  latency: z.array(z.object({ id: z.string(), operation: z.string(), ns: z.number().positive(), range: z.string(), note: z.string().optional() })).min(8),
  powers: z.array(z.object({ exp: z.number().int().min(1).max(64), use: z.string() })).min(6),
  sizes: z.array(z.object({ item: z.string(), size: z.string(), note: z.string().optional() })).min(6),
  rules: z.array(z.object({ rule: z.string(), why: z.string() })).min(4),
});
export type NumbersSheet = z.infer<typeof numbersSchema>;

export function getNumbersSheet(): NumbersSheet {
  const file = path.join(process.cwd(), "content", "extras", "cheatsheets", "numbers.json");
  return numbersSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
}