import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Astra Antiqua: the ancient sky, measured exactly";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social-share card for every route that does not supply its own.
 * The Instrument in the Temple identity: wordmark and incised rules on the
 * neutral ground, per the 6a share-card mock. Satori cannot read woff2, so
 * the card ships its own Cinzel 500 TTF from src/fonts.
 */
export default async function OpengraphImage() {
  const cinzel = await readFile(join(process.cwd(), "src/fonts/cinzel-og-500.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#171310",
          padding: 14,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(230,222,204,0.35)",
            fontFamily: "Cinzel",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 3,
              color: "#9A917D",
            }}
          >
            ONE SKY · FIVE ANCIENT VOICES
          </div>
          <div
            style={{
              width: 64,
              height: 1,
              background: "#B59A55",
              marginTop: 30,
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 86,
              fontWeight: 500,
              letterSpacing: 14,
              color: "#E6DECC",
            }}
          >
            ASTRA ANTIQVA
          </div>
          <div
            style={{
              width: 64,
              height: 1,
              background: "#B59A55",
              marginTop: 30,
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 18,
              letterSpacing: 4,
              color: "#9A917D",
            }}
          >
            EGYPT · GREECE · CANAAN · CARTHAGE · ROME
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cinzel", data: cinzel, weight: 500, style: "normal" }],
    },
  );
}
