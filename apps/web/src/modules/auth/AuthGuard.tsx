"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "./auth-client";
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
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionData, isPending } = authClient.useSession();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // If auth verification takes longer than 3.5 seconds, treat as unauthenticated
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPending || timedOut) {
      if (!sessionData?.user) {
        const callbackUrl = encodeURIComponent(pathname || "/workspace");
        router.replace(`/login?callbackUrl=${callbackUrl}`);
      }
    }
  }, [isPending, sessionData, timedOut, router, pathname]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (e) {
      console.error("Sign out error", e);
    } finally {
      window.location.href = "/login";
    }
  };

  if ((isPending && !timedOut) || !sessionData?.user) {
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
    user: (sessionData.user as unknown as AuthUser) ?? null,
    session: (sessionData.session as unknown as AuthSession) ?? null,
    isPending,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}
