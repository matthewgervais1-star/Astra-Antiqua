"use client";

import { useState } from "react";
import { Badge } from "@/components/chrome/Badge";
import { Button } from "@/components/chrome/Button";
import { writeChart, type SavedChartInputs } from "@/lib/savedCharts";
import type { BirthFormValues } from "@/components/reading/BirthForm";
import { mirrorChartToServer, useAuth } from "@/components/auth/AuthProvider";

/**
 * Keeps the reader's own chart.
 *
 * The relationship selector and the primary checkbox both went when the app
 * stopped keeping charts about other people. There is one chart, it is
 * yours, and casting again replaces it. Comparing against someone else is
 * done on the synastry page against details that are never stored.
 */
interface SaveChartPanelProps {
  values: BirthFormValues;
  initialName?: string;
  onSaved: (saved: SavedChartInputs) => void;
}

export function SaveChartPanel({ values, initialName = "", onSaved }: SaveChartPanelProps) {
  const { status } = useAuth();
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState<SavedChartInputs | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const result = writeChart({
        name: name.trim() || "Me",
        date: values.date,
        time: values.time,
        cityLabel: values.cityLabel,
        latitude: values.latitude,
        longitude: values.longitude,
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
          YOUR CHART IS KEPT.
        </h4>
        <p className="mt-2 font-body text-prose-s leading-prose text-prose md:text-prose-s">
          {status === "authenticated"
            ? "Stored in this browser and on your account, so it follows you to another device."
            : "Stored in this browser. Sign in and it follows you to another device."}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-rule px-6 py-6 md:px-7 md:py-7">
      <div className="font-mono text-data-xs uppercase tracking-microcopy text-dim">
        KEEP THIS CHART
      </div>
      <p className="mt-2 font-body text-prose-s leading-prose text-prose">
        Your own chart, read by the home page, the transits and the synastry weighing. Casting
        again replaces it.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
        <div>
          <label
            htmlFor="save-chart-name"
            className="mb-2 block font-mono text-data-xs uppercase tracking-microcopy text-dim"
          >
            What to call it
          </label>
          <input
            id="save-chart-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Me"
            className="w-full border border-rule bg-transparent px-4 py-3 font-body text-prose-m text-bone outline-none focus:border-rule-active"
          />
        </div>
        <Button type="submit" variant="votive" className="mt-2">
          KEEP MY CHART
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
