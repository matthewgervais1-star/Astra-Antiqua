"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  listCharts,
  upsertChart,
  writeChartList,
  type SavedChartInputs,
} from "@/lib/savedCharts";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

interface AuthState {
  user: AuthUser | null;
  status: "loading" | "anonymous" | "authenticated";
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface MeResponse {
  ok: boolean;
  user: AuthUser | null;
}

interface ChartsListResponse {
  ok: boolean;
  charts?: SavedChartInputs[];
  error?: string;
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as MeResponse;
    return data.user ?? null;
  } catch {
    return null;
  }
}

async function pullServerCharts(): Promise<readonly SavedChartInputs[]> {
  try {
    const res = await fetch("/api/charts", { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as ChartsListResponse;
    return data.charts ?? [];
  } catch {
    return [];
  }
}

async function pushChartToServer(chart: SavedChartInputs): Promise<boolean> {
  try {
    const res = await fetch("/api/charts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(chart),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * On successful sign-in / sign-up, reconcile localStorage charts with the
 * server's set: server is the source of truth, but any localStorage-only
 * charts get uploaded so the user does not lose work entered before signing
 * in. Final result becomes localStorage (so reads stay synchronous).
 */
async function reconcileAfterSignIn(): Promise<void> {
  const serverCharts = await pullServerCharts();
  const localCharts = listCharts();
  const serverIds = new Set(serverCharts.map((c) => c.id));
  // Upload local-only charts (treat them as new chart records under the user)
  for (const c of localCharts) {
    if (!serverIds.has(c.id)) {
      await pushChartToServer(c);
    }
  }
  const reFetched = await pullServerCharts();
  writeChartList([...reFetched]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, status: "loading" });

  const refresh = useCallback(async () => {
    const user = await fetchMe();
    if (user) {
      const serverCharts = await pullServerCharts();
      writeChartList([...serverCharts]);
      setState({ user, status: "authenticated" });
    } else {
      setState({ user: null, status: "anonymous" });
    }
  }, []);

  useEffect(() => {
    // refresh calls setState inside its async body to hydrate auth + chart
    // cache from the server. The set-state-in-effect rule does not have a
    // clean alternative for this once-on-mount sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = (await res.json()) as { ok: boolean; user?: AuthUser; error?: string };
        if (!res.ok || !data.ok || !data.user) {
          return { ok: false, error: data.error ?? "Sign-in failed." };
        }
        setState({ user: data.user, status: "authenticated" });
        await reconcileAfterSignIn();
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, displayName }),
        });
        const data = (await res.json()) as { ok: boolean; user?: AuthUser; error?: string };
        if (!res.ok || !data.ok || !data.user) {
          return { ok: false, error: data.error ?? "Sign-up failed." };
        }
        setState({ user: data.user, status: "authenticated" });
        await reconcileAfterSignIn();
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
    } finally {
      setState({ user: null, status: "anonymous" });
      // Leave localStorage in place so the anonymous experience continues
      // with whatever charts the user had.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signUp, signOut, refresh }),
    [state, signIn, signUp, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      status: "loading",
      signIn: async () => ({ ok: false, error: "Auth not ready." }),
      signUp: async () => ({ ok: false, error: "Auth not ready." }),
      signOut: async () => {},
      refresh: async () => {},
    };
  }
  return ctx;
}

/**
 * After a chart is upserted in the UI, components call this to also mirror
 * the chart to the server when authenticated. Idempotent on the localStorage
 * side (the chart is already there).
 */
export async function mirrorChartToServer(
  chart: SavedChartInputs,
  status: AuthState["status"],
): Promise<void> {
  if (status !== "authenticated") return;
  await pushChartToServer(chart);
}

export async function mirrorDeleteToServer(
  chartId: string,
  status: AuthState["status"],
): Promise<void> {
  if (status !== "authenticated") return;
  try {
    await fetch(`/api/charts/${encodeURIComponent(chartId)}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    // ignore
  }
}

export async function mirrorPrimaryToServer(
  chartId: string,
  status: AuthState["status"],
): Promise<void> {
  if (status !== "authenticated") return;
  try {
    await fetch(`/api/charts/${encodeURIComponent(chartId)}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setPrimary" }),
    });
  } catch {
    // ignore
  }
}

export { upsertChart };
