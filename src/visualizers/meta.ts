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
    name: "insertion-sort",
    title: "Insertion sort",
    category: "sorting",
    summary: "Grow a sorted prefix by lifting each new element out and shifting larger ones right to make room.",
    complexity: "O(n^2) worst case, O(n) on nearly sorted input",
    lessons: ["cp/sorting-and-searching/sorting-for-problem-solving"],
  },
  {
    name: "merge-sort",
    title: "Merge sort",
    category: "sorting",
    summary: "Split in halves, sort each recursively, then merge the sorted halves by repeatedly taking the smaller front element.",
    complexity: "O(n log n)",
    lessons: ["cp/sorting-and-searching/sorting-for-problem-solving", "cp/complexity-analysis/recurrences-and-master-theorem"],
  },
  {
    name: "quick-sort",
    title: "Quick sort",
    category: "sorting",
    summary: "Partition around a pivot so smaller values go left and larger go right, which fixes the pivot in place; recurse on both sides.",
    complexity: "O(n log n) on average, O(n^2) worst case",
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
  {
    name: "bfs-grid",
    title: "BFS on a grid",
    category: "graphs",
    summary: "Explore a maze layer by layer with a queue; the first time E is popped, the route is a shortest one.",
    complexity: "O(rows x cols)",
    lessons: ["cp/stacks-and-queues/queues-deques-bfs"],
  },
  {
    name: "dfs-grid",
    title: "DFS on a grid",
    category: "graphs",
    summary: "Explore a maze by committing to one direction with a stack and backing up at dead ends; finds a route but not necessarily the shortest.",
    complexity: "O(rows x cols)",
    lessons: ["cp/stacks-and-queues/queues-deques-bfs"],
  },
  {
    name: "dijkstra",
    title: "Dijkstra's shortest paths",
    category: "graphs",
    summary: "Repeatedly finalise the closest unfinished node using a min-heap and relax its edges; works because weights are never negative.",
    complexity: "O((V + E) log V)",
    lessons: [],
  },
  {
    name: "dsu",
    title: "Union-find (disjoint set union)",
    category: "data-structures",
    summary: "Keep sets as trees: find walks to the root and flattens the path, union hangs the smaller tree under the larger.",
    complexity: "O(alpha(n)) amortized per operation",
    lessons: [],
  },
  {
    name: "segment-tree",
    title: "Segment tree: range sums and point updates",
    category: "data-structures",
    summary: "Store the sum of every dyadic range so any range query combines O(log n) stored nodes and a point update fixes one root-to-leaf path.",
    complexity: "O(log n) per query and update",
    lessons: [],
  },
  {
    name: "knapsack",
    title: "0/1 knapsack: filling the DP table",
    category: "dp",
    summary: "Each cell is the best value using the first i items at capacity w: either skip the item or take it and look back by its weight.",
    complexity: "O(n * W)",
    lessons: [],
  },
];
