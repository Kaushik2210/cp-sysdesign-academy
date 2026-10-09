"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface FlowNodeSpec {
  id: string;
  label: string;
  x: number;
  y: number;
  /** What the component is responsible for. */
  role: string;
  failureModes?: string[];
  tradeoffs?: string[];
}
export interface FlowEdgeSpec {
  from: string;
  to: string;
  label?: string;
}

function MermaidDiagram({ code }: { code: string }) {
  const { resolvedTheme } = useTheme();
  const rawId = useId();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "light" ? "default" : "dark",
        });
        const { svg } = await mermaid.render(`m${rawId.replace(/:/g, "")}`, code);
        if (!cancelled) {
          setSvg(svg);
          setError("");
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, resolvedTheme, rawId]);

  if (error)
    return (
      <pre role="alert" className="overflow-auto rounded border border-red-500 p-2 text-xs">
        Diagram failed to render.{"\n"}
        {code}
      </pre>
    );
  return <div role="img" aria-label="Diagram" className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function FlowDiagram({ nodes, edges, height = 360 }: { nodes: FlowNodeSpec[]; edges: FlowEdgeSpec[]; height?: number }) {
  const { resolvedTheme } = useTheme();
  const [selected, setSelected] = useState<string>();
  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: { x: n.x, y: n.y },
        data: { label: n.label },
        draggable: false,
        style: { fontSize: 13, padding: 8, borderRadius: 8, minWidth: 90 },
      })),
    [nodes],
  );
  const rfEdges: Edge[] = useMemo(
    () => edges.map((e, i) => ({ id: `e${i}`, source: e.from, target: e.to, label: e.label, animated: false })),
    [edges],
  );
  const sel = nodes.find((n) => n.id === selected);

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
      <div style={{ height }} className="overflow-hidden rounded border border-border">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          fitView
          colorMode={resolvedTheme === "light" ? "light" : "dark"}
          nodesConnectable={false}
          onNodeClick={(_, n) => setSelected(n.id)}
          aria-label="Interactive architecture diagram. Click a component for details."
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <aside aria-live="polite" className="rounded border border-border p-3 text-sm">
        {sel ? (
          <>
            <h4 className="font-semibold">{sel.label}</h4>
            <p className="mt-1">{sel.role}</p>
            {sel.failureModes && (
              <>
                <p className="mt-2 font-medium">Failure modes</p>
                <ul className="list-disc pl-5">{sel.failureModes.map((f) => <li key={f}>{f}</li>)}</ul>
              </>
            )}
            {sel.tradeoffs && (
              <>
                <p className="mt-2 font-medium">Trade-offs</p>
                <ul className="list-disc pl-5">{sel.tradeoffs.map((f) => <li key={f}>{f}</li>)}</ul>
              </>
            )}
          </>
        ) : (
          <p className="text-muted-fg">Click a component to see its role, failure modes and trade-offs.</p>
        )}
      </aside>
    </div>
  );
}

type DiagramProps =
  | { kind: "mermaid"; code: string; caption?: string }
  | { kind: "flow"; nodes: FlowNodeSpec[]; edges: FlowEdgeSpec[]; height?: number; caption?: string };

export function Diagram(props: DiagramProps) {
  return (
    <figure className="not-prose my-6 rounded-xl border border-border bg-card p-3">
      {props.kind === "mermaid" ? <MermaidDiagram code={props.code} /> : <FlowDiagram {...props} />}
      {props.caption && <figcaption className="mt-2 text-center text-xs text-muted-fg">{props.caption}</figcaption>}
    </figure>
  );
}
