import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllLessons } from "@/lib/content/loader";
import { getTemplates } from "@/lib/content/templates";
import { MdxBase } from "@/components/mdx/MdxBase";
import { TemplateTabs } from "@/components/layout/TemplateTabs";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTemplates().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getTemplates().find((t) => t.slug === slug)?.title ?? "Template" };
}

const fence = (lang: string, code: string) => "```" + lang + "\n" + code.replace(/\n+$/, "") + "\n```";

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplates().find((x) => x.slug === slug);
  if (!t) notFound();
  const lessons = new Map(getAllLessons().map((l) => [l.id, l]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/templates/" className="hover:text-fg">
          Templates
        </Link>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2">{t.summary}</p>
      <p className="mt-2 text-sm text-muted-fg">
        Complexity: <code>{t.complexity}</code> · {t.tags.join(", ")}
      </p>

      <TemplateTabs
        langs={[
          { label: "C++", code: t.code.cpp, node: <MdxBase source={fence("cpp", t.code.cpp)} /> },
          { label: "Python", code: t.code.python, node: <MdxBase source={fence("python", t.code.python)} /> },
          { label: "Java", code: t.code.java, node: <MdxBase source={fence("java", t.code.java)} /> },
        ]}
      />

      <section aria-labelledby="usage" className="prose max-w-none dark:prose-invert">
        <h2 id="usage">How to use it</h2>
        <MdxBase source={t.usage} />
      </section>

      <p className="mt-6 text-sm text-muted-fg">
        Tested: this exact program passes {t.tests.length} stdin/stdout cases in Python, Java and C++ (run in CI).
      </p>

      {t.lessons.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Learn the idea</h2>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {t.lessons.flatMap((id) => {
              const l = lessons.get(id);
              return l ? [<li key={id}><Link href={l.href} className="text-accent underline">{l.title}</Link></li>] : [];
            })}
          </ul>
        </section>
      )}
    </main>
  );
}