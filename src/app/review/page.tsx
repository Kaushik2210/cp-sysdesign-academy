import { ReviewQueue } from "@/components/quiz/ReviewQueue";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = { title: "Review queue" };

export default function ReviewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PageTitle>Review queue</PageTitle>
      <p className="mt-1 text-muted-fg">
        Spaced repetition built from lessons you completed and quiz questions you missed.
      </p>
      <ReviewQueue />
    </main>
  );
}
