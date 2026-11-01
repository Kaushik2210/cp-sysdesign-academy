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
- 2026-10-27 — Visualizer lessons were added as modules 11 to 14 (graphs, range queries, dynamic programming, string matching), one to two lessons each, rather than waiting for the full 11-26 plan: the visualizers already existed and each deserves a lesson. The module numbers and names are provisional and may be reorganised when the rest of Levels 2 and 3 are written. Each lesson has one problem with Python, JavaScript and Java verified locally and a C++ solution verified in CI only (no `g++` here).

## Gallery-editorial UI (2026-11-01)

The aurora/gradient/glow look was replaced with a flat gallery style inspired by curated design-gallery sites: paper white and ink, one electric blue (`#0400D8`; a lighter periwinkle in dark mode), hairline borders, pill buttons and tags, a Helvetica-style system stack, medium-weight display type, and 16:9 art tiles on the home page. Choices worth knowing:

- **Default theme is now light** (was dark); the toggle and `.dark` tokens are unchanged. The e2e theme test was updated.
- **Legacy class names kept** (`text-gradient`, `bg-gradient-brand`, `ring-glow`) but redefined as flat blue, so every page restyled at once without touching each component. Prefer `pill`, `pill-solid`, `tag`, `eyebrow` and `text-accent` in new code.
- **`hot/cool/sun/leaf` are now semantic only** (errors and pitfalls, secondary blue, warnings, success); decoration uses accent and ink.
- **Body text stays at 15-16px**, larger than the reference site's 13px, to keep lessons readable and AA compliant.
- **No web fonts**: the static export stays fast and offline friendly.
- **Footer is always dark** so contrast holds in both themes.
- **Code blocks** fall back to ink when a token colour variable is absent (plain `text` blocks were near invisible in light mode).

## Maximalist arcade-zine pass (2026-11-01, supersedes the flat gallery pass above)

Pushed further on request, drawing on neo-brutalist and colour-blocked award sites. Choices worth knowing:

- **System:** cream paper (near-black violet in dark), ink borders (cream in dark), six pop fills (pink, yellow, mint, orange, lilac, sky) always paired with fixed `#0d0d0d` text so contrast holds in both themes; electric blue stays the interactive accent. Every `.border` is 2px, and `rounded-xl/2xl/3xl` bordered cards get a hard offset shadow automatically (opt out with `.no-shadow`).
- **Type:** Bricolage Grotesque (variable) for text and display, Space Mono for code, both self-hosted via `@fontsource` so the static export has no runtime font requests.
- **Motifs:** film grain overlay, tilted tape marquees, sticker labels, retro-OS window chrome on the live demo, a spinning badge, a scroll-driven giant word band, per-letter hover wave, a trailing cursor ring (skipped for automated browsers: it made headless e2e clicks about 8x slower in software rendering), and nav links that flash a different colour on hover.
- **Accessibility kept:** all motion (marquees, spin, wobble, cursor, scroll word) is disabled for `prefers-reduced-motion`; the cursor blob only runs for fine pointers and never replaces the real cursor; decorative elements are `aria-hidden` and `pointer-events: none` (a badge once covered the demo's play button, so decorative overlays must never be interactive); the visual "&" in the headline is CSS-generated with the real word "and" kept for screen readers.
- **Inline code** is ink on yellow in both themes (cream-on-translucent-yellow failed contrast in dark).
