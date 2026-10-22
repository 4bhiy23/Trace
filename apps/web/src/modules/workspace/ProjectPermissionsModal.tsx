"use client";

import React, { useState } from "react";
import { Shield, X, Eye, Edit3, Check, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import { projectQueries } from "@/features/projects/queries/project.options";
import { projectKeys } from "@/features/projects/queries/project.keys";
import {
  useAddProjectEditor,
  useRemoveProjectEditor,
} from "@/features/projects/queries/project.mutations";
import { WorkspaceProject } from "./types";
import { SpiralBinding } from "./SpiralBinding";

interface ProjectPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorkspaceProject;
  workspaceId: string;
}

export function ProjectPermissionsModal({
  isOpen,
  onClose,
  project,
  workspaceId,
}: ProjectPermissionsModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch workspace members to list everyone who can be granted access
  const { data: members = [], isLoading: isLoadingMembers } = useQuery(
    workspaceQueries.members(workspaceId),
  );

  // Fetch explicit project editors
  const { data: editors = [], isLoading: isLoadingEditors } = useQuery(
    projectQueries.editors(project.id),
  );

  const addEditorMutation = useAddProjectEditor(project.id);
  const removeEditorMutation = useRemoveProjectEditor(project.id);

  if (!isOpen) return null;

  const editorUserIds = new Set(editors.map((e) => e.userId));

  const handleGrantEditor = async (userId: string) => {
    setErrorMessage(null);
    try {
      await addEditorMutation.mutateAsync({ userId });
      queryClient.invalidateQueries({
        queryKey: projectKeys.listByWorkspace(workspaceId),
      });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to grant editor access",
      );
    }
  };

  const handleRevokeEditor = async (userId: string) => {
    setErrorMessage(null);
    try {
      await removeEditorMutation.mutateAsync(userId);
      queryClient.invalidateQueries({
        queryKey: projectKeys.listByWorkspace(workspaceId),
      });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to revoke editor access",
      );
    }
  };

  const isLoading = isLoadingMembers || isLoadingEditors;

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
          <filter id="perm-r1" x="-4%" y="-8%" width="108%" height="116%">
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
          <filter id="perm-r2" x="-4%" y="-8%" width="108%" height="116%">
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
        .perm-rough-btn {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          --fill: #fffefc;
          --sx: 3px;
          --sy: 4px;
          cursor: pointer;
          border: 0;
          background: none;
          padding: 8px 16px;
          transition: transform 0.08s ease;
        }
        .perm-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#perm-r1);
        }
        .perm-rough-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#perm-r2);
        }
        .perm-rough-btn:active {
          transform: translate(1.5px, 2px);
          --sx: 1.5px;
          --sy: 1.5px;
        }
        .perm-rough-btn--lime {
          --fill: #ddfc78;
        }

        .perm-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          --fill: #fffefc;
          border: 0;
          background: none;
          padding: 8px 14px;
        }
        .perm-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#perm-r1);
          pointer-events: none;
        }
      `}</style>

      <div
        className="relative w-full max-w-[560px] my-6 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute -right-3.5 -bottom-3.5 top-4 left-3 bg-[#111] rounded-r-2xl rounded-b-xl pointer-events-none -z-20"
          aria-hidden="true"
        />

        <div
          className="absolute -right-2.5 -bottom-2 top-3.5 left-2 bg-[#f2e3a7] border-2 border-[#111] rounded-r-xl rounded-b-lg pointer-events-none -z-10 shadow-[2px_3px_0px_rgba(0,0,0,0.18)]"
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

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 border-2 border-black bg-[#E9FFA3] text-black flex items-center justify-center shrink-0 rounded-[3px] shadow-[2px_2px_0px_#000000]">
                  <Shield className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-0.5">
                    PROJECT PERMISSIONS
                  </div>
                  <div className="flex items-center">
                    <h2 className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none truncate">
                      {project.name}
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
                    Grant or restrict opening and editing access for workspace
                    members.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="perm-rough-btn w-9 h-9 !p-0 flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            <div className="w-full border-b-[1.5px] border-black my-4" />

            {errorMessage && (
              <div className="mb-4 p-3 bg-[#FFF1F0] border-2 border-[#E03E2D] rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#E03E2D] font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]">
                  WORKSPACE COLLABORATORS ({members.length})
                </span>
                <span className="font-mono text-[10.5px] text-[#555] font-semibold">
                  {editors.length} with explicit edit grants
                </span>
              </div>

              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-[#666]">
                    Loading permissions...
                  </span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {members.map((member) => {
                    const isOwner = member.role === "owner";
                    const isAdmin = member.role === "admin";
                    const isExplicitEditor = editorUserIds.has(member.userId);
                    const initials = (member.name || member.email)
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={member.userId}
                        className="perm-rough-card w-full justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full border-2 border-black bg-black text-[#E9FFA3] flex items-center justify-center shrink-0 font-brand-display text-xs font-bold">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-brand-sans font-bold text-black truncate flex items-center gap-1.5">
                              <span>
                                {member.name || member.email.split("@")[0]}
                              </span>
                              {isOwner && (
                                <span className="text-[10px] bg-black text-[#E9FFA3] px-1 rounded-[2px] font-mono font-bold uppercase">
                                  Owner
                                </span>
                              )}
                              {isAdmin && (
                                <span className="text-[10px] bg-[#ece7e0] text-black border border-black px-1 rounded-[2px] font-mono font-bold uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#555] truncate font-mono">
                              {member.email}
                            </div>
                          </div>
                        </div>

                        {/* Permission Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isOwner || isAdmin ? (
                            <span className="font-mono text-[10.5px] font-bold text-[#636056] bg-[#ECE7E0] px-2.5 py-1 border border-black/40 rounded-[2px]">
                              Full Access
                            </span>
                          ) : isExplicitEditor ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase bg-[#E9FFA3] text-black px-2 py-0.5 border border-black rounded-[2px]">
                                <Edit3 className="w-3 h-3 stroke-[2.2]" />
                                <span>Editor</span>
                              </span>
                              <button
                                type="button"
                                disabled={removeEditorMutation.isPending}
                                onClick={() =>
                                  handleRevokeEditor(member.userId)
                                }
                                className="px-2.5 py-1 text-[10.5px] font-mono font-bold border border-black/60 bg-white text-black hover:bg-black/5 rounded-[2px] cursor-pointer transition-colors"
                              >
                                {removeEditorMutation.isPending
                                  ? "..."
                                  : "Make Viewer"}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase bg-[#ECE7E0] text-black px-2 py-0.5 border border-black/40 rounded-[2px]">
                                <Eye className="w-3 h-3 stroke-[2.2]" />
                                <span>Viewer</span>
                              </span>
                              <button
                                type="button"
                                disabled={addEditorMutation.isPending}
                                onClick={() => handleGrantEditor(member.userId)}
                                className="px-2.5 py-1 text-[10.5px] font-mono font-bold border-2 border-black bg-[#E9FFA3] text-black hover:bg-black hover:text-[#E9FFA3] shadow-[1px_1px_0px_#000] rounded-[2px] cursor-pointer transition-all"
                              >
                                {addEditorMutation.isPending
                                  ? "..."
                                  : "Make Editor"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-black/20 mt-4">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#555]">
                <div className="w-3.5 h-3.5 border border-black rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">
                  i
                </div>
                <span>
                  All workspace members can view this project by default. Grant
                  editor access to allow members to create and edit canvases.
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="perm-rough-btn perm-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.4]" />
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
