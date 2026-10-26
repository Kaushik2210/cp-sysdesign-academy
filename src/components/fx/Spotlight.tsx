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

/** A card that glows under the pointer and leans slightly toward it. Both effects are skipped for reduced motion. */
export function Spotlight({ children, href, tint = "accent", className, tilt = 3, ...rest }: Props) {
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
    className: cn("spotlight rounded-2xl border border-border bg-card/80 backdrop-blur-sm", className),
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
