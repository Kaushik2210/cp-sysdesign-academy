"use client";

import { useEffect, useRef } from "react";

/** A blend-mode blob that trails the pointer and swells over clickable things. Off for touch and reduced motion; the real cursor always stays visible. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.hidden = false;
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
    const move = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    const over = (e: PointerEvent) => {
      const hot = (e.target as Element | null)?.closest("a, button, [role='button'], summary, input, select, textarea, label");
      el.dataset.hot = hot ? "1" : "0";
    };
    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
    };
  }, []);
  return <div ref={ref} hidden aria-hidden="true" className="cursor-blob no-print" />;
}
