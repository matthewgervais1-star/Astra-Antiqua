"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { SyncFlag } from "@/components/chrome/SyncFlag";
import { CULTURE_LABELS } from "@/data/cultures";
import { readPersistedPantheon } from "@/lib/pantheonPreference";
import { listCharts } from "@/lib/savedCharts";
import { feedbackCount } from "@/lib/feedback";
import { cn } from "@/lib/classNames";

const INPUT_CLASS =
  "w-full border border-rule bg-transparent px-4 py-3 font-mono text-[12px] text-bone placeholder:text-faint-ink outline-none focus:border-[var(--accent)]";
const LABEL_CLASS = "mb-2 block font-mono text-[11px] tracking-[0.14em] text-dim";

export default function AccountPage() {
  const router = useRouter();
  const { status, user, refresh, signOut } = useAuth();

  // Anonymous visitors are sent to sign in, returning them here afterward.
  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/signin?next=/account");
    }
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return (
      <main className="mx-auto max-w-[560px] px-5 py-16 text-center">
        <p className="font-mono text-[11px] tracking-[0.2em] text-dim">
          {status === "loading" ? "READING THE RECORD…" : "REDIRECTING…"}
        </p>
      </main>
    );
  }

  return (
    <AccountLedger
      email={user.email}
      displayName={user.displayName}
      refresh={refresh}
      signOut={signOut}
    />
  );
}

function AccountLedger({
  email,
  displayName,
  refresh,
  signOut,
}: {
  email: string;
  displayName: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}) {
  const router = useRouter();
  // This component only ever mounts once /account has already confirmed an
  // authenticated status client-side, so there is no SSR pass to mismatch:
  // reading localStorage directly here (rather than deferring to an effect)
  // is safe.
  const persisted = readPersistedPantheon();
  const cultureLabel = persisted ? CULTURE_LABELS[persisted].toUpperCase() : "NONE CHOSEN";
  const chartsCount = listCharts().length;
  const entries = feedbackCount();

  const onSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <main className="mx-auto max-w-[560px] px-5 py-14 md:py-16">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.18em] text-dim">
          THE RECORD · {email.toUpperCase()}
        </span>
        <SyncFlag />
      </div>
      <div className="mt-5 h-px w-11 bg-[var(--accent)]" />

      <div className="flex flex-col font-mono text-[11.5px]">
        <LedgerRow label="CULTURE">
          <span className="flex items-baseline gap-3">
            {cultureLabel}
            <Link href="/welcome" className="text-[var(--accent)]">
              CHANGE →
            </Link>
          </span>
        </LedgerRow>
        <LedgerRow label="CHARTS SYNCED">{chartsCount}</LedgerRow>
        <LedgerRow label="FEEDBACK ENTRIES">{entries} · THIS DEVICE</LedgerRow>
        <LedgerRow label="DEVICES" last>
          THIS ONE
        </LedgerRow>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex-1 border border-rule py-3 text-center font-mono text-[10.5px] tracking-[0.12em] text-bone hover:border-bone/50"
        >
          SIGN OUT
        </button>
        <StrikeAction email={email} />
      </div>
      <p className="mt-3 font-mono text-[11px] leading-[1.6] tracking-[0.06em] text-dim">
        STRIKING DELETES THE SERVER COPY; THIS DEVICE KEEPS ITS OWN.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        <DisplayNameDisclosure currentName={displayName ?? ""} onSaved={refresh} />
        <PasswordDisclosure />
        <ExportDisclosure email={email} />
      </div>
    </main>
  );
}

function LedgerRow({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 border-t border-rule-row py-[11px]",
        last && "border-b",
      )}
    >
      <span className="text-dim">{label}</span>
      <span className="text-bone">{children}</span>
    </div>
  );
}

function StrikeAction({ email }: { email: string }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const canDelete = confirmText.trim().toLowerCase() === email.toLowerCase();

  const onDelete = async () => {
    if (!canDelete) return;
    setStatus("deleting");
    setError(null);
    try {
      const res = await fetch("/api/me", { method: "DELETE", credentials: "include" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "COULD NOT STRIKE THE RECORD.");
        return;
      }
      await signOut();
      router.push("/");
    } catch {
      setStatus("error");
      setError("NETWORK ERROR.");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 border border-conflict py-3 text-center font-mono text-[10.5px] tracking-[0.12em] text-conflict hover:bg-conflict/10"
      >
        STRIKE THE RECORD
      </button>
    );
  }

  return (
    <div className="flex-1 border border-conflict px-4 py-3">
      <p className="font-mono text-[10.5px] tracking-[0.08em] text-conflict">
        TYPE {email.toUpperCase()} TO CONFIRM
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={email}
        className="mt-2 w-full border border-rule bg-transparent px-3 py-2 font-mono text-[11px] text-bone placeholder:text-faint-ink outline-none focus:border-conflict"
      />
      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete || status === "deleting"}
        className="mt-2 w-full border border-conflict py-2 text-center font-mono text-[10.5px] tracking-[0.12em] text-conflict disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "deleting" ? "STRIKING…" : "STRIKE THE RECORD PERMANENTLY"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 font-mono text-[10.5px] tracking-[0.06em] text-conflict">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function DisclosureShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-rule">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-[0.14em] text-dim hover:text-bone"
      >
        <span>{title}</span>
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>
      {open ? <div className="border-t border-rule-row px-4 py-4">{children}</div> : null}
    </div>
  );
}

function DisplayNameDisclosure({
  currentName,
  onSaved,
}: {
  currentName: string;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Could not save.");
        return;
      }
      await onSaved();
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  };

  return (
    <DisclosureShell title="CHANGE THE NAME">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="account-name" className={LABEL_CLASS}>
            DISPLAY NAME
          </label>
          <input
            id="account-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            placeholder="Your display name"
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="self-start border border-rule px-5 py-2 font-mono text-[10.5px] tracking-[0.12em] text-bone hover:border-bone/50 disabled:opacity-50"
        >
          {status === "saving" ? "SAVING…" : status === "saved" ? "SAVED" : "SAVE"}
        </button>
        {error ? (
          <p role="alert" className="font-mono text-[11px] text-conflict">
            {error.toUpperCase()}
          </p>
        ) : null}
      </form>
    </DisclosureShell>
  );
}

function PasswordDisclosure() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (next.length < 8) {
      setError("New password must be at least eight characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setStatus("saving");
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Could not update password.");
        return;
      }
      setStatus("saved");
      setCurrent("");
      setNext("");
      setConfirm("");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  };

  return (
    <DisclosureShell title="CHANGE THE PASSWORD">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="account-current-pw" className={LABEL_CLASS}>
            CURRENT PASSWORD
          </label>
          <input
            id="account-current-pw"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="account-next-pw" className={LABEL_CLASS}>
            NEW PASSWORD (AT LEAST 8)
          </label>
          <input
            id="account-next-pw"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="account-confirm-pw" className={LABEL_CLASS}>
            CONFIRM NEW PASSWORD
          </label>
          <input
            id="account-confirm-pw"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="self-start border border-rule px-5 py-2 font-mono text-[10.5px] tracking-[0.12em] text-bone hover:border-bone/50 disabled:opacity-50"
        >
          {status === "saving" ? "UPDATING…" : status === "saved" ? "UPDATED" : "CHANGE PASSWORD"}
        </button>
        {error ? (
          <p role="alert" className="font-mono text-[11px] text-conflict">
            {error.toUpperCase()}
          </p>
        ) : null}
      </form>
    </DisclosureShell>
  );
}

function ExportDisclosure({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onExport = async () => {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/me/export", { headers: { Accept: "application/json" } });
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Your session has expired. Sign in again to export your data."
            : "The export could not be prepared. Please try again.",
        );
        setStatus("error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "astra-antiqua-data.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch {
      setError("Could not reach the server. Please try again.");
      setStatus("error");
    }
  };

  return (
    <DisclosureShell title="EXPORT THE RECORD">
      <button
        type="button"
        onClick={onExport}
        disabled={status === "loading"}
        className="border border-rule px-5 py-2 font-mono text-[10.5px] tracking-[0.12em] text-bone hover:border-bone/50 disabled:opacity-50"
      >
        {status === "loading" ? "PREPARING…" : `DOWNLOAD ${email.toUpperCase()}'S DATA ↓`}
      </button>
      {error ? (
        <p role="alert" className="mt-2 font-mono text-[11px] text-conflict">
          {error.toUpperCase()}
        </p>
      ) : null}
    </DisclosureShell>
  );
}
