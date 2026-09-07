// Specimen stub for next/font/local. Only layout.tsx imports it and layout is
// never rendered as a specimen; this exists so a transitive import cannot throw.
export default function localFont(opts: { variable?: string }) {
  const v = opts.variable ?? "--font-local";
  return { variable: `font-var${v}`, className: `font-cls${v}`, style: { fontFamily: `var(${v})` } };
}
