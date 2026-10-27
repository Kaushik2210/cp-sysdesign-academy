"use client";

import { useState } from "react";
import {
  availabilityParallel,
  availabilitySeries,
  bandwidthBitsPerSecond,
  downtimeBudget,
  formatBitrate,
  formatBytes,
  formatDuration,
  perDayToQps,
  serversNeeded,
  storageBytes,
} from "@/lib/numbers";

/** Parses a user-typed number; empty or invalid input counts as 0 so outputs never show NaN. */
const num = (s: string) => {
  const n = Number(s.replace(/[,_\s]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

function Field({ id, label, value, onChange, hint }: { id: string; label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 font-mono" />
      {hint && <p className="mt-0.5 text-xs text-muted-fg">{hint}</p>}
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3">
      <dt className="text-xs text-muted-fg">{label}</dt>
      <dd className="font-mono text-xl font-bold text-gradient">{value}</dd>
    </div>
  );
}

const card = "rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm transition-shadow focus-within:border-accent focus-within:shadow-[0_12px_32px_-14px_hsl(var(--accent))]";

/** Four small estimators that mirror the maths in the estimation lessons. */
export function NumbersCalculators() {
  // Traffic and servers
  const [perDay, setPerDay] = useState("100000000");
  const [peak, setPeak] = useState("3");
  const [respBytes, setRespBytes] = useState("50000");
  const [perServer, setPerServer] = useState("500");
  const [util, setUtil] = useState("70");
  // Storage
  const [recs, setRecs] = useState("1000000");
  const [recBytes, setRecBytes] = useState("500");
  const [days, setDays] = useState("365");
  const [repl, setRepl] = useState("3");
  // Availability
  const [avail, setAvail] = useState("99.9");
  const [parts, setParts] = useState("99.9, 99.95, 99.99");

  const q = perDayToQps(num(perDay), num(peak) || 1);
  const servers = serversNeeded(q.peak, num(perServer) || 1, (num(util) || 70) / 100);
  const bw = bandwidthBitsPerSecond(q.peak, num(respBytes));
  const stored = storageBytes(num(recs), num(recBytes), num(days), num(repl) || 1);
  const a = Math.min(100, num(avail));
  const dt = downtimeBudget(a);
  const fractions = parts.split(",").map((p) => num(p) / 100).filter((p) => p > 0 && p <= 1);

  return (
    <div className="mt-4 space-y-6">
      <section aria-labelledby="calc-traffic" className={card}>
        <h3 id="calc-traffic" className="font-semibold">
          Traffic, bandwidth and servers
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field id="c-perday" label="Requests per day" value={perDay} onChange={setPerDay} />
          <Field id="c-peak" label="Peak factor" value={peak} onChange={setPeak} hint="Peak is often 2 to 5 times the average." />
          <Field id="c-resp" label="Average response size (bytes)" value={respBytes} onChange={setRespBytes} />
          <Field id="c-perserver" label="Requests per second one server handles" value={perServer} onChange={setPerServer} hint="Measure this; do not guess." />
          <Field id="c-util" label="Target utilisation at peak (%)" value={util} onChange={setUtil} />
        </div>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2" aria-live="polite">
          <Result label="Average requests per second" value={q.average.toFixed(1)} />
          <Result label="Peak requests per second" value={q.peak.toFixed(1)} />
          <Result label="Peak outbound bandwidth" value={formatBitrate(bw)} />
          <Result label="Servers needed" value={String(servers)} />
        </dl>
      </section>

      <section aria-labelledby="calc-storage" className={card}>
        <h3 id="calc-storage" className="font-semibold">
          Storage
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field id="c-recs" label="New records per day" value={recs} onChange={setRecs} />
          <Field id="c-recbytes" label="Bytes per record" value={recBytes} onChange={setRecBytes} />
          <Field id="c-days" label="Days to keep" value={days} onChange={setDays} />
          <Field id="c-repl" label="Replication factor" value={repl} onChange={setRepl} />
        </div>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2" aria-live="polite">
          <Result label="Total stored (decimal units)" value={formatBytes(stored)} />
          <Result label="Per day, before replication" value={formatBytes(num(recs) * num(recBytes))} />
        </dl>
      </section>

      <section aria-labelledby="calc-avail" className={card}>
        <h3 id="calc-avail" className="font-semibold">
          Availability
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field id="c-avail" label="Availability target (%)" value={avail} onChange={setAvail} hint="For example 99.9 or 99.99." />
          <Field id="c-parts" label="Component availabilities (%), comma separated" value={parts} onChange={setParts} hint="Used for the series and parallel results below." />
        </div>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2" aria-live="polite">
          <Result label="Downtime allowed per year" value={formatDuration(dt.perYear)} />
          <Result label="Per month / per week / per day" value={`${formatDuration(dt.perMonth)} / ${formatDuration(dt.perWeek)} / ${formatDuration(dt.perDay)}`} />
          <Result label="All components required (series)" value={fractions.length ? `${(availabilitySeries(fractions) * 100).toFixed(4)}%` : "-"} />
          <Result label="Any one is enough (parallel)" value={fractions.length ? `${(availabilityParallel(fractions) * 100).toFixed(6)}%` : "-"} />
        </dl>
        <p className="mt-2 text-xs text-muted-fg">Series is the chain of services a request must pass through; parallel is redundant copies. A year is taken as 365 days and a month as a twelfth of a year.</p>
      </section>
    </div>
  );
}