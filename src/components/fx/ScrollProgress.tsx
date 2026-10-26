"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** A thin gradient bar along the top edge showing how far down the page you are. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="no-print absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-accent via-hot to-sun"
      style={{ scaleX: reduce ? scrollYProgress : x }}
    />
  );
}
