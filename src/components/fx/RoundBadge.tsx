/** A spinning circular-text badge with a star in the middle. Decorative. */
export function RoundBadge({ text, className }: { text: string; className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <div className="relative grid h-36 w-36 place-items-center rounded-full border-[3px] border-[#0d0d0d] bg-[hsl(var(--pink))] text-[#0d0d0d] shadow-[5px_5px_0_#0d0d0d] sm:h-44 sm:w-44">
        <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full">
          <defs>
            <path id="badge-circle" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
          </defs>
          <text fontSize="19" fontWeight="800" letterSpacing="2.6" fill="currentColor" style={{ textTransform: "uppercase" }}>
            <textPath href="#badge-circle">{text}</textPath>
          </text>
        </svg>
        <svg viewBox="0 0 100 100" className="h-14 w-14" fill="currentColor">
          {[0, 45, 90, 135].map((a) => (
            <rect key={a} x="44" y="4" width="12" height="92" rx="6" transform={`rotate(${a} 50 50)`} />
          ))}
        </svg>
      </div>
    </div>
  );
}
