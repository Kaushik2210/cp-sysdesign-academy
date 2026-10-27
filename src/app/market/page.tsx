import Link from "next/link";
import { getInsights, TOPIC_TITLE, TOPICS } from "@/lib/content/market";
import { MarketView } from "@/components/layout/MarketView";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Hiring market",
  description: "What current data says about software hiring, interviews and skills, with sources and confidence ratings.",
};

const TAKEAWAYS = [
  {
    title: "Demand is recovering, but selectively",
    body: "Postings are rising from a low base and most of the growth is senior or AI-related. Plan for a search measured in months and aim to look closer to mid-level than to a beginner.",
  },
  {
    title: "The entry-level door is narrow, not shut",
    body: "Few postings target beginners and each draws many applicants. Proof of work (shipped projects, contest results, open source, internships) is what gets a resume read.",
  },
  {
    title: "Interviews are changing, fundamentals are not",
    body: "Some large companies now let you use an AI assistant, but still grade problem solving, code quality, verification and communication. Keep algorithm fluency, add design practice, and learn to steer AI tools deliberately.",
  },
  {
    title: "AI is the baseline, judgement is the edge",
    body: "Most developers use AI tools, yet trust is conditional and checking output is the job. Strong fundamentals, system design and clear communication are what AI does not replace.",
  },
  {
    title: "In India, internships and AI literacy matter most",
    body: "Employers report strong intent to recruit but high placement gaps, rising AI/ML requirements even in fresher descriptions, and internships as a key predictor of conversion.",
  },
];

export default function MarketPage() {
  const insights = getInsights();
  const topics = TOPICS.map((id) => ({
    id,
    title: TOPIC_TITLE[id],
    insights: insights
      .filter((i) => i.topic === id)
      .map(({ topic: _topic, ...rest }) => {
        void _topic;
        return rest;
      }),
  })).filter((t) => t.insights.length > 0);
  const checked = insights.map((i) => i.retrieved).sort().at(-1);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageTitle>Hiring market: what the data says</PageTitle>
      <p className="mt-1 text-muted-fg">
        {insights.length} sourced findings, last checked {checked}. Use them to decide what to learn and in what order,
        not as a prediction of your own outcome.
      </p>

      <section aria-labelledby="takeaways" className="mt-8">
        <h2 id="takeaways" className="text-xl font-bold">
          Five takeaways <span className="text-sm font-normal text-muted-fg">(our interpretation of the findings below)</span>
        </h2>
        <ol className="mt-3 space-y-3">
          {TAKEAWAYS.map((t, i) => (
            <li key={t.title} className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold">
                {i + 1}. {t.title}
              </p>
              <p className="mt-1 text-sm">{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 rounded-xl border border-accent/50 p-4 text-sm">
        Want the plan these findings point to? See the{" "}
        <Link href="/roadmap/" className="font-medium text-accent underline">
          zero-to-elite roadmap
        </Link>
        : ten phases, each with the findings that justify it.
      </p>

      <MarketView topics={topics} />

      <section aria-labelledby="caveats" className="mt-12 rounded-xl border border-border p-4 text-sm">
        <h2 id="caveats" className="text-lg font-bold">
          How to read this page
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Most numbers describe the US market. The India section uses separate surveys with different methods, so do not compare figures across sections.</li>
          <li>
            <b>Primary data</b> comes from the organisation that collected it. <b>Third-party</b> items relay someone
            else&apos;s numbers and may lag or simplify them; low-confidence items are anecdotes or vendor marketing.
          </li>
          <li>Hiring data changes quickly. Check the linked source and its date before relying on any figure.</li>
          <li>Findings are paraphrased. Averages say little about any individual: strong evidence of skill beats market timing.</li>
        </ul>
      </section>
    </main>
  );
}