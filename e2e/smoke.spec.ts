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

test("theme toggle switches between dark and light", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveClass(/dark/);
  await page.getByRole("button", { name: /switch to light theme/i }).click();
  await expect(html).not.toHaveClass(/dark/);
});

test("learning path page renders a daily checklist", async ({ page }) => {
  await page.goto("/paths/sd-6-weeks/");
  await expect(page.getByRole("heading", { level: 1, name: /System Design in 6 weeks/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Day 1", exact: true })).toBeVisible();
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
  for (const path of ["/", "/market/", "/glossary/", "/templates/", "/patterns/", "/roadmap/", "/mock/", "/cheatsheets/numbers/", "/cheatsheets/tradeoffs/", "/sandbox/consistent-hashing/", "/sandbox/rate-limiter/", "/sandbox/cache/", "/sandbox/load-balancer/", "/sandbox/design-canvas/", "/visualizers/merge-sort/", "/visualizers/bfs-grid/", "/visualizers/dijkstra/", "/visualizers/dsu/", "/visualizers/segment-tree/", "/cp/sorting-and-searching/binary-search/"]) {
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

  // A self-reported step persists across reloads and moves overall progress.
  const first = page.locator("#foundations").getByRole("checkbox").first();
  await first.check();
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
