import { expect, test } from "vitest";
import { getAllLessons, getLessonSource } from "../src/lib/content/loader";

test("every published lesson includes an animated worked example or algorithm visualizer", () => {
  const withoutAnimation = getAllLessons()
    .filter((lesson) => !/^[ \t]*<(?:ConceptWalkthrough|Visualizer)\b/m.test(getLessonSource(lesson)))
    .map((lesson) => lesson.id);

  expect(withoutAnimation).toEqual([]);
}, 20_000);
