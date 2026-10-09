"use client";

import dynamic from "next/dynamic";

const Loading = ({ label }: { label: string }) => (
  <div role="status" className="my-6 rounded-xl border border-border p-6 text-sm text-muted-fg">
    Loading {label}…
  </div>
);

/** Heavy interactive widgets are code-split and only loaded in the browser. */
export const CodeRunner = dynamic(() => import("@/components/runner/CodeRunner").then((m) => m.CodeRunner), {
  ssr: false,
  loading: () => <Loading label="code runner" />,
});
export const Visualizer = dynamic(() => import("@/components/visualizer/Visualizer").then((m) => m.Visualizer), {
  ssr: false,
  loading: () => <Loading label="visualizer" />,
});
export const Diagram = dynamic(() => import("@/components/diagram/Diagram").then((m) => m.Diagram), {
  ssr: false,
  loading: () => <Loading label="diagram" />,
});
