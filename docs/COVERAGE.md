# Content coverage

Legend: **Complete** = module as specified, all code/solutions executed; **Partial** = some lessons or less depth than specified; **Planned** = not started. Updated honestly after each phase.

## Platform

| Area | Status | Notes |
| --- | --- | --- |
| Static site, lessons, sidebar, TOC, progress, notes, bookmarks | Complete | |
| Code runner (Python/JS in browser) | Complete | Pyodide via CDN, JS in a Worker |
| C++/Java execution | Partial | Needs `NEXT_PUBLIC_JUDGE0_URL` |
| Problem judge, quizzes, SM-2 review queue | Complete | Hidden tests ship to the client |
| Visualizers | Complete (14 visualizers) | All 9 spec topics done: binary search, sorting (bubble, insertion, merge, quick), BFS and DFS on a grid, Dijkstra, union-find, segment tree, 0/1 knapsack, KMP, two pointers (plus sliding window). Every visualizer is linked from a lesson. Gallery at /visualizers/. |
| Diagrams (Mermaid, React Flow) | Complete | |
| Search (Cmd/K), learning paths, dashboard, achievements | Complete | |
| Hiring market page | Complete | 21 sourced findings (8 high-confidence), checked 2026-10-26; mostly US data, stale quickly |
| Zero-to-elite roadmap | Complete | 10 phases, 143 steps; steps for unwritten modules are marked Not on this site yet |
| Sitemap, link checker, validator (incl. MDX compile) | Complete | |
| Playwright e2e | Planned | `pnpm e2e` script exists, no specs yet |
| Interactive sandboxes | Complete | 5 simulators: consistent hashing, rate limiter, cache eviction, load balancer, design canvas; all unit tested, experiments verified against the simulators |
| Pattern library | Partial | 38 patterns; 8 point to planned lessons |
| Template library | Partial | 9 tested templates (Python/Java run locally, C++ in CI); spec lists many more (segment tree, LCA, Dinic, FFT...) |
| Glossary | Complete | 240 cross-linked system design terms (spec: 200+) |
| Interview playbook | Complete | 5 lessons, 25-question bank across 4 kinds, scoring rubric |
| Mock interview tool | Complete | Timer, phase prompts, rubric self-scoring and history; no AI grader, scores are self-reported |
| Numbers cheat sheet | Complete | Latency scale, powers of two, sizes, rules of thumb, 3 estimators |
| Trade-off cheat sheets | Complete | 14 side-by-side sheets, each validated to cover exactly its options |
| Problem ladder | Planned | |
| PDF per module | Partial | print CSS only |

## Track 1: Competitive Programming

| Module | Status | Lessons |
| --- | --- | --- |
| 1 How CP works | Complete (4 lessons) | 4 |
| 2 Language setup, fast I/O | Complete (4) | 4 |
| 3 Math basics | Complete (5) | 5 |
| 4 Complexity analysis | Complete (5) | 5 |
| 5 Arrays, strings, windows | Complete (5) | 5 |
| 6 Sorting and binary search | Complete (5) | 5 |
| 7 Stacks and queues | Complete (5) | 5 |
| 8 Hashing | Complete (5) | 5 |
| 9 Recursion and bitmasks | Complete (5) | 5 |
| 10 Greedy | Complete (5) | 5 |
| 11 Graphs: shortest paths and connectivity | Partial (2 lessons: Dijkstra, union-find) | 2 |
| 12 Range queries and segment trees | Partial (1 lesson; no lazy propagation, Fenwick tree or sparse table yet) | 1 |
| 13 Dynamic programming | Partial (1 lesson: 0/1 knapsack only) | 1 |
| 14 String matching | Partial (1 lesson: KMP only; no Z-function or suffix structures) | 1 |
| 15-26 (Levels 2-3) | Planned | 0 |

## Track 2: System Design

| Module | Status | Lessons |
| --- | --- | --- |
| 1 What is system design | Complete (4) | 4 |
| 2 Networking and APIs | Complete (5) | 5 |
| 3 Estimation | Complete (4; calculator is a runnable Python estimator, not a widget) | 4 |
| 4 Databases I | Complete (4) | 4 |
| 5 Load balancing | Complete (4) | 4 |
| 6 Caching | Complete (5) | 5 |
| 7 Databases II | Complete (5; no interactive hash-ring visualizer yet) | 5 |
| 8 Queues and streaming | Complete (5) | 5 |
| 9 Storage | Complete (4) | 4 |
| 10 Scalability and rate limiting | Complete (5; no interactive simulator yet) | 5 |
| 11-28 (Levels 2-4, case studies, LLD) | Planned | 0 |

## Known gaps and caveats

- `furtherReading` and problem-ladder URLs were written from memory and have **not** been link-checked.
- C++ reference solutions are verified only in CI (no `g++` on the authoring machine); Python, JS and Java run locally via `pnpm verify`.
- Problems are scaled down (tests ship to the browser); editorials state real-scale constraints.
- Lessons per module are 4-5, below the 4-10 target for some modules; practice problems per lesson are about 1 embedded plus external ladder links, not 3-8 embedded.
