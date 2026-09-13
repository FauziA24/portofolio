import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "apps/web/dist");
const port = Number(process.argv[3] ?? 4173);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

const server = http.createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const clean = path.normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(root, clean);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, "index.html");
  response.setHeader("content-type", types[path.extname(file)] ?? "application/octet-stream");
  response.setHeader("cache-control", file.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable");
  fs.createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static server listening on http://127.0.0.1:${port}`);
});
