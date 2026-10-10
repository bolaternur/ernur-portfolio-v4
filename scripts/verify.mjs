import { readFile, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import assert from "node:assert/strict";
const routes = [
  "index.html",
  "404.html",
  "work/index.html",
  "work/tracelab/index.html",
  "work/decode/index.html",
  "work/3209/index.html",
  "work/fusion360/index.html",
  "work/web/index.html",
  "about/index.html",
  "lab/index.html",
  "contact/index.html",
];
let checked = 0;
for (const route of routes) {
  const html = await readFile(route, "utf8");
  assert.equal(
    (html.match(/<h1\b/g) || []).length,
    1,
    `${route}: exactly one h1`,
  );
  assert.match(
    html,
    /<main\b[^>]*id="main"/,
    `${route}: skip navigation target`,
  );
  assert.match(html, /name="description"/, `${route}: description`);
  assert.doesNotMatch(
    html,
    /(?:src|href)="[^"]*(?:v5|award|motion-v2|preloader-v2)\./,
    `${route}: no old blocking runtime`,
  );
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const localValue = value.startsWith("/ernur-portfolio-v4/")
      ? `.${value.slice("/ernur-portfolio-v4".length)}`
      : value;
    let target = resolve(dirname(route), decodeURIComponent(localValue));
    let info;
    try {
      info = await stat(target);
    } catch {
      assert.fail(`${route}: missing local link ${value}`);
    }
    if (info.isDirectory()) {
      target = resolve(target, "index.html");
      await stat(target);
    }
    checked++;
  }
}
for (const key of ["robot", "study", "assembly", "kicker"]) {
  const model = await readFile(`assets/models/optimized/${key}.glb`);
  assert.equal(
    model.toString("ascii", 0, 4),
    "glTF",
    `${key}: valid GLB header`,
  );
  assert.equal(model.readUInt32LE(4), 2, `${key}: GLB v2`);
  assert.equal(model.readUInt32LE(8), model.length, `${key}: complete GLB`);
}
const runtime = await readFile("model-viewer.js", "utf8");
assert.match(
  runtime,
  /data-load-model/,
  "3D enhancement has explicit loading control",
);
console.log(
  `Verified ${routes.length} pages, ${checked} local references and all 4 production GLBs.`,
);
