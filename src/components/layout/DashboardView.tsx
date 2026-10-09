"use client";

import { useRef } from "react";
import { useProgress } from "@/lib/store";

interface Mod {
  track: string;
  slug: string;
  title: string;
  lessons: { id: string; minutes: number }[];
}

export function DashboardView({ modules }: { modules: Mod[] }) {
  const { completed, exportJson, importJson } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const all = modules.flatMap((m) => m.lessons);
  const remaining = all.filter((l) => !completed[l.id]).reduce((n, l) => n + l.minutes, 0);

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportJson()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "academy-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 space-y-6">
      <p className="text-muted-fg">
        {Object.keys(completed).length} of {all.length} lessons complete · about{" "}
        {Math.round(remaining / 60)} h of material left.
      </p>
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
