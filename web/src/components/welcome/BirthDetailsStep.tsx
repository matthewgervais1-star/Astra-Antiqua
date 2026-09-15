"use client";

import { useEffect, useRef, useState } from "react";
import { geocodePlace, GeocodeError, type GeocodeResult } from "@/lib/geocoding";
import { upsertChart } from "@/lib/savedCharts";
import { Button } from "@/components/chrome/Button";

const GEOCODE_DEBOUNCE_MS = 350;

const INPUT_CLASS =
  "w-full border border-rule bg-transparent px-3 py-[var(--space-2)] font-mono text-data-s text-bone placeholder:text-faint-ink outline-none focus:border-rule-active";

const LABEL_CLASS = "mb-2 block font-mono text-data-xs tracking-label text-dim";

interface SelectedPlace {
  label: string;
  latitude: number;
  longitude: number;
}

/**
 * Step II of the welcome funnel: an optional, collapsible birth-details
 * form. Submitting saves a primary "Me" chart via savedCharts.upsertChart so
 * the reading surfaces have a natal profile to read against; skipping just
 * collapses the disclosure. Neither path blocks the funnel forward.
 */
export function BirthDetailsStep() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [selected, setSelected] = useState<SelectedPlace | null>(null);
  const [results, setResults] = useState<readonly GeocodeResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "error">("idle");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Debounced world search, same shape as reading/BirthForm.tsx: fires only
  // while the user is typing an unselected query.
  useEffect(() => {
    if (!open || selected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const query = cityQuery.trim();
    if (query.length < 3) {
      setResults([]);
      setSearchStatus("idle");
      return;
    }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setSearchStatus("loading");
    const timer = window.setTimeout(async () => {
      try {
        const found = await geocodePlace(query, controller.signal);
        if (controller.signal.aborted) return;
        setResults(found);
        setSearchStatus("idle");
      } catch (err) {
        if (controller.signal.aborted) return;
        setSearchStatus("error");
        setSearchError(
          err instanceof GeocodeError && err.userMessage
            ? err.userMessage
            : "Could not reach the map. Try again.",
        );
      }
    }, GEOCODE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [cityQuery, open, selected]);

  const pick = (r: GeocodeResult) => {
    const label = r.context ? `${r.name}, ${r.context}` : r.name;
    setSelected({ label, latitude: r.latitude, longitude: r.longitude });
    setCityQuery(label);
    setResults([]);
    setFormError(null);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    if (!date || !time) {
      setFormError("Enter a date and a time.");
      return;
    }
    if (!selected) {
      setFormError("Pick a birthplace from the list.");
      return;
    }
    upsertChart({
      name: "Me",
      relationship: "self",
      date,
      time,
      cityLabel: selected.label,
      latitude: selected.latitude,
      longitude: selected.longitude,
      primary: true,
    });
    setSaved(true);
  };

  return (
    <div className="mt-8 border-t border-rule pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left font-mono text-data-xs tracking-label text-dim hover:text-bone"
      >
        II OF III · ENTER THE BIRTH DETAILS {open ? "▴" : "▾"}
      </button>
      {open ? (
        saved ? (
          <p className="mt-5 font-mono text-data-xs tracking-data text-accent">
            ENTERED IN THE RECORD.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="welcome-date" className={LABEL_CLASS}>
                  DATE
                </label>
                <input
                  id="welcome-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="welcome-time" className={LABEL_CLASS}>
                  TIME
                </label>
                <input
                  id="welcome-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="welcome-city" className={LABEL_CLASS}>
                BIRTHPLACE
              </label>
              <input
                id="welcome-city"
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setCityQuery(value);
                  if (selected && value !== selected.label) setSelected(null);
                }}
                placeholder="Start typing a city…"
                autoComplete="off"
                className={INPUT_CLASS}
              />
              {!selected && cityQuery.trim().length >= 3 ? (
                <div className="mt-2 border border-rule">
                  {results.length > 0 ? (
                    results.map((r, idx) => (
                      <button
                        key={`${r.latitude},${r.longitude},${idx}`}
                        type="button"
                        onClick={() => pick(r)}
                        className="flex w-full items-baseline justify-between gap-3 border-b border-rule-row px-3 py-[var(--space-2)] text-left font-mono text-data-xs text-bone last:border-b-0 hover:bg-bone/5"
                      >
                        <span className="truncate">{r.name}</span>
                        <span className="shrink-0 text-faint-ink">{r.context || r.country}</span>
                      </button>
                    ))
                  ) : searchStatus === "loading" ? (
                    <div className="px-3 py-[var(--space-2)] font-mono text-data-xs text-faint-ink">
                      SEARCHING…
                    </div>
                  ) : searchStatus === "error" ? (
                    <div className="px-3 py-[var(--space-2)] font-mono text-data-xs text-conflict">
                      {(searchError ?? "").toUpperCase()}
                    </div>
                  ) : (
                    <div className="px-3 py-[var(--space-2)] font-mono text-data-xs text-faint-ink">
                      NO MATCH
                    </div>
                  )}
                </div>
              ) : null}
              {selected ? (
                <p className="mt-2 font-mono text-data-xs tracking-data text-faint-ink">
                  {selected.latitude.toFixed(2)}°, {selected.longitude.toFixed(2)}°
                </p>
              ) : null}
            </div>
            <Button type="submit" variant="votive" block>
              ENTER IT IN THE RECORD
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="self-start font-mono text-data-xs tracking-data text-dim underline decoration-dotted underline-offset-4 hover:text-bone"
            >
              SKIP · CAST LATER
            </button>
            {formError ? (
              <p role="alert" className="font-mono text-data-xs tracking-data text-conflict">
                {formError.toUpperCase()}
              </p>
            ) : null}
          </form>
        )
      ) : null}
    </div>
  );
}
