import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArtTone = "blue" | "ink" | "paper" | "line";

const TONES: Record<ArtTone, string> = {
  blue: "bg-accent text-accent-fg",
  ink: "bg-fg text-bg",
  paper: "bg-muted text-fg",
  line: "border border-border bg-card text-accent",
};

/** The 16:9 panel at the top of a gallery tile: a flat colour field with one large glyph or word. Decorative. */
export function TileArt({ tone, icon: Icon, word, index }: { tone: ArtTone; icon?: LucideIcon; word?: string; index?: number }) {
  return (
    <div className={cn("tile-art", TONES[tone])} aria-hidden="true">
      {index !== undefined && <span className="absolute left-3 top-2.5 text-xs font-medium tabular-nums opacity-80">{String(index + 1).padStart(2, "0")}</span>}
      {Icon && <Icon className="tile-glyph" size={76} strokeWidth={1.1} />}
      {word && <span className="text-7xl font-medium tracking-[-0.06em] sm:text-8xl">{word}</span>}
    </div>
  );
}
