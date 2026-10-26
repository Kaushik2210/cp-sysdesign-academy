import Link from "next/link";
import { getAllLessons } from "@/lib/content/loader";
import { getInsights } from "@/lib/content/market";
import { getRoadmap, stepKey } from "@/lib/content/roadmap";
import { RoadmapView, type PhaseView, type StepView } from "@/components/layout/RoadmapView";

export const metadata = {
  title: "Zero-to-elite roadmap",
  description: "An ordered, market-informed plan from first program to elite engineer, with lessons, resources, projects and checkpoints.",
};

export default function RoadmapPage() {
  const lessons = new Map(getAllLessons().map((l) => [l.id, l]));
  const insights = new Map(getInsights().map((i) => [i.id, i]));

  const phases: PhaseView[] = getRoadmap().map((p) => ({
    id: p.id,
    order: p.order,
    title: p.title,
    goal: p.goal,
    when: p.when,
    hoursPerWeek: p.hoursPerWeek,
    why: p.whyNow.flatMap((id) => {
      const i = insights.get(id);
      return i ? [{ id, label: i.source.name.split(/[,:(]/)[0].trim(), href: `/market/#${i.topic}` }] : [];
    }),
    steps: p.steps.flatMap((s, index): StepView[] => {
      const key = stepKey(p.id, index);
      if (s.kind === "lesson") {
        const l = lessons.get(s.ref);
        return l ? [{ key, kind: "lesson", title: l.title, href: l.href, lessonId: l.id }] : [];
      }
      if (s.kind === "page") return [{ key, kind: "page", title: s.title, href: s.href, note: s.note }];
      if (s.kind === "external") return [{ key, kind: "external", title: s.title, url: s.url, type: s.type, note: s.note }];
      if (s.kind === "project") return [{ key, kind: "project", title: s.title, brief: s.brief, deliverable: s.deliverable }];
      return [{ key, kind: "planned", title: s.title, note: s.note }];
    }),
    exit: p.exit.map((text, i) => ({ key: `${p.id}:exit:${i}`, text })),
  }));

  const stepCount = phases.reduce((n, p) => n + p.steps.filter((s) => s.kind !== "planned").length, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Zero to elite: the roadmap</h1>
      <p className="mt-2 text-muted-fg">
        {phases.length} phases and {stepCount} steps, ordered by what the{" "}
        <Link href="/market/" className="text-accent underline">
          hiring data
        </Link>{" "}
        says matters now: strong fundamentals, system design, applied AI, proof of work and the judgement to verify what
        AI produces. Each phase says why it is there, what to do, and how you know you are done.
      </p>

      <section aria-labelledby="timeline" className="mt-8">
        <h2 id="timeline" className="text-xl font-bold">
          Timeline
        </h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Roadmap phases with timing and weekly effort</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="p-2">#</th>
                <th scope="col" className="p-2">Phase</th>
                <th scope="col" className="p-2">When</th>
                <th scope="col" className="p-2">Hours/week</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="p-2">{p.order}</td>
                  <th scope="row" className="p-2 text-left font-medium">
                    <a href={`#${p.id}`} className="text-accent underline">
                      {p.title}
                    </a>
                  </th>
                  <td className="p-2">{p.when}</td>
                  <td className="p-2">{p.hoursPerWeek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-muted-fg">
          Phases overlap on purpose: proof of work and competitive programming run alongside everything else. Our
          estimate, not a promise: about 12 to 18 months of steady work at 10 to 15 hours a week to be competitive for
          junior roles, and several more years of real work to become elite.
        </p>
      </section>

      <section aria-labelledby="how" className="prose prose-sm mt-8 max-w-none dark:prose-invert">
        <h2 id="how">How to use it</h2>
        <ul>
          <li>Start where you are. If you already code comfortably, skip phase 1 and tick it off.</li>
          <li>Lessons on this site tick automatically when you mark them complete; everything else you tick yourself. Progress stays in your browser and exports with the rest on the dashboard.</li>
          <li>Treat the projects as the point, not extras. Shipped, measured work is what separates candidates when entry-level postings are scarce.</li>
          <li>Use AI tools throughout, but keep the discipline the data rewards: plan first, ask for small pieces, test everything and write down what you verified.</li>
        </ul>
        <h2 id="limits">What this roadmap does not have yet</h2>
        <ul>
          <li>
            Several modules are still unwritten here (competitive programming 11 to 26, system design 11 to 28). Those
            steps are marked <em>Not on this site yet</em> and point to outside material in the meantime.
          </li>
          <li>Outside resources were chosen for reputation and checked to exist, not reviewed line by line. Courses and books change, so check dates and editions.</li>
          <li>The market findings are mostly US data and change quickly. Re-read the sources before making a big decision.</li>
        </ul>
      </section>

      <RoadmapView phases={phases} />
    </main>
  );
}