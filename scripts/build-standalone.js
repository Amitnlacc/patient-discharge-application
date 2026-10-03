/* Builds a single self-contained HTML file with React, Tailwind and the app
   inlined — no internet, no build tools, no CDN. For demoing on a phone or
   handing to someone who just wants to open a file.

   Run: npm run bundle:standalone   →   dist-standalone/discharge-records.html

   Two things this deliberately avoids, both of which produce a blank page:
   - Babel's automatic JSX runtime, which emits bare module imports that a
     plain file:// page cannot resolve. esbuild's classic transform is used.
   - CDN <script> tags, which many Android file viewers block outright. */

import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmp = resolve(root, ".standalone-tmp");
const out = resolve(root, "dist-standalone");

mkdirSync(tmp, { recursive: true });
mkdirSync(out, { recursive: true });

// 1. Bundle the app to a single IIFE with React included.
await build({
  entryPoints: [resolve(root, "src/main.jsx")],
  bundle: true,
  minify: true,
  format: "iife",
  jsx: "transform",
  loader: { ".js": "jsx", ".css": "empty" },
  outfile: resolve(tmp, "bundle.js"),
});

// 2. Generate the Tailwind stylesheet for the classes actually used.
execFileSync(
  "npx",
  ["tailwindcss", "-c", resolve(root, "tailwind.config.js"),
   "-i", resolve(root, "src/index.css"), "-o", resolve(tmp, "tw.css"), "--minify"],
  { cwd: root, stdio: "inherit" }
);

// 3. Inline both into one file, with an on-page error handler so a failure
//    shows a readable message instead of a white screen.
const css = readFileSync(resolve(tmp, "tw.css"), "utf8");
const js = readFileSync(resolve(tmp, "bundle.js"), "utf8");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#EE0000">
<title>Discharge Records</title>
<style>${css}</style>
<style>
#boot{font:15px system-ui;padding:24px;color:#334155}
#err{display:none;font:13px ui-monospace,monospace;white-space:pre-wrap;padding:16px;margin:16px;
border:1px solid #fca5a5;background:#fef2f2;color:#991b1b;border-radius:8px}
</style>
</head>
<body>
<div id="root"><div id="boot">Loading…</div></div>
<pre id="err"></pre>
<script>
window.onerror=function(m,s,l,c,e){var d=document.getElementById('err');
d.style.display='block';d.textContent='Error: '+m+'\\nLine '+l+'\\n'+(e&&e.stack?e.stack:'');
var b=document.getElementById('boot'); if(b) b.textContent='';};
</script>
<script>${js}</script>
</body>
</html>
`;

writeFileSync(resolve(out, "discharge-records.html"), html);
rmSync(tmp, { recursive: true, force: true });

console.log(`\nWrote dist-standalone/discharge-records.html (${Math.round(html.length / 1024)} KB)`);
