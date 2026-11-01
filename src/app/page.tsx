import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, BookMarked, Boxes, Brain, Compass, FlaskConical, Layers, LineChart, Mic, Search } from "lucide-react";
import { getAllLessons, getModules } from "@/lib/content/loader";
import { TRACK_META, TRACKS } from "@/lib/content/schema";
import { VIZ_META } from "@/visualizers/meta";
import { ContinueCard } from "@/components/layout/ContinueCard";
import { TrackProgress } from "@/components/layout/TrackProgress";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { HeroPlayground } from "@/components/fx/HeroPlayground";
import { Reveal } from "@/components/fx/Reveal";
import { type Tint } from "@/components/fx/Spotlight";

const TOPICS = [
  "Binary search", "Two pointers", "Dijkstra", "Segment trees", "Union-find", "Knapsack DP", "KMP",
  "Consistent hashing", "Rate limiting", "Sharding", "Kafka", "CAP theorem", "Caching", "Load balancing",
  "Back-of-envelope math", "Idempotency", "Raft", "Bloom filters",
];

const BENTO: { href: string; title: string; blurb: string; icon: typeof Brain; tint: Tint; span?: string }[] = [
  { href: "/visualizers/", title: "Algorithm visualizers", blurb: `${VIZ_META.length} step-through animations with highlighted pseudocode and editable input.`, icon: BarChart3, tint: "hot" },
  { href: "/sandbox/", title: "Interactive sandboxes", blurb: "Poke a hash ring, a cache, a rate limiter, a load balancer and a design canvas.", icon: FlaskConical, tint: "cool" },
  { href: "/mock/", title: "Mock interviews", blurb: "Timed system design prompts with a rubric to score yourself.", icon: Mic, tint: "sun" },
  { href: "/roadmap/", title: "Roadmap", blurb: "Ten phases from zero to interview-ready, with a checklist per step.", icon: Compass, tint: "accent" },
  { href: "/patterns/", title: "Pattern library", blurb: "Recognise the technique from the problem statement.", icon: Layers, tint: "leaf" },
  { href: "/market/", title: "Hiring market", blurb: "Sourced findings on what employers ask for, with confidence ratings.", icon: LineChart, tint: "cool" },
  { href: "/review/", title: "Spaced review", blurb: "Quiz cards that come back when you are about to forget them.", icon: Brain, tint: "hot" },
  { href: "/cheatsheets/", title: "Cheat sheets", blurb: "Latency numbers and 14 side-by-side trade-offs.", icon: BookMarked, tint: "sun" },
  { href: "/templates/", title: "Code templates", blurb: "Tested Python, Java and C++ templates for the usual suspects.", icon: Boxes, tint: "leaf" },
];

/** Gallery tile: a solid colour cover with a big icon, a tracked title, a one-line blurb and a circular arrow. */
function Tile({ href, title, blurb, icon: Icon, tint }: { href: string; title: string; blurb: string; icon: typeof Brain; tint: Tint }) {
  return (
    <Link href={href} className="group block">
      <div className="cover grid place-items-center text-bg" style={{ background: `hsl(var(--${tint}))` }}>
        <Icon size={64} strokeWidth={1.1} aria-hidden />
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[0.8125rem] font-medium uppercase tracking-wide">{title}</h3>
          <p className="mt-1 max-w-[34ch] text-sm text-muted-fg">{blurb}</p>
        </div>
        <span className="arrow-btn" aria-hidden="true">
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const lessons = getAllLessons();
  const lookup = Object.fromEntries(lessons.map((l) => [l.id, { title: l.title, href: l.href }]));
  const stats = [
    { label: "Lessons", value: lessons.length },
    { label: "Modules", value: TRACKS.reduce((n, t) => n + getModules(t).length, 0) },
    { label: "Problems", value: lessons.reduce((n, l) => n + l.problems.length, 0) },
    { label: "Visualizers", value: VIZ_META.length },
  ];
  const trackTint: Record<string, Tint> = { cp: "accent", sd: "hot" };

  return (
    <main className="mx-auto max-w-[110rem] px-4 pb-28 pt-12 sm:px-8 sm:pt-20">
      <section className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="label">Free · open source · runs entirely in your browser</p>
          <h1 className="mt-6 text-[2.75rem] font-medium leading-[0.98] sm:text-7xl xl:text-[6.5rem]">
            Learn competitive programming and system design,{" "}
            <span className="font-serif font-normal italic text-accent">interactively.</span>
          </h1>
        </div>
        <div className="flex flex-col justify-end lg:col-span-4">
          <p className="max-w-md text-[0.95rem] leading-relaxed">
            Run code, step through algorithms, break a cache on purpose, and rehearse interviews. Progress is saved locally and
            there is nothing to sign up for.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/cp/"
              className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-fg transition hover:opacity-90"
            >
              Start with CP <ArrowRight size={16} aria-hidden className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sd/"
              className="inline-flex min-h-11 items-center rounded-full border border-accent px-6 text-sm font-medium text-accent transition hover:bg-accent hover:text-accent-fg"
            >
              Start with System Design
            </Link>
          </div>
          <p className="mt-5 hidden items-center gap-2 text-xs text-muted-fg sm:flex">
            <Search size={13} aria-hidden /> Press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">Ctrl</kbd>
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono">K</kbd> to search everything
          </p>
          <ContinueCard lessons={lookup} />
        </div>
      </section>

      <section className="mt-16" aria-label="Live demo">
        <HeroPlayground />
      </section>

      <div className="marquee relative mt-16 overflow-hidden border-y border-border py-4 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]" aria-label="Topics covered" role="group">
        <div className="marquee-track text-[0.8125rem] font-medium uppercase tracking-wide">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {TOPICS.map((t) => (
                <li key={t} className="flex items-center">
                  <span className="px-5">{t}</span>
                  <span aria-hidden className="text-accent">✱</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section aria-label="Stats" className="mt-16 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <div className="border-t border-fg pt-3">
              <div className="label">{s.label}</div>
              <div className="mt-2 text-6xl font-medium tracking-tight sm:text-7xl">
                <AnimatedNumber value={s.value} />
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section aria-labelledby="tracks-title" className="mt-24">
        <h2 id="tracks-title" className="text-lg font-normal tracking-normal">
          All tracks ({TRACKS.length})
        </h2>
        <div className="mt-6 grid gap-x-6 gap-y-14 md:grid-cols-2">
          {TRACKS.map((t, ti) => {
            const mods = getModules(t);
            const ids = lessons.filter((l) => l.id.startsWith(`${t}/`)).map((l) => l.id);
            const tint = trackTint[t] ?? "accent";
            return (
              <Reveal key={t} delay={ti * 0.1}>
                <Link href={`/${t}/`} className="group block" style={{ "--tint": `var(--${tint})` } as React.CSSProperties}>
                  <div className="cover grid place-items-center text-bg" style={{ background: `hsl(var(--${tint}))`, aspectRatio: "21 / 9" }}>
                    <span className="font-serif text-[6rem] italic leading-none sm:text-[8rem]" aria-hidden="true">
                      {t === "cp" ? "CP" : "SD"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-medium tracking-tight">{TRACK_META[t].title}</h3>
                      <p className="mt-1 max-w-lg text-sm text-muted-fg">{TRACK_META[t].tagline}</p>
                    </div>
                    <span className="arrow-btn mt-1" aria-hidden="true">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
                <div className="mt-5">
                  <TrackProgress lessonIds={ids} label={TRACK_META[t].title} />
                </div>
                <ol className="mt-5 grid gap-x-6 border-t border-border text-sm sm:grid-cols-2">
                  {mods.slice(0, 6).map((m) => (
                    <li key={m.slug} className="flex items-baseline justify-between gap-3 border-b border-border py-2.5">
                      <span className="font-medium">{m.title}</span>
                      <span className="label shrink-0">{m.level.split(":")[0]}</span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="bento-title" className="mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="bento-title" className="text-lg font-normal tracking-normal">
            Everything on the site ({BENTO.length})
          </h2>
          <p className="max-w-md text-sm text-muted-fg">Each tile is a working part of the site, not a screenshot.</p>
        </div>
        <ul className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
          {BENTO.map((b, i) => (
            <li key={b.href}>
              <Reveal delay={(i % 4) * 0.06} className="h-full">
                <Tile href={b.href} title={b.title} blurb={b.blurb} icon={b.icon} tint={b.tint} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
