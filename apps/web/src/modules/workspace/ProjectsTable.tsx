"use client";

import React, { useState } from "react";
import {
  FolderKanban,
  ArrowRight,
  MoreHorizontal,
  Edit3,
  Trash2,
  FolderOpen,
  Plus,
} from "lucide-react";
import { WorkspaceProject, WorkspaceFile } from "./types";
import { cn } from "@/lib/utils";

interface ProjectsTableProps {
  projects: WorkspaceProject[];
  files: WorkspaceFile[];
  onSelectProject: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenNewProjectModal?: () => void;
}

export function ProjectsTable({
  projects,
  files,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onOpenNewProjectModal,
}: ProjectsTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleStartRename = (
    e: React.MouseEvent,
    project: WorkspaceProject,
  ) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditingName(project.name);
    setActiveMenuId(null);
  };

  const handleFinishRename = (projectId: string) => {
    if (editingName.trim() && onRenameProject) {
      onRenameProject(projectId, editingName.trim());
    }
    setEditingProjectId(null);
    setEditingName("");
  };

  return (
    <div className="w-full bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[5px_6px_0px_0px_rgba(0,0,0,0.14)] font-brand-sans">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-brand-sans font-bold uppercase tracking-wider text-black dark:text-white bg-[#ECE7E0] dark:bg-[#202227] border-b-2 border-black dark:border-white/30 select-none">
        <div className="col-span-5 flex items-center gap-1.5">
          <span>Project Name</span>
        </div>
        <div className="col-span-2 hidden sm:flex items-center gap-1.5">
          <span>Canvases</span>
        </div>
        <div className="col-span-2 hidden md:flex items-center gap-1.5">
          <span>Access Level</span>
        </div>
        <div className="col-span-2 hidden lg:flex items-center gap-1.5">
          <span>Last Updated</span>
        </div>
        <div className="col-span-7 sm:col-span-5 md:col-span-3 lg:col-span-1 text-right">
          Action
        </div>
      </div>

      {/* Table Rows */}
      {projects.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#636363] dark:text-white/60">
          <p className="font-brand-display font-bold text-base text-black dark:text-white">
            No projects found
          </p>
          <p className="text-xs font-roboto-mono mt-1 text-[#636363] dark:text-white/60">
            Create a project to start organizing your canvases.
          </p>
          {onOpenNewProjectModal && (
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E9FFA3] text-black border-2 border-black font-brand-sans font-bold text-xs shadow-[2px_2px_0px_#000000] hover:bg-black hover:text-[#E9FFA3] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-black/15 dark:divide-white/10">
          {projects.map((project) => {
            const isMenuOpen = activeMenuId === project.id;
            const actualCanvasCount = files.filter(
              (f) => f.projectId === project.id,
            ).length;
            const count =
              actualCanvasCount > 0 ? actualCanvasCount : project.count || 0;
            const isPrivate = project.access === "private";

            return (
              <div
                key={project.id}
                className="group relative grid grid-cols-12 gap-3 px-4 py-3.5 items-center text-xs hover:bg-[#fafbe9] dark:hover:bg-[#202227]/80 transition-colors duration-150 cursor-pointer"
                onClick={() => {
                  if (!editingProjectId) {
                    onSelectProject(project.id);
                  }
                }}
              >
                {/* Col 5: Name & Icon */}
                <div className="col-span-5 flex items-center gap-3 min-w-0 pr-2">
                  <div className="shrink-0 p-1.5 border border-black bg-white dark:bg-black text-black dark:text-white shadow-[1px_1px_0px_#000000] group-hover:bg-[#E9FFA3] group-hover:text-black transition-colors">
                    <FolderKanban className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  {editingProjectId === project.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishRename(project.id);
                        if (e.key === "Escape") setEditingProjectId(null);
                      }}
                      onBlur={() => handleFinishRename(project.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-0.5 text-xs font-brand-sans font-bold bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none"
                    />
                  ) : (
                    <div className="truncate">
                      <span className="font-brand-sans font-bold text-xs sm:text-sm text-black dark:text-white group-hover:underline">
                        {project.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Col 2: Canvases Count */}
                <div className="col-span-2 hidden sm:flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-roboto-mono uppercase tracking-wider font-bold border border-black bg-white dark:bg-[#252528] text-black dark:text-white shadow-[1px_1px_0px_#000000]">
                    {count} {count === 1 ? "Canvas" : "Canvases"}
                  </span>
                </div>

                {/* Col 2: Access Badge */}
                <div className="col-span-2 hidden md:flex items-center">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 text-[10px] font-roboto-mono uppercase tracking-wider font-bold border border-black",
                      isPrivate
                        ? "bg-[#D3B8FC] text-black"
                        : "bg-[#E9FFA3] text-black",
                    )}
                  >
                    {isPrivate ? "Restricted" : "Workspace"}
                  </span>
                </div>

                {/* Col 2: Last Updated */}
                <div className="col-span-2 hidden lg:flex items-center font-roboto-mono text-xs text-[#636363] dark:text-white/60">
                  {project.updatedAt || project.createdAt || "Recent"}
                </div>

                {/* Col 1: Action (Open + Context Menu) */}
                <div className="col-span-7 sm:col-span-5 md:col-span-3 lg:col-span-1 flex items-center justify-end gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-roboto-mono font-bold uppercase tracking-wider text-black dark:text-white group-hover:bg-[#E9FFA3] group-hover:text-black border border-transparent group-hover:border-black transition-all">
                    Open
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </span>

                  {/* Context menu trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Project actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : project.id);
                      }}
                      className="p-1 border border-transparent hover:border-black bg-transparent hover:bg-white dark:hover:bg-black text-black dark:text-white transition-all cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                          }}
                        />
                        <div
                          className="absolute right-0 top-full mt-1 z-50 w-44 bg-white dark:bg-[#1c1d20] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onSelectProject(project.id);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-brand-sans font-semibold text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5 stroke-[2]" />
                            <span>Open Project</span>
                          </button>

                          {onRenameProject && (
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(e, project)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-brand-sans font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Rename</span>
                            </button>
                          )}

                          {onDeleteProject && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                onDeleteProject(project.id);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-brand-sans font-semibold text-[#E5484D] hover:bg-[#E5484D]/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Delete Project</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
