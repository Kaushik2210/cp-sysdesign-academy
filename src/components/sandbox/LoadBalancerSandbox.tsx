"use client";

import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { LB_LABEL, LB_POLICIES, compareAll, type LbConfig, type LbPolicy } from "@/lib/sim/loadbalancer";
import { cn } from "@/lib/utils";

type SpeedPreset = "equal" | "oneSlow" | "mixed";

const PRESET_LABEL: Record<SpeedPreset, string> = {
  equal: "All servers equal",
  oneSlow: "One server at half speed",
  mixed: "Mixed sizes (1x, 2x, 3x ...)",
};

const speedsFor = (preset: SpeedPreset, n: number): number[] =>
  Array.from({ length: n }, (_, i) => (preset === "equal" ? 1 : preset === "oneSlow" ? (i === 0 ? 0.5 : 1) : 1 + (i % 3)));

const EXPLAIN: Record<LbPolicy, string> = {
  rr: "Sends requests to servers in a fixed rotation. Spreads the count evenly but ignores how expensive each request is.",
  random: "Picks a server uniformly at random. Simple and stateless, but chance clumping creates hot servers.",
  lc: "Sends each request to the server with the fewest requests in flight. Adapts to uneven request cost.",
  p2c: "Picks two servers at random and uses the less busy one. Almost as good as least connections without scanning every server.",
  wrr: "Rotation proportional to server capacity, spread smoothly. Essential when servers differ in size.",
  iphash: "Hashes the client to a fixed server. Gives stickiness for caching or sessions, but load follows how clients cluster.",
};

const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-medium transition hover:-translate-y-0.5 hover:border-accent hover:bg-muted";

/** Compare load-balancing policies on identical traffic and see who wins on average and tail latency. */
export function LoadBalancerSandbox() {
  const [servers, setServers] = useState(5);
  const [preset, setPreset] = useState<SpeedPreset>("equal");
  const [utilPct, setUtilPct] = useState(80);
  const [heavy, setHeavy] = useState(true);
  const [clients, setClients] = useState(200);
  const [seed, setSeed] = useState(7);
  const [selected, setSelected] = useState<LbPolicy>("rr");

  const cfg: LbConfig = useMemo(
    () => ({ speeds: speedsFor(preset, servers), requests: 6000, utilization: utilPct / 100, heavyTail: heavy, clients, seed }),
    [preset, servers, utilPct, heavy, clients, seed],
  );
  const results = useMemo(() => compareAll(cfg), [cfg]);
  const ranked = useMemo(() => [...results].sort((a, b) => a.p99 - b.p99), [results]);
  const worstP99 = Math.max(...results.map((r) => r.p99));
  const sel = results.find((r) => r.policy === selected)!;
  const maxWork = Math.max(...sel.work);

  const fmt = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1));

  return (
    <div className="mt-6 space-y-6">
      <section aria-labelledby="lb-setup" className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg p-4">
        <h2 id="lb-setup" className="text-base font-extrabold tracking-tight">
          Setup
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lb-servers" className="block text-sm font-medium">
              Number of servers
            </label>
            <select id="lb-servers" value={servers} onChange={(e) => setServers(Number(e.target.value))} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-bg focus-visible:border-accent px-2">
              {[2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lb-preset" className="block text-sm font-medium">
              Server sizes
            </label>
            <select id="lb-preset" value={preset} onChange={(e) => setPreset(e.target.value as SpeedPreset)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-bg focus-visible:border-accent px-2">
              {(Object.keys(PRESET_LABEL) as SpeedPreset[]).map((p) => (
                <option key={p} value={p}>
                  {PRESET_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lb-util" className="flex justify-between text-sm font-medium">
              <span>Load (share of total capacity)</span>
              <span className="font-mono">{utilPct}%</span>
            </label>
            <input id="lb-util" type="range" min={30} max={95} step={5} value={utilPct} onChange={(e) => setUtilPct(Number(e.target.value))} className="mt-1 h-11 w-full" />
          </div>
          <div>
            <label htmlFor="lb-clients" className="block text-sm font-medium">
              Distinct clients (for IP hash)
            </label>
            <select id="lb-clients" value={clients} onChange={(e) => setClients(Number(e.target.value))} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-bg focus-visible:border-accent px-2">
              {[8, 50, 200, 1000].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={heavy} onChange={(e) => setHeavy(e.target.checked)} className="h-4 w-4" />
          Some requests are 20 times more expensive (10% of traffic), like uploads among small reads
        </label>
        <button type="button" className={btn} onClick={() => setSeed((s) => s + 1)}>
          <Shuffle size={14} aria-hidden /> New random traffic
        </button>
      </section>

      <section aria-labelledby="lb-results" className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg p-4">
        <h2 id="lb-results" className="text-base font-extrabold tracking-tight">
          Ranked by tail latency (p99)
        </h2>
        <p className="mt-1 text-sm text-muted-fg">
          Latency is in time units, where a typical request takes 1 on a normal server. Lower is better. Every policy saw exactly the same {cfg.requests.toLocaleString("en-US")} requests.
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm" aria-live="polite">
            <caption className="sr-only">Load balancing policies compared on mean, median and 99th percentile latency</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th scope="col" className="p-2">#</th>
                <th scope="col" className="p-2">Policy</th>
                <th scope="col" className="p-2">Mean</th>
                <th scope="col" className="p-2">p50</th>
                <th scope="col" className="p-2">p99</th>
                <th scope="col" className="p-2">Work imbalance</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => (
                <tr key={r.policy} className={cn("border-b border-border", r.policy === selected && "bg-muted font-medium")}>
                  <td className="p-2">{i + 1}</td>
                  <th scope="row" className="p-2 text-left font-medium">
                    {LB_LABEL[r.policy]}
                  </th>
                  <td className="p-2 font-mono">{fmt(r.mean)}</td>
                  <td className="p-2 font-mono">{fmt(r.p50)}</td>
                  <td className="p-2">
                    <div className="font-mono">{fmt(r.p99)}</div>
                    <div className="mt-0.5 h-1.5 w-28 overflow-hidden rounded bg-muted">
                      <div className="h-full bg-gradient-to-r from-accent via-hot to-sun transition-[width] duration-500" style={{ width: `${(r.p99 / worstP99) * 100}%` }} />
                    </div>
                  </td>
                  <td className="p-2 font-mono">{r.workImbalance.toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-fg">Work imbalance is the busiest server&apos;s total work divided by the average: 1.00x is perfectly even.</p>
      </section>

      <section aria-labelledby="lb-detail" className="rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-lg p-4">
        <h2 id="lb-detail" className="text-base font-extrabold tracking-tight">
          Where did the work go?
        </h2>
        <fieldset className="mt-2">
          <legend className="sr-only">Policy to inspect</legend>
          <div className="flex flex-wrap gap-2">
            {LB_POLICIES.map((p) => (
              <label key={p} className={cn(btn, "cursor-pointer", selected === p && "border-accent text-accent")}>
                <input type="radio" name="lb-policy" className="sr-only" checked={selected === p} onChange={() => setSelected(p)} />
                {LB_LABEL[p]}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-2 text-sm text-muted-fg">{EXPLAIN[selected]}</p>
        <ul className="mt-3 space-y-2">
          {cfg.speeds.map((sp, i) => (
            <li key={i} className="text-sm">
              <div className="flex justify-between">
                <span>
                  Server {i + 1} <span className="text-muted-fg">(speed {sp}x)</span>
                </span>
                <span className="font-mono text-muted-fg">
                  {sel.counts[i].toLocaleString("en-US")} requests · work {Math.round(sel.work[i]).toLocaleString("en-US")}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded bg-muted">
                <div className="h-full bg-gradient-to-r from-accent via-hot to-sun transition-[width] duration-500" style={{ width: `${maxWork ? (sel.work[i] / maxWork) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}