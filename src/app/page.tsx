import Link from "next/link";
import { getAllLessons, getModules } from "@/lib/content/loader";
import { TRACK_META, TRACKS } from "@/lib/content/schema";
import { ContinueCard } from "@/components/layout/ContinueCard";

export default function Home() {
  const lessons = getAllLessons();
  const lookup = Object.fromEntries(lessons.map((l) => [l.id, { title: l.title, href: l.href }]));
  const stats = [
    { label: "Lessons", value: lessons.length },
    { label: "Modules", value: TRACKS.reduce((n, t) => n + getModules(t).length, 0) },
    { label: "Problems", value: lessons.reduce((n, l) => n + l.problems.length, 0) },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <section>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Learn competitive programming and system design, interactively.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-fg">
          A free, open-source course that runs entirely in your browser. Progress is saved locally,
          nothing to sign up for.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cp/" className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg">
            Start with CP
          </Link>
          <Link href="/sd/" className="rounded-md border border-border px-4 py-2 font-medium hover:bg-muted">
            Start with System Design
          </Link>
        </div>
        <ContinueCard lessons={lookup} />
      </section>

      <section aria-label="Tracks" className="mt-16 grid gap-6 md:grid-cols-2">
        {TRACKS.map((t) => {
          const mods = getModules(t);
          return (
            <Link key={t} href={`/${t}/`} className="rounded-xl border border-border bg-card p-6 hover:border-accent">
              <h2 className="text-xl font-semibold">{TRACK_META[t].title}</h2>
              <p className="mt-2 text-sm text-muted-fg">{TRACK_META[t].tagline}</p>
              <ol className="mt-4 space-y-1 text-sm">
                {mods.slice(0, 6).map((m) => (
                  <li key={m.slug}>
                    <span className="text-muted-fg">{m.level} ·</span> {m.title}
                  </li>
                ))}
              </ol>
            </Link>
          );
        })}
      </section>

      <section aria-label="Stats" className="mt-16 grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-4">
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-fg">{s.label}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
