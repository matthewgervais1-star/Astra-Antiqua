/**
 * Serves docs/design/system/ over HTTP so the design-system cards can be
 * reviewed in a browser exactly as the design project will render them:
 * each card links ../styles.css and the traced masks by relative URL, which
 * file:// handling in embedded browsers tends to break.
 *
 *   node scripts/serve-design-system.mjs        -> http://localhost:8731/guidelines/
 */
import { createServer } from "node:http";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "docs", "design", "system");
const PORT = Number(process.env.PORT ?? 8731);
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".md": "text/markdown; charset=utf-8", ".js": "text/javascript",
};

createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const target = path.normalize(path.join(ROOT, urlPath));
  if (!target.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    const s = await stat(target);
    if (s.isDirectory()) {
      const entries = await readdir(target);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(`<!doctype html><meta charset="utf-8"><body style="background:#171310;color:#e6decc;font:14px ui-monospace,monospace;padding:24px">
<h1 style="font-size:12px;letter-spacing:.18em;color:#9a917d">${urlPath}</h1><ul>${entries.map((e) => `<li><a style="color:#e6decc" href="${path.posix.join(urlPath, e)}">${e}</a></li>`).join("")}</ul>`);
    }
    res.writeHead(200, { "content-type": MIME[path.extname(target)] ?? "application/octet-stream" });
    res.end(await readFile(target));
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(PORT, () => console.log(`design system at http://localhost:${PORT}/guidelines/`));
