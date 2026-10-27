import type { ReactNode } from "react";

/** The page's single h1 in the site's large gradient style. Pages keep their own intro paragraph below it. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
      <span className="text-gradient">{children}</span>
    </h1>
  );
}
