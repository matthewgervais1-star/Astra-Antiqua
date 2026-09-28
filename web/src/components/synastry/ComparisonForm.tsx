"use client";

import { useState } from "react";
import { geocodePlace, GeocodeError, type GeocodeResult } from "@/lib/geocoding";
import type { ComparisonParty } from "@/lib/savedCharts";

/**
 * The second party in a comparison.
 *
 * What they type here is computed and then dropped. It is never written to
 * localStorage and never sent to the server, which is what keeps another
 * person's birth data out of a database they never agreed to be in. The
 * Android app's SynastryViewModel.compare has always worked this way; this
 * is the web side catching up.
 *
 * The place field searches on an explicit press rather than on every
 * keystroke. OpenStreetMap's Nominatim usage policy says autocomplete
 * "must not" be implemented against it, and a search button is also fewer
 * lookups for a field nobody types twice.
 */
export function ComparisonForm({
  onCompare,
  onClear,
  active,
}: {
  onCompare: (party: ComparisonParty) => void;
  onClear: () => void;
  active: boolean;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly GeocodeResult[]>([]);
  const [place, setPlace] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    setError(null);
    setResults([]);
    try {
      const found = await geocodePlace(query.trim());
      setResults(found);
      if (found.length === 0) setError("NO PLACE BY THAT NAME.");
    } catch (err) {
      setError(err instanceof GeocodeError ? err.message.toUpperCase() : "THE LOOKUP FAILED.");
    } finally {
      setSearching(false);
    }
  };

  const choose = (result: GeocodeResult) => {
    setPlace(result);
    setResults([]);
    setQuery(`${result.name}, ${result.context}`);
  };

  const ready = Boolean(date && time && place);

  const submit = () => {
    if (!place || !ready) return;
    onCompare({
      name: name.trim() || "Them",
      date,
      time,
      cityLabel: `${place.name}, ${place.context}`,
      latitude: place.latitude,
      longitude: place.longitude,
    });
  };

  const reset = () => {
    setName("");
    setDate("");
    setTime("");
    setQuery("");
    setPlace(null);
    setResults([]);
    setError(null);
    onClear();
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label="THEIR NAME">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="A name or a nickname"
          maxLength={120}
          className={INPUT}
        />
      </Field>

      <Field label="BIRTH DATE">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="BIRTH TIME">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={INPUT}
        />
      </Field>

      <Field label="BIRTH PLACE">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPlace(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void search();
              }
            }}
            placeholder="A city"
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => void search()}
            disabled={searching || query.trim().length < 2}
            className="border border-rule px-3 font-mono text-data-xs tracking-data text-dim hover:text-bone disabled:opacity-40"
          >
            {searching ? "..." : "FIND"}
          </button>
        </div>
        {results.length > 0 ? (
          <ul className="mt-2 flex flex-col border border-rule">
            {results.slice(0, 5).map((r) => (
              <li key={`${r.latitude},${r.longitude}`}>
                <button
                  type="button"
                  onClick={() => choose(r)}
                  className="w-full px-3 py-2 text-left font-mono text-data-xs leading-data text-dim hover:text-bone"
                >
                  {r.name}, {r.context}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {error ? (
          <p className="mt-2 font-mono text-data-xs text-conflict">{error}</p>
        ) : null}
      </Field>

      <button
        type="button"
        onClick={submit}
        disabled={!ready}
        className="border border-accent px-[var(--space-3)] py-3 font-mono text-data-xs tracking-data text-accent hover:bg-accent hover:text-ground disabled:border-rule disabled:text-dim disabled:hover:bg-transparent disabled:hover:text-dim"
      >
        WEIGH THE BONDS →
      </button>

      {active ? (
        <button
          type="button"
          onClick={reset}
          className="font-mono text-data-xs tracking-data text-dim hover:text-bone"
        >
          CLEAR
        </button>
      ) : null}

      <p className="font-mono text-data-xs leading-data text-dim">
        THEIR DETAILS ARE USED FOR THIS COMPARISON AND THEN DISCARDED. NOTHING ABOUT THEM IS SAVED.
      </p>
    </div>
  );
}

const INPUT =
  "w-full border border-rule bg-transparent px-3 py-2 font-mono text-data-xs text-bone outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-data-xs tracking-label text-dim">{label}</span>
      {children}
    </label>
  );
}
