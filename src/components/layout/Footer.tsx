import Link from "next/link";
import { Asterisk } from "@/components/fx/Asterisk";
import { Tape } from "@/components/fx/Tape";
import { TRACK_META, TRACKS } from "@/lib/content/schema";

const MORE: { href: string; label: string }[] = [
  { href: "/roadmap/", label: "Roadmap" },
  { href: "/visualizers/", label: "Visualizers" },
  { href: "/sandbox/", label: "Sandbox" },
  { href: "/mock/", label: "Mock interviews" },
  { href: "/patterns/", label: "Patterns" },
  { href: "/templates/", label: "Templates" },
  { href: "/cheatsheets/", label: "Cheat sheets" },
  { href: "/glossary/", label: "Glossary" },
];

/** A loud colophon: a tape strip, a giant wordmark, and plain links. Always dark so contrast holds in both themes. */
export function Footer() {
  return (
    <footer className="no-print mt-28 overflow-hidden bg-[#0d0d0d] pb-6 text-[#fff8e1]">
      <Tape
        items={["Run the code", "Break the cache", "Win the interview", "Keep shipping"]}
        tone="pop-mint"
        rotate={1}
        duration={30}
        label="Footer slogans"
        className="-mt-4"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Asterisk size={56} className="spin-slow text-[hsl(var(--pink))]" />
          <p className="mt-5 max-w-sm text-3xl font-extrabold leading-[1.05] tracking-tight">Learn it by doing it. Free, open source and runs in your browser.</p>
        </div>
        <nav aria-label="Tracks">
          <p className="eyebrow text-[hsl(var(--yellow))]">Tracks</p>
          <ul className="mt-4 space-y-1 text-lg font-bold">
            {TRACKS.map((t) => (
              <li key={t}>
                <Link href={`/${t}/`} className="inline-flex min-h-9 items-center underline-offset-4 hover:text-[hsl(var(--pink))] hover:underline">
                  {TRACK_META[t].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <p className="eyebrow text-[hsl(var(--yellow))]">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 font-bold">
            {MORE.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="inline-flex min-h-9 items-center underline-offset-4 hover:text-[hsl(var(--mint))] hover:underline">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p aria-hidden="true" className="mt-10 select-none whitespace-nowrap text-center text-[22vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-[hsl(var(--accent))] sm:text-[18vw]">
        CP×SD
      </p>
      <p className="mx-auto max-w-7xl px-4 pt-4 text-xs text-[#d4cdb8] sm:px-6">
        CP &amp; SysDesign Academy · progress is saved only in your browser · design inspired by neo-brutalist and gallery sites.
      </p>
    </footer>
  );
}
