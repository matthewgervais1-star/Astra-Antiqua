"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthOnboardingLayout } from "@/components/auth/AuthOnboardingLayout";
import { safeNextPath } from "@/lib/auth/nextPath";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, status } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Once the form starts a submit, it owns the post-auth navigation: signUp()
  // flips status to "authenticated" before onSubmit resumes, so without this
  // guard the effect below would race it and skip the success splash.
  const formOwnsRedirect = useRef(false);

  useEffect(() => {
    if (formOwnsRedirect.current) return;
    if (status === "authenticated") router.replace(safeNextPath());
  }, [status, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formOwnsRedirect.current = true;
    setError(null);
    if (password !== confirm) {
      formOwnsRedirect.current = false;
      setError("The two passwords do not match.");
      return;
    }
    setSubmitting(true);
    const result = await signUp(email, password, displayName.trim() || undefined);
    setSubmitting(false);
    if (!result.ok) {
      formOwnsRedirect.current = false;
      setError(result.error ?? "Sign up failed.");
      return;
    }
    const next = safeNextPath();
    router.push(`/onboarding/success?next=${encodeURIComponent(next)}`);
  };

  return (
    <AuthOnboardingLayout
      eyebrow="Create an account"
      title="Keep your charts beside you."
      body="Your account lets you return to the same readings, save new charts, and carry your work from one device to the next. It is simple, private, and built for the long view."
      benefits={[
        {
          title: "Keep your readings",
          body: "Save charts and return to them whenever the sky turns again.",
        },
        {
          title: "Carry your work",
          body: "Your account travels with you, so the same chart remains available on any device.",
        },
        {
          title: "Stay in the record",
          body: "Every chart you save becomes part of your personal archive in the app.",
        },
      ]}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-gold-leaf underline-offset-4 hover:underline">
            Sign in.
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <Field id="signup-email" label="Email">
          <input
            id="signup-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          />
        </Field>
        <Field id="signup-name" label="Display name (optional)">
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          />
        </Field>
        <Field id="signup-password" label="Password (at least 8 characters)">
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          />
        </Field>
        <Field id="signup-confirm" label="Confirm password">
          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={confirm.length > 0 && password !== confirm}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          />
        </Field>
        {confirm.length > 0 && password !== confirm ? (
          <p className="text-conflict-red font-mono -mt-2 text-[11px] uppercase tracking-[0.2em]">
            The two passwords do not match yet.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting || status === "authenticated"}
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating" : status === "authenticated" ? "Already signed in" : "Create account"}
          {!submitting && status !== "authenticated" ? <span aria-hidden>→</span> : null}
        </button>
        {error ? (
          <p role="alert" className="text-conflict-red font-mono text-xs uppercase tracking-[0.2em]">
            {error}
          </p>
        ) : null}
        <p className="text-ink-tertiary font-body text-xs leading-relaxed">
          Charts you saved anonymously are uploaded to your account the first time you sign up. After that, every change you make is kept in your account.
        </p>
      </form>
    </AuthOnboardingLayout>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
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
