# Contributing

Thanks for helping! Small fixes (typos, clearer wording, extra quiz questions) are very welcome as plain pull requests.

## Setup

```bash
pnpm install
pnpm dev
```

## Adding a lesson

1. Pick the module folder under `content/cp/` or `content/sd/` (create `_module.json` for a new module).
2. Add `<slug>.mdx` with the frontmatter below.
3. Run `pnpm validate <track>/<module>`; it fails on bad frontmatter, unknown prerequisites/problems and broken internal links.

```yaml
---
title: Binary Search
track: cp                  # cp | sd
module: sorting-and-searching   # must equal the folder name
order: 1                   # unique within the module
difficulty: easy           # beginner | easy | medium | hard | expert
estMinutes: 30
prerequisites: []          # lesson ids: "track/module/slug"
tags: [binary-search]
type: lesson               # lesson | problem | quiz | case-study | project
problems: [count-at-most]
furtherReading:
  - title: cp-algorithms, Binary search
    url: https://cp-algorithms.com/num_methods/binary_search.html
---
```

## Adding a problem

Create `content/problems/<id>.json` (schema: `src/lib/content/problem.ts`). Requirements:

- An **original** statement; cite the inspiration in `source`, never copy text.
- At least 5 tests including edge cases and a near-maximum case (keep the file small: tests ship to the browser).
- Hints (3), an editorial, the intended complexity, starter code, and reference solutions (Python required).
- `pnpm verify <id>` must pass. CI runs every solution in every language.

## Adding a visualizer

1. Write a pure step generator in `src/visualizers/algorithms.ts` returning `Step[]` (and a unit test in `tests/`).
2. Add a renderer and register it in `src/visualizers/registry.tsx`.
3. Use it with `<Visualizer name="your-name" />`.

## Content style guide

Tone: clear, friendly, precise. Every concept follows **intuition → formal definition → worked example → code → pitfalls**, then practice and a quiz.

- Be exact with complexities and recurrences; run every code sample.
- Prefer a small honest example to a long abstract explanation.
- System design claims must state assumptions; figures are approximations unless sourced.
- Link canonical sources (cp-algorithms, CSES, CLRS, DDIA) under "Further reading".

## Pull requests

Use conventional commits (`feat:`, `fix:`, `docs:`, `content:`). CI must be green: lint, typecheck, tests, validate, verify, build.