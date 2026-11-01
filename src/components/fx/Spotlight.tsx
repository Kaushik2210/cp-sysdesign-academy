"use client";

import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tint = "accent" | "hot" | "cool" | "sun" | "leaf";

interface Props {
  children: ReactNode;
  /** Renders a link when set, a plain block otherwise. */
  href?: string;
  tint?: Tint;
  className?: string;
  /** Max tilt in degrees toward the pointer; 0 disables it. */
  tilt?: number;
  "aria-label"?: string;
}

/** A flat hairline card; a faint blue wash follows the pointer. Tilt is opt-in (default off) and skipped for reduced motion. */
export function Spotlight({ children, href, tint = "accent", className, tilt = 0, ...rest }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const rx = ((y / r.height) * 2 - 1) * -tilt;
      const ry = ((x / r.width) * 2 - 1) * tilt;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
    }
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const props = {
    className: cn("spotlight group rounded-2xl border border-border", !className?.includes("pop-") && "bg-card", className),
    style: { "--tint": `var(--${tint})` } as CSSProperties,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    ...rest,
  };
  return href ? (
    <Link href={href} ref={(n) => void (ref.current = n)} {...props}>
      {children}
    </Link>
  ) : (
    <div ref={(n) => void (ref.current = n)} {...props}>
      {children}
    </div>
  );
}
