"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";

export function ContinueCard({ lessons }: { lessons: Record<string, { title: string; href: string }> }) {
  const last = useProgress((s) => s.lastVisited);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const target = mounted && last ? lessons[last] : undefined;
  if (!target) return null;
  return (
    <Link
      href={target.href}
      className="mt-6 inline-flex flex-col rounded-xl border border-accent/50 bg-card px-5 py-3 hover:bg-muted"
    >
      <span className="text-xs uppercase tracking-wide text-muted-fg">Continue where you left off</span>
      <span className="font-medium text-accent">{target.title}</span>
    </Link>
  );
}
