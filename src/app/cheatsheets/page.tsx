import Link from "next/link";

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
];

export default function CheatsheetsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Cheat sheets</h1>
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