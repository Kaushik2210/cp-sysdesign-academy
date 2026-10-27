import { getModules } from "@/lib/content/loader";
import { TRACKS } from "@/lib/content/schema";
import { DashboardView } from "@/components/layout/DashboardView";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const modules = TRACKS.flatMap((t) =>
    getModules(t).map((m) => ({
      track: t,
      slug: m.slug,
      title: m.title,
      lessons: m.lessons.map((l) => ({ id: l.id, minutes: l.estMinutes })),
    })),
  );
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PageTitle>Dashboard</PageTitle>
      <DashboardView modules={modules} />
    </main>
  );
}
