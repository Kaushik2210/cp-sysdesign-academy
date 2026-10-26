import Link from "next/link";
import { VIZ_CATEGORY_TITLE, VIZ_META, type VizCategory } from "@/visualizers/meta";

export const metadata = {
  title: "Algorithm visualizers",
  description: "Step through classic algorithms with highlighted pseudocode, a state panel and speed control.",
};

export default function VisualizersPage() {
  const cats = (Object.keys(VIZ_CATEGORY_TITLE) as VizCategory[]).filter((c) => VIZ_META.some((m) => m.category === c));
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Algorithm visualizers</h1>
      <p className="mt-1 text-muted-fg">
        {VIZ_META.length} algorithms you can step through. Edit the input, press play or step one line at a time, and
        watch the pseudocode line, the state and the explanation change together.
      </p>
      {cats.map((c) => (
        <section key={c} aria-labelledby={`cat-${c}`} className="mt-8">
          <h2 id={`cat-${c}`} className="text-xl font-bold">
            {VIZ_CATEGORY_TITLE[c]}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {VIZ_META.filter((m) => m.category === c).map((m) => (
              <li key={m.name} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">
                  <Link href={`/visualizers/${m.name}/`} className="hover:text-accent">
                    {m.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm">{m.summary}</p>
                <p className="mt-2 text-xs text-muted-fg">
                  Time: <code>{m.complexity}</code>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}