import Link from "next/link";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./theme";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-1 sm:px-6"
      >
        <Link href="/" className="font-semibold tracking-tight">
          CP &amp; SysDesign <span className="text-accent">Academy</span>
        </Link>
        <div className="ml-2 flex flex-wrap gap-x-4 gap-y-0 text-sm text-muted-fg">
          <Link href="/roadmap/" className="inline-flex min-h-11 items-center font-medium text-fg hover:text-accent">
            Roadmap
          </Link>
          <Link href="/cp/" className="inline-flex min-h-11 items-center hover:text-fg">
            Competitive Programming
          </Link>
          <Link href="/sd/" className="inline-flex min-h-11 items-center hover:text-fg">
            System Design
          </Link>
          <Link href="/patterns/" className="inline-flex min-h-11 items-center hover:text-fg">
            Patterns
          </Link>
          <Link href="/templates/" className="inline-flex min-h-11 items-center hover:text-fg">
            Templates
          </Link>
          <Link href="/glossary/" className="inline-flex min-h-11 items-center hover:text-fg">
            Glossary
          </Link>
          <Link href="/market/" className="inline-flex min-h-11 items-center hover:text-fg">
            Market
          </Link>
          <Link href="/paths/" className="inline-flex min-h-11 items-center hover:text-fg">
            Paths
          </Link>
          <Link href="/review/" className="inline-flex min-h-11 items-center hover:text-fg">
            Review
          </Link>
          <Link href="/dashboard/" className="inline-flex min-h-11 items-center hover:text-fg">
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
