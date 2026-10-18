"use client";

import React, { useState } from "react";
import { X, Send, Copy, Check, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import { useInviteMember } from "@/features/workspaces/queries/workspace.mutations";
import type { InviteRole } from "@/features/workspaces/types/workspace.types";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 font-brand-sans">
      <div
        className="w-full max-w-md bg-[#FFFEFC] dark:bg-[#18191c] text-black dark:text-white border-2 border-black dark:border-white/30 shadow-[8px_10px_0px_0px_#000000] p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-black dark:border-white/20">
          <div>
            <div className="font-roboto-mono text-[10px] uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-semibold mb-0.5">
              WORKSPACE INVITATION
            </div>
            <h2 className="font-brand-display font-bold text-xl text-black dark:text-white tracking-tight">
              {workspaceName
                ? `Invite to ${workspaceName}`
                : "Invite to Workspace"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-black hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              autoFocus
              type="email"
              placeholder="colleague@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white placeholder:text-[#636363] shadow-[2px_2px_0px_#000000] focus:shadow-[3px_3px_0px_#000000] outline-none font-brand-sans"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as InviteRole)}
              className="px-2.5 py-2 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white cursor-pointer font-roboto-mono shadow-[2px_2px_0px_#000000] outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviteMutation.isPending || !email.trim()}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-[#E9FFA3] hover:text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Send className="w-3 h-3 stroke-[2.2]" />
              <span>{inviteMutation.isPending ? "Sending..." : "Send"}</span>
            </button>
          </div>

          {statusMessage && (
            <p
              className={`text-xs font-roboto-mono font-bold ${
                statusMessage.type === "success"
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {statusMessage.text}
            </p>
          )}
        </form>

        {/* Quick link copy */}
        <div className="mt-4 p-3 bg-white dark:bg-[#111213] border-2 border-black dark:border-white/30 shadow-[2px_2px_0px_#000000] flex items-center justify-between">
          <div className="text-xs text-[#636363] dark:text-white/70 truncate pr-2">
            Anyone with invite link joins as{" "}
            <span className="font-bold text-black dark:text-white">Member</span>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#ECE7E0] dark:bg-black text-black dark:text-white border-2 border-black hover:bg-[#E9FFA3] hover:text-black transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                <span className="font-roboto-mono text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 stroke-[2.2]" />
                <span className="font-roboto-mono text-[11px]">Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Members List */}
        <div className="mt-5">
          <div className="text-[10px] font-roboto-mono uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-bold mb-2">
            WORKSPACE MEMBERS ({members.length})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {members.map((member) => {
              const initials = (member.name || member.email)
                .slice(0, 2)
                .toUpperCase();
              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2 border-2 border-black dark:border-white/20 bg-white dark:bg-[#111213] text-xs shadow-[1px_1px_0px_#000000]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full text-white bg-black border-2 border-black dark:border-white flex items-center justify-center text-[10px] font-brand-display font-bold">
                      {initials}
                    </div>
                    <div className="truncate">
                      <div className="font-brand-sans font-bold text-black dark:text-white truncate">
                        {member.name || member.email.split("@")[0]}
                      </div>
                      <div className="text-[10px] font-roboto-mono text-[#636363] dark:text-white/60 truncate">
                        {member.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] font-roboto-mono font-semibold text-black dark:text-white">
                    <Shield className="w-3 h-3 text-black dark:text-white stroke-[2]" />
                    <span className="uppercase">{member.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
