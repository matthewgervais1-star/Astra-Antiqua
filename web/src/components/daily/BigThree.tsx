"use client";

import Link from "next/link";
import type { Culture } from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, type Longitude } from "@/data/sampleChart";
import type { SavedNatal } from "@/lib/savedNatal";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";

interface BigThreeProps {
  culture: Culture | null;
  natal: SavedNatal;
}

const ASCENDANT_GLYPH_PLANET = "sun" as const;

function CornerCell({
  label,
  deityName,
  deityEpithet,
  sign,
  degree,
  children,
}: {
  label: string;
  deityName: string;
  deityEpithet: string;
  sign: string;
  degree: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
        {label}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <div className="min-w-0 flex-1">
          <div className="font-display text-gold-leaf truncate text-2xl md:text-3xl">
            {deityName}
          </div>
          <div className="text-ink-secondary font-body text-xs italic md:text-sm">
            {deityEpithet}
          </div>
        </div>
      </div>
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.2em]">
        {degree.toFixed(0)}° {sign}
      </div>
    </div>
  );
}

function UniversalCell({
  label,
  longitude,
  iconText,
}: {
  label: string;
  longitude: Longitude;
  iconText: string;
}) {
  const { sign, degree } = longitudeToSign(longitude);
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.3em]">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-gold-leaf font-display text-2xl">{iconText}</span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-ink-primary truncate text-2xl md:text-3xl">
            {sign}
          </div>
          <div className="text-ink-secondary font-body text-xs italic md:text-sm">
            {degree.toFixed(0)}° {sign}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BigThree({ culture, natal }: BigThreeProps) {
  if (!culture) {
    const sunSign = longitudeToSign(natal.chart.sun);
    const moonSign = longitudeToSign(natal.chart.moon);
    const ascSign = longitudeToSign(natal.angles.ascendant);
    return (
      <GlassPanel tone="solid" className="p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
            Your big three
          </div>
          <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
            Born {natal.inputs.date} · {natal.inputs.cityLabel}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-10">
          <UniversalCell label="Sun" longitude={natal.chart.sun} iconText="☉" />
          <UniversalCell label="Moon" longitude={natal.chart.moon} iconText="☽" />
          <UniversalCell label="Rising" longitude={natal.angles.ascendant} iconText="↑" />
        </div>
        <p className="text-ink-tertiary font-body mt-6 text-sm">
          Sun {sunSign.sign} · Moon {moonSign.sign} · Rising {ascSign.sign}. Select a pantheon above to read these in the voice of a tradition.
        </p>
      </GlassPanel>
    );
  }

  const sunDeity = DEITY_MATRIX[culture].sun;
  const moonDeity = DEITY_MATRIX[culture].moon;
  const sunSign = longitudeToSign(natal.chart.sun);
  const moonSign = longitudeToSign(natal.chart.moon);
  const ascSign = longitudeToSign(natal.angles.ascendant);

  return (
    <GlassPanel tone="solid" className="p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          Your big three
        </div>
        <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
          Born {natal.inputs.date} · {natal.inputs.cityLabel}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 md:gap-10">
        <CornerCell
          label="Sun · identity"
          deityName={sunDeity.name}
          deityEpithet={sunDeity.epithet}
          sign={sunSign.sign}
          degree={sunSign.degree}
        >
          <DeityGlyph culture={culture} planet="sun" size={44} decorative />
        </CornerCell>
        <CornerCell
          label="Moon · body"
          deityName={moonDeity.name}
          deityEpithet={moonDeity.epithet}
          sign={moonSign.sign}
          degree={moonSign.degree}
        >
          <DeityGlyph culture={culture} planet="moon" size={44} decorative />
        </CornerCell>
        <CornerCell
          label="Rising · threshold"
          deityName={ascSign.sign}
          deityEpithet="The sign on the eastern horizon"
          sign={ascSign.sign}
          degree={ascSign.degree}
        >
          <DeityGlyph
            culture={culture}
            planet={ASCENDANT_GLYPH_PLANET}
            size={44}
            decorative
          />
        </CornerCell>
      </div>
      <p className="text-ink-tertiary font-body mt-6 text-sm">
        Sun {sunSign.sign} · Moon {moonSign.sign} · Rising {ascSign.sign}.{" "}
        <Link href="/reading" className="text-gold-leaf underline-offset-4 hover:underline">
          Open the full reading
        </Link>
        .
      </p>
    </GlassPanel>
  );
}
