/** Pure metadata for every visualizer, usable from server components (the registry itself is client-only). */
export type VizCategory = "searching" | "sorting" | "arrays" | "graphs" | "data-structures" | "dp" | "strings";

export const VIZ_CATEGORY_TITLE: Record<VizCategory, string> = {
  searching: "Searching",
  sorting: "Sorting",
  arrays: "Arrays and windows",
  graphs: "Graphs",
  "data-structures": "Data structures",
  dp: "Dynamic programming",
  strings: "Strings",
};

export interface VizMeta {
  /** Key in the registry; also the URL slug. */
  name: string;
  title: string;
  category: VizCategory;
  summary: string;
  complexity: string;
  /** Lessons on this site that teach the idea. Empty means the lesson is planned. */
  lessons: string[];
}

export const VIZ_META: VizMeta[] = [
  {
    name: "binary-search",
    title: "Binary search",
    category: "searching",
    summary: "Halve a sorted range each step by comparing the middle element with the target.",
    complexity: "O(log n)",
    lessons: ["cp/sorting-and-searching/binary-search"],
  },
  {
    name: "bubble-sort",
    title: "Bubble sort",
    category: "sorting",
    summary: "Repeatedly swap adjacent out-of-order pairs so the largest values sink to the end.",
    complexity: "O(n^2)",
    lessons: ["cp/sorting-and-searching/sorting-for-problem-solving"],
  },
  {
    name: "two-pointers",
    title: "Two pointers: pair with a given sum",
    category: "arrays",
    summary: "Move a left and right pointer inward on a sorted array to find a pair with a target sum.",
    complexity: "O(n)",
    lessons: ["cp/arrays-and-windows/two-pointers"],
  },
  {
    name: "sliding-window",
    title: "Sliding window: maximum sum of k consecutive",
    category: "arrays",
    summary: "Slide a fixed window across the array, updating the sum in O(1) per step.",
    complexity: "O(n)",
    lessons: ["cp/arrays-and-windows/sliding-window"],
  },
];