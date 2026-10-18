import { describe, expect, it } from "vitest";
import { patternSchema } from "../src/lib/content/patterns";

const ok = {
  id: "two-pointers",
  signal: "Sorted array and you need a pair or a window",
  technique: "Two pointers",
  why: "Each pointer only moves forward, so the scan is linear.",
  complexity: "O(n)",
  tags: ["arrays"],
};

describe("patternSchema", () => {
  it("accepts a valid pattern and defaults lessons to empty", () => {
    expect(patternSchema.parse(ok).lessons).toEqual([]);
  });
  it("rejects short signals and bad ids", () => {
    expect(patternSchema.safeParse({ ...ok, signal: "short" }).success).toBe(false);
    expect(patternSchema.safeParse({ ...ok, id: "Bad Id" }).success).toBe(false);
  });
});