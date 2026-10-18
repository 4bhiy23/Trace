"use client";

import { useState, useId } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authClient } from "./auth-client";
import { TraceLogo } from "./TraceLogo";

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
  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);
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
              "Failed to create account. Please verify your credentials.",
          });
        } else {
          setStatusMessage({
            type: "success",
            text: "Account created successfully. Redirecting to workspace...",
          });
          setTimeout(() => {
            window.location.href = "/workspace";
          }, 700);
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
            text: "Signed in successfully. Redirecting to workspace...",
          });
          setTimeout(() => {
            window.location.href = "/workspace";
          }, 700);
        }
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Could not connect to authentication service. Please verify the server is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    setStatusMessage(null);
    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/workspace`,
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
        text: `${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication is configured. Ensure OAuth environment secrets are set up.`,
      });
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <div className="relative w-full max-w-[490px] bg-[#F5F2EB] border-[1.5px] border-black rounded-none p-6 sm:py-7 sm:px-8 brutalist-card-shadow text-black">
      {/* 3 Radiating accent lines at top-right corner of card shadow */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none left-[calc(100%+10px)] -top-[6px]"
      >
        <svg width="28" height="38" viewBox="0 0 28 38" fill="none">
          <line
            x1="3"
            y1="14"
            x2="10"
            y2="3"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="6"
            y1="20"
            x2="19"
            y2="17"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="27"
            x2="15"
            y2="33"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Centered Brand Logo */}
      <div className="flex justify-center mb-2.5">
        <TraceLogo size={46} className="text-black" />
      </div>

      {/* Main Heading */}
      <h2 className="font-brand-display text-[clamp(24px,2.5vw,28px)] leading-[1.2] font-bold tracking-[-0.5px] text-center text-black uppercase">
        {mode === "sign-up" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
      </h2>

      {/* Subtitle */}
      <p className="font-brand-sans text-[14px] sm:text-[15px] font-normal leading-[1.4] tracking-normal text-[#555555] text-center mt-1 mb-4">
        {mode === "sign-up"
          ? "Sign up to start creating together."
          : "Sign in to access your creative workspace."}
      </p>

      {/* Status Banner */}
      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 p-2.5 text-xs flex items-start gap-2 border-[1.5px] shadow-[3px_3px_0px_0px_#000000] ${
            statusMessage.type === "error"
              ? "bg-[#E03E2D]/10 text-[#C12E1E] border-[#E03E2D]"
              : statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-900 border-emerald-600"
                : "bg-white text-black border-black"
          }`}
        >
          <span className="shrink-0 font-bold font-roboto-mono">
            {statusMessage.type === "error"
              ? "!"
              : statusMessage.type === "success"
                ? "✓"
                : "ℹ"}
          </span>
          <span className="leading-snug font-brand-sans text-[13px]">
            {statusMessage.text}
          </span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "sign-up" && (
          <div>
            <label
              htmlFor={nameId}
              className="block font-roboto-mono text-[12px] sm:text-[13px] font-semibold leading-[1.3] tracking-[0.5px] uppercase text-black mb-1"
            >
              NAME
            </label>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 font-brand-sans text-[14px] font-normal leading-[1.5] tracking-normal bg-white text-black border-[1.5px] border-black rounded-none placeholder:text-[#888888] shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor={emailId}
            className="block font-roboto-mono text-[12px] sm:text-[13px] font-semibold leading-[1.3] tracking-[0.5px] uppercase text-black mb-1"
          >
            EMAIL
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-3.5 font-brand-sans text-[14px] font-normal leading-[1.5] tracking-normal bg-white text-black border-[1.5px] border-black rounded-none placeholder:text-[#888888] shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor={passwordId}
            className="block font-roboto-mono text-[12px] sm:text-[13px] font-semibold leading-[1.3] tracking-[0.5px] uppercase text-black mb-1"
          >
            PASSWORD
          </label>
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
              placeholder={
                mode === "sign-up" ? "Create a password" : "Enter your password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-3.5 pr-11 font-brand-sans text-[14px] font-normal leading-[1.5] tracking-normal bg-white text-black border-[1.5px] border-black rounded-none placeholder:text-[#888888] shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-black/60 hover:text-black focus:outline-none focus-visible:ring-1 focus-visible:ring-black cursor-pointer transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} />
              ) : (
                <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-1.5 font-roboto-mono text-[13px] sm:text-[14px] font-semibold leading-[1.4] tracking-[0.5px] uppercase bg-black text-white border-[1.5px] border-black rounded-none shadow-[3.5px_3.5px_0px_0px_rgba(0,0,0,0.5)] hover:bg-[#1a1a1a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>
                {mode === "sign-up" ? "CREATING ACCOUNT…" : "SIGNING IN…"}
              </span>
            </>
          ) : (
            <span>{mode === "sign-up" ? "CREATE ACCOUNT" : "SIGN IN"}</span>
          )}
        </button>
      </form>

      {/* Hairline OR Divider with Box Badge */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-black/20" />
        <span className="absolute bg-[#F5F2EB] px-2.5 py-0.5 border-[1.5px] border-black shadow-[2px_2px_0px_0px_#000000] font-roboto-mono text-[11px] font-semibold tracking-[0.5px] text-black uppercase">
          OR
        </span>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Google */}
        <button
          type="button"
          disabled={isSubmitting || socialLoading !== null}
          onClick={() => handleSocialSignIn("google")}
          className="w-full h-11 flex items-center justify-center gap-2 bg-white text-black border-[1.5px] border-black rounded-none font-brand-sans text-[13px] sm:text-[14px] font-semibold leading-[1.4] tracking-normal shadow-[3px_3px_0px_0px_#000000] hover:bg-[#fafafa] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
        >
          {socialLoading === "google" ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span className="font-brand-sans text-[13px] sm:text-[14px] font-semibold leading-[1.4] tracking-normal">
            Google
          </span>
        </button>

        {/* GitHub */}
        <button
          type="button"
          disabled={isSubmitting || socialLoading !== null}
          onClick={() => handleSocialSignIn("github")}
          className="w-full h-11 flex items-center justify-center gap-2 bg-white text-black border-[1.5px] border-black rounded-none font-brand-sans text-[13px] sm:text-[14px] font-semibold leading-[1.4] tracking-normal shadow-[3px_3px_0px_0px_#000000] hover:bg-[#fafafa] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-[1px_1px_0px_0px_#000000] transition-all cursor-pointer disabled:opacity-50"
        >
          {socialLoading === "github" ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 fill-black shrink-0" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          )}
          <span className="font-brand-sans text-[13px] sm:text-[14px] font-semibold leading-[1.4] tracking-normal">
            GitHub
          </span>
        </button>
      </div>

      {/* Switch Mode Link */}
      <div className="text-center font-brand-sans text-[13px] font-normal leading-[1.4] tracking-normal text-[#555555] mb-2">
        <span>
          {mode === "sign-up"
            ? "Already have an account? "
            : "Don't have an account? "}
        </span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "sign-up" ? "sign-in" : "sign-up");
            setStatusMessage(null);
          }}
          className="text-[#E03E2D] font-brand-sans text-[13px] font-semibold leading-[1.4] tracking-normal hover:underline cursor-pointer transition-colors"
        >
          {mode === "sign-up" ? "Sign in" : "Sign up"}
        </button>
      </div>

      {/* Privacy Terms Notice */}
      <p className="font-brand-sans text-[11px] font-normal leading-[1.4] tracking-normal text-[#666666] text-center">
        By continuing you agree to our{" "}
        <a
          href="#privacy"
          className="underline hover:text-black transition-colors font-brand-sans"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
