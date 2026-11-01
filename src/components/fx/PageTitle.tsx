import type { ReactNode } from "react";

/** The page's single h1: huge, with a marker highlight and a pop sticker. Pages keep their own intro paragraph below it. */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-7xl">
      <span className="mark">{children}</span>
    </h1>
  );
}
