import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  lessonSchema,
  moduleSchema,
  TRACKS,
  type CourseModule,
  type Lesson,
  type Track,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/** Load and validate every module and lesson of a track. Throws on invalid content. */
export function getModules(track: Track): CourseModule[] {
  const trackDir = path.join(CONTENT_DIR, track);
  const modules: CourseModule[] = [];
  for (const slug of readDirs(trackDir)) {
    const modDir = path.join(trackDir, slug);
    const metaPath = path.join(modDir, "_module.json");
    if (!fs.existsSync(metaPath)) throw new Error(`Missing _module.json in ${modDir}`);
    const meta = moduleSchema.parse(JSON.parse(fs.readFileSync(metaPath, "utf8")));

    const lessons: Lesson[] = fs
      .readdirSync(modDir)
      .filter((f) => f.endsWith(".mdx"))
      .map((file) => {
        const lessonSlug = file.replace(/\.mdx$/, "");
        const raw = fs.readFileSync(path.join(modDir, file), "utf8");
        const parsed = lessonSchema.safeParse(matter(raw).data);
        if (!parsed.success) {
          throw new Error(`Invalid frontmatter in ${track}/${slug}/${file}: ${parsed.error.message}`);
        }
        const fm = parsed.data;
        if (fm.track !== track || fm.module !== slug) {
          throw new Error(`Frontmatter track/module mismatch in ${track}/${slug}/${file}`);
        }
        const id = `${track}/${slug}/${lessonSlug}`;
        return { ...fm, id, slug: lessonSlug, href: `/${id}/` };
      })
      .sort((a, b) => a.order - b.order);

    modules.push({ ...meta, track, slug, lessons });
  }
  return modules.sort((a, b) => a.order - b.order);
}

export function getAllLessons(track?: Track): Lesson[] {
  return (track ? [track] : [...TRACKS]).flatMap((t) => getModules(t).flatMap((m) => m.lessons));
}

export function getLessonSource(lesson: Lesson): string {
  const file = path.join(CONTENT_DIR, lesson.track, lesson.module, `${lesson.slug}.mdx`);
  return matter(fs.readFileSync(file, "utf8")).content;
}

/** Previous/next lesson within the whole track, in curriculum order. */
export function getNeighbours(lesson: Lesson): { prev?: Lesson; next?: Lesson } {
  const all = getAllLessons(lesson.track);
  const i = all.findIndex((l) => l.id === lesson.id);
  return { prev: all[i - 1], next: all[i + 1] };
}

export interface Heading {
  depth: 2 | 3;
  text: string;
  id: string;
}
