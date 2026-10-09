/* Python runner on Pyodide (loaded lazily from the jsDelivr CDN on first use). */
const PYODIDE_VERSION = "0.27.2";
let pyodideReady = null;

function load() {
  if (!pyodideReady) {
    importScripts(`https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`);
    pyodideReady = self.loadPyodide({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
    });
  }
  return pyodideReady;
}

self.onmessage = async (e) => {
  const { id, code, stdin } = e.data;
  let pyodide;
  try {
    pyodide = await load();
  } catch (ex) {
    self.postMessage({
      id,
      status: "unsupported",
      stdout: "",
      stderr: "Could not load Pyodide (offline?): " + String(ex),
      timeMs: 0,
    });
    return;
  }
  const out = [];
  const err = [];
  // Raw byte reads: the line-based `stdin()` callback silently truncates lines longer than ~8 KB.
  const bytes = new TextEncoder().encode(String(stdin));
  let pos = 0;
  pyodide.setStdin({
    read(buffer) {
      const n = Math.min(buffer.length, bytes.length - pos);
      buffer.set(bytes.subarray(pos, pos + n));
      pos += n;
      return n;
    },
  });
  pyodide.setStdout({ batched: (s) => out.push(s) });
  pyodide.setStderr({ batched: (s) => err.push(s) });
  const start = performance.now();
  let status = "ok";
  try {
    const globals = pyodide.globals.get("dict")();
    pyodide.runPython(code, { globals });
    globals.destroy();
  } catch (ex) {
    status = "error";
    // Drop Pyodide-internal frames: keep from the first user frame ("<exec>") to the end.
    const msg = String(ex && ex.message ? ex.message : ex).trim().split("\n");
    const first = msg.findIndex((l) => l.includes('File "<exec>"'));
    err.push((first >= 0 ? msg.slice(first) : msg.slice(-3)).join("\n"));
  }
  self.postMessage({
    id,
    status,
    stdout: out.join("\n") + (out.length ? "\n" : ""),
    stderr: err.join("\n"),
    timeMs: Math.round(performance.now() - start),
  });
};
