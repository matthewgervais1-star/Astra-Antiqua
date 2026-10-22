/**
 * Captures a page of the running web app to a PNG with headless Chrome over
 * the DevTools protocol, no npm dependency. Used for the design-system
 * rollout's exit-condition screenshots (docs/design/IMPLEMENTATION.md).
 *
 *   cd web && node scripts/screenshot.mjs <url> <out.png> [options]
 *
 * Options:
 *   --width N --height N   viewport in CSS px (default 1440 x 900)
 *   --scale N              device scale factor (default 2, so 16px glyphs can be inspected)
 *   --wait MS              settle time after load for client effects (default 2500)
 *   --full                 capture the whole scrollable page, not only the viewport
 *   --clip X,Y,W,H         capture one rectangle, in CSS px
 *   --seed-chart           first seed localStorage on the app origin with the onboarding
 *                          flag and one saved chart, so /charts and /transits render
 *   --seed-onboarded       seed the onboarding flag alone, for a reader with no chart
 *   --report-scroll        after load, print document scrollWidth against the viewport
 *                          width, to check a narrow capture for horizontal scroll
 *   --chrome PATH          Chromium binary (default: Google Chrome, then Edge)
 *
 * The dev server must already be running (npm run dev). Exits 1 on any failure.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];

// One chart under the key savedCharts.ts reads (astra-antiqua.chart.v3), plus
// the flag onboarding.ts sets when /welcome mounts, so AuthGate lets a seeded
// capture through to the route it asked for.
const SEED = `
  localStorage.setItem("astra-antiqua.onboarded", "1");
  localStorage.setItem("astra-antiqua.chart.v3", JSON.stringify({
    id: "seed-verify", name: "Verification",
    date: "1990-06-15", time: "14:30", cityLabel: "Rome, Italy",
    latitude: 41.9028, longitude: 12.4964,
    createdAt: "2026-09-09T00:00:00.000Z",
  }));
  "seeded"`;

const SEED_ONBOARDED = `localStorage.setItem("astra-antiqua.onboarded", "1"); "seeded"`;

const SCROLL_PROBE = `({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth })`;

function parseArgs(argv) {
  const opts = { width: 1440, height: 900, scale: 2, wait: 2500, full: false, clip: null, seed: false, seedOnboarded: false, reportScroll: false, chrome: null };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--width") opts.width = Number(argv[++i]);
    else if (a === "--height") opts.height = Number(argv[++i]);
    else if (a === "--scale") opts.scale = Number(argv[++i]);
    else if (a === "--wait") opts.wait = Number(argv[++i]);
    else if (a === "--full") opts.full = true;
    else if (a === "--seed-chart") opts.seed = true;
    else if (a === "--seed-onboarded") opts.seedOnboarded = true;
    else if (a === "--report-scroll") opts.reportScroll = true;
    else if (a === "--chrome") opts.chrome = argv[++i];
    else if (a === "--clip") {
      const [x, y, width, height] = argv[++i].split(",").map(Number);
      opts.clip = { x, y, width, height, scale: 1 };
    } else positional.push(a);
  }
  if (positional.length !== 2) {
    console.error("usage: node scripts/screenshot.mjs <url> <out.png> [--width N] [--height N] [--scale N] [--wait MS] [--full] [--clip X,Y,W,H] [--seed-chart] [--seed-onboarded] [--report-scroll]");
    process.exit(1);
  }
  return { url: positional[0], out: positional[1], ...opts };
}

function findChrome(explicit) {
  const list = explicit ? [explicit] : CHROME_CANDIDATES;
  const found = list.find((p) => fs.existsSync(p));
  if (!found) throw new Error(`screenshot: no Chromium binary found in ${list.join(", ")}`);
  return found;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, attempts = 50) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error(`screenshot: could not reach ${url}`);
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.next = 1;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method && this.listeners.has(msg.method)) {
        for (const fn of this.listeners.get(msg.method)) fn(msg.params);
      }
    });
  }
  send(method, params = {}) {
    const id = this.next++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  once(method) {
    return new Promise((resolve) => {
      const fn = (params) => {
        this.listeners.get(method).delete(fn);
        resolve(params);
      };
      if (!this.listeners.has(method)) this.listeners.set(method, new Set());
      this.listeners.get(method).add(fn);
    });
  }
}

async function navigate(cdp, url) {
  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded;
}

const args = parseArgs(process.argv.slice(2));
const chrome = findChrome(args.chrome);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "astra-shot-"));
const port = 9222 + Math.floor(Math.random() * 1000);
const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${args.width},${args.height}`,
    "--hide-scrollbars",
    "--disable-lcd-text",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let exitCode = 0;
try {
  const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("screenshot: Chrome exposed no page target");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", () => reject(new Error("screenshot: websocket failed")));
  });
  const cdp = new Cdp(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: args.width,
    height: args.height,
    deviceScaleFactor: args.scale,
    mobile: false,
  });

  if (args.seed || args.seedOnboarded) {
    await navigate(cdp, new URL("/", args.url).toString());
    const expression = args.seed ? SEED : SEED_ONBOARDED;
    const seeded = await cdp.send("Runtime.evaluate", { expression, returnByValue: true });
    if (seeded.result?.value !== "seeded") throw new Error("screenshot: seeding localStorage failed");
  }

  await navigate(cdp, args.url);
  await sleep(args.wait);

  if (args.reportScroll) {
    const probe = await cdp.send("Runtime.evaluate", { expression: SCROLL_PROBE, returnByValue: true });
    const { scrollWidth, innerWidth } = probe.result?.value ?? {};
    const verdict = scrollWidth > innerWidth ? "HORIZONTAL SCROLL" : "no horizontal scroll";
    console.log(`screenshot: scrollWidth ${scrollWidth} innerWidth ${innerWidth} (${verdict})`);
  }

  const shot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: args.full,
    ...(args.clip ? { clip: args.clip } : {}),
  });
  fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
  fs.writeFileSync(args.out, Buffer.from(shot.data, "base64"));
  const bytes = fs.statSync(args.out).size;
  console.log(`screenshot: wrote ${args.out} (${bytes} bytes, ${args.width}x${args.height} @${args.scale}x${args.full ? ", full page" : ""}${args.clip ? ", clipped" : ""})`);
  ws.close();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  exitCode = 1;
} finally {
  proc.kill();
  await sleep(300);
  // Chrome can hold the profile for a moment after the kill; the capture is already on disk, so retry quietly.
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch {
    console.error(`screenshot: could not remove temp profile ; delete it by hand`);
  }
}
process.exit(exitCode);
