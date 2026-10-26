import Link from "next/link";
import { RingSandbox } from "@/components/sandbox/RingSandbox";

export const metadata = {
  title: "Consistent hashing sandbox",
  description: "Add and remove nodes on a hash ring and see exactly which keys move, compared with hash mod N.",
};

export default function RingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/sandbox/" className="hover:text-fg">
          Sandboxes
        </Link>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Consistent hashing</h1>
      <p className="mt-1 max-w-3xl text-muted-fg">
        Keys and nodes are hashed onto the same ring. Each key belongs to the first node point clockwise from it, and
        every node appears at many points (virtual nodes) so load evens out. Change the cluster and watch how little
        moves. The lesson{" "}
        <Link href="/sd/databases-2/consistent-hashing/" className="text-accent underline">
          Consistent Hashing
        </Link>{" "}
        explains the idea in depth.
      </p>

      <RingSandbox />

      <section aria-labelledby="try" className="prose prose-sm mt-10 max-w-3xl dark:prose-invert">
        <h2 id="try">Things to try</h2>
        <ol>
          <li>
            <b>Set virtual nodes to 1.</b> With a single point per node the ring is lopsided: one node owns a big arc
            and the busiest node is far above the average. Raise the slider toward 256 and watch the bars even out.
          </li>
          <li>
            <b>Add a node.</b> Only keys that now belong to the new node move, never between existing nodes. The
            outlined keys all adopt the new colour, and the share moved is close to 1 divided by the new node count.
          </li>
          <li>
            <b>Compare with hash mod N.</b> Each change also reports what <code>hash(key) mod N</code> would have moved.
            Going from 4 to 5 nodes reshuffles about 80% of keys that way, which in a real cache is a mass cache miss.
          </li>
          <li>
            <b>Remove a node.</b> Only that node&apos;s keys are redistributed, spread across the survivors.
          </li>
        </ol>
        <p>
          Everything runs in your browser from a seeded hash, so the same settings always give the same picture. The
          simulation code is unit tested for exactly these properties.
        </p>
      </section>
    </main>
  );
}