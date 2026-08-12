"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { safeNextPath } from "@/lib/auth/nextPath";
import { cn } from "@/lib/classNames";

type Mode = "signin" | "signup";

const INPUT_CLASS =
  "w-full border border-rule bg-transparent px-4 py-3 font-mono text-[12px] text-bone placeholder:text-faint-ink outline-none focus:border-[var(--accent)]";
const LABEL_CLASS = "mb-2 block text-left font-mono text-[11px] tracking-[0.14em] text-dim";
const AUTH_FAILURE = "THE RECORD DOES NOT ANSWER. CHECK THE EMAIL OR THE PASSWORD.";

/**
 * The account entry point. Auth stays email+password (no mailer exists to
 * send a one-time code, so the mock's "one-time code" copy never ships
 * here); the honest note below the form says exactly what is stored.
 * Mode is settable via ?mode=new, read from window.location on mount rather
 * than useSearchParams so this page needs no Suspense boundary.
 */
export default function SignInPage() {
  const router = useRouter();
  const { signIn, signUp, status } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [continueHref, setContinueHref] = useState("/");
  // Once the form starts a submit, it owns the post-auth navigation: signIn()
  // / signUp() flip status to "authenticated" before onSubmit resumes, so
  // without this guard the effect below would race it.
  const formOwnsRedirect = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.get("mode") === "new") setMode("signup");
    setContinueHref(safeNextPath("/"));
  }, []);

  useEffect(() => {
    if (formOwnsRedirect.current) return;
    if (status === "authenticated") router.replace(safeNextPath());
  }, [status, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && password !== confirm) {
      setError("THE TWO PASSWORDS DO NOT AGREE.");
      return;
    }
    formOwnsRedirect.current = true;
    setSubmitting(true);
    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, displayName.trim() || undefined);
    setSubmitting(false);
    if (!result.ok) {
      formOwnsRedirect.current = false;
      setError(AUTH_FAILURE);
      return;
    }
    router.replace(safeNextPath("/"));
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[460px] flex-col items-center justify-center px-5 py-16">
      <div className="w-full border border-rule px-7 py-10 text-center sm:px-10">
        <div className="font-mono text-[11px] tracking-[0.18em] text-dim">THE RECORD</div>
        <div className="mx-auto mt-5 h-px w-11 bg-[var(--accent)]" />
        <h1 className="mt-5 font-display text-[19px] leading-[1.5] tracking-[0.1em] text-bone">
          AN ACCOUNT ADDS SYNC,
          <br />
          NOTHING ELSE
        </h1>
        <p className="mx-auto mt-4 max-w-[340px] font-body text-[14px] leading-[1.65] text-prose">
          Your voice, charts and feedback already live on this device. Sign in only to carry
          them to another.
        </p>

        <div className="mx-auto mt-7 flex max-w-[340px] border-b border-rule">
          <button
            type="button"
            onClick={() => setMode("signin")}
            aria-pressed={mode === "signin"}
            className={cn(
              "flex-1 border-b py-2 text-center font-mono text-[11px] tracking-[0.14em]",
              mode === "signin"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-dim hover:text-bone",
            )}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            aria-pressed={mode === "signup"}
            className={cn(
              "flex-1 border-b py-2 text-center font-mono text-[11px] tracking-[0.14em]",
              mode === "signup"
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-dim hover:text-bone",
            )}
          >
            FIRST ENTRY
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mx-auto mt-6 flex max-w-[340px] flex-col gap-4 text-left"
        >
          <div>
            <label htmlFor="signin-email" className={LABEL_CLASS}>
              EMAIL
            </label>
            <input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="signin-password" className={LABEL_CLASS}>
              PASSWORD
            </label>
            <input
              id="signin-password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={mode === "signup" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          {mode === "signup" ? (
            <>
              <div>
                <label htmlFor="signin-confirm" className={LABEL_CLASS}>
                  CONFIRM
                </label>
                <input
                  id="signin-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="signin-name" className={LABEL_CLASS}>
                  DISPLAY NAME (OPTIONAL)
                </label>
                <input
                  id="signin-name"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </>
          ) : null}

          <button
            type="submit"
            disabled={submitting || status === "authenticated"}
            className="mt-1 border border-[var(--accent)] py-[13px] text-center font-display text-[12px] tracking-[0.2em] text-[var(--accent)] hover:bg-bone/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? mode === "signin"
                ? "OPENING…"
                : "ENTERING…"
              : mode === "signin"
                ? "OPEN THE RECORD"
                : "ENTER THE RECORD"}
          </button>

          {error ? (
            <p role="alert" className="text-center font-mono text-[11px] tracking-[0.06em] text-conflict">
              {error}
            </p>
          ) : null}
        </form>

        <p className="mx-auto mt-6 max-w-[340px] font-mono text-[11px] leading-[1.6] tracking-[0.08em] text-dim">
          EMAIL AND A PASSWORD, KEPT HASHED · NOTHING ELSE STORED
        </p>
      </div>

      <div className="mt-6 text-center font-mono text-[11px] tracking-[0.1em] text-dim">
        <Link href={continueHref} className="underline decoration-dotted underline-offset-4 hover:text-bone">
          CONTINUE WITHOUT AN ACCOUNT
        </Link>
      </div>
    </main>
  );
}
