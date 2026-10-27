import Link from "next/link";
import { getNumbersSheet } from "@/lib/content/numbers";
import { formatDuration } from "@/lib/numbers";
import { NumbersCalculators } from "@/components/layout/NumbersCalculators";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Numbers cheat sheet",
  description: "Latency numbers, powers of two, common sizes and capacity rules of thumb, with interactive estimators.",
};

const ref = (exp: number) => {
  const v = BigInt(2) ** BigInt(exp);
  return v.toLocaleString("en-US");
};

export default function NumbersPage() {
  const s = getNumbersSheet();
  const l1 = s.latency[0].ns;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/cheatsheets/" className="hover:text-fg">
          Cheat sheets
        </Link>
      </nav>
      <PageTitle>Numbers cheat sheet</PageTitle>
      <p className="mt-1 text-muted-fg">
        The figures you reach for in every back-of-envelope estimate. Use them to compare kinds of operations and to
        sanity-check a design, never to promise a latency. The lessons in the{" "}
        <Link href="/sd/estimation/numbers-every-engineer-should-know/" className="text-accent underline">
          estimation module
        </Link>{" "}
        explain how to use them.
      </p>

      <section aria-labelledby="latency" className="mt-8">
        <h2 id="latency" className="text-xl font-bold">
          Latency
        </h2>
        <p className="mt-1 text-sm text-muted-fg">
          Orders of magnitude only: hardware, cloud networks and storage classes move individual rows by factors of
          several. The last column stretches 1 ns to 1 second, so the gaps become something you can feel.
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Approximate latencies of common operations</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="p-2">Operation</th>
                <th scope="col" className="p-2">Typical</th>
                <th scope="col" className="p-2">Times an L1 reference</th>
                <th scope="col" className="p-2">If 1 ns were 1 second</th>
              </tr>
            </thead>
            <tbody>
              {s.latency.map((r) => (
                <tr key={r.id} className="border-b border-border align-top">
                  <th scope="row" className="p-2 text-left font-medium">
                    {r.operation}
                    {r.note && <span className="block text-xs font-normal text-muted-fg">{r.note}</span>}
                  </th>
                  <td className="p-2">{r.range}</td>
                  <td className="p-2 font-mono">{(r.ns / l1).toLocaleString("en-US")}x</td>
                  <td className="p-2">{formatDuration(r.ns)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="powers" className="mt-10">
        <h2 id="powers" className="text-xl font-bold">
          Powers of two
        </h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Powers of two and what they correspond to</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="p-2">Power</th>
                <th scope="col" className="p-2">Exact value</th>
                <th scope="col" className="p-2">Where you meet it</th>
              </tr>
            </thead>
            <tbody>
              {s.powers.map((p) => (
                <tr key={p.exp} className="border-b border-border align-top">
                  <th scope="row" className="p-2 text-left font-mono">2^{p.exp}</th>
                  <td className="p-2 font-mono">{ref(p.exp)}</td>
                  <td className="p-2">{p.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sizes" className="mt-10">
        <h2 id="sizes" className="text-xl font-bold">
          Common sizes
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          {s.sizes.map((z) => (
            <li key={z.item}>
              <b>{z.item}:</b> {z.size}
              {z.note && <span className="text-muted-fg"> ({z.note})</span>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rules" className="mt-10">
        <h2 id="rules" className="text-xl font-bold">
          Rules of thumb
        </h2>
        <ul className="mt-2 space-y-3">
          {s.rules.map((r) => (
            <li key={r.rule} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-semibold">{r.rule}</p>
              <p className="mt-0.5 text-muted-fg">{r.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="calc" className="mt-10">
        <h2 id="calc" className="text-xl font-bold">
          Estimators
        </h2>
        <p className="mt-1 text-sm text-muted-fg">
          The defaults describe a service with 100 million requests a day. Change any input; results update as you type.
        </p>
        <NumbersCalculators />
      </section>
    </main>
  );
}