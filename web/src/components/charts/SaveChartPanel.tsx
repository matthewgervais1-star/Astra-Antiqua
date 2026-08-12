"use client";

import { useState } from "react";
import {
  RELATIONSHIP_LABELS,
  upsertChart,
  type ChartRelationship,
  type SavedChartInputs,
} from "@/lib/savedCharts";
import type { BirthFormValues } from "@/components/reading/BirthForm";
import { mirrorChartToServer, useAuth } from "@/components/auth/AuthProvider";

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
  const { status } = useAuth();
  const [name, setName] = useState(initialName);
  const [relationship, setRelationship] =
    useState<ChartRelationship>(initialRelationship);
  const [primary, setPrimary] = useState<boolean>(initialPrimary);
  const [saved, setSaved] = useState<SavedChartInputs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Give this chart a name, for example Me, Sarah, or Mom.");
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
      await mirrorChartToServer(result, status);
    } catch {
      setError("Could not save. Local storage may be unavailable in this browser.");
    }
  };

  if (saved) {
    return (
      <div className="border border-[var(--accent)] px-6 py-6 md:px-7 md:py-7">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
          SAVED
        </div>
        <h4 className="mt-2 font-display text-[19px] tracking-[0.04em] text-bone md:text-[22px]">
          {saved.name.toUpperCase()} IS NOW ON YOUR CHARTS LIST.
        </h4>
        <p className="mt-2 font-body text-[14px] leading-[1.6] text-prose md:text-[15px]">
          {saved.primary
            ? "Marked as your primary chart. The home page reads each day against it."
            : "Saved as a secondary chart. Set it primary any time from the charts page."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule px-6 py-6 md:px-7 md:py-7">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
        SAVE THIS CHART
      </div>
      <p className="mt-2 font-body text-[14px] leading-[1.6] text-prose">
        Stored only in this browser. Used by your charts, synastry, and long transits.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div>
          <label
            htmlFor="save-chart-name"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-dim"
          >
            Chart name
          </label>
          <input
            id="save-chart-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Me, Sarah, Mom"
            className="w-full border border-rule bg-transparent px-4 py-3 font-body text-[16px] text-bone outline-none transition-colors focus:border-[var(--accent)]"
            required
          />
        </div>
        <div>
          <label
            htmlFor="save-chart-rel"
            className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-dim"
          >
            Relationship
          </label>
          <select
            id="save-chart-rel"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as ChartRelationship)}
            className="w-full border border-rule bg-transparent px-4 py-3 font-body text-[16px] text-bone outline-none transition-colors focus:border-[var(--accent)]"
          >
            {(Object.entries(RELATIONSHIP_LABELS) as [ChartRelationship, string][]).map(
              ([key, label]) => (
                <option key={key} value={key} className="bg-[var(--ground)]">
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-3 font-body text-[14px] text-prose">
          <input
            type="checkbox"
            checked={primary}
            onChange={(e) => setPrimary(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Set as my primary chart (used by the home page personalization)
        </label>
        <button
          type="submit"
          className="mt-2 inline-flex items-center justify-center gap-2 border border-[var(--accent)] px-6 py-3 font-display text-[12px] uppercase tracking-[0.2em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
        >
          {existingId ? "UPDATE SAVED CHART" : "SAVE CHART"}
          <span aria-hidden>→</span>
        </button>
        {error ? (
          <p role="alert" className="font-mono text-[11px] uppercase tracking-[0.2em] text-conflict">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
