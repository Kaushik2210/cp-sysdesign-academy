import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./theme";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { Asterisk } from "@/components/fx/Asterisk";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1 sm:px-6"
      >
        <Link href="/" className="group inline-flex min-h-11 items-center gap-2.5 text-[15px] font-medium tracking-tight">
          <Asterisk size={26} className="text-accent transition-transform duration-500 group-hover:rotate-90" />
          <span>CP &amp; SysDesign Academy</span>
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
