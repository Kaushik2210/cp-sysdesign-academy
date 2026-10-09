export type Language = "python" | "javascript" | "cpp" | "java";

export const LANGUAGE_LABEL: Record<Language, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
};

export interface RunResult {
  status: "ok" | "error" | "timeout" | "unsupported";
  stdout: string;
  stderr: string;
  timeMs: number;
  /** Not measurable inside browser workers; only external runners (Judge0) report it. */
  memoryKb?: number;
}

export interface RunOptions {
  timeoutMs?: number;
}

export interface Runner {
  readonly languages: Language[];
  run(language: Language, code: string, stdin: string, opts?: RunOptions): Promise<RunResult>;
}
