import type { Step } from "./types";

export function parseNumbers(line: string, max = 24): number[] {
  const nums = line
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  if (nums.length === 0 || nums.some((n) => !Number.isFinite(n))) throw new Error("Enter numbers separated by spaces.");
  if (nums.length > max) throw new Error(`At most ${max} numbers.`);
  return nums;
}

/* ---------------- Binary search ---------------- */
export interface BSState {
  arr: number[];
  target: number;
  lo: number;
  hi: number;
  mid: number | null;
  found: number | null;
}

export const BINARY_SEARCH_CODE = [
  "lo = 0, hi = n - 1",
  "while lo <= hi:",
  "    mid = (lo + hi) / 2",
  "    if a[mid] == target: return mid",
  "    if a[mid] < target: lo = mid + 1",
  "    else: hi = mid - 1",
  "return -1",
];

/** Input: line 1 = numbers (sorted automatically), line 2 = target. */
export function binarySearchSteps(input: string): Step<BSState>[] {
  const [first, second] = input.split("\n");
  const arr = parseNumbers(first ?? "").sort((a, b) => a - b);
  const target = Number(second);
  if (!Number.isFinite(target)) throw new Error("Second line must be the target number.");
  const steps: Step<BSState>[] = [];
  let lo = 0;
  let hi = arr.length - 1;
  const push = (line: number, mid: number | null, found: number | null, note: string) =>
    steps.push({ line, state: { arr, target, lo, hi, mid, found }, note });
  push(0, null, null, `Search for ${target} in the sorted array.`);
  while (lo <= hi) {
    push(1, null, null, `lo=${lo}, hi=${hi}: the range is non-empty.`);
    const mid = Math.floor((lo + hi) / 2);
    push(2, mid, null, `mid = ${mid}, a[mid] = ${arr[mid]}.`);
    if (arr[mid] === target) {
      push(3, mid, mid, `a[${mid}] equals ${target}. Found at index ${mid}.`);
      return steps;
    }
    if (arr[mid] < target) {
      push(4, mid, null, `${arr[mid]} < ${target}: discard the left half, lo = ${mid + 1}.`);
      lo = mid + 1;
    } else {
      push(5, mid, null, `${arr[mid]} > ${target}: discard the right half, hi = ${mid - 1}.`);
      hi = mid - 1;
    }
  }
  push(6, null, -1, `lo > hi: ${target} is not in the array.`);
  return steps;
}

/* ---------------- Bubble sort ---------------- */
export interface SortState {
  arr: number[];
  i: number | null;
  j: number | null;
  sortedFrom: number;
}

export const BUBBLE_SORT_CODE = [
  "for end = n-1 down to 1:",
  "    for j = 0 to end-1:",
  "        if a[j] > a[j+1]:",
  "            swap(a[j], a[j+1])",
  "    // a[end] is now in place",
];

export function bubbleSortSteps(input: string): Step<SortState>[] {
  const arr = parseNumbers(input.split("\n")[0] ?? "", 16);
  const steps: Step<SortState>[] = [];
  const push = (line: number, j: number | null, sortedFrom: number, note: string) =>
    steps.push({ line, state: { arr: [...arr], i: j, j: j === null ? null : j + 1, sortedFrom }, note });
  const n = arr.length;
  let sortedFrom = n;
  push(0, null, sortedFrom, "Start.");
  for (let end = n - 1; end >= 1; end--) {
    for (let j = 0; j < end; j++) {
      push(2, j, sortedFrom, `Compare a[${j}]=${arr[j]} and a[${j + 1}]=${arr[j + 1]}.`);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        push(3, j, sortedFrom, `Out of order: swap them.`);
      }
    }
    sortedFrom = end;
    push(4, null, sortedFrom, `a[${end}] = ${arr[end]} is in its final place.`);
  }
  push(4, null, 0, "Sorted.");
  return steps;
}
