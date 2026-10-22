"use client";

import React, { useState } from "react";
import {
  FolderPlus,
  Shield,
  Crown,
  Trash2,
  Plus,
  X,
  Info,
  ChevronDown,
} from "lucide-react";
import { useCreateProject } from "@/features/projects/queries/project.mutations";
import { projectApi } from "@/features/projects/api/project.api";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import { useQuery } from "@tanstack/react-query";
import { AccessPermission, ProjectMemberAssignment, Role } from "./types";
import { useAuth } from "@/modules/auth/AuthGuard";
import { SpiralBinding } from "./SpiralBinding";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  onCreateProject?: (data: {
    name: string;
    access: AccessPermission;
    members: ProjectMemberAssignment[];
  }) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  onCreateProject,
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<Role>("editor");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createProjectMutation = useCreateProject(workspaceId || "");
  const { data: workspaceMemberList = [] } = useQuery(
    workspaceQueries.members(workspaceId || ""),
  );

  const ownerEmail = user?.email || "";
  const ownerName = user?.name || ownerEmail.split("@")[0] || "Workspace Owner";

  const [members, setMembers] = useState<ProjectMemberAssignment[]>(() => [
    {
      name: ownerName,
      email: ownerEmail,
      role: "owner",
      isOwner: true,
    },
  ]);

  if (!isOpen) return null;

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newMemberEmail.trim().toLowerCase();
    if (!trimmed) return;

    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === trimmed)) {
      setErrorMessage("This person has already been added.");
      return;
    }

    const nameFromEmail = trimmed
      .split("@")[0]
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    setMembers((prev) => [
      ...prev,
      {
        name: nameFromEmail || "Collaborator",
        email: trimmed,
        role: newMemberRole,
        isOwner: false,
      },
    ]);
    setNewMemberEmail("");
    setErrorMessage(null);
  };

  const handleRemoveMember = (email: string) => {
    setMembers((prev) => prev.filter((m) => m.email !== email));
  };

  const handleRoleChange = (email: string, role: Role) => {
    setMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role } : m)),
    );
  };

  const handleMakeOwner = (email: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.email === email) {
          return { ...m, role: "owner", isOwner: true };
        }
        if (m.isOwner) {
          return { ...m, role: "editor", isOwner: false };
        }
        return m;
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (workspaceId) {
      try {
        const createdProject = await createProjectMutation.mutateAsync({
          name: trimmed,
        });

        // Grant editor permissions to any assigned editors
        const editorAssignments = members.filter(
          (m) => m.role === "editor" && !m.isOwner,
        );
        for (const ea of editorAssignments) {
          const match = workspaceMemberList.find(
            (wm) => wm.email.toLowerCase() === ea.email.toLowerCase(),
          );
          if (match && match.role === "member") {
            try {
              await projectApi.addEditor(createdProject.id, {
                userId: match.userId,
              });
            } catch {
              // Ignore if already editor
            }
          }
        }

        setName("");
        setNewMemberEmail("");
        setErrorMessage(null);
        onClose();
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to create project",
        );
      }
    } else if (onCreateProject) {
      onCreateProject({
        name: trimmed,
        access: "workspace",
        members,
      });
      setName("");
      setNewMemberEmail("");
      setErrorMessage(null);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      {/* SVG Displacement Filters for Torn-Paper Borders (§15) */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="proj-r1" x="-4%" y="-8%" width="108%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.07"
              numOctaves="3"
              seed="5"
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
          <filter id="proj-r2" x="-4%" y="-8%" width="108%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.08"
              numOctaves="3"
              seed="13"
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

      {/* Scoped CSS for .rough controls (§15) */}
      <style>{`
        .proj-rough-btn {
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
        .proj-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#proj-r1);
        }
        .proj-rough-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#proj-r2);
        }
        .proj-rough-btn:active {
          transform: translate(2px, 3px);
          --sx: 2px;
          --sy: 2px;
        }
        .proj-rough-btn--lime {
          --fill: #ddfc78;
        }

        .proj-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          --fill: #fffefc;
          border: 0;
          background: none;
          padding: 8px 14px;
        }
        .proj-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#proj-r1);
          pointer-events: none;
        }
      `}</style>

      {/* Modal Notebook Wrapper */}
      <div
        className="relative w-full max-w-[560px] my-6 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tan under-sheet stack peeking out on right & bottom (§17.4) */}
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
          {/* Top Spiral Wire Binding (§17) */}
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={9} />
          </div>

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            {/* Header Area */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Lime Folder Box */}
                <div className="w-12 h-12 border-2 border-black bg-[#E9FFA3] text-black flex items-center justify-center shrink-0 rounded-[3px] shadow-[2px_2px_0px_#000000]">
                  <FolderPlus className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-0.5">
                    WORKSPACE FOLDER
                  </div>
                  <div className="flex items-center">
                    <h2 className="font-brand-sans font-black text-2xl tracking-tight text-[#111] leading-none">
                      Create New Project
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
                    Set up a project partition and assign team permissions.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="proj-rough-btn w-9 h-9 !p-0 flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            {/* Horizontal Ink Rule under Header */}
            <div className="w-full border-b-[1.5px] border-black my-4" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="proj-name-input"
                    className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]"
                  >
                    PROJECT NAME
                  </label>
                  <span className="font-mono text-[10px] font-bold text-red-600 tracking-wider">
                    REQUIRED
                  </span>
                </div>
                <div className="proj-rough-card w-full">
                  <input
                    id="proj-name-input"
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Distributed System Blueprints"
                    required
                    className="w-full bg-transparent font-mono text-xs sm:text-sm font-bold text-black border-none outline-none focus:ring-0 placeholder:text-black/40"
                  />
                </div>
              </div>

              {/* Collaborator Access Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111]">
                    COLLABORATOR ACCESS
                  </span>
                  <span className="font-mono text-[10.5px] font-bold text-black bg-[#ECE7E0] px-2 py-0.5 border border-black rounded-[2px]">
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}
                  </span>
                </div>

                {/* Email input + Role selector + Add button */}
                <div className="flex items-center gap-2">
                  <div className="proj-rough-card flex-1 min-w-0">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      placeholder="colleague@domain.com..."
                      className="w-full bg-transparent font-mono text-xs font-semibold text-black border-none outline-none focus:ring-0 placeholder:text-black/40"
                    />
                  </div>

                  <div className="proj-rough-card w-28 shrink-0 relative pr-6">
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as Role)}
                      className="w-full bg-transparent font-mono text-xs font-bold text-black border-none outline-none cursor-pointer appearance-none"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="owner">Admin</option>
                    </select>
                    <ChevronDown className="w-4 h-4 stroke-[2.4] text-black shrink-0 pointer-events-none absolute right-2.5" />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddMember()}
                    className="h-9 px-4 text-xs font-mono font-bold bg-black text-white hover:bg-[#E9FFA3] hover:text-black border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:translate-x-0.5 active:translate-y-0.5 rounded-[2px]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add</span>
                  </button>
                </div>

                {errorMessage && (
                  <p className="font-mono text-xs text-red-600 font-bold">
                    {errorMessage}
                  </p>
                )}

                {/* Members List Cards */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5 mt-2">
                  {members.map((member) => (
                    <div
                      key={member.email}
                      className="proj-rough-card w-full justify-between"
                    >
                      {/* Left: Icon & User info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full border-2 border-black bg-black text-[#E9FFA3] flex items-center justify-center shrink-0 font-brand-display text-xs font-bold">
                          {member.isOwner ? (
                            <Shield className="w-3.5 h-3.5 text-[#E9FFA3]" />
                          ) : (
                            (member.name || member.email)[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-brand-sans font-bold text-black truncate">
                            {member.name || member.email}
                          </div>
                          <div className="text-[10px] text-[#555] truncate font-mono">
                            {member.email}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions or Owner Badge */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {member.isOwner ? (
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-black bg-[#E9FFA3] px-2 py-0.5 border border-black rounded-[2px]">
                            OWNER
                          </span>
                        ) : (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(
                                  member.email,
                                  e.target.value as Role,
                                )
                              }
                              className="h-6 px-1.5 text-[11px] bg-white border border-black text-black font-mono cursor-pointer outline-none rounded-[2px]"
                            >
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                              <option value="owner">Admin</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleMakeOwner(member.email)}
                              title="Make Owner"
                              className="h-6 w-6 border border-black bg-white hover:bg-[#E9FFA3] text-black flex items-center justify-center transition-colors cursor-pointer rounded-[2px]"
                            >
                              <Crown className="w-3.5 h-3.5 stroke-[2.2]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.email)}
                              title="Remove access"
                              className="h-6 w-6 border border-black bg-white hover:bg-red-500 text-black hover:text-white flex items-center justify-center transition-colors cursor-pointer rounded-[2px]"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Helper text explaining roles */}
                <div className="flex items-start gap-1.5 pt-1 text-[11px] text-[#524f46] font-mono">
                  <Info className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                  <span>
                    Owner and Editors possess write access. Viewers are
                    restricted to read-only mode.
                  </span>
                </div>
              </div>

              {/* Action Buttons (§15) */}
              <div className="pt-3 flex items-center justify-end gap-3.5 border-t border-black/20">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="proj-rough-btn font-brand-sans font-black text-xs uppercase tracking-wider text-black"
                >
                  <span>CANCEL</span>
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

                {/* Create Project Button */}
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="proj-rough-btn proj-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4 stroke-[2.4]" />
                  <span>CREATE PROJECT</span>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
