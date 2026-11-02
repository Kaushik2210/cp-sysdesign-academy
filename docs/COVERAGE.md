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
| Zero-to-elite roadmap | Complete | 10 phases, 216 steps; steps for unwritten modules are marked Not on this site yet |
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
| 11 Graphs: shortest paths and connectivity | Partial (9 lessons: Dijkstra, union-find, minimum spanning tree, topological sort, Bellman-Ford, bipartite graphs, maximum flow with Dinic, strongly connected components, bridges and articulation points; no min-cost flow, matching algorithms or block-cut trees yet) | 9 |
| 12 Range queries and segment trees | Partial (4 lessons: segment tree, Fenwick tree, sparse table, lazy propagation; no persistent trees or sqrt decomposition yet) | 4 |
| 13 Dynamic programming | Partial (9 lessons: 0/1 knapsack, longest increasing subsequence, coin change, edit distance and LCS, grid paths, bitmask DP, interval DP, digit DP, DP optimisations (convex hull trick, divide and conquer, Knuth); no Aliens trick or Li Chao tree implementation yet) | 9 |
| 14 String matching | Partial (3 lessons: KMP, Z-function, suffix arrays with LCP; no suffix automaton, Aho-Corasick or hashing lesson yet) | 3 |
| 15 Trees and ancestors | Partial (4 lessons: LCA with binary lifting, Euler tours and subtree queries, tree DP and the diameter, heavy-light decomposition; no rerooting or centroid decomposition yet) | 4 |
| 17 Number theory II | Partial (3 lessons: extended Euclid and CRT, Euler totient and Moebius, Miller-Rabin and Pollard rho; no FFT/NTT, discrete logarithm or quadratic residues yet) | 3 |
| 25 Geometry | Partial (3 lessons: cross product and segments, convex hull, closest pair; no half-plane intersection, sweep-line segment intersection or circle problems yet) | 3 |
| 16, 18-24, 26 (Levels 2-3) | Planned | 0 |

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
| 11 Distributed theory | Complete (4: CAP and PACELC, consistency and quorums, time and clocks, 2PC and sagas) | 4 |
| 12 Consensus and coordination | Partial (3: why consensus and Paxos, Raft, locks and fencing) | 3 |
| 13 Microservice patterns | Partial (3: monolith vs microservices, resilience patterns, event-driven/CQRS/event sourcing; no service mesh or API versioning lesson) | 3 |
| 14 Search | Partial (3: inverted index and text analysis, BM25 relevance, distributed search architecture; no vector search or query-understanding lesson) | 3 |
| 15 Security | Partial (4: authentication and OAuth, authorization, secrets/encryption/TLS, web attacks and threat modelling; no privacy-compliance lesson) | 4 |
| 16 Observability and reliability | Partial (3: logs/metrics/traces, SLOs and error budgets, safe deployments and incident response; no capacity-testing lesson) | 3 |
| 17 Case studies | Partial (17: URL shortener, news feed, chat, payments, ride hailing and proximity search, distributed key-value store, video streaming, search autocomplete, web crawler, notifications, collaborative editing, ticket booking, metrics monitoring, file sync, stock exchange, social graph, e-commerce checkout; no food delivery, hotel booking, ad server or leaderboard designs yet) | 17 |
| 18-26 (more case studies) | Planned | 0 |
| 27 LLD: OOP, SOLID and patterns | Partial (3: SOLID, creational and structural patterns, behavioural patterns; no concurrency patterns or UML lesson) | 3 |
| 28 LLD case studies | Partial (3: parking lot, LRU cache with TTL, elevator; no vending machine, library system, chess or splitwise-style designs yet) | 3 |

## Known gaps and caveats

- `furtherReading` and problem-ladder URLs were written from memory and have **not** been link-checked.
- C++ reference solutions are verified only in CI (no `g++` on the authoring machine); Python, JS and Java run locally via `pnpm verify`.
- Problems are scaled down (tests ship to the browser); editorials state real-scale constraints.
- Lessons per module are 4-5, below the 4-10 target for some modules; practice problems per lesson are about 1 embedded plus external ladder links, not 3-8 embedded.
