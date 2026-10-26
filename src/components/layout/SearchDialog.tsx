"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

type Doc = {
  id: string;
  kind: "lesson" | "problem" | "glossary" | "template" | "pattern" | "market" | "roadmap" | "question" | "cheatsheet" | "sandbox";
  title: string;
  href: string;
  tags: string;
  text: string;
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Searcher = (q: string) => Doc[];

/** Loads the build-time index and FlexSearch lazily on first open. */
async function loadSearcher(): Promise<Searcher> {
  const [{ Document }, docs] = await Promise.all([
    import("flexsearch"),
    fetch(`${BASE}/search-index.json`).then((r) => r.json() as Promise<Doc[]>),
  ]);
  const index = new Document<Doc>({
    tokenize: "forward",
    document: { id: "id", index: ["title", "tags", "text"] },
  });
  const byId = new Map(docs.map((d) => [d.id, d]));
  docs.forEach((d) => index.add(d));
  return (q) => {
    const seen = new Set<string>();
    const out: Doc[] = [];
    // Title matches first, then tags, then body text.
    for (const field of index.search(q, { limit: 12 })) {
      for (const id of field.result as string[]) {
        if (!seen.has(id) && byId.has(id)) {
          seen.add(id);
          out.push(byId.get(id)!);
        }
      }
    }
    return out.slice(0, 12);
  };
}

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Doc[]>([]);
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  const searcher = useRef<Promise<Searcher> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    searcher.current ??= loadSearcher();
    searcher.current.catch(() => setError("Search index unavailable."));
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim() || !searcher.current) {
      setResults([]);
      return;
    }
    let live = true;
    searcher.current.then((s) => {
      if (live) {
        setResults(s(query.trim()));
        setActive(0);
      }
    });
    return () => {
      live = false;
    };
  }, [query, open]);

  const go = (d: Doc) => {
    close();
    router.push(d.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm text-muted-fg hover:bg-muted"
      >
        <Search size={14} aria-hidden />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded bg-muted px-1 text-xs sm:inline">Ctrl K</kbd>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-24"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-xl rounded-xl border border-border bg-bg shadow-xl">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === "Enter" && results[active]) go(results[active]);
              }}
              placeholder="Search lessons, problems, terms…"
              aria-label="Search query"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              className="w-full rounded-t-xl border-b border-border bg-transparent px-4 py-3 outline-none"
            />
            <ul id="search-results" role="listbox" className="max-h-80 overflow-y-auto p-1">
              {error && <li className="p-3 text-sm text-red-500">{error}</li>}
              {!error && query && results.length === 0 && (
                <li className="p-3 text-sm text-muted-fg">No results.</li>
              )}
              {results.map((d, i) => (
                <li key={d.id} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onClick={() => go(d)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm ${i === active ? "bg-muted" : ""}`}
                  >
                    <span className="rounded bg-muted px-1.5 text-xs uppercase text-muted-fg">{d.kind}</span>
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
