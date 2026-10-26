/** Static analysis of a system design diagram: finds the classic problems the lessons teach. */

export type Kind = "client" | "cdn" | "lb" | "gateway" | "app" | "cache" | "db" | "replica" | "queue" | "worker" | "storage" | "limiter" | "monitor";

export interface KindInfo {
  label: string;
  /** What the component is for, in one sentence. */
  role: string;
}

export const KINDS: Record<Kind, KindInfo> = {
  client: { label: "Client", role: "Browsers and apps that send requests." },
  cdn: { label: "CDN", role: "Edge cache that serves static content close to users." },
  lb: { label: "Load balancer", role: "Spreads requests across servers and removes unhealthy ones." },
  gateway: { label: "API gateway", role: "Single entry point that routes, authenticates and rate limits." },
  app: { label: "App servers", role: "Stateless services running your business logic." },
  cache: { label: "Cache", role: "Fast in-memory store that absorbs repeated reads." },
  db: { label: "Database", role: "Durable store of record." },
  replica: { label: "DB replica", role: "A copy of the database for read scaling and failover." },
  queue: { label: "Message queue", role: "Buffer that decouples producers from slower consumers." },
  worker: { label: "Worker", role: "Processes queued background jobs." },
  storage: { label: "Object storage", role: "Stores large files such as images and video." },
  limiter: { label: "Rate limiter", role: "Caps how fast any client can call the system." },
  monitor: { label: "Monitoring", role: "Metrics, logs and alerts so you can see failures." },
};

export interface GNode {
  id: string;
  kind: Kind;
  /** Number of redundant instances of this component. */
  replicas: number;
}

export interface GEdge {
  from: string;
  to: string;
}

export interface Graph {
  nodes: GNode[];
  edges: GEdge[];
}

export type Severity = "high" | "medium" | "low" | "info";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  why: string;
  fix: string;
  /** Nodes to highlight. */
  nodes: string[];
  /** Lesson that explains the issue. */
  lesson?: string;
}

export interface Analysis {
  findings: Finding[];
  strengths: string[];
  /** 0 to 100. Starts at 100 and loses points per finding. */
  score: number;
}

const PENALTY: Record<Severity, number> = { high: 15, medium: 8, low: 3, info: 0 };

export function analyze(g: Graph): Analysis {
  const out: Finding[] = [];
  const kindOf = new Map(g.nodes.map((n) => [n.id, n]));
  const ofKind = (...k: Kind[]) => g.nodes.filter((n) => k.includes(n.kind));
  const outgoing = (id: string) => g.edges.filter((e) => e.from === id).map((e) => kindOf.get(e.to)).filter(Boolean) as GNode[];
  const incoming = (id: string) => g.edges.filter((e) => e.to === id).map((e) => kindOf.get(e.from)).filter(Boolean) as GNode[];
  const degree = (id: string) => g.edges.filter((e) => e.from === id || e.to === id).length;
  const label = (n: GNode) => KINDS[n.kind].label;
  const push = (f: Finding) => out.push(f);

  if (g.nodes.length === 0) {
    return {
      findings: [{ id: "empty", severity: "info", title: "The canvas is empty", why: "There is nothing to review yet.", fix: "Add a client and the components a request would pass through, then connect them.", nodes: [] }],
      strengths: [],
      score: 0,
    };
  }

  const clients = ofKind("client");
  if (clients.length === 0) {
    push({ id: "no-client", severity: "info", title: "No client", why: "Every design starts with who sends requests.", fix: "Add a client and connect it to your entry point.", nodes: [] });
  }

  // Single points of failure.
  for (const n of ofKind("lb", "gateway")) {
    if (n.replicas < 2)
      push({ id: `spof-${n.id}`, severity: "high", title: `${label(n)} is a single point of failure`, why: "If the only entry point fails, nothing can reach the system, however many app servers you have.", fix: "Run at least two instances behind a floating address or DNS failover.", nodes: [n.id], lesson: "sd/load-balancing/load-balancer-basics" });
  }
  for (const n of ofKind("app")) {
    if (n.replicas < 2)
      push({ id: `spof-${n.id}`, severity: "high", title: "App servers run as a single instance", why: "One instance means any crash, deploy or overload is an outage, and it cannot scale out.", fix: "Run several stateless instances behind a load balancer.", nodes: [n.id], lesson: "sd/scalability/scaling-stateless-autoscaling" });
  }
  for (const n of ofKind("db")) {
    const hasReplica = n.replicas >= 2 || g.edges.some((e) => (e.from === n.id || e.to === n.id) && kindOf.get(e.from === n.id ? e.to : e.from)?.kind === "replica");
    if (!hasReplica)
      push({ id: `spof-${n.id}`, severity: "high", title: "Database has no replica", why: "A single database is both a single point of failure and a read bottleneck, and a disk loss could lose data.", fix: "Add a replica (or run multiple instances) with automatic failover and backups.", nodes: [n.id], lesson: "sd/databases-2/replication" });
  }
  for (const n of ofKind("cache")) {
    if (n.replicas < 2)
      push({ id: `spof-${n.id}`, severity: "medium", title: "Cache is a single instance", why: "If it fails, every read hits the database at once and can overload it.", fix: "Replicate or shard the cache, and protect the database with request coalescing.", nodes: [n.id], lesson: "sd/caching/invalidation-and-stampedes" });
  }

  // Wiring problems.
  const direct = g.edges.filter((e) => {
    const from = kindOf.get(e.from);
    const to = kindOf.get(e.to);
    return from && to && (from.kind === "client" || from.kind === "cdn") && (to.kind === "db" || to.kind === "replica");
  });
  if (direct.length)
    push({ id: "client-to-db", severity: "high", title: "A client talks to the database directly", why: "Exposing the data store to clients skips authentication, validation and rate limiting, and invites data theft.", fix: "Route all data access through application servers.", nodes: [...new Set(direct.flatMap((e) => [e.from, e.to]))] });

  const multiApp = ofKind("app").filter((n) => n.replicas >= 2);
  const hasEntry = ofKind("lb", "gateway").length > 0;
  if (multiApp.length && !hasEntry)
    push({ id: "no-lb", severity: "medium", title: "Several app servers but nothing to spread traffic", why: "Clients need a single address, and something must health-check servers and distribute requests.", fix: "Put a load balancer or API gateway in front of the app servers.", nodes: multiApp.map((n) => n.id), lesson: "sd/load-balancing/load-balancer-basics" });

  const appToDb = g.edges.some((e) => kindOf.get(e.from)?.kind === "app" && kindOf.get(e.to)?.kind === "db");
  const appToCache = g.edges.some((e) => kindOf.get(e.from)?.kind === "app" && kindOf.get(e.to)?.kind === "cache");
  if (appToDb && !appToCache)
    push({ id: "no-cache", severity: "medium", title: "Every read goes to the database", why: "Read-heavy traffic with skewed popularity is cheap to absorb with a cache, and the database is the hardest part to scale.", fix: "Add a cache in front of the database for hot reads (cache-aside is a good default).", nodes: ofKind("app", "db").map((n) => n.id), lesson: "sd/caching/caching-strategies" });

  for (const q of ofKind("queue")) {
    const consumers = outgoing(q.id).filter((n) => n.kind === "worker" || n.kind === "app");
    if (consumers.length === 0)
      push({ id: `queue-no-consumer-${q.id}`, severity: "medium", title: "Queue has no consumer", why: "Messages pile up with nothing processing them.", fix: "Connect the queue to a worker or service that consumes it.", nodes: [q.id], lesson: "sd/queues-and-streaming/why-queues" });
    if (incoming(q.id).length === 0)
      push({ id: `queue-no-producer-${q.id}`, severity: "low", title: "Nothing publishes to the queue", why: "A queue with no producer does nothing.", fix: "Connect the service that creates the work to the queue.", nodes: [q.id] });
  }
  for (const w of ofKind("worker")) {
    if (!incoming(w.id).some((n) => n.kind === "queue"))
      push({ id: `worker-no-queue-${w.id}`, severity: "medium", title: "Worker is not fed by a queue", why: "Calling workers directly couples them to the request path, so bursts or failures spread to users.", fix: "Feed workers through a queue so they can retry, scale and absorb spikes.", nodes: [w.id], lesson: "sd/queues-and-streaming/backpressure-retries-and-dlq" });
  }

  if (ofKind("storage").length && clients.length && ofKind("cdn").length === 0)
    push({ id: "no-cdn", severity: "medium", title: "Large files are served without a CDN", why: "Serving images and video from one region adds latency for distant users and wastes origin bandwidth.", fix: "Put a CDN in front of object storage for static and media content.", nodes: ofKind("storage").map((n) => n.id), lesson: "sd/networking-and-apis/cdn-and-api-design" });

  for (const c of ofKind("cdn")) {
    if (outgoing(c.id).length === 0)
      push({ id: `cdn-no-origin-${c.id}`, severity: "low", title: "CDN has no origin", why: "On a cache miss the CDN needs somewhere to fetch content from.", fix: "Connect the CDN to its origin (object storage or the load balancer).", nodes: [c.id] });
  }

  if (clients.length && ofKind("limiter").length === 0)
    push({ id: "no-limiter", severity: "low", title: "No rate limiting", why: "Without limits, one misbehaving or malicious client can exhaust capacity for everyone.", fix: "Add a rate limiter at the gateway or load balancer.", nodes: [], lesson: "sd/scalability/rate-limiting-algorithms" });

  if (g.nodes.length >= 3 && ofKind("monitor").length === 0)
    push({ id: "no-monitor", severity: "low", title: "No monitoring", why: "You cannot fix or even notice failures you cannot see.", fix: "Add metrics, logs and alerts for every component.", nodes: [] });

  if (g.nodes.length > 1) {
    for (const n of g.nodes) {
      if (degree(n.id) === 0 && n.kind !== "monitor")
        push({ id: `orphan-${n.id}`, severity: "low", title: `${label(n)} is not connected to anything`, why: "A component with no connections does not take part in any request.", fix: "Connect it or remove it.", nodes: [n.id] });
    }
  }

  for (const r of ofKind("replica")) {
    if (!g.edges.some((e) => (e.from === r.id || e.to === r.id) && kindOf.get(e.from === r.id ? e.to : e.from)?.kind === "db"))
      push({ id: `replica-detached-${r.id}`, severity: "low", title: "Replica is not attached to a database", why: "A replica must be fed from a primary to be of any use.", fix: "Connect the replica to its primary database.", nodes: [r.id] });
  }
  if (ofKind("replica").length && !g.edges.some((e) => kindOf.get(e.from)?.kind === "app" && kindOf.get(e.to)?.kind === "replica"))
    push({ id: "replica-reads", severity: "info", title: "Reads are not using the replica", why: "Replicas also scale reads when read traffic goes to them.", fix: "Send read queries from the app servers to the replica (mind replication lag).", nodes: ofKind("replica").map((n) => n.id), lesson: "sd/databases-2/read-replicas-and-failover" });

  const strengths: string[] = [];
  if (ofKind("cache").length && appToCache) strengths.push("A cache absorbs repeated reads.");
  if (ofKind("lb", "gateway").some((n) => n.replicas >= 2)) strengths.push("The entry point is redundant.");
  if (ofKind("app").some((n) => n.replicas >= 2)) strengths.push("App servers scale horizontally.");
  if (ofKind("db").some((n) => n.replicas >= 2) || ofKind("replica").length) strengths.push("The database has redundancy.");
  if (ofKind("queue").length && ofKind("worker").length && !out.some((f) => f.id.startsWith("queue-no") || f.id.startsWith("worker-no"))) strengths.push("Background work is decoupled through a queue.");
  if (ofKind("cdn").length) strengths.push("A CDN serves content close to users.");
  if (ofKind("limiter").length) strengths.push("Rate limiting protects capacity.");
  if (ofKind("monitor").length) strengths.push("There is monitoring.");

  const score = Math.max(0, 100 - out.reduce((sum, f) => sum + PENALTY[f.severity], 0));
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2, info: 3 };
  out.sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id));
  return { findings: out, strengths, score };
}

/** Example graphs for the canvas. Positions are assigned by the UI. */
export const EXAMPLES: Record<"naive" | "robust", Graph> = {
  naive: {
    nodes: [
      { id: "client", kind: "client", replicas: 1 },
      { id: "app", kind: "app", replicas: 1 },
      { id: "db", kind: "db", replicas: 1 },
    ],
    edges: [
      { from: "client", to: "app" },
      { from: "app", to: "db" },
    ],
  },
  robust: {
    nodes: [
      { id: "client", kind: "client", replicas: 1 },
      { id: "cdn", kind: "cdn", replicas: 1 },
      { id: "storage", kind: "storage", replicas: 1 },
      { id: "limiter", kind: "limiter", replicas: 1 },
      { id: "lb", kind: "lb", replicas: 2 },
      { id: "app", kind: "app", replicas: 3 },
      { id: "cache", kind: "cache", replicas: 2 },
      { id: "db", kind: "db", replicas: 1 },
      { id: "replica", kind: "replica", replicas: 1 },
      { id: "queue", kind: "queue", replicas: 1 },
      { id: "worker", kind: "worker", replicas: 2 },
      { id: "monitor", kind: "monitor", replicas: 1 },
    ],
    edges: [
      { from: "client", to: "cdn" },
      { from: "cdn", to: "storage" },
      { from: "client", to: "limiter" },
      { from: "limiter", to: "lb" },
      { from: "lb", to: "app" },
      { from: "app", to: "cache" },
      { from: "app", to: "db" },
      { from: "app", to: "replica" },
      { from: "db", to: "replica" },
      { from: "app", to: "queue" },
      { from: "queue", to: "worker" },
      { from: "worker", to: "db" },
      { from: "app", to: "monitor" },
    ],
  },
};