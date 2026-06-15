"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import {
  CULTURES,
  CULTURE_LABELS,
  type Culture,
} from "@/data/cultures";
import { waitListSchema, type WaitListInput } from "@/lib/waitlistSchema";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { usePrefersReducedMotion } from "@/lib/reducedMotion";
import { cn } from "@/lib/classNames";

interface WaitListFormProps {
  compact?: boolean;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; persisted: boolean; duplicate: boolean }
  | { kind: "error"; message: string };

export function WaitListForm({ compact = false }: WaitListFormProps) {
  const reduce = usePrefersReducedMotion();
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
      const data = (await res.json()) as
        | { ok: true; persisted: boolean; duplicate?: boolean }
        | { ok: false; error: string };
      if (!res.ok || !data.ok) {
        const message = data && "error" in data && data.error ? data.error : "Submission failed.";
        setState({ kind: "error", message });
        return;
      }
      setState({ kind: "success", persisted: data.persisted, duplicate: data.duplicate ?? false });
      reset();
    } catch {
      setState({ kind: "error", message: "Network error. Please try again." });
    }
  });

  const isSuccess = state.kind === "success";

  return (
    <GlassPanel tone="solid" className={cn("p-6 md:p-8")}>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.4 }}
          >
            <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
              {state.kind === "success" && state.duplicate ? "Already on the list" : "You are on the list"}
            </div>
            <h3 className="font-display text-ink-primary mt-3 text-2xl md:text-3xl">
              {state.kind === "success" && state.duplicate
                ? "You were already here. Nothing more to do."
                : "The signal will reach you when the build is ready."}
            </h3>
            <p className="text-ink-secondary font-body mt-4 text-base leading-relaxed">
              One short email at launch. No newsletter. No drip sequence.
            </p>
            {!state.persisted ? (
              <p className="text-ink-tertiary font-mono mt-6 text-[10px] uppercase tracking-[0.25em]">
                Note: this preview deployment captures entries in logs only.
              </p>
            ) : null}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.01 : 0.3 }}
            className="flex flex-col gap-5"
            noValidate
          >
            <div>
              <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
                Wait list
              </div>
              <h3 className="font-display text-ink-primary mt-2 text-2xl md:text-3xl">
                Be told when it lands.
              </h3>
            </div>

            <Field
              id="wl-email"
              label="Email"
              error={errors.email?.message}
              required
            >
              <input
                id="wl-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
                className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
              />
            </Field>

            {compact ? null : (
              <>
                <Field id="wl-name" label="Name (optional)" error={errors.name?.message}>
                  <input
                    id="wl-name"
                    type="text"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                    className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
                  />
                </Field>

                <Field
                  id="wl-pantheon"
                  label="Pantheon preference (optional)"
                  error={errors.pantheon?.message}
                >
                  <select
                    id="wl-pantheon"
                    aria-invalid={Boolean(errors.pantheon)}
                    {...register("pantheon")}
                    className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
                  >
                    <option value="">No preference</option>
                    {CULTURES.map((c) => (
                      <option key={c} value={c as Culture}>
                        {CULTURE_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  id="wl-background"
                  label="Classics or religious-studies background? (optional)"
                  error={errors.background?.message}
                >
                  <textarea
                    id="wl-background"
                    rows={3}
                    aria-invalid={Boolean(errors.background)}
                    {...register("background")}
                    className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
                  />
                </Field>
              </>
            )}

            <button
              type="submit"
              disabled={state.kind === "submitting"}
              className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state.kind === "submitting" ? "Sending" : "Join the wait list"}
              {state.kind !== "submitting" ? <span aria-hidden>→</span> : null}
            </button>

            {state.kind === "error" ? (
              <p
                role="alert"
                className="text-conflict-red font-mono text-xs uppercase tracking-[0.2em]"
              >
                {state.message}
              </p>
            ) : null}

            <p className="text-ink-tertiary font-body text-xs">
              Your email is recorded once and used only to notify you when the app is ready.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ id, label, error, required, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-ink-secondary font-mono mb-2 block text-[10px] uppercase tracking-[0.25em]"
      >
        {label}
        {required ? <span className="text-gold-leaf ml-1">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-conflict-red font-mono mt-2 text-[11px] uppercase tracking-[0.2em]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
