"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { GoldText } from "@/components/ui/GoldText";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function AccountPage() {
  const router = useRouter();
  const { status, user, refresh, signOut } = useAuth();

  // Redirect anonymous visitors to sign-in.
  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/sign-in");
    }
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return (
      <SectionContainer size="default" spacing="default">
        <p className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          {status === "loading" ? "Loading" : "Redirecting"}
        </p>
      </SectionContainer>
    );
  }

  return (
    <>
      <SectionContainer size="narrow" spacing="tight">
        <div className="text-ink-tertiary font-mono text-xs uppercase tracking-[0.3em]">
          Account
        </div>
        <GoldText as="h1" className="mt-4 text-4xl leading-tight md:text-5xl">
          Your record.
        </GoldText>
        <p className="text-ink-secondary font-body mt-6 text-base leading-relaxed md:text-lg">
          Signed in as <span className="text-ink-primary">{user.email}</span>. Member since{" "}
          {new Date().toLocaleDateString()}.
        </p>
      </SectionContainer>

      <SectionContainer size="narrow" spacing="tight">
        <DisplayNameSection currentName={user.displayName ?? ""} onSaved={refresh} />
      </SectionContainer>

      <SectionContainer size="narrow" spacing="tight">
        <PasswordSection />
      </SectionContainer>

      <SectionContainer size="narrow" spacing="tight">
        <DataExportSection email={user.email} />
      </SectionContainer>

      <SectionContainer size="narrow" spacing="tight">
        <DeleteSection email={user.email} onDeleted={() => router.push("/")} signOut={signOut} />
      </SectionContainer>

      <SectionContainer size="narrow" spacing="tight">
        <div className="border-border-hairline border-t pt-8">
          <p className="text-ink-tertiary font-body text-sm">
            Your saved charts are managed on the{" "}
            <Link href="/charts" className="text-gold-leaf underline-offset-4 hover:underline">
              charts page
            </Link>
            .
          </p>
        </div>
      </SectionContainer>
    </>
  );
}

function DisplayNameSection({
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
    <GlassPanel tone="solid" className="p-6 md:p-7">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Display name
      </div>
      <p className="text-ink-secondary font-body mt-2 text-sm">
        Shown in the nav and on saved-chart cards. Optional.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary flex-1 rounded-xl border px-4 py-3 text-base outline-none transition-colors"
          placeholder="Your display name"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving" : status === "saved" ? "Saved" : "Save"}
        </button>
      </form>
      {error ? (
        <p className="text-conflict-red font-mono mt-2 text-[11px] uppercase tracking-[0.2em]">
          {error}
        </p>
      ) : null}
    </GlassPanel>
  );
}

function PasswordSection() {
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
    <GlassPanel tone="solid" className="p-6 md:p-7">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Password
      </div>
      <p className="text-ink-secondary font-body mt-2 text-sm">
        Change the password used to sign in. Requires your current password.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          required
          className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
        />
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="New password (at least 8)"
          autoComplete="new-password"
          required
          minLength={8}
          className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          required
          minLength={8}
          className="border-hairline focus:border-gold-soft bg-bg-void font-body text-ink-primary w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={status === "saving"}
          className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Updating" : status === "saved" ? "Password updated" : "Change password"}
        </button>
        {error ? (
          <p className="text-conflict-red font-mono text-[11px] uppercase tracking-[0.2em]">
            {error}
          </p>
        ) : null}
      </form>
    </GlassPanel>
  );
}

function DataExportSection({ email }: { email: string }) {
  return (
    <GlassPanel tone="solid" className="p-6 md:p-7">
      <div className="text-gold-leaf font-mono text-[10px] uppercase tracking-[0.3em]">
        Data export
      </div>
      <p className="text-ink-secondary font-body mt-2 text-sm">
        Download a JSON file containing your account record and every saved chart attached to it. Useful as a backup or as the source for an import into another tool.
      </p>
      <a
        href="/api/me/export"
        download
        className="border-gold-soft text-gold-leaf hover:bg-gold-leaf/10 mt-4 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
      >
        Download {email}&apos;s data ↓
      </a>
    </GlassPanel>
  );
}

function DeleteSection({
  email,
  onDeleted,
  signOut,
}: {
  email: string;
  onDeleted: () => void;
  signOut: () => Promise<void>;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const canDelete = confirmText.trim().toLowerCase() === email.toLowerCase();

  const onDelete = async () => {
    if (!canDelete) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("This permanently deletes your account and all saved charts. Continue?")
    ) {
      return;
    }
    setStatus("deleting");
    try {
      const res = await fetch("/api/me", { method: "DELETE", credentials: "include" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error ?? "Could not delete account.");
        return;
      }
      await signOut();
      onDeleted();
    } catch {
      setStatus("error");
      setError("Network error.");
    }
  };

  return (
    <GlassPanel tone="solid" className="border-conflict-red/40 border p-6 md:p-7">
      <div className="text-conflict-red font-mono text-[10px] uppercase tracking-[0.3em]">
        Delete account
      </div>
      <p className="text-ink-secondary font-body mt-2 text-sm">
        Removes your account and every saved chart attached to it. Local-only charts in this browser are not affected and remain available to anonymous use. This action cannot be undone.
      </p>
      <p className="text-ink-tertiary font-mono mt-4 text-[11px] uppercase tracking-[0.2em]">
        Type your email ({email}) to confirm:
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={email}
        className="border-hairline focus:border-conflict-red bg-bg-void font-body text-ink-primary mt-2 w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors"
      />
      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete || status === "deleting"}
        className="border-conflict-red text-conflict-red hover:bg-conflict-red/10 mt-4 rounded-full border px-5 py-3 text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-30"
      >
        {status === "deleting" ? "Deleting" : "Delete account permanently"}
      </button>
      {error ? (
        <p className="text-conflict-red font-mono mt-3 text-[11px] uppercase tracking-[0.2em]">
          {error}
        </p>
      ) : null}
    </GlassPanel>
  );
}
