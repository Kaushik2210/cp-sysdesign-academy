import Link from "next/link";
import { Asterisk } from "@/components/fx/Asterisk";
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

/** Minimal black footer, in the spirit of a gallery colophon. Always dark so the contrast holds in both themes. */
export function Footer() {
  return (
    <footer className="no-print mt-24 bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Asterisk size={44} className="text-[#8c8cff]" />
          <p className="mt-5 max-w-sm text-2xl font-medium leading-tight tracking-tight">Learn it by doing it. Free, open source and runs in your browser.</p>
        </div>
        <nav aria-label="Tracks">
          <p className="text-xs font-medium uppercase tracking-widest text-[#a3a3a3]">Tracks</p>
          <ul className="mt-4 space-y-1">
            {TRACKS.map((t) => (
              <li key={t}>
                <Link href={`/${t}/`} className="inline-flex min-h-9 items-center hover:underline">
                  {TRACK_META[t].title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <p className="text-xs font-medium uppercase tracking-widest text-[#a3a3a3]">Explore</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
            {MORE.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="inline-flex min-h-9 items-center hover:underline">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl border-t border-[#262626] px-4 py-5 text-xs text-[#a3a3a3] sm:px-6">
        CP &amp; SysDesign Academy · progress is saved only in your browser · visual language inspired by gallery sites.
      </p>
    </footer>
  );
}
