# CLAUDE.md — conventions for cp-sysdesign-academy

## Commands (pnpm; on Windows add `npm prefix -g` to PATH if pnpm is not found)
- `pnpm dev` · `pnpm build` (static export to `out/`) · `pnpm lint` · `pnpm typecheck` · `pnpm test`
- `pnpm validate` content validator · `pnpm verify` runs every reference solution vs its tests

## Rules
- TypeScript strict; no `any` without a comment. Prefer server components; mark client components explicitly.
- Static export only: no API routes, no server actions, no runtime fs access outside build-time code.
- Heavy deps (Monaco, Pyodide, Mermaid, React Flow, visualizers) are lazy-loaded with `next/dynamic`.
- Content lives in `content/`; frontmatter schema is `src/lib/content/schema.ts`. Build must fail on invalid frontmatter or broken internal links.
- Lesson structure: intuition → formal definition → example → code → pitfalls → practice → quiz → further reading.
- Problems: original statements, cite inspiration, ≥5 tests (edge + max), reference solutions MUST pass `pnpm verify`.
- Never claim content complete in `docs/COVERAGE.md` unless it is. Record non-obvious choices in `docs/DECISIONS.md`.
- Accessibility: keyboard reachable, labelled controls, WCAG AA contrast, honour `prefers-reduced-motion`.
- Commits: conventional commits (`feat:`, `fix:`, `docs:`, `content:`, `chore:`).
