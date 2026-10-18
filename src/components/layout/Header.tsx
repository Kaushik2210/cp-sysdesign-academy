import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./theme";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6"
      >
        <Link href="/" className="font-semibold tracking-tight">
          CP &amp; SysDesign <span className="text-accent">Academy</span>
        </Link>
        <div className="ml-2 flex gap-4 text-sm text-muted-fg">
          <Link href="/cp/" className="hover:text-fg">
            Competitive Programming
          </Link>
          <Link href="/sd/" className="hover:text-fg">
            System Design
          </Link>
          <Link href="/patterns/" className="hover:text-fg">
            Patterns
          </Link>
          <Link href="/templates/" className="hover:text-fg">
            Templates
          </Link>
          <Link href="/paths/" className="hover:text-fg">
            Paths
          </Link>
          <Link href="/review/" className="hover:text-fg">
            Review
          </Link>
          <Link href="/dashboard/" className="hover:text-fg">
            Dashboard
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SearchDialog />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
