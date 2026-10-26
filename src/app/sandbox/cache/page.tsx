import Link from "next/link";
import { CacheSandbox } from "@/components/sandbox/CacheSandbox";

export const metadata = {
  title: "Cache eviction sandbox",
  description: "Step through LRU, LFU and FIFO evictions and compare their hit ratios on different traffic.",
};

export default function CachePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/sandbox/" className="hover:text-fg">
          Sandboxes
        </Link>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Cache eviction</h1>
      <p className="mt-1 max-w-3xl text-muted-fg">
        A full cache must throw something out. Step through small examples to see exactly what each policy evicts, then
        compare them on thousands of accesses. The lesson on{" "}
        <Link href="/sd/caching/eviction-policies/" className="text-accent underline">
          eviction policies
        </Link>{" "}
        covers the theory.
      </p>

      <CacheSandbox />

      <section aria-labelledby="try" className="prose prose-sm mt-10 max-w-3xl dark:prose-invert">
        <h2 id="try">Things to try</h2>
        <ol>
          <li>
            <b>Use the default sequence with a 3-slot cache.</b> Step through LRU, then FIFO. At the miss on{" "}
            <code>D</code>, LRU evicts <code>B</code> but FIFO evicts <code>A</code>, even though <code>A</code> was used a moment earlier. LRU ends with 3 hits, FIFO with 2.
          </li>
          <li>
            <b>Try LFU on a sequence with one very popular key.</b> It protects the popular key even after a burst of
            one-off keys, which LRU would not.
          </li>
          <li>
            <b>Compare policies on popularity-skewed traffic.</b> LRU and LFU clearly beat FIFO because a few keys are
            reused constantly. Grow the cache and watch the gains flatten.
          </li>
          <li>
            <b>Switch to the looping scan.</b> A loop one key larger than the cache gives LRU and FIFO zero hits, while
            the optimal bound is high. This is why a big sequential scan can wreck an LRU cache.
          </li>
        </ol>
        <p>
          The optimal bar is Belady&apos;s offline policy: evict the key used farthest in the future. It cannot be built
          for real traffic, but it tells you the ceiling.
        </p>
      </section>
    </main>
  );
}