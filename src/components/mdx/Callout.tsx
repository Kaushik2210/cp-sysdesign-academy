import { AlertTriangle, Flame, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const STYLES = {
  note: { box: "border-cool/60 bg-cool/10", icon: "text-cool", Icon: Info },
  tip: { box: "border-leaf/60 bg-leaf/10", icon: "text-leaf", Icon: Lightbulb },
  warning: { box: "border-sun/70 bg-sun/10", icon: "text-sun", Icon: AlertTriangle },
  pitfall: { box: "border-hot/60 bg-hot/10", icon: "text-hot", Icon: Flame },
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
  const s = STYLES[type];
  return (
    <aside role="note" className={cn("not-prose my-6 rounded-xl border border-l-[6px] p-4 shadow-sm", s.box)}>
      <p className="mb-1 flex items-center gap-2 text-sm font-bold">
        <s.Icon size={16} aria-hidden className={s.icon} />
        {title ?? LABELS[type]}
      </p>
      <div className="text-sm leading-relaxed [&>p]:my-1">{children}</div>
    </aside>
  );
}
