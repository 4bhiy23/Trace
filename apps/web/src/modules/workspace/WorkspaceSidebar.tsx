"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  Folder,
  Plus,
  ChevronDown,
  LogOut,
  Send,
  Layers,
  Users,
  User,
  Archive,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/modules/auth/AuthGuard";
import { useLeaveWorkspace } from "@/features/workspaces/queries/workspace.mutations";
import { WorkspaceProject, WorkspaceItem } from "./types";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  projects: WorkspaceProject[];
  archivedProjectsCount?: number;
  onOpenNewProjectModal?: () => void;
  onOpenNewFileModal: () => void;
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenNewWorkspaceModal: () => void;
  onDeleteWorkspace?: (workspace: WorkspaceItem) => void;
  onLeaveWorkspace: () => void;
}

export function WorkspaceSidebar({
  currentView,
  onSelectView,
  projects,
  archivedProjectsCount = 0,
  onOpenNewProjectModal,
  onOpenNewFileModal,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenNewWorkspaceModal,
  onDeleteWorkspace,
  onLeaveWorkspace,
}: WorkspaceSidebarProps) {
  const { user, signOut } = useAuth();
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const leaveWorkspace = useLeaveWorkspace();

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const defaultWorkspace = workspaces.find(
    (w) => w.isDefault && w.ownerId === user?.id,
  );
  const collabWorkspaces = workspaces.filter((w) => w !== defaultWorkspace);
  const canLeaveActiveWorkspace =
    activeWorkspace && activeWorkspace.role !== "owner";

  const handleLeaveWorkspace = async () => {
    if (!activeWorkspace) return;
    setLeaveError(null);
    try {
      await leaveWorkspace.mutateAsync(activeWorkspace.id);
      setIsLeaveOpen(false);
      onLeaveWorkspace();
    } catch (err: unknown) {
      setLeaveError(
        err instanceof Error ? err.message : "Could not leave workspace.",
      );
    }
  };

  return (
    <aside className="w-[296px] shrink-0 flex flex-col h-screen border-r-2 border-black bg-[#FAF7F2] dark:bg-[#141416] grid-paper text-black dark:text-white select-none transition-colors duration-200 font-brand-sans">
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="sb-r1" x="-5%" y="-10%" width="110%" height="120%">
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
              scale="2.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="sb-r2" x="-5%" y="-10%" width="110%" height="120%">
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
              scale="3.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <style>{`
        .sb-rough {
          position: relative;
          isolation: isolate;
          --fill: #ffffff;
          --sx: 3px;
          --sy: 3px;
        }
        .sb-rough::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#sb-r1);
        }
        .sb-rough::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#sb-r2);
        }
        .sb-rough-lime {
          --fill: #e9ffa3;
        }
        .sb-rough:active {
          transform: translate(1.5px, 1.5px);
          --sx: 1.5px;
          --sy: 1.5px;
        }
      `}</style>

      <div className="h-14 px-4 border-b-2 border-black dark:border-white/20 flex items-center justify-start shrink-0">
        <button
          type="button"
          onClick={() => onSelectView("dashboard")}
          className="flex items-center cursor-pointer focus:outline-none transition-opacity hover:opacity-80 active:opacity-60"
          aria-label="Trace Home"
        >
          <Image
            src="/trace_logo.png"
            alt="Trace"
            width={100}
            height={33}
            priority
            className="h-7 w-auto object-contain dark:invert"
          />
        </button>
      </div>

      {/* 1. TOP: WORKSPACE SWITCHER CARD */}
      <div className="pt-5 px-3.5 pb-2 shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => setTeamMenuOpen(!teamMenuOpen)}
            className="sb-rough w-full flex items-center justify-between px-2.5 py-2.5 cursor-pointer text-black"
            style={
              {
                "--fill": "#ffffff",
                "--sx": "2.5px",
                "--sy": "2.5px",
              } as React.CSSProperties
            }
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
              <Layers className="w-4 h-4 shrink-0 stroke-[2.2]" />
              <span className="font-sans font-bold text-xs truncate text-black">
                {activeWorkspace?.name || user?.name || "Workspace"}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#ECE7E0] text-black shrink-0 border border-black/30 rounded-[2px] ml-auto">
                {activeWorkspace?.isDefault &&
                activeWorkspace.ownerId === user?.id
                  ? "PRIVATE"
                  : activeWorkspace?.role === "owner"
                    ? "OWNER"
                    : activeWorkspace?.role?.toUpperCase() || "COLLAB"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-black transition-transform duration-200 shrink-0",
                teamMenuOpen && "rotate-180",
              )}
            />
          </button>

          {/* Workspace Dropdown Popover */}
          {teamMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setTeamMenuOpen(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#FAF5EC] dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[5px_6px_0px_#000000] p-2.5 animate-in fade-in-50 zoom-in-95 duration-150 rounded-[3px]">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#636056] dark:text-white/60 px-2 py-1 font-bold">
                  WORKSPACES
                </div>

                {/* Default User Private Workspace */}
                {defaultWorkspace && (
                  <div className="mb-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(defaultWorkspace.id);
                        setTeamMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border-2 rounded-[2px]",
                        activeWorkspaceId === defaultWorkspace.id
                          ? "bg-[#E9FFA3] text-black border-black shadow-[2px_2px_0px_#000000]"
                          : "bg-white dark:bg-[#1f2024] text-black/80 dark:text-white/80 hover:bg-[#E9FFA3]/40 border-black/30 hover:border-black",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                        <span className="truncate">
                          {defaultWorkspace.name}
                        </span>
                      </div>
                      {activeWorkspaceId === defaultWorkspace.id && (
                        <span className="w-2 h-2 bg-black shrink-0" />
                      )}
                    </button>
                  </div>
                )}

                {/* Collaboration Workspaces */}
                {collabWorkspaces.length > 0 && (
                  <div className="space-y-1 mb-1.5">
                    {collabWorkspaces.map((ws) => {
                      const isActive = activeWorkspaceId === ws.id;
                      const isOwner = ws.role === "owner";
                      return (
                        <div
                          key={ws.id}
                          className={cn(
                            "group/ws w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold transition-all border-2 rounded-[2px]",
                            isActive
                              ? "bg-[#E9FFA3] text-black border-black shadow-[2px_2px_0px_#000000]"
                              : "bg-white dark:bg-[#1f2024] text-black/80 dark:text-white/80 hover:bg-[#E9FFA3]/40 border-black/30 hover:border-black",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectWorkspace(ws.id);
                              setTeamMenuOpen(false);
                            }}
                            className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer min-w-0"
                          >
                            <Users className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                            <span className="truncate">{ws.name}</span>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                            {isOwner && onDeleteWorkspace && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTeamMenuOpen(false);
                                  onDeleteWorkspace(ws);
                                }}
                                title="Delete workspace (owner only)"
                                aria-label={`Delete ${ws.name}`}
                                className="opacity-0 group-hover/ws:opacity-100 hover:!opacity-100 p-0.5 rounded text-black/50 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>
                            )}
                            {isActive && (
                              <span className="w-2 h-2 bg-black shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="border-t-[1.5px] border-black/30 dark:border-white/20 my-1.5" />

                <button
                  type="button"
                  onClick={() => {
                    setTeamMenuOpen(false);
                    onOpenNewWorkspaceModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-black bg-[#E9FFA3] hover:bg-[#ddfc78] border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-[2px]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                  <span>Add Workspace</span>
                </button>

                {canLeaveActiveWorkspace && (
                  <>
                    <div className="border-t-[1.5px] border-black/30 dark:border-white/20 my-1.5" />
                    <button
                      type="button"
                      onClick={() => {
                        setTeamMenuOpen(false);
                        setLeaveError(null);
                        setIsLeaveOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#A11B1B] hover:bg-[#FFEEEE] border-2 border-transparent hover:border-[#A11B1B] transition-all cursor-pointer rounded-[2px]"
                    >
                      <LogOut className="w-3.5 h-3.5 stroke-[2.4]" />
                      <span>Leave {activeWorkspace.name}</span>
                    </button>
                  </>
                )}
                {activeWorkspace?.role === "owner" &&
                  !activeWorkspace.isDefault && (
                    <p className="px-2.5 pt-2 text-center font-mono text-[10px] text-black/55 dark:text-white/55">
                      Transfer ownership to leave this workspace.
                    </p>
                  )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-0.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-black dark:text-white shrink-0">
              OVERVIEW
            </span>
            <div className="flex-1 border-b-2 border-dashed border-black/40 dark:border-white/40 h-0" />
          </div>

          <div className="space-y-1.5">
            {currentView === "dashboard" || currentView === "all" ? (
              <button
                type="button"
                onClick={() => onSelectView("dashboard")}
                className="sb-rough sb-rough-lime w-full flex items-center justify-between px-3 py-2.5 cursor-pointer font-sans text-xs font-bold text-black"
                style={
                  {
                    "--sx": "2.5px",
                    "--sy": "2.5px",
                  } as React.CSSProperties
                }
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 stroke-[2.2]" />
                  <span>Dashboard</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-black border border-black shadow-[1px_1px_0px_#000000] rounded-[2px]">
                  D
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectView("dashboard")}
                className="w-full flex items-center justify-between px-3 py-2 text-xs transition-all duration-150 cursor-pointer font-sans font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-[2px]"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 stroke-[2]" />
                  <span>Dashboard</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-black border border-black shadow-[1px_1px_0px_#000000] rounded-[2px]">
                  D
                </span>
              </button>
            )}

            {currentView === "collaborators" ? (
              <button
                type="button"
                onClick={() => onSelectView("collaborators")}
                className="sb-rough sb-rough-lime w-full flex items-center justify-between px-3 py-2.5 cursor-pointer font-sans text-xs font-bold text-black"
                style={
                  { "--sx": "2.5px", "--sy": "2.5px" } as React.CSSProperties
                }
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                  <span>Collaborators</span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectView("collaborators")}
                className="w-full flex items-center px-3 py-2 text-xs transition-all duration-150 cursor-pointer font-sans font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-[2px]"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 stroke-[2]" />
                  <span>Collaborators</span>
                </div>
              </button>
            )}

            {/* Archived Tab Button */}
            {currentView === "archived" ? (
              <button
                type="button"
                onClick={() => onSelectView("archived")}
                className="sb-rough sb-rough-lime w-full flex items-center justify-between px-3 py-2.5 cursor-pointer font-sans text-xs font-bold text-black"
                style={
                  {
                    "--sx": "2.5px",
                    "--sy": "2.5px",
                  } as React.CSSProperties
                }
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 stroke-[2.2]" />
                  <span>Archived</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-black border border-black shadow-[1px_1px_0px_#000000] rounded-[2px]">
                  {String(archivedProjectsCount).padStart(2, "0")}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectView("archived")}
                className="w-full flex items-center justify-between px-3 py-2 text-xs transition-all duration-150 cursor-pointer font-sans font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-[2px]"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 stroke-[2]" />
                  <span>Archived</span>
                </div>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-[#252528] text-black dark:text-white border border-black shadow-[1px_1px_0px_#000000] rounded-[2px]">
                  {String(archivedProjectsCount).padStart(2, "0")}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 px-0.5">
            <button
              type="button"
              onClick={() => onSelectView("project")}
              className={cn(
                "font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer",
                currentView === "project"
                  ? "text-black bg-[#E9FFA3] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] rounded-[2px]"
                  : "text-black dark:text-white hover:underline",
              )}
              title="View Projects"
            >
              PROJECTS
            </button>
            <div className="flex-1 border-b-2 border-dashed border-black/40 dark:border-white/40 h-0" />
            {activeWorkspace?.role !== "member" && onOpenNewProjectModal && (
              <button
                type="button"
                onClick={onOpenNewProjectModal}
                className="sb-rough w-6 h-6 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
                style={
                  {
                    "--fill": "#ffffff",
                    "--sx": "2px",
                    "--sy": "2px",
                  } as React.CSSProperties
                }
                title="Create New Project"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.8] text-black" />
              </button>
            )}
          </div>

          {/* Project items */}
          <div className="space-y-1">
            {projects.map((project) => {
              const isSelected = currentView === `project:${project.id}`;

              return isSelected ? (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectView(`project:${project.id}`)}
                  className="sb-rough sb-rough-lime w-full flex items-center justify-between px-3 py-2 text-xs cursor-pointer font-sans font-bold text-black mb-1"
                  style={
                    {
                      "--sx": "2.5px",
                      "--sy": "2.5px",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 stroke-[2.2] shrink-0" />
                    <span className="truncate font-mono lowercase">
                      {project.name.toLowerCase()}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-black border border-black shadow-[1px_1px_0px_#000000] rounded-[2px]">
                    {project.count}
                  </span>
                </button>
              ) : (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectView(`project:${project.id}`)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs transition-all rounded-[2px] bg-transparent cursor-pointer text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 stroke-[2] shrink-0" />
                    <span className="truncate font-mono lowercase text-xs">
                      {project.name.toLowerCase()}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-[#252528] text-black dark:text-white border border-black shadow-[1px_1px_0px_#000000] rounded-[2px]">
                    {project.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* HAND-DRAWN DIVIDER + NEW FILEE + USER PROFILE */}
      <div className="px-3.5 pb-4 pt-1 space-y-3 shrink-0">
        <div className="w-full px-0.5 py-1">
          <svg
            width="100%"
            height="4"
            viewBox="0 0 260 4"
            fill="none"
            preserveAspectRatio="none"
            className="text-black dark:text-white"
            aria-hidden="true"
          >
            <path
              d="M2 2 C 60 1.2, 120 2.8, 180 1.8 C 210 2.2, 240 1.6, 258 2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={onOpenNewFileModal}
          className="sb-rough sb-rough-lime w-full h-12 flex items-center justify-center gap-2.5 font-mono font-bold text-xs uppercase tracking-wider text-black cursor-pointer transition-transform hover:-translate-y-0.5"
          style={
            {
              "--sx": "3px",
              "--sy": "3px",
            } as React.CSSProperties
          }
        >
          <Send className="w-4 h-4 stroke-[2.6]" />
          <span>NEW FILE</span>
        </button>

        {/* USER PROFILE CARD */}
        {user && (
          <div
            className="sb-rough flex items-center justify-between p-2.5 text-black cursor-default"
            style={
              {
                "--fill": "#ffffff",
                "--sx": "2.5px",
                "--sy": "2.5px",
              } as React.CSSProperties
            }
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full border-2 border-black bg-black text-[#E9FFA3] font-mono flex items-center justify-center text-xs font-bold shrink-0">
                {(user.name || user.email || "S")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-sans font-bold text-black truncate">
                  {user.name || "Sarthak Gupta"}
                </div>
                <div className="text-[10px] font-sans text-[#636363] truncate">
                  {user.email || "guptasarthak229@gmail.com"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="w-7 h-7 border-2 border-black bg-white hover:bg-black hover:text-[#E9FFA3] text-black flex items-center justify-center shadow-[1px_1px_0px_#000000] rounded-[2px] transition-all cursor-pointer shrink-0 ml-2"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        )}
      </div>

      {isLeaveOpen && activeWorkspace && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => !leaveWorkspace.isPending && setIsLeaveOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-workspace-title"
            className="relative w-full max-w-md border-2 border-black bg-[#FAF5EC] p-6 pt-10 text-black shadow-[5px_6px_0px_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLeaveOpen(false)}
              disabled={leaveWorkspace.isPending}
              aria-label="Close dialog"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border-2 border-black bg-white disabled:opacity-50"
            >
              <X className="h-4 w-4 stroke-[2.4]" />
            </button>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#A11B1B]">
              Leave workspace
            </p>
            <h2
              id="leave-workspace-title"
              className="mt-1 font-brand-sans text-xl font-bold"
            >
              Leave {activeWorkspace.name}?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#524F46]">
              You will lose access to this workspace and any project-editor
              grants. You can rejoin only if someone invites you again.
            </p>
            {leaveError && (
              <p className="mt-4 border-2 border-[#A11B1B] bg-[#FFEEEE] p-2 font-mono text-xs text-[#A11B1B]">
                {leaveError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3 border-t border-black/20 pt-4">
              <button
                type="button"
                onClick={() => setIsLeaveOpen(false)}
                disabled={leaveWorkspace.isPending}
                className="border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase disabled:opacity-50"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={() => void handleLeaveWorkspace()}
                disabled={leaveWorkspace.isPending}
                className="flex items-center gap-2 border-2 border-black bg-[#A11B1B] px-3 py-2 font-mono text-xs font-bold uppercase text-white shadow-[2px_2px_0px_#000] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {leaveWorkspace.isPending ? "Leaving…" : "Leave workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
