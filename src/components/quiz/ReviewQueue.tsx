"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";
import { dueCards, type Grade } from "@/lib/srs/sm2";

const GRADES: { label: string; grade: Grade }[] = [
  { label: "Again", grade: 1 },
  { label: "Hard", grade: 3 },
  { label: "Good", grade: 4 },
  { label: "Easy", grade: 5 },
];

export function ReviewQueue() {
  const cards = useProgress((s) => s.cards);
  const gradeCard = useProgress((s) => s.gradeCard);
  const [mounted, setMounted] = useState(false);
  const [reveal, setReveal] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const due = dueCards(Object.values(cards));
  const card = due[0];
  if (!card) {
    return (
      <p className="mt-8 rounded-lg border border-border p-6 text-center" role="status">
        Nothing due. {Object.keys(cards).length} cards in your deck. Complete lessons and quizzes to add more.
      </p>
    );
  }
  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5" aria-live="polite">
      <p className="mb-2 text-xs text-muted-fg">{due.length} due</p>
      <p className="whitespace-pre-wrap font-medium">{card.prompt}</p>
      {reveal ? (
        <>
          <p className="mt-4 text-sm">{card.answer}</p>
          {card.explanation && <p className="mt-1 text-sm text-muted-fg">{card.explanation}</p>}
          {card.href && (
            <Link href={card.href} className="mt-1 inline-block text-sm text-accent underline">
              Open lesson
            </Link>
          )}
          <div className="mt-4 flex gap-2">
            {GRADES.map((g) => (
              <button
                key={g.label}
                type="button"
                className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted"
                onClick={() => {
                  gradeCard(card.id, g.grade);
                  setReveal(false);
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button type="button" onClick={() => setReveal(true)} className="mt-4 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg">
          Show answer
        </button>
      )}
    </section>
  );
}
