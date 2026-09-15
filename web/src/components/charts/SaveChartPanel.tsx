"use client";

import { useState } from "react";
import { Badge } from "@/components/chrome/Badge";
import { Button } from "@/components/chrome/Button";
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
      <div className="border border-rule-active px-6 py-6 md:px-7 md:py-7">
        <Badge tone="accent">SAVED</Badge>
        <h4 className="mt-2 font-display text-display-s tracking-display text-bone md:text-display-s">
          {saved.name.toUpperCase()} IS NOW ON YOUR CHARTS LIST.
        </h4>
        <p className="mt-2 font-body text-prose-s leading-prose text-prose md:text-prose-s">
          {saved.primary
            ? "Marked as your primary chart. The home page reads each day against it."
            : "Saved as a secondary chart. Set it primary any time from the charts page."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule px-6 py-6 md:px-7 md:py-7">
      <div className="font-mono text-data-xs uppercase tracking-microcopy text-dim">
        SAVE THIS CHART
      </div>
      <p className="mt-2 font-body text-prose-s leading-prose text-prose">
        Stored only in this browser. Used by your charts, synastry, and long transits.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div>
          <label
            htmlFor="save-chart-name"
            className="mb-2 block font-mono text-data-xs uppercase tracking-microcopy text-dim"
          >
            Chart name
          </label>
          <input
            id="save-chart-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Me, Sarah, Mom"
            className="w-full border border-rule bg-transparent px-4 py-3 font-body text-prose-m text-bone outline-none focus:border-rule-active"
            required
          />
        </div>
        <div>
          <label
            htmlFor="save-chart-rel"
            className="mb-2 block font-mono text-data-xs uppercase tracking-microcopy text-dim"
          >
            Relationship
          </label>
          <select
            id="save-chart-rel"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as ChartRelationship)}
            className="w-full border border-rule bg-transparent px-4 py-3 font-body text-prose-m text-bone outline-none focus:border-rule-active"
          >
            {(Object.entries(RELATIONSHIP_LABELS) as [ChartRelationship, string][]).map(
              ([key, label]) => (
                <option key={key} value={key} className="bg-ground">
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-3 font-body text-prose-s text-prose">
          <input
            type="checkbox"
            checked={primary}
            onChange={(e) => setPrimary(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Set as my primary chart (used by the home page personalization)
        </label>
        <Button type="submit" variant="votive" className="mt-2">
          {existingId ? "UPDATE SAVED CHART" : "SAVE CHART"}
          <span aria-hidden>→</span>
        </Button>
        {error ? (
          <p role="alert" className="font-mono text-data-xs uppercase tracking-microcopy text-conflict">
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
