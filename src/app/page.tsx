import Link from "next/link";
import { ArrowRight, BarChart3, BookMarked, Boxes, Brain, Compass, FlaskConical, Layers, LineChart, Mic, Search } from "lucide-react";
import { getAllLessons, getModules } from "@/lib/content/loader";
import { TRACK_META, TRACKS } from "@/lib/content/schema";
import { VIZ_META } from "@/visualizers/meta";
import { ContinueCard } from "@/components/layout/ContinueCard";
import { TrackProgress } from "@/components/layout/TrackProgress";
import { AnimatedNumber } from "@/components/fx/AnimatedNumber";
import { HeroPlayground } from "@/components/fx/HeroPlayground";
import { Reveal } from "@/components/fx/Reveal";
import { Spotlight } from "@/components/fx/Spotlight";
import { Asterisk } from "@/components/fx/Asterisk";
import { TileArt, type ArtTone } from "@/components/fx/TileArt";

const TOPICS = [
  "Binary search", "Two pointers", "Dijkstra", "Segment trees", "Union-find", "Knapsack DP", "KMP",
  "Consistent hashing", "Rate limiting", "Sharding", "Kafka", "CAP theorem", "Caching", "Load balancing",
  "Back-of-envelope math", "Idempotency", "Raft", "Bloom filters",
];

const FEATURES: { href: string; title: string; blurb: string; icon: typeof Brain; tone: ArtTone; tags: string[] }[] = [
  { href: "/visualizers/", title: "Algorithm visualizers", blurb: `${VIZ_META.length} step-through animations with highlighted pseudocode and editable input.`, icon: BarChart3, tone: "blue", tags: ["Interactive", "Animated"] },
  { href: "/sandbox/", title: "Interactive sandboxes", blurb: "Poke a hash ring, a cache, a rate limiter, a load balancer and a design canvas.", icon: FlaskConical, tone: "ink", tags: ["Simulators", "System design"] },
  { href: "/mock/", title: "Mock interviews", blurb: "Timed system design prompts with a rubric to score yourself.", icon: Mic, tone: "paper", tags: ["Timed", "Rubric"] },
  { href: "/roadmap/", title: "Roadmap", blurb: "Ten phases from zero to interview-ready, with a checklist per step.", icon: Compass, tone: "line", tags: ["10 phases", "Checklist"] },
  { href: "/patterns/", title: "Pattern library", blurb: "Recognise the technique from the problem statement.", icon: Layers, tone: "blue", tags: ["Signals", "Techniques"] },
  { href: "/market/", title: "Hiring market", blurb: "Sourced findings on what employers ask for, with confidence ratings.", icon: LineChart, tone: "ink", tags: ["Sourced", "Research"] },
  { href: "/review/", title: "Spaced review", blurb: "Quiz cards that come back when you are about to forget them.", icon: Brain, tone: "line", tags: ["Quizzes", "Memory"] },
  { href: "/cheatsheets/", title: "Cheat sheets", blurb: "Latency numbers and 14 side-by-side trade-offs.", icon: BookMarked, tone: "paper", tags: ["Reference", "Printable"] },
  { href: "/templates/", title: "Code templates", blurb: "Tested Python, Java and C++ templates for the usual suspects.", icon: Boxes, tone: "blue", tags: ["Python", "Java", "C++"] },
];

const TRACK_ART: Record<string, { word: string; tone: ArtTone }> = { cp: { word: "CP", tone: "blue" }, sd: { word: "SD", tone: "ink" } };

function SectionHead({ id, children, count }: { id: string; children: React.ReactNode; count?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-fg pt-4">
      <h2 id={id} className="text-2xl font-medium tracking-tight sm:text-3xl">
        <span aria-hidden="true" className="mr-2 text-accent">—</span>
        {children}
      </h2>
      {count && <span className="eyebrow">{count}</span>}
    </div>
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

  return (
    <main className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-16">
      <section className="relative grid items-center gap-12 lg:grid-cols-[1.25fr_1fr]">
        <Asterisk size={420} className="spin-slow pointer-events-none absolute -right-24 -top-28 -z-10 hidden text-accent/10 lg:block" />
        <div>
          <p className="eyebrow">Free · open source · runs entirely in your browser</p>
          <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-[5.5rem]">
            Learn competitive programming and system design, <span className="text-accent">interactively.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-fg">
            Run code, step through algorithms, break a cache on purpose, and rehearse interviews. Progress is saved locally and
            there is nothing to sign up for.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/cp/" className="pill pill-solid group">
              Start with CP <ArrowRight size={16} aria-hidden className="transition group-hover:translate-x-1" />
            </Link>
            <Link href="/sd/" className="pill">
              Start with System Design
            </Link>
            <span className="hidden items-center gap-2 text-sm text-muted-fg sm:inline-flex">
              <Search size={14} aria-hidden /> Press <kbd className="rounded-full border border-border px-2 py-0.5 font-mono text-xs">Ctrl</kbd>
              <kbd className="rounded-full border border-border px-2 py-0.5 font-mono text-xs">K</kbd> to search everything
            </span>
          </div>
          <ContinueCard lessons={lookup} />
        </div>
        <HeroPlayground />
      </section>

      <div className="marquee relative mt-16 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]" aria-label="Topics covered" role="group">
        <div className="marquee-track gap-2 text-sm">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 gap-2 pr-2" aria-hidden={copy === 1}>
              {TOPICS.map((t) => (
                <li key={t} className="rounded-full border border-fg px-4 py-1.5 font-medium">
                  {t}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section aria-label="Stats" className="mt-12 grid grid-cols-2 border-y border-border md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className={`px-1 py-8 md:px-6 ${i > 0 ? "md:border-l md:border-border" : ""} ${i % 2 === 1 ? "border-l border-border md:border-l" : ""}`}>
              <div className="text-6xl font-medium tracking-[-0.05em] tabular-nums sm:text-7xl">
                <AnimatedNumber value={s.value} />
              </div>
              <div className="eyebrow mt-2">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </section>

      <section aria-labelledby="tracks-title" className="mt-24">
        <SectionHead id="tracks-title" count={`${TRACKS.length} tracks`}>Two tracks, one habit</SectionHead>
        <div className="mt-8 grid gap-6 md:grid-cols-2" aria-label="Tracks">
          {TRACKS.map((t, ti) => {
            const mods = getModules(t);
            const ids = lessons.filter((l) => l.id.startsWith(`${t}/`)).map((l) => l.id);
            return (
              <Reveal key={t} delay={ti * 0.08}>
                <Spotlight href={`/${t}/`} className="block h-full p-3">
                  <TileArt tone={TRACK_ART[t]?.tone ?? "blue"} word={TRACK_ART[t]?.word ?? t.toUpperCase()} index={ti} />
                  <div className="px-1 pb-2 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-medium tracking-tight">{TRACK_META[t].title}</h3>
                      <ArrowRight size={22} aria-hidden className="mt-1 shrink-0" />
                    </div>
                    <p className="mt-2 text-sm text-muted-fg">{TRACK_META[t].tagline}</p>
                    <div className="mt-5">
                      <TrackProgress lessonIds={ids} label={TRACK_META[t].title} />
                    </div>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {mods.slice(0, 6).map((m) => (
                        <li key={m.slug} className="tag">{m.title}</li>
                      ))}
                      {mods.length > 6 && <li className="tag">+{mods.length - 6} more</li>}
                    </ul>
                  </div>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="bento-title" className="mt-24">
        <SectionHead id="bento-title" count={`${FEATURES.length} tools`}>Everything on the site</SectionHead>
        <p className="mt-3 max-w-2xl text-muted-fg">Each tile is a working part of the site, not a screenshot.</p>
        <ul className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((b, i) => (
            <li key={b.href}>
              <Reveal delay={(i % 3) * 0.06} className="h-full">
                <Spotlight href={b.href} className="block h-full p-3">
                  <TileArt tone={b.tone} icon={b.icon} index={i} />
                  <div className="px-1 pb-2 pt-4">
                    <h3 className="text-lg font-medium tracking-tight">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-fg">{b.blurb}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {b.tags.map((tg) => (
                        <li key={tg} className="tag">{tg}</li>
                      ))}
                    </ul>
                  </div>
                </Spotlight>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
