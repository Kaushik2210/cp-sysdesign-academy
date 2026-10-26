import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const TOPICS = ["demand", "entry-level", "interviews", "skills", "india"] as const;
export type MarketTopic = (typeof TOPICS)[number];

export const TOPIC_TITLE: Record<MarketTopic, string> = {
  demand: "Overall demand",
  "entry-level": "The entry-level squeeze",
  interviews: "How interviews are changing",
  skills: "Skills and AI at work",
  india: "India campus and fresher market",
};

/** One sourced finding. Claims are paraphrased; the figure is the number the source reports. */
export const insightSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  topic: z.enum(TOPICS),
  finding: z.string().min(30),
  figure: z.string().optional(),
  /** What a learner should do differently because of it. */
  implication: z.string().min(20),
  source: z.object({
    name: z.string(),
    url: z.string().url(),
    /** primary = the organisation that collected the data; secondary = someone relaying it. */
    kind: z.enum(["primary", "secondary"]),
    published: z.string().optional(),
  }),
  /** high = primary data; medium = credible secondary; low = anecdotal or vendor marketing. */
  confidence: z.enum(["high", "medium", "low"]),
  /** Date this was last checked against the source (yyyy-mm-dd). */
  retrieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export type Insight = z.infer<typeof insightSchema>;

const DIR = path.join(process.cwd(), "content", "extras", "market");

/** Insights live in content/extras/market/*.json, one array per theme. */
export function getInsights(): Insight[] {
  if (!fs.existsSync(DIR)) return [];
  const all = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => z.array(insightSchema).parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))));
  const seen = new Set<string>();
  for (const i of all) {
    if (seen.has(i.id)) throw new Error(`Duplicate market insight id "${i.id}"`);
    seen.add(i.id);
  }
  return all;
}