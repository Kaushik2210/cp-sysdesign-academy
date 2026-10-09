# Decisions

Format: date — decision — why.

- 2026-10-09 — Fresh git repo in the project folder; the parent home directory is itself a git repo, so nested `git init` keeps history isolated.
- 2026-10-09 — MDX via `next-mdx-remote/rsc` instead of `@next/mdx`: lets frontmatter be parsed and Zod-validated per file at build time and keeps content outside `src/app`.
- 2026-10-09 — pnpm installed globally via npm (was absent).
- 2026-10-09 — Local machine has no `g++`; C++ reference solutions are verified in CI only, Python/Java locally. COVERAGE.md states this.
- 2026-10-09 — Depth over breadth: Levels 0–2 first; higher levels marked Planned if not reached.
- 2026-10-09 — Python solutions are the canonical tested solutions for every problem (executable in-browser too); C++/Java variants are added where verified.
