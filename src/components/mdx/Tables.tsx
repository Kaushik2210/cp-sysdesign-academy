export function Complexity({ time, space, note }: { time: string; space?: string; note?: string }) {
  return (
    <p className="not-prose my-4 inline-flex flex-wrap gap-x-4 gap-y-1 rounded-md border border-border bg-muted px-3 py-2 text-sm">
      <span>
        <b>Time:</b> <code>{time}</code>
      </span>
      {space && (
        <span>
          <b>Space:</b> <code>{space}</code>
        </span>
      )}
      {note && <span className="text-muted-fg">{note}</span>}
    </p>
  );
}

export interface TradeOffRow {
  option: string;
  pros: string;
  cons: string;
  chooseWhen: string;
}

/** Trade-off comparison table. (Exposed to MDX as <TradeOffs>; JSX tag names cannot contain "-".) */
export function TradeOffs({ rows, caption }: { rows: TradeOffRow[]; caption?: string }) {
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="mb-1 text-left font-semibold">{caption}</caption>}
        <thead>
          <tr className="border-b border-border text-left">
            {["Option", "Pros", "Cons", "Choose when"].map((h) => (
              <th key={h} scope="col" className="p-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.option} className="border-b border-border align-top">
              <th scope="row" className="p-2 text-left font-medium">
                {r.option}
              </th>
              <td className="p-2">{r.pros}</td>
              <td className="p-2">{r.cons}</td>
              <td className="p-2">{r.chooseWhen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
