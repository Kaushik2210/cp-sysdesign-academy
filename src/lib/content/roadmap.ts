import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const stepSchema = z.discriminatedUnion("kind", [
  /** A lesson on this site ("track/module/slug"). */
  z.object({ kind: z.literal("lesson"), ref: z.string() }),
  /** An interactive page on this site, such as the pattern library. */
  z.object({ kind: z.literal("page"), title: z.string(), href: z.string().startsWith("/"), note: z.string().optional() }),
  /** A book, course, paper or practice site outside this project. */
  z.object({
    kind: z.literal("external"),
    title: z.string(),
    url: z.string().url(),
    type: z.enum(["book", "course", "video", "docs", "paper", "practice", "article"]),
    note: z.string().optional(),
  }),
  /** Something you build. Shipped work is the strongest signal for early-career candidates. */
  z.object({ kind: z.literal("project"), title: z.string(), brief: z.string().min(20), deliverable: z.string().min(10) }),
  /** Content this site does not have yet. Shown honestly rather than hidden. */
  z.object({ kind: z.literal("planned"), title: z.string(), note: z.string().min(10) }),
]);

export const phaseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().positive(),
  title: z.string().min(3),
  goal: z.string().min(20),
  /** Calendar window and effort, e.g. "Months 1-4". */
  when: z.string(),
  hoursPerWeek: z.number().int().positive().max(60),
  /** Market insight ids that justify this phase. */
  whyNow: z.array(z.string()).default([]),
  steps: z.array(stepSchema).min(3),
  /** Observable checkpoints: you can tell whether you are done. */
  exit: z.array(z.string().min(10)).min(2),
});
export type Phase = z.infer<typeof phaseSchema>;
export type Step = Phase["steps"][number];

const DIR = path.join(process.cwd(), "content", "extras", "roadmap");

/** Phases live in content/extras/roadmap/NN-slug.json, one object per file. */
export function getRoadmap(): Phase[] {
  if (!fs.existsSync(DIR)) return [];
  const phases = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => phaseSchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))));
  const ids = new Set<string>();
  const orders = new Set<number>();
  for (const p of phases) {
    if (ids.has(p.id)) throw new Error(`Duplicate roadmap phase id "${p.id}"`);
    if (orders.has(p.order)) throw new Error(`Duplicate roadmap phase order ${p.order}`);
    ids.add(p.id);
    orders.add(p.order);
    const keys = new Set<string>();
    for (const s of p.steps) {
      if (s.kind === "lesson") continue; // lessons are tracked by lesson id
      const key = stepKey(p.id, s.title);
      if (keys.has(key)) throw new Error(`Duplicate step title in roadmap phase "${p.id}": "${s.title}"`);
      keys.add(key);
    }
  }
  return phases.sort((a, b) => a.order - b.order);
}

/** Stable key for progress tracking. Derived from the step title, so inserting or reordering steps never shifts saved ticks. */
export const stepKey = (phaseId: string, title: string) =>
  `${phaseId}:${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;