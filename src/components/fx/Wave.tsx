/** Display text whose letters hop and change colour under the pointer. Reads as one string to screen readers. */
export function Wave({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-label={text} className={`wave ${className ?? ""}`}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden="true">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
