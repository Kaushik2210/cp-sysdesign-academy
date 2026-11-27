import { describe, expect, it } from "vitest";
import { getAllLessons } from "../src/lib/content/loader";
import { getPaths } from "../src/lib/content/paths";

describe("learning paths", () => {
  const paths = getPaths();

  it.each([
    ["cp", "cp-6-month-expert"],
    ["sd", "sd-90-day-complete"],
  ] as const)("schedules every published %s lesson in track order", (track, slug) => {
    const path = paths.find((entry) => entry.slug === slug);
    expect(path?.days.flatMap((day) => day.lessons.map((lesson) => lesson.id))).toEqual(
      getAllLessons(track).map((lesson) => lesson.id),
    );
  });

  it.each([
    ["cp-90-day-specialist", "cp/graphs/dijkstra-shortest-paths", "cp/dynamic-programming/knapsack"],
    ["sd-6-weeks", "sd/search-systems/vector-search-and-ann", "sd/observability/logs-metrics-and-traces"],
  ])("%s schedules its intermediate lessons", (slug, ...expected) => {
    const path = paths.find((entry) => entry.slug === slug);
    expect(path?.days.flatMap((day) => day.lessons.map((lesson) => lesson.id))).toEqual(
      expect.arrayContaining(expected),
    );
  });
});
