import { getAllLessons } from "@/lib/content/loader";
import { KIND_TITLE, getQuestions, getRubric } from "@/lib/content/questions";
import { MockInterview, type QuestionView } from "@/components/layout/MockInterview";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Mock interviews",
  description: "Practise system design, low-level design, AI-assisted coding and behavioral interviews with a timer, phase prompts and a scoring rubric.",
};

export default function MockPage() {
  const lessons = new Map(getAllLessons().map((l) => [l.id, l]));
  const questions: QuestionView[] = getQuestions().map((q) => ({
    ...q,
    related: q.related.flatMap((id) => {
      const l = lessons.get(id);
      return l ? [{ title: l.title, href: l.href }] : [];
    }),
  }));
  const rubric = getRubric();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageTitle>Mock interviews</PageTitle>
      <p className="mt-1 text-muted-fg">
        {questions.length} questions. Get a random one, work through it out loud against a countdown that prompts you
        for each phase, then reveal what a strong answer covers and score yourself against the rubric. Your history
        shows which dimension to practise next.
      </p>
      <MockInterview questions={questions} rubric={rubric} kindTitles={KIND_TITLE} />
    </main>
  );
}