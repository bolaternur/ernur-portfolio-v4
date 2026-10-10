import { cp, mkdir, rm, stat, readdir } from "node:fs/promises";
import { resolve, sep } from "node:path";
const root = resolve(".");
const out = resolve(root, "dist");
if (!out.startsWith(root + sep) || out === root)
  throw new Error("Unsafe output path");
await mkdir(out, { recursive: true });
for (const name of await readdir(out)) {
  const target = resolve(out, name);
  if (!target.startsWith(out + sep)) throw new Error("Unsafe output entry");
  await rm(target, { recursive: true, force: true, maxRetries: 3 });
}
for (const path of [
  "index.html",
  "404.html",
  "portfolio.css",
  "portfolio.js",
  "inner.css",
  "model-viewer.js",
  "about",
  "work",
  "lab",
  "contact",
  "public",
  "assets/vendor",
  "assets/models/optimized",
]) {
  await stat(path);
  await cp(path, resolve(out, path), {
    recursive: true,
    filter: (source) => !source.endsWith(".png"),
  });
}
const { writeFile } = await import("node:fs/promises");
await writeFile(resolve(out, ".nojekyll"), "");
console.log("Production site built in dist/ (optimized assets only).");
