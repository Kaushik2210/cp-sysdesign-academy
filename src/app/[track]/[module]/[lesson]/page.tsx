import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllLessons, getLessonSource, getModules, getNeighbours } from "@/lib/content/loader";
import { extractHeadings } from "@/lib/content/toc";
import { TRACK_META, TRACKS, type Track } from "@/lib/content/schema";
import { Mdx } from "@/components/mdx/Mdx";
import { Sidebar } from "@/components/layout/Sidebar";
import { LessonActions, LessonNotes } from "@/components/layout/LessonActions";
import { TocSpy } from "@/components/layout/TocSpy";

const DIFFICULTY_TINT: Record<string, string> = { beginner: "leaf", easy: "cool", medium: "sun", hard: "hot", expert: "accent" };

type Params = { track: string; module: string; lesson: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllLessons().map((l) => ({ track: l.track, module: l.module, lesson: l.slug }));
}

function find(p: Params) {
  return getAllLessons().find((l) => l.id === `${p.track}/${p.module}/${p.lesson}`);
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const lesson = find(await params);
  return { title: lesson?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const p = await params;
  const lesson = find(p);
  if (!lesson || !TRACKS.includes(p.track as Track)) notFound();

  const modules = getModules(lesson.track);
  const mod = modules.find((m) => m.slug === lesson.module)!;
  const source = getLessonSource(lesson);
  const headings = extractHeadings(source);
  const { prev, next } = getNeighbours(lesson);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_14rem]">
      <div className="no-print lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
        <Sidebar
          currentId={lesson.id}
          modules={modules.map((m) => ({
            slug: m.slug,
            title: m.title,
            level: m.level,
            lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, href: l.href })),
          }))}
        />
      </div>

      <main className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
          <Link href={`/${lesson.track}/`} className="hover:text-fg">
            {TRACK_META[lesson.track].title}
          </Link>
          {" / "}
          <span>{mod.title}</span>
        </nav>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{lesson.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full px-2.5 py-1 text-white" style={{ background: `hsl(var(--${DIFFICULTY_TINT[lesson.difficulty] ?? "accent"}))` }}>
                {lesson.difficulty}
              </span>
              <span className="rounded-full border border-border bg-card/70 px-2.5 py-1">~{lesson.estMinutes} min</span>
              <span className="rounded-full border border-border bg-card/70 px-2.5 py-1">{lesson.type}</span>
            </p>
          </div>
          <LessonActions id={lesson.id} title={lesson.title} />
        </div>

        <article className="prose prose-neutral max-w-none dark:prose-invert">
          <Mdx source={source} />
        </article>

        <LessonNotes id={lesson.id} />

        {lesson.furtherReading.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="mb-2 text-lg font-semibold">Further reading</h2>
            <ul className="list-disc pl-5 text-sm">
              {lesson.furtherReading.map((r) => (
                <li key={r.url}>
                  <a className="text-accent underline" href={r.url} rel="noopener noreferrer">
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="Lesson navigation" className="no-print mt-10 flex justify-between gap-4">
          {prev ? (
            <Link href={prev.href} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-card/70 px-4 text-sm font-medium transition hover:-translate-x-0.5 hover:border-hot hover:bg-muted">
              <ChevronLeft size={16} aria-hidden /> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-gradient-brand px-4 text-sm font-semibold text-white shadow-lg transition hover:translate-x-0.5 hover:shadow-xl">
              {next.title} <ChevronRight size={16} aria-hidden />
            </Link>
          )}
        </nav>
      </main>

      <TocSpy headings={headings} />
    </div>
  );
}
