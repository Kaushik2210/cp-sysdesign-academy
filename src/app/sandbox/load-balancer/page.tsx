import Link from "next/link";
import { LoadBalancerSandbox } from "@/components/sandbox/LoadBalancerSandbox";
import { PageTitle } from "@/components/fx/PageTitle";

export const metadata = {
  title: "Load balancer sandbox",
  description: "Compare round robin, least connections, power of two choices, weighted and hash-based load balancing on identical traffic.",
};

export default function LoadBalancerPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
        <Link href="/sandbox/" className="hover:text-fg">
          Sandboxes
        </Link>
      </nav>
      <PageTitle>Load balancing</PageTitle>
      <p className="mt-1 max-w-3xl text-muted-fg">
        Spreading requests evenly is not the same as spreading work evenly. Change the load, the server sizes and the
        cost mix and see which policy keeps latency low. The lesson on{" "}
        <Link href="/sd/load-balancing/balancing-algorithms/" className="text-accent underline">
          balancing algorithms
        </Link>{" "}
        explains each policy.
      </p>

      <LoadBalancerSandbox />

      <section aria-labelledby="try" className="prose prose-sm mt-10 max-w-3xl dark:prose-invert">
        <h2 id="try">Things to try</h2>
        <ol>
          <li>
            <b>Start with the defaults.</b> Round robin sends every server the same number of requests, yet its tail
            latency is much worse than least connections. Open &quot;Where did the work go?&quot; for round robin: the counts
            match but the work does not, because a few requests are 20 times heavier.
          </li>
          <li>
            <b>Untick the expensive-requests box.</b> With uniform request cost, round robin now matches least
            connections, because even counts finally mean even work. Random is still much worse: chance alone
            clumps requests.
          </li>
          <li>
            <b>Choose &quot;One server at half speed&quot;.</b> Round robin and random overload the slow server. Weighted round
            robin, least connections and power of two choices all adapt.
          </li>
          <li>
            <b>Push the load to 95%.</b> Every policy slows down and the absolute gaps between them widen, because
            near saturation small imbalances become long queues.
          </li>
          <li>
            <b>Inspect IP hash with 8 clients.</b> A handful of clients cannot spread evenly across the servers, so
            work imbalance climbs. With 1,000 clients it evens out.
          </li>
        </ol>
        <p>
          Servers are single queues processing one request at a time. Arrivals are random, so use &quot;New random
          traffic&quot; to confirm a pattern is not luck. The simulation is unit tested on several seeds.
        </p>
      </section>
    </main>
  );
}