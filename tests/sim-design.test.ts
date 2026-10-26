import { describe, expect, it } from "vitest";
import { EXAMPLES, analyze, type Graph, type Kind } from "../src/lib/sim/design";

const g = (nodes: [string, Kind, number?][], edges: [string, string][]): Graph => ({
  nodes: nodes.map(([id, kind, replicas]) => ({ id, kind, replicas: replicas ?? 1 })),
  edges: edges.map(([from, to]) => ({ from, to })),
});
const ids = (gr: Graph) => analyze(gr).findings.map((f) => f.id);

describe("analyze: examples", () => {
  it("the naive design trips the classic problems", () => {
    const a = analyze(EXAMPLES.naive);
    expect(ids(EXAMPLES.naive)).toEqual(expect.arrayContaining(["spof-app", "spof-db", "no-cache", "no-limiter", "no-monitor"]));
    expect(a.findings.filter((f) => f.severity === "high")).toHaveLength(2);
    expect(a.score).toBe(100 - 15 - 15 - 8 - 3 - 3);
  });
  it("the robust design has no findings and a perfect score", () => {
    const a = analyze(EXAMPLES.robust);
    expect(a.findings).toEqual([]);
    expect(a.score).toBe(100);
    expect(a.strengths.length).toBeGreaterThanOrEqual(6);
  });
  it("findings are sorted most severe first", () => {
    const sev = analyze(EXAMPLES.naive).findings.map((f) => f.severity);
    const order = { high: 0, medium: 1, low: 2, info: 3 } as const;
    expect([...sev].sort((a, b) => order[a] - order[b])).toEqual(sev);
  });
});

describe("analyze: individual rules", () => {
  it("handles an empty canvas without a score", () => {
    const a = analyze({ nodes: [], edges: [] });
    expect(a.score).toBe(0);
    expect(a.findings[0].id).toBe("empty");
  });

  it("flags a client reaching the database directly as high severity", () => {
    const f = analyze(g([["c", "client"], ["d", "db"]], [["c", "d"]])).findings.find((x) => x.id === "client-to-db");
    expect(f?.severity).toBe("high");
    expect(f?.nodes.sort()).toEqual(["c", "d"]);
  });

  it("a single load balancer is a SPOF; two instances are not", () => {
    const base = (r: number) => g([["c", "client"], ["lb", "lb", r], ["a", "app", 2]], [["c", "lb"], ["lb", "a"]]);
    expect(ids(base(1))).toContain("spof-lb");
    expect(ids(base(2))).not.toContain("spof-lb");
  });

  it("several app servers without a load balancer or gateway are flagged", () => {
    expect(ids(g([["c", "client"], ["a", "app", 3]], [["c", "a"]]))).toContain("no-lb");
    expect(ids(g([["c", "client"], ["gw", "gateway", 2], ["a", "app", 3]], [["c", "gw"], ["gw", "a"]]))).not.toContain("no-lb");
  });

  it("a database is fine with a replica node or with multiple instances", () => {
    const withReplica = g([["a", "app", 2], ["d", "db"], ["r", "replica"]], [["a", "d"], ["d", "r"]]);
    const multi = g([["a", "app", 2], ["d", "db", 2]], [["a", "d"]]);
    const bare = g([["a", "app", 2], ["d", "db"]], [["a", "d"]]);
    expect(ids(withReplica)).not.toContain("spof-d");
    expect(ids(multi)).not.toContain("spof-d");
    expect(ids(bare)).toContain("spof-d");
  });

  it("asks for a cache only when the app reads the database without one", () => {
    expect(ids(g([["a", "app", 2], ["d", "db", 2]], [["a", "d"]]))).toContain("no-cache");
    expect(ids(g([["a", "app", 2], ["d", "db", 2], ["k", "cache", 2]], [["a", "d"], ["a", "k"]]))).not.toContain("no-cache");
  });

  it("queues need producers and consumers, and workers need queues", () => {
    const noConsumer = g([["a", "app", 2], ["q", "queue"]], [["a", "q"]]);
    expect(ids(noConsumer)).toContain("queue-no-consumer-q");
    const direct = g([["a", "app", 2], ["w", "worker"]], [["a", "w"]]);
    expect(ids(direct)).toContain("worker-no-queue-w");
    const ok = g([["a", "app", 2], ["q", "queue"], ["w", "worker", 2]], [["a", "q"], ["q", "w"]]);
    expect(ids(ok).filter((i) => i.startsWith("queue-") || i.startsWith("worker-"))).toEqual([]);
    expect(analyze(ok).strengths).toContain("Background work is decoupled through a queue.");
  });

  it("object storage with clients but no CDN is flagged", () => {
    expect(ids(g([["c", "client"], ["s", "storage"]], [["c", "s"]]))).toContain("no-cdn");
    expect(ids(g([["c", "client"], ["cdn", "cdn"], ["s", "storage"]], [["c", "cdn"], ["cdn", "s"]]))).not.toContain("no-cdn");
  });

  it("reports orphan nodes but not when only one node exists", () => {
    expect(ids(g([["a", "app", 2], ["k", "cache", 2], ["x", "queue"]], [["a", "k"]]))).toContain("orphan-x");
    expect(ids(g([["a", "app"]], [])).some((i) => i.startsWith("orphan"))).toBe(false);
  });

  it("a detached replica and unused replicas are reported", () => {
    expect(ids(g([["d", "db"], ["r", "replica"]], []))).toContain("replica-detached-r");
    const unused = analyze(g([["a", "app", 2], ["d", "db"], ["r", "replica"]], [["a", "d"], ["d", "r"]]));
    expect(unused.findings.find((f) => f.id === "replica-reads")?.severity).toBe("info");
  });

  it("score never goes below zero and info findings cost nothing", () => {
    const bad = g(
      [["c", "client"], ["d", "db"], ["d2", "db"], ["q", "queue"], ["w", "worker"], ["s", "storage"], ["x", "cdn"], ["l", "lb"], ["a", "app"], ["a2", "app"], ["k", "cache"]],
      [["c", "d"], ["c", "d2"]],
    );
    expect(analyze(bad).score).toBe(0);
    expect(analyze(g([["c", "client"]], [])).findings.map((f) => f.severity)).not.toContain("high");
  });
});