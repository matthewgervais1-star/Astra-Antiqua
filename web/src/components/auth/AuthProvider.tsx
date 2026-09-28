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
import { readChart, writeChart, type SavedChartInputs } from "@/lib/savedCharts";

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

interface ChartResponse {
  ok: boolean;
  chart?: SavedChartInputs | null;
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

async function pullServerChart(): Promise<SavedChartInputs | null> {
  try {
    const res = await fetch("/api/charts", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as ChartResponse;
    return data.chart ?? null;
  } catch {
    return null;
  }
}

async function pushChartToServer(chart: SavedChartInputs): Promise<boolean> {
  try {
    const res = await fetch("/api/charts", {
      method: "PUT",
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
 * On sign-in, settle which of the two copies of the reader's chart wins.
 *
 * The server wins when it has one, because that is the copy that followed
 * them from another device. When it does not, a chart cast on this device
 * before signing in is uploaded rather than lost.
 *
 * There is only ever one chart to reconcile. Charts about other people are
 * not stored anywhere, so there is no set to merge and nothing that signing
 * in could quietly delete.
 */
async function reconcileAfterSignIn(): Promise<void> {
  const server = await pullServerChart();
  if (server) {
    writeChart(server);
    return;
  }
  const local = readChart();
  if (local) await pushChartToServer(local);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, status: "loading" });

  const refresh = useCallback(async () => {
    const user = await fetchMe();
    if (user) {
      const serverChart = await pullServerChart();
      if (serverChart) writeChart(serverChart);
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
 * After the reader saves their chart, mirror it to the server so it follows
 * them to another device. A no-op when signed out, which is why the app works
 * perfectly well without an account.
 */
export async function mirrorChartToServer(
  chart: SavedChartInputs,
  status: AuthState["status"],
): Promise<void> {
  if (status !== "authenticated") return;
  await pushChartToServer(chart);
}

/** No id: one chart per account, so there is only one thing to delete. */
export async function mirrorDeleteToServer(status: AuthState["status"]): Promise<void> {
  if (status !== "authenticated") return;
  try {
    await fetch("/api/charts", { method: "DELETE", credentials: "include" });
  } catch {
    // ignore
  }
}

export { writeChart };
