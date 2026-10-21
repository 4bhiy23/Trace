"use client";
import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react";
import { useDeleteWorkspace } from "@/features/workspaces/queries/workspace.mutations";
import { WorkspaceItem } from "./types";
import { SpiralBinding } from "./SpiralBinding";
import { cn } from "@/lib/utils";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceItem | null;
  onDeleted: (workspaceId: string) => void;
}

export function DeleteWorkspaceModal({
  isOpen,
  onClose,
  workspace,
  onDeleted,
}: DeleteWorkspaceModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteWorkspaceMutation = useDeleteWorkspace();

  // Reset input and erro
  useEffect(() => {
    if (isOpen) {
      setConfirmInput("");
      setErrorMessage(null);
    }
  }, [isOpen, workspace]);

  if (!isOpen || !workspace) return null;

  const isConfirmed =
    confirmInput.trim().toLowerCase() === workspace.name.trim().toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setErrorMessage(null);
    try {
      await deleteWorkspaceMutation.mutateAsync(workspace.id);
      onDeleted(workspace.id);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete workspace on the server.";
      setErrorMessage(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] my-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-workspace-title"
      >
        <div
          className="absolute -right-3 -bottom-2.5 top-3.5 left-2 bg-[#e6d6a2] border-2 border-[#111] rounded-r-xl pointer-events-none -z-10 shadow-[4px_6px_0px_rgba(0,0,0,0.22)]"
          aria-hidden="true"
        />

        <div
          className="relative bg-[#FAF5EC] border-2 border-[#111] rounded-lg shadow-[2px_3px_0px_rgba(0,0,0,0.12)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ece3d3 1px, transparent 1px), linear-gradient(#ece3d3 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={11} />
          </div>

          <div className="p-6 pt-12 sm:pt-14 font-brand-sans text-black">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 border-2 border-black bg-[#FFEEEE] text-[#D92D20] flex items-center justify-center shrink-0 rounded-[3px] shadow-[2px_2px_0px_#000000]">
                  <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#D92D20] mb-0.5 flex items-center gap-2">
                    <span>IRREVERSIBLE ACTION</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#FF4D4D] text-white border border-black rounded-[2px]">
                      DANGER
                    </span>
                  </div>
                  <div className="flex items-center">
                    <h2
                      id="delete-workspace-title"
                      className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none"
                    >
                      Delete Workspace
                    </h2>
                  </div>
                  <p className="font-mono text-xs text-[#524f46] mt-1.5 leading-snug">
                    Action requires owner confirmation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="w-9 h-9 border-2 border-black bg-white hover:bg-[#FAF5EC] text-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center cursor-pointer shrink-0 rounded-[2px] transition-all"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            <div className="w-full border-b-[1.5px] border-black my-4" />

            <div className="mb-4 p-3.5 bg-[#FFF3EE] border-2 border-[#D92D20] rounded-[3px] shadow-[2px_2px_0px_rgba(217,45,32,0.15)] text-xs text-black/90 space-y-1.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-black text-sm">
                    Are you sure you want to delete{" "}
                    <span className="underline decoration-[#D92D20] decoration-2">
                      {workspace.name}
                    </span>
                    ?
                  </p>
                  <p className="text-xs text-black/80 leading-relaxed font-sans">
                    This action is <strong>permanent</strong>. All projects,
                    canvases, files, invites, and collaborator permissions in
                    this workspace will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label
                  htmlFor="confirm-workspace-name"
                  className="block font-mono text-xs font-bold uppercase tracking-wider text-black mb-1.5"
                >
                  Type{" "}
                  <span className="underline font-black">
                    "{workspace.name}"
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  id="confirm-workspace-name"
                  type="text"
                  autoFocus
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder={workspace.name}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold bg-white text-black border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#FF4D4D] rounded-[3px] shadow-[2px_2px_0px_#000000]"
                  disabled={deleteWorkspaceMutation.isPending}
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-mono font-bold rounded-[2px] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-black/20">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleteWorkspaceMutation.isPending}
                  className="px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider bg-white hover:bg-stone-100 border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer rounded-[2px] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isConfirmed || deleteWorkspaceMutation.isPending}
                  className={cn(
                    "px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider text-white border-2 border-black flex items-center gap-2 rounded-[2px] transition-all",
                    isConfirmed && !deleteWorkspaceMutation.isPending
                      ? "bg-[#FF4D4D] hover:bg-[#ff3333] shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      : "bg-[#FF4D4D]/40 text-white/70 border-black/40 cursor-not-allowed shadow-none",
                  )}
                >
                  <Trash2 className="w-4 h-4 stroke-[2.4]" />
                  <span>
                    {deleteWorkspaceMutation.isPending
                      ? "Deleting..."
                      : "Delete Workspace"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
