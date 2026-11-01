import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./theme";
import { ScrollProgress } from "@/components/fx/ScrollProgress";

/** Editorial header: serif wordmark on the left, search and theme on the right, section links on a quiet second row. */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto max-w-[110rem] px-4 sm:px-8">
        <div className="flex min-h-16 items-center gap-4">
          <Link href="/" className="group inline-flex min-h-11 items-baseline gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 translate-y-px rounded-full bg-accent transition-transform group-hover:scale-150" />
            <span className="font-serif text-[1.65rem] leading-none tracking-tight">
              CP <span className="italic">&amp;</span> SysDesign
            </span>
            <span className="label hidden sm:inline">Academy</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <SearchDialog />
            <ThemeToggle />
          </div>
        </div>
        <NavLinks />
      </nav>
      <ScrollProgress />
    </header>
  );
}
