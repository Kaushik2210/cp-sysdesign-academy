import { describe, expect, it } from "vitest";
import { extractHeadings } from "../src/lib/content/toc";
import { lessonSchema } from "../src/lib/content/schema";

describe("extractHeadings", () => {
  it("skips fenced code and numbers duplicate slugs", () => {
    const src = "## A\n```\n## not a heading\n```\n### B\n## A\n";
    expect(extractHeadings(src).map((h) => h.id)).toEqual(["a", "b", "a-1"]);
  });
});

describe("lessonSchema", () => {
  it("rejects bad frontmatter", () => {
    expect(lessonSchema.safeParse({ title: "x" }).success).toBe(false);
  });
});