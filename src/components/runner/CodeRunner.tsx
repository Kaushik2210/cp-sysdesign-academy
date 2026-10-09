"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { runCode, isRunnable } from "@/lib/runner/client";
import { LANGUAGE_LABEL, type Language, type RunResult } from "@/lib/runner/types";
import { CodeEditor } from "./CodeEditor";

export type Snippets = Partial<Record<Language, string>>;

/** Editable, runnable snippet. Provide either `code` + `language` or a `snippets` map. */
export function CodeRunner({
  language = "python",
  code,
  snippets,
  stdin = "",
  height,
}: {
  language?: Language;
  code?: string;
  snippets?: Snippets;
  stdin?: string;
  height?: number;
}) {
  const initial: Snippets = snippets ?? { [language]: code ?? "" };
  const langs = Object.keys(initial) as Language[];
  const [lang, setLang] = useState<Language>(langs.includes(language) ? language : langs[0]);
  const [sources, setSources] = useState<Snippets>(initial);
  const [input, setInput] = useState(stdin);
  const [result, setResult] = useState<RunResult>();
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setResult(undefined);
    setResult(await runCode(lang, sources[lang] ?? "", input));
    setRunning(false);
  };

  const lines = (sources[lang] ?? "").split("\n").length;
  return (
    <section aria-label="Code runner" className="not-prose my-6 rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {langs.length > 1 ? (
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="rounded border border-border bg-bg px-2 py-1 text-sm"
          >
            {langs.map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_LABEL[l]}
                {isRunnable(l) ? "" : " (external runner)"}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium">{LANGUAGE_LABEL[lang]}</span>
        )}
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60"
        >
          <Play size={14} aria-hidden /> {running ? "Running…" : "Run"}
        </button>
      </div>
      <CodeEditor
        language={lang}
        value={sources[lang] ?? ""}
        onChange={(v) => setSources((s) => ({ ...s, [lang]: v }))}
        height={height ?? Math.min(420, Math.max(120, lines * 20 + 24))}
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-muted-fg">
          stdin
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-border bg-bg p-2 font-mono text-sm text-fg"
          />
        </label>
        <div aria-live="polite" className="text-xs text-muted-fg">
          output
          <pre className="mt-1 min-h-[4.5rem] overflow-auto rounded border border-border bg-bg p-2 font-mono text-sm text-fg">
            {result ? result.stdout : running ? "…" : ""}
            {result?.stderr && <span className="text-red-500">{result.stderr}</span>}
          </pre>
          {result && (
            <p className="mt-1">
              {result.status} · {result.timeMs} ms · memory{" "}
              {result.memoryKb ? `${result.memoryKb} KB` : "n/a in browser"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
