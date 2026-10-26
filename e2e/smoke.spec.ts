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
  for (const path of ["/", "/market/", "/glossary/", "/templates/", "/patterns/", "/roadmap/", "/mock/", "/cheatsheets/numbers/", "/cheatsheets/tradeoffs/", "/sandbox/consistent-hashing/", "/cp/sorting-and-searching/binary-search/"]) {
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