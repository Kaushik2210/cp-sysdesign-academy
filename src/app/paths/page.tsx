import Link from "next/link";
import { getPaths } from "@/lib/content/paths";

export const metadata = { title: "Learning paths" };

export default function PathsPage() {
  const paths = getPaths();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Learning paths</h1>
      <p className="mt-1 text-muted-fg">
        Each path turns the curriculum into a daily checklist. Paths grow automatically as new lessons are published.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {paths.map((p) => (
          <li key={p.slug} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">
              <Link href={`/paths/${p.slug}/`} className="hover:text-accent">
                {p.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-fg">{p.description}</p>
            <p className="mt-3 text-xs text-muted-fg">
              {p.totalLessons} lessons available · ~{Math.round(p.totalMinutes / 60)} h · {p.availableModules}/
              {p.plannedModules} modules written
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
