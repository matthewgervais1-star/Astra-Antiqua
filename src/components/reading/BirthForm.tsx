"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CITIES, searchCities, type CityEntry } from "@/data/cities";
import { geocodePlace, type GeocodeResult } from "@/lib/geocoding";
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
  selectedKey: string | null; // tracks the last selected city/geocode key
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
    selectedKey: matchedCity ? `curated:${matchedCity.name}|${matchedCity.country}` : `loaded:${values.cityLabel}`,
    manualMode: hasLatLng && matchedCity === null && values.cityLabel.length === 0,
    hydrated: true,
  };
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
  | { kind: "ready"; results: readonly GeocodeResult[] }
  | { kind: "error"; message: string };

const GEOCODE_DEBOUNCE_MS = 450;

export function BirthForm({
  onSubmit,
  submitting = false,
  initialValues = null,
  submitLabel,
}: BirthFormProps) {
  const formId = useId();
  const [state, setState] = useState<FormState>(() =>
    initialValues ? stateFromValues(initialValues) : DEFAULT_STATE,
  );
  const [error, setError] = useState<string | null>(null);
  const [geocode, setGeocode] = useState<GeocodeStatus>({ kind: "idle" });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(stateFromValues(initialValues));
  }, [initialValues]);

  useEffect(() => {
    // Cancel any in-flight geocode when query changes or component unmounts.
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (state.manualMode || !state.hydrated) return;
    const query = state.cityLabel.trim();
    // If the current label corresponds to a just-selected suggestion, no need
    // to re-search.
    if (
      state.selectedKey &&
      state.selectedKey.startsWith("curated:") &&
      query.length > 0
    ) {
      const [, label] = state.selectedKey.split(":", 2);
      if (label === undefined) return;
      const matched = CITIES.find((c) => `${c.name}, ${c.country}` === label);
      if (matched && `${matched.name}, ${matched.country}` === query) return;
    }
    if (
      state.selectedKey?.startsWith("geo:") &&
      state.selectedKey.includes(query)
    ) {
      return;
    }
    if (query.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGeocode({ kind: "idle" });
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
        setGeocode({ kind: "ready", results });
      } catch {
        if (controller.signal.aborted) return;
        setGeocode({
          kind: "error",
          message: "Could not reach the geocoder. Try again, or use manual coordinates.",
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

  const curatedSuggestions = useMemo(() => {
    return searchCities(state.cityLabel);
  }, [state.cityLabel]);

  const handleSelectCurated = (entry: CityEntry) => {
    patch({
      cityLabel: `${entry.name}, ${entry.country}`,
      latitudeText: String(entry.latitude),
      longitudeText: String(entry.longitude),
      manualMode: false,
      selectedKey: `curated:${entry.name}|${entry.country}`,
    });
    setError(null);
    setGeocode({ kind: "idle" });
  };

  const handleSelectGeocode = (entry: GeocodeResult) => {
    const label = entry.context
      ? `${entry.name}, ${entry.context}`
      : entry.name;
    patch({
      cityLabel: label,
      latitudeText: String(entry.latitude),
      longitudeText: String(entry.longitude),
      manualMode: false,
      selectedKey: `geo:${label}`,
    });
    setError(null);
    setGeocode({ kind: "idle" });
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
      setError("Latitude must be between -90 and 90.");
      return;
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      setError("Longitude must be between -180 and 180.");
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

  const geocodeResults = geocode.kind === "ready" ? geocode.results : [];
  const showDropdown =
    state.hydrated &&
    !state.manualMode &&
    (curatedSuggestions.length > 0 ||
      geocode.kind === "loading" ||
      geocodeResults.length > 0 ||
      geocode.kind === "error");

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
              value={state.cityLabel}
              onChange={(e) => patch({ cityLabel: e.target.value, selectedKey: null })}
              placeholder="Toledo, Ohio. Tbilisi. Reykjavik. Your hometown."
              autoComplete="off"
              className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            />
          </Field>
          {showDropdown ? (
            <div className="border-gold-soft bg-bg-deep absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-xl border shadow-2xl">
              {curatedSuggestions.length > 0 ? (
                <>
                  <div className="text-ink-tertiary font-mono px-3 pt-3 pb-1 text-[9px] uppercase tracking-[0.3em]">
                    Curated
                  </div>
                  <ul className="p-1">
                    {curatedSuggestions.map((entry) => (
                      <li key={`curated-${entry.name}-${entry.country}`}>
                        <button
                          type="button"
                          onClick={() => handleSelectCurated(entry)}
                          className="text-ink-primary hover:bg-gold-leaf/10 flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left"
                        >
                          <span className="font-display text-base">
                            {entry.name}
                            {entry.thematic ? (
                              <span className="text-gold-leaf font-mono ml-2 text-[9px] uppercase tracking-[0.25em]">
                                source
                              </span>
                            ) : null}
                          </span>
                          <span className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.2em]">
                            {entry.country}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {geocode.kind === "loading" ? (
                <div className="text-ink-tertiary font-mono border-border-hairline border-t px-3 py-3 text-[10px] uppercase tracking-[0.25em]">
                  Searching the world map...
                </div>
              ) : null}
              {geocode.kind === "ready" && geocodeResults.length > 0 ? (
                <>
                  <div className="text-ink-tertiary font-mono border-border-hairline border-t px-3 pt-3 pb-1 text-[9px] uppercase tracking-[0.3em]">
                    OpenStreetMap · {geocodeResults.length} place{geocodeResults.length === 1 ? "" : "s"}
                  </div>
                  <ul className="p-1">
                    {geocodeResults.map((entry, idx) => (
                      <li key={`geo-${entry.latitude.toFixed(3)}-${entry.longitude.toFixed(3)}-${idx}`}>
                        <button
                          type="button"
                          onClick={() => handleSelectGeocode(entry)}
                          className="text-ink-primary hover:bg-gold-leaf/10 flex w-full items-baseline justify-between gap-3 rounded-lg px-3 py-2 text-left"
                        >
                          <span className="min-w-0 flex-1 truncate font-display text-base">
                            {entry.name}
                            {entry.context ? (
                              <span className="text-ink-secondary font-body ml-2 text-sm">
                                {entry.context}
                              </span>
                            ) : null}
                          </span>
                          <span className="text-ink-tertiary font-mono shrink-0 text-[10px] tracking-[0.1em]">
                            {entry.latitude.toFixed(2)}°, {entry.longitude.toFixed(2)}°
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {geocode.kind === "ready" && geocodeResults.length === 0 && state.cityLabel.trim().length >= 3 ? (
                <div className="text-ink-tertiary font-mono border-border-hairline border-t px-3 py-3 text-[10px] uppercase tracking-[0.25em]">
                  No world places matched. Try a different spelling, or enter coordinates manually.
                </div>
              ) : null}
              {geocode.kind === "error" ? (
                <div className="text-conflict-red font-mono border-border-hairline border-t px-3 py-3 text-[10px] uppercase tracking-[0.25em]">
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
        {submitting ? "Computing" : (submitLabel ?? "Compute the chart")}
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
