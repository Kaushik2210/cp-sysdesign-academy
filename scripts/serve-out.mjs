/* Tiny static server for the exported site (out/), used by Playwright. Usage: node scripts/serve-out.mjs [port]
 * Honours NEXT_PUBLIC_BASE_PATH so a GitHub Pages build can be tested exactly as CI builds it. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "out");
const port = Number(process.argv[2] ?? 4173);
// When the site is built for GitHub Pages (NEXT_PUBLIC_BASE_PATH=/repo) every URL carries that prefix; strip it.
const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain", ".woff2": "font/woff2" };

http
  .createServer((req, res) => {
    let p = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (base && (p === base || p.startsWith(base + "/"))) p = p.slice(base.length) || "/";
    let file = path.join(root, p);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end(fs.existsSync(path.join(root, "404.html")) ? fs.readFileSync(path.join(root, "404.html")) : "Not found");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () => console.log(`serving out/ on http://127.0.0.1:${port}`));