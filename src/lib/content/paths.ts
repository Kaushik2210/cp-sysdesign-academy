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
  /** Published modules in track order, or an explicit ordered selection. */
  modules: z.union([z.literal("all"), z.array(z.string()).min(1)]),
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
      const published = getModules(spec.track).filter((module) => module.lessons.length > 0);
      const bySlug = new Map(published.map((module) => [module.slug, module]));
      const moduleSlugs = spec.modules === "all" ? [...bySlug.keys()] : spec.modules;
      if (new Set(moduleSlugs).size !== moduleSlugs.length) {
        throw new Error(`Learning path "${slug}" lists a module more than once`);
      }
      const lessons = moduleSlugs.flatMap((moduleSlug) => {
        const courseModule = bySlug.get(moduleSlug);
        if (!courseModule) throw new Error(`Learning path "${slug}" references unpublished module "${spec.track}/${moduleSlug}"`);
        return courseModule.lessons;
      });
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
        plannedModules: moduleSlugs.length,
        availableModules: moduleSlugs.length,
      };
    });
}
