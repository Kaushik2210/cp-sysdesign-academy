"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { Language } from "@/lib/runner/types";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div role="status" className="flex h-full items-center justify-center text-sm text-muted-fg">
      Loading editor…
    </div>
  ),
});

const MONACO_LANG: Record<Language, string> = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
  java: "java",
};

export function CodeEditor({
  language,
  value,
  onChange,
  height = 260,
  readOnly = false,
}: {
  language: Language;
  value: string;
  onChange: (v: string) => void;
  height?: number;
  readOnly?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <div
      className="overflow-hidden rounded-md border border-border"
      style={{ height }}
      aria-label={`${language} code editor`}
    >
      <Monaco
        language={MONACO_LANG[language]}
        value={value}
        theme={resolvedTheme === "light" ? "vs" : "vs-dark"}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          readOnly,
          tabSize: 4,
          automaticLayout: true,
          ariaLabel: `${language} code editor`,
        }}
      />
    </div>
  );
}
