"use client";

import { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useActivePantheon } from "@/components/pantheon/PantheonSelector";
import { ORACLE_DECREES } from "@/data/oracleDecrees";
import { CULTURE_LABELS } from "@/data/cultures";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";

function OracleDecreeImpl() {
  const culture = useActivePantheon();
  const reduce = usePrefersReducedMotion();
  const decree = culture ? ORACLE_DECREES[culture] : null;

  return (
    <GlassPanel
      tone="glass"
      glow={decree !== null}
      className="relative min-h-[260px] p-8 md:p-12"
    >
      <AnimatePresence mode="wait">
        {decree && culture ? (
          <motion.div
            key={culture}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0.01 : 0.6, ease: "easeInOut" }}
          >
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.35em]">
              {decree.sampleTransit}
            </div>
            <h3 className="font-display text-ink-primary mt-3 text-3xl md:text-[40px]">
              {decree.oracleName}
            </h3>
            <p className="text-ink-secondary font-mono mt-1 text-[11px] uppercase tracking-[0.3em]">
              The voice of {CULTURE_LABELS[culture]}
            </p>
            <p className="text-ink-primary font-body mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">
              {decree.body}
            </p>
            <p className="text-ink-tertiary font-mono mt-10 text-[10px] uppercase tracking-[0.3em]">
              Sample transit · Real charts require birth data
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.4 }}
            className="flex h-full min-h-[200px] flex-col items-start justify-center gap-3"
          >
            <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
              Oracle&apos;s Decree
            </div>
            <p className="font-display text-ink-secondary max-w-xl text-xl md:text-2xl">
              Select a pantheon above to hear the day&apos;s sample reading.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

function OracleFallback() {
  return (
    <GlassPanel tone="glass" className="min-h-[260px] p-8 md:p-12">
      <div className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.35em]">
        Loading
      </div>
    </GlassPanel>
  );
}

export function OracleDecree() {
  return (
    <Suspense fallback={<OracleFallback />}>
      <OracleDecreeImpl />
    </Suspense>
  );
}
