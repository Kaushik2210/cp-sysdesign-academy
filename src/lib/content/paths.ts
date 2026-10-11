import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { getModules } from "./loader";
import { TRACKS, type Lesson } from "./schema";

const pathSchema = z.object({
  title: z.string(),
  description: z.string(),
  track: z.enum(TRACKS),
  days: z.number().int().positive(),
  /** Module slugs in order. Slugs with no written lessons yet are skipped. */
  modules: z.array(z.string()).min(1),
});

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  track: (typeof TRACKS)[number];
  targetDays: number;
  /** Generated plan: lessons spread over days (never more days than lessons). */
  days: { day: number; lessons: Pick<Lesson, "id" | "title" | "href" | "estMinutes">[] }[];
  totalLessons: number;
  totalMinutes: number;
  plannedModules: number;
  availableModules: number;
}

const DIR = path.join(process.cwd(), "content", "paths");

export function getPaths(): LearningPath[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((file) => {
      const slug = file.replace(/\.json$/, "");
      const spec = pathSchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")));
      const bySlug = new Map(getModules(spec.track).map((m) => [m.slug, m]));
      const lessons = spec.modules.flatMap((m) => bySlug.get(m)?.lessons ?? []);
      const nDays = Math.max(1, Math.min(spec.days, lessons.length));
      const days: LearningPath["days"] = Array.from({ length: nDays }, (_, i) => ({ day: i + 1, lessons: [] }));
      lessons.forEach((l, i) => {
        // Even spread: lesson i goes to floor(i * nDays / n)
        const d = Math.floor((i * nDays) / lessons.length);
        days[d].lessons.push({ id: l.id, title: l.title, href: l.href, estMinutes: l.estMinutes });
      });
      return {
        slug,
        title: spec.title,
        description: spec.description,
        track: spec.track,
        targetDays: spec.days,
        days,
        totalLessons: lessons.length,
        totalMinutes: lessons.reduce((n, l) => n + l.estMinutes, 0),
        plannedModules: spec.modules.length,
        availableModules: spec.modules.filter((m) => bySlug.get(m)?.lessons.length).length,
      };
    });
}
