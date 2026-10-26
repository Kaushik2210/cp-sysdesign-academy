"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface SheetView {
  id: string;
  title: string;
  summary: string;
  options: { id: string; name: string }[];
  rows: { dimension: string; values: Record<string, string> }[];
  choose: Record<string, string[]>;
  watchOut: string[];
  tags: string[];
  lessons: { title: string; href: string }[];
}

/** Side-by-side trade-off sheets with search and topic filters. */
export function TradeoffSheets({ sheets }: { sheets: SheetView[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => [...new Set(sheets.flatMap((s) => s.tags))].sort(), [sheets]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sheets.filter((s) => {
      if (tag && !s.tags.includes(tag)) return false;
      if (!q) return true;
      const hay = `${s.title} ${s.summary} ${s.options.map((o) => o.name).join(" ")} ${s.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sheets, query, tag]);

  const chip = "min-h-11 rounded-full border border-border px-3 text-sm hover:bg-muted";

  return (
    <div className="mt-6">
      <div className="no-print">
        <label htmlFor="tradeoff-search" className="block text-sm font-medium">
          Find a comparison
        </label>
        <input
          id="tradeoff-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. cache, queue, consistency, REST"
          className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3"
        />
        <div role="group" aria-label="Filter by topic" className="mt-3 flex flex-wrap gap-2">
          <button type="button" aria-pressed={tag === null} onClick={() => setTag(null)} className={cn(chip, tag === null && "border-accent text-accent")}>
            All
          </button>
          {tags.map((t) => (
            <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)} className={cn(chip, tag === t && "border-accent text-accent")}>
              {t}
            </button>
          ))}
        </div>
        <p role="status" className="mt-3 text-sm text-muted-fg">
          {shown.length} of {sheets.length} sheets
        </p>
        <nav aria-label="Jump to a sheet" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {shown.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-11 items-center text-accent underline">
              {s.title}
            </a>
          ))}
        </nav>
      </div>

      {shown.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-20 break-inside-avoid">
          <h2 id={`${s.id}-h`} className="text-xl font-bold">
            {s.title}
          </h2>
          <p className="mt-1 text-sm text-muted-fg">{s.summary}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-sm">
              <caption className="sr-only">{s.title}: comparison by dimension</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="p-2">
                    <span className="sr-only">Dimension</span>
                  </th>
                  {s.options.map((o) => (
                    <th key={o.id} scope="col" className="p-2">
                      {o.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map((r) => (
                  <tr key={r.dimension} className="border-b border-border align-top">
                    <th scope="row" className="p-2 text-left font-medium">
                      {r.dimension}
                    </th>
                    {s.options.map((o) => (
                      <td key={o.id} className="p-2">
                        {r.values[o.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {s.options.map((o) => (
              <div key={o.id} className="rounded-lg border border-border p-3">
                <h3 className="text-sm font-semibold">Choose {o.name} when</h3>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {s.choose[o.id].map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
            <p className="font-semibold">Watch out</p>
            <ul className="mt-1 list-disc pl-5">
              {s.watchOut.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>

          {s.lessons.length > 0 && (
            <p className="mt-3 text-sm">
              Learn more:{" "}
              {s.lessons.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && ", "}
                  <Link href={l.href} className="text-accent underline">
                    {l.title}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}