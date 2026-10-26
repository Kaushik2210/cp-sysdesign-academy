import { parseNumbers } from "./algorithms";
import type { Step } from "./types";

type Tone = "accent" | "good" | "bad" | "muted";
export interface Mark {
  label?: string;
  tone?: Tone;
}

/** Aux buffers shown while merging: the two sorted halves and how far each has been consumed. */
export interface MergeAux {
  left: number[];
  right: number[];
  i: number;
  j: number;
}

/** One frame of a comparison sort. The renderer draws `arr` with `marks`, plus any held value or merge buffers. */
export interface SortFrame {
  arr: number[];
  marks: Record<number, Mark>;
  /** A value lifted out of the array (insertion sort's key). */
  held: number | null;
  aux: MergeAux | null;
}

const MAX = 16;
const frame = (arr: number[], marks: Record<number, Mark> = {}, held: number | null = null, aux: MergeAux | null = null): SortFrame => ({ arr: [...arr], marks, held, aux });

const inputOf = (s: string) => parseNumbers(s.split("\n")[0] ?? "", MAX);

/* ---------------- Insertion sort ---------------- */
export const INSERTION_SORT_CODE = [
  "for i = 1 to n-1:",
  "    key = a[i]; j = i - 1",
  "    while j >= 0 and a[j] > key:",
  "        a[j+1] = a[j]; j -= 1",
  "    a[j+1] = key",
];

export function insertionSortSteps(input: string): Step<SortFrame>[] {
  const a = inputOf(input);
  const n = a.length;
  const steps: Step<SortFrame>[] = [];
  const sortedTo = (end: number): Record<number, Mark> => Object.fromEntries(Array.from({ length: end }, (_, k) => [k, { tone: "good" as Tone }]));
  steps.push({ line: 0, state: frame(a, sortedTo(1)), note: "The first element on its own is already a sorted prefix." });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    steps.push({ line: 1, state: frame(a, { ...sortedTo(i), [i]: { label: "key", tone: "accent" } }, key), note: `Lift ${key} out of position ${i}; it will be inserted into the sorted prefix of ${i} elements.` });
    while (j >= 0 && a[j] > key) {
      steps.push({ line: 2, state: frame(a, { ...sortedTo(i), [j]: { label: "j", tone: "bad" } }, key), note: `a[${j}] = ${a[j]} > ${key}, so it must move right.` });
      a[j + 1] = a[j];
      steps.push({ line: 3, state: frame(a, { ...sortedTo(i), [j + 1]: { label: "moved", tone: "accent" } }, key), note: `Shift ${a[j]} one place right.` });
      j--;
    }
    if (j >= 0) steps.push({ line: 2, state: frame(a, { ...sortedTo(i), [j]: { label: "j", tone: "good" } }, key), note: `a[${j}] = ${a[j]} <= ${key}: stop. The key belongs right after it.` });
    a[j + 1] = key;
    steps.push({ line: 4, state: frame(a, { ...sortedTo(i + 1), [j + 1]: { label: "placed", tone: "accent" } }), note: `Place ${key} at position ${j + 1}. The sorted prefix now has ${i + 1} elements.` });
  }
  steps.push({ line: 0, state: frame(a, sortedTo(n)), note: "Sorted." });
  return steps;
}

/* ---------------- Merge sort ---------------- */
export const MERGE_SORT_CODE = [
  "mergesort(l, r):",
  "    if l >= r: return",
  "    m = (l + r) / 2",
  "    mergesort(l, m); mergesort(m+1, r)",
  "    merge: copy both halves, then repeatedly",
  "        take the smaller front element",
  "    copy any leftovers",
];

export function mergeSortSteps(input: string): Step<SortFrame>[] {
  const a = inputOf(input);
  const steps: Step<SortFrame>[] = [];
  const range = (l: number, r: number, extra: Record<number, Mark> = {}): Record<number, Mark> => {
    const m: Record<number, Mark> = {};
    for (let k = 0; k < a.length; k++) if (k < l || k > r) m[k] = { tone: "muted" };
    return { ...m, ...extra };
  };

  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const m = (l + r) >> 1;
    steps.push({ line: 2, state: frame(a, range(l, r, { [m]: { label: "mid", tone: "accent" } })), note: `Split [${l}..${r}] at ${m}: sort [${l}..${m}] and [${m + 1}..${r}] first.` });
    sort(l, m);
    sort(m + 1, r);
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0;
    let j = 0;
    let k = l;
    steps.push({ line: 4, state: frame(a, range(l, r), null, { left, right, i, j }), note: `Merge the sorted halves [${l}..${m}] and [${m + 1}..${r}].` });
    while (i < left.length && j < right.length) {
      const takeLeft = left[i] <= right[j];
      const v = takeLeft ? left[i] : right[j];
      steps.push({ line: 5, state: frame(a, range(l, r, { [k]: { label: "write", tone: "accent" } }), null, { left, right, i, j }), note: `Compare ${left[i]} (left) with ${right[j]} (right): take ${v}.` });
      a[k] = v;
      if (takeLeft) i++;
      else j++;
      k++;
    }
    while (i < left.length) {
      a[k] = left[i];
      steps.push({ line: 6, state: frame(a, range(l, r, { [k]: { label: "copy", tone: "accent" } }), null, { left, right, i: i + 1, j }), note: `Right half is empty: copy leftover ${left[i]}.` });
      i++;
      k++;
    }
    while (j < right.length) {
      a[k] = right[j];
      steps.push({ line: 6, state: frame(a, range(l, r, { [k]: { label: "copy", tone: "accent" } }), null, { left, right, i, j: j + 1 }), note: `Left half is empty: copy leftover ${right[j]}.` });
      j++;
      k++;
    }
    const done: Record<number, Mark> = {};
    for (let x = l; x <= r; x++) done[x] = { tone: "good" };
    steps.push({ line: 3, state: frame(a, range(l, r, done)), note: `[${l}..${r}] is now sorted.` });
  };

  steps.push({ line: 0, state: frame(a), note: "Split the array in halves until single elements remain, then merge back up." });
  sort(0, a.length - 1);
  const all: Record<number, Mark> = Object.fromEntries(a.map((_, k) => [k, { tone: "good" as Tone }]));
  steps.push({ line: 0, state: frame(a, all), note: "Sorted." });
  return steps;
}

/* ---------------- Quick sort (Lomuto partition) ---------------- */
export const QUICK_SORT_CODE = [
  "quicksort(lo, hi):",
  "    pivot = a[hi]; i = lo",
  "    for j = lo to hi-1:",
  "        if a[j] < pivot: swap(a[i], a[j]); i += 1",
  "    swap(a[i], a[hi])   // pivot is now in its final place",
  "    quicksort(lo, i-1); quicksort(i+1, hi)",
];

export function quickSortSteps(input: string): Step<SortFrame>[] {
  const a = inputOf(input);
  const steps: Step<SortFrame>[] = [];
  const fixed = new Set<number>();
  const marks = (lo: number, hi: number, extra: Record<number, Mark> = {}): Record<number, Mark> => {
    const m: Record<number, Mark> = {};
    for (let k = 0; k < a.length; k++) {
      if (fixed.has(k)) m[k] = { tone: "good" };
      else if (k < lo || k > hi) m[k] = { tone: "muted" };
    }
    return { ...m, ...extra };
  };

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      fixed.add(lo);
      steps.push({ line: 0, state: frame(a, marks(lo, hi)), note: `A single element at ${lo} is already in place.` });
      return;
    }
    const pivot = a[hi];
    let i = lo;
    steps.push({ line: 1, state: frame(a, marks(lo, hi, { [hi]: { label: "pivot", tone: "accent" }, [i]: { label: "i", tone: "accent" } })), note: `Partition [${lo}..${hi}] around the pivot ${pivot}.` });
    for (let j = lo; j < hi; j++) {
      steps.push({ line: 2, state: frame(a, marks(lo, hi, { [hi]: { label: "pivot", tone: "accent" }, [i]: { label: "i", tone: "accent" }, [j]: { label: j === i ? "i,j" : "j", tone: "bad" } })), note: `Is a[${j}] = ${a[j]} < pivot ${pivot}?` });
      if (a[j] < pivot) {
        [a[i], a[j]] = [a[j], a[i]];
        i++;
        steps.push({ line: 3, state: frame(a, marks(lo, hi, { [hi]: { label: "pivot", tone: "accent" }, [Math.min(i, hi)]: { label: "i", tone: "accent" } })), note: `Yes: swap it into the "smaller than pivot" zone and advance i to ${i}.` });
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    fixed.add(i);
    steps.push({ line: 4, state: frame(a, marks(lo, hi, { [i]: { label: "fixed", tone: "good" } })), note: `Swap the pivot into position ${i}. Everything left is smaller, everything right is larger, so ${pivot} is final.` });
    sort(lo, i - 1);
    sort(i + 1, hi);
  };

  steps.push({ line: 0, state: frame(a), note: "Pick a pivot, partition around it, then sort each side." });
  sort(0, a.length - 1);
  steps.push({ line: 0, state: frame(a, Object.fromEntries(a.map((_, k) => [k, { tone: "good" as Tone }]))), note: "Sorted." });
  return steps;
}