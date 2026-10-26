import { describe, expect, it } from "vitest";
import { insightSchema } from "../src/lib/content/market";

const ok = {
  id: "demo",
  topic: "demand",
  finding: "Postings rebounded over the last year but remain below their pre-pandemic level.",
  implication: "Expect a selective market and prepare to demonstrate skills.",
  source: { name: "Example", url: "https://example.com/report", kind: "primary" },
  confidence: "high",
  retrieved: "2026-10-26",
};

describe("insightSchema", () => {
  it("accepts a sourced insight", () => {
    expect(insightSchema.safeParse(ok).success).toBe(true);
  });
  it("requires a real URL, a known topic and a dated retrieval", () => {
    expect(insightSchema.safeParse({ ...ok, source: { ...ok.source, url: "not a url" } }).success).toBe(false);
    expect(insightSchema.safeParse({ ...ok, topic: "gossip" }).success).toBe(false);
    expect(insightSchema.safeParse({ ...ok, retrieved: "yesterday" }).success).toBe(false);
  });
});