"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  Shield,
  Check,
  AlertCircle,
  LogIn,
  LogOut,
  X,
} from "lucide-react";
import { authClient } from "@/modules/auth/auth-client";
import { useAcceptInvite } from "@/features/workspaces/queries/workspace.mutations";
import { SpiralBinding } from "./SpiralBinding";

export function JoinWorkspaceView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const acceptInviteMutation = useAcceptInvite();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentUser = sessionData?.user;

  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/join/workspace";

  const handleAccept = async () => {
    if (!token) {
      setErrorMessage("Missing invitation token in the link.");
      return;
    }

    setErrorMessage(null);
    try {
      await acceptInviteMutation.mutateAsync(token);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/workspace");
      }, 1200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to accept invitation.";
      setErrorMessage(msg);
    }
  };

  const handleSignOutAndSwitch = async () => {
    try {
      await authClient.signOut();
    } catch {
      // Ignore errors on sign out
    } finally {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
    }
  };

  const isEmailMismatch =
    errorMessage?.toLowerCase().includes("another email") ||
    errorMessage?.toLowerCase().includes("belongs to another");

  const initials = currentUser
    ? (currentUser.name || currentUser.email).slice(0, 2).toUpperCase()
    : "";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 grid-paper relative overflow-hidden select-none font-brand-sans">
      {/* SVG Displacement Filters for Torn-Paper Borders & Shadows */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="join-r1" x="-4%" y="-8%" width="108%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.07"
              numOctaves="3"
              seed="9"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="4.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="join-r2" x="-4%" y="-8%" width="108%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.08"
              numOctaves="3"
              seed="17"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Scoped Button & Card Styles */}
      <style>{`
        .join-rough-btn {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          --fill: #fffefc;
          --sx: 4px;
          --sy: 5px;
          cursor: pointer;
          border: 0;
          background: none;
          padding: 10px 22px;
          transition: transform 0.08s ease;
        }
        .join-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#join-r1);
        }
        .join-rough-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#join-r2);
        }
        .join-rough-btn:active {
          transform: translate(2px, 3px);
          --sx: 2px;
          --sy: 2px;
        }
        .join-rough-btn--lime {
          --fill: #ddfc78;
        }

        .join-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          --fill: #fffefc;
          border: 0;
          background: none;
          padding: 8px 14px;
        }
        .join-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#join-r1);
          pointer-events: none;
        }
      `}</style>

      {/* Main Notebook Stack Card with 3D layers (§17.4) */}
      <div className="relative w-full max-w-140 my-6 select-none animate-in zoom-in-95 duration-200">
        <div
          className="absolute top-3 left-3 -right-4 -bottom-4 bg-[#111] rounded-2xl pointer-events-none z-0"
          aria-hidden="true"
        />

        <div
          className="absolute top-2 left-2 -right-2.5 -bottom-2.5 bg-[#F2E3A7] border-2 border-[#111] rounded-xl pointer-events-none z-1"
          aria-hidden="true"
        />

        <div
          className="relative z-10 bg-[#FAF5EC] border-2 border-[#111] rounded-lg shadow-[1px_2px_0px_rgba(0,0,0,0.08)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ece3d3 1px, transparent 1px), linear-gradient(#ece3d3 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={9} />
          </div>

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 border-2 border-black bg-brand-lime text-black flex items-center justify-center shrink-0 rounded-[3px] shadow-[2px_2px_0px_#000000]">
                  <UserPlus className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-0.5">
                    WORKSPACE INVITATION
                  </div>
                  <div className="flex items-center">
                    <h2 className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none">
                      Join Workspace
                    </h2>

                    <svg
                      width="18"
                      height="16"
                      viewBox="0 0 20 16"
                      fill="none"
                      stroke="#111"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      className="inline-block ml-2 text-black shrink-0"
                      aria-hidden="true"
                    >
                      <line x1="4" y1="14" x2="16" y2="3" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs text-[#524f46] mt-1.5 leading-snug">
                    Accept invitation to collaborate in real-time.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/workspace")}
                aria-label="Close"
                className="join-rough-btn w-9 h-9 p-0! flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            <div className="w-full border-b-[1.5px] border-black my-4" />

            {isSessionPending ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
                <p className="font-mono text-xs text-[#666]">
                  Checking your session...
                </p>
              </div>
            ) : !currentUser ? (
              /* Unauthenticated View */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]">
                      AUTHENTICATION
                    </span>
                    <span className="font-mono text-[10px] font-bold text-red-600 tracking-wider">
                      REQUIRED
                    </span>
                  </div>
                  <div className="join-rough-card w-full items-start! flex-col gap-1 py-3 px-3.5">
                    <div className="text-xs font-brand-sans font-bold text-black">
                      Sign in required to accept invitation
                    </div>
                    <div className="text-[11px] text-[#555] font-mono leading-relaxed">
                      Please log in with the email address where you received
                      the invite.
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3.5 border-t border-black/20">
                  <a
                    href={`/signup?callbackUrl=${encodeURIComponent(currentUrl)}`}
                    className="join-rough-btn font-brand-sans font-black text-xs uppercase tracking-wider text-black"
                  >
                    <span>CREATE ACCOUNT</span>
                    <svg
                      className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2L2 14"
                        stroke="#111"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </a>

                  <a
                    href={`/login?callbackUrl=${encodeURIComponent(currentUrl)}`}
                    className="join-rough-btn join-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4 stroke-[2.4]" />
                    <span>SIGN IN</span>
                    <svg
                      className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2L2 14"
                        stroke="#111"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ) : !token ? (
              <div className="space-y-4">
                <div className="join-rough-card w-full items-start! flex-col gap-1 py-3 px-3.5">
                  <div className="flex items-center gap-1.5 text-red-600 font-brand-sans font-bold text-xs uppercase">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Missing Invitation Token</span>
                  </div>
                  <div className="text-[11px] text-[#555] font-mono leading-relaxed">
                    The invitation link appears incomplete or missing the
                    security token. Please open the link sent directly to your
                    email.
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end border-t border-black/20">
                  <button
                    type="button"
                    onClick={() => router.push("/workspace")}
                    className="join-rough-btn join-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black"
                  >
                    <span>GO TO WORKSPACE</span>
                    <svg
                      className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2L2 14"
                        stroke="#111"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : isSuccess ? (
              /* Success State */
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-[#ddfc78] border-2 border-black rounded-full mx-auto flex items-center justify-center shadow-[2px_2px_0px_#000]">
                  <Check className="w-7 h-7 text-black stroke-[2.8]" />
                </div>
                <h3 className="font-brand-sans font-black text-xl text-black">
                  Invitation Accepted!
                </h3>
                <p className="font-mono text-xs text-[#555]">
                  Redirecting to your workspace...
                </p>
              </div>
            ) : (
              /* Authenticated & Token Ready */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]">
                      SIGNED IN ACCOUNT
                    </span>
                    <button
                      type="button"
                      onClick={handleSignOutAndSwitch}
                      className="font-mono text-[10px] font-bold text-[#555] hover:text-black tracking-wider uppercase flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>SWITCH ACCOUNT</span>
                    </button>
                  </div>

                  <div className="join-rough-card w-full justify-between py-2.5 px-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full border-2 border-black bg-black text-brand-lime flex items-center justify-center shrink-0 font-brand-display text-xs font-bold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-brand-sans font-bold text-black truncate">
                          {currentUser.name || currentUser.email.split("@")[0]}
                        </div>
                        <div className="text-[10px] text-[#555] truncate font-mono">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-black bg-brand-lime px-2 py-0.5 border border-black rounded-xs flex items-center gap-1">
                        <Shield className="w-3 h-3 stroke-[2.2]" />
                        <span>ACTIVE</span>
                      </span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="join-rough-card w-full items-start! flex-col gap-1 py-3 px-3.5 border-red-600">
                    <div className="flex items-center gap-1.5 text-red-600 font-brand-sans font-bold text-xs uppercase">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Unable to Accept</span>
                    </div>
                    <div className="text-[11px] text-[#333] font-mono leading-relaxed">
                      {errorMessage}
                    </div>
                    {isEmailMismatch && (
                      <div className="text-[10px] text-[#666] font-mono mt-0.5">
                        You are currently signed in as{" "}
                        <span className="font-bold text-black">
                          {currentUser.email}
                        </span>
                        . Please switch accounts to the email that received this
                        invite.
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#555] px-1">
                  <div className="w-3.5 h-3.5 border border-black rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">
                    i
                  </div>
                  <span>
                    Click below to join this workspace and access its projects.
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3.5 border-t border-black/20">
                  <button
                    type="button"
                    onClick={() => router.push("/workspace")}
                    className="join-rough-btn font-brand-sans font-black text-xs uppercase tracking-wider text-black"
                  >
                    <span>CANCEL</span>

                    <svg
                      className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2L2 14"
                        stroke="#111"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={acceptInviteMutation.isPending}
                    className="join-rough-btn join-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[2.4]" />
                    <span>
                      {acceptInviteMutation.isPending
                        ? "JOINING..."
                        : "ACCEPT INVITATION"}
                    </span>

                    <svg
                      className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2L2 14"
                        stroke="#111"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
