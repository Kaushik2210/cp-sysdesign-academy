import Link from "next/link";
import { RateLimiterSandbox } from "@/components/sandbox/RateLimiterSandbox";

export const metadata = {
  title: "Rate limiter sandbox",
  description: "Compare fixed window, sliding window and token bucket rate limiting on the same traffic.",
};

export default function RateLimiterPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/sandbox/" className="hover:text-fg">
          Sandboxes
        </Link>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Rate limiter</h1>
      <p className="mt-1 max-w-3xl text-muted-fg">
        Pick an algorithm and a traffic pattern, and see which requests are allowed and what the backend actually
        received. The lessons on{" "}
        <Link href="/sd/scalability/rate-limiting-algorithms/" className="text-accent underline">
          rate limiting algorithms
        </Link>{" "}
        explain how each one works.
      </p>

      <RateLimiterSandbox />

      <section aria-labelledby="try" className="prose prose-sm mt-10 max-w-3xl dark:prose-invert">
        <h2 id="try">Things to try</h2>
        <ol>
          <li>
            <b>Fixed window with &quot;Bursts either side of a window boundary&quot;.</b> The limit is 10 per window, yet the
            peak accepted in a one-window interval is 20. That is the boundary flaw.
          </li>
          <li>
            <b>Switch to the sliding window log.</b> The same traffic now peaks at exactly the limit. It is exact, at the
            price of storing every timestamp.
          </li>
          <li>
            <b>Switch to the sliding window counter.</b> Close to the exact result with only two counters per key. It
            may exceed the limit slightly.
          </li>
          <li>
            <b>Token bucket with &quot;One big burst, then quiet&quot;.</b> The bucket absorbs a burst up to its size, then
            holds the long-run rate. That is why it suits APIs where short bursts are fine.
          </li>
          <li>
            <b>Random arrivals.</b> Press &quot;New random traffic&quot; to see how the algorithms differ on noisy input.
          </li>
        </ol>
        <p>
          Here the token bucket uses a capacity equal to the limit and refills at limit divided by window. The traffic
          is generated from a seeded random source, so a given setting always reproduces the same picture.
        </p>
      </section>
    </main>
  );
}