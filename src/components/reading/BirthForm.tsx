"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CITIES, searchCities, type CityEntry } from "@/data/cities";
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
  city: CityEntry | null;
  manualMode: boolean;
  hydrated: boolean;
}

const DEFAULT_STATE: FormState = {
  date: "1989-08-19",
  time: "12:00",
  cityLabel: "",
  latitudeText: "",
  longitudeText: "",
  city: null,
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
    city: matchedCity,
    manualMode: hasLatLng && matchedCity === null,
    hydrated: true,
  };
}

interface BirthFormProps {
  onSubmit: (values: BirthFormValues) => void;
  submitting?: boolean;
  initialValues?: BirthFormValues | null;
  submitLabel?: string;
}

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

  useEffect(() => {
    // Mark hydrated post-mount so suggestion list and "selected coords" UI can
    // render without hydration mismatch. If initialValues changes (e.g. user
    // navigates between saved charts), re-seed the form.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(stateFromValues(initialValues));
  }, [initialValues]);

  const patch = (partial: Partial<FormState>) => {
    setState((curr) => ({ ...curr, ...partial }));
  };

  const suggestions = useMemo(() => {
    if (state.city && state.cityLabel === `${state.city.name}, ${state.city.country}`) {
      return [];
    }
    return searchCities(state.cityLabel);
  }, [state.city, state.cityLabel]);

  const handleSelectCity = (entry: CityEntry) => {
    patch({
      city: entry,
      cityLabel: `${entry.name}, ${entry.country}`,
      latitudeText: String(entry.latitude),
      longitudeText: String(entry.longitude),
      manualMode: false,
    });
    setError(null);
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
              onChange={(e) => patch({ cityLabel: e.target.value, city: null })}
              placeholder="Memphis, Carthage, Athens, your hometown..."
              autoComplete="off"
              className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            />
          </Field>
          {state.hydrated && suggestions.length > 0 ? (
            <ul className="border-gold-soft bg-bg-deep absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-xl border p-1 shadow-2xl">
              {suggestions.map((entry) => (
                <li key={`${entry.name}-${entry.country}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectCity(entry)}
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
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-ink-tertiary font-mono text-[10px] uppercase tracking-[0.25em]">
              Selected: {state.city ? `${state.city.latitude.toFixed(3)}°, ${state.city.longitude.toFixed(3)}°` : state.latitudeText && state.longitudeText ? `${Number(state.latitudeText).toFixed(3)}°, ${Number(state.longitudeText).toFixed(3)}°` : "none"}
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
              onClick={() => patch({ manualMode: false, city: null })}
              className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.25em] underline-offset-4 hover:underline"
            >
              Back to city picker
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
