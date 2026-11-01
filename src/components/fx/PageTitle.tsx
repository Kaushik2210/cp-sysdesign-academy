import type { ReactNode } from "react";

/** The page's single h1 in the site's large editorial style. Pages keep their own intro paragraph below it. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
      <span aria-hidden="true" className="mr-3 text-accent">—</span>
      {children}
    </h1>
  );
}
