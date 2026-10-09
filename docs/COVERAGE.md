# Content coverage

Status legend: **Complete** (full module as specified, all code/solutions executed), **Partial** (some lessons written), **Planned** (not started). Updated honestly after every phase.

## Platform

| Area | Status | Notes |
| --- | --- | --- |
| Static site, lessons, sidebar, TOC, progress | Complete | |
| Code runner (Python/JS in browser) | Complete | Python via Pyodide (CDN), JS in a Worker |
| C++/Java execution | Partial | Needs `NEXT_PUBLIC_JUDGE0_URL`; otherwise "run locally" message |
| Problem judge (AC/WA/TLE/RE, hints, editorial, complexity check) | Complete | Hidden tests ship to the client (static site) |
| Quiz (MCQ/multi/predict) + SM-2 review queue | Complete | |
| Visualizer framework | Complete | 2 visualizers so far (binary search, bubble sort) |
| Diagram (Mermaid + React Flow) | Complete | |
| Search (Cmd/K), learning paths, achievements, streak calendar | Planned | |
| Playwright e2e | Planned | Browser checks were done manually against the static export |

## Track 1: Competitive Programming

| Module | Status | Lessons written |
| --- | --- | --- |
| 1 How CP works | Partial | 1 of ~5 |
| 6 Sorting and binary search | Partial | 1 (Binary Search) |
| All other modules (2-5, 7-26) | Planned | 0 |
| Pattern library, template library, problem ladder | Planned | |

## Track 2: System Design

| Module | Status | Lessons written |
| --- | --- | --- |
| 1 What is system design | Partial | 1 of ~3 |
| All other modules (2-28) | Planned | 0 |
| Interview playbook, glossary, cheat sheets, sandboxes | Planned | |

## Verification

- Problems: 2 (`array-total`, `count-at-most`), each with 7 tests and reference solutions in Python, JavaScript, Java and C++.
- `pnpm verify` runs Python/JS/Java locally; C++ is verified only in CI (no `g++` on the authoring machine).