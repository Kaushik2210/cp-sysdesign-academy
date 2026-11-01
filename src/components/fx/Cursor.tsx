"use client";

import { useEffect, useRef } from "react";

/** A ring that trails the pointer and swells over clickable things. Off for touch, reduced motion and automated browsers; the real cursor always stays visible. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Decorative only: skip it for touch, reduced motion, and automated browsers (it made headless e2e clicks about 8x slower).
    if (navigator.webdriver || !matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.hidden = false;
    let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
    // The loop only runs while the blob is catching up with the pointer, so an idle page does no work.
    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const move = (e: PointerEvent) => {
      if (x === -100) { x = e.clientX; y = e.clientY; } // first move: start at the pointer
      tx = e.clientX; ty = e.clientY; wake();
    };
    const over = (e: PointerEvent) => {
      const hot = (e.target as Element | null)?.closest("a, button, [role='button'], summary, input, select, textarea, label");
      el.dataset.hot = hot ? "1" : "0";
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
    };
  }, []);
  return <div ref={ref} hidden aria-hidden="true" className="cursor-blob no-print" />;
}
