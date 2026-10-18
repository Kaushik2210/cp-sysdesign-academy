import { getAllLessons } from "@/lib/content/loader";
import { getPatterns } from "@/lib/content/patterns";
import { PatternExplorer } from "@/components/layout/PatternExplorer";

export const metadata = {
  title: "Pattern library",
  description: "Map the signals in a problem statement to the technique that solves it.",
};

export default function PatternsPage() {
  const byId = new Map(getAllLessons().map((l) => [l.id, l]));
  const patterns = getPatterns().map((p) => ({
    ...p,
    lessons: p.lessons.flatMap((id) => {
      const l = byId.get(id);
      return l ? [{ title: l.title, href: l.href }] : [];
    }),
  }));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Pattern library</h1>
      <p className="mt-1 text-muted-fg">
        A cheat sheet that maps what you notice in a problem (the signal) to the technique that usually solves it. It
        points you toward an idea; always check the constraints and prove the approach before coding.
      </p>
      <PatternExplorer patterns={patterns} />
    </main>
  );
}