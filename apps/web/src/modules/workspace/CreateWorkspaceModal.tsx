"use client";

import React, { useState } from "react";
import { Layers, X, Users, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useCreateWorkspace } from "@/features/workspaces/queries/workspace.mutations";
import { WorkspaceItem } from "./types";
import { SpiralBinding } from "./SpiralBinding";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace?: (workspace: WorkspaceItem) => void;
}

const Fold = () => (
  <svg
    className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
    viewBox="0 0 16 16"
  >
    <path
      d="M14 2 L2 14"
      stroke="#111"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      {/* SVG Displacement Filters for Torn-Paper Borders */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="ws-r1" x="-4%" y="-8%" width="108%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.07"
              numOctaves="3"
              seed="8"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="ws-r2" x="-4%" y="-8%" width="108%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.08"
              numOctaves="3"
              seed="14"
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
        </defs>
      </svg>

      {/* Scoped CSS for .ws-rough controls */}
      <style>{`
        .ws-rough-btn {
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
        .ws-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#ws-r1);
        }
        .ws-rough-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#ws-r2);
        }
        .ws-rough-btn:active {
          transform: translate(2px, 3px);
          --sx: 2px;
          --sy: 2px;
        }
        .ws-rough-btn--lime {
          --fill: #ddfc78;
        }

        .ws-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          --fill: #fffefc;
          border: 0;
          background: none;
          padding: 10px 14px;
        }
        .ws-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#ws-r1);
          pointer-events: none;
        }
      `}</style>

      {/* Modal Notebook Wrapper */}
      <div
        className="relative w-full max-w-140 my-6 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tan under-sheet stack peeking out on right & bottom */}
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
          {/* Top Spiral Wire Binding */}
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={8} />
          </div>

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            {/* Header Area */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Lime Icon Box */}
                <div className="w-12 h-12 border-2 border-black bg-brand-lime text-black flex items-center justify-center shrink-0 rounded-[3px] shadow-[2px_2px_0px_#000000]">
                  <Layers className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-0.5">
                    COLLABORATION WORKSPACE
                  </div>
                  <div className="flex items-center">
                    <h2 className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none">
                      Add Workspace
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
                    Create a shared collaboration workspace for your team and
                    projects.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="ws-rough-btn w-9 h-9 p-0! flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            {/* Horizontal Ink Rule under Header */}
            <div className="w-full border-b-[1.5px] border-black my-4" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Workspace Name Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="ws-name-input"
                    className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]"
                  >
                    WORKSPACE NAME
                  </label>
                  <span className="font-mono text-[10px] font-bold text-red-600 tracking-wider">
                    REQUIRED
                  </span>
                </div>
                <div className="ws-rough-card w-full">
                  <input
                    id="ws-name-input"
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Design Systems, Platform Engineering, Sprint 42"
                    required
                    className="w-full bg-transparent font-mono text-xs sm:text-sm font-bold text-black border-none outline-none focus:ring-0 placeholder:text-black/40"
                  />
                </div>
              </div>

              {/* Workspace Types Comparison Box */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]">
                    WORKSPACE TYPES
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Default Private Workspace Card */}
                  <div
                    className="ws-rough-card flex-col items-start p-3.5! w-full cursor-default"
                    style={
                      {
                        "--fill": "#ffffff",
                        "--sx": "2px",
                        "--sy": "3px",
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-black mb-1">
                      <Lock className="w-3.5 h-3.5 text-neutral-600 stroke-[2.2]" />
                      <span>Default Private</span>
                    </div>
                    <p className="font-mono text-[11px] text-[#524f46] leading-relaxed">
                      Personal, default canvas storage for draft diagrams and
                      private files.
                    </p>
                  </div>

                  {/* Collab Workspace Card */}
                  <div
                    className="ws-rough-card flex-col items-start p-3.5! w-full cursor-default"
                    style={
                      {
                        "--fill": "#E9FFA3",
                        "--sx": "3px",
                        "--sy": "4px",
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-black">
                        <Users className="w-3.5 h-3.5 text-black stroke-[2.2]" />
                        <span>Collab Workspace</span>
                      </div>
                      <span className="font-mono text-[9px] font-bold uppercase bg-black text-brand-lime px-1.5 py-0.5 rounded-xs tracking-wider">
                        NEW
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-[#222222] leading-relaxed">
                      Multi-user collaboration. Supports team invites, shared
                      projects, and canvas sync.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="p-2.5 bg-red-100 border-2 border-red-500 text-red-700 text-xs font-mono font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-[1.5px] border-black/20">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={createWorkspaceMutation.isPending}
                  className="ws-rough-btn font-mono text-xs font-bold uppercase tracking-wider text-[#111]"
                  style={
                    {
                      "--fill": "#ffffff",
                      "--sx": "2px",
                      "--sy": "3px",
                    } as React.CSSProperties
                  }
                >
                  <Fold />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={createWorkspaceMutation.isPending}
                  className="ws-rough-btn ws-rough-btn--lime font-mono text-xs font-black uppercase tracking-wider text-[#111]"
                  style={
                    {
                      "--sx": "3px",
                      "--sy": "4px",
                    } as React.CSSProperties
                  }
                >
                  <Fold />
                  <span className="flex items-center">
                    {createWorkspaceMutation.isPending
                      ? "Creating..."
                      : "Create Workspace"}
                    <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
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
