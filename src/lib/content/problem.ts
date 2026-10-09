import { z } from "zod";

export const COMPLEXITY_CLASSES = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(n^3)",
  "O(2^n)",
  "O(n!)",
] as const;

const lang = z.enum(["python", "javascript", "cpp", "java"]);

export const problemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  /** Where the idea comes from. Statements are always original. */
  source: z.object({ name: z.string(), url: z.string().url().optional() }).optional(),
  rating: z.number().int().min(800).max(3500),
  tags: z.array(z.string()).min(1),
  statement: z.string().min(40),
  constraints: z.array(z.string()).min(1),
  timeLimitMs: z.number().int().positive().default(2000),
  tests: z
    .array(z.object({ input: z.string(), output: z.string(), hidden: z.boolean().default(false) }))
    .min(5),
  hints: z.tuple([z.string(), z.string(), z.string()]),
  editorial: z.string().min(40),
  complexity: z.object({ time: z.enum(COMPLEXITY_CLASSES), space: z.enum(COMPLEXITY_CLASSES) }),
  starter: z.record(lang, z.string()).refine((s) => !!s.python, "python starter is required"),
  /** Reference solutions; every one is executed by `pnpm verify`. */
  solutions: z.record(lang, z.string()).refine((s) => !!s.python, "python solution is required"),
});

export type ProblemData = z.infer<typeof problemSchema>;
