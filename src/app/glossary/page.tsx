import { getAllLessons } from "@/lib/content/loader";
import { getGlossary } from "@/lib/content/glossary";
import { GlossaryView } from "@/components/layout/GlossaryView";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Glossary",
  description: "Plain-language definitions of system design terms, cross-linked to the lessons that explain them.",
};

export default function GlossaryPage() {
  const terms = getGlossary();
  const byId = new Map(terms.map((t) => [t.id, t]));
  const lessons = new Map(getAllLessons().map((l) => [l.id, l]));
  const view = terms.map((t) => ({
    id: t.id,
    term: t.term,
    definition: t.definition,
    aliases: t.aliases,
    related: t.related.flatMap((id) => (byId.has(id) ? [{ id, term: byId.get(id)!.term }] : [])),
    lessons: t.lessons.flatMap((id) => (lessons.has(id) ? [{ title: lessons.get(id)!.title, href: lessons.get(id)!.href }] : [])),
  }));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageTitle>Glossary</PageTitle>
      <p className="mt-1 text-muted-fg">
        {terms.length} system design terms in plain language. Each entry links to related terms and to the lessons that
        cover it in depth.
      </p>
      <GlossaryView terms={view} />
    </main>
  );
}