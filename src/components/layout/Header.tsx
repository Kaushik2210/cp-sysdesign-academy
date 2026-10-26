import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./theme";
import { ScrollProgress } from "@/components/fx/ScrollProgress";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/75 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1 sm:px-6"
      >
        <Link href="/" className="group inline-flex min-h-11 items-center gap-2 font-bold tracking-tight">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand text-sm font-black text-white shadow-lg transition group-hover:rotate-12 group-hover:scale-110"
          >
            {"</>"}
          </span>
          <span>
            CP &amp; SysDesign <span className="text-gradient">Academy</span>
          </span>
        </Link>
        <NavLinks />
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </nav>
      <ScrollProgress />
    </header>
  );
}
