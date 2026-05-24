"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useActivePantheon } from "@/components/pantheon/PantheonSelector";
import {
  CULTURE_LABELS,
  PLANETS,
  PLANET_LABELS,
  PLANET_SYMBOLS,
  type Planet,
} from "@/data/cultures";
import { DEITY_MATRIX } from "@/data/deities";
import { longitudeToSign, SAMPLE_CHART } from "@/data/sampleChart";
import { drawWheel } from "@/components/wheel/wheelDraw";
import {
  computePlanetPositions,
  hitTest,
  makeGeometry,
} from "@/components/wheel/wheelHitTest";
import { WheelTooltip } from "@/components/wheel/WheelTooltip";
import { DeityGlyph } from "@/components/glyphs/DeityGlyph";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { cn } from "@/lib/classNames";

function NatalWheelImpl() {
  const culture = useActivePantheon();
  const reduce = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pulsePhaseRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  const [size, setSize] = useState<number>(480);
  const [hover, setHover] = useState<{ planet: Planet; x: number; y: number } | null>(null);
  const [pinned, setPinned] = useState<Planet | null>(null);

  const positions = useMemo(() => {
    const geometry = makeGeometry(size);
    return computePlanetPositions(geometry);
  }, [size]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = typeof window === "undefined" ? 1 : Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    drawWheel({
      ctx,
      cssSize: size,
      dpr,
      culture,
      highlightPlanet: pinned ?? hover?.planet ?? null,
      pulsePhase: reduce ? 0 : pulsePhaseRef.current,
    });
  }, [size, culture, hover, pinned, reduce]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = Math.max(280, Math.min(560, Math.round(entry.contentRect.width)));
      setSize(next);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (reduce) return;
    let active = true;
    const step = (t: number) => {
      if (!active) return;
      const dt = lastFrameTime.current === 0 ? 0 : (t - lastFrameTime.current) / 1000;
      lastFrameTime.current = t;
      pulsePhaseRef.current += dt * 2.2;
      draw();
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      active = false;
      lastFrameTime.current = 0;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, reduce]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const planet = hitTest(positions, x, y);
      if (planet) {
        const pos = positions.find((p) => p.planet === planet);
        if (pos) setHover({ planet, x: pos.x, y: pos.y });
      } else {
        setHover(null);
      }
    },
    [positions],
  );

  const handlePointerLeave = useCallback(() => setHover(null), []);
  const handleClick = useCallback(() => {
    if (hover) {
      setPinned((current) => (current === hover.planet ? null : hover.planet));
    } else if (pinned !== null) {
      setPinned(null);
    }
  }, [hover, pinned]);

  const activePlanet: Planet | null = pinned ?? hover?.planet ?? null;
  const activePos = activePlanet ? positions.find((p) => p.planet === activePlanet) : null;

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_320px] md:gap-12">
      <div className="flex flex-col items-center">
        <div ref={containerRef} className="relative w-full max-w-[560px]">
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onClick={handleClick}
            className="mx-auto block cursor-pointer touch-manipulation"
            aria-label={
              culture
                ? `Natal chart wheel in the voice of ${CULTURE_LABELS[culture]}`
                : "Natal chart wheel"
            }
            role="img"
          />
          {activePos ? (
            <WheelTooltip
              culture={culture}
              planet={activePos.planet}
              x={activePos.x}
              y={activePos.y}
              containerWidth={size}
            />
          ) : null}
        </div>
        <p className="text-ink-tertiary font-mono mt-6 text-[10px] uppercase tracking-[0.3em]">
          Sample chart · Sun in Aries · gold lines harmonize, red lines challenge
        </p>
      </div>

      <aside aria-label="Active deities" className="flex flex-col gap-2">
        <div className="text-ink-tertiary font-mono mb-2 text-[10px] uppercase tracking-[0.3em]">
          {culture ? `The seven of ${CULTURE_LABELS[culture]}` : "Classical seven"}
        </div>
        <ul className="flex flex-col gap-2">
          {PLANETS.map((planet) => {
            const deity = culture ? DEITY_MATRIX[culture][planet] : null;
            const { sign, degree } = longitudeToSign(SAMPLE_CHART[planet]);
            const isActive = activePlanet === planet;
            return (
              <li key={planet}>
                <button
                  type="button"
                  onMouseEnter={() => {
                    const pos = positions.find((p) => p.planet === planet);
                    if (pos) setHover({ planet, x: pos.x, y: pos.y });
                  }}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => {
                    const pos = positions.find((p) => p.planet === planet);
                    if (pos) setHover({ planet, x: pos.x, y: pos.y });
                  }}
                  onBlur={() => setHover(null)}
                  onClick={() =>
                    setPinned((curr) => (curr === planet ? null : planet))
                  }
                  className={cn(
                    "border-hairline hover:border-gold-soft flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    isActive && "border-gold-soft bg-gold-leaf/5",
                  )}
                >
                  {culture ? (
                    <DeityGlyph
                      culture={culture}
                      planet={planet}
                      size={36}
                      decorative
                      className="shrink-0"
                    />
                  ) : (
                    <span className="text-ink-secondary font-display w-9 text-center text-2xl">
                      {PLANET_SYMBOLS[planet]}
                    </span>
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="font-display text-ink-primary block text-base leading-tight">
                      {deity?.name ?? PLANET_LABELS[planet]}
                    </span>
                    <span className="text-ink-tertiary font-mono mt-0.5 block text-[10px] uppercase tracking-[0.2em]">
                      {degree.toFixed(0)}° {sign}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

function NatalWheelFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Aligning the wheel
      </div>
    </div>
  );
}

export function NatalWheel() {
  return (
    <Suspense fallback={<NatalWheelFallback />}>
      <NatalWheelImpl />
    </Suspense>
  );
}
