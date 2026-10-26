import { describe, expect, it } from "vitest";
import { VISUALIZERS } from "../src/visualizers/registry";
import { VIZ_META } from "../src/visualizers/meta";

describe("visualizer registry and metadata stay in sync", () => {
  it("every registered visualizer has metadata and vice versa", () => {
    expect(Object.keys(VISUALIZERS).sort()).toEqual(VIZ_META.map((m) => m.name).sort());
  });
  it("metadata titles match the registry titles", () => {
    for (const m of VIZ_META) expect(VISUALIZERS[m.name as keyof typeof VISUALIZERS].title).toBe(m.title);
  });
  it("names are URL-safe and unique", () => {
    const names = VIZ_META.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^[a-z0-9-]+$/);
  });
  it("every default input runs without error and produces steps that point at real pseudocode lines", () => {
    for (const [name, def] of Object.entries(VISUALIZERS)) {
      const steps = def.generate(def.defaultInput);
      expect(steps.length, name).toBeGreaterThan(1);
      for (const s of steps) {
        expect(s.line, name).toBeGreaterThanOrEqual(0);
        expect(s.line, name).toBeLessThan(def.pseudocode.length);
        expect(s.note.length, name).toBeGreaterThan(0);
      }
    }
  });
});