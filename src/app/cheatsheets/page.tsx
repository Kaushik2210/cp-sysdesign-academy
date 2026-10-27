import Link from "next/link";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Cheat sheets",
  description: "Quick-reference sheets for system design: the numbers you need and the trade-offs you must name.",
};

const SHEETS = [
  {
    href: "/cheatsheets/numbers/",
    title: "Numbers",
    body: "Latency scale, powers of two, common sizes, rules of thumb and estimators for traffic, storage and availability.",
  },
  {
    href: "/cheatsheets/tradeoffs/",
    title: "Trade-offs",
    body: "14 side-by-side comparisons: SQL vs NoSQL, queue vs stream, cache strategies, API styles, replication, sharding and more.",
  },
];

export default function CheatsheetsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageTitle>Cheat sheets</PageTitle>
      <p className="mt-1 text-muted-fg">Quick references for design interviews and real design reviews.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SHEETS.map((s) => (
          <li key={s.href} className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">
              <Link href={s.href} className="hover:text-accent">
                {s.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-fg">{s.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}