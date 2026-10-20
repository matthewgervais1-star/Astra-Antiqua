/**
 * Checks the script reveal (docs/superpowers/specs/2026-10-20-script-reveal.md)
 * in headless Chrome over the DevTools protocol, no npm dependency, the way
 * scripts/screenshot.mjs captures pages.
 *
 *   cd web && node scripts/check-script-reveal.mjs <base-url> [--out DIR] [--chrome PATH]
 *
 * For each /voices/<culture> page at 1280x800 and 375x740 it checks:
 *   - the server HTML carries every name's Latin form as text, and no script
 *     text outside the data-script attribute;
 *   - the page makes one IntersectionObserver for the band however many names it sets;
 *   - with the pantheon list below the band, in it, and scrolled past it, each
 *     name reads data-reveal="latin" exactly when its box overlaps the 30%-70% band;
 *   - no name's box moves or changes size between those three states;
 *   - the page never scrolls sideways;
 *   - under prefers-reduced-motion: reduce no name swaps and no script layer shows.
 * With --out it saves the script and resolved states per culture as PNGs.
 * The dev server must already be running. Exits 1 on any failure.
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
const CULTURES = ["egypt", "greece", "canaan", "carthage", "rome"];
const VIEWPORTS = [
  { width: 1280, height: 800, cultures: CULTURES },
  { width: 375, height: 740, cultures: CULTURES },
];

// Counts the observers the page builds with the band's rootMargin.
const COUNT_OBSERVERS = `(() => {
  const Native = window.IntersectionObserver;
  window.__bandObservers = 0;
  window.IntersectionObserver = class extends Native {
    constructor(cb, opts) {
      super(cb, opts);
      if (opts && opts.rootMargin === "-30% 0px -30% 0px") window.__bandObservers += 1;
    }
  };
})();`;

const SEED_ONBOARDED = `localStorage.setItem("astra-antiqua.onboarded", "1"); "seeded"`;

// Every name box, in document coordinates, with its state and whether it overlaps the band.
const PROBE = `(() => {
  const h = window.innerHeight;
  const names = [...document.querySelectorAll(".script-name")].map((el) => {
    const r = el.getBoundingClientRect();
    const script = el.querySelector(".script-name__script");
    return {
      text: el.textContent,
      top: Math.round((r.top + window.scrollY) * 10) / 10,
      left: Math.round(r.left * 10) / 10,
      width: Math.round(r.width * 10) / 10,
      height: Math.round(r.height * 10) / 10,
      visible: r.width > 0 && r.height > 0,
      inBand: r.bottom > h * 0.3 && r.top < h * 0.7,
      reveal: el.dataset.reveal ?? null,
      layerShown: script ? getComputedStyle(script).display !== "none" : false,
    };
  });
  return {
    names,
    observers: window.__bandObservers,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
})()`;

// The scroll that puts the pantheon list's first name at fraction f of the viewport height.
const listScroll = (f) => `(() => {
  const list = [...document.querySelectorAll("main .script-name")].slice(2);
  const first = list[0];
  if (!first) return null;
  const y = first.getBoundingClientRect().top + window.scrollY - window.innerHeight * ${f};
  window.scrollTo(0, Math.max(0, y));
  return window.scrollY;
})()`;

function parseArgs(argv) {
  const opts = { base: null, out: null, chrome: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out") opts.out = argv[++i];
    else if (argv[i] === "--chrome") opts.chrome = argv[++i];
    else opts.base = argv[i];
  }
  if (!opts.base) {
    console.error("usage: node scripts/check-script-reveal.mjs <base-url> [--out DIR] [--chrome PATH]");
    process.exit(1);
  }
  return opts;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  throw new Error(`check-script-reveal: could not reach ${url}`);
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
        if (msg.error) reject(new Error(msg.error.message));
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
  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(`evaluate failed: ${res.exceptionDetails.text}`);
    return res.result?.value;
  }
}

async function navigate(cdp, url) {
  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await loaded;
  await cdp.evaluate("document.fonts.ready.then(() => true)");
}

const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.error(`FAIL ${msg}`);
};

/** Each visible name reads Latin exactly when it overlaps the band. */
function checkStates(label, probe) {
  let script = 0;
  let latin = 0;
  for (const n of probe.names) {
    if (!n.visible) continue;
    const want = n.inBand ? "latin" : "script";
    if (n.reveal !== want) fail(`${label}: "${n.text}" reads ${n.reveal}, expected ${want}`);
    if (n.reveal === "script") script += 1;
    if (n.reveal === "latin") latin += 1;
  }
  if (probe.scrollWidth > probe.innerWidth) fail(`${label}: horizontal scroll (${probe.scrollWidth} > ${probe.innerWidth})`);
  return { script, latin };
}

/** No name box moves or resizes between two probes. */
function checkStill(label, a, b) {
  if (a.names.length !== b.names.length) {
    fail(`${label}: name count changed ${a.names.length} -> ${b.names.length}`);
    return;
  }
  a.names.forEach((n, i) => {
    const m = b.names[i];
    for (const k of ["top", "left", "width", "height"]) {
      if (Math.abs(n[k] - m[k]) > 0.5) fail(`${label}: "${n.text}" ${k} moved ${n[k]} -> ${m[k]}`);
    }
  });
}

async function shoot(cdp, out, file) {
  if (!out) return;
  const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, file), Buffer.from(shot.data, "base64"));
  console.log(`  wrote ${path.join(out, file)}`);
}

/** The server render: Latin names as text, script only inside data-script. */
async function checkServerHtml(base, culture) {
  const html = await (await fetch(new URL(`/voices/${culture}`, base))).text();
  const latin = [...html.matchAll(/class="script-name__latin">([^<]*)</g)].map((m) => m[1]);
  if (latin.length === 0) fail(`${culture} server html: no script-name__latin text`);
  // The script layer is an empty span; its glyphs live only in data-script.
  const layers = [...html.matchAll(/<span class="script-name__script"[^>]*>([^<]*)<\/span>/g)];
  if (layers.length !== latin.length) fail(`${culture} server html: ${layers.length} script layers for ${latin.length} names`);
  for (const [, inner] of layers) {
    if (inner !== "") fail(`${culture} server html: script layer carries text "${inner}"`);
  }
  return latin.length;
}

const args = parseArgs(process.argv.slice(2));
const chrome = (args.chrome ? [args.chrome] : CHROME_CANDIDATES).find((p) => fs.existsSync(p));
if (!chrome) throw new Error("check-script-reveal: no Chromium binary found");
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "astra-reveal-"));
const port = 9222 + Math.floor(Math.random() * 1000);
const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("check-script-reveal: Chrome exposed no page target");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", () => reject(new Error("check-script-reveal: websocket failed")));
  });
  const cdp = new Cdp(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: COUNT_OBSERVERS });

  await navigate(cdp, new URL("/", args.base).toString());
  if ((await cdp.evaluate(SEED_ONBOARDED)) !== "seeded") throw new Error("seeding localStorage failed");

  for (const culture of CULTURES) {
    const n = await checkServerHtml(args.base, culture);
    console.log(`${culture} server html: ${n} Latin names as text`);
  }

  for (const vp of VIEWPORTS) {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 600 });
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    for (const culture of vp.cultures) {
      const label = `${culture} @${vp.width}`;
      await navigate(cdp, new URL(`/voices/${culture}`, args.base).toString());
      await sleep(1500);

      if ((await cdp.evaluate(listScroll(0.85))) === null) {
        fail(`${label}: no pantheon list names found`);
        continue;
      }
      await sleep(900);
      const below = await cdp.evaluate(PROBE);
      const s1 = checkStates(`${label} list below the band`, below);
      if (below.observers !== 1) fail(`${label}: ${below.observers} band observers for ${below.names.length} names`);
      await shoot(cdp, args.out, `${culture}-${vp.width}-script.png`);

      await cdp.evaluate(listScroll(0.32));
      await sleep(900);
      const inBand = await cdp.evaluate(PROBE);
      const s2 = checkStates(`${label} list in the band`, inBand);
      await shoot(cdp, args.out, `${culture}-${vp.width}-resolved.png`);

      await cdp.evaluate(listScroll(-0.6));
      await sleep(900);
      const past = await cdp.evaluate(PROBE);
      const s3 = checkStates(`${label} list scrolled past`, past);

      checkStill(`${label} below -> band`, below, inBand);
      checkStill(`${label} band -> past`, inBand, past);
      console.log(
        `${label}: ${below.names.length} names, ${below.observers} observer; script/latin below ${s1.script}/${s1.latin}, in band ${s2.script}/${s2.latin}, past ${s3.script}/${s3.latin}; scrollWidth ${past.scrollWidth}/${past.innerWidth}`,
      );
    }

    // Reduced motion: Latin only, no swap, no layer.
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await navigate(cdp, new URL("/voices/egypt", args.base).toString());
    await sleep(1500);
    await cdp.evaluate(listScroll(0.85));
    await sleep(900);
    const reduced = await cdp.evaluate(PROBE);
    const swapped = reduced.names.filter((n) => n.reveal !== null).length;
    const layers = reduced.names.filter((n) => n.layerShown).length;
    if (swapped > 0) fail(`egypt @${vp.width} reduced motion: ${swapped} names carry data-reveal`);
    if (layers > 0) fail(`egypt @${vp.width} reduced motion: ${layers} script layers shown`);
    console.log(`egypt @${vp.width} reduced motion: ${reduced.names.length} names, ${swapped} swapped, ${layers} layers shown`);
  }
  ws.close();
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
} finally {
  proc.kill();
  await sleep(300);
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch {
    console.error("check-script-reveal: could not remove the temp profile; delete it by hand");
  }
}
console.log(failures.length === 0 ? "check-script-reveal: all checks pass" : `check-script-reveal: ${failures.length} failures`);
process.exit(failures.length === 0 ? 0 : 1);
