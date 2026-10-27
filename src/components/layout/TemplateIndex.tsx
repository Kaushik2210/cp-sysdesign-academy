"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Spotlight } from "@/components/fx/Spotlight";

export interface TemplateCard {
  slug: string;
  title: string;
  summary: string;
  complexity: string;
  tags: string[];
}

/** Filterable grid of templates. */
export function TemplateIndex({ templates }: { templates: TemplateCard[] }) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => !q || `${t.title} ${t.summary} ${t.tags.join(" ")}`.toLowerCase().includes(q));
  }, [templates, query]);

  return (
    <div className="mt-6">
      <label htmlFor="tpl-search" className="block text-sm font-medium">
        Filter templates
      </label>
      <input
        id="tpl-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. graph, modular, string"
        className="mt-1 min-h-12 w-full rounded-full border border-border bg-card/70 px-5 shadow-sm backdrop-blur focus:border-accent focus:shadow-lg"
      />
      <p role="status" className="mt-3 text-sm text-muted-fg">
        {shown.length} of {templates.length} templates
      </p>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {shown.map((t) => (
          <li key={t.slug}>
            <Spotlight tint="cool" tilt={2} className="h-full p-5">
              <h2 className="text-lg font-extrabold tracking-tight">
                <Link href={`/templates/${t.slug}/`} className="after:absolute after:inset-0 after:content-['']">
                  {t.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm">{t.summary}</p>
              <p className="mt-2 text-xs text-muted-fg">
                <code>{t.complexity}</code> · {t.tags.join(", ")}
              </p>
            </Spotlight>
          </li>
        ))}
      </ul>
    </div>
  );
}