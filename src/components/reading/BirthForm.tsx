"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CITIES, searchCities } from "@/data/cities";
import { geocodePlace } from "@/lib/geocoding";
import { cn } from "@/lib/classNames";

export interface BirthFormValues {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour)
  cityLabel: string;
  latitude: number;
  longitude: number;
}

interface FormState {
  date: string;
  time: string;
  cityLabel: string;
  latitudeText: string;
  longitudeText: string;
  selectedKey: string | null; // non-null once a place is chosen or hydrated
  manualMode: boolean;
  hydrated: boolean;
}

const DEFAULT_STATE: FormState = {
  date: "1989-08-19",
  time: "12:00",
  cityLabel: "",
  latitudeText: "",
  longitudeText: "",
  selectedKey: null,
  manualMode: false,
  hydrated: false,
};

function stateFromValues(values: BirthFormValues | null): FormState {
  if (!values) return { ...DEFAULT_STATE, hydrated: true };
  const matchedCity =
    CITIES.find((c) => `${c.name}, ${c.country}` === values.cityLabel) ?? null;
  const hasLatLng =
    typeof values.latitude === "number" && typeof values.longitude === "number";
  return {
    date: values.date,
    time: values.time,
    cityLabel: values.cityLabel,
    latitudeText: typeof values.latitude === "number" ? String(values.latitude) : "",
    longitudeText: typeof values.longitude === "number" ? String(values.longitude) : "",
    selectedKey: values.cityLabel ? `loaded:${values.cityLabel}` : null,
    manualMode: hasLatLng && matchedCity === null && values.cityLabel.length === 0,
    hydrated: true,
  };
}

/** A single row in the unified place dropdown. */
interface Suggestion {
  id: string;
  label: string; // primary place name, e.g. "Reykjavik"
  sublabel: string; // "Region, Country" or just country
  latitude: number;
  longitude: number;
  source: "curated" | "osm";
}

interface BirthFormProps {
  onSubmit: (values: BirthFormValues) => void;
  submitting?: boolean;
  initialValues?: BirthFormValues | null;
  submitLabel?: string;
}

type GeocodeStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

const GEOCODE_DEBOUNCE_MS = 350;

export function BirthForm({
  onSubmit,
  submitting = false,
  initialValues = null,
  submitLabel,
}: BirthFormProps) {
  const formId = useId();
  const listboxId = `${formId}-places`;
  const [state, setState] = useState<FormState>(() =>
    initialValues ? stateFromValues(initialValues) : DEFAULT_STATE,
  );
  const [error, setError] = useState<string | null>(null);
  const [geocode, setGeocode] = useState<GeocodeStatus>({ kind: "idle" });
  const [osmResults, setOsmResults] = useState<readonly Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(stateFromValues(initialValues));
  }, [initialValues]);

  useEffect(() => {
    // Cancel any in-flight geocode on unmount.
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Debounced world search. Runs only while the user is actively typing an
  // unselected query (selectedKey === null).
  useEffect(() => {
    if (state.manualMode || !state.hydrated || state.selectedKey !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGeocode({ kind: "idle" });
      return;
    }
    const query = state.cityLabel.trim();
    if (query.length < 3) {
      setGeocode({ kind: "idle" });
      setOsmResults([]);
      return;
    }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setGeocode({ kind: "loading" });
    const timer = window.setTimeout(async () => {
      try {
        const results = await geocodePlace(query, controller.signal);
        if (controller.signal.aborted) return;
        setOsmResults(
          results.map((g) => ({
            id: `o:${g.latitude.toFixed(3)},${g.longitude.toFixed(3)}`,
            label: g.name,
            sublabel: g.context || g.country,
            latitude: g.latitude,
            longitude: g.longitude,
            source: "osm" as const,
          })),
        );
        setGeocode({ kind: "ready" });
      } catch {
        if (controller.signal.aborted) return;
        setGeocode({
          kind: "error",
          message: "Could not reach the map. Try again, or enter coordinates manually.",
        });
      }
    }, GEOCODE_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state.cityLabel, state.manualMode, state.hydrated, state.selectedKey]);

  const patch = (partial: Partial<FormState>) => {
    setState((curr) => ({ ...curr, ...partial }));
  };

  // One unified, deduplicated, ranked list: fast curated cities first, then the
  // live OpenStreetMap results, with near-duplicates removed.
  const suggestions = useMemo<Suggestion[]>(() => {
    const query = state.cityLabel.trim();
    if (query.length < 2 || state.selectedKey !== null) return [];
    const out: Suggestion[] = [];
    const seen = new Set<string>();
    for (const c of searchCities(query)) {
      const key = `${c.name.toLowerCase()}|${c.country.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `c:${key}`,
        label: c.name,
        sublabel: c.country,
        latitude: c.latitude,
        longitude: c.longitude,
        source: "curated",
      });
    }
    for (const g of osmResults) {
      const dup = out.some(
        (s) =>
          s.label.toLowerCase() === g.label.toLowerCase() &&
          Math.abs(s.latitude - g.latitude) < 0.5 &&
          Math.abs(s.longitude - g.longitude) < 0.5,
      );
      if (dup || seen.has(g.id)) continue;
      seen.add(g.id);
      out.push(g);
    }
    return out.slice(0, 10);
  }, [osmResults, state.cityLabel, state.selectedKey]);

  const selectSuggestion = (s: Suggestion) => {
    const label = s.sublabel ? `${s.label}, ${s.sublabel}` : s.label;
    patch({
      cityLabel: label,
      latitudeText: String(s.latitude),
      longitudeText: String(s.longitude),
      manualMode: false,
      selectedKey: `sel:${label}`,
    });
    setError(null);
    setGeocode({ kind: "idle" });
    setOpen(false);
    setActiveIndex(-1);
  };

  const query = state.cityLabel.trim();
  const noMatch =
    open &&
    state.selectedKey === null &&
    geocode.kind === "ready" &&
    suggestions.length === 0 &&
    query.length >= 3;
  const showDropdown =
    state.hydrated &&
    !state.manualMode &&
    open &&
    state.selectedKey === null &&
    (suggestions.length > 0 ||
      geocode.kind === "loading" ||
      geocode.kind === "error" ||
      noMatch);

  const onCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        const choice = suggestions[activeIndex];
        if (choice) selectSuggestion(choice);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!state.date) {
      setError("Please enter a birth date.");
      return;
    }
    if (!state.time) {
      setError("Please enter a birth time (use 12:00 if unknown).");
      return;
    }

    const lat = Number(state.latitudeText);
    const lon = Number(state.longitudeText);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setError("Choose a birthplace from the list, or enter coordinates manually.");
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      setError("Choose a birthplace from the list, or enter coordinates manually.");
      return;
    }
    const label = state.cityLabel.trim() || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

    onSubmit({
      date: state.date,
      time: state.time,
      cityLabel: label,
      latitude: lat,
      longitude: lon,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <Field id={`${formId}-date`} label="Birth date">
          <input
            id={`${formId}-date`}
            type="date"
            value={state.date}
            onChange={(e) => patch({ date: e.target.value })}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            required
          />
        </Field>
        <Field id={`${formId}-time`} label="Birth time">
          <input
            id={`${formId}-time`}
            type="time"
            value={state.time}
            onChange={(e) => patch({ time: e.target.value })}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            required
          />
        </Field>
      </div>
      <p className="text-ink-tertiary font-body text-xs">
        If you do not know your birth time, use 12:00. The Sun, planets, and aspects will be accurate within a few minutes of arc. The Moon position and the Ascendant are more sensitive to time and will be approximate.
      </p>

      {!state.manualMode ? (
        <div className="relative">
          <Field id={`${formId}-city`} label="Birthplace">
            <input
              id={`${formId}-city`}
              type="text"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                showDropdown && activeIndex >= 0
                  ? `${listboxId}-opt-${activeIndex}`
                  : undefined
              }
              value={state.cityLabel}
              onChange={(e) => {
                patch({ cityLabel: e.target.value, selectedKey: null });
                setOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => {
                if (state.selectedKey === null && state.cityLabel.trim().length >= 2) {
                  setOpen(true);
                }
              }}
              onBlur={() => setOpen(false)}
              onKeyDown={onCityKeyDown}
              placeholder="Start typing a city: Toledo, Tbilisi, Reykjavik..."
              autoComplete="off"
              className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            />
          </Field>
          {showDropdown ? (
            <div
              id={listboxId}
              role="listbox"
              // Keep the input focused when an option is clicked so onBlur does
              // not fire before onClick.
              onMouseDown={(e) => e.preventDefault()}
              className="border-gold-soft bg-bg-deep absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-xl border shadow-2xl"
            >
              {suggestions.length > 0 ? (
                <ul className="p-1">
                  {suggestions.map((s, idx) => (
                    <li key={s.id}>
                      <button
                        id={`${listboxId}-opt-${idx}`}
                        type="button"
                        role="option"
                        aria-selected={idx === activeIndex}
                        onClick={() => selectSuggestion(s)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          "flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                          idx === activeIndex
                            ? "bg-gold-leaf/10 text-ink-primary"
                            : "text-ink-primary hover:bg-gold-leaf/5",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-display text-base">{s.label}</span>
                          {s.sublabel ? (
                            <span className="text-ink-secondary font-body ml-2 text-sm">
                              {s.sublabel}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-ink-tertiary font-mono shrink-0 text-[10px] tracking-[0.1em]">
                          {s.latitude.toFixed(1)}°, {s.longitude.toFixed(1)}°
                        </span>
                      </button>
                    </li>
                  ))}
                  {geocode.kind === "loading" ? (
                    <li className="text-ink-tertiary font-mono px-3 py-2 text-[10px] uppercase tracking-[0.25em]">
                      Searching the map...
                    </li>
                  ) : null}
                </ul>
              ) : geocode.kind === "loading" ? (
                <div className="text-ink-tertiary font-mono px-3 py-3 text-[10px] uppercase tracking-[0.25em]">
                  Searching the map...
                </div>
              ) : noMatch ? (
                <div className="px-3 py-3">
                  <p className="text-ink-secondary font-body text-sm">
                    No place matched &ldquo;{query}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      patch({ manualMode: true });
                    }}
                    className="text-gold-leaf font-mono mt-2 text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
                  >
                    Enter coordinates manually →
                  </button>
                </div>
              ) : geocode.kind === "error" ? (
                <div className="text-conflict-red font-mono px-3 py-3 text-[10px] uppercase tracking-[0.25em]">
                  {geocode.message}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
              Selected:{" "}
              {state.latitudeText && state.longitudeText
                ? `${Number(state.latitudeText).toFixed(3)}°, ${Number(state.longitudeText).toFixed(3)}°`
                : "none"}
            </p>
            <button
              type="button"
              onClick={() => patch({ manualMode: true })}
              className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              Enter coordinates manually
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4">
            <Field id={`${formId}-lat`} label="Latitude (north positive)">
              <input
                id={`${formId}-lat`}
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={state.latitudeText}
                onChange={(e) => patch({ latitudeText: e.target.value })}
                placeholder="35.1495"
                className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
                required
              />
            </Field>
            <Field id={`${formId}-lon`} label="Longitude (east positive)">
              <input
                id={`${formId}-lon`}
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={state.longitudeText}
                onChange={(e) => patch({ longitudeText: e.target.value })}
                placeholder="-90.049"
                className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
                required
              />
            </Field>
          </div>
          <Field id={`${formId}-cityLabel`} label="Place name (optional, for the reading)">
            <input
              id={`${formId}-cityLabel`}
              type="text"
              value={state.cityLabel}
              onChange={(e) => patch({ cityLabel: e.target.value })}
              placeholder="A label that will appear in your reading"
              className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary mt-4 w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            />
          </Field>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => patch({ manualMode: false })}
              className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              Back to place search
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors",
          submitting && "cursor-not-allowed opacity-60",
        )}
      >
        {submitting ? "Casting" : (submitLabel ?? "Cast the chart")}
        {!submitting ? <span aria-hidden>→</span> : null}
      </button>

      {error ? (
        <p role="alert" className="text-conflict-red font-mono text-xs uppercase tracking-[0.2em]">
          {error}
        </p>
      ) : null}
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

function Field({ id, label, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-ink-secondary font-mono mb-2 block text-[10px] uppercase tracking-[0.25em]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
