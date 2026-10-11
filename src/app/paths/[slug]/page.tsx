import { notFound } from "next/navigation";
import { getPaths } from "@/lib/content/paths";
import { PathChecklist } from "@/components/layout/PathChecklist";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPaths().map((p) => ({ slug: p.slug }));
}

export default async function PathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPaths().find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{p.title}</h1>
      <p className="mt-1 text-muted-fg">{p.description}</p>
      <p className="mt-2 text-sm text-muted-fg">
        {p.availableModules} of {p.plannedModules} planned modules are published, giving {p.totalLessons} lessons over{" "}
        {p.days.length} days (target: {p.targetDays}).
      </p>
      <PathChecklist days={p.days} />
    </main>
  );
}
