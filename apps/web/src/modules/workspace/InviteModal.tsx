"use client";

import React, { useState } from "react";
import { X, Send, Copy, Check, Users, Shield } from "lucide-react";
import { teamMembers } from "./mockData";
import { Role } from "./types";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [copied, setCopied] = useState(false);
  const [invitedMessage, setInvitedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setInvitedMessage(`Invite sent to ${email} as ${role}!`);
      setEmail("");
      setTimeout(() => setInvitedMessage(null), 3000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/join/team-workspace`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--foreground)]" />
            <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)]">
              Invite to User’s TEAM
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              autoFocus
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="px-2 py-1.5 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] cursor-pointer focus:outline-none"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 border border-[var(--border)] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </div>

          {invitedMessage && (
            <p className="text-xs text-emerald-500 font-medium">
              {invitedMessage}
            </p>
          )}
        </form>

        {/* Quick link copy */}
        <div className="mt-4 p-2.5 rounded-xl bg-[var(--secondary)]/25 border border-[var(--border)]/70 flex items-center justify-between">
          <div className="text-xs text-[var(--muted-foreground)] truncate pr-2">
            Anyone with the link can join as{" "}
            <span className="font-semibold text-[var(--foreground)]">
              Viewer
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--card)] hover:bg-[var(--card)]/80 text-[var(--foreground)] border border-[var(--border)] shadow-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Members List */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--muted-foreground)] mb-2">
            Workspace Members ({teamMembers.length})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="flex items-center justify-between py-1.5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${member.color}`}
                  >
                    {member.initials}
                  </div>
                  <div className="truncate">
                    <div className="font-medium text-[var(--foreground)] truncate">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                  <Shield className="w-3 h-3 opacity-60" />
                  <span>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
