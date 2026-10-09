import { cn } from "@/lib/utils";

const STYLES = {
  note: "border-blue-500/40 bg-blue-500/10",
  tip: "border-emerald-500/40 bg-emerald-500/10",
  warning: "border-amber-500/50 bg-amber-500/10",
  pitfall: "border-red-500/40 bg-red-500/10",
} as const;

const LABELS = { note: "Note", tip: "Tip", warning: "Warning", pitfall: "Pitfall" } as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof STYLES;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside role="note" className={cn("not-prose my-5 rounded-lg border-l-4 p-4", STYLES[type])}>
      <p className="mb-1 text-sm font-semibold">{title ?? LABELS[type]}</p>
      <div className="text-sm leading-relaxed [&>p]:my-1">{children}</div>
    </aside>
  );
}
