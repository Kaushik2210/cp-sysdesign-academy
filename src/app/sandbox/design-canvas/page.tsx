import Link from "next/link";
import { DesignCanvasLoader } from "@/components/sandbox/DesignCanvasLoader";

export const metadata = {
  title: "Design canvas",
  description: "Draw a system architecture and get automated feedback on single points of failure, missing caches and unsafe wiring.",
};

export default function DesignCanvasPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/sandbox/" className="hover:text-fg">
          Sandboxes
        </Link>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Design canvas</h1>
      <p className="mt-1 max-w-3xl text-muted-fg">
        Sketch an architecture, then see what a reviewer would flag. Drag components onto the canvas, connect them by
        dragging from one box to another (or use the list below the canvas), and set how many instances each one runs.
        The review panel updates as you edit and links each finding to the lesson that explains it.
      </p>

      <DesignCanvasLoader />

      <section aria-labelledby="try" className="prose prose-sm mt-10 max-w-3xl dark:prose-invert">
        <h2 id="try">Things to try</h2>
        <ol>
          <li>
            <b>Start from the naive design.</b> A client, one app server and one database score 56 out of 100. The two
            high-severity findings are the single app instance and the database with no replica.
          </li>
          <li>
            <b>Fix them one at a time.</b> Select the app servers and add instances, add a database replica and connect
            it, add a cache between the app and the database, then a load balancer in front. Watch the score climb.
          </li>
          <li>
            <b>Load the robust design</b> for a reference: it scores 100 against this checklist.
          </li>
          <li>
            <b>Break it on purpose.</b> Connect the client straight to the database and see a high-severity security
            finding. Add a queue with nothing consuming it, or a worker with no queue.
          </li>
          <li>
            <b>Use &quot;Show on canvas&quot;</b> on any finding to outline the components involved.
          </li>
        </ol>
        <h2 id="limits">What this checker does not know</h2>
        <p>
          It checks structure against common patterns. It cannot know your traffic, your budget or your consistency
          needs, so a design can score 100 and still be wrong for your problem, and an unusual but sound design can
          lose points. Treat it as a prompt for the conversation, as in the{" "}
          <Link href="/sd/interview-playbook/framework-and-timing/" className="text-accent underline">
            design interview framework
          </Link>
          : every box needs a reason, and every reason should come from a requirement.
        </p>
      </section>
    </main>
  );
}