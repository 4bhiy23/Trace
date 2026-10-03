"use client";

import { useState, useId } from "react";
import type { FormEvent } from "react";
import { authClient } from "./auth-client";

interface AuthCardProps {
  initialMode?: "sign-in" | "sign-up";
}

export function AuthCard({ initialMode = "sign-up" }: AuthCardProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success" | "info";
    text: string;
  } | null>(null);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "User",
        });

        if (error) {
          setStatusMessage({
            type: "error",
            text:
              error.message ||
              "Failed to create account. Please check your credentials.",
          });
        } else {
          setStatusMessage({
            type: "success",
            text: "Account created successfully! Redirecting to workspace...",
          });
          setTimeout(() => {
            window.location.href = "/workspace";
          }, 800);
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setStatusMessage({
            type: "error",
            text:
              error.message || "Invalid email or password. Please try again.",
          });
        } else {
          setStatusMessage({
            type: "success",
            text: "Signed in successfully! Redirecting to workspace...",
          });
          setTimeout(() => {
            window.location.href = "/workspace";
          }, 800);
        }
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Could not connect to the authentication server. Please verify the server is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSocialSignIn(provider: "google") {
    setStatusMessage(null);
    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: window.location.origin,
      });

      if (error) {
        setStatusMessage({
          type: "error",
          text: error.message || `Failed to sign in with ${provider}.`,
        });
      }
    } catch {
      setStatusMessage({
        type: "info",
        text: `${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication is ready. Ensure OAuth provider credentials are set up on the server.`,
      });
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <div className="w-full max-w-[395px] mx-auto">
      {/* Auth Card Container */}
      <div className="relative rounded-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-7 transition-colors duration-200">
        {/* Subtle decorative top highlight */}
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ring)]/25 to-transparent pointer-events-none" />

        {/* Card Header */}
        <div className="text-center mb-4">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--muted-foreground)] mb-1">
            {mode === "sign-up" ? "GET STARTED" : "WELCOME BACK"}
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {mode === "sign-up" ? "Hi there!" : "Welcome back!"}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {mode === "sign-up"
              ? "Choose how you want to sign up."
              : "Choose how you want to sign in."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="flex p-0.5 mb-4 rounded-lg bg-[var(--secondary)]/60 border border-[var(--border)]/60"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sign-in"}
            onClick={() => {
              setMode("sign-in");
              setStatusMessage(null);
            }}
            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-none cursor-pointer ${
              mode === "sign-in"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sign-up"}
            onClick={() => {
              setMode("sign-up");
              setStatusMessage(null);
            }}
            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-none cursor-pointer ${
              mode === "sign-up"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-3.5 p-2.5 rounded-lg text-xs flex items-start gap-2 transition-all ${
              statusMessage.type === "error"
                ? "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20"
                : statusMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-[var(--accent)]/40 text-[var(--foreground)] border border-[var(--border)]"
            }`}
          >
            <span className="shrink-0 mt-0.5 font-bold">
              {statusMessage.type === "error"
                ? "!"
                : statusMessage.type === "success"
                  ? "✓"
                  : "ℹ"}
            </span>
            <span className="leading-snug">{statusMessage.text}</span>
          </div>
        )}

        {/* Social Authentication Buttons */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            disabled={isSubmitting || socialLoading !== null}
            onClick={() => handleSocialSignIn("google")}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-lg text-xs font-medium bg-[var(--secondary)]/40 hover:bg-[var(--secondary)]/80 text-[var(--foreground)] border border-[var(--border)] transition-all duration-150 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-none cursor-pointer"
          >
            {socialLoading === "google" ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-3.5 text-center">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <span className="relative px-2.5 text-[10px] font-medium tracking-widest text-[var(--muted-foreground)] uppercase bg-[var(--card)]">
            OR
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "sign-up" && (
            <div>
              <label
                htmlFor={nameId}
                className="block text-[11px] font-medium text-[var(--foreground)] mb-1"
              >
                Name
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--input)]/25 focus:bg-[var(--input)]/40 text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20 outline-none transition-all placeholder:text-[var(--muted-foreground)]/60"
              />
            </div>
          )}

          <div>
            <label
              htmlFor={emailId}
              className="block text-[11px] font-medium text-[var(--foreground)] mb-1"
            >
              Email address
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-[var(--input)]/25 focus:bg-[var(--input)]/40 text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20 outline-none transition-all placeholder:text-[var(--muted-foreground)]/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={passwordId}
                className="block text-[11px] font-medium text-[var(--foreground)]"
              >
                Password
              </label>
              {mode === "sign-in" && (
                <button
                  type="button"
                  onClick={() =>
                    setStatusMessage({
                      type: "info",
                      text: "Password reset instructions will be sent to your registered email address.",
                    })
                  }
                  className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete={
                  mode === "sign-up" ? "new-password" : "current-password"
                }
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-9 rounded-lg text-xs bg-[var(--input)]/25 focus:bg-[var(--input)]/40 text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20 outline-none transition-all placeholder:text-[var(--muted-foreground)]/60"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-md transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {mode === "sign-up" && (
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                Must be at least 8 characters.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-3 mt-1 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-[0.99] transition-all duration-150 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-none cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>
                  {mode === "sign-up" ? "Creating account…" : "Signing in…"}
                </span>
              </>
            ) : (
              <span>{mode === "sign-up" ? "Create account" : "Sign in"}</span>
            )}
          </button>
        </form>

        {/* Card Footer toggle */}
        <div className="mt-4 pt-3.5 border-t border-[var(--border)]/60 text-center">
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {mode === "sign-up"
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                setStatusMessage(null);
              }}
              className="font-medium text-[var(--foreground)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded px-0.5 outline-none cursor-pointer"
            >
              {mode === "sign-up" ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>

      {/* Terms of Service & Privacy Policy Notice */}
      <p className="text-[11px] text-[var(--muted-foreground)]/80 text-center mt-4 leading-relaxed max-w-xs mx-auto">
        By continuing you are agreeing to our{" "}
        <a
          href="#terms"
          className="underline hover:text-[var(--foreground)] transition-colors"
        >
          Terms of Use
        </a>{" "}
        and{" "}
        <a
          href="#privacy"
          className="underline hover:text-[var(--foreground)] transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
