"use client";

import { useState } from "react";
import {
  RELATIONSHIP_LABELS,
  upsertChart,
  type ChartRelationship,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import type { BirthFormValues } from "@/components/reading/BirthForm";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface SaveChartPanelProps {
  values: BirthFormValues;
  existingId?: string;
  initialName?: string;
  initialRelationship?: ChartRelationship;
  initialPrimary?: boolean;
  onSaved: (saved: SavedChartInputs) => void;
}

export function SaveChartPanel({
  values,
  existingId,
  initialName = "",
  initialRelationship = "self",
  initialPrimary = false,
  onSaved,
}: SaveChartPanelProps) {
  const [name, setName] = useState(initialName);
  const [relationship, setRelationship] =
    useState<ChartRelationship>(initialRelationship);
  const [primary, setPrimary] = useState<boolean>(initialPrimary);
  const [saved, setSaved] = useState<SavedChartInputs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Give this chart a name (for example: Me, Sarah, Mom).");
      return;
    }
    try {
      const result = upsertChart({
        id: existingId,
        name: name.trim(),
        relationship,
        date: values.date,
        time: values.time,
        cityLabel: values.cityLabel,
        latitude: values.latitude,
        longitude: values.longitude,
        primary,
      });
      setSaved(result);
      onSaved(result);
    } catch {
      setError("Could not save. Local storage may be unavailable in this browser.");
    }
  };

  if (saved) {
    return (
      <GlassPanel tone="solid" className="border-gold-soft border p-6 md:p-7">
        <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
          Saved
        </div>
        <h4 className="font-display text-ink-primary mt-2 text-xl md:text-2xl">
          {saved.name} is now on your charts list.
        </h4>
        <p className="text-ink-secondary font-body mt-2 text-sm md:text-base">
          {saved.primary
            ? "Marked as your primary chart. The home page Big Three and Personal Transits will use it."
            : "Saved as a secondary chart. Use the /charts page to switch which one is primary."}
        </p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel tone="solid" className="border-hairline border p-6 md:p-7">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Save this chart
      </div>
      <p className="text-ink-secondary font-body mt-2 text-sm">
        Stored only in this browser. Used by the home page Big Three, Personal Transits, and Synastry.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div>
          <label
            htmlFor="save-chart-name"
            className="text-ink-secondary font-mono mb-2 block text-[10px] uppercase tracking-[0.25em]"
          >
            Chart name
          </label>
          <input
            id="save-chart-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Me, Sarah, Mom"
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            required
          />
        </div>
        <div>
          <label
            htmlFor="save-chart-rel"
            className="text-ink-secondary font-mono mb-2 block text-[10px] uppercase tracking-[0.25em]"
          >
            Relationship
          </label>
          <select
            id="save-chart-rel"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as ChartRelationship)}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          >
            {(Object.entries(RELATIONSHIP_LABELS) as [ChartRelationship, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <label className="text-ink-secondary font-body flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={primary}
            onChange={(e) => setPrimary(e.target.checked)}
            className="accent-gold-leaf h-4 w-4"
          />
          Set as my primary chart (used by the home page personalization)
        </label>
        <button
          type="submit"
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors"
        >
          {existingId ? "Update saved chart" : "Save chart"}
          <span aria-hidden>→</span>
        </button>
        {error ? (
          <p role="alert" className="text-conflict-red font-mono text-xs uppercase tracking-[0.2em]">
            {error}
          </p>
        ) : null}
      </form>
    </GlassPanel>
  );
}
