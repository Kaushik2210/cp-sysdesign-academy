"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** A giant line of text that slides sideways as you scroll past it. Static for reduced motion. */
export function ScrollWord({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["12%", "-48%"]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x: reduce ? 0 : x }} className="w-max whitespace-nowrap">
        {children}
      </motion.div>
    </div>
  );
}
