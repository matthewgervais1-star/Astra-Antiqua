"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Sign in failed.");
      return;
    }
    router.push("/");
  };

  return (
    <SectionContainer size="narrow" spacing="default">
      <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
        Sign in
      </div>
      <GoldText as="h1" className="mt-4 text-4xl leading-tight md:text-5xl">
        Return to the oracle.
      </GoldText>
      <p className="text-ink-secondary font-body mt-6 text-base leading-relaxed md:text-lg">
        Sign in to keep your saved charts available on any device. New here?{" "}
        <Link href="/sign-up" className="text-gold-leaf underline-offset-4 hover:underline">
          Create an account.
        </Link>
      </p>

      <GlassPanel tone="solid" className="mt-10 p-6 md:p-8">
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
