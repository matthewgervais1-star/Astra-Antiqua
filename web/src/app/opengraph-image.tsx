import { ImageResponse } from "next/og";

export const alt = "Astra Antiqua: the ancient sky, measured exactly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social-share card for every route that does not supply its own.
 * Gold-on-void wordmark to match the site's Relic aesthetic. Uses a serif
 * fallback stack so it renders without bundling a font file.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(1200px 600px at 50% -10%, rgba(212,175,55,0.16), transparent 60%), #050505",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 40,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          Ancient sky · modern measurement
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 132,
            color: "#d4af37",
          }}
        >
          Astra Antiqua
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Read the sky as Carthage did. Or Memphis, Delphi, Ugarit, or Rome.
        </div>
      </div>
    ),
    size,
  );
}
