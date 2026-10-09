"use client";

import { ArrayView, type CellMark } from "./ArrayView";
import {
  BINARY_SEARCH_CODE,
  BUBBLE_SORT_CODE,
  binarySearchSteps,
  bubbleSortSteps,
  type BSState,
  type SortState,
} from "./algorithms";
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
};

export type VisualizerName = keyof typeof VISUALIZERS;
