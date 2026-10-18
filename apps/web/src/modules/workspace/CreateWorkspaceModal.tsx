"use client";

import React, { useState } from "react";
import { Layers, X, Users, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useCreateWorkspace } from "@/features/workspaces/queries/workspace.mutations";
import { WorkspaceItem } from "./types";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace?: (workspace: WorkspaceItem) => void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreateWorkspace,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createWorkspaceMutation = useCreateWorkspace();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a workspace name.");
      return;
    }

    setErrorMessage(null);

    try {
      const created = await createWorkspaceMutation.mutateAsync({
        name: trimmed,
      });
      if (onCreateWorkspace) {
        onCreateWorkspace({
          id: created.id,
          name: created.name,
          ownerId: created.ownerId,
          isDefault: created.isDefault ?? false,
          role: created.role ?? "owner",
          membersCount: 1,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        });
      }
      setName("");
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create workspace on the server.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 font-brand-sans">
      <div
        className="w-full max-w-lg bg-[#FFFEFC] dark:bg-[#18191c] text-black dark:text-white border-2 border-black dark:border-white/30 shadow-[8px_10px_0px_0px_#000000] p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b-2 border-black dark:border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-[#E9FFA3] text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
              <Layers className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-roboto-mono text-[10px] uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-semibold mb-0.5">
                COLLABORATION WORKSPACE
              </div>
              <h2 className="font-brand-display font-bold text-xl text-black dark:text-white tracking-tight">
                Add Workspace
              </h2>
              <p className="font-brand-sans text-xs text-[#636363] dark:text-white/60 mt-0.5">
                Create a shared collaboration workspace for your team and
                projects.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-black hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Workspace Name Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="workspace-name"
              className="block font-brand-sans font-bold text-xs uppercase tracking-wider text-black dark:text-white"
            >
              WORKSPACE NAME <span className="text-red-500">*</span>
            </label>
            <input
              id="workspace-name"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Systems, Platform Engineering, Sprint 42"
              className="w-full h-10 px-3 border-2 border-black dark:border-white/30 bg-white dark:bg-[#111213] text-sm text-black dark:text-white font-brand-sans placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#E9FFA3] focus:border-black"
              required
            />
          </div>

          {/* Architecture comparison box */}
          <div className="p-3 border-2 border-black/20 dark:border-white/20 bg-black/[0.02] dark:bg-white/[0.02] space-y-2">
            <div className="text-[11px] font-roboto-mono font-bold uppercase tracking-wider text-[#555555] dark:text-white/70 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Workspace Types</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 border border-black/15 dark:border-white/15 bg-white dark:bg-[#1f2024]">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-black dark:text-white mb-0.5">
                  <Lock className="w-3 h-3 text-[#636363] dark:text-white/60" />
                  <span>Default Private Workspace</span>
                </div>
                <p className="text-[10px] text-[#636363] dark:text-white/60 font-roboto-mono">
                  Personal, default canvas storage for draft diagrams and
                  private files.
                </p>
              </div>
              <div className="p-2 border border-black bg-[#E9FFA3]/30 dark:bg-[#E9FFA3]/10">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-black dark:text-white mb-0.5">
                  <Users className="w-3 h-3 text-black dark:text-white" />
                  <span>Collab Workspace</span>
                </div>
                <p className="text-[10px] text-[#444444] dark:text-white/70 font-roboto-mono">
                  Multi-user collaboration. Supports team invites, shared
                  projects, and canvas sync.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border-2 border-red-500 text-red-600 dark:text-red-400 text-xs font-roboto-mono">
              {errorMessage}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t-2 border-black/15 dark:border-white/15">
            <button
              type="button"
              onClick={onClose}
              disabled={createWorkspaceMutation.isPending}
              className="px-4 py-2 text-xs font-brand-sans font-bold uppercase tracking-wider border-2 border-black dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkspaceMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-xs font-brand-sans font-bold uppercase tracking-wider bg-[#E9FFA3] text-black border-2 border-black shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>
                {createWorkspaceMutation.isPending
                  ? "Creating..."
                  : "Create Workspace"}
              </span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
