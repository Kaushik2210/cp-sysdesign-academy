import { z } from "zod";
import { ConceptWalkthroughPlayer } from "./ConceptWalkthroughPlayer";

const label = z.string().trim().min(1);
const edge = z.object({ from: label, to: label });
const walkthroughSchema = z.object({
  title: label,
  nodes: z.array(z.object({
    id: label,
    label,
    x: z.number().min(8).max(92),
    y: z.number().min(15).max(85),
  })).min(1).max(12),
  edges: z.array(edge).default([]),
  frames: z.array(z.object({
    title: label,
    note: label,
    active: z.array(label),
    values: z.record(label, label).optional(),
    edges: z.array(edge).optional(),
  })).min(2).max(12),
}).superRefine(({ nodes, edges, frames }, ctx) => {
  const ids = new Set(nodes.map((node) => node.id));
  if (ids.size !== nodes.length) ctx.addIssue({ code: "custom", message: "Node IDs must be unique" });
  const checkIds = (references: string[], path: (string | number)[]) => {
    for (const id of new Set(references)) {
      if (!ids.has(id)) ctx.addIssue({ code: "custom", path, message: `Unknown walkthrough node "${id}"` });
    }
  };
  checkIds(edges.flatMap(({ from, to }) => [from, to]), ["edges"]);
  frames.forEach((frame, index) => {
    checkIds(frame.active, ["frames", index, "active"]);
    checkIds(Object.keys(frame.values ?? {}), ["frames", index, "values"]);
    checkIds((frame.edges ?? []).flatMap(({ from, to }) => [from, to]), ["frames", index, "edges"]);
  });
});

export type Walkthrough = z.output<typeof walkthroughSchema>;

export function ConceptWalkthrough(props: z.input<typeof walkthroughSchema>) {
  return <ConceptWalkthroughPlayer {...walkthroughSchema.parse(props)} />;
}
