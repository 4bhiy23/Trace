"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Lock,
  Archive,
  Folder as FolderIcon,
  Plus,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { TraceLogo } from "@/modules/auth/TraceLogo";
import { useAuth } from "@/modules/auth/AuthGuard";
import { WorkspaceFolder } from "./types";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  currentView: "all" | "private" | "archive" | string; // string can be folder id
  onSelectView: (view: "all" | "private" | "archive" | string) => void;
  folders: WorkspaceFolder[];
  onAddFolder: (name: string) => void;
  onOpenNewFileModal: () => void;
}

export function WorkspaceSidebar({
  currentView,
  onSelectView,
  folders,
  onAddFolder,
  onOpenNewFileModal,
}: WorkspaceSidebarProps) {
  const { user, signOut } = useAuth();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [teamName, setTeamName] = useState(() => {
    const name = user?.name || user?.email?.split("@")[0] || "User";
    return `${name}’s TEAM`;
  });

  useEffect(() => {
    if (user?.name || user?.email) {
      const name = user.name || user.email.split("@")[0];
      setTeamName(`${name}’s TEAM`);
    }
  }, [user]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName("");
      setIsAddingFolder(false);
    }
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--foreground)] select-none transition-colors duration-200">
      {/* Team / Workspace Switcher */}
      <div className="relative p-3.5 border-b border-[var(--sidebar-border)]/70">
        <button
          type="button"
          onClick={() => setTeamMenuOpen(!teamMenuOpen)}
          className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--card)]/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <TraceLogo size={28} showWordmark={false} />
            <span className="font-semibold text-sm tracking-tight truncate text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              {teamName}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-transform duration-200" />
        </button>

        {teamMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setTeamMenuOpen(false)}
            />
            <div className="absolute left-3.5 right-3.5 top-full mt-1 z-50 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-2 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-1">
                Workspaces
              </div>
              <button
                type="button"
                onClick={() => {
                  setTeamName("User’s TEAM");
                  setTeamMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--primary)]/10 text-[var(--foreground)] hover:bg-[var(--primary)]/15 transition-colors cursor-pointer"
              >
                <span>User’s TEAM</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamName("Engineering Diagrams");
                  setTeamMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/30 transition-colors cursor-pointer mt-1"
              >
                <span>Engineering Diagrams</span>
              </button>
              <div className="border-t border-[var(--border)] my-1.5" />
              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter new workspace name:");
                  if (name) setTeamName(name);
                  setTeamMenuOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Workspace</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Core Nav items */}
        <div className="space-y-1">
          {/* All Files */}
          <button
            type="button"
            onClick={() => onSelectView("all")}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
              currentView === "all"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/40",
            )}
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4" />
              <span>All Files</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--secondary)]/50 text-[var(--muted-foreground)]">
              A
            </kbd>
          </button>

          {/* Private Files */}
          <button
            type="button"
            onClick={() => onSelectView("private")}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
              currentView === "private"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/40",
            )}
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4" />
              <span>Private Files</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--secondary)]/50 text-[var(--muted-foreground)]">
              P
            </kbd>
          </button>

          {/* Archive */}
          <button
            type="button"
            onClick={() => onSelectView("archive")}
            className={cn(
              "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
              currentView === "archive"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)] font-semibold"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/40",
            )}
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--secondary)]/50 text-[var(--muted-foreground)]">
              E
            </kbd>
          </button>
        </div>

        {/* TEAM FOLDERS section */}
        <div>
          <div className="flex items-center justify-between px-2.5 py-1 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Team Folders
            </span>
            <button
              type="button"
              onClick={() => setIsAddingFolder(true)}
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/60 transition-colors cursor-pointer"
              title="Add Folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add folder inline form */}
          {isAddingFolder && (
            <form onSubmit={handleCreateFolder} className="px-2 mb-2">
              <input
                autoFocus
                type="text"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (!newFolderName.trim()) setIsAddingFolder(false);
                }}
                className="w-full px-2.5 py-1 text-xs rounded-md bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--ring)]"
              />
            </form>
          )}

          {/* Folder items */}
          <div className="space-y-0.5">
            {folders.map((folder) => {
              const isSelected = currentView === `folder:${folder.name}`;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => onSelectView(`folder:${folder.name}`)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group",
                    isSelected
                      ? "bg-[var(--card)] text-[var(--foreground)] font-medium border border-[var(--border)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/40",
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FolderIcon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)]/80">
                    {folder.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer with New File button */}
      <div className="p-3 border-t border-[var(--sidebar-border)]">
        <button
          type="button"
          onClick={onOpenNewFileModal}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs bg-[var(--primary)] hover:opacity-90 active:scale-[0.98] text-[var(--primary-foreground)] border border-[var(--border)] shadow-sm transition-all duration-150 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="font-semibold tracking-tight">New File</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[var(--primary-foreground)]/15 text-[var(--primary-foreground)]">
              ^ N
            </kbd>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* User profile & sign out */}
      {user && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-semibold text-white shrink-0 shadow-xs">
                {(user.name || user.email || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-[var(--foreground)] truncate">
                  {user.name || "User"}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
