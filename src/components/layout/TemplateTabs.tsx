"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TemplateLang {
  label: string;
  /** Raw source, copied to the clipboard. */
  code: string;
  /** Server-rendered, syntax-highlighted block. */
  node: React.ReactNode;
}

/** Language tabs (arrow-key navigable) with a copy-to-clipboard button for each template. */
export function TemplateTabs({ langs }: { langs: TemplateLang[] }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const uid = useId();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(langs[active].code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((a) => (a + 1) % langs.length);
    if (e.key === "ArrowLeft") setActive((a) => (a - 1 + langs.length) % langs.length);
  };

  return (
    <div className="my-6">
      <div className="flex items-end justify-between gap-2 border-b border-border">
        <div role="tablist" aria-label="Language" onKeyDown={onKey} className="flex gap-1">
          {langs.map((l, i) => (
            <button
              key={l.label}
              role="tab"
              id={`${uid}-t${i}`}
              aria-selected={i === active}
              aria-controls={`${uid}-p${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "-mb-px min-h-11 border-b-2 px-3 text-sm",
                i === active ? "border-accent font-medium text-accent" : "border-transparent text-muted-fg hover:text-fg",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          className="mb-1 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-muted"
        >
          {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
          <span aria-live="polite">{copied ? "Copied" : "Copy code"}</span>
        </button>
      </div>
      {langs.map((l, i) => (
        <div
          key={l.label}
          role="tabpanel"
          id={`${uid}-p${i}`}
          aria-labelledby={`${uid}-t${i}`}
          hidden={i !== active}
          className="prose prose-sm max-w-none pt-2 dark:prose-invert"
        >
          {l.node}
        </div>
      ))}
    </div>
  );
}