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
import { Tape } from "@/components/fx/Tape";
import { RoundBadge } from "@/components/fx/RoundBadge";
import { ScrollWord } from "@/components/fx/ScrollWord";
import { Wave } from "@/components/fx/Wave";

const TOPICS = [
  "Binary search", "Two pointers", "Dijkstra", "Segment trees", "Union-find", "Knapsack DP", "KMP",
  "Consistent hashing", "Rate limiting", "Sharding", "Kafka", "CAP theorem", "Caching", "Load balancing",
  "Back-of-envelope math", "Idempotency", "Raft", "Bloom filters",
];

type Pop = "pop-yellow" | "pop-pink" | "pop-mint" | "pop-sky" | "pop-orange" | "pop-lilac" | "pop-blue" | "pop-ink";

/** Spans are on a 6-column grid so the tiles break into an uneven, collage-like rhythm. */
const FEATURES: { href: string; title: string; blurb: string; icon: typeof Brain; pop: Pop; tags: string[]; span: string; tilt: string }[] = [
  { href: "/visualizers/", title: "Algorithm visualizers", blurb: `${VIZ_META.length} step-through animations with highlighted pseudocode and editable input.`, icon: BarChart3, pop: "pop-pink", tags: ["Interactive", "Animated"], span: "lg:col-span-3", tilt: "-0.6deg" },
  { href: "/sandbox/", title: "Interactive sandboxes", blurb: "Poke a hash ring, a cache, a rate limiter, a load balancer and a design canvas.", icon: FlaskConical, pop: "pop-mint", tags: ["Simulators", "System design"], span: "lg:col-span-3", tilt: "0.7deg" },
  { href: "/mock/", title: "Mock interviews", blurb: "Timed system design prompts with a rubric to score yourself.", icon: Mic, pop: "pop-yellow", tags: ["Timed", "Rubric"], span: "lg:col-span-2", tilt: "0.5deg" },
  { href: "/roadmap/", title: "Roadmap", blurb: "Ten phases from zero to interview-ready, with a checklist per step.", icon: Compass, pop: "pop-sky", tags: ["10 phases", "Checklist"], span: "lg:col-span-2", tilt: "-0.8deg" },
  { href: "/patterns/", title: "Pattern library", blurb: "Recognise the technique from the problem statement.", icon: Layers, pop: "pop-lilac", tags: ["Signals", "Techniques"], span: "lg:col-span-2", tilt: "0.6deg" },
  { href: "/market/", title: "Hiring market", blurb: "Sourced findings on what employers ask for, with confidence ratings.", icon: LineChart, pop: "pop-ink", tags: ["Sourced", "Research"], span: "lg:col-span-4", tilt: "-0.4deg" },
  { href: "/review/", title: "Spaced review", blurb: "Quiz cards that come back when you are about to forget them.", icon: Brain, pop: "pop-orange", tags: ["Quizzes", "Memory"], span: "lg:col-span-2", tilt: "0.8deg" },
  { href: "/cheatsheets/", title: "Cheat sheets", blurb: "Latency numbers and 14 side-by-side trade-offs.", icon: BookMarked, pop: "pop-yellow", tags: ["Reference", "Printable"], span: "lg:col-span-3", tilt: "-0.7deg" },
  { href: "/templates/", title: "Code templates", blurb: "Tested Python, Java and C++ templates for the usual suspects.", icon: Boxes, pop: "pop-blue", tags: ["Python", "Java", "C++"], span: "lg:col-span-3", tilt: "0.5deg" },
];

const STAT_POPS: Pop[] = ["pop-yellow", "pop-pink", "pop-mint", "pop-sky"];
const TRACK_STYLE: Record<string, { pop: Pop; word: string; tilt: string }> = {
  cp: { pop: "pop-blue", word: "CP", tilt: "-0.5deg" },
  sd: { pop: "pop-pink", word: "SD", tilt: "0.5deg" },
};

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
    <main className="overflow-x-clip pb-4">
      <Tape
        items={["Free", "Open source", "No sign-up", "Runs in your browser", "Progress saved locally"]}
        tone="pop-yellow"
        rotate={0}
        label="Highlights"
        className="!shadow-none"
      />

      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
        <section className="relative grid items-center gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative">
            <h1 className="text-[clamp(2.8rem,7.4vw,6.4rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">
              Learn <span className="hl pop-yellow" style={{ ["--r" as string]: "-1.5deg" }}>competitive programming</span>{" "}
              <span className="hl amp pop-pink" style={{ ["--r" as string]: "1.2deg" }}><span className="sr-only">and </span>system design</span>{" "}
              <Wave text="interactively." className="text-accent" />
            </h1>
            <p className="mt-8 max-w-xl text-xl font-medium leading-snug">
              Run code, step through algorithms, break a cache on purpose, and rehearse interviews. Progress is saved locally and
              there is nothing to sign up for.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/cp/" className="pill pill-solid group">
                Start with CP <ArrowRight size={18} aria-hidden className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/sd/" className="pill">
                Start with System Design
              </Link>
              <span className="hidden items-center gap-2 text-sm font-semibold sm:inline-flex">
                <Search size={14} aria-hidden /> Press <kbd className="rounded-md border-2 border-border bg-card px-1.5 font-mono text-xs">Ctrl</kbd>
                <kbd className="rounded-md border-2 border-border bg-card px-1.5 font-mono text-xs">K</kbd> to search everything
              </span>
            </div>
            <ContinueCard lessons={lookup} />
            <span className="sticker sticker-wobble pop-mint absolute -top-9 right-4 hidden sm:inline-block" style={{ ["--r" as string]: "6deg" }} aria-hidden="true">
              100% free
            </span>
          </div>
          <div className="relative">
            <RoundBadge text="start here ✦ start here ✦ start here ✦ " className="pointer-events-none absolute right-10 top-full -mt-4 z-10 hidden sm:block" />
            <HeroPlayground />
            <span className="sticker pop-sky absolute -top-5 right-6 z-10" style={{ ["--r" as string]: "-5deg" }} aria-hidden="true">
              try the buttons →
            </span>
          </div>
        </section>
      </div>

      <div className="relative mt-24 space-y-1 py-6">
        <Tape items={TOPICS} tone="pop-pink" rotate={-2} label="Topics covered" duration={46} />
        <Tape items={[...TOPICS].reverse()} tone="pop-sky" rotate={1.5} reverse duration={52} label="More topics" className="-mt-2" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section aria-label="Stats" className="mt-20 grid grid-cols-2 gap-5 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div
                className={`${STAT_POPS[i]} rounded-2xl border-[3px] border-[#0d0d0d] p-5 shadow-[7px_7px_0_#0d0d0d] transition hover:-translate-y-1 hover:rotate-1`}
                style={{ transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}
              >
                <div className="text-7xl font-extrabold leading-none tracking-[-0.06em] tabular-nums sm:text-8xl">
                  <AnimatedNumber value={s.value} />
                </div>
                <div className="eyebrow mt-3">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </section>

        <section aria-labelledby="tracks-title" className="mt-28">
          <h2 id="tracks-title" className="text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
            Two tracks, <span className="mark">one habit</span>
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2" aria-label="Tracks">
            {TRACKS.map((t, ti) => {
              const mods = getModules(t);
              const ids = lessons.filter((l) => l.id.startsWith(`${t}/`)).map((l) => l.id);
              const st = TRACK_STYLE[t] ?? { pop: "pop-blue" as Pop, word: t.toUpperCase(), tilt: "0deg" };
              return (
                <Reveal key={t} delay={ti * 0.08}>
                  <Spotlight href={`/${t}/`} className={`${st.pop} block h-full p-6`}>
                    <span aria-hidden="true" className="outline-text pointer-events-none absolute -right-4 -top-6 select-none text-[11rem] font-extrabold leading-none tracking-[-0.08em] opacity-40">
                      {st.word}
                    </span>
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{TRACK_META[t].title}</h3>
                        <ArrowRight size={30} aria-hidden className="mt-1 shrink-0" />
                      </div>
                      <p className="mt-3 max-w-md text-base font-semibold">{TRACK_META[t].tagline}</p>
                      <div className="mt-6 inline-block rounded-2xl border-[3px] border-[#0d0d0d] bg-white p-3 text-[#0d0d0d] shadow-[4px_4px_0_#0d0d0d]">
                        <TrackProgress lessonIds={ids} label={TRACK_META[t].title} />
                      </div>
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {mods.slice(0, 6).map((m) => (
                          <li key={m.slug} className="tag bg-white/80 text-[#0d0d0d]">{m.title}</li>
                        ))}
                        {mods.length > 6 && <li className="tag bg-[#0d0d0d] text-white">+{mods.length - 6} more</li>}
                      </ul>
                    </div>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </section>
      </div>

      <ScrollWord className="mt-28 overflow-hidden border-y-[3px] border-[#0d0d0d] bg-[#0d0d0d] py-5 text-[hsl(var(--yellow))]">
        <span aria-hidden="true" className="text-[9rem] font-extrabold uppercase leading-[0.9] tracking-[-0.05em] sm:text-[12rem]">
          Keep going ✦ Keep shipping ✦ Keep going ✦ Keep shipping ✦
        </span>
        <span className="sr-only">Keep going. Keep shipping.</span>
      </ScrollWord>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <section aria-labelledby="bento-title" className="mt-28">
          <h2 id="bento-title" className="text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
            Everything <span className="hl pop-mint" style={{ ["--r" as string]: "-1.5deg" }}>on the site</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-medium">Each tile is a working part of the site, not a screenshot. Hover one.</p>
          <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-6">
            {FEATURES.map((b, i) => (
              <li key={b.href} className={b.span}>
                <Reveal delay={(i % 3) * 0.06} className="h-full">
                  <Spotlight href={b.href} className={`${b.pop} block h-full p-6`}>
                    <div className="flex items-start justify-between">
                      <span className="eyebrow" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <b.icon size={64} strokeWidth={1.4} aria-hidden className="-mr-1 -mt-1 transition-transform duration-500 group-hover:rotate-12" />
                    </div>
                    <h3 className="mt-6 text-3xl font-extrabold leading-none tracking-[-0.04em]">{b.title}</h3>
                    <p className="mt-3 text-base font-semibold">{b.blurb}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {b.tags.map((tg) => (
                        <li key={tg} className="tag">{tg}</li>
                      ))}
                    </ul>
                  </Spotlight>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
