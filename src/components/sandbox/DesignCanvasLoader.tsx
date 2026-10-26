"use client";

import dynamic from "next/dynamic";

/** React Flow is heavy, so the canvas loads only in the browser, on this page. */
const DesignCanvas = dynamic(() => import("./DesignCanvas"), {
  ssr: false,
  loading: () => (
    <div role="status" className="mt-6 rounded-xl border border-border p-8 text-sm text-muted-fg">
      Loading the design canvas...
    </div>
  ),
});

export function DesignCanvasLoader() {
  return <DesignCanvas />;
}