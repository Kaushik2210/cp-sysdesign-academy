import { getModules } from "@/lib/content/loader";
import { TRACKS } from "@/lib/content/schema";
import { DashboardView } from "@/components/layout/DashboardView";

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
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <DashboardView modules={modules} />
    </main>
  );
}
