/** Simple SM-2 spaced repetition. Pure and deterministic so it can be unit tested. */
export interface Card {
  id: string;
  prompt: string;
  answer: string;
  explanation?: string;
  href?: string;
  ease: number;
  interval: number; // days
  reps: number;
  due: string; // ISO date (yyyy-mm-dd)
}

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

const DAY_MS = 86_400_000;

export function toDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function newCard(
  c: Pick<Card, "id" | "prompt" | "answer"> & Partial<Pick<Card, "explanation" | "href">>,
  today = new Date(),
): Card {
  return { ease: 2.5, interval: 0, reps: 0, due: toDay(today), ...c };
}

/** Apply a review grade (0-5; below 3 counts as a lapse). */
export function review(card: Card, grade: Grade, today = new Date()): Card {
  let { ease, interval, reps } = card;
  if (grade < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease);
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  const due = toDay(new Date(today.getTime() + interval * DAY_MS));
  return { ...card, ease, interval, reps, due };
}

export function dueCards(cards: Card[], today = new Date()): Card[] {
  const t = toDay(today);
  return cards.filter((c) => c.due <= t).sort((a, b) => a.due.localeCompare(b.due));
}
