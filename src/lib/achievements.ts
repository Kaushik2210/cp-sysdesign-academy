/** Local-only achievements, derived purely from persisted progress. */
export interface ProgressSnapshot {
  completed: Record<string, string>;
  problems: Record<string, { attempts: number; solved: boolean; last: string; tags: string[] }>;
  quizzes: Record<string, { correct: number; total: number; tags: string[] }>;
  cards: Record<string, { reps: number }>;
  activity: Record<string, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
}

const DAY_MS = 86_400_000;

/** Current streak of consecutive active days ending today (or yesterday, so it doesn't reset mid-day). */
export function currentStreak(activity: Record<string, number>, today = new Date()): number {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  let day = new Date(today.getTime());
  if (!activity[iso(day)]) day = new Date(day.getTime() - DAY_MS);
  let n = 0;
  while (activity[iso(day)]) {
    n++;
    day = new Date(day.getTime() - DAY_MS);
  }
  return n;
}

export function longestStreak(activity: Record<string, number>): number {
  const days = Object.keys(activity).filter((d) => activity[d] > 0).sort();
  let best = 0;
  let run = 0;
  let prev = 0;
  for (const d of days) {
    const t = Date.parse(d);
    run = prev && t - prev === DAY_MS ? run + 1 : 1;
    best = Math.max(best, run);
    prev = t;
  }
  return best;
}

export function computeAchievements(s: ProgressSnapshot, today = new Date()): Achievement[] {
  const lessons = Object.keys(s.completed).length;
  const solved = Object.values(s.problems).filter((p) => p.solved).length;
  const perfect = Object.values(s.quizzes).filter((q) => q.correct === q.total).length;
  const reviewed = Object.values(s.cards).filter((c) => c.reps > 0).length;
  const streak = Math.max(currentStreak(s.activity, today), longestStreak(s.activity));
  const defs: [string, string, string, boolean][] = [
    ["first-lesson", "First steps", "Complete your first lesson.", lessons >= 1],
    ["ten-lessons", "Getting serious", "Complete 10 lessons.", lessons >= 10],
    ["fifty-lessons", "Halfway scholar", "Complete 50 lessons.", lessons >= 50],
    ["first-ac", "Accepted!", "Get your first AC verdict.", solved >= 1],
    ["five-ac", "Problem solver", "Solve 5 problems.", solved >= 5],
    ["perfect-quiz", "Flawless", "Score 100% on a quiz.", perfect >= 1],
    ["review-10", "Memory keeper", "Review 10 flash cards.", reviewed >= 10],
    ["streak-3", "On a roll", "Learn 3 days in a row.", streak >= 3],
    ["streak-7", "Weekly habit", "Learn 7 days in a row.", streak >= 7],
  ];
  return defs.map(([id, title, description, earned]) => ({ id, title, description, earned }));
}

/** Tags ranked by failure rate across problems and quizzes (weakest first). */
export function weakestTopics(s: ProgressSnapshot, limit = 5): { tag: string; miss: number; total: number }[] {
  const tally = new Map<string, { miss: number; total: number }>();
  const add = (tag: string, miss: number, total: number) => {
    const t = tally.get(tag) ?? { miss: 0, total: 0 };
    t.miss += miss;
    t.total += total;
    tally.set(tag, t);
  };
  for (const p of Object.values(s.problems)) {
    for (const tag of p.tags) add(tag, p.solved ? Math.max(0, p.attempts - 1) : p.attempts, p.attempts);
  }
  for (const q of Object.values(s.quizzes)) {
    for (const tag of q.tags) add(tag, q.total - q.correct, q.total);
  }
  return [...tally.entries()]
    .map(([tag, v]) => ({ tag, ...v }))
    .filter((t) => t.miss > 0)
    .sort((a, b) => b.miss / b.total - a.miss / a.total || b.miss - a.miss)
    .slice(0, limit);
}
