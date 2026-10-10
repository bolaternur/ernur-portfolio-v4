import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve(process.argv[2] || ".");
const port = Number(process.env.PORT || 4178);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".glb": "model/gltf-binary",
  ".json": "application/json",
};
createServer(async (req, res) => {
  try {
    const incomingPath = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const pathname =
      incomingPath.replace(/^\/ernur-portfolio-v4(?=\/|$)/, "") || "/";
    let path = resolve(root, `.${pathname}`);
    if (
      !(path === root || path.startsWith(root + sep)) ||
      pathname.split("/").some((p) => p.startsWith("."))
    ) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(await readFile(resolve(root, "404.html")).catch(() => "Not found"));
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Portfolio preview: http://127.0.0.1:${port}`),
);
