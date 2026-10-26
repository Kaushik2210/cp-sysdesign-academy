# Decisions

Format: date — decision — why.

- 2026-10-09 — Fresh git repo in the project folder; the parent home directory is itself a git repo, so nested `git init` keeps history isolated.
- 2026-10-09 — MDX via `next-mdx-remote/rsc` instead of `@next/mdx`: lets frontmatter be parsed and Zod-validated per file at build time and keeps content outside `src/app`.
- 2026-10-09 — pnpm installed globally via npm (was absent).
- 2026-10-09 — Local machine has no `g++`; C++ reference solutions are verified in CI only, Python/Java locally. COVERAGE.md states this.
- 2026-10-09 — Depth over breadth: Levels 0–2 first; higher levels marked Planned if not reached.
- 2026-10-09 — Python solutions are the canonical tested solutions for every problem (executable in-browser too); C++/Java variants are added where verified.
- 2026-10-09 — `blockJS: false` in next-mdx-remote: it silently strips expression props like `questions={[...]}`; content is repo-authored and trusted.
- 2026-10-09 — Pyodide stdin uses the raw-byte `read` API: the line-based `stdin()` callback truncated lines over ~8 KB (found by the max-size test).
- 2026-10-09 — Browser-judged problems keep test data small (~50 KB) because tests ship to the client; full-scale constraints are discussed in editorials. Reference solutions are never sent to the client.
- 2026-10-09 — MDX exposes the trade-off table as `<TradeOffs>` (JSX tag names cannot contain a hyphen).
- 2026-10-09 — Memory usage is not measurable in browser workers; shown as "n/a" unless an external runner reports it.
- 2026-10-26 — The UI was deliberately pushed to a maximalist, highly interactive style at the owner's request (aurora background, gradient type, spotlight cards, live hero demo, confetti, scrubbers). This overrides the HIG's restraint and deference principles, as the global rules allow for explicit instructions. Kept from the HIG: WCAG AA contrast in both themes, visible focus, 44px minimum targets, text labels alongside colour, and every animation honouring prefers-reduced-motion (no autoplay, no confetti, instant counters).
