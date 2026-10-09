import Link from "next/link";
import { notFound } from "next/navigation";
import { getModules } from "@/lib/content/loader";
import { TRACK_META, TRACKS, type Track } from "@/lib/content/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKS.map((track) => ({ track }));
}

export async function generateMetadata({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  return { title: TRACK_META[track as Track]?.title ?? "Track" };
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  if (!TRACKS.includes(track as Track)) notFound();
  const meta = TRACK_META[track as Track];
  const modules = getModules(track as Track);
  const levels = [...new Set(modules.map((m) => m.level))];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">{meta.title}</h1>
      <p className="mt-2 text-muted-fg">{meta.tagline}</p>
      {levels.map((level) => (
        <section key={level} className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">{level}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {modules
              .filter((m) => m.level === level)
              .map((m) => (
                <li key={m.slug} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-semibold">
                    {m.order}. {m.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-fg">{m.summary}</p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {m.lessons.map((l) => (
                      <li key={l.id}>
                        <Link href={l.href} className="text-accent hover:underline">
                          {l.title}
                        </Link>{" "}
                        <span className="text-muted-fg">· {l.estMinutes} min</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
