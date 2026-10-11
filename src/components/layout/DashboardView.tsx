"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/store";
import { dueCards } from "@/lib/srs/sm2";
import { computeAchievements, currentStreak, longestStreak, weakestTopics } from "@/lib/achievements";
import { cn } from "@/lib/utils";

interface Mod {
  track: string;
  slug: string;
  title: string;
  lessons: { id: string; minutes: number }[];
}

const WEEKS = 20;

function StreakCalendar({ activity }: { activity: Record<string, number> }) {
  const today = new Date();
  const cells: { day: string; n: number }[] = [];
  const start = new Date(today.getTime() - (WEEKS * 7 - 1) * 86_400_000);
  for (let i = 0; i < WEEKS * 7; i++) {
    const day = new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    cells.push({ day, n: activity[day] ?? 0 });
  }
  return (
    <div
      role="img"
      aria-label={`Activity over the last ${WEEKS} weeks`}
      className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto"
    >
      {cells.map((c) => (
        <div
          key={c.day}
          title={`${c.day}: ${c.n} activities`}
          className={cn(
            "h-3 w-3 rounded-sm bg-muted",
            c.n > 0 && "bg-accent/40",
            c.n > 2 && "bg-accent/70",
            c.n > 5 && "bg-accent",
          )}
        />
      ))}
    </div>
  );
}

export function DashboardView({ modules }: { modules: Mod[] }) {
  const state = useProgress();
  const { completed, exportJson, importJson } = state;
  const fileRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const all = modules.flatMap((m) => m.lessons);
  const remaining = all.filter((l) => !completed[l.id]).reduce((n, l) => n + l.minutes, 0);
  const due = dueCards(Object.values(state.cards)).length;
  const weak = weakestTopics(state);
  const achievements = computeAchievements(state);
  const solved = Object.values(state.problems).filter((p) => p.solved).length;

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "academy-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stat = "rounded-xl border border-border bg-card p-4";
  return (
    <div className="mt-6 space-y-8">
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={stat}>
          <div className="text-2xl font-bold">
            {Object.keys(completed).length}/{all.length}
          </div>
          <div className="text-sm text-muted-fg">lessons done</div>
        </div>
        <div className={stat}>
          <div className="text-2xl font-bold">{solved}</div>
          <div className="text-sm text-muted-fg">problems solved</div>
        </div>
        <div className={stat}>
          <div className="text-2xl font-bold">
            {currentStreak(state.activity)} <span className="text-sm font-normal">best {longestStreak(state.activity)}</span>
          </div>
          <div className="text-sm text-muted-fg">day streak</div>
        </div>
        <Link href="/review/" className={cn(stat, "hover:border-accent")}>
          <div className="text-2xl font-bold">{due}</div>
          <div className="text-sm text-muted-fg">cards to review</div>
        </Link>
      </section>

      <p className="text-muted-fg">About {Math.round(remaining / 60)} h of lesson material left.</p>

      <section aria-labelledby="cal">
        <h2 id="cal" className="mb-2 text-lg font-semibold">
          Activity
        </h2>
        <StreakCalendar activity={state.activity} />
      </section>

      <section aria-labelledby="prog">
        <h2 id="prog" className="mb-2 text-lg font-semibold">
          Progress by module
        </h2>
        <ul className="space-y-3">
          {modules.map((m) => {
            const done = m.lessons.filter((l) => completed[l.id]).length;
            const pct = m.lessons.length ? (done / m.lessons.length) * 100 : 0;
            return (
              <li key={`${m.track}/${m.slug}`}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>
                    <span className="uppercase text-muted-fg">{m.track}</span> · {m.title}
                  </span>
                  <span className="text-muted-fg">
                    {done}/{m.lessons.length}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-muted">
                  <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="weak">
        <h2 id="weak" className="mb-2 text-lg font-semibold">
          Weakest topics
        </h2>
        {weak.length === 0 ? (
          <p className="text-sm text-muted-fg">Solve problems and take quizzes to see where to focus.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {weak.map((w) => (
              <li key={w.tag}>
                <b>{w.tag}</b>{" "}
                <span className="text-muted-fg">
                  {w.miss} misses over {w.total} attempts
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ach">
        <h2 id="ach" className="mb-2 text-lg font-semibold">
          Achievements
        </h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {achievements.map((a) => (
            <li
              key={a.id}
              className={cn("rounded-lg border border-border p-3 text-sm", a.earned ? "border-accent" : "opacity-60")}
            >
              <p className="font-medium">
                {a.earned ? "★ " : "☆ "}
                {a.title}
              </p>
              <p className="text-xs text-muted-fg">{a.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-2">
        <button type="button" onClick={download} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Export progress
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
          Import progress
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          aria-label="Import progress file"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) importJson(await f.text());
          }}
        />
      </div>
    </div>
  );
}
