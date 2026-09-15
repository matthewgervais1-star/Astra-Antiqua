import type { CSSProperties } from "react";
import { cn } from "@/lib/classNames";

/**
 * The marks a tile can hold. Six are encoded characters, set as type in the
 * epigraphic face that carries them; three only ever existed as objects and
 * are the traced PNG alpha masks from docs/design/system/assets/traced.
 */
export type IconTileMark =
  | "ankh"
  | "wedjat"
  | "seated-king"
  | "balance"
  | "il"
  | "omega"
  | "shewolf"
  | "augustus"
  | "baal-stele";

/** The three tile sizes of tokens/rules.css, or a px width for a one-off. */
export type IconTileSize = "sm" | "md" | "lg" | number;

export type IconTileInk = "bone" | "dim" | "accent";

export interface IconTileProps {
  mark: IconTileMark;
  size?: IconTileSize;
  /** The ink the mark paints in. Accent only where the accent's three jobs allow it. */
  ink?: IconTileInk;
  /** Hidden from the accessibility tree where a caption already names the mark. */
  decorative?: boolean;
  className?: string;
}

interface TypesetMark {
  readonly kind: "type";
  readonly text: string;
  readonly font: string;
  /** The sign's share of the tile, --sign-scale-single or --sign-scale-pair. */
  readonly scale: number;
  readonly label: string;
}

interface TracedMark {
  readonly kind: "traced";
  readonly src: string;
  readonly scale: number;
  readonly label: string;
}

/**
 * The epigraphic faces set attested signs only, never copy
 * (docs/design/system/readme.md, Type). These are the signs the readme names
 * as encoded characters, with the codepoints it gives; palaeographers drew
 * them from the material record, so they are set, not redrawn.
 */
const SIGN_SINGLE = 0.62;
const SIGN_PAIR = 0.44;
/** 77 of 96 in guidelines/marks-traced.html. */
const TRACED = 0.8;

const MARKS: Readonly<Record<IconTileMark, TypesetMark | TracedMark>> = {
  ankh: {
    kind: "type",
    text: String.fromCodePoint(0x2625),
    font: "font-symbols",
    scale: SIGN_SINGLE,
    label: "The ankh",
  },
  wedjat: {
    kind: "type",
    text: String.fromCodePoint(0x13080),
    font: "font-hieroglyph",
    scale: SIGN_SINGLE,
    label: "The wedjat",
  },
  "seated-king": {
    kind: "type",
    text: String.fromCodePoint(0x1303b),
    font: "font-hieroglyph",
    scale: SIGN_SINGLE,
    label: "The seated king",
  },
  balance: {
    kind: "type",
    text: String.fromCodePoint(0x1335d),
    font: "font-hieroglyph",
    scale: SIGN_SINGLE,
    label: "The balance",
  },
  il: {
    kind: "type",
    text: String.fromCodePoint(0x1039b, 0x1038d),
    font: "font-ugaritic",
    scale: SIGN_PAIR,
    label: "The name of El, in Ugaritic",
  },
  omega: {
    kind: "type",
    text: String.fromCodePoint(0x03a9),
    font: "font-greek-display",
    scale: SIGN_SINGLE,
    label: "Omega",
  },
  shewolf: {
    kind: "traced",
    src: "/marks/traced/icon-shewolf.png",
    scale: TRACED,
    label: "The she-wolf, the Capitoline bronze",
  },
  augustus: {
    kind: "traced",
    src: "/marks/traced/icon-augustus.png",
    scale: TRACED,
    label: "Augustus of Prima Porta",
  },
  "baal-stele": {
    kind: "traced",
    src: "/marks/traced/icon-baal-stele.png",
    scale: TRACED,
    label: "The Baal stele, Louvre AO 15775",
  },
};

/** --tile-sm, --tile-md, --tile-lg in tokens/rules.css. */
const SIZES: Readonly<Record<Exclude<IconTileSize, number>, number>> = {
  sm: 48,
  md: 150,
  lg: 170,
};

const INK: Readonly<Record<IconTileInk, string>> = {
  bone: "text-bone",
  dim: "text-dim",
  accent: "text-accent",
};

/**
 * A square culture tile holding one mark
 * (docs/design/system/components/specs/IconTile.prompt.md): either an
 * attested sign set as type, or a traced PNG mask that takes the accent.
 *
 * A traced mark is one file for every ink: the PNG is an alpha mask, the
 * tile paints a block in currentColor and cuts it with mask-image, which is
 * how guidelines/marks-traced.html shows them. The design notes put these at
 * tier 2 and editorial only: a figure at launcher size says "five
 * civilisations" where the set needs to say "five ways of reading the sky".
 */
export function IconTile({
  mark,
  size = "md",
  ink = "bone",
  decorative = false,
  className,
}: IconTileProps) {
  const px = typeof size === "number" ? size : SIZES[size];
  const m = MARKS[mark];
  const inner = Math.round(px * m.scale);

  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : m.label}
      aria-hidden={decorative ? true : undefined}
      className={cn("flex shrink-0 items-center justify-center bg-ground", INK[ink], className)}
      style={{ width: px, height: px }}
    >
      {m.kind === "type" ? (
        <span
          aria-hidden="true"
          className={cn(m.font, "select-none leading-none")}
          style={{ fontSize: inner }}
        >
          {m.text}
        </span>
      ) : (
        <span aria-hidden="true" className="block bg-current" style={maskStyle(m.src, inner)} />
      )}
    </div>
  );
}

function maskStyle(src: string, px: number): CSSProperties {
  const url = `url(${src})`;
  return {
    width: px,
    height: px,
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}
