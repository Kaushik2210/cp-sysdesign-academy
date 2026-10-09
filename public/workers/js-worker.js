/* Sandboxed JavaScript runner. Workers have no DOM; we also remove network APIs. */
self.onmessage = (e) => {
  const { id, code, stdin } = e.data;
  const out = [];
  const err = [];
  const lines = String(stdin).split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  let cursor = 0;
  const fmt = (args) =>
    args.map((a) => (typeof a === "string" ? a : JSON.stringify(a) ?? String(a))).join(" ");
  const sandboxConsole = {
    log: (...a) => out.push(fmt(a)),
    error: (...a) => err.push(fmt(a)),
    warn: (...a) => err.push(fmt(a)),
  };
  // Remove network / import surfaces for the user's code.
  const blocked = ["fetch", "XMLHttpRequest", "WebSocket", "importScripts", "indexedDB"];
  for (const name of blocked) {
    try {
      self[name] = undefined;
    } catch {
      /* ignore */
    }
  }
  const readLine = () => (cursor < lines.length ? lines[cursor++] : null);
  const start = performance.now();
  let status = "ok";
  try {
    const fn = new Function("console", "readLine", "input", "stdin", `"use strict";\n${code}`);
    fn(sandboxConsole, readLine, readLine, stdin);
  } catch (ex) {
    status = "error";
    err.push(ex && ex.stack ? String(ex.stack).split("\n").slice(0, 3).join("\n") : String(ex));
  }
  self.postMessage({
    id,
    status,
    stdout: out.join("\n") + (out.length ? "\n" : ""),
    stderr: err.join("\n"),
    timeMs: Math.round(performance.now() - start),
  });
};
