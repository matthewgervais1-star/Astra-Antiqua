/**
 * The shared piece of the two Android generators: reading a design-system SVG
 * and turning its shapes into path data.
 *
 * Both targets want the same thing. An Android VectorDrawable has only
 * <path>, and a Compose ImageVector is built from path nodes, so a mark's
 * circles, rects, lines, polylines and polygons have to become path data
 * while every <path>'s own d string is carried through untouched. Neither
 * generator may change a mark's geometry, so the conversions here are exact
 * and anything unrecognised throws rather than being skipped.
 *
 * Used by gen-android-launchers.mjs and gen-android-glyphs.mjs. Written out
 * rather than taking an SVG library because this surface's node_modules is a
 * pnpm tree that npm's resolver will not add to.
 */

export function fail(message) {
  throw new Error(`svg-shapes: ${message}`);
}

/** An element tree for the mark SVGs, which scripts/check-svgs.mjs keeps well formed. */
export function parseElements(inner) {
  const nodes = [];
  const stack = [{ children: nodes }];
  const tag = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
  let m;
  while ((m = tag.exec(inner))) {
    const [, closing, name, attrText, selfClosing] = m;
    if (closing) {
      stack.pop();
      continue;
    }
    const attrs = {};
    for (const [, key, value] of attrText.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[key] = value;
    const node = { name, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return nodes;
}

const n = (v) => Number(Number(v).toFixed(3));

/** Every shape the marks and glyphs use, as path data. */
export function shapeToPathData(node) {
  const a = node.attrs;
  const points = (raw) => raw.trim().split(/[\s,]+/).map(Number);
  switch (node.name) {
    case "path":
      return a.d ?? fail("a <path> with no d");
    case "circle": {
      const cx = Number(a.cx);
      const cy = Number(a.cy);
      const r = Number(a.r);
      return `M${n(cx - r)},${n(cy)} a${n(r)},${n(r)} 0 1,0 ${n(2 * r)},0 a${n(r)},${n(r)} 0 1,0 ${n(-2 * r)},0 Z`;
    }
    case "ellipse": {
      const cx = Number(a.cx);
      const cy = Number(a.cy);
      const rx = Number(a.rx);
      const ry = Number(a.ry);
      return `M${n(cx - rx)},${n(cy)} a${n(rx)},${n(ry)} 0 1,0 ${n(2 * rx)},0 a${n(rx)},${n(ry)} 0 1,0 ${n(-2 * rx)},0 Z`;
    }
    case "rect": {
      const x = Number(a.x ?? 0);
      const y = Number(a.y ?? 0);
      const w = Number(a.width);
      const h = Number(a.height);
      if (a.rx || a.ry) fail("a rounded rect, which this identity does not use");
      return `M${n(x)},${n(y)} h${n(w)} v${n(h)} h${n(-w)} Z`;
    }
    case "line":
      return `M${n(a.x1)},${n(a.y1)} L${n(a.x2)},${n(a.y2)}`;
    case "polyline": {
      const p = points(a.points);
      let d = `M${n(p[0])},${n(p[1])}`;
      for (let i = 2; i < p.length; i += 2) d += ` L${n(p[i])},${n(p[i + 1])}`;
      return d;
    }
    case "polygon": {
      const p = points(a.points);
      let d = `M${n(p[0])},${n(p[1])}`;
      for (let i = 2; i < p.length; i += 2) d += ` L${n(p[i])},${n(p[i + 1])}`;
      return `${d} Z`;
    }
    default:
      return fail(`<${node.name}> is not one of the eight elements these assets are drawn with`);
  }
}

/** Flattens the tree into paths, resolving the paint attributes a <g> passes down. */
export function flatten(nodes, inherited = {}) {
  const out = [];
  for (const node of nodes) {
    const attrs = { ...inherited, ...node.attrs };
    if (node.name === "g") {
      out.push(...flatten(node.children, attrs));
      continue;
    }
    if (node.name === "title" || node.name === "desc") continue;
    out.push({ d: shapeToPathData(node), attrs });
  }
  return out;
}

/** An SVG document's viewBox, its title and its inner markup. */
export function parseDocument(text) {
  const open = text.match(/<svg\b([^>]*)>/);
  const close = text.lastIndexOf("</svg>");
  if (!open || close < 0) fail("not an SVG document");
  const viewBox = open[1].match(/viewBox="([^"]+)"/);
  if (!viewBox) fail("the document has no viewBox");
  const [minX, minY, width, height] = viewBox[1].trim().split(/[\s,]+/).map(Number);
  const titleMatch = text.match(/<title>([\s\S]*?)<\/title>/);
  const inner = text
    .slice(open.index + open[0].length, close)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .trim();
  return { minX, minY, width, height, title: titleMatch ? titleMatch[1].trim() : null, inner };
}
