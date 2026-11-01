"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV: { href: string; label: string }[] = [
  { href: "/roadmap/", label: "Roadmap" },
  { href: "/cp/", label: "Competitive Programming" },
  { href: "/sd/", label: "System Design" },
  { href: "/mock/", label: "Mock" },
  { href: "/patterns/", label: "Patterns" },
  { href: "/visualizers/", label: "Visualizers" },
  { href: "/sandbox/", label: "Sandbox" },
  { href: "/cheatsheets/", label: "Cheat sheets" },
  { href: "/templates/", label: "Templates" },
  { href: "/glossary/", label: "Glossary" },
  { href: "/market/", label: "Market" },
  { href: "/paths/", label: "Paths" },
  { href: "/review/", label: "Review" },
  { href: "/dashboard/", label: "Dashboard" },
];

/** Section links as quiet text. The current section is marked with aria-current and a blue underline. */
export function NavLinks() {
  const raw = usePathname() ?? "/";
  // Static export with trailingSlash: normalise so "/cp" and "/cp/" both match.
  const path = raw.endsWith("/") ? raw : `${raw}/`;
  return (
    <div
      className="-mx-1 flex min-w-0 gap-5 overflow-x-auto px-1 text-[0.8125rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Sections"
    >
      {NAV.map((n) => {
        const active = path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex min-h-11 shrink-0 items-center whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:text-accent hover:after:scale-x-100",
              active ? "font-medium text-accent after:scale-x-100" : "text-muted-fg",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}
