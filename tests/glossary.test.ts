import { describe, expect, it } from "vitest";
import { termSchema } from "../src/lib/content/glossary";

const ok = { id: "latency", term: "Latency", definition: "The time between sending a request and receiving its response." };

describe("termSchema", () => {
  it("defaults aliases, related and lessons to empty arrays", () => {
    expect(termSchema.parse(ok)).toMatchObject({ aliases: [], related: [], lessons: [] });
  });
  it("rejects bad ids and too-short definitions", () => {
    expect(termSchema.safeParse({ ...ok, id: "Not Valid" }).success).toBe(false);
    expect(termSchema.safeParse({ ...ok, definition: "short" }).success).toBe(false);
  });
});