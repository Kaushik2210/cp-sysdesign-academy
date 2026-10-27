import Link from "next/link";
import { Spotlight, type Tint } from "@/components/fx/Spotlight";
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

const TINTS: Tint[] = ["sun", "cool", "hot", "leaf"];

export default function CheatsheetsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageTitle>Cheat sheets</PageTitle>
      <p className="mt-1 text-muted-fg">Quick references for design interviews and real design reviews.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SHEETS.map((s, i) => (
          <li key={s.href}>
            <Spotlight tint={TINTS[i % TINTS.length]} className="h-full p-5">
              <h2 className="text-xl font-extrabold tracking-tight">
                <Link href={s.href} className="after:absolute after:inset-0 after:content-['']">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-muted-fg">{s.body}</p>
            </Spotlight>
          </li>
        ))}
      </ul>
    </main>
  );
}