"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient, signOutWithOfflineCleanup } from "./auth-client";
import {
  clearOfflineAccount,
  getOfflineSession,
  type OfflineSession,
} from "../canvas/offline-drafts";
import { TraceLogo } from "./TraceLogo";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  token?: string;
  expiresAt?: Date | string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  isPending: boolean;
  signOut: () => Promise<void>;
  offlineSessionKey?: string;
}

const defaultAuthContext: AuthContextValue = {
  user: null,
  session: null,
  isPending: false,
  signOut: async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    } finally {
      window.location.href = "/login";
    }
  },
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  offlineSessionKey?: string;
}

export function AuthGuard({
  children,
  fallback,
  offlineSessionKey,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionData, isPending, error } = authClient.useSession();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // If auth verification takes 3.5 seconds, treat unauthenticated
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const [offlineLookup, setOfflineLookup] = useState<{
    key: string;
    session?: OfflineSession;
  }>();
  const canRecover = Boolean(
    offlineSessionKey &&
    ((isPending && timedOut) ||
      (error && (!error.status || error.status >= 500))),
  );
  const lookingUp = canRecover && offlineLookup?.key !== offlineSessionKey;
  const stored = offlineLookup?.session;
  const offlineSession =
    canRecover && !lookingUp && stored && stored.expiresAt > Date.now()
      ? stored
      : undefined;
  const user =
    sessionData?.user ??
    (offlineSession && { id: offlineSession.userId, email: "" });
  const session =
    sessionData?.session ??
    (offlineSession && {
      id: offlineSession.id,
      userId: offlineSession.userId,
      expiresAt: new Date(offlineSession.expiresAt),
    });
  const waiting = (isPending && !timedOut) || lookingUp;

  useEffect(() => {
    if (!offlineSessionKey) return;
    let active = true;
    void getOfflineSession(offlineSessionKey)
      .catch(() => undefined)
      .then((result) => {
        if (active)
          setOfflineLookup({ key: offlineSessionKey, session: result });
      });
    return () => {
      active = false;
    };
  }, [offlineSessionKey, canRecover]);

  useEffect(() => {
    if (waiting || user) return;
    if (!canRecover && stored) {
      void clearOfflineAccount(stored.userId).catch(() => {});
    }
    const callbackUrl = encodeURIComponent(pathname || "/workspace");
    router.replace(`/login?callbackUrl=${callbackUrl}`);
  }, [waiting, user, canRecover, stored, router, pathname]);

  const handleSignOut = async () => {
    try {
      await signOutWithOfflineCleanup(user?.id);
    } catch (e) {
      console.error("Sign out error", e);
    } finally {
      window.location.href = "/login";
    }
  };

  if (waiting || !user) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-[var(--primary)]/10 blur-xl animate-pulse" />
            <div className="relative p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
              <TraceLogo size={36} showWordmark={false} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" />
              <span className="text-sm font-medium text-[var(--foreground)] tracking-tight">
                Authenticating...
              </span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Verifying session credentials
            </p>
          </div>
        </div>
      </div>
    );
  }

  const authValue: AuthContextValue = {
    user,
    session: session ?? null,
    offlineSessionKey,
    isPending,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}
