"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";
import { dueCards, type Grade } from "@/lib/srs/sm2";
import { fireConfetti } from "@/components/fx/confetti";

const GRADES: { label: string; grade: Grade; tint: string }[] = [
  { label: "Again", grade: 1, tint: "hot" },
  { label: "Hard", grade: 3, tint: "sun" },
  { label: "Good", grade: 4, tint: "cool" },
  { label: "Easy", grade: 5, tint: "leaf" },
];

/** Fills a grade button with its colour (and flips the text to white) while hovered or focused. */
function fill(el: HTMLElement, tint: string, on: boolean) {
  el.style.background = on ? `hsl(var(--${tint}))` : "";
  el.style.color = on ? "white" : `hsl(var(--${tint}))`;
}

/** One flashcard at a time. Keyboard: Space reveals the answer, then 1 to 4 grade it. */
export function ReviewQueue() {
  const cards = useProgress((s) => s.cards);
  const gradeCard = useProgress((s) => s.gradeCard);
  const [mounted, setMounted] = useState(false);
  const [reveal, setReveal] = useState(false);
  useEffect(() => setMounted(true), []);

  const due = dueCards(Object.values(cards));
  const card = due[0];

  const grade = (g: Grade) => {
    if (!card) return;
    // Clearing the last due card is worth a small celebration.
    if (due.length === 1) fireConfetti({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 60);
    gradeCard(card.id, g);
    setReveal(false);
  };

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select, button, a, [contenteditable]")) return;
      if (!reveal && e.key === " ") {
        e.preventDefault();
        setReveal(true);
      } else if (reveal && /^[1-4]$/.test(e.key)) {
        grade(GRADES[Number(e.key) - 1].grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // grade closes over card and due, which change with the deck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, reveal, due.length]);

  if (!mounted) return null;

  if (!card) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-border bg-card/70 p-8 text-center text-lg" role="status">
        <span className="text-gradient font-black">All caught up.</span> Nothing due. {Object.keys(cards).length} cards in your deck. Complete lessons and
        quizzes to add more.
      </p>
    );
  }
  return (
    <section className="mt-8 rounded-3xl border border-border bg-card/80 p-6 shadow-xl ring-glow backdrop-blur-sm" aria-live="polite">
      <p className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-fg">
        <span>{due.length} due</span>
        <span className="hidden normal-case tracking-normal sm:inline">
          <kbd className="rounded border border-border bg-muted px-1.5 font-mono">Space</kbd> reveal · <kbd className="rounded border border-border bg-muted px-1.5 font-mono">1</kbd>
          –<kbd className="rounded border border-border bg-muted px-1.5 font-mono">4</kbd> grade
        </span>
      </p>
      <p className="whitespace-pre-wrap text-lg font-semibold">{card.prompt}</p>
      {reveal ? (
        <div className="mt-5 animate-[pop-in_0.3s_ease-out] rounded-2xl border border-border bg-bg/60 p-4">
          <p className="text-sm">{card.answer}</p>
          {card.explanation && <p className="mt-2 text-sm text-muted-fg">{card.explanation}</p>}
          {card.href && (
            <Link href={card.href} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-accent underline">
              Open lesson
            </Link>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {GRADES.map((g, i) => (
              <button
                key={g.label}
                type="button"
                className="min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ borderColor: `hsl(var(--${g.tint}))`, color: `hsl(var(--${g.tint}))` }}
                onMouseEnter={(e) => fill(e.currentTarget, g.tint, true)}
                onMouseLeave={(e) => fill(e.currentTarget, g.tint, false)}
                onFocus={(e) => fill(e.currentTarget, g.tint, true)}
                onBlur={(e) => fill(e.currentTarget, g.tint, false)}
                onClick={() => grade(g.grade)}
              >
                {g.label} <span className="ml-1 text-xs opacity-70">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setReveal(true)}
          className="mt-5 min-h-11 rounded-full bg-gradient-brand px-6 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Show answer
        </button>
      )}
    </section>
  );
}
