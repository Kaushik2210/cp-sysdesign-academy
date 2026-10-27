import Link from "next/link";
import { ArrowUpRight, Boxes, Gauge, PenTool, Scale, Zap } from "lucide-react";
import { Spotlight, type Tint } from "@/components/fx/Spotlight";

export const metadata = {
  title: "Sandboxes",
  description: "Interactive simulators for core system design ideas: consistent hashing, rate limiting, caching, load balancing and design review.",
};

const SANDBOXES: { href: string; title: string; body: string; icon: typeof Boxes; tint: Tint }[] = [
  {
    href: "/sandbox/consistent-hashing/",
    title: "Consistent hashing",
    body: "Add and remove nodes on a hash ring and see which keys move, compared with hash mod N.",
    icon: Boxes,
    tint: "cool",
  },
  {
    href: "/sandbox/rate-limiter/",
    title: "Rate limiter",
    body: "Compare fixed window, sliding window and token bucket on the same traffic and see the real peak rate.",
    icon: Gauge,
    tint: "hot",
  },
  {
    href: "/sandbox/cache/",
    title: "Cache eviction",
    body: "Step through LRU, LFU and FIFO evictions and compare hit ratios against the optimal bound.",
    icon: Zap,
    tint: "sun",
  },
  {
    href: "/sandbox/load-balancer/",
    title: "Load balancing",
    body: "Compare round robin, least connections, power of two choices, weighted and hash-based policies on identical traffic.",
    icon: Scale,
    tint: "leaf",
  },
  {
    href: "/sandbox/design-canvas/",
    title: "Design canvas",
    body: "Draw an architecture and get automated feedback on single points of failure, missing caches and unsafe wiring.",
    icon: PenTool,
    tint: "accent",
  },
];

export default function SandboxIndex() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        <span className="text-gradient">Sandboxes</span>
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-fg">
        Interactive simulators that run in your browser. Change a parameter and watch what happens: the fastest way to
        build intuition for the trade-offs in the lessons.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SANDBOXES.map((s, i) => (
          <li key={s.href} className={i === 4 ? "sm:col-span-2 lg:col-span-1" : undefined}>
            <Spotlight tint={s.tint} className="flex h-full flex-col p-6">
              <s.icon size={30} aria-hidden style={{ color: `hsl(var(--${s.tint}))` }} />
              <h2 className="mt-4 text-xl font-bold">
                <Link href={s.href} className="after:absolute after:inset-0 after:content-['']">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted-fg">{s.body}</p>
              <ArrowUpRight size={18} aria-hidden className="mt-4 self-end" style={{ color: `hsl(var(--${s.tint}))` }} />
            </Spotlight>
          </li>
        ))}
      </ul>
    </main>
  );
}
