/** The site mark: an eight-armed blue asterisk. Decorative; the wordmark next to it carries the name. */
export function Asterisk({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" width={size} height={size} className={className} fill="currentColor">
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x="44" y="2" width="12" height="96" rx="6" transform={`rotate(${a} 50 50)`} />
      ))}
    </svg>
  );
}
