"use client";

import React, { useState } from "react";
import { FolderPlus, Shield, Crown, Trash2, Plus, X, Info } from "lucide-react";
import { useCreateProject } from "@/features/projects/queries/project.mutations";
import { AccessPermission, ProjectMemberAssignment, Role } from "./types";
import { useAuth } from "@/modules/auth/AuthGuard";

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
        await createProjectMutation.mutateAsync({ name: trimmed });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 font-brand-sans">
      <div
        className="w-full max-w-lg bg-[#FFFEFC] dark:bg-[#18191c] text-black dark:text-white border-2 border-black dark:border-white/30 shadow-[8px_10px_0px_0px_#000000] p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b-2 border-black dark:border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-[#E9FFA3] text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
              <FolderPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-roboto-mono text-[10px] uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-semibold mb-0.5">
                WORKSPACE FOLDER
              </div>
              <h2 className="font-brand-display font-bold text-xl text-black dark:text-white tracking-tight">
                Create New Project
              </h2>
              <p className="font-brand-sans text-xs text-[#636363] dark:text-white/60 mt-0.5">
                Set up a project partition and assign team permissions.
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
          {/* Project Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="project-name"
              className="text-xs font-roboto-mono uppercase tracking-wider text-black dark:text-white flex items-center justify-between font-bold"
            >
              <span>PROJECT NAME</span>
              <span className="text-[10px] text-red-600 font-roboto-mono">
                REQUIRED
              </span>
            </label>
            <input
              id="project-name"
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed System Blueprints"
              required
              className="w-full h-9 px-3 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white placeholder:text-[#636363] shadow-[2px_2px_0px_#000000] focus:shadow-[3px_3px_0px_#000000] outline-none font-brand-sans"
            />
          </div>

          {/* Access / Member Permission Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-roboto-mono font-bold uppercase tracking-wider text-black dark:text-white">
                COLLABORATOR ACCESS
              </span>
              <span className="text-[10px] font-roboto-mono text-black dark:text-white bg-[#ECE7E0] dark:bg-black px-2 py-0.5 border border-black font-semibold">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            </div>

            {/* Email input + Role selector + Add button */}
            <div className="flex items-center gap-2">
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
                className="flex-1 h-9 px-3 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white placeholder:text-[#636363] shadow-[2px_2px_0px_#000000] outline-none font-brand-sans"
              />

              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as Role)}
                className="h-9 px-3 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white font-roboto-mono cursor-pointer shadow-[2px_2px_0px_#000000] outline-none"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="owner">Admin</option>
              </select>

              <button
                type="button"
                onClick={() => handleAddMember()}
                className="h-9 px-4 text-xs font-bold bg-black text-white hover:bg-[#E9FFA3] hover:text-black border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add</span>
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs font-roboto-mono text-red-600 font-bold">
                {errorMessage}
              </p>
            )}

            {/* Members List Cards */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 mt-2">
              {members.map((member) => (
                <div
                  key={member.email}
                  className="p-2.5 border-2 border-black dark:border-white/30 bg-white dark:bg-[#111213] flex items-center justify-between gap-3 shadow-[1px_1px_0px_#000000]"
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
                      <div className="text-xs font-brand-sans font-bold text-black dark:text-white truncate">
                        {member.name || member.email}
                      </div>
                      <div className="text-[10px] text-[#636363] dark:text-white/60 truncate font-roboto-mono">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions or Owner Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {member.isOwner ? (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-black bg-[#E9FFA3] px-2 py-0.5 font-roboto-mono border border-black">
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
                          className="h-7 px-2 text-[11px] bg-white dark:bg-black border border-black text-black dark:text-white font-roboto-mono cursor-pointer outline-none"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                          <option value="owner">Admin</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleMakeOwner(member.email)}
                          title="Make Owner"
                          className="h-7 w-7 border border-black bg-white dark:bg-black hover:bg-[#E9FFA3] text-black dark:text-white hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5 stroke-[2.2]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.email)}
                          title="Remove access"
                          className="h-7 w-7 border border-black bg-white dark:bg-black hover:bg-red-500 text-black dark:text-white hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
            <div className="flex items-start gap-1.5 pt-1 text-[10.5px] text-[#636363] dark:text-white/60 font-roboto-mono">
              <Info className="w-3 h-3 text-black dark:text-white shrink-0 mt-0.5" />
              <span>
                Owner and Editors possess write access. Viewers are restricted
                to read-only mode.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-black dark:border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border-2 border-black bg-white dark:bg-[#111213] text-black dark:text-white hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-[#E9FFA3] hover:text-black border-2 border-black shadow-[3px_3px_0px_#000000] disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
