import { describe, expect, it } from "vitest";
import { sheetSchema } from "../src/lib/content/tradeoffs";

const row = (d: string) => ({ dimension: d, values: { a: "Option A value", b: "Option B value" } });
const sheet = {
  id: "demo",
  title: "A versus B",
  summary: "Helps decide between option A and option B.",
  options: [{ id: "a", name: "A" }, { id: "b", name: "B" }],
  rows: [row("Speed"), row("Cost"), row("Scale"), row("Simplicity")],
  choose: { a: ["When speed matters most", "When the team knows A well"], b: ["When cost matters most", "When scale is the main risk"] },
  watchOut: ["Do not choose based on popularity alone."],
  tags: ["demo"],
};

describe("sheetSchema", () => {
  it("accepts a consistent sheet", () => {
    expect(sheetSchema.safeParse(sheet).success).toBe(true);
  });
  it("rejects rows that do not cover exactly the options", () => {
    const bad = { ...sheet, rows: [{ dimension: "Speed", values: { a: "only A here" } }, ...sheet.rows.slice(1)] };
    expect(sheetSchema.safeParse(bad).success).toBe(false);
    const extra = { ...sheet, rows: [{ dimension: "Speed", values: { a: "A value", b: "B value", c: "C value" } }, ...sheet.rows.slice(1)] };
    expect(sheetSchema.safeParse(extra).success).toBe(false);
  });
  it("rejects missing or unknown choose guidance", () => {
    expect(sheetSchema.safeParse({ ...sheet, choose: { a: sheet.choose.a } }).success).toBe(false);
    expect(sheetSchema.safeParse({ ...sheet, choose: { ...sheet.choose, z: ["Some made up guidance", "More guidance here"] } }).success).toBe(false);
  });
  it("needs 2 or 3 options and at least 4 rows", () => {
    expect(sheetSchema.safeParse({ ...sheet, rows: sheet.rows.slice(0, 3) }).success).toBe(false);
    expect(sheetSchema.safeParse({ ...sheet, options: [sheet.options[0]] }).success).toBe(false);
  });
});