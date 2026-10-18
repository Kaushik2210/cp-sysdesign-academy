"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface TermView {
  id: string;
  term: string;
  definition: string;
  aliases: string[];
  related: { id: string; term: string }[];
  lessons: { title: string; href: string }[];
}

const letterOf = (t: string) => (t[0] ?? "#").toUpperCase().replace(/[^A-Z]/, "#");

/** Searchable, cross-linked glossary with an A-Z jump bar. */
export function GlossaryView({ terms }: { terms: TermView[] }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => `${t.term} ${t.aliases.join(" ")} ${t.definition}`.toLowerCase().includes(q));
  }, [terms, query]);

  const groups = useMemo(() => {
    const m = new Map<string, TermView[]>();
    for (const t of shown) m.set(letterOf(t.term), [...(m.get(letterOf(t.term)) ?? []), t]);
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [shown]);

  // Following a link to a term hidden by the current filter clears the filter first.
  const goTo = (id: string) => {
    setQuery("");
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  };

  return (
    <div className="mt-6">
      <label htmlFor="glossary-search" className="block text-sm font-medium">
        Search terms
      </label>
      <input
        id="glossary-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. quorum, idempotent, p99"
        className="mt-1 min-h-11 w-full rounded-lg border border-border bg-bg px-3"
      />
      <p role="status" className="mt-3 text-sm text-muted-fg">
        {shown.length} of {terms.length} terms
      </p>

      <nav aria-label="Jump to letter" className="mt-2 flex flex-wrap gap-1">
        {groups.map(([letter]) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-border text-sm hover:bg-muted"
          >
            {letter}
          </a>
        ))}
      </nav>

      {groups.map(([letter, items]) => (
        <section key={letter} aria-labelledby={`letter-${letter}`} className="mt-8">
          <h2 id={`letter-${letter}`} className="scroll-mt-20 border-b border-border pb-1 text-xl font-bold">
            {letter}
          </h2>
          <dl className="mt-2 space-y-5">
            {items.map((t) => (
              <div key={t.id} id={t.id} className="scroll-mt-20 rounded-lg p-2 target:bg-muted target:ring-2 target:ring-accent">
                <dt className="font-semibold">
                  {t.term}
                  {t.aliases.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-fg">also: {t.aliases.join(", ")}</span>
                  )}
                </dt>
                <dd className="mt-1 text-sm">
                  <p>{t.definition}</p>
                  {t.related.length > 0 && (
                    <p className="mt-1 text-muted-fg">
                      See also:{" "}
                      {t.related.map((r, i) => (
                        <span key={r.id}>
                          {i > 0 && ", "}
                          <a href={`#${r.id}`} onClick={() => goTo(r.id)} className="text-accent underline">
                            {r.term}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                  {t.lessons.length > 0 && (
                    <p className="mt-1">
                      Learn more:{" "}
                      {t.lessons.map((l, i) => (
                        <span key={l.href}>
                          {i > 0 && ", "}
                          <Link href={l.href} className={cn("text-accent underline")}>
                            {l.title}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}