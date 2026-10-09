"use client";

import { useState } from "react";
import { Lightbulb, Lock, Send, Play } from "lucide-react";
import { CodeEditor } from "@/components/runner/CodeEditor";
import { isRunnable, runCode } from "@/lib/runner/client";
import { judge, normalize, type JudgeReport, type TestCase } from "@/lib/runner/judge";
import { LANGUAGE_LABEL, type Language } from "@/lib/runner/types";
import { COMPLEXITY_CLASSES } from "@/lib/content/problem";
import { useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface ProblemClientProps {
  id: string;
  title: string;
  rating: number;
  tags: string[];
  source?: { name: string; url?: string };
  constraints: string[];
  timeLimitMs: number;
  tests: TestCase[];
  hints: [string, string, string];
  complexityTime: string;
  starter: Partial<Record<Language, string>>;
  statement: React.ReactNode;
  editorial: React.ReactNode;
}

const VERDICT_STYLE = {
  AC: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  WA: "bg-red-500/15 text-red-600 dark:text-red-400",
  TLE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  RE: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
} as const;

export function ProblemClient(p: ProblemClientProps) {
  const langs = Object.keys(p.starter) as Language[];
  const [lang, setLang] = useState<Language>("python");
  const [code, setCode] = useState<Partial<Record<Language, string>>>(p.starter);
  const [report, setReport] = useState<JudgeReport>();
  const [samples, setSamples] = useState<{ ok: boolean; out: string; err: string }[]>();
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState(0);
  const [showEditorial, setShowEditorial] = useState(false);
  const [guess, setGuess] = useState("");
  const recordProblem = useProgress((s) => s.recordProblem);
  const result = useProgress((s) => s.problems[p.id]);

  const examples = p.tests.filter((t) => !t.hidden);
  const attempted = (result?.attempts ?? 0) > 0;

  const runSamples = async () => {
    setBusy(true);
    setReport(undefined);
    const out = [];
    for (const t of examples) {
      const r = await runCode(lang, code[lang] ?? "", t.input, { timeoutMs: p.timeLimitMs });
      out.push({
        ok: r.status === "ok" && normalize(r.stdout) === normalize(t.output),
        out: r.stdout,
        err: r.stderr,
      });
    }
    setSamples(out);
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true);
    setSamples(undefined);
    const r = await judge(runCode, lang, code[lang] ?? "", p.tests, { timeoutMs: p.timeLimitMs });
    setReport(r);
    recordProblem(p.id, r.verdict, p.tags);
    setBusy(false);
  };

  return (
    <section aria-label={`Problem: ${p.title}`} className="not-prose my-8 rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border p-4">
        <h3 className="text-lg font-semibold">{p.title}</h3>
        <span className="text-xs text-muted-fg">rating ~{p.rating}</span>
        {result?.solved && <span className="text-xs font-medium text-emerald-500">solved</span>}
        <span className="ml-auto flex gap-1">
          {p.tags.map((t) => (
            <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-fg">
              {t}
            </span>
          ))}
        </span>
      </header>

      <div className="space-y-4 p-4">
        <div className="prose prose-sm max-w-none dark:prose-invert">{p.statement}</div>
        <div>
          <p className="text-sm font-semibold">Constraints</p>
          <ul className="list-disc pl-5 text-sm">
            {p.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
            <li>Time limit: {p.timeLimitMs} ms</li>
          </ul>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {examples.map((e, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold">Example {i + 1}</p>
              <p className="text-xs text-muted-fg">Input</p>
              <pre className="rounded border border-border bg-bg p-2 font-mono text-xs">{e.input}</pre>
              <p className="text-xs text-muted-fg">Output</p>
              <pre className="rounded border border-border bg-bg p-2 font-mono text-xs">{e.output}</pre>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <button type="button" disabled={busy} onClick={runSamples} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60">
            <Play size={14} aria-hidden /> Run samples
          </button>
          <button type="button" disabled={busy} onClick={submit} className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg disabled:opacity-60">
            <Send size={14} aria-hidden /> {busy ? "Judging…" : `Submit (${p.tests.length} tests)`}
          </button>
        </div>
        <CodeEditor language={lang} value={code[lang] ?? ""} onChange={(v) => setCode((c) => ({ ...c, [lang]: v }))} height={300} />

        <div aria-live="polite">
          {samples && (
            <ul className="space-y-1 text-sm">
              {samples.map((s, i) => (
                <li key={i}>
                  Example {i + 1}: <b className={s.ok ? "text-emerald-500" : "text-red-500"}>{s.ok ? "matches" : "differs"}</b>
                  {!s.ok && <pre className="mt-1 rounded border border-border bg-bg p-2 font-mono text-xs">{s.out || s.err}</pre>}
                </li>
              ))}
            </ul>
          )}
          {report && (
            <div className={cn("rounded-md p-3 text-sm", VERDICT_STYLE[report.verdict])} role="status">
              <p className="font-semibold">
                Verdict: {report.verdict} ({report.passed}/{report.total} tests passed)
              </p>
              {report.firstFail !== undefined && (() => {
                const o = report.outcomes[report.firstFail];
                const t = p.tests[report.firstFail];
                return (
                  <div className="mt-2 text-fg">
                    <p>
                      Failed on test {report.firstFail + 1}
                      {t.hidden ? " (hidden)" : ""} · {o.timeMs} ms
                    </p>
                    {!t.hidden && (
                      <pre className="mt-1 whitespace-pre-wrap rounded border border-border bg-bg p-2 font-mono text-xs">
                        {`input:\n${t.input}\nexpected:\n${t.output}\ngot:\n${o.actual}${o.stderr}`}
                      </pre>
                    )}
                    {t.hidden && o.stderr && <pre className="mt-1 font-mono text-xs">{o.stderr}</pre>}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-sm font-semibold">
            <Lightbulb size={14} aria-hidden /> Hints
          </p>
          <ol className="space-y-1 text-sm">
            {p.hints.slice(0, hints).map((h, i) => (
              <li key={i}>
                <b>Hint {i + 1}:</b> {h}
              </li>
            ))}
          </ol>
          {hints < 3 && (
            <button type="button" onClick={() => setHints(hints + 1)} className="mt-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted">
              Reveal hint {hints + 1}
            </button>
          )}
        </div>

        <fieldset className="text-sm">
          <legend className="font-semibold">Complexity self-check</legend>
          <p className="text-xs text-muted-fg">What is the best time complexity for this problem?</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {COMPLEXITY_CLASSES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={guess === c}
                onClick={() => setGuess(c)}
                className={cn("rounded border border-border px-2 py-1 text-xs hover:bg-muted", guess === c && "border-accent text-accent")}
              >
                {c}
              </button>
            ))}
          </div>
          {guess && (
            <p className="mt-1" role="status">
              {guess === p.complexityTime ? "Correct" : `Not quite; the intended solution is ${p.complexityTime}`}
            </p>
          )}
        </fieldset>

        <div>
          {showEditorial ? (
            <div className="prose prose-sm max-w-none rounded-md border border-border p-3 dark:prose-invert">
              <h4>Editorial</h4>
              {p.editorial}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowEditorial(true)}
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              <Lock size={14} aria-hidden />
              {attempted ? "Show editorial" : "Show editorial anyway (try a submission first)"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
