"use client";

import { useState } from "react";
import { useProgress } from "@/lib/store";
import { fireConfetti } from "@/components/fx/confetti";
import { cn } from "@/lib/utils";

export type QuizQuestion =
  | { type: "mcq"; q: string; options: string[]; answer: number; explain: string }
  | { type: "multi"; q: string; options: string[]; answer: number[]; explain: string }
  | { type: "predict"; q: string; code: string; options: string[]; answer: number; explain: string };

const sameSet = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

const answerOf = (q: QuizQuestion): number[] => (Array.isArray(q.answer) ? q.answer : [q.answer]);

/** MCQ, multi-select and predict-the-output. Missed questions enter the spaced-repetition queue. */
export function Quiz({ id, tags = [], questions }: { id: string; tags?: string[]; questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<number[][]>(() => questions.map(() => []));
  const [submitted, setSubmitted] = useState(false);
  const { recordQuiz, addCard } = useProgress();

  const toggle = (qi: number, oi: number) => {
    if (submitted) return;
    setPicked((p) =>
      p.map((sel, i) => {
        if (i !== qi) return sel;
        if (questions[qi].type === "multi") {
          return sel.includes(oi) ? sel.filter((x) => x !== oi) : [...sel, oi];
        }
        return [oi];
      }),
    );
  };

  const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    let correct = 0;
    questions.forEach((q, i) => {
      if (sameSet(picked[i], answerOf(q))) correct++;
      else {
        addCard({
          id: `quiz:${id}:${i}`,
          prompt: q.q + (q.type === "predict" ? `\n${q.code}` : ""),
          answer: answerOf(q).map((a) => q.options[a]).join("; "),
          explanation: q.explain,
        });
      }
    });
    recordQuiz(id, { correct, total: questions.length, tags });
    setSubmitted(true);
    if (correct === questions.length) fireConfetti({ x: r.left + r.width / 2, y: r.top }, 48);
  };

  const score = questions.filter((q, i) => sameSet(picked[i], answerOf(q))).length;

  return (
    <section aria-label="Quiz" className="not-prose my-8 rounded-2xl border border-border bg-card/80 p-5 shadow-lg backdrop-blur-sm">
      <h3 className="mb-4 text-xl font-extrabold tracking-tight">
        <span className="text-gradient">Quiz</span>
      </h3>
      <ol className="space-y-6">
        {questions.map((q, qi) => {
          const ans = answerOf(q);
          const ok = submitted && sameSet(picked[qi], ans);
          return (
            <li key={qi}>
              <p className="font-medium">{q.q}</p>
              {q.type === "predict" && (
                <pre className="my-2 overflow-auto rounded border border-border bg-bg p-2 font-mono text-sm">{q.code}</pre>
              )}
              {q.type === "multi" && <p className="text-xs text-muted-fg">Select all that apply.</p>}
              <div role={q.type === "multi" ? "group" : "radiogroup"} aria-label={`Question ${qi + 1}`} className="mt-2 space-y-1">
                {q.options.map((o, oi) => {
                  const on = picked[qi].includes(oi);
                  return (
                    <button
                      key={oi}
                      type="button"
                      role={q.type === "multi" ? "checkbox" : "radio"}
                      aria-checked={on}
                      onClick={() => toggle(qi, oi)}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-2 rounded-xl border border-border bg-bg/50 px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:bg-muted",
                        on && "border-accent bg-accent/10 shadow-[inset_4px_0_0_hsl(var(--accent))]",
                        submitted && ans.includes(oi) && "border-emerald-500 bg-emerald-500/10",
                        submitted && on && !ans.includes(oi) && "border-red-500 bg-red-500/10",
                      )}
                    >
                      <span aria-hidden="true" className="w-4 shrink-0 text-center font-bold">
                        {submitted && ans.includes(oi) ? "✓" : submitted && on ? "✗" : ""}
                      </span>
                      {o}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p role="status" className={cn("mt-2 text-sm", ok ? "text-emerald-500" : "text-red-500")}>
                  {ok ? "Correct. " : "Not quite. "}
                  <span className="text-fg">{q.explain}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex items-center gap-3">
        {!submitted ? (
          <button type="button" onClick={submit} className="min-h-11 rounded-full bg-gradient-brand px-6 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
            Check answers
          </button>
        ) : (
          <>
            <p className="text-lg font-black" role="status">
              Score: <span className="text-gradient">{score}/{questions.length}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setPicked(questions.map(() => []));
                setSubmitted(false);
              }}
              className="min-h-11 rounded-full border border-border bg-card/70 px-5 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-muted"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </section>
  );
}
