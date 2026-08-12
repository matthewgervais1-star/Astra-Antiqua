"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CULTURES, CULTURE_LABELS } from "@/data/cultures";
import { waitListSchema, type WaitListInput } from "@/lib/waitlistSchema";
import { cn } from "@/lib/classNames";

export interface WaitListFormProps {
  /** Email-only form (the standalone /waitlist page). When false, also
   * collects the optional name/culture/background fields. */
  compact?: boolean;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; position: number }
  | { kind: "error"; message: string };

type WaitListResponse =
  | { ok: true; persisted: boolean; duplicate: boolean; position: number }
  | { ok: false; error: string };

/** 1ST, 2ND, 3RD, 4TH, and the teens that break the pattern. */
function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}TH`;
  const suffix = { 1: "ST", 2: "ND", 3: "RD" }[n % 10] ?? "TH";
  return `${n}${suffix}`;
}

const INPUT_CLASS =
  "w-full border border-rule bg-transparent px-3.5 py-3 font-mono text-[11px] tracking-[0.04em] text-bone placeholder:text-faint-ink outline-none transition-colors focus:border-[var(--accent)]";

export function WaitListForm({ compact = false }: WaitListFormProps) {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitListInput>({
    resolver: zodResolver(waitListSchema),
    defaultValues: { email: "", name: "", pantheon: undefined, background: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/wait-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as WaitListResponse;
      if (!res.ok || !data.ok) {
        const message = !data.ok && data.error ? data.error : "The roll did not open. Try again.";
        setState({ kind: "error", message });
        return;
      }
      setState({ kind: "success", position: data.position });
      reset();
    } catch {
      setState({ kind: "error", message: "The roll did not open. Try again." });
    }
  });

  if (state.kind === "success") {
    return (
      <div className="font-mono text-[11px] tracking-[0.08em] text-dim">
        YOU ARE {ordinal(state.position)} ON THE ROLL · WE EMAIL ONCE, WHEN CALLED
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="wl-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="scribe@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
          className={cn(INPUT_CLASS, "sm:flex-1")}
        />
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="border border-[var(--accent)] px-[18px] py-3 font-display text-[10.5px] tracking-[0.14em] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.kind === "submitting" ? "ENTERING" : "ENTER"}
        </button>
      </div>
      {errors.email ? (
        <p role="alert" className="font-mono text-[11px] tracking-[0.06em] text-conflict">
          {errors.email.message}
        </p>
      ) : null}

      {compact ? null : (
        <div className="flex flex-col gap-4">
          <Field id="wl-name" label="NAME (OPTIONAL)" error={errors.name?.message}>
            <input
              id="wl-name"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
              className={INPUT_CLASS}
            />
          </Field>

          <Field id="wl-pantheon" label="CULTURE PREFERENCE (OPTIONAL)" error={errors.pantheon?.message}>
            <select
              id="wl-pantheon"
              aria-invalid={Boolean(errors.pantheon)}
              {...register("pantheon")}
              className={cn(INPUT_CLASS, "appearance-none")}
            >
              <option value="">NO PREFERENCE</option>
              {CULTURES.map((c) => (
                <option key={c} value={c}>
                  {CULTURE_LABELS[c].toUpperCase()}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="wl-background"
            label="CLASSICS OR RELIGIOUS-STUDIES BACKGROUND? (OPTIONAL)"
            error={errors.background?.message}
          >
            <textarea
              id="wl-background"
              rows={3}
              aria-invalid={Boolean(errors.background)}
              {...register("background")}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      )}

      {state.kind === "error" ? (
        <p role="alert" className="font-mono text-[11px] tracking-[0.06em] text-conflict">
          {state.message}
        </p>
      ) : null}

      <p className="font-mono text-[10.5px] tracking-[0.08em] text-dim">WE EMAIL ONCE, WHEN CALLED</p>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-mono text-[11px] tracking-[0.14em] text-dim">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="font-mono text-[11px] tracking-[0.06em] text-conflict">
          {error}
        </p>
      ) : null}
    </div>
  );
}
