import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const KINDS = ["system-design", "low-level-design", "ai-coding", "behavioral"] as const;
export type QuestionKind = (typeof KINDS)[number];

export const KIND_TITLE: Record<QuestionKind, string> = {
  "system-design": "System design",
  "low-level-design": "Low-level design",
  "ai-coding": "AI-assisted coding",
  behavioral: "Behavioral and projects",
};

export const questionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(KINDS),
  level: z.enum(["junior", "mid", "senior"]),
  title: z.string().min(3),
  /** What the interviewer says. */
  prompt: z.string().min(20),
  /** Questions a strong candidate asks first. */
  clarify: z.array(z.string().min(5)).min(2),
  /** What a strong answer covers, in a sensible order. */
  strongAnswer: z.array(z.string().min(15)).min(4),
  /** Mistakes seen most often on this question. */
  pitfalls: z.array(z.string().min(10)).min(2),
  minutes: z.number().int().min(10).max(60),
  /** Lesson ids ("track/module/slug") to study. */
  related: z.array(z.string()).default([]),
});
export type Question = z.infer<typeof questionSchema>;

const DIR = path.join(process.cwd(), "content", "extras", "questions");

/** Questions live in content/extras/questions/*.json (arrays), except rubric.json. */
export function getQuestions(): Question[] {
  if (!fs.existsSync(DIR)) return [];
  const all = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json") && f !== "rubric.json")
    .sort()
    .flatMap((f) => z.array(questionSchema).parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))));
  const seen = new Set<string>();
  for (const q of all) {
    if (seen.has(q.id)) throw new Error(`Duplicate question id "${q.id}"`);
    seen.add(q.id);
  }
  return all;
}

/** Scoring dimensions per question kind. Scores run 1 (not shown) to 4 (excellent). */
export const rubricSchema = z.object({
  anchors: z.object({ "1": z.string(), "2": z.string(), "3": z.string(), "4": z.string() }),
  dimensions: z.record(
    z.enum(KINDS),
    z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), label: z.string(), good: z.string().min(15) })).min(3),
  ),
});
export type Rubric = z.infer<typeof rubricSchema>;

export function getRubric(): Rubric {
  return rubricSchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, "rubric.json"), "utf8")));
}