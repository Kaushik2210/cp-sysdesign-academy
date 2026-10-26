/** Pure helpers for the mock-interview tool: phase prompts, the clock and history analysis. */
import type { QuestionKind } from "./content/questions";

export interface Phase {
  id: string;
  label: string;
  /** Fraction of the total time at which the phase ends (the last one is 1). */
  until: number;
  tip: string;
}

/** Proportions follow the 45-minute framework: 5, 5, 7, 8, 13, 5, 2 minutes. */
export const PHASES: Record<QuestionKind, Phase[]> = {
  "system-design": [
    { id: "clarify", label: "Clarify", until: 5 / 45, tip: "Ask scope, scale and quality questions, then state your assumptions." },
    { id: "estimate", label: "Estimate", until: 10 / 45, tip: "Compute only numbers that change decisions, and say what they imply." },
    { id: "api-data", label: "API and data model", until: 17 / 45, tip: "Define 2-3 endpoints and choose storage from the access patterns." },
    { id: "high-level", label: "High-level design", until: 25 / 45, tip: "Start simple. Justify every box. Walk the main request end to end." },
    { id: "deep-dive", label: "Deep dive", until: 38 / 45, tip: "Go one level deeper on the hardest parts. Name trade-offs and triggers." },
    { id: "bottlenecks", label: "Bottlenecks and failures", until: 43 / 45, tip: "What happens when each part dies or gets 10x busier?" },
    { id: "summary", label: "Summary", until: 1, tip: "Restate the design, the main trade-off and what you would do next." },
  ],
  "low-level-design": [
    { id: "requirements", label: "Requirements", until: 0.15, tip: "Clarify use cases, actors and constraints before drawing classes." },
    { id: "model", label: "Object model", until: 0.4, tip: "Entities, responsibilities and relationships. Keep concerns separate." },
    { id: "code", label: "Key code", until: 0.75, tip: "Write the core methods. Use a pattern only where it solves a real problem." },
    { id: "extend", label: "Extensibility and concurrency", until: 0.92, tip: "Show how a new requirement fits and where concurrent access matters." },
    { id: "test", label: "Testing", until: 1, tip: "Say how you would test the main behaviours." },
  ],
  "ai-coding": [
    { id: "orient", label: "Orient", until: 0.2, tip: "Read the code and tests first. Say what you see before prompting." },
    { id: "plan", label: "Plan", until: 0.35, tip: "State your approach, data structure and edge cases aloud." },
    { id: "implement", label: "Implement and verify", until: 0.9, tip: "Ask for small pieces, review each, run tests after every change." },
    { id: "wrap", label: "Explain", until: 1, tip: "Walk through the final code and what you delegated and why." },
  ],
  behavioral: [
    { id: "story", label: "Tell the story", until: 1, tip: "Context, problem, decision, trade-off, result, lesson. Aim for about 90 seconds." },
  ],
};

export function currentPhase(kind: QuestionKind, elapsedSec: number, totalSec: number): Phase | "overtime" {
  if (elapsedSec >= totalSec) return "overtime";
  const frac = elapsedSec / totalSec;
  return PHASES[kind].find((p) => frac < p.until) ?? PHASES[kind][PHASES[kind].length - 1];
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export interface MockAttempt {
  id: string;
  questionId: string;
  kind: QuestionKind;
  /** ISO timestamp. */
  date: string;
  secondsUsed: number;
  /** rubric dimension id -> 1..4 */
  scores: Record<string, number>;
  /** fraction of the strong-answer checklist the learner ticked, 0..1 */
  coverage: number;
  notes: string;
}

export interface DimensionStat {
  id: string;
  average: number;
  count: number;
}

/** Average score per dimension over all attempts of one kind, weakest first. */
export function dimensionStats(attempts: MockAttempt[], kind: QuestionKind): DimensionStat[] {
  const sums = new Map<string, { total: number; count: number }>();
  for (const a of attempts.filter((x) => x.kind === kind)) {
    for (const [id, score] of Object.entries(a.scores)) {
      const s = sums.get(id) ?? { total: 0, count: 0 };
      s.total += score;
      s.count += 1;
      sums.set(id, s);
    }
  }
  return [...sums.entries()]
    .map(([id, s]) => ({ id, average: s.total / s.count, count: s.count }))
    .sort((a, b) => a.average - b.average || a.id.localeCompare(b.id));
}

/** Overall score as a percentage of the maximum (4 per dimension). */
export function overallPercent(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  if (!vals.length) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 4)) * 100);
}