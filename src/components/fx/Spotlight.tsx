"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tint = "accent" | "hot" | "cool" | "sun" | "leaf";

interface Props {
  children: ReactNode;
  /** Renders a link when set, a plain block otherwise. */
  href?: string;
  tint?: Tint;
  className?: string;
  "aria-label"?: string;
}

/** A flat hairline tile whose border takes the tint colour on hover or focus. */
export function Spotlight({ children, href, tint = "accent", className, ...rest }: Props) {
  const props = {
    className: cn("spotlight group rounded-md border border-border bg-card", className),
    style: { "--tint": `var(--${tint})` } as CSSProperties,
    ...rest,
  };
  return href ? (
    <Link href={href} {...props}>
      {children}
    </Link>
  ) : (
    <div {...props}>{children}</div>
  );
}
