import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CULTURE_LABELS, CULTURE_TAGLINES, isCulture } from "@/data/cultures";
import { CULTURE_ACCENTS, CULTURE_GROUNDS } from "@/data/palettes";
import { CULTURE_EMBLEMS } from "@/marks";
import { WordmarkGlyphs } from "@/components/chrome/Wordmark";

export const alt = "A doorway of Astra Antiqua: one culture's reading of the computed sky";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The drawn wordmark at the cap height the typed 16px Cinzel line had
 * (16 * 0.70 = 11.2), sized the way the default card sizes its own. The A's
 * ink is 102.25 of the viewBox's 132 units, see Wordmark.tsx.
 */
const WORDMARK_CAP_HEIGHT = 11.2;
const WORDMARK_HEIGHT = (WORDMARK_CAP_HEIGHT * 132) / 102.25;
const WORDMARK_WIDTH = (WORDMARK_HEIGHT * 1424) / 132;

const BONE = "#E6DECC";
const DIM = "#9A917D";

interface OpengraphImageProps {
  params: Promise<{ culture: string }>;
}

/**
 * The share card for a culture doorway: the culture's ground, its tier-2
 * emblem in its accent, its name in Cinzel and the institution it speaks
 * from. docs/design/handoff/README.md sets the frame (1200 by 630, a 1px
 * border inset 14px, the culture's accent rules) and
 * docs/design/culture-marks.md puts the tier-2 emblem on share cards, always
 * beside a label, so the famous mark is read as the right mark.
 *
 * Satori has no innerHTML and does not expand a component inside an svg
 * subtree, so the emblem travels as an SVG data URI in an img, with
 * currentColor resolved to the accent before it is encoded. Satori cannot
 * read woff2 either, so the card sets its lines in the Cinzel TTF the
 * default card ships.
 */
export default async function OpengraphImage({ params }: OpengraphImageProps) {
  const { culture: raw } = await params;
  if (!isCulture(raw)) notFound();
  const culture = raw;

  const cinzel = await readFile(join(process.cwd(), "src/fonts/cinzel-og-500.ttf"));
  const accent = CULTURE_ACCENTS[culture];
  const ground = CULTURE_GROUNDS[culture];
  const emblem = CULTURE_EMBLEMS[culture];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">` +
    emblem.inner.replaceAll("currentColor", accent) +
    `</svg>`;
  const emblemSrc = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: ground,
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
          <img src={emblemSrc} width={168} height={168} alt="" />
          <div style={{ width: 64, height: 1, background: accent, marginTop: 30 }} />
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 76,
              letterSpacing: 12,
              color: BONE,
            }}
          >
            {CULTURE_LABELS[culture].toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 22,
              letterSpacing: 4,
              color: DIM,
            }}
          >
            {CULTURE_TAGLINES[culture].toUpperCase()}
          </div>
          <div style={{ width: 64, height: 1, background: accent, marginTop: 30 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 26,
              fontSize: 16,
              letterSpacing: 4,
              color: DIM,
            }}
          >
            <svg viewBox="-10 -10 1424 132" width={WORDMARK_WIDTH} height={WORDMARK_HEIGHT}>
              {WordmarkGlyphs({ stroke: DIM })}
            </svg>
            <div style={{ display: "flex", marginLeft: 12 }}>· ONE SKY · FIVE ANCIENT VOICES</div>
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
