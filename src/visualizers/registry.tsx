"use client";

import { ArrayView, type CellMark } from "./ArrayView";
import {
  BINARY_SEARCH_CODE,
  BUBBLE_SORT_CODE,
  binarySearchSteps,
  bubbleSortSteps,
  SLIDING_WINDOW_CODE,
  TWO_POINTERS_CODE,
  slidingWindowSteps,
  twoPointersSteps,
  type BSState,
  type TwoPtrState,
  type WindowState,
  type SortState,
} from "./algorithms";
import { INSERTION_SORT_CODE, MERGE_SORT_CODE, QUICK_SORT_CODE, insertionSortSteps, mergeSortSteps, quickSortSteps, type SortFrame } from "./sorting";
import type { VisualizerDef } from "./types";

function BinarySearchRender({ state: s }: { state: BSState }) {
  const marks: Record<number, CellMark> = {};
  s.arr.forEach((_, i) => {
    if (i < s.lo || i > s.hi) marks[i] = { tone: "muted" };
  });
  if (s.lo <= s.hi) {
    marks[s.lo] = { ...marks[s.lo], label: "lo", tone: "accent" };
    marks[s.hi] = { ...marks[s.hi], label: s.lo === s.hi ? "lo,hi" : "hi", tone: "accent" };
  }
  if (s.mid !== null) marks[s.mid] = { label: "mid", tone: s.found === s.mid ? "good" : "bad" };
  return (
    <div>
      <ArrayView values={s.arr} marks={marks} />
      <p className="text-sm">target = {s.target}</p>
    </div>
  );
}

function SortRender({ state: s }: { state: SortState }) {
  const marks: Record<number, CellMark> = {};
  for (let k = s.sortedFrom; k < s.arr.length; k++) marks[k] = { tone: "good" };
  if (s.i !== null && s.j !== null) {
    marks[s.i] = { label: "j", tone: "accent" };
    marks[s.j] = { label: "j+1", tone: "accent" };
  }
  return <ArrayView values={s.arr} marks={marks} />;
}


function TwoPointersRender({ state: s }: { state: TwoPtrState }) {
  const marks: Record<number, CellMark> = {};
  if (s.l < s.arr.length) marks[s.l] = { label: "l", tone: "accent" };
  if (s.r >= 0) marks[s.r] = { label: s.l === s.r ? "l,r" : "r", tone: "accent" };
  if (s.found) {
    marks[s.found[0]] = { label: "l", tone: "good" };
    marks[s.found[1]] = { label: "r", tone: "good" };
  }
  return (
    <div>
      <ArrayView values={s.arr} marks={marks} />
      <p className="text-sm">target sum = {s.target}</p>
    </div>
  );
}

function WindowRender({ state: s }: { state: WindowState }) {
  const marks: Record<number, CellMark> = {};
  s.arr.forEach((_, i) => {
    if (i >= s.start && i < s.start + s.k) marks[i] = { tone: "accent" };
  });
  if (s.bestStart !== null && s.bestStart !== s.start) {
    for (let i = s.bestStart; i < s.bestStart + s.k; i++) marks[i] = { tone: "good" };
  }
  return (
    <div>
      <ArrayView values={s.arr} marks={marks} />
      <p className="text-sm">
        window sum = {s.sum ?? "-"} · best = {s.best ?? "-"}
      </p>
    </div>
  );
}
/** Shared renderer for the comparison sorts: the array with marks, an optional lifted key, and merge buffers. */
function SortFrameRender({ state: s }: { state: SortFrame }) {
  return (
    <div>
      <ArrayView values={s.arr} marks={s.marks} />
      {s.held !== null && (
        <p className="text-sm">
          Holding key = <b className="font-mono">{s.held}</b>
        </p>
      )}
      {s.aux && (
        <div className="mt-1 space-y-1 text-xs" aria-label="Merge buffers">
          {([["left half", s.aux.left, s.aux.i], ["right half", s.aux.right, s.aux.j]] as const).map(([name, vals, pos]) => (
            <div key={name} className="flex items-center gap-1">
              <span className="w-16 text-muted-fg">{name}</span>
              {vals.map((v, k) => (
                <span
                  key={k}
                  className={`inline-flex h-7 min-w-7 items-center justify-center rounded border px-1 font-mono ${k < pos ? "border-border opacity-40" : k === pos ? "border-accent bg-accent/15" : "border-border"}`}
                >
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export const VISUALIZERS = {
  "binary-search": {
    title: "Binary search",
    pseudocode: BINARY_SEARCH_CODE,
    defaultInput: "2 5 8 12 16 23 38 56 72 91\n23",
    inputHelp: "Line 1: numbers (sorted for you). Line 2: target.",
    generate: binarySearchSteps,
    Render: BinarySearchRender,
  } satisfies VisualizerDef<BSState>,
  "bubble-sort": {
    title: "Bubble sort",
    pseudocode: BUBBLE_SORT_CODE,
    defaultInput: "5 1 4 2 8 3",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: bubbleSortSteps,
    Render: SortRender,
  } satisfies VisualizerDef<SortState>,
  "two-pointers": {
    title: "Two pointers: pair with a given sum",
    pseudocode: TWO_POINTERS_CODE,
    defaultInput: "1 2 4 7 11 15 19\n18",
    inputHelp: "Line 1: numbers (sorted for you). Line 2: target sum.",
    generate: twoPointersSteps,
    Render: TwoPointersRender,
  } satisfies VisualizerDef<TwoPtrState>,
  "sliding-window": {
    title: "Sliding window: maximum sum of k consecutive",
    pseudocode: SLIDING_WINDOW_CODE,
    defaultInput: "2 1 5 1 3 2 9 1\n3",
    inputHelp: "Line 1: numbers. Line 2: window size k.",
    generate: slidingWindowSteps,
    Render: WindowRender,
  } satisfies VisualizerDef<WindowState>,
  "insertion-sort": {
    title: "Insertion sort",
    pseudocode: INSERTION_SORT_CODE,
    defaultInput: "5 2 4 6 1 3",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: insertionSortSteps,
    Render: SortFrameRender,
  } satisfies VisualizerDef<SortFrame>,
  "merge-sort": {
    title: "Merge sort",
    pseudocode: MERGE_SORT_CODE,
    defaultInput: "38 27 43 3 9 82 10",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: mergeSortSteps,
    Render: SortFrameRender,
  } satisfies VisualizerDef<SortFrame>,
  "quick-sort": {
    title: "Quick sort",
    pseudocode: QUICK_SORT_CODE,
    defaultInput: "8 3 7 1 9 2 6",
    inputHelp: "Numbers separated by spaces (max 16).",
    generate: quickSortSteps,
    Render: SortFrameRender,
  } satisfies VisualizerDef<SortFrame>,
};

export type VisualizerName = keyof typeof VISUALIZERS;
