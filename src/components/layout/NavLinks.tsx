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

/** Main navigation pills. The current section is marked with aria-current and a gradient fill. */
export function NavLinks() {
  const raw = usePathname() ?? "/";
  // Static export with trailingSlash: normalise so "/cp" and "/cp/" both match.
  const path = raw.endsWith("/") ? raw : `${raw}/`;
  return (
    <div className="order-last -mx-1 flex w-full min-w-0 gap-1 overflow-x-auto px-1 pb-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-none lg:mx-0 lg:w-auto lg:flex-1 lg:[mask-image:linear-gradient(90deg,black_92%,transparent)]" role="group" aria-label="Sections">
      {NAV.map((n) => {
        const active = path.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3 transition hover:-translate-y-0.5",
              active ? "bg-gradient-brand font-semibold text-white shadow-md" : "text-muted-fg hover:bg-muted hover:text-fg",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </div>
  );
}
