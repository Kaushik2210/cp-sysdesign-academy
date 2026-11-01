import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./theme";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { Asterisk } from "@/components/fx/Asterisk";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-border bg-bg">
      <nav
        aria-label="Main"
        className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 sm:px-6"
      >
        <Link href="/" className="group inline-flex min-h-11 items-center gap-2.5 font-extrabold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0d0d0d] bg-[hsl(var(--yellow))] text-[#0d0d0d] shadow-[3px_3px_0_#0d0d0d] transition group-hover:-rotate-12 group-hover:bg-[hsl(var(--pink))]">
            <Asterisk size={24} className="transition-transform duration-500 group-hover:rotate-90" />
          </span>
          <span className="text-[17px] leading-none">
            CP &amp; SysDesign <span className="mark">Academy</span>
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
