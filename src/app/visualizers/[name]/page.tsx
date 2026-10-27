import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLessons } from "@/lib/content/loader";
import { VIZ_CATEGORY_TITLE, VIZ_META } from "@/visualizers/meta";
import { Visualizer } from "@/components/visualizer/Visualizer";
import type { VisualizerName } from "@/visualizers/registry";
import { PageTitle } from "@/components/fx/PageTitle";

export const dynamicParams = false;

export function generateStaticParams() {
  return VIZ_META.map((m) => ({ name: m.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: VIZ_META.find((m) => m.name === name)?.title ?? "Visualizer" };
}

export default async function VisualizerPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const meta = VIZ_META.find((m) => m.name === name);
  if (!meta) notFound();
  const lessons = new Map(getAllLessons().map((l) => [l.id, l]));
  const linked = meta.lessons.flatMap((id) => {
    const l = lessons.get(id);
    return l ? [l] : [];
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/visualizers/" className="hover:text-fg">
          Visualizers
        </Link>{" "}
        / {VIZ_CATEGORY_TITLE[meta.category]}
      </nav>
      <PageTitle>{meta.title}</PageTitle>
      <p className="mt-2">{meta.summary}</p>
      <p className="mt-1 text-sm text-muted-fg">
        Time complexity: <code>{meta.complexity}</code>
      </p>

      <Visualizer name={meta.name as VisualizerName} />

      <section aria-labelledby="learn" className="mt-8">
        <h2 id="learn" className="text-lg font-semibold">
          Learn the idea
        </h2>
        {linked.length > 0 ? (
          <ul className="mt-1 list-disc pl-5 text-sm">
            {linked.map((l) => (
              <li key={l.id}>
                <Link href={l.href} className="text-accent underline">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted-fg">
            The lesson for this algorithm is not on this site yet. The{" "}
            <a href="https://cp-algorithms.com/" target="_blank" rel="noopener noreferrer" className="text-accent underline">
              cp-algorithms
            </a>{" "}
            reference covers it in depth.
          </p>
        )}
      </section>
    </main>
  );
}