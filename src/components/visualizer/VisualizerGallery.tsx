"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Spotlight, type Tint } from "@/components/fx/Spotlight";
import { VIZ_CATEGORY_TITLE, type VizCategory, type VizMeta } from "@/visualizers/meta";
import { cn } from "@/lib/utils";

const CATEGORY_TINT: Record<VizCategory, Tint> = {
  searching: "cool",
  sorting: "hot",
  arrays: "sun",
  graphs: "accent",
  "data-structures": "leaf",
  dp: "hot",
  strings: "cool",
};

/** Filterable grid of visualizers: category chips plus a text filter, with live result count. */
export function VisualizerGallery({ items }: { items: VizMeta[] }) {
  const [cat, setCat] = useState<VizCategory | "all">("all");
  const [q, setQ] = useState("");

  const cats = useMemo(() => (Object.keys(VIZ_CATEGORY_TITLE) as VizCategory[]).filter((c) => items.some((m) => m.category === c)), [items]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((m) => (cat === "all" || m.category === cat) && (!needle || `${m.title} ${m.summary} ${m.complexity}`.toLowerCase().includes(needle)));
  }, [items, cat, q]);

  const chip = (active: boolean) =>
    cn(
      "min-h-11 rounded-full border px-4 text-sm font-semibold transition hover:-translate-y-0.5",
      active ? "border-transparent bg-gradient-brand text-white shadow-lg" : "border-border bg-card/70 hover:bg-muted",
    );

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
        <button type="button" aria-pressed={cat === "all"} className={chip(cat === "all")} onClick={() => setCat("all")}>
          All ({items.length})
        </button>
        {cats.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} className={chip(cat === c)} onClick={() => setCat(c)}>
            {VIZ_CATEGORY_TITLE[c]} ({items.filter((m) => m.category === c).length})
          </button>
        ))}
      </div>
      <label className="relative mt-3 block max-w-md">
        <span className="sr-only">Filter visualizers by name or idea</span>
        <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter: heap, O(n), table, tree..."
          className="h-11 w-full rounded-full border border-border bg-card/70 pl-9 pr-4 text-sm backdrop-blur focus:border-accent"
        />
      </label>
      <p role="status" className="mt-3 text-sm text-muted-fg">
        Showing {shown.length} of {items.length} visualizers
      </p>

      {shown.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-fg">Nothing matches that filter. Clear it to see all visualizers.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m) => {
            const tint = CATEGORY_TINT[m.category];
            return (
              <li key={m.name}>
                <Spotlight tint={tint} className="flex h-full flex-col p-5">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: `hsl(var(--${tint}))` }}>
                    {VIZ_CATEGORY_TITLE[m.category]}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">
                    <Link href={`/visualizers/${m.name}/`} className="after:absolute after:inset-0 after:content-['']">
                      {m.title}
                    </Link>
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted-fg">{m.summary}</p>
                  <p className="mt-3 flex items-center justify-between text-xs text-muted-fg">
                    <span>
                      Time: <code>{m.complexity}</code>
                    </span>
                    <ArrowUpRight size={16} aria-hidden style={{ color: `hsl(var(--${tint}))` }} />
                  </p>
                </Spotlight>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
