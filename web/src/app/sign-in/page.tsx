"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthOnboardingLayout } from "@/components/auth/AuthOnboardingLayout";
import { safeNextPath } from "@/lib/auth/nextPath";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Once the form starts a submit, it owns the post-auth navigation: signIn()
  // flips status to "authenticated" before onSubmit resumes, so without this
  // guard the effect below would race it and skip the success splash.
  const formOwnsRedirect = useRef(false);

  // An already-signed-in user landing here (history, stale link) is sent on
  // rather than parked at a disabled button.
  useEffect(() => {
    if (formOwnsRedirect.current) return;
    if (status === "authenticated") router.replace(safeNextPath());
  }, [status, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formOwnsRedirect.current = true;
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      formOwnsRedirect.current = false;
      setError(result.error ?? "Sign in failed.");
      return;
    }
    const next = safeNextPath();
    router.push(`/onboarding/success?next=${encodeURIComponent(next)}`);
  };

  return (
    <AuthOnboardingLayout
      eyebrow="Sign in"
      title="Return to the record."
      body="Pick up the same charts and readings where you left them. Your account keeps the work you have saved and makes it available again the next time you open the app."
      benefits={[
        {
          title: "Pick up where you left off",
          body: "Return to your saved charts and continue working without re-entering everything.",
        },
        {
          title: "Secure your archive",
          body: "Your readings stay with your account instead of living only in this browser.",
        },
        {
          title: "Move between devices",
          body: "The same account keeps your work available wherever you open Astra Antiqua.",
        },
      ]}
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="text-gold-leaf underline-offset-4 hover:underline">
            Create an account.
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <Field id="signin-email" label="Email">
          <input
            id="signin-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          />
        </Field>
        <Field id="signin-password" label="Password">
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          />
        </Field>
        <button
          type="submit"
          disabled={submitting || status === "authenticated"}
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-2 inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in" : status === "authenticated" ? "Already signed in" : "Sign in"}
          {!submitting && status !== "authenticated" ? <span aria-hidden>→</span> : null}
        </button>
        {error ? (
          <p role="alert" className="text-conflict-red font-mono text-xs uppercase tracking-[0.2em]">
            {error}
          </p>
        ) : null}
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
