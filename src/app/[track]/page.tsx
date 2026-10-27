import { notFound } from "next/navigation";
import { Clock, Layers3 } from "lucide-react";
import { getModules } from "@/lib/content/loader";
import { TRACK_META, TRACKS, type Track } from "@/lib/content/schema";
import { ModuleCard } from "@/components/layout/ModuleCard";
import { TrackProgress } from "@/components/layout/TrackProgress";
import { Reveal } from "@/components/fx/Reveal";
import type { Tint } from "@/components/fx/Spotlight";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((track) => ({ track }));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  return { title: TRACK_META[track as Track]?.title ?? "Track" };
}

const TRACK_TINT: Record<Track, Tint> = { cp: "hot", sd: "cool" };
const LEVEL_TINTS: Tint[] = ["leaf", "cool", "accent", "sun", "hot"];

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  if (!TRACKS.includes(track as Track)) notFound();
  const meta = TRACK_META[track as Track];
  const modules = getModules(track as Track);
  const levels = [...new Set(modules.map((m) => m.level))];
  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  const minutes = modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.estMinutes, 0), 0);
  const tint = TRACK_TINT[track as Track];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur sm:p-8" style={{ ["--tint" as string]: `var(--${tint})` }}>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          <span className="text-gradient">{meta.title}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-fg">{meta.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
          <TrackProgress lessonIds={lessonIds} label={meta.title} />
          <p className="inline-flex items-center gap-2 text-sm text-muted-fg">
            <Layers3 size={16} aria-hidden /> {modules.length} modules
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-fg">
            <Clock size={16} aria-hidden /> about {Math.round(minutes / 60)} hours of lessons
          </p>
        </div>
      </header>
      {levels.map((level, li) => (
        <section key={level} className="mt-12">
          <h2 className="mb-4 flex items-center gap-3 text-xl font-extrabold tracking-tight">
            <span aria-hidden="true" className="h-6 w-1.5 rounded-full" style={{ background: `hsl(var(--${LEVEL_TINTS[li % LEVEL_TINTS.length]}))` }} />
            {level}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {modules
              .filter((m) => m.level === level)
              .map((m, i) => (
                <li key={m.slug}>
                  <Reveal delay={(i % 2) * 0.07} className="h-full">
                    <ModuleCard
                      module={{ order: m.order, title: m.title, summary: m.summary, lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, href: l.href, estMinutes: l.estMinutes })) }}
                      tint={LEVEL_TINTS[li % LEVEL_TINTS.length]}
                    />
                  </Reveal>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
