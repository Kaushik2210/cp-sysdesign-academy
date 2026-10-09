import { z } from "zod";

export const TRACKS = ["cp", "sd"] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_META: Record<Track, { title: string; tagline: string }> = {
  cp: {
    title: "Competitive Programming",
    tagline: "From your first accepted solution to red-coder techniques.",
  },
  sd: {
    title: "System Design",
    tagline: "From client-server basics to HLD, LLD and real-world case studies.",
  },
};

export const lessonSchema = z.object({
  title: z.string().min(3),
  track: z.enum(TRACKS),
  module: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().positive(),
  difficulty: z.enum(["beginner", "easy", "medium", "hard", "expert"]),
  estMinutes: z.number().int().positive().max(240),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  type: z.enum(["lesson", "problem", "quiz", "case-study", "project"]),
  problems: z.array(z.string()).default([]),
  furtherReading: z
    .array(z.object({ title: z.string(), url: z.string().url() }))
    .default([]),
});
export type LessonFrontmatter = z.infer<typeof lessonSchema>;

export const moduleSchema = z.object({
  title: z.string().min(3),
  level: z.string(),
  order: z.number().int().positive(),
  summary: z.string().min(10),
});
export type ModuleMeta = z.infer<typeof moduleSchema>;

export interface Lesson extends LessonFrontmatter {
  /** "track/module/slug" */
  id: string;
  slug: string;
  href: string;
}

export interface CourseModule extends ModuleMeta {
  track: Track;
  slug: string;
  lessons: Lesson[];
}
