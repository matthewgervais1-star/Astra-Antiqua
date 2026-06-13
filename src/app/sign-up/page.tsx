"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { safeNextPath } from "@/lib/auth/nextPath";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, status } = useAuth();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace(safeNextPath());
  }, [status, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setSubmitting(true);
    const result = await signUp(email, password, displayName.trim() || undefined);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Sign up failed.");
      return;
    }
    router.push(safeNextPath());
  };

  return (
    <SectionContainer size="narrow" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Create an account
      </div>
      <GoldText as="h1" className="mt-4 text-4xl leading-tight md:text-5xl">
        Be named in the record.
      </GoldText>
      <p className="text-ink-secondary font-body mt-6 text-base leading-relaxed md:text-lg">
        Accounts keep your saved charts available across devices and reading sessions. The data is stored in this app&apos;s own database; we do not share it. Already have an account?{" "}
        <Link href="/sign-in" className="text-gold-leaf underline-offset-4 hover:underline">
          Sign in.
        </Link>
      </p>

      <GlassPanel tone="solid" className="mt-10 p-6 md:p-8">
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
              className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
            />
          </Field>
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
            Any charts you have already saved as an anonymous user will be uploaded to your account automatically on first sign-up. After that, every change you make from any device is synced.
          </p>
        </form>
      </GlassPanel>
    </SectionContainer>
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
