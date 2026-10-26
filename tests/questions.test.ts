import { describe, expect, it } from "vitest";
import { questionSchema, rubricSchema } from "../src/lib/content/questions";

const q = {
  id: "url-shortener",
  kind: "system-design",
  level: "junior",
  title: "Design a URL shortener",
  prompt: "Design a service that turns long URLs into short links and redirects visitors.",
  clarify: ["How many new links per month?", "Do links expire?"],
  strongAnswer: [
    "States scale and read/write ratio before designing",
    "Generates unique short ids without collisions",
    "Serves reads from a cache in front of a key-value store",
    "Discusses redirect status codes and expiry",
  ],
  pitfalls: ["Ignoring id collisions", "Single point of failure in the id counter"],
  minutes: 45,
};

describe("questionSchema", () => {
  it("accepts a complete question and defaults related to empty", () => {
    expect(questionSchema.parse(q).related).toEqual([]);
  });
  it("rejects unknown kinds and too-thin answers", () => {
    expect(questionSchema.safeParse({ ...q, kind: "trivia" }).success).toBe(false);
    expect(questionSchema.safeParse({ ...q, strongAnswer: ["only one point here ok"] }).success).toBe(false);
  });
});

describe("rubricSchema", () => {
  const dim = { id: "x", label: "X", good: "A concrete description of good." };
  const three = [dim, { ...dim, id: "y" }, { ...dim, id: "z" }];
  const ok = {
    anchors: { "1": "a", "2": "b", "3": "c", "4": "d" },
    dimensions: { "system-design": three, "low-level-design": three, "ai-coding": three, behavioral: three },
  };
  it("accepts a rubric with four anchors and every kind covered", () => {
    expect(rubricSchema.safeParse(ok).success).toBe(true);
  });
  it("rejects a missing kind or fewer than three dimensions", () => {
    const { behavioral: _b, ...missing } = ok.dimensions;
    void _b;
    expect(rubricSchema.safeParse({ ...ok, dimensions: missing }).success).toBe(false);
    expect(rubricSchema.safeParse({ ...ok, dimensions: { ...ok.dimensions, behavioral: [dim] } }).success).toBe(false);
  });
});