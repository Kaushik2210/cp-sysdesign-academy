import type { Language, RunOptions, RunResult, Runner } from "./types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const DEFAULT_TIMEOUT_MS = 5000;
/** First Pyodide run downloads the runtime; don't count that against the user's time limit. */
const PYODIDE_LOAD_ALLOWANCE_MS = 45_000;

const WORKER_FILE: Partial<Record<Language, string>> = {
  javascript: "js-worker.js",
  python: "py-worker.js",
};

interface Pending {
  resolve: (r: RunResult) => void;
  timer: ReturnType<typeof setTimeout>;
}

/** Persistent worker per language. A timeout terminates the worker and a new one is made on demand. */
class BrowserRunner implements Runner {
  readonly languages: Language[] = ["python", "javascript"];
  private workers = new Map<Language, Worker>();
  private warmed = new Set<Language>();
  private pending = new Map<number, Pending>();
  private nextId = 1;

  private getWorker(lang: Language): Worker {
    let w = this.workers.get(lang);
    if (!w) {
      w = new Worker(`${BASE}/workers/${WORKER_FILE[lang]}`);
      w.onmessage = (e: MessageEvent<RunResult & { id: number }>) => {
        const p = this.pending.get(e.data.id);
        if (!p) return;
        clearTimeout(p.timer);
        this.pending.delete(e.data.id);
        this.warmed.add(lang);
        const { id: _id, ...result } = e.data;
        void _id;
        p.resolve(result);
      };
      this.workers.set(lang, w);
    }
    return w;
  }

  run(language: Language, code: string, stdin: string, opts: RunOptions = {}): Promise<RunResult> {
    if (!WORKER_FILE[language]) {
      return Promise.resolve({
        status: "unsupported",
        stdout: "",
        stderr: `${language} is not runnable in the browser.`,
        timeMs: 0,
      });
    }
    const worker = this.getWorker(language);
    const id = this.nextId++;
    const base = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const limit =
      language === "python" && !this.warmed.has(language) ? base + PYODIDE_LOAD_ALLOWANCE_MS : base;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        worker.terminate();
        this.workers.delete(language);
        this.warmed.delete(language);
        resolve({
          status: "timeout",
          stdout: "",
          stderr: `Time limit exceeded (${base} ms)`,
          timeMs: base,
        });
      }, limit);
      this.pending.set(id, { resolve, timer });
      worker.postMessage({ id, code, stdin });
    });
  }
}

const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL;
const JUDGE0_IDS: Partial<Record<Language, number>> = { cpp: 54, java: 62 };

/** Optional runner for compiled languages. Enabled by setting NEXT_PUBLIC_JUDGE0_URL at build time. */
class Judge0Runner implements Runner {
  readonly languages: Language[] = ["cpp", "java"];

  async run(language: Language, code: string, stdin: string): Promise<RunResult> {
    const languageId = JUDGE0_IDS[language];
    if (!JUDGE0_URL || !languageId) {
      return {
        status: "unsupported",
        stdout: "",
        stderr:
          "C++ and Java need an external runner. Set NEXT_PUBLIC_JUDGE0_URL (see README) or copy the code to your local compiler.",
        timeMs: 0,
      };
    }
    try {
      const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin }),
      });
      const j = (await res.json()) as {
        stdout: string | null;
        stderr: string | null;
        compile_output: string | null;
        time: string | null;
        memory: number | null;
        status: { id: number };
      };
      const ok = j.status.id === 3;
      return {
        status: ok ? "ok" : j.status.id === 5 ? "timeout" : "error",
        stdout: j.stdout ?? "",
        stderr: (j.stderr ?? "") + (j.compile_output ?? ""),
        timeMs: Math.round(parseFloat(j.time ?? "0") * 1000),
        memoryKb: j.memory ?? undefined,
      };
    } catch (e) {
      return { status: "error", stdout: "", stderr: `Runner request failed: ${String(e)}`, timeMs: 0 };
    }
  }
}

let browser: BrowserRunner | undefined;
let remote: Judge0Runner | undefined;

export function isRunnable(language: Language): boolean {
  return language === "python" || language === "javascript" || !!JUDGE0_URL;
}

export function runCode(
  language: Language,
  code: string,
  stdin: string,
  opts?: RunOptions,
): Promise<RunResult> {
  if (language === "python" || language === "javascript") {
    browser ??= new BrowserRunner();
    return browser.run(language, code, stdin, opts);
  }
  remote ??= new Judge0Runner();
  return remote.run(language, code, stdin);
}
