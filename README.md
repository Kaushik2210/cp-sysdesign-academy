<div align="center">

# CP & SysDesign Academy

**An open-source, interactive course in competitive programming and system design.**
Runs entirely in your browser: no backend, no sign-up, progress stays on your device.

</div>

## Features

- **Two tracks**: Competitive Programming (basics to advanced) and System Design (beginner, building blocks, distributed systems, case studies, LLD).
- **Run code in the page**: Python (Pyodide) and JavaScript in Web Workers with a time limit; C++/Java via an optional Judge0 runner.
- **Judged problems**: AC / WA / TLE / RE verdicts, progressive hints, an editorial that unlocks on demand, a complexity self-check.
- **Quizzes** (MCQ, multi-select, predict-the-output) and a **spaced-repetition review queue** (SM-2) built from completed lessons and missed questions.
- **Visualizers** with play/pause/step/speed and highlighted pseudocode.
- **Interactive diagrams**: click a component to see its role, failure modes and trade-offs.
- **Pattern library** (problem signal to technique) and **algorithm templates** (copy-paste C++/Python/Java, each executed in CI).
- **Learning paths** that generate daily checklists, a **dashboard** (progress, streaks, weakest topics, achievements), **Cmd/Ctrl+K search**, notes and bookmarks, JSON export/import, print styles.
- Dark mode by default, keyboard accessible, honours `prefers-reduced-motion`.

> Content status is tracked honestly in [`docs/COVERAGE.md`](docs/COVERAGE.md).

## Screenshots

_Placeholder: add screenshots of the lesson page, problem judge and dashboard here._

## Quick start

```bash
corepack enable          # or: npm i -g pnpm
pnpm install
pnpm dev                 # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `pnpm build` | Validate content, build search index and sitemap, static export to `out/` |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Quality gates |
| `pnpm validate [prefix]` | Frontmatter, prerequisites, internal links, problem references |
| `pnpm verify [id-prefix]` | Run every reference solution against its test cases |
| `pnpm check-links` | After a build: every internal link in `out/` resolves |
| `pnpm e2e` | Playwright smoke tests |

## Deploy to GitHub Pages

1. Push to GitHub and enable **Settings → Pages → Source: GitHub Actions**.
2. The workflow in `.github/workflows/ci.yml` lints, tests, verifies solutions, builds with `NEXT_PUBLIC_BASE_PATH=/<repo-name>` and deploys on every push to `main`.
3. For a custom domain or user site, set `NEXT_PUBLIC_BASE_PATH` to an empty string.

### Optional: C++ and Java execution

Browsers cannot run C++/Java directly. Set `NEXT_PUBLIC_JUDGE0_URL` at build time to a [Judge0](https://github.com/judge0/judge0) instance you control (CORS must allow your site). Without it, those languages show a "run locally" hint.

## Tech stack

Next.js 15 (App Router, static export) · TypeScript strict · Tailwind CSS · MDX (next-mdx-remote) with Zod-validated frontmatter · Monaco · Pyodide · Framer Motion · Mermaid + React Flow · Zustand · FlexSearch · Vitest · Playwright · GitHub Actions · pnpm.

## Project layout

```
content/   MDX lessons, problems (JSON), learning paths
src/       app routes, components, runner, SRS, visualizers
scripts/   validate, verify solutions, search index, sitemap, link checker
docs/      PLAN, DECISIONS, COVERAGE, AUTHORING
```

## Roadmap

See [`docs/COVERAGE.md`](docs/COVERAGE.md) for module-by-module status. Planned: the remaining CP levels 2-3, SD case studies and LLD, template library, pattern library, problem ladder, more visualizers, and the design canvas sandbox.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/AUTHORING.md`](docs/AUTHORING.md). Every problem needs original statements, 5+ tests, and reference solutions that pass `pnpm verify`.

## License

Code: [MIT](LICENSE). Educational content under `content/`: [CC BY-SA 4.0](LICENSE-CONTENT.md).