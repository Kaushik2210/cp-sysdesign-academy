import Link from "next/link";
import { ArrowRight, BarChart3, BookMarked, Boxes, Brain, Compass, FlaskConical, Layers, LineChart, Mic, Search, Sparkles, Trophy } from "lucide-react";
import { getAllLessons, getModules } from "@/lib/content/loader";
import { TRACK_META, TRACKS } from "@/lib/content/schema";
import { VIZ_META } from "@/visualizers/meta";
import { ContinueCard } from "@/components/layout/ContinueCard";
import { TrackProgress } from "@/components/layout/TrackProgress";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { HeroPlayground } from "@/components/fx/HeroPlayground";
import { Reveal } from "@/components/fx/Reveal";
import { Spotlight, type Tint } from "@/components/fx/Spotlight";

const TOPICS = [
  "Binary search", "Two pointers", "Dijkstra", "Segment trees", "Union-find", "Knapsack DP", "KMP",
  "Consistent hashing", "Rate limiting", "Sharding", "Kafka", "CAP theorem", "Caching", "Load balancing",
  "Back-of-envelope math", "Idempotency", "Raft", "Bloom filters",
];

const BENTO: { href: string; title: string; blurb: string; icon: typeof Brain; tint: Tint; span?: string }[] = [
  { href: "/visualizers/", title: "Algorithm visualizers", blurb: `${VIZ_META.length} step-through animations with highlighted pseudocode and editable input.`, icon: BarChart3, tint: "hot", span: "md:col-span-2" },
  { href: "/sandbox/", title: "Interactive sandboxes", blurb: "Poke a hash ring, a cache, a rate limiter, a load balancer and a design canvas.", icon: FlaskConical, tint: "cool" },
  { href: "/mock/", title: "Mock interviews", blurb: "Timed system design prompts with a rubric to score yourself.", icon: Mic, tint: "sun" },
  { href: "/roadmap/", title: "Roadmap", blurb: "Ten phases from zero to interview-ready, with a checklist per step.", icon: Compass, tint: "accent", span: "md:col-span-2" },
  { href: "/patterns/", title: "Pattern library", blurb: "Recognise the technique from the problem statement.", icon: Layers, tint: "leaf" },
  { href: "/market/", title: "Hiring market", blurb: "Sourced findings on what employers ask for, with confidence ratings.", icon: LineChart, tint: "cool" },
  { href: "/review/", title: "Spaced review", blurb: "Quiz cards that come back when you are about to forget them.", icon: Brain, tint: "hot" },
  { href: "/cheatsheets/", title: "Cheat sheets", blurb: "Latency numbers and 14 side-by-side trade-offs.", icon: BookMarked, tint: "sun" },
  { href: "/templates/", title: "Code templates", blurb: "Tested Python, Java and C++ templates for the usual suspects.", icon: Boxes, tint: "leaf", span: "md:col-span-2" },
];

export default function Home() {
  const lessons = getAllLessons();
  const lookup = Object.fromEntries(lessons.map((l) => [l.id, { title: l.title, href: l.href }]));
  const stats = [
    { label: "Lessons", value: lessons.length, tint: "accent" as Tint },
    { label: "Modules", value: TRACKS.reduce((n, t) => n + getModules(t).length, 0), tint: "hot" as Tint },
    { label: "Problems", value: lessons.reduce((n, l) => n + l.problems.length, 0), tint: "sun" as Tint },
    { label: "Visualizers", value: VIZ_META.length, tint: "cool" as Tint },
  ];
  const trackTint: Record<string, Tint> = { cp: "hot", sd: "cool" };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles size={14} aria-hidden className="text-sun" /> Free · open source · runs entirely in your browser
          </p>
          <h1 className="mt-5 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Learn <span className="text-gradient">competitive programming and system design</span>, interactively.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-fg">
            Run code, step through algorithms, break a cache on purpose, and rehearse interviews. Progress is saved locally and
            there is nothing to sign up for.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/cp/"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-brand px-6 font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Start with CP <ArrowRight size={18} aria-hidden className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sd/"
              className="inline-flex min-h-12 items-center rounded-full border border-border bg-card/70 px-6 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-cool hover:bg-muted"
            >
              Start with System Design
            </Link>
            <span className="hidden items-center gap-2 text-sm text-muted-fg sm:inline-flex">
              <Search size={14} aria-hidden /> Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd>
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">K</kbd> to search everything
            </span>
          </div>
          <ContinueCard lessons={lookup} />
        </div>
        <HeroPlayground />
      </section>

      <div className="marquee relative mt-16 overflow-hidden border-y border-border py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]" aria-label="Topics covered" role="group">
        <div className="marquee-track gap-3 text-sm font-semibold">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 gap-3 pr-3" aria-hidden={copy === 1}>
              {TOPICS.map((t, i) => (
                <li key={t} className={`rounded-full border border-border bg-card/70 px-4 py-1.5 ${["text-hot", "text-cool", "text-sun", "text-leaf", "text-accent"][i % 5]}`}>
                  {t}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section aria-label="Stats" className="mt-14 grid grid-cols-2 gap-4 text-center md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <Spotlight tint={s.tint} className="p-5" tilt={6}>
              <div className="text-5xl font-black tracking-tight" style={{ color: `hsl(var(--${s.tint}))` }}>
                <AnimatedNumber value={s.value} />
              </div>
              <div className="mt-1 text-sm font-medium text-muted-fg">{s.label}</div>
            </Spotlight>
          </Reveal>
        ))}
      </section>

      <section aria-label="Tracks" className="mt-20 grid gap-6 md:grid-cols-2">
        {TRACKS.map((t, ti) => {
          const mods = getModules(t);
          const ids = lessons.filter((l) => l.id.startsWith(`${t}/`)).map((l) => l.id);
          return (
            <Reveal key={t} delay={ti * 0.1}>
              <Spotlight href={`/${t}/`} tint={trackTint[t] ?? "accent"} className="block h-full p-7">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl font-extrabold tracking-tight">{TRACK_META[t].title}</h2>
                  <Trophy size={22} aria-hidden style={{ color: `hsl(var(--${trackTint[t] ?? "accent"}))` }} />
                </div>
                <p className="mt-2 text-sm text-muted-fg">{TRACK_META[t].tagline}</p>
                <div className="mt-5">
                  <TrackProgress lessonIds={ids} label={TRACK_META[t].title} />
                </div>
                <ol className="mt-5 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                  {mods.slice(0, 6).map((m) => (
                    <li key={m.slug} className="rounded-lg border border-border/60 bg-bg/40 px-3 py-2">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-fg">{m.level.split(":")[0]}</span>
                      <span className="font-medium">{m.title}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: `hsl(var(--${trackTint[t] ?? "accent"}))` }}>
                  Open the track <ArrowRight size={16} aria-hidden />
                </p>
              </Spotlight>
            </Reveal>
          );
        })}
      </section>

      <section aria-labelledby="bento-title" className="mt-24">
        <h2 id="bento-title" className="text-3xl font-black tracking-tight sm:text-4xl">
          Everything you need, <span className="text-gradient">in one place</span>
        </h2>
        <p className="mt-2 max-w-2xl text-muted-fg">Move your pointer over the tiles. Each one is a working part of the site, not a screenshot.</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-4">
          {BENTO.map((b, i) => (
            <li key={b.href} className={b.span ?? "md:col-span-1"}>
              <Reveal delay={(i % 4) * 0.06} className="h-full">
                <Spotlight href={b.href} tint={b.tint} className="flex h-full min-h-40 flex-col p-6">
                  <b.icon size={28} aria-hidden style={{ color: `hsl(var(--${b.tint}))` }} />
                  <h3 className="mt-4 text-lg font-bold">{b.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-fg">{b.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: `hsl(var(--${b.tint}))` }}>
                    Explore <ArrowRight size={14} aria-hidden />
                  </span>
                </Spotlight>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
