"use client";

import React, { useState } from "react";
import { X, Send, Copy, Check, Shield, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import { useInviteMember } from "@/features/workspaces/queries/workspace.mutations";
import type { InviteRole } from "@/features/workspaces/types/workspace.types";
import { SpiralBinding } from "./SpiralBinding";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  workspaceName?: string;
}

export function InviteModal({
  isOpen,
  onClose,
  workspaceId = "",
  workspaceName,
}: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("member");
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { data: members = [] } = useQuery(
    workspaceQueries.members(workspaceId),
  );

  const inviteMutation = useInviteMember(workspaceId);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !workspaceId) return;

    setStatusMessage(null);
    try {
      await inviteMutation.mutateAsync({
        email: trimmed,
        role,
      });
      setStatusMessage({
        type: "success",
        text: `Invitation sent to ${trimmed} as ${role}!`,
      });
      setEmail("");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send invitation.";
      setStatusMessage({
        type: "error",
        text: msg,
      });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/join/${workspaceId || "workspace"}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
     
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="inv-r1" x="-4%" y="-8%" width="108%" height="116%">
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
          <filter id="inv-r2" x="-4%" y="-8%" width="108%" height="116%">
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

    
      <style>{`
        .inv-rough-btn {
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
          padding: 8px 18px;
          transition: transform 0.08s ease;
        }
        .inv-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#inv-r1);
        }
        .inv-rough-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#inv-r2);
        }
        .inv-rough-btn:active {
          transform: translate(2px, 3px);
          --sx: 2px;
          --sy: 2px;
        }
        .inv-rough-btn--lime {
          --fill: #ddfc78;
        }
        .inv-rough-btn--no-shadow::after {
          display: none;
        }
        .inv-rough-btn--no-shadow:active {
          transform: translate(1px, 1px);
        }

        .inv-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          --fill: #fffefc;
          border: 0;
          background: none;
          padding: 8px 14px;
        }
        .inv-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#inv-r1);
          pointer-events: none;
        }
      `}</style>

      {/* Modal Notebook Wrapper */}
      <div
        className="relative w-full max-w-[540px] my-6 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tan under-sheet stack peeking out  */}
        <div
          className="absolute -right-3 -bottom-2.5 top-3.5 left-2 bg-[#e6d6a2] border-2 border-[#111] rounded-r-xl pointer-events-none -z-10 shadow-[4px_6px_0px_rgba(0,0,0,0.22)]"
          aria-hidden="true"
        />

        {/* Main Notepad Sheet */}
        <div
          className="relative bg-[#FAF5EC] border-2 border-[#111] rounded-lg shadow-[2px_3px_0px_rgba(0,0,0,0.12)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ece3d3 1px, transparent 1px), linear-gradient(#ece3d3 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          {/* Top Spiral Wire */}
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={13} />
          </div>

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            {/* Header Area */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-1">
                  WORKSPACE INVITATION
                </div>
                <div className="flex items-center">
                  <h2 className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none">
                    {workspaceName
                      ? `Invite to ${workspaceName}`
                      : "Invite to Workspace"}
                  </h2>
                  {/* Hand-drawn slash accent doodle */}
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
                  Send an email invite or share the link with your
                  collaborators.
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="inv-rough-btn w-9 h-9 !p-0 flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            {/* Horizontal Ink Rule under Header */}
            <div className="w-full border-b-[1.5px] border-black my-4" />

            {/* Invite Form */}
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="inv-rough-card flex-1 min-w-0">
                  <input
                    autoFocus
                    type="email"
                    placeholder="colleague@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent font-mono text-xs font-semibold text-black border-none outline-none focus:ring-0 placeholder:text-black/40"
                  />
                </div>

                <div className="inv-rough-card w-28 shrink-0 relative pr-6">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as InviteRole)}
                    className="w-full bg-transparent font-mono text-xs font-bold text-black border-none outline-none cursor-pointer appearance-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown className="w-4 h-4 stroke-[2.4] text-black shrink-0 pointer-events-none absolute right-2.5" />
                </div>

                <button
                  type="submit"
                  disabled={inviteMutation.isPending || !email.trim()}
                  className="inv-rough-btn inv-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>
                    {inviteMutation.isPending ? "SENDING..." : "SEND"}
                  </span>
                  {/* Fold mark in bottom-right corner */}
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

              {statusMessage && (
                <p
                  className={`font-mono text-xs font-bold ${
                    statusMessage.type === "success"
                      ? "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {statusMessage.text}
                </p>
              )}
            </form>

            {/* Quick Link Copy Row */}
            <div className="inv-rough-card w-full justify-between mt-3.5">
              <div className="font-mono text-xs text-[#524f46] truncate pr-2">
                Anyone with invite link joins as{" "}
                <span className="font-bold text-black">Member</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inv-rough-btn inv-rough-btn--no-shadow text-xs font-bold font-mono text-black shrink-0 flex items-center gap-1.5 py-1.5 px-3"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span>Copy Link</span>
                  </>
                )}
                <svg
                  className="absolute right-0.5 bottom-0.5 w-3 h-3 pointer-events-none z-10"
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

            {/* Workspace Members Section */}
            <div className="mt-5 space-y-2">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]">
                WORKSPACE MEMBERS ({members.length})
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                {members.map((member) => {
                  const initials = (member.name || member.email)
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div
                      key={member.userId}
                      className="inv-rough-card w-full justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full border-2 border-black bg-black text-[#E9FFA3] flex items-center justify-center shrink-0 font-brand-display text-xs font-bold">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-brand-sans font-bold text-black truncate">
                            {member.name || member.email.split("@")[0]}
                          </div>
                          <div className="text-[10px] text-[#555] truncate font-mono">
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-black bg-[#ECE7E0] px-2 py-0.5 border border-black rounded-[2px] flex items-center gap-1">
                          <Shield className="w-3 h-3 stroke-[2.2]" />
                          <span>{member.role}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

           
            <div className="pt-4 flex items-center justify-end border-t border-black/20 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="inv-rough-btn font-brand-sans font-black text-xs uppercase tracking-wider text-black"
              >
                <span>DONE</span>
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
        </div>
      </div>
    </div>
  );
}
