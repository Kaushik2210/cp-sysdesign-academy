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

/* ---------------- Two pointers (pair with given sum in a sorted array) ---------------- */
export interface TwoPtrState {
  arr: number[];
  target: number;
  l: number;
  r: number;
  found: [number, number] | null;
}

export const TWO_POINTERS_CODE = [
  "l = 0, r = n - 1",
  "while l < r:",
  "    s = a[l] + a[r]",
  "    if s == target: return (l, r)",
  "    if s < target: l += 1",
  "    else: r -= 1",
  "return none",
];

/** Input: line 1 = numbers (sorted for you), line 2 = target sum. */
export function twoPointersSteps(input: string): Step<TwoPtrState>[] {
  const [first, second] = input.split("\n");
  const arr = parseNumbers(first ?? "").sort((a, b) => a - b);
  const target = Number(second);
  if (!Number.isFinite(target)) throw new Error("Second line must be the target sum.");
  const steps: Step<TwoPtrState>[] = [];
  let l = 0;
  let r = arr.length - 1;
  const push = (line: number, found: [number, number] | null, note: string) =>
    steps.push({ line, state: { arr, target, l, r, found }, note });
  push(0, null, `Look for two numbers summing to ${target}.`);
  while (l < r) {
    push(1, null, `l=${l}, r=${r}: pointers have not crossed.`);
    const s = arr[l] + arr[r];
    push(2, null, `a[${l}] + a[${r}] = ${arr[l]} + ${arr[r]} = ${s}.`);
    if (s === target) {
      push(3, [l, r], `Sum equals ${target}: pair at indices ${l} and ${r}.`);
      return steps;
    }
    if (s < target) {
      push(4, null, `${s} < ${target}: the left value is too small for any partner, so l moves right.`);
      l++;
    } else {
      push(5, null, `${s} > ${target}: the right value is too large for any partner, so r moves left.`);
      r--;
    }
  }
  push(6, null, `Pointers crossed: no pair sums to ${target}.`);
  return steps;
}

/* ---------------- Sliding window (maximum sum of k consecutive) ---------------- */
export interface WindowState {
  arr: number[];
  k: number;
  start: number; // window is [start, start + k)
  sum: number | null;
  best: number | null;
  bestStart: number | null;
}

export const SLIDING_WINDOW_CODE = [
  "sum = a[0] + ... + a[k-1]; best = sum",
  "for i = k to n-1:",
  "    sum += a[i] - a[i-k]",
  "    best = max(best, sum)",
  "return best",
];

/** Input: line 1 = numbers, line 2 = k. */
export function slidingWindowSteps(input: string): Step<WindowState>[] {
  const [first, second] = input.split("\n");
  const arr = parseNumbers(first ?? "");
  const k = Number(second);
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error("k must be an integer from 1 to the array length.");
  const steps: Step<WindowState>[] = [];
  const push = (line: number, start: number, sum: number | null, best: number | null, bestStart: number | null, note: string) =>
    steps.push({ line, state: { arr, k, start, sum, best, bestStart }, note });
  let sum = 0;
  for (let i = 0; i < k; i++) sum += arr[i];
  let best = sum;
  let bestStart = 0;
  push(0, 0, sum, best, bestStart, `First window [0, ${k}) has sum ${sum}.`);
  for (let i = k; i < arr.length; i++) {
    push(1, i - k, sum, best, bestStart, `Slide: add a[${i}]=${arr[i]}, remove a[${i - k}]=${arr[i - k]}.`);
    sum += arr[i] - arr[i - k];
    push(2, i - k + 1, sum, best, bestStart, `New sum is ${sum}, updated in O(1) instead of re-adding ${k} values.`);
    if (sum > best) {
      best = sum;
      bestStart = i - k + 1;
    }
    push(3, i - k + 1, sum, best, bestStart, `Best so far: ${best} (window starting at ${bestStart}).`);
  }
  push(4, bestStart, sum, best, bestStart, `Answer: ${best}.`);
  return steps;
}