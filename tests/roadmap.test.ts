import { describe, expect, it } from "vitest";
import { phaseSchema, stepKey } from "../src/lib/content/roadmap";

const phase = {
  id: "foundations",
  order: 1,
  title: "Foundations",
  goal: "Be able to write, run and version small programs confidently.",
  when: "Month 1",
  hoursPerWeek: 10,
  steps: [
    { kind: "lesson", ref: "cp/how-cp-works/reading-problems" },
    { kind: "external", title: "CS50x", url: "https://cs50.harvard.edu/x/", type: "course" },
    { kind: "project", title: "CLI tool", brief: "Build a small command line tool and publish it.", deliverable: "A public repository with a README." },
  ],
  exit: ["Can create a branch and open a pull request", "Solved 20 easy problems"],
};

describe("phaseSchema", () => {
  it("accepts a phase with each step kind and defaults whyNow", () => {
    const parsed = phaseSchema.parse(phase);
    expect(parsed.whyNow).toEqual([]);
    expect(parsed.steps).toHaveLength(3);
  });
  it("rejects unknown step kinds, bad URLs and too few steps", () => {
    expect(phaseSchema.safeParse({ ...phase, steps: [...phase.steps.slice(0, 2), { kind: "magic" }] }).success).toBe(false);
    expect(phaseSchema.safeParse({ ...phase, steps: [phase.steps[0], { ...phase.steps[1], url: "nope" }, phase.steps[2]] }).success).toBe(false);
    expect(phaseSchema.safeParse({ ...phase, steps: phase.steps.slice(0, 2) }).success).toBe(false);
  });
  it("builds stable progress keys", () => {
    expect(stepKey("foundations", 2)).toBe("foundations:2");
  });
});