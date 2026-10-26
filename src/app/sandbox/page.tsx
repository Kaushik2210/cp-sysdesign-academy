import Link from "next/link";

export const metadata = {
  title: "Sandboxes",
  description: "Interactive simulators for core system design ideas: consistent hashing, rate limiting, caching, load balancing and design review.",
};

const SANDBOXES = [
  {
    href: "/sandbox/consistent-hashing/",
    title: "Consistent hashing",
    body: "Add and remove nodes on a hash ring and see which keys move, compared with hash mod N.",
  },
  {
    href: "/sandbox/rate-limiter/",
    title: "Rate limiter",
    body: "Compare fixed window, sliding window and token bucket on the same traffic and see the real peak rate.",
  },
  {
    href: "/sandbox/cache/",
    title: "Cache eviction",
    body: "Step through LRU, LFU and FIFO evictions and compare hit ratios against the optimal bound.",
  },
  {
    href: "/sandbox/load-balancer/",
    title: "Load balancing",
    body: "Compare round robin, least connections, power of two choices, weighted and hash-based policies on identical traffic.",
  },
  {
    href: "/sandbox/design-canvas/",
    title: "Design canvas",
    body: "Draw an architecture and get automated feedback on single points of failure, missing caches and unsafe wiring.",
  },
];

export default function SandboxIndex() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Sandboxes</h1>
      <p className="mt-1 text-muted-fg">
        Interactive simulators that run in your browser. Change a parameter and watch what happens: the fastest way to
        build intuition for the trade-offs in the lessons.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {SANDBOXES.map((s) => (
          <li key={s.href} className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">
              <Link href={s.href} className="hover:text-accent">
                {s.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-muted-fg">{s.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}