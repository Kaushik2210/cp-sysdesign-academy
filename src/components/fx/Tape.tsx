import { cn } from "@/lib/utils";

/** A tilted colour band of endlessly scrolling words. The second copy is hidden from assistive tech. */
export function Tape({
  items,
  tone,
  reverse,
  rotate = -1.5,
  duration = 38,
  label,
  className,
}: {
  items: string[];
  tone: string;
  reverse?: boolean;
  rotate?: number;
  duration?: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn("tape", tone, className)}
      style={{ ["--r" as string]: `${rotate}deg`, ["--dur" as string]: `${duration}s` }}
      role="group"
      aria-label={label}
    >
      <div className={cn("marquee-track py-2.5 text-xl font-extrabold uppercase tracking-tight sm:text-2xl", reverse && "reverse")}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((t) => (
              <li key={t} className="flex items-center">
                <span className="px-5">{t}</span>
                <span aria-hidden="true" className="text-2xl">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
