import { getTemplates } from "@/lib/content/templates";
import { TemplateIndex } from "@/components/layout/TemplateIndex";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Algorithm templates",
  description: "Copy-paste C++, Python and Java templates. Every template is executed against test cases in CI.",
};

export default function TemplatesPage() {
  const templates = getTemplates().map(({ slug, title, summary, complexity, tags }) => ({ slug, title, summary, complexity, tags }));
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageTitle>Algorithm templates</PageTitle>
      <p className="mt-1 text-muted-fg">
        Copy-paste-ready C++, Python and Java. Each template is a complete program that passes its test cases in all
        three languages, so you can trust it in a contest.
      </p>
      <TemplateIndex templates={templates} />
    </main>
  );
}