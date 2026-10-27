import Link from "next/link";
import { getAllLessons } from "@/lib/content/loader";
import { getTradeoffSheets } from "@/lib/content/tradeoffs";
import { TradeoffSheets } from "@/components/layout/TradeoffSheets";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Trade-off cheat sheets",
  description: "Side-by-side comparisons of common system design choices, with when to choose each option.",
};

export default function TradeoffsPage() {
  const lessons = new Map(getAllLessons().map((l) => [l.id, l]));
  const sheets = getTradeoffSheets().map((s) => ({
    ...s,
    lessons: s.lessons.flatMap((id) => {
      const l = lessons.get(id);
      return l ? [{ title: l.title, href: l.href }] : [];
    }),
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="no-print mb-4 text-sm text-muted-fg">
        <Link href="/cheatsheets/" className="hover:text-fg">
          Cheat sheets
        </Link>
      </nav>
      <PageTitle>Trade-off cheat sheets</PageTitle>
      <p className="mt-1 text-muted-fg">
        {sheets.length} common design decisions compared side by side. Nothing here is universally right: use each
        sheet to name what you are paying for a choice, then state the requirement that justifies it. Print the page
        for a quick reference.
      </p>
      <TradeoffSheets sheets={sheets} />
    </main>
  );
}