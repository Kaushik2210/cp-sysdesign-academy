import { expect, test } from "@playwright/test";

const CP_LESSON = "/cp/sorting-and-searching/binary-search/";

test("landing page shows both tracks and stats", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("competitive programming and system design");
  await expect(page.getByRole("link", { name: "Competitive Programming" }).first()).toBeVisible();
  await expect(page.getByRole("region", { name: "Stats" })).toBeVisible();
});

test("track page lists modules and links to lessons", async ({ page }) => {
  await page.goto("/cp/");
  await expect(page.getByRole("heading", { name: "Competitive Programming" })).toBeVisible();
  await page.getByRole("link", { name: "Binary Search", exact: true }).first().click();
  await expect(page).toHaveURL(new RegExp(CP_LESSON));
});

test("lesson page has outline, TOC and prev/next navigation", async ({ page }) => {
  await page.goto(CP_LESSON);
  await expect(page.getByRole("heading", { level: 1, name: "Binary Search" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "On this page" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Lesson navigation" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Course outline" })).toBeVisible();
});

test("marking a lesson complete persists across reloads and shows on the dashboard", async ({ page }) => {
  await page.goto(CP_LESSON);
  const btn = page.getByRole("button", { name: /mark complete/i });
  await btn.click();
  await expect(page.getByRole("button", { name: /completed/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /completed/i })).toBeVisible();
  await page.goto("/dashboard/");
  await expect(page.getByText("lessons done")).toBeVisible();
  await expect(page.getByRole("region", { name: "Summary" }).getByText(/^1\/\d+$/)).toBeVisible();
});

test("Ctrl+K search finds a lesson and navigates to it", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  const box = page.getByRole("combobox", { name: "Search query" });
  await expect(box).toBeFocused();
  await box.fill("consistent hashing");
  const option = page.getByRole("option").first();
  await expect(option).toContainText("Consistent Hashing");
  await option.getByRole("button").click();
  await expect(page).toHaveURL(/consistent-hashing/);
});

test("theme toggle switches between light and dark", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(html).toHaveClass(/dark/);
});

test("learning path page renders a daily checklist", async ({ page }) => {
  await page.goto("/paths/sd-6-weeks/");
  await expect(page.getByRole("heading", { level: 1, name: /System Design in 6 weeks/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Day 1", exact: true })).toBeVisible();
});

test("full system design path reaches case studies and AI systems", async ({ page }) => {
  await page.goto("/paths/");
  await page.getByRole("link", { name: /Complete System Design in 90 days/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Complete System Design in 90 days" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Case Study: Design a Payment System", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Designing Reliable AI Agents/ })).toBeVisible();
});

test("wide lesson tables scroll independently on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/sd/databases-1/normalization-and-schema-design/");
  const table = page.getByRole("region", { name: "Lesson table" }).first();
  await expect(table.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  expect(await table.evaluate((element) => element.scrollWidth)).toBeGreaterThan(
    await table.evaluate((element) => element.clientWidth),
  );
  await table.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});

test("distributed systems lessons render with a runnable program and a quiz", async ({ page }) => {
  for (const [path, title] of [
    ["/sd/distributed-theory/consistency-models/", "Consistency Models and PACELC"],
    ["/sd/distributed-theory/clocks-and-ordering/", "Time, Clocks and Ordering"],
    ["/sd/distributed-theory/failure-detection-and-gossip/", "Failure Detection and Gossip"],
    ["/sd/distributed-theory/distributed-commit-and-sagas/", "Two-Phase Commit and Sagas"],
    ["/sd/consensus-and-coordination/consensus-and-majorities/", "Consensus and Majorities"],
    ["/sd/consensus-and-coordination/raft-leader-election/", "Raft Leader Election"],
    ["/sd/consensus-and-coordination/raft-log-replication-and-safety/", "Raft Log Replication and Safety"],
    ["/sd/consensus-and-coordination/leases-locks-and-fencing/", "Leases, Locks and Fencing Tokens"],
    ["/sd/microservice-patterns/service-boundaries-and-availability/", "Service Boundaries and Availability"],
    ["/sd/microservice-patterns/retry-amplification-and-circuit-breakers/", "Retry Amplification and Circuit Breakers"],
    ["/sd/microservice-patterns/cqrs-and-event-sourcing/", "CQRS and Event Sourcing"],
    ["/sd/microservice-patterns/evolving-apis-and-events/", "Evolving APIs and Events Safely"],
    ["/sd/search-systems/inverted-indexes-and-text-analysis/", "Inverted Indexes and Text Analysis"],
    ["/sd/search-systems/ranking-tf-idf-and-bm25/", "Ranking with TF-IDF and BM25"],
    ["/sd/search-systems/scatter-gather-search-and-tail-latency/", "Scatter-Gather Search and Tail Latency"],
    ["/sd/search-systems/vector-search-and-ann/", "Vector Search and Approximate Nearest Neighbours"],
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quiz" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Measured results" }).first()).toBeVisible();
  }
});

test("review queue page loads", async ({ page }) => {
  await page.goto("/review/");
  await expect(page.getByRole("heading", { name: "Review queue" })).toBeVisible();
});
test("pattern library filters by topic and search, and links to lessons", async ({ page }) => {
  await page.goto("/patterns/");
  await expect(page.getByRole("heading", { level: 1, name: "Pattern library" })).toBeVisible();
  const status = page.getByRole("status");
  await expect(status).toContainText(/\d+ of \d+ patterns/);

  await page.getByRole("searchbox", { name: /describe what you see/i }).fill("range sum");
  await expect(page.getByRole("heading", { name: /Prefix sums/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Dijkstra/ })).toHaveCount(0);

  await page.getByRole("searchbox", { name: /describe what you see/i }).fill("");
  await page.getByRole("button", { name: "dp", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Knapsack/ })).toBeVisible();

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("searchbox", { name: /describe what you see/i }).fill("prefix sums");
  await page.getByRole("link", { name: "Prefix Sums" }).first().click();
  await expect(page).toHaveURL(/arrays-and-windows\/prefix-sums/);
});
test("template library lists templates and shows code in three languages", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => undefined);
  await page.goto("/templates/");
  await expect(page.getByRole("heading", { level: 1, name: "Algorithm templates" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Filter templates" }).fill("dijkstra");
  await expect(page.getByRole("status")).toContainText("1 of");
  await page.getByRole("link", { name: "Dijkstra's shortest paths" }).click();

  await expect(page.getByRole("heading", { level: 1, name: /Dijkstra/ })).toBeVisible();
  const cpp = page.getByRole("tabpanel").filter({ hasText: "priority_queue" });
  await expect(cpp).toBeVisible();
  await page.getByRole("tab", { name: "Python" }).click();
  await expect(page.getByRole("tabpanel").filter({ hasText: "heapq" })).toBeVisible();
  await page.getByRole("tab", { name: "Java" }).click();
  await expect(page.getByRole("tabpanel").filter({ hasText: "PriorityQueue" })).toBeVisible();

  await page.getByRole("button", { name: /copy code/i }).click();
  await expect(page.getByText("Copied")).toBeVisible();
});
test("glossary searches, cross-links terms and deep-links from search", async ({ page }) => {
  await page.goto("/glossary/");
  await expect(page.getByRole("heading", { level: 1, name: "Glossary" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/\d+ of \d+ terms/);

  await page.getByRole("searchbox", { name: "Search terms" }).fill("vector clock");
  await expect(page.locator("#vector-clock")).toBeVisible();
  await expect(page.locator("#lamport-clock")).toHaveCount(0); // hidden by the filter
  // Following a related link to a filtered-out term clears the filter and scrolls to it.
  await page.locator("#vector-clock").getByRole("link", { name: "Lamport clock" }).click();
  await expect(page.locator("#lamport-clock")).toBeInViewport();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search query" }).fill("quorum");
  await page.getByRole("option").filter({ hasText: "Quorum" }).first().getByRole("button").click();
  await expect(page).toHaveURL(/glossary\/#quorum/);
});
test("hiring market page shows sourced findings and filters by confidence", async ({ page }) => {
  await page.goto("/market/");
  await expect(page.getByRole("heading", { level: 1, name: /Hiring market/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Five takeaways/ })).toBeVisible();
  const status = page.getByRole("status");
  await expect(status).toContainText(/\d+ findings/);
  const total = Number((await status.innerText()).match(/\d+/)![0]);

  await page.getByRole("checkbox", { name: /only high-confidence/i }).check();
  const strong = Number((await status.innerText()).match(/\d+/)![0]);
  expect(strong).toBeGreaterThan(0);
  expect(strong).toBeLessThan(total);
  await expect(page.getByText("Low confidence")).toHaveCount(0);

  const link = page.getByRole("link", { name: /Indeed Hiring Lab/ }).first();
  await expect(link).toHaveAttribute("href", /hiringlab\.indeed\.com/);
  await expect(link).toHaveAttribute("target", "_blank");
});
test.describe("phone width", () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const path of ["/", "/market/", "/glossary/", "/templates/", "/patterns/", "/roadmap/", "/mock/", "/cheatsheets/numbers/", "/cheatsheets/tradeoffs/", "/sandbox/consistent-hashing/", "/sandbox/rate-limiter/", "/sandbox/cache/", "/sandbox/load-balancer/", "/sandbox/design-canvas/", "/sandbox/", "/cp/", "/sd/", "/visualizers/merge-sort/", "/visualizers/bfs-grid/", "/visualizers/dijkstra/", "/visualizers/dsu/", "/visualizers/segment-tree/", "/visualizers/knapsack/", "/visualizers/kmp/", "/cp/sorting-and-searching/binary-search/"]) {
    test(`no horizontal page scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
test("roadmap shows ten phases, tracks progress and syncs with lesson completion", async ({ page }) => {
  await page.goto("/roadmap/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: /Zero to elite/ })).toBeVisible();
  await expect(page.getByRole("table", { name: /Roadmap phases/ }).getByRole("row")).toHaveCount(11); // header + 10 phases

  const overall = page.getByRole("progressbar", { name: "Overall roadmap progress" });
  const before = Number(await overall.getAttribute("aria-valuenow"));

  // Self-reported steps persist across reloads and move overall progress. The bar shows whole percents and the roadmap
  // has over 200 steps, so tick three of them to move it by at least one percent.
  const first = page.locator("#foundations").getByRole("checkbox").first();
  await first.check();
  await page.locator("#foundations").getByRole("checkbox").nth(1).check();
  await page.locator("#foundations").getByRole("checkbox").nth(2).check();
  await expect(first).toBeChecked();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#foundations").getByRole("checkbox").first()).toBeChecked();
  expect(Number(await overall.getAttribute("aria-valuenow"))).toBeGreaterThan(before);

  // A lesson step is backed by real lesson completion.
  const lessonBox = page.locator("#foundations").getByRole("checkbox").nth(4); // first lesson in the phase
  await lessonBox.check();
  await page.goto("/cp/how-cp-works/verdicts-and-contests/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("button", { name: /completed/i })).toBeVisible();
});

test("roadmap external resources open safely in a new tab", async ({ page }) => {
  await page.goto("/roadmap/");
  await page.locator("#problem-solving summary").click(); // phases other than the first start collapsed
  const link = page.getByRole("link", { name: /Competitive Programmer's Handbook/ }).first();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
});
test("mock interview: timed round, rubric scoring, saved history", async ({ page }) => {
  await page.goto("/mock/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Mock interviews" })).toBeVisible();

  await page.getByRole("button", { name: /Draw a question and start/ }).click();
  await expect(page.getByRole("timer", { name: "Time elapsed" })).toBeVisible();
  await expect(page.getByText(/Now: Clarify/)).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).click();

  await page.getByRole("button", { name: /Finish and review/ }).click();
  await expect(page.getByRole("heading", { name: /^Review:/ })).toBeVisible();

  const save = page.getByRole("button", { name: "Save attempt" });
  await expect(save).toBeDisabled();
  const groups = page.getByRole("radiogroup");
  const n = await groups.count();
  expect(n).toBe(8); // system design rubric has 8 dimensions
  for (let i = 0; i < n; i++) await groups.nth(i).locator("label").nth(2).click(); // score 3
  await expect(save).toBeEnabled();
  await save.click();
  await expect(page.getByRole("heading", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /Overall 75%/ })).toBeVisible();

  await expect(page.getByRole("heading", { name: /Your history \(1\)/ })).toBeVisible();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: /Your history \(1\)/ })).toBeVisible();

  await page.getByRole("button", { name: /Delete attempt/ }).click();
  await expect(page.getByRole("heading", { name: /Your history \(0\)/ })).toBeVisible();
});
test("numbers cheat sheet shows the latency scale and computes estimates", async ({ page }) => {
  await page.goto("/cheatsheets/numbers/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Numbers cheat sheet" })).toBeVisible();
  await expect(page.getByRole("table", { name: /latencies/ }).getByRole("row")).toHaveCount(14); // header + 13

  // Defaults describe 100M requests/day: about 3,472 peak qps, 10 servers at 70% utilisation of 500 qps.
  const result = (label: string) => page.locator("dt", { hasText: label }).locator("xpath=following-sibling::dd[1]");
  await expect(result("Servers needed")).toHaveText("10");
  await expect(result("Downtime allowed per year")).toHaveText("8.76 hours");

  await page.getByLabel("Availability target (%)").fill("99.99");
  await expect(result("Downtime allowed per year")).toHaveText("52.6 minutes");

  await page.getByLabel(/Component availabilities/).fill("99, 99");
  await expect(result("All components required (series)")).toHaveText("98.0100%");
  await expect(result("Any one is enough (parallel)")).toHaveText("99.990000%");

  // Garbage input never produces NaN.
  await page.getByLabel("Requests per day").fill("abc");
  await expect(page.getByText("NaN")).toHaveCount(0);
});
test("trade-off sheets compare options, filter by search and topic, and link to lessons", async ({ page }) => {
  await page.goto("/cheatsheets/tradeoffs/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Trade-off cheat sheets" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/14 of 14 sheets/);

  // Each sheet is a real comparison table with one column per option.
  const sql = page.locator("#sql-vs-nosql");
  await expect(sql.getByRole("columnheader", { name: "Relational (SQL)" })).toBeVisible();
  await expect(sql.getByRole("columnheader", { name: /NoSQL/ })).toBeVisible();
  await expect(sql.getByRole("heading", { name: /Choose Relational \(SQL\) when/ })).toBeVisible();

  const cache = page.locator("#cache-write-strategies");
  await expect(cache.getByRole("columnheader")).toHaveCount(4); // dimension + 3 options

  await page.getByRole("searchbox", { name: "Find a comparison" }).fill("websocket");
  await expect(page.getByRole("status")).toContainText(/1 of 14/);
  await expect(page.locator("#realtime-transports")).toBeVisible();
  await expect(page.locator("#sql-vs-nosql")).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Find a comparison" }).fill("");
  await page.getByRole("button", { name: "caching", exact: true }).click();
  await expect(page.locator("#cache-write-strategies")).toBeVisible();
  await expect(page.locator("#sql-vs-nosql")).toHaveCount(0);

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.locator("#api-styles").getByRole("link", { name: /REST, GraphQL/ }).click();
  await expect(page).toHaveURL(/api-styles-rest-graphql-grpc/);
});

test("global search deep-links to a trade-off sheet", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search query" }).fill("queue vs event stream");
  await page.getByRole("option").first().getByRole("button").click();
  await expect(page).toHaveURL(/cheatsheets\/tradeoffs\/#queue-vs-stream/);
});
test("consistent hashing sandbox: only a fraction of keys move, far fewer than hash mod N", async ({ page }) => {
  await page.goto("/sandbox/consistent-hashing/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Consistent hashing" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Hash ring with 4 nodes/ })).toBeVisible();

  await page.getByRole("button", { name: "Add a node" }).click();
  await expect(page.getByRole("img", { name: /Hash ring with 5 nodes/ })).toBeVisible();
  const text = await page.locator("#rs-change").locator("xpath=..").innerText();
  const [ring, ideal] = [...text.matchAll(/moved\s+([\d.]+)%\s+of keys \(ideal about ([\d.]+)%/g)][0].slice(1).map(Number);
  const mod = Number(text.match(/mod N would have moved\s+([\d.]+)%/)![1]);
  expect(ideal).toBeCloseTo(20, 0); // 1 / 5
  expect(ring).toBeGreaterThan(10);
  expect(ring).toBeLessThan(32);
  expect(mod).toBeGreaterThan(60); // hash mod N reshuffles most keys (theory: 80%)

  await page.getByRole("button", { name: "Remove Node B" }).click();
  await expect(page.getByRole("img", { name: /Hash ring with 4 nodes/ })).toBeVisible();

  // Fewer virtual nodes means a lopsided ring.
  await page.getByLabel("Virtual nodes per node").fill("1");
  await expect(page.getByText(/Busiest node is [\d.]+x the average/)).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("img", { name: /Hash ring with 4 nodes/ })).toBeVisible();
});
test("rate limiter sandbox reveals the fixed-window boundary flaw", async ({ page }) => {
  await page.goto("/sandbox/rate-limiter/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Rate limiter" })).toBeVisible();

  // Default: fixed window, limit 10, bursts either side of a boundary.
  const peak = page.locator("dt", { hasText: /Most requests accepted/ }).locator("xpath=following-sibling::dd[1]");
  await expect(peak).toContainText("20");
  await expect(peak).toContainText("exceeds the limit by 10");

  const row = (name: string) => page.getByRole("row", { name: new RegExp(name) });
  await expect(row("Fixed window counter")).toContainText("(over)");
  await expect(row("Sliding window log")).not.toContainText("(over)");

  // The exact sliding log holds the limit on the same traffic.
  await page.getByText("Sliding window log (exact)", { exact: true }).first().click();
  await expect(peak).toContainText("within the limit");

  // Token bucket absorbs one burst up to its size.
  await page.getByLabel("Traffic pattern").selectOption({ label: "One big burst, then quiet" });
  await page.getByText("Token bucket", { exact: true }).first().click();
  await expect(page.getByRole("img", { name: /Timeline of 30 requests/ })).toBeVisible();
});
test("cache sandbox steps through evictions and compares policies", async ({ page }) => {
  await page.goto("/sandbox/cache/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Cache eviction" })).toBeVisible();

  // Hand-checked: sequence A B C A D A E B A C with 3 slots -> LRU 3 hits, FIFO 2 hits.
  const run = page.getByRole("button", { name: "Run to end" });
  await run.click();
  await expect(page.getByText(/Hits so far: 3 of 10 \(30%\)/)).toBeVisible();

  await page.getByText("FIFO (first in, first out)", { exact: true }).first().click();
  await run.click();
  await expect(page.getByText(/Hits so far: 2 of 10 \(20%\)/)).toBeVisible();

  // Stepping one access at a time reports the miss on D and what was evicted (FIFO evicts A).
  await page.getByRole("button", { name: "Reset" }).click();
  const step = page.getByRole("button", { name: /^Step/ });
  for (let i = 0; i < 5; i++) await step.click();
  await expect(page.getByText(/Accessed D: MISS and evicted A/)).toBeVisible();

  // A loop slightly larger than the cache defeats LRU and FIFO entirely.
  await page.getByLabel("Traffic").selectOption({ label: "Looping scan slightly bigger than the cache" });
  const lru = page.locator("li", { hasText: "LRU (least recently used)" }).filter({ hasText: "% hits" }).last();
  await expect(lru).toContainText("0.0% hits");
});
test("load balancer sandbox: least connections wins on heavy-tailed work and ties round robin on uniform work", async ({ page }) => {
  await page.goto("/sandbox/load-balancer/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Load balancing" })).toBeVisible();

  const table = page.getByRole("table", { name: /Load balancing policies compared/ });
  const p99 = async (policy: RegExp) => {
    const row = table.getByRole("row", { name: policy });
    return Number((await row.getByRole("cell").nth(3).innerText()).split("\n")[0]);
  };

  // Defaults: 5 equal servers, 80% load, 10% of requests 20x more expensive.
  await expect(table.getByRole("row").nth(1)).toContainText("Least connections");
  expect(await p99(/Least connections/)).toBeLessThan(await p99(/Round robin/));

  // Uniform request cost: even counts now mean even work, so round robin matches least connections.
  await page.getByLabel(/20 times more expensive/).uncheck();
  expect(await p99(/Round robin/)).toBeCloseTo(await p99(/Least connections/), 1);
  expect(await p99(/Random/)).toBeGreaterThan(await p99(/Round robin/));

  // One slow server: weighted round robin and least connections adapt, plain round robin does not.
  await page.getByLabel(/20 times more expensive/).check();
  await page.getByLabel("Server sizes").selectOption({ label: "One server at half speed" });
  expect(await p99(/Weighted round robin/)).toBeLessThan((await p99(/Round robin/)) / 5);

  await page.getByText("Least connections", { exact: true }).last().click();
  await expect(page.getByText(/Sends each request to the server with the fewest requests in flight/)).toBeVisible();
});
test("design canvas reviews an architecture and updates as you edit it", async ({ page }) => {
  await page.goto("/sandbox/design-canvas/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { level: 1, name: "Design canvas" })).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(3);

  // The naive design: client, one app instance, one database.
  const score = page.getByTestId("score");
  await expect(score).toHaveText("56");
  await expect(page.getByText("App servers run as a single instance")).toBeVisible();
  await expect(page.getByText("Database has no replica")).toBeVisible();
  await expect(page.getByText("Every read goes to the database")).toBeVisible();

  // The robust reference design has nothing to flag.
  await page.getByRole("button", { name: "A robust design" }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(12);
  await expect(score).toHaveText("100");
  await expect(page.getByText("No issues found by this checklist.")).toBeVisible();

  // Wire a client straight to the database using the keyboard-accessible editor.
  await page.locator("#dc-from").selectOption({ label: "Client (client)" });
  await page.locator("#dc-to").selectOption({ label: "Database (db)" });
  await page.getByRole("button", { name: "Add connection" }).click();
  await expect(page.getByText("A client talks to the database directly")).toBeVisible();
  expect(Number(await score.innerText())).toBeLessThan(100);

  // Removing the connection clears the finding again.
  await page.getByRole("button", { name: /Remove connection from Client to Database/ }).click();
  await expect(page.getByText("A client talks to the database directly")).toHaveCount(0);
  await expect(score).toHaveText("100");

  // Reducing app instances to one introduces a single point of failure.
  await page.getByRole("button", { name: /^App servers x3$/ }).click();
  await page.getByRole("button", { name: "Fewer instances" }).click();
  await page.getByRole("button", { name: "Fewer instances" }).click();
  await expect(page.getByText("App servers run as a single instance")).toBeVisible();
  await expect(score).toHaveText("85");
});
test.describe("algorithm visualizers", () => {
  /** Step forward until the explanation says "Sorted." (or give up), returning the final array cells. */
  async function stepToEnd(page: import("@playwright/test").Page) {
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 80 && (await forward.isEnabled()); i++) await forward.click();
    return page.getByRole("list", { name: "Array state" }).locator("li > div").allInnerTexts();
  }
  const setInput = async (page: import("@playwright/test").Page, value: string) => {
    await page.getByRole("textbox").first().fill(value);
  };

  test("the gallery lists every visualizer by category", async ({ page }) => {
    await page.goto("/visualizers/");
    await expect(page.getByRole("heading", { level: 1, name: "Algorithm visualizers" })).toBeVisible();
    for (const name of ["Binary search", "Bubble sort", "Insertion sort", "Merge sort", "Quick sort"]) {
      await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    }
  });

  test("merge sort sorts the input and shows merge buffers along the way", async ({ page }) => {
    await page.goto("/visualizers/merge-sort/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1, name: "Merge sort" })).toBeVisible();
    await setInput(page, "3 1 2");
    let sawBuffers = false;
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 40 && (await forward.isEnabled()); i++) {
      if (await page.getByLabel("Merge buffers").count()) sawBuffers = true;
      await forward.click();
    }
    expect(sawBuffers).toBe(true);
    expect(await page.getByRole("list", { name: "Array state" }).locator("li > div").allInnerTexts()).toEqual(["1", "2", "3"]);
    await expect(page.getByText(/Sorted\./)).toBeVisible();
  });

  test("insertion sort lifts a key out of the array", async ({ page }) => {
    await page.goto("/visualizers/insertion-sort/");
    await page.waitForLoadState("networkidle");
    await setInput(page, "4 2 9 1");
    await page.getByRole("button", { name: "Step forward" }).click();
    await expect(page.getByText(/Holding key =/)).toBeVisible();
    expect(await stepToEnd(page)).toEqual(["1", "2", "4", "9"]);
  });

  test("quick sort partitions around a pivot and ends sorted", async ({ page }) => {
    await page.goto("/visualizers/quick-sort/");
    await page.waitForLoadState("networkidle");
    await setInput(page, "5 1 4 2 3");
    await page.getByRole("button", { name: "Step forward" }).click();
    await expect(page.getByText(/Partition \[0\.\.4\] around the pivot 3/)).toBeVisible();
    expect(await stepToEnd(page)).toEqual(["1", "2", "3", "4", "5"]);
  });

  test("the sorting lesson embeds the three sorts", async ({ page }) => {
    await page.goto("/cp/sorting-and-searching/sorting-for-problem-solving/");
    for (const t of ["Insertion sort", "Merge sort", "Quick sort"]) {
      await expect(page.getByRole("region", { name: `${t} visualizer` })).toBeVisible({ timeout: 15000 });
    }
  });
});
test.describe("grid search visualizers", () => {
  test("BFS finds the shortest route and shows distances", async ({ page }) => {
    await page.goto("/visualizers/bfs-grid/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("grid", { name: "Search grid" })).toBeVisible();
    await expect(page.getByLabel("Pending cells")).toContainText("Queue (front first): (0,0)");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 400 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByText(/Reached E\. BFS expands cells in order of distance/)).toBeVisible();
    await expect(page.getByRole("gridcell", { name: "row 5, column 8, end, 15" })).toBeVisible();
  });

  test("DFS uses a stack and a bad grid shows a friendly error", async ({ page }) => {
    await page.goto("/visualizers/dfs-grid/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("Pending cells")).toContainText("Stack (top first)");
    await page.getByRole("textbox").first().fill("S..");
    await expect(page.getByText(/needs one E/)).toBeVisible();
  });

  test("the BFS lesson embeds both searches", async ({ page }) => {
    await page.goto("/cp/stacks-and-queues/queues-deques-bfs/");
    await expect(page.getByRole("region", { name: "BFS on a grid visualizer" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("region", { name: "DFS on a grid visualizer" })).toBeVisible({ timeout: 15000 });
  });
});

test.describe("dijkstra visualizer", () => {
  test("computes the final distances and the shortest-path tree", async ({ page }) => {
    await page.goto("/visualizers/dijkstra/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("Heap")).toContainText("(0,A)");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 300 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByLabel("Distances")).toContainText("A=0 B=3 C=1 D=4 E=7 F=8");
    await expect(page.getByText(/Heap is empty/)).toBeVisible();
  });
  test("rejects negative weights with an explanation", async ({ page }) => {
    await page.goto("/visualizers/dijkstra/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").first().fill("A\nA B -1");
    await expect(page.getByText(/non-negative/)).toBeVisible();
  });
});

test.describe("union-find visualizer", () => {
  test("merges sets, compresses a path and shows the parent array", async ({ page }) => {
    await page.goto("/visualizers/dsu/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").first().fill("4\nunion 0 1\nunion 2 3\nunion 0 2\nfind 3");
    await expect(page.getByLabel("Parent array")).toContainText("[0, 1, 2, 3]");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 200 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByText(/Done: 1 set remain/)).toBeVisible();
    await expect(page.getByLabel("Parent array")).toContainText("[0, 0, 0, 0]");
  });
  test("explains an invalid operation", async ({ page }) => {
    await page.goto("/visualizers/dsu/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").first().fill("3\nunion 0 9");
    await expect(page.getByText(/numbered 0 to 2/)).toBeVisible();
  });
});

test.describe("segment tree visualizer", () => {
  test("answers range queries and updates a path", async ({ page }) => {
    await page.goto("/visualizers/segment-tree/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByLabel("Array")).toContainText("[5, 3, 8, 6, 2, 7, 4, 1]");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 300 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByText(/All operations done/)).toBeVisible();
    await expect(page.getByLabel("Array")).toContainText("[5, 3, 8, 10, 2, 7, 4, 1]");
  });
  test("shows a query result and rejects a reversed range", async ({ page }) => {
    await page.goto("/visualizers/segment-tree/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").first().fill("1 2 3 4\nquery 0 3");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 2; i++) await forward.click();
    await expect(page.getByText(/query\(0, 3\) = 10, assembled from 1 stored node/)).toBeVisible();
    await page.getByRole("textbox").first().fill("1 2 3 4\nquery 3 0");
    await expect(page.getByText(/left end must not be after/)).toBeVisible();
  });
});

test.describe("knapsack visualizer", () => {
  test("fills the table, finds the optimum and traces the chosen items", async ({ page }) => {
    await page.goto("/visualizers/knapsack/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("table", { name: "Knapsack table" })).toBeVisible();
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 400 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByRole("cell", { name: /^item 4, capacity 10: 90/ })).toBeVisible();
    await expect(page.getByLabel("Chosen items")).toContainText("2, 4");
    await expect(page.getByText(/Take items 2, 4: total weight 7 of 10, total value 90/)).toBeVisible();
  });
  test("rejects a zero-weight item", async ({ page }) => {
    await page.goto("/visualizers/knapsack/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").first().fill("5\n0 4");
    await expect(page.getByText(/weight must be at least 1/)).toBeVisible();
  });
});

test.describe("KMP visualizer", () => {
  test("builds the prefix function and finds every occurrence, including overlaps", async ({ page }) => {
    await page.goto("/visualizers/kmp/");
    await page.waitForLoadState("networkidle");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 400 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByLabel("Matches")).toContainText("0, 7, 9");
    await expect(page.getByRole("cell", { name: "pi 5: 4" })).toBeVisible();
    await expect(page.getByText(/the pattern occurs at positions 0, 7, 9/)).toBeVisible();
  });
  test("matches a pattern equal to the text and rejects bad input", async ({ page }) => {
    await page.goto("/visualizers/kmp/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("textbox").first().fill("aabaac\naabaac");
    const forward = page.getByRole("button", { name: "Step forward" });
    for (let i = 0; i < 400 && (await forward.isEnabled()); i++) await forward.click();
    await expect(page.getByLabel("Matches")).toContainText("0");
    await page.getByRole("textbox").first().fill("abc\nB");
    await expect(page.getByText(/pattern may only use lowercase/)).toBeVisible();
  });
});

test.describe("interactive, maximalist UI", () => {
  test("the home page playground sorts, shuffles and can be scrubbed", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const bars = page.getByTestId("bar");
    await expect(bars).toHaveCount(16);
    const values = async () => (await bars.evaluateAll((els) => els.map((e) => Number((e as HTMLElement).dataset.value)))) as number[];
    const before = await values();
    await page.getByRole("button", { name: "Shuffle" }).click();
    await expect.poll(async () => (await values()).join()).not.toBe(before.join());
    await page.getByRole("button", { name: "Merge", exact: true }).click();
    await expect(page.getByRole("button", { name: "Merge", exact: true })).toHaveAttribute("aria-pressed", "true");
    const scrub = page.getByRole("slider", { name: "Scrub steps" });
    const max = (await scrub.getAttribute("max")) as string;
    await scrub.fill(max);
    await expect(page.getByText(/Sorted\./).first()).toBeVisible();
    const done = await values();
    expect(done).toEqual([...done].sort((a, b) => a - b));
  });

  test("the playground play button toggles and replays when finished", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const scrub = page.getByRole("slider", { name: "Scrub steps" });
    await scrub.fill((await scrub.getAttribute("max")) as string);
    await page.getByRole("button", { name: "Replay" }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  });

  test("the current section is marked in the main navigation", async ({ page }) => {
    await page.goto("/visualizers/");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Visualizers" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Glossary" })).not.toHaveAttribute("aria-current", "page");
  });

  test("the visualizer gallery filters by category and by text", async ({ page }) => {
    await page.goto("/visualizers/");
    await expect(page.getByRole("status")).toContainText("Showing 14 of 14");
    await page.getByRole("button", { name: /^Graphs/ }).click();
    await expect(page.getByRole("status")).toContainText("Showing 3 of 14");
    await expect(page.getByRole("link", { name: "Dijkstra's shortest paths" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Merge sort", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: /^All/ }).click();
    await page.getByRole("searchbox", { name: /Filter visualizers/ }).fill("heap");
    await expect(page.getByRole("status")).toContainText("Showing 1 of 14");
    await page.getByRole("searchbox", { name: /Filter visualizers/ }).fill("zzzzzz");
    await expect(page.getByText(/Nothing matches that filter/)).toBeVisible();
  });

  test("a gallery card is a single link to its visualizer", async ({ page }) => {
    await page.goto("/visualizers/");
    await page.getByRole("link", { name: "KMP string matching" }).click();
    await expect(page).toHaveURL(/visualizers\/kmp\/$/);
  });

  test("the player has keyboard shortcuts and a scrubber", async ({ page }) => {
    await page.goto("/visualizers/merge-sort/");
    await page.waitForLoadState("networkidle");
    const player = page.getByRole("region", { name: "Merge sort visualizer" });
    await player.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(player.getByText(/Step 3\//)).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(player.getByText(/Step 2\//)).toBeVisible();
    await page.keyboard.press("Space");
    await expect(player.getByRole("button", { name: "Pause" })).toBeVisible();
    await page.keyboard.press("Space");
    await expect(player.getByRole("button", { name: "Play" })).toBeVisible();
    const scrub = player.getByRole("slider", { name: "Scrub through steps" });
    await scrub.fill("5");
    await expect(player.getByText(/Step 6\//)).toBeVisible();
  });

  test("typing in the input box does not trigger player shortcuts", async ({ page }) => {
    await page.goto("/visualizers/merge-sort/");
    await page.waitForLoadState("networkidle");
    const box = page.getByRole("textbox").first();
    await box.fill("3 1 2");
    await box.press("ArrowRight");
    await box.press("Space");
    await expect(page.getByText(/Step 1\//)).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
  });

  test("gallery tiles fill their arrow button on hover", async ({ page }) => {
    await page.goto("/");
    const tile = page.getByRole("link", { name: /Algorithm visualizers/ }).first();
    await tile.scrollIntoViewIfNeeded();
    const arrow = tile.locator(".arrow-btn");
    const before = await arrow.evaluate((el) => getComputedStyle(el).backgroundColor);
    await tile.hover();
    await expect.poll(() => arrow.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  });

  test("marking a lesson complete celebrates with confetti", async ({ page }) => {
    await page.goto("/cp/sorting-and-searching/sorting-for-problem-solving/");
    await page.getByRole("button", { name: "Mark complete" }).click();
    await expect(page.getByRole("button", { name: "Completed" })).toHaveAttribute("aria-pressed", "true");
    const bits = await page.evaluate(() => document.querySelectorAll('[data-confetti] span').length);
    expect(bits).toBeGreaterThan(10);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the playground does not autoplay and no confetti is fired", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await page.goto("/cp/sorting-and-searching/sorting-for-problem-solving/");
    await page.getByRole("button", { name: "Mark complete" }).click();
    await expect(page.getByRole("button", { name: "Completed" })).toBeVisible();
    expect(await page.evaluate(() => document.querySelectorAll('[data-confetti]').length)).toBe(0);
  });

  test("animated numbers show their final value immediately", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Stats" })).toContainText("224");
  });
});

test.describe("track, lesson and sandbox pages", () => {
  test("a module card shows progress after a lesson is completed", async ({ page }) => {
    await page.goto(CP_LESSON);
    await page.getByRole("button", { name: /mark complete/i }).click();
    await expect(page.getByRole("button", { name: /completed/i })).toBeVisible();
    await page.goto("/cp/");
    const bar = page.getByRole("progressbar", { name: "Sorting and Binary Search progress" });
    await expect(bar).toBeVisible();
    await expect(bar).not.toHaveAttribute("aria-valuenow", "0");
    await expect(page.getByRole("group", { name: "Competitive Programming progress" })).toContainText("1 / 107 lessons");
  });

  test("the lesson table of contents highlights the section being read", async ({ page }) => {
    await page.goto(CP_LESSON);
    await page.waitForLoadState("networkidle");
    const toc = page.getByRole("navigation", { name: "On this page" });
    const links = toc.getByRole("link");
    const second = links.nth(2);
    await second.click();
    await expect(toc.locator("a[aria-current='location']")).toHaveCount(1);
  });

  test("sandbox cards are single links", async ({ page }) => {
    await page.goto("/sandbox/");
    await page.getByRole("link", { name: "Cache eviction" }).click();
    await expect(page).toHaveURL(/sandbox\/cache\/$/);
  });

  test("callouts are announced as notes and keep their title", async ({ page }) => {
    await page.goto("/cp/sorting-and-searching/binary-search/");
    const notes = page.getByRole("note");
    expect(await notes.count()).toBeGreaterThan(0);
  });
});

test.describe("review queue flashcards", () => {
  async function seedCards(page: import("@playwright/test").Page) {
    // Completing a lesson adds its review card(s) to the deck.
    await page.goto(CP_LESSON);
    await page.getByRole("button", { name: /mark complete/i }).click();
    await expect(page.getByRole("button", { name: /completed/i })).toBeVisible();
  }

  test("the keyboard reveals and grades a card", async ({ page }) => {
    await seedCards(page);
    await page.goto("/review/");
    const show = page.getByRole("button", { name: "Show answer" });
    if (!(await show.count())) test.skip(true, "completing one lesson did not create a due card");
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /^Good/ })).toBeVisible();
    await page.keyboard.press("3");
    await expect(page.getByText(/All caught up|due/).first()).toBeVisible();
  });

  test("an empty deck says so", async ({ page }) => {
    await page.goto("/review/");
    await expect(page.getByRole("status")).toContainText("All caught up");
  });
});

test.describe("quiz feedback", () => {
  test("a perfect score shows markers and celebrates", async ({ page }) => {
    await page.goto("/cp/sorting-and-searching/sorting-for-problem-solving/");
    const quiz = page.getByRole("region", { name: "Quiz" });
    await quiz.getByRole("radio", { name: "The end (-1)" }).click();
    await quiz.getByRole("checkbox", { name: /^Any comparison sort needs Omega/ }).click();
    await quiz.getByRole("checkbox", { name: /^Counting sort runs in/ }).click();
    await quiz.getByRole("checkbox", { name: /^A stable sort keeps equal/ }).click();
    await quiz.getByRole("radio", { name: "bdac" }).click();
    await quiz.getByRole("radio", { name: /^It does not compare elements/ }).click();
    await quiz.getByRole("button", { name: "Check answers" }).click();
    await expect(quiz.getByText("Score:")).toContainText("4/4");
    expect(await page.evaluate(() => document.querySelectorAll("[data-confetti] span").length)).toBeGreaterThan(10);
  });

  test("a wrong answer shows a cross and no confetti", async ({ page }) => {
    await page.goto("/cp/sorting-and-searching/sorting-for-problem-solving/");
    const quiz = page.getByRole("region", { name: "Quiz" });
    await quiz.getByRole("radio", { name: "The start (+1)" }).click();
    await quiz.getByRole("button", { name: "Check answers" }).click();
    await expect(quiz.getByText("✗")).toBeVisible();
    await expect(quiz.getByText("✓").first()).toBeVisible();
    expect(await page.evaluate(() => document.querySelectorAll("[data-confetti]").length)).toBe(0);
  });
});

test.describe("visualizer lessons", () => {
  const LESSONS: [string, string, string][] = [
    ["/cp/graphs/dijkstra-shortest-paths/", "Shortest Paths with Dijkstra", "Cheapest Route"],
    ["/cp/graphs/union-find/", "Union-Find", "Same Group?"],
    ["/cp/range-queries/segment-trees/", "Segment Trees", "Sums With Updates"],
    ["/cp/dynamic-programming/knapsack/", "The 0/1 Knapsack", "Packing the Budget"],
    ["/cp/string-matching/kmp/", "KMP and the Prefix Function", "Find the Pattern"],
    ["/cp/range-queries/fenwick-trees/", "Fenwick Trees", "Count Below"],
    ["/cp/dynamic-programming/longest-increasing-subsequence/", "Longest Increasing Subsequence", "Longest Rise"],
    ["/cp/string-matching/z-function/", "The Z-Function", "String Similarity"],
    ["/cp/graphs/minimum-spanning-tree/", "Minimum Spanning Trees", "Cheapest Network"],
    ["/cp/graphs/topological-sort/", "Topological Sort", "Course Order"],
    ["/cp/dynamic-programming/coin-change/", "Coin Change", "Fewest Coins"],
    ["/cp/graphs/bellman-ford/", "Bellman-Ford", "Profit Loop"],
    ["/cp/dynamic-programming/edit-distance-and-lcs/", "Edit Distance", "Edit Steps"],
    ["/cp/trees/lowest-common-ancestor/", "Lowest Common Ancestor", "Meeting Point"],
    ["/cp/trees/euler-tour-subtree-queries/", "Euler Tours", "Team Totals"],
    ["/cp/dynamic-programming/grid-paths/", "Grid Paths", "Maze Routes"],
    ["/cp/graphs/bipartite-graphs/", "Bipartite Graphs", "Two Teams"],
    ["/cp/trees/tree-dp-and-diameter/", "Tree DP", "Longest Chain"],
    ["/cp/dynamic-programming/bitmask-dp/", "Bitmask DP", "Task Matching"],
    ["/cp/range-queries/sparse-table/", "Sparse Tables", "Lowest in Range"],
    ["/cp/range-queries/lazy-propagation/", "Lazy Propagation", "Range Boost"],
    ["/cp/dynamic-programming/interval-dp/", "Interval DP", "Merge the Crates"],
    ["/cp/graphs/bridges/", "Bridges and Low-Link", "Critical Links"],
    ["/cp/graphs/strongly-connected-components/", "Strongly Connected Components", "Mutual Reach"],
    ["/cp/dynamic-programming/digit-dp/", "Digit DP", "Digit Hunt"],
    ["/cp/trees/rerooting/", "Rerooting DP", "Distance Sums"],
    ["/cp/graphs/two-sat/", "2-SAT", "Lamp Rules"],
    ["/cp/graphs/maximum-flow/", "Maximum Flow and Dinic's Algorithm", "Pipe Network"],
    ["/cp/string-matching/manacher/", "Manacher's Algorithm", "Mirror Count"],
    ["/cp/string-matching/suffix-array/", "Suffix Arrays and LCP", "Fresh Substrings"],
    ["/cp/heaps-and-ordered-sets/heap-internals-and-k-way-merge/", "Heap Internals and k-way Merge", "Merge Sorted Streams"],
    ["/cp/heaps-and-ordered-sets/two-heaps-and-running-median/", "Two Heaps and the Running Median", "Running Median"],
    ["/cp/heaps-and-ordered-sets/order-statistics-with-fenwick-trees/", "Order Statistics with Fenwick Trees", "Order Statistics in a Changing Collection"],
    ["/cp/number-theory-ii/extended-euclid-and-linear-congruences/", "Extended Euclid and Linear Congruences", "Solve a Linear Congruence"],
    ["/cp/number-theory-ii/chinese-remainder-theorem/", "The Chinese Remainder Theorem", "Clock Alignment"],
    ["/cp/number-theory-ii/binomial-coefficients-modulo-a-prime/", "Binomial Coefficients Modulo a Prime", "Choose and Count"],
    ["/cp/tries-and-automata/tries-and-xor-queries/", "Tries and Maximum XOR Queries", "Largest XOR Partner"],
    ["/cp/tries-and-automata/aho-corasick/", "The Aho-Corasick Automaton", "Forbidden Words"],
    ["/cp/tries-and-automata/suffix-automaton/", "The Suffix Automaton", "Shared Stretch"],
    ["/cp/dynamic-programming-ii/sum-over-subsets-dp/", "Sum over Subsets (SOS) DP", "Submask Counts"],
    ["/cp/dynamic-programming-ii/broken-profile-dp/", "Broken Profile DP and Domino Tilings", "Tile the Floor"],
    ["/cp/dynamic-programming-ii/knuth-optimization/", "Knuth's Optimisation of Interval DP", "Cutting the Stick"],
    ["/cp/dynamic-programming-ii/li-chao-tree/", "The Li Chao Tree", "Best Line at a Point"],
    ["/cp/graphs-ii/euler-paths-and-hierholzer/", "Euler Paths and Hierholzer's Algorithm", "Smallest Itinerary"],
    ["/cp/graphs-ii/floyd-warshall-and-matrix-powers/", "Floyd-Warshall and Shortest Walks by Matrix Powers", "Cheapest Walk of Exactly k Roads"],
    ["/cp/graphs-ii/functional-graphs-and-binary-lifting/", "Functional Graphs and Binary Lifting", "Jump Stations"],
    ["/cp/advanced-trees/small-to-large-merging/", "Small-to-Large Merging (DSU on Tree)", "Colourful Subtrees"],
    ["/cp/dynamic-programming/convex-hull-trick/", "The Convex Hull Trick", "Stone Hops"],
    ["/cp/trees/heavy-light-decomposition/", "Heavy-Light Decomposition", "Path Boss"],
    ["/cp/trees/centroid-decomposition/", "Centroid Decomposition", "Fixed Distance"],
    ["/cp/dynamic-programming/divide-and-conquer-optimization/", "Divide and Conquer DP Optimization", "Truck Loads"],
    ["/cp/graphs/min-cost-flow/", "Min-Cost Max-Flow", "Cheap Shipping"],
  ];
  for (const [path, title, problem] of LESSONS) {
    test(`${title} has a practice problem and its visualizer where one exists`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("region", { name: `Problem: ${problem}` })).toBeVisible();
      // Only the first five lessons embed a visualizer; the rest have none yet.
      if (!["Fenwick Trees", "Longest Increasing Subsequence", "The Z-Function", "Minimum Spanning Trees", "Topological Sort", "Coin Change", "Bellman-Ford", "Edit Distance", "Lowest Common Ancestor", "Euler Tours", "Grid Paths", "Bipartite Graphs", "Tree DP", "Bitmask DP", "Sparse Tables", "Lazy Propagation", "Interval DP", "Bridges and Low-Link", "Strongly Connected Components", "Digit DP", "Rerooting DP", "2-SAT", "Maximum Flow and Dinic's Algorithm", "Manacher's Algorithm", "Suffix Arrays and LCP", "The Convex Hull Trick", "Heavy-Light Decomposition", "Centroid Decomposition", "Divide and Conquer DP Optimization", "Min-Cost Max-Flow", "Heap Internals and k-way Merge", "Two Heaps and the Running Median", "Order Statistics with Fenwick Trees", "Extended Euclid and Linear Congruences", "The Chinese Remainder Theorem", "Binomial Coefficients Modulo a Prime", "Tries and Maximum XOR Queries", "The Aho-Corasick Automaton", "The Suffix Automaton", "Sum over Subsets (SOS) DP", "Broken Profile DP and Domino Tilings", "Knuth's Optimisation of Interval DP", "The Li Chao Tree", "Euler Paths and Hierholzer's Algorithm", "Floyd-Warshall and Shortest Walks by Matrix Powers", "Functional Graphs and Binary Lifting", "Small-to-Large Merging (DSU on Tree)"].includes(title)) {
        await expect(page.getByRole("button", { name: /^(Play|Pause)/ }).first()).toBeVisible();
      }
    });
  }

  test("a visualizer page links back to its lesson", async ({ page }) => {
    await page.goto("/visualizers/dijkstra/");
    await expect(page.getByRole("link", { name: /Shortest Paths with Dijkstra/ })).toBeVisible();
  });
});

test.describe("advanced tree lessons", () => {
  const lessons = [
    ["mo-algorithm", "Mo's Algorithm for Offline Range Queries"],
    ["mo-on-trees", "Mo's Algorithm on Trees"],
    ["virtual-trees", "Virtual Trees"],
  ];

  for (const [slug, title] of lessons) {
    test(`${title} has a code runner and a quiz`, async ({ page }) => {
      await page.goto(`/cp/advanced-trees/${slug}/`);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Quiz" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Run", exact: true })).toBeVisible();
      if (slug === "mo-algorithm") {
        const problem = page.getByRole("region", { name: "Problem: Range Variety" });
        await expect(problem).toBeVisible();
        const complexity = problem.getByRole("group", { name: "Complexity self-check" });
        await complexity.getByRole("button", { name: "O(n sqrt(n))", exact: true }).click();
        await expect(complexity.getByRole("status")).toHaveText("Correct");
      }
    });
  }
});

test("concept walkthrough supports keyboard steps and a transcript on a reduced-motion phone", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/cp/advanced-trees/mo-algorithm/");
  const walkthrough = page.getByRole("region", { name: "Move Mo's window" });
  await expect(walkthrough.getByRole("status")).toContainText("Step 1 of 4");
  const next = walkthrough.getByRole("button", { name: "Next step" });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(walkthrough.getByRole("status")).toContainText("Step 2 of 4");
  await expect(walkthrough.getByRole("status")).toContainText("Two copies, one distinct value");
  await walkthrough.getByRole("button", { name: "Previous step" }).click();
  await expect(walkthrough.getByRole("status")).toContainText("Step 1 of 4");
  await walkthrough.getByRole("button", { name: "Restart" }).click();
  await expect(walkthrough.getByRole("status")).toContainText("Step 1 of 4");
  await walkthrough.getByText("Read all steps").click();
  await expect(walkthrough.getByText("Record the last answer", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
});

test("concept walkthrough plays, pauses and replays", async ({ page }) => {
  await page.goto("/sd/caching/caching-strategies/");
  const walkthrough = page.getByRole("region", { name: "Follow the first cache-aside read" });
  await page.clock.install();
  await walkthrough.getByRole("button", { name: "Play", exact: true }).click();
  await page.clock.runFor(3500);
  await expect(walkthrough.getByRole("status")).toContainText("Get the source value");
  await walkthrough.getByRole("button", { name: "Pause", exact: true }).click();
  await page.clock.runFor(3500);
  await expect(walkthrough.getByRole("status")).toContainText("Step 2 of 4");
  const next = walkthrough.getByRole("button", { name: "Next step" });
  await next.click();
  await next.click();
  await expect(walkthrough.getByRole("status")).toContainText("The next read hits");
  await walkthrough.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(walkthrough.getByRole("status")).toContainText("Step 1 of 4");
});

test("concept walkthroughs make duplicate bounds and burst limits visible", async ({ page }) => {
  for (const [path, title, firstResult] of [
    ["/cp/sorting-and-searching/binary-search/", "Find both edges of a duplicate run", "Equality sends the searches apart"],
    ["/sd/scalability/rate-limiting-algorithms/", "Compare limits across a window boundary", "Try a second burst"],
  ]) {
    await page.goto(path);
    const walkthrough = page.getByRole("region", { name: title });
    await walkthrough.getByRole("button", { name: "Next step" }).click();
    await expect(walkthrough.getByRole("status")).toContainText(firstResult);
  }
});

test("concept walkthroughs explain additional examples at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const lessons = [
    ["/cp/sorting-and-searching/binary-search/", [
      ["Keep the first-true boundary in bounds", "A one-element probe still makes progress"],
      ["Search an integer answer with a feasibility test", "Certify minimality"],
    ]],
    ["/sd/scalability/rate-limiting-algorithms/", [
      ["Estimate the count when older traffic clusters", "Compare with the exact log"],
      ["Drain a bounded queue at a fixed pace", "Pay waiting time for a steady rate"],
      ["Calculate retry time for a weighted request", "Shared quota can move the boundary"],
    ]],
    ["/sd/caching/invalidation-and-stampedes/", [
      ["Follow an authoritative cache version", "Read and fill the versioned key"],
      ["Reject a stale cache fill with a lease", "Reject the late version-1 fill"],
      ["Spread reads across copies of one hot key", "Budget for invalidation and node loss"],
    ]],
    ["/cp/range-queries/fenwick-trees/", [
      ["Turn two prefixes into a range sum", "Convert assignment into a delta"],
      ["Count inversions without counting ties", "Count the final contribution"],
      ["Build a range update from two difference events", "Watch the stop event cancel"],
    ]],
    ["/sd/consensus-and-coordination/raft-log-replication-and-safety/", [
      ["Repair a follower’s conflicting suffix", "Replace the conflicting suffix"],
      ["Compare the last term before the last index", "Use index as the tiebreaker"],
      ["Catch up a lagging follower with a snapshot", "Resume ordinary replication"],
      ["Retry a command after losing its response", "Return the original result"],
    ]],
    ["/cp/range-queries/lazy-propagation/", [
      ["Update a sum and a maximum over the same segment", "Apply the same add to the maximum"],
      ["Compose assignment and addition in order", "Try a nonzero segment with a zero assignment"],
      ["Rebuild the parent after a partial update", "Pull the updated child sums"],
    ]],
    ["/sd/consensus-and-coordination/leases-locks-and-fencing/", [
      ["Watch the next candidate in the election queue", "Acquire only when first"],
      ["See what fencing guarantees during handoff", "Advance the fence before relying on it"],
      ["Retry an external send with the same operation key", "Record the known result"],
    ]],
    ["/cp/range-queries/sparse-table/", [
      ["Build a sparse-table cell from disjoint halves", "Combine the halves into one cell"],
      ["See why overlapping blocks cannot answer a sum", "Choose disjoint blocks for a sum"],
      ["Find a common ancestor with a depth minimum", "Return the vertex at the depth minimum"],
    ]],
    ["/sd/consensus-and-coordination/raft-leader-election/", [
      ["Keep a vote across a crash", "Recover the recorded vote"],
      ["Test the heartbeat margin against delays", "Try a longer stall"],
      ["Follow leadership across a network partition", "Repair the term when the network heals"],
    ]],
  ] as const;

  for (const [path, walkthroughs] of lessons) {
    await page.goto(path);
    for (const [title, finalStep] of walkthroughs) {
      const walkthrough = page.getByRole("region", { name: title, exact: true });
      const next = walkthrough.getByRole("button", { name: "Next step", exact: true });
      await next.click();
      await next.click();
      await expect(walkthrough.getByRole("status")).toContainText(finalStep);
      await expect(next).toBeDisabled();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  }
});

test.describe("matching and assignment lessons", () => {
  const lessons = [
    ["bipartite-matching", "Bipartite Matching with Augmenting Paths"],
    ["hopcroft-karp", "Hopcroft–Karp"],
    ["hungarian-algorithm", "The Hungarian Algorithm for Minimum-Cost Assignment"],
    ["edmonds-blossom", "Edmonds' Blossom Algorithm"],
  ];

  for (const [slug, title] of lessons) {
    test(`${title} has a code runner and a quiz`, async ({ page }) => {
      await page.goto(`/cp/matching-and-assignment/${slug}/`);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Quiz" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Run", exact: true })).toBeVisible();
      if (slug === "hungarian-algorithm") {
        await expect(page.getByRole("region", { name: "Problem: Workshop Rota" })).toBeVisible();
      }
    });
  }
});

test.describe("security, observability and case-study modules", () => {
  const LESSONS: [string, string][] = [
    ["/sd/security/passwords-sessions-and-mfa/", "Passwords, Sessions and Multi-Factor Login"],
    ["/sd/security/tokens-oauth-and-jwt/", "Tokens, OAuth 2.0 and JWT"],
    ["/sd/security/tls-encryption-and-key-management/", "TLS, Encryption at Rest and Key Management"],
    ["/sd/security/web-and-api-attacks/", "Web and API Attacks: Injection, XSS, CSRF and SSRF"],
    ["/sd/observability/logs-metrics-and-traces/", "Logs, Metrics and Traces"],
    ["/sd/observability/slos-error-budgets-and-alerting/", "SLOs, Error Budgets and Burn-Rate Alerts"],
    ["/sd/observability/safe-deployments-canaries-and-feature-flags/", "Safe Deployments, Canaries and Feature Flags"],
    ["/sd/observability/backups-disaster-recovery-and-chaos/", "Backups, Disaster Recovery and Chaos Engineering"],
    ["/sd/case-studies-core-services/design-a-url-shortener/", "Case Study: Design a URL Shortener"],
    ["/sd/case-studies-core-services/design-a-key-value-store/", "Case Study: Design a Distributed Key-Value Store"],
    ["/sd/case-studies-core-services/design-a-chat-system/", "Case Study: Design a Chat System"],
    ["/sd/case-studies-core-services/design-a-notification-system/", "Case Study: Design a Notification System"],
    ["/sd/case-studies-core-services/design-a-news-feed/", "Case Study: Design a News Feed"],
    ["/sd/case-studies-core-services/design-a-web-crawler/", "Case Study: Design a Web Crawler"],
    ["/sd/case-studies-core-services/design-a-payment-system/", "Case Study: Design a Payment System"],
    ["/sd/case-studies-core-services/design-a-video-streaming-service/", "Case Study: Design a Video Streaming Service"],
    ["/sd/case-studies-core-services/design-a-ride-hailing-service/", "Case Study: Design a Ride-Hailing Service"],
    ["/sd/case-studies-core-services/design-a-maps-and-navigation-service/", "Case Study: Design a Maps and Navigation Service"],
    ["/sd/case-studies-core-services/design-a-social-graph-and-friend-recommendations/", "Case Study: Design a Social Graph and Friend Recommendations"],
    ["/sd/case-studies-core-services/design-a-collaborative-editor/", "Case Study: Design a Collaborative Document Editor"],
    ["/sd/case-studies-core-services/design-an-email-service/", "Case Study: Design an Email Service"],
    ["/sd/case-studies-core-services/design-a-web-search-engine/", "Case Study: Design a Web Search Engine"],
    ["/sd/case-studies-core-services/design-a-proximity-service/", "Case Study: Design a Proximity Service for Nearby Places and Friends"],
    ["/sd/case-studies-core-services/design-a-calendar-and-meeting-scheduler/", "Case Study: Design a Calendar and Meeting Scheduler"],
    ["/sd/case-studies-core-services/design-a-multiplayer-game-backend/", "Case Study: Design a Multiplayer Game Backend"],
    ["/sd/case-studies-core-services/design-an-e-learning-platform/", "Case Study: Design an E-learning Platform"],
    ["/sd/case-studies-data-and-transactions/design-a-ticket-booking-system/", "Case Study: Design a Ticket Booking System"],
    ["/sd/case-studies-data-and-transactions/design-a-search-autocomplete-system/", "Case Study: Design a Search Autocomplete System"],
    ["/sd/case-studies-data-and-transactions/design-a-file-sync-service/", "Case Study: Design a File Storage and Sync Service"],
    ["/sd/case-studies-data-and-transactions/design-a-metrics-monitoring-system/", "Case Study: Design a Metrics and Monitoring System"],
    ["/sd/case-studies-data-and-transactions/design-a-distributed-message-queue/", "Case Study: Design a Distributed Message Queue"],
    ["/sd/case-studies-data-and-transactions/design-a-hotel-booking-system/", "Case Study: Design a Hotel Booking System"],
    ["/sd/case-studies-data-and-transactions/design-an-e-commerce-checkout/", "Case Study: Design an E-commerce Checkout and Inventory System"],
    ["/sd/case-studies-data-and-transactions/design-a-stock-exchange-matching-engine/", "Case Study: Design a Stock Exchange Matching Engine"],
    ["/sd/case-studies-data-and-transactions/design-an-ad-click-aggregation-system/", "Case Study: Design an Ad Click Aggregation System"],
    ["/sd/case-studies-data-and-transactions/design-a-real-time-leaderboard/", "Case Study: Design a Real-Time Leaderboard"],
    ["/sd/case-studies-data-and-transactions/design-a-unique-id-generator/", "Case Study: Design a Unique ID Generator"],
    ["/sd/case-studies-data-and-transactions/design-a-distributed-job-scheduler/", "Case Study: Design a Distributed Job Scheduler"],
    ["/sd/case-studies-data-and-transactions/design-a-feature-flag-service/", "Case Study: Design a Feature Flag and Experimentation Service"],
    ["/sd/case-studies-data-and-transactions/design-a-data-pipeline/", "Case Study: Design a Data Pipeline for Analytics"],
    ["/sd/ai-systems/serving-large-language-models/", "Serving Large Language Models: Batching, KV Cache and Cost"],
    ["/sd/ai-systems/retrieval-augmented-generation/", "Designing a Retrieval-Augmented Generation (RAG) System"],
    ["/sd/ai-systems/designing-reliable-ai-agents/", "Designing Reliable AI Agents: Compounding Errors, Checks and Budgets"],
    ["/sd/ai-systems/evaluating-and-monitoring-llm-systems/", "Evaluating and Monitoring LLM Systems"],
    ["/sd/oop-and-design-patterns/solid-principles-in-practice/", "SOLID Principles in Practice"],
    ["/sd/oop-and-design-patterns/creational-and-structural-patterns/", "Creational and Structural Design Patterns"],
    ["/sd/oop-and-design-patterns/behavioral-patterns/", "Behavioral Design Patterns"],
    ["/sd/lld-case-studies/design-a-parking-lot/", "LLD Case Study: Design a Parking Lot"],
    ["/sd/lld-case-studies/design-an-lru-cache/", "LLD Case Study: Design an LRU Cache"],
    ["/sd/lld-case-studies/design-a-vending-machine/", "LLD Case Study: Design a Vending Machine"],
    ["/sd/lld-case-studies/design-an-elevator-system/", "LLD Case Study: Design an Elevator System"],
  ];
  for (const [path, title] of LESSONS) {
    test(`${title} renders its runnable demos, trade-offs and quiz`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Trade-offs" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 2, name: "Quiz" })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Run/ }).first()).toBeVisible();
    });
  }
});
