# Authoring guide (humans and agents)

Read `CLAUDE.md`, `docs/PLAN.md`, and two exemplar lessons before writing:
`content/cp/sorting-and-searching/binary-search.mdx` (CP) and
`content/sd/what-is-system-design/requirements-and-framework.mdx` (SD). Match their depth and tone.

## Layout

- Module: `content/<cp|sd>/<module-slug>/_module.json` `{title, level, order, summary}` (`order` = module number from the curriculum).
- Lesson: `content/<track>/<module-slug>/<lesson-slug>.mdx`, with frontmatter:

```yaml
---
title: ...
track: cp            # or sd; must match the folder
module: <module-slug> # must equal the folder name
order: 1             # 1-based, unique within the module
difficulty: beginner|easy|medium|hard|expert
estMinutes: 25       # integer, 1..240
prerequisites: []    # lesson ids "track/module/lesson-slug" that exist
tags: [..]
type: lesson         # lesson|problem|quiz|case-study|project
problems: [id, ...]  # ids of content/problems/<id>.json used in the lesson
furtherReading:      # canonical sources (cp-algorithms, CSES, CLRS, DDIA, ...)
  - title: ...
    url: https://...
---
```

Do **not** put an H1 in the body (the page renders the title). Start with `## Intuition`.
Internal links must be absolute with trailing slash: `/cp/<module>/<lesson>/`. The validator fails on broken ones, so only link to lessons that exist (or are in your own batch).

## Lesson structure (every concept)

intuition -> formal definition -> worked example -> code -> pitfalls -> practice -> quiz -> (further reading via frontmatter).
Be technically exact: check complexities and recurrences, and **run every code sample** you include (Python locally; Java with `java File.java`; C++ cannot be compiled on this machine, so write it carefully and keep it simple).
Original explanations only; never copy text or statements from other sites.

## Components available in MDX

```mdx
<Callout type="tip|note|warning|pitfall" title="optional">text</Callout>

<Complexity time="O(n log n)" space="O(n)" note="optional" />

<Tabs>
<Tab label="C++">

```cpp
...
```

</Tab>
<Tab label="Python">

```python
...
```

</Tab>
</Tabs>

<CodeRunner language="python" code={`print(input())`} stdin={"hi\n"} />
<CodeRunner snippets={{ python: `...`, javascript: `...` }} />   {/* python + javascript run in-browser */}

<Problem id="cp3-prefix-sums-range" />

<Quiz id="unique-quiz-id" tags={["tag"]} questions={[
  { type: "mcq", q: "...", options: ["a","b","c","d"], answer: 1, explain: "..." },
  { type: "multi", q: "...", options: [...], answer: [0, 2], explain: "..." },
  { type: "predict", q: "What does this print?", code: "print(1+1)", options: [...], answer: 0, explain: "..." },
]} />

<TradeOffs caption="..." rows={[{ option, pros, cons, chooseWhen }]} />

<Diagram kind="mermaid" code={`flowchart LR
  A --> B`} caption="..." />
<Diagram kind="flow" caption="..." nodes={[{ id, label, x, y, role, failureModes: [..], tradeoffs: [..] }]} edges={[{ from, to, label }]} />

<Visualizer name="binary-search" />   {/* only: "binary-search", "bubble-sort" for now */}
```

MDX gotchas: leave a blank line before and after fenced code inside `<Tab>`; in prose, wrap `<`, `>`, `{`, `}` in backticks (e.g. `a < b`), or the MDX compiler fails; JSX attribute strings do not process `\n` (use `{"...\n"}` expressions). Each Quiz needs a globally unique `id`; each question needs 3-4 options with exactly the stated answer index/indices.

## Problems (CP only): `content/problems/<id>.json`

Problem ids are prefixed with the module number you own (e.g. `m05-`) so batches never collide. Schema is `src/lib/content/problem.ts`:

```
id, title, source{name,url?}, rating (800..3500), tags[], statement (markdown, ORIGINAL),
constraints[], timeLimitMs, tests[{input, output, hidden}] (>=5; >=1 visible example; include edge cases and a near-max case),
hints[3], editorial (markdown), complexity{time,space} (each one of O(1), O(log n), O(n), O(n log n), O(n^2), O(n^3), O(2^n), O(n!)),
starter{python (required), javascript?, cpp?, java?}, solutions{python (required), javascript?, cpp?, java?}
```

- Tests ship to the browser: keep each problem JSON under ~60 KB (so max-style tests use n of a few thousand, and the statement says so); explain the real-scale constraint in the editorial.
- Input/output are stdin/stdout text. Python reads with `input()` / `sys.stdin`. JavaScript uses `readLine()` (returns the next line or null). Java: class `Main`, C++: standard `main`.
- **Generate tests with a throwaway Python script in your scratchpad** that includes an independent brute force to compute expected outputs (and cross-checks it against the reference solution on random small cases). Write the JSON from the script; do not hand-compute outputs.
- Provide solutions in python, javascript and java (C++ too when you can write it with high confidence). They are all executed by CI.
- Verify: `pnpm verify <id-prefix>` (e.g. `pnpm verify m05-`). It must print "passed" with zero failures. `g++` is unavailable locally, so C++ is skipped here and verified in CI.
- Wrong/partial solutions must actually fail: pick tests so naive/overflow mistakes are caught.
- Problems per lesson: at least 1 embedded `<Problem>` per lesson (more is better), plus a "Problem ladder" section with 3-6 external links (Codeforces/AtCoder/CSES/LeetCode) of the same technique, each as a markdown link with the problem name and rating where known. Only link problems you are confident exist; prefer CSES task URLs and Codeforces `https://codeforces.com/problemset/problem/<contest>/<index>` ones you know well.

## System design lessons

Each lesson: requirements/intuition, concrete numbers where relevant, at least one `<Diagram>` (flow diagrams must have role + failureModes + tradeoffs on every node), a `<TradeOffs>` table, a "What would you choose and why?" prompt, failure-mode discussion, pitfalls, a `<Quiz>` (3+ questions), and furtherReading (DDIA, official docs, well-known papers/blogs). Technically correct claims only: when unsure of a figure, state it as an approximation or omit it.

## Rules for parallel authors

- Touch **only** your own module folders and your own `content/problems/<prefix>*` files. Never edit `src/`, `scripts/`, `docs/`, other modules, or the visualizer registry.
- Do NOT run `pnpm build` / `pnpm dev` (they use shared output dirs) and do NOT run git commands that change state; the coordinator commits.
- Check your work with `pnpm validate <track>/<module-slug>` (prefix filter) and `pnpm verify <id-prefix>`. Other authors' files may be mid-write, so ignore errors that are not in your files.
- On Windows/PowerShell, add the pnpm path first: `$env:Path += ";" + (npm prefix -g)`.
- Final report (short): files written, lesson count, problem ids, anything unverified or skipped.
