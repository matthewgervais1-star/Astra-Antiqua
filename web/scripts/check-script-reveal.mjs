/**
 * Checks the script reveal (docs/superpowers/specs/2026-10-20-script-reveal.md)
 * in headless Chrome over the DevTools protocol, no npm dependency, the way
 * scripts/screenshot.mjs captures pages.
 *
 *   cd web && node scripts/check-script-reveal.mjs <base-url> [--out DIR] [--chrome PATH] [--viewport WxH ...]
 *
 * For each /voices/<culture> page at 1280x800, 390x844 and 375x740 it checks:
 *   - the server HTML carries every name's Latin form as text, and no script
 *     text outside the data-script attribute;
 *   - the page makes one IntersectionObserver for the band however many names it sets;
 *   - with the pantheon list below the band, in it, and scrolled past it, each
 *     name reads data-reveal="latin" exactly when its box overlaps the 30%-70% band;
 *   - no name's box moves or changes size between those three states;
 *   - the page never scrolls sideways;
 *   - under prefers-reduced-motion: reduce no name swaps and no script layer shows.
 * The large culture title (NaveHead's culture, the voices page headline, the
 * day page's head) is script until scrolled (owner, 2026-10-29): the check
 * reads the first paint at DOMContentLoaded (script, no Latin), the held state
 * after hydration (data-reveal="script", no fade ran), Latin while hovered and
 * script again after, the band's verdict once the page has scrolled one pixel,
 * script once the title has scrolled out of the band, and Latin with scripts
 * disabled (the layout's noscript style) and under reduced motion.
 * The five names of the culture picker (CultureSwitch on /welcome) carry
 * ScriptName's intro: the check pauses their animations at the start to see
 * the script, reads each delay (1200 ms, staggered by 200), plays them out to
 * Latin, hovers a picker row to resolve it early, and checks for sideways scroll.
 * With --out it saves the script and resolved states per culture as PNGs,
 * the title held, hovered and scrolled, and the picker in both states at each width.
 * --viewport (repeatable) limits the run to those sizes. The dev server must
 * already be running. Exits 1 on any failure.
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
  { width: 390, height: 844, cultures: CULTURES },
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
      intro: el.hasAttribute("data-intro"),
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

// Pause every intro animation at its start (the hold, script showing) or play them out.
const INTRO_PAUSE = `(() => {
  const els = [...document.querySelectorAll("[data-intro]")];
  for (const el of els) for (const a of el.getAnimations({ subtree: true })) { a.pause(); a.currentTime = 0; }
  return els.length;
})()`;
const INTRO_PLAY = `(() => {
  for (const el of document.querySelectorAll("[data-intro]")) for (const a of el.getAnimations({ subtree: true })) a.play();
  return true;
})()`;
// Each intro name: its delay, whether the intro is still running, and the two layers' opacity.
const INTRO_PROBE = `(() => [...document.querySelectorAll("[data-intro]")].map((el) => {
  const latin = el.querySelector(".script-name__latin");
  const script = el.querySelector(".script-name__script");
  const r = el.getBoundingClientRect();
  return {
    text: latin.textContent,
    delay: getComputedStyle(latin).animationDelay,
    running: el.classList.contains("script-name--intro"),
    latin: Number(getComputedStyle(latin).opacity),
    script: getComputedStyle(script).display === "none" ? 0 : Number(getComputedStyle(script).opacity),
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
  };
}))()`;
const SCROLL_WIDTH = `({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth })`;

// Each script-first title: its state, the two layers' opacity, any fade in flight, and its place against the band.
const TITLE_PROBE = `(() => [...document.querySelectorAll(".script-name--script-first")].map((el) => {
  const latin = el.querySelector(".script-name__latin");
  const script = el.querySelector(".script-name__script");
  const r = el.getBoundingClientRect();
  const h = window.innerHeight;
  return {
    text: latin.textContent,
    reveal: el.dataset.reveal ?? null,
    latin: Number(getComputedStyle(latin).opacity),
    script: getComputedStyle(script).display === "none" ? 0 : Number(getComputedStyle(script).opacity),
    fading: latin.getAnimations().length + script.getAnimations().length,
    inBand: r.bottom > h * 0.3 && r.top < h * 0.7,
    top: r.top + window.scrollY,
    bottom: r.bottom + window.scrollY,
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
  };
}))()`;
// The title as first painted: recorded at DOMContentLoaded, before hydration on a server-rendered page.
const RECORD_FIRST_PAINT = `document.addEventListener("DOMContentLoaded", () => {
  window.__titleFirstPaint = [...document.querySelectorAll(".script-name--script-first")].map((el) => {
    const latin = el.querySelector(".script-name__latin");
    const script = el.querySelector(".script-name__script");
    return {
      text: latin.textContent,
      hydrated: el.hasAttribute("data-reveal"),
      styled: getComputedStyle(el).display === "inline-grid",
      latin: Number(getComputedStyle(latin).opacity),
      script: getComputedStyle(script).display === "none" ? 0 : Number(getComputedStyle(script).opacity),
    };
  });
});`;

/**
 * The intro on one page: script while held, the expected delays, Latin and
 * the class gone once played out, no sideways scroll in either state.
 */
async function checkIntro(cdp, label, delays, out, prefix, hoverIndex = null) {
  // Client-computed pages (the day page) mount their head after load.
  for (let i = 0; i < 100; i += 1) {
    if ((await cdp.evaluate(`document.querySelectorAll("[data-intro]").length`)) >= delays.length) break;
    await sleep(100);
  }
  const count = await cdp.evaluate(INTRO_PAUSE);
  if (count !== delays.length) fail(`${label}: ${count} intro names, expected ${delays.length}`);
  // Let the band swaps of the other names finish their 400 ms fade before the capture.
  await sleep(600);
  const held = await cdp.evaluate(INTRO_PROBE);
  held.forEach((n, i) => {
    if (n.script < 0.99 || n.latin > 0.01) fail(`${label} held: "${n.text}" latin ${n.latin} script ${n.script}`);
    if (n.delay !== `${delays[i] / 1000}s`) fail(`${label}: "${n.text}" delay ${n.delay}, expected ${delays[i]}ms`);
  });
  const w1 = await cdp.evaluate(SCROLL_WIDTH);
  if (w1.scrollWidth > w1.innerWidth) fail(`${label} held: horizontal scroll (${w1.scrollWidth} > ${w1.innerWidth})`);
  await shoot(cdp, out, `${prefix}-script.png`);
  if (hoverIndex !== null && held[hoverIndex]) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: held[hoverIndex].x, y: held[hoverIndex].y });
    await sleep(150);
    const hovered = (await cdp.evaluate(INTRO_PROBE))[hoverIndex];
    if (hovered.running || hovered.latin < 0.99) fail(`${label}: hovering "${hovered.text}" did not resolve it`);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
  }
  await cdp.evaluate(INTRO_PLAY);
  await sleep(Math.max(0, ...delays) + 900);
  const done = await cdp.evaluate(INTRO_PROBE);
  for (const n of done) {
    if (n.running || n.latin < 0.99 || n.script > 0.01) fail(`${label} resolved: "${n.text}" running ${n.running} latin ${n.latin} script ${n.script}`);
  }
  const w2 = await cdp.evaluate(SCROLL_WIDTH);
  if (w2.scrollWidth > w2.innerWidth) fail(`${label} resolved: horizontal scroll (${w2.scrollWidth} > ${w2.innerWidth})`);
  await shoot(cdp, out, `${prefix}-resolved.png`);
  console.log(`${label}: ${held.length} intro names held in script, resolved to Latin; scrollWidth ${w2.scrollWidth}/${w2.innerWidth}`);
}

/**
 * The script-first title on one page: script at the first paint and held after
 * hydration with no fade, Latin while hovered, the band's verdict after the
 * first scroll, script once scrolled out of the band, no sideways scroll.
 */
async function checkTitle(cdp, label, count, out, prefix, serverRendered = true) {
  // Client-computed pages (the day page) mount their head after load.
  for (let i = 0; i < 100; i += 1) {
    if ((await cdp.evaluate(`document.querySelectorAll(".script-name--script-first[data-reveal]").length`)) >= count) break;
    await sleep(100);
  }
  // Right after hydration: a fade in flight here would mean the first paint differed from the held state.
  const hydrated = await cdp.evaluate(TITLE_PROBE);
  if (hydrated.length !== count) fail(`${label}: ${hydrated.length} script-first titles, expected ${count}`);
  for (const n of hydrated) {
    if (n.fading > 0) fail(`${label} hydrated: "${n.text}" has ${n.fading} fade(s) running`);
  }
  const first = (await cdp.evaluate(`window.__titleFirstPaint ?? []`)).filter((n) => n.styled);
  // A server-rendered title is in the HTML at DOMContentLoaded; a client-computed head (the day page) is not.
  if (serverRendered && first.length !== count) fail(`${label} first paint: ${first.length} styled titles recorded at DOMContentLoaded, expected ${count}`);
  for (const n of first) {
    if (n.latin > 0.01 || n.script < 0.99) fail(`${label} first paint: "${n.text}" latin ${n.latin} script ${n.script} (hydrated ${n.hydrated})`);
  }
  await sleep(600);
  const held = await cdp.evaluate(TITLE_PROBE);
  for (const n of held) {
    if (n.reveal !== "script" || n.latin > 0.01 || n.script < 0.99) fail(`${label} held: "${n.text}" reveal ${n.reveal} latin ${n.latin} script ${n.script}`);
  }
  const w1 = await cdp.evaluate(SCROLL_WIDTH);
  if (w1.scrollWidth > w1.innerWidth) fail(`${label} held: horizontal scroll (${w1.scrollWidth} > ${w1.innerWidth})`);
  await shoot(cdp, out, `${prefix}-script.png`);
  if (held[0]) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: held[0].x, y: held[0].y });
    await sleep(600);
    const hovered = (await cdp.evaluate(TITLE_PROBE))[0];
    if (hovered.latin < 0.99 || hovered.script > 0.01) fail(`${label}: hovering "${hovered.text}" did not show Latin (latin ${hovered.latin})`);
    await shoot(cdp, out, `${prefix}-hovered.png`);
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 1 });
    await sleep(600);
    const left = (await cdp.evaluate(TITLE_PROBE))[0];
    if (left.reveal !== "script" || left.latin > 0.01) fail(`${label}: "${left.text}" did not return to script after hover (latin ${left.latin})`);
  }
  // The first scroll releases the band's verdict.
  await cdp.evaluate(`window.scrollBy(0, 1)`);
  await sleep(900);
  const scrolled = await cdp.evaluate(TITLE_PROBE);
  for (const n of scrolled) {
    const want = n.inBand ? "latin" : "script";
    if (n.reveal !== want) fail(`${label} scrolled: "${n.text}" reads ${n.reveal}, expected ${want} (top ${Math.round(n.top)}, band from ${Math.round(0.3 * (await cdp.evaluate("innerHeight")))})`);
  }
  await shoot(cdp, out, `${prefix}-scrolled.png`);
  // Out of the band above, where the page is tall enough to put it there.
  if (scrolled[0]) {
    const h = await cdp.evaluate("innerHeight");
    const max = await cdp.evaluate("document.documentElement.scrollHeight - innerHeight");
    const y = Math.ceil(scrolled[0].bottom - h * 0.3 + 8);
    if (y <= max) {
      await cdp.evaluate(`window.scrollTo(0, ${y})`);
      await sleep(900);
      const out1 = (await cdp.evaluate(TITLE_PROBE))[0];
      if (out1.reveal !== "script") fail(`${label}: "${out1.text}" reads ${out1.reveal} scrolled out of the band`);
      await cdp.evaluate(`window.scrollTo(0, 0)`);
      await sleep(900);
      const back = (await cdp.evaluate(TITLE_PROBE))[0];
      const want = back.inBand ? "latin" : "script";
      if (back.reveal !== want) fail(`${label}: "${back.text}" reads ${back.reveal} back at the top, expected ${want}`);
    }
  }
  const w2 = await cdp.evaluate(SCROLL_WIDTH);
  if (w2.scrollWidth > w2.innerWidth) fail(`${label} scrolled: horizontal scroll (${w2.scrollWidth} > ${w2.innerWidth})`);
  const where = scrolled.map((n) => `"${n.text}" ${n.inBand ? "in the band" : "above the band"} at the top, ${n.reveal} after the first scroll`).join("; ");
  const paint = first.length === 0 ? "" : ` (first paint recorded ${first.filter((n) => !n.hydrated).length}/${first.length} before hydration)`;
  console.log(`${label}: ${held.length} title(s) script at first paint and held${paint}; ${where || "none"}; scrollWidth ${w2.scrollWidth}/${w2.innerWidth}`);
}

// The stagger runs by list position; every culture name has a script form.
const PICKER_DELAYS = [1200, 1400, 1600, 1800, 2000];
const HEAD_TITLES = { egypt: 1, greece: 1, canaan: 1, carthage: 1, rome: 1 };

function parseArgs(argv) {
  const opts = { base: null, out: null, chrome: null, viewports: [] };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--out") opts.out = argv[++i];
    else if (argv[i] === "--chrome") opts.chrome = argv[++i];
    else if (argv[i] === "--viewport") opts.viewports.push(argv[++i]);
    else opts.base = argv[i];
  }
  if (!opts.base) {
    console.error("usage: node scripts/check-script-reveal.mjs <base-url> [--out DIR] [--chrome PATH] [--viewport WxH ...]");
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
    if (res.exceptionDetails) throw new Error(`evaluate failed: ${res.exceptionDetails.exception?.description ?? res.exceptionDetails.text}`);
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
    // An intro name resolves on load and then follows crossings only; the head checks cover it.
    if (!n.visible || n.intro) continue;
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
  // The class as rendered on the element; the noscript style and the flight payload also carry the name.
  const titles = (html.match(/class="script-name script-name--script-first/g) ?? []).length;
  if (titles !== HEAD_TITLES[culture]) fail(`${culture} server html: ${titles} script-first titles, expected ${HEAD_TITLES[culture]}`);
  if (!/<noscript><style>[^<]*script-name--script-first/.test(html)) fail(`${culture} server html: no noscript style for the script-first title`);
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
    "--disable-lcd-text",
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
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: RECORD_FIRST_PAINT });

  await navigate(cdp, new URL("/", args.base).toString());
  if ((await cdp.evaluate(SEED_ONBOARDED)) !== "seeded") throw new Error("seeding localStorage failed");

  for (const culture of CULTURES) {
    const n = await checkServerHtml(args.base, culture);
    console.log(`${culture} server html: ${n} Latin names as text`);
  }

  const viewports = args.viewports.length === 0 ? VIEWPORTS : VIEWPORTS.filter((vp) => args.viewports.includes(`${vp.width}x${vp.height}`));
  if (viewports.length === 0) throw new Error(`check-script-reveal: no viewport matches ${args.viewports.join(", ")}`);
  for (const vp of viewports) {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 600 });
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    for (const culture of vp.cultures) {
      const label = `${culture} @${vp.width}`;
      await navigate(cdp, new URL(`/voices/${culture}`, args.base).toString());
      await checkTitle(cdp, `${label} title`, HEAD_TITLES[culture], args.out, `${culture}-${vp.width}-title`);

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

    // The day page: the culture's name above the decree.
    await navigate(cdp, new URL("/?culture=egypt", args.base).toString());
    await checkTitle(cdp, `day page @${vp.width} title`, 1, args.out, `day-${vp.width}-title`, false);

    // No JavaScript: the layout's noscript style shows the title's Latin form.
    await cdp.send("Emulation.setScriptExecutionDisabled", { value: true });
    await navigate(cdp, new URL("/voices/egypt", args.base).toString());
    const noJs = await cdp.evaluate(TITLE_PROBE);
    const noscriptStyled = await cdp.evaluate(`document.querySelector("noscript style") !== null`);
    if (!noscriptStyled) fail(`egypt @${vp.width} no js: the noscript style did not render`);
    if (noJs.length !== HEAD_TITLES.egypt) fail(`egypt @${vp.width} no js: ${noJs.length} titles, expected ${HEAD_TITLES.egypt}`);
    for (const n of noJs) {
      if (n.reveal !== null || n.latin < 0.99 || n.script > 0.01) fail(`egypt @${vp.width} no js: "${n.text}" reveal ${n.reveal} latin ${n.latin} script ${n.script}`);
    }
    await cdp.send("Emulation.setScriptExecutionDisabled", { value: false });
    console.log(`egypt @${vp.width} no js: ${noJs.length} title(s) Latin, noscript style ${noscriptStyled ? "rendered" : "missing"}`);

    // The culture picker on /welcome: five large names, staggered.
    await navigate(cdp, new URL("/welcome", args.base).toString());
    await checkIntro(cdp, `picker @${vp.width}`, PICKER_DELAYS, args.out, `picker-${vp.width}`, 2);

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
    for (const n of await cdp.evaluate(TITLE_PROBE)) {
      if (n.reveal !== null || n.latin < 0.99 || n.script > 0.01) fail(`egypt @${vp.width} reduced motion: title "${n.text}" reveal ${n.reveal} latin ${n.latin} script ${n.script}`);
    }
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
