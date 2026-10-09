# cp-sysdesign-academy — Plan

A zero-backend, statically exported, interactive course site with two tracks:
**Competitive Programming (CP)** and **System Design (SD)**.

## 1. Architecture

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 App Router, TypeScript strict, `output: 'export'` |
| Styling | Tailwind CSS + shadcn/ui primitives, dark default, light toggle (`next-themes`) |
| Content | MDX files under `content/`, compiled at build time with `next-mdx-remote/rsc` (works with static export, no runtime fs). Frontmatter validated by Zod in `src/lib/content/schema.ts` |
| Code editing | Monaco (`@monaco-editor/react`), lazy-loaded via `next/dynamic` |
| Code execution | `public/workers/*.js` Web Workers: JS (sandboxed worker + timeout), Python (Pyodide, loaded from CDN on first use). C++/Java via a pluggable `Runner` interface; default is a Judge0 link-out behind `NEXT_PUBLIC_JUDGE0_URL` |
| Visualizers | React + Framer Motion + SVG; a generic `Visualizer` shell consumes a `Step[]` produced by pure generator functions (unit-testable) |
| Diagrams | Mermaid (static) and React Flow (interactive SD diagrams) |
| State | Zustand + `persist` (localStorage): progress, streaks, bookmarks, notes, SM-2 review queue, achievements; JSON export/import |
| Search | FlexSearch index generated at build time to `public/search-index.json`, queried client side (Cmd/Ctrl+K) |
| Tests | Vitest (unit + solution verification), Playwright smoke e2e |
| CI | GitHub Actions: lint, typecheck, test, validate content, verify solutions, build, deploy to Pages |
| Pkg manager | pnpm |

### Static-export constraints
- No server actions, no API routes, no `next/image` optimizer (`images.unoptimized`).
- `basePath`/`assetPrefix` from `NEXT_PUBLIC_BASE_PATH` (set to `/<repo>` in the Pages workflow).
- All dynamic routes use `generateStaticParams` over the content index.

## 2. Folder layout

```
content/
  cp/<NN-module-slug>/<NN-lesson-slug>.mdx
  sd/<NN-module-slug>/<NN-lesson-slug>.mdx
  extras/{glossary,cheatsheets,playbook,patterns}/...
  problems/<id>.json            # statement, tests, reference solutions
  templates/<slug>/{meta.json,main.cpp,main.py,Main.java}
  paths/*.json                  # learning paths
src/
  app/                          # routes
  components/{ui,layout,mdx,runner,problem,quiz,visualizer,diagram,dashboard}/
  lib/{content,store,runner,srs,search}/
  visualizers/                  # step generators + renderers
scripts/                        # validate-content, check-links, verify-solutions, gen-sitemap, gen-stats
docs/{PLAN,DECISIONS,COVERAGE}.md
tests/ e2e/
```

## 3. Content schema (Zod)

```ts
{
  title: string; track: 'cp'|'sd'|'extras'; module: string; order: number;
  difficulty: 'beginner'|'easy'|'medium'|'hard'|'expert';
  estMinutes: number; prerequisites: string[];  // lesson slugs "track/module/lesson"
  tags: string[]; type: 'lesson'|'problem'|'quiz'|'case-study'|'project';
  problems?: string[];          // ids under content/problems
  furtherReading?: {title,url}[];
}
```
`validate-content` fails on: bad frontmatter, unknown prerequisite/problem ids, broken internal links, duplicate orders, problems with <5 tests or failing reference solutions.

## 4. Problem format

`content/problems/<id>.json`: `{id,title,source?{name,url},rating,statement(md),constraints,examples[],tests[{input,output,hidden}],hints[3],editorial(md),complexity{time,space},solutions{py,cpp?,java?}}`.
`verify-solutions` runs every reference solution against every test (Python and Java locally, C++ when `g++` exists; CI has all three).
In-browser judging: Python (Pyodide) and JS run against all tests; verdicts AC/WA/TLE/RE.

## 5. Curriculum

### Track 1 — CP
- **L0 Foundations**: 1 How CP works · 2 Setup & fast I/O · 3 Math basics · 4 Complexity analysis
- **L1 Core**: 5 Arrays/prefix/two pointers · 6 Sorting & binary search · 7 Stacks/queues/monotonic · 8 Hashing · 9 Recursion/backtracking/bitmask · 10 Greedy
- **L2 Intermediate**: 11 Graphs I · 12 Shortest paths · 13 DSU & MST · 14 DP I · 15 Trees · 16 Heaps/ordered sets · 17 Number theory II · 18 Strings
- **L3 Advanced**: 19 Segment/Fenwick/Sparse · 20 DP II · 21 Graphs II · 22 Advanced trees · 23 Advanced strings · 24 Math/game theory/FFT · 25 Geometry · 26 Contest strategy
- **Extras**: Pattern library, Template library, Problem ladder (800–2400+), visualizers (binary search, sorting, BFS/DFS, Dijkstra, DSU, segment tree, knapsack, KMP, two pointers)

### Track 2 — SD
- **L0 Beginner**: 1 Framework · 2 Networking/APIs · 3 Estimation (calculator) · 4 Databases I
- **L1 Building blocks**: 5 LB/proxy/gateway · 6 Caching · 7 DB II (replication, sharding, consistent hashing) · 8 Queues/streams · 9 Storage · 10 Scalability & rate limiting
- **L2 Intermediate**: 11 Distributed theory · 12 Consensus · 13 Microservices patterns · 14 Search · 15 Security · 16 Observability/reliability
- **L3 Case studies**: 17–26 as in the brief
- **L4 LLD**: 27 OOP/SOLID/patterns · 28 LLD case studies
- **Extras**: Interview playbook, glossary (200+), cheat sheets, sandboxes (hash ring, rate limiter, LRU, LB simulator, design canvas)

## 6. Delivery phases and scope policy

Phases 1–2 (platform) first; then content with depth-first priority: Levels 0–2 of both tracks excellent before any Level 3/4. Anything not reached is marked **Planned** in `docs/COVERAGE.md`; nothing is claimed complete that is not.
Every code sample that ships is executed; every problem solution is run by CI.

## 7. Risks
- Scope is far beyond a single session of authoring; COVERAGE.md is the source of truth.
- No local `g++`: C++ verification happens in CI (ubuntu has it). Local verification covers Python/Java.
- Pyodide/Monaco need network (CDN) at runtime; documented, with graceful fallback messages.
