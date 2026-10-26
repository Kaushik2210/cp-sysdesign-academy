import type { Step } from "./types";

export type Pos = [row: number, col: number];

export interface Item {
  weight: number;
  value: number;
}

export interface KnapsackFrame {
  items: Item[];
  capacity: number;
  /** table[i][w] = best value using the first i items with capacity w; null = not computed yet. */
  table: (number | null)[][];
  current: Pos | null;
  /** The cell that "skip the item" reads. */
  skip: Pos | null;
  /** The cell that "take the item" reads, if the item fits. */
  take: Pos | null;
  /** Cells on the traceback route, once the table is full. */
  trace: Pos[];
  /** 1-based item numbers chosen by the traceback so far. */
  chosen: number[];
}

export const MAX_ITEMS = 6;
export const MAX_CAPACITY = 12;
export const DEFAULT_KNAPSACK = ["10", "5 10", "4 40", "6 30", "3 50"].join("\n");

export function parseKnapsack(input: string): { items: Item[]; capacity: number } {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2 || !/^\d+$/.test(lines[0])) throw new Error("Line 1 is the capacity; then one item per line as: weight value.");
  const capacity = Number(lines[0]);
  if (capacity < 1 || capacity > MAX_CAPACITY) throw new Error(`Capacity must be between 1 and ${MAX_CAPACITY}.`);
  const rest = lines.slice(1);
  if (rest.length > MAX_ITEMS) throw new Error(`Use at most ${MAX_ITEMS} items.`);
  const items = rest.map((line): Item => {
    const p = line.split(/\s+/);
    if (p.length !== 2 || !p.every((t) => /^\d+$/.test(t))) throw new Error(`Bad item "${line}": write it as weight value (whole numbers).`);
    const [weight, value] = p.map(Number);
    if (weight < 1) throw new Error(`In "${line}", the weight must be at least 1.`);
    if (value > 99 || weight > 99) throw new Error(`In "${line}", keep numbers at 99 or less.`);
    return { weight, value };
  });
  return { items, capacity };
}

export const KNAPSACK_CODE = [
  "dp[0][w] = 0 for every w",
  "for i = 1 to n:",
  "    for w = 0 to W:",
  "        best = dp[i-1][w]                      # skip item i",
  "        if wt[i] <= w: best = max(best, dp[i-1][w - wt[i]] + val[i])   # take it",
  "        dp[i][w] = best",
  "walk back from dp[n][W]: if dp[i][w] != dp[i-1][w], item i was taken; w -= wt[i]",
];

export function knapsackSteps(input: string): Step<KnapsackFrame>[] {
  const { items, capacity } = parseKnapsack(input);
  const n = items.length;
  const table: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: capacity + 1 }, () => (i === 0 ? 0 : null)));
  const steps: Step<KnapsackFrame>[] = [];
  const snap = (line: number, note: string, f: Partial<Pick<KnapsackFrame, "current" | "skip" | "take" | "trace" | "chosen">> = {}) =>
    steps.push({
      line,
      note,
      state: { items, capacity, table: table.map((r) => [...r]), current: f.current ?? null, skip: f.skip ?? null, take: f.take ?? null, trace: f.trace ?? [], chosen: f.chosen ?? [] },
    });

  snap(0, "Row 0 means \"no items yet\": with nothing to pack, the best value is 0 at every capacity.");
  for (let i = 1; i <= n; i++) {
    const { weight, value } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      const skipV = table[i - 1][w]!;
      const fits = weight <= w;
      const takeV = fits ? table[i - 1][w - weight]! + value : null;
      const best = takeV !== null && takeV > skipV ? takeV : skipV;
      snap(
        fits ? 4 : 3,
        fits
          ? `Item ${i} (weight ${weight}, value ${value}) at capacity ${w}: skip = ${skipV}; take = dp[${i - 1}][${w - weight}] + ${value} = ${takeV}. Best is ${best}.`
          : `Item ${i} (weight ${weight}) does not fit in capacity ${w}, so the only option is to skip it: ${skipV}.`,
        { current: [i, w], skip: [i - 1, w], take: fits ? [i - 1, w - weight] : null },
      );
      table[i][w] = best;
      snap(5, `dp[${i}][${w}] = ${best}.`, { current: [i, w], skip: [i - 1, w], take: fits ? [i - 1, w - weight] : null });
    }
  }
  // Traceback
  let w = capacity;
  const trace: Pos[] = [[n, w]];
  const chosen: number[] = [];
  snap(6, `The table is full: the best value is dp[${n}][${capacity}] = ${table[n][capacity]}. Walk back to find which items achieve it.`, { trace: [...trace] });
  for (let i = n; i >= 1; i--) {
    if (table[i][w] !== table[i - 1][w]) {
      chosen.push(i);
      w -= items[i - 1].weight;
      trace.push([i - 1, w]);
      snap(6, `dp[${i}][${w + items[i - 1].weight}] differs from the cell above it, so item ${i} was taken. Capacity left: ${w}.`, { trace: [...trace], chosen: [...chosen] });
    } else {
      trace.push([i - 1, w]);
      snap(6, `dp[${i}][${w}] equals the cell above it, so item ${i} was not needed.`, { trace: [...trace], chosen: [...chosen] });
    }
  }
  const picked = [...chosen].sort((a, b) => a - b);
  snap(6, picked.length ? `Take items ${picked.join(", ")}: total weight ${picked.reduce((s, i) => s + items[i - 1].weight, 0)} of ${capacity}, total value ${table[n][capacity]}.` : `No item improves the value: take nothing (value 0).`, {
    trace: [...trace],
    chosen: [...chosen],
  });
  return steps;
}
