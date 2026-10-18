"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  FolderKanban,
  Plus,
  ChevronDown,
  LogOut,
  Send,
  Layers,
  Users,
  User,
} from "lucide-react";
import { useAuth } from "@/modules/auth/AuthGuard";
import { WorkspaceProject, WorkspaceItem } from "./types";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  projects: WorkspaceProject[];
  onOpenNewProjectModal: () => void;
  onOpenNewFileModal: () => void;
  workspaces: WorkspaceItem[];
  activeWorkspaceId: string;
  onSelectWorkspace: (workspaceId: string) => void;
  onOpenNewWorkspaceModal: () => void;
}

export function WorkspaceSidebar({
  currentView,
  onSelectView,
  projects,
  onOpenNewProjectModal,
  onOpenNewFileModal,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenNewWorkspaceModal,
}: WorkspaceSidebarProps) {
  const { user, signOut } = useAuth();
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const defaultWorkspace = workspaces.find((w) => w.isDefault);
  const collabWorkspaces = workspaces.filter((w) => !w.isDefault);

  return (
    <aside className="w-64 shrink-0 flex flex-col h-screen border-r-2 border-black bg-[#ECE7E0] dark:bg-[#141416] text-black dark:text-white select-none transition-colors duration-200 font-brand-sans">
      {/* 1. TOP LEFT CORNER: TRACE LOGO (Matches top header line) */}
      <div className="h-14 px-4 bg-white dark:bg-[#111213] border-b-2 border-black dark:border-white/20 flex items-center justify-center shrink-0">
        <button
          type="button"
          onClick={() => onSelectView("dashboard")}
          className="flex items-center justify-center cursor-pointer focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Trace home"
        >
          <Image
            src="/trace_logo.png"
            alt="TRACE"
            width={160}
            height={54}
            priority
            className="h-10 sm:h-11 w-auto max-w-[160px] object-contain dark:invert select-none"
          />
        </button>
      </div>

      {/* 2. WORKSPACE SWITCHER & PRIMARY ACTION */}
      <div className="p-3 border-b-2 border-black/15 dark:border-white/15 space-y-2.5 shrink-0">
        {/* Workspace Switcher Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTeamMenuOpen(!teamMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1c1d20] border-2 border-black dark:border-white/30 shadow-[2px_2px_0px_#000000] hover:bg-black/5 dark:hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
              <span className="font-brand-sans font-bold text-xs truncate text-black dark:text-white">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
              {activeWorkspace?.isDefault && (
                <span className="px-1 py-0.2 text-[9px] font-roboto-mono uppercase bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 border border-black/20 dark:border-white/20 shrink-0">
                  Private
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-black dark:text-white transition-transform duration-200 shrink-0",
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
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#1c1d20] border-2 border-black dark:border-white/30 shadow-[5px_6px_0px_0px_rgba(0,0,0,0.14)] p-2 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="text-[10px] font-roboto-mono uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 px-2 py-1 font-bold">
                  WORKSPACES
                </div>

                {/* Default User Private Workspace */}
                {defaultWorkspace && (
                  <div className="mb-1.5">
                    <div className="text-[9px] font-roboto-mono uppercase tracking-wider text-[#888888] dark:text-white/40 px-2 py-0.5 font-bold flex items-center justify-between">
                      <span>DEFAULT PRIVATE</span>
                      <span className="px-1 py-0.2 text-[8px] bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 font-semibold border border-black/20 dark:border-white/20">
                        PRIVATE
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectWorkspace(defaultWorkspace.id);
                        setTeamMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border-2",
                        activeWorkspaceId === defaultWorkspace.id
                          ? "bg-[#E9FFA3] text-black border-black shadow-[1px_1px_0px_#000000]"
                          : "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 border-transparent hover:border-black/30",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                        <span className="truncate">
                          {defaultWorkspace.name}
                        </span>
                      </div>
                      {activeWorkspaceId === defaultWorkspace.id && (
                        <span className="w-1.5 h-1.5 bg-black shrink-0" />
                      )}
                    </button>
                  </div>
                )}

                {/* Collaboration Workspaces */}
                {collabWorkspaces.length > 0 && (
                  <div className="mb-1.5">
                    <div className="text-[9px] font-roboto-mono uppercase tracking-wider text-[#888888] dark:text-white/40 px-2 py-0.5 font-bold flex items-center justify-between">
                      <span>COLLAB WORKSPACES</span>
                      <span className="px-1 py-0.2 text-[8px] bg-[#D3B8FC]/40 text-black dark:text-white font-semibold border border-black/20 dark:border-white/20">
                        TEAM
                      </span>
                    </div>
                    <div className="space-y-1">
                      {collabWorkspaces.map((ws) => {
                        const isActive = activeWorkspaceId === ws.id;
                        return (
                          <button
                            key={ws.id}
                            type="button"
                            onClick={() => {
                              onSelectWorkspace(ws.id);
                              setTeamMenuOpen(false);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer border-2",
                              isActive
                                ? "bg-[#E9FFA3] text-black border-black font-semibold shadow-[1px_1px_0px_#000000]"
                                : "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 border-transparent hover:border-black/30",
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Users className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" />
                              <span className="truncate">{ws.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] uppercase font-roboto-mono px-1 border border-black/20 text-[#636363] dark:text-white/60">
                                {ws.role}
                              </span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 bg-black shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t-2 border-black/15 dark:border-white/15 my-1.5" />

                {/* + Add Workspace button (replaces + Create New Project) */}
                <button
                  type="button"
                  onClick={() => {
                    setTeamMenuOpen(false);
                    onOpenNewWorkspaceModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black hover:border-black border-2 border-transparent transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Workspace</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. OVERVIEW & PROJECTS SECTIONS */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* OVERVIEW SECTION */}
        <div>
          <div className="px-2 py-1 mb-1.5 font-brand-sans text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            OVERVIEW
          </div>
          <div className="space-y-1">
            {/* Dashboard (Matches Dashboard active button in screenshot) */}
            <button
              type="button"
              onClick={() => onSelectView("dashboard")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm transition-all duration-150 cursor-pointer font-brand-sans rounded-none",
                currentView === "dashboard" || currentView === "all"
                  ? "bg-[#E9FFA3] text-black border-2 border-black font-semibold shadow-[2px_2px_0px_#000000]"
                  : "bg-transparent text-black dark:text-white border-2 border-transparent hover:bg-[#E9FFA3]/40 hover:border-black/30 font-normal",
              )}
            >
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-4 h-4 stroke-[2]" />
                <span className="tracking-tight">Dashboard</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-roboto-mono bg-white dark:bg-[#252528] text-black dark:text-white border border-black/40 font-semibold shadow-2xs">
                D
              </kbd>
            </button>
          </div>
        </div>

        {/* 4. PROJECTS SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 mb-1.5">
            <span className="font-brand-sans text-xs font-bold uppercase tracking-wider text-black dark:text-white">
              PROJECTS
            </span>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="p-1 border border-black bg-white dark:bg-[#1f2023] hover:bg-[#E9FFA3] text-black dark:text-white hover:text-black shadow-[1px_1px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="Create New Project"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Project items */}
          <div className="space-y-1">
            {projects.map((project) => {
              const isSelected = currentView === `project:${project.id}`;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectView(`project:${project.id}`)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-all cursor-pointer font-brand-sans rounded-none",
                    isSelected
                      ? "bg-[#E9FFA3] text-black border-2 border-black font-semibold shadow-[2px_2px_0px_#000000]"
                      : "bg-transparent text-black/85 dark:text-white/85 border-2 border-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:border-black/20",
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderKanban className="w-3.5 h-3.5 shrink-0 stroke-[2]" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <span className="text-[10px] font-roboto-mono font-semibold px-1.5 py-0.2 bg-white/70 dark:bg-black/40 border border-black/20 text-black dark:text-white">
                    {project.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM ACTION & USER PROFILE */}
      <div className="p-3 border-t-2 border-black/15 dark:border-white/15 space-y-2.5 shrink-0">
        {/* Primary Action Button: New File */}
        <button
          type="button"
          onClick={onOpenNewFileModal}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-[#E9FFA3] font-brand-sans font-bold text-xs uppercase tracking-wide text-black shadow-[3px_4px_0px_#000000] hover:shadow-[4px_5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New File</span>
        </button>

        {/* USER PROFILE & SIGN OUT */}
        {user && (
          <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1c1d20] border-2 border-black dark:border-white/30 shadow-[2px_2px_0px_#000000]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full border-2 border-black bg-black text-[#E9FFA3] font-brand-display flex items-center justify-center text-xs font-bold shrink-0">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-brand-sans font-bold text-black dark:text-white truncate">
                  {user.name || "User"}
                </div>
                <div className="text-[10px] font-roboto-mono text-[#636363] dark:text-white/60 truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="p-1 border border-black/40 hover:border-black hover:bg-red-100 hover:text-red-700 text-black dark:text-white transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
