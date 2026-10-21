"use client";

import React, { useState } from "react";
import {
  Folder,
  ArrowRight,
  MoreHorizontal,
  Edit3,
  Trash2,
  FolderOpen,
  Plus,
  Shield,
} from "lucide-react";
import { WorkspaceProject, WorkspaceFile } from "./types";
import { RoughBox } from "./RoughBox";
import { cn } from "@/lib/utils";
import { ProjectPermissionsModal } from "./ProjectPermissionsModal";

interface ProjectsTableProps {
  projects: WorkspaceProject[];
  files: WorkspaceFile[];
  onSelectProject: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onOpenNewProjectModal?: () => void;
  isArchived?: boolean;
  currentUserRole?: "owner" | "admin" | "member";
  workspaceId?: string;
}

export function ProjectsTable({
  projects,
  files,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
  onOpenNewProjectModal,
  isArchived = false,
  currentUserRole = "owner",
  workspaceId,
}: ProjectsTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [managingProject, setManagingProject] =
    useState<WorkspaceProject | null>(null);

  const isOwnerOrAdmin =
    currentUserRole === "owner" || currentUserRole === "admin";

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
    <div className="relative pt-3 pb-8 select-none">
      {/* Binder Sheet using RoughBox (§12 & §13.1) */}
      <RoughBox
        seed={7}
        fill="#ffffff"
        amp={1.25}
        rings="full"
        tape="tr"
        tilt={0}
        className="w-full"
      >
        {/* Inner Table Frame:
            left: clearance for rings (width: 42px)
            right: clearance for right wobbly paper edge
            top and bottom: balanced margins */}
        <div className="my-[32px] sm:my-[36px] ml-[48px] sm:ml-[50px] mr-[8px] sm:mr-[14px] relative">
          <div className="grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 min-h-[46px] items-center bg-[#ece7e0] dark:bg-[#202227] text-xs sm:text-[13px] font-mono font-bold uppercase tracking-[0.5px] text-black dark:text-white select-none">
            <div className="col-span-6 sm:col-span-5 md:col-span-5 lg:col-span-4 flex items-center gap-1.5 min-w-0">
              <span className="truncate">PROJECT NAME</span>
            </div>
            <div className="col-span-2 hidden sm:flex items-center gap-1.5 min-w-0">
              <span>CANVASES</span>
            </div>
            <div className="col-span-2 hidden md:flex items-center gap-1.5 min-w-0">
              <span>ACCESS LEVEL</span>
            </div>
            <div className="col-span-2 hidden lg:flex items-center gap-1.5 min-w-0">
              <span>LAST UPDATED</span>
            </div>
            <div className="col-span-6 sm:col-span-5 md:col-span-3 lg:col-span-2 text-right pr-1 shrink-0">
              ACTION
            </div>
          </div>

          {/* Table Rows:*/}
          {projects.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#636363] dark:text-white/60">
              <p className="font-bold text-base text-black dark:text-white">
                {isArchived ? "No archived projects" : "No projects found"}
              </p>
              <p className="text-xs font-mono mt-1 text-[#636363] dark:text-white/60">
                {isArchived
                  ? "Projects that are deleted or archived will appear here."
                  : "Create a project to start organizing your canvases."}
              </p>
              {!isArchived && onOpenNewProjectModal && (
                <button
                  type="button"
                  onClick={onOpenNewProjectModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E9FFA3] text-black border-2 border-black font-mono font-bold text-xs shadow-[0_3px_0_0_#000] hover:bg-black hover:text-[#E9FFA3] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>CREATE FIRST PROJECT</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              {projects.map((project, idx) => {
                const isMenuOpen = activeMenuId === project.id;
                const isNearBottom = idx >= Math.max(1, projects.length - 2);
                const actualCanvasCount = files.filter(
                  (f) => f.projectId === project.id,
                ).length;
                const count =
                  actualCanvasCount > 0
                    ? actualCanvasCount
                    : project.count || 0;
                const isEditor = isOwnerOrAdmin || project.access === "editor";

                return (
                  <div
                    key={project.id}
                    className={cn(
                      "group grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 min-h-[68px] sm:min-h-[72px] items-center text-xs border-b border-[#dad1c5] dark:border-white/10 transition-colors duration-100 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03]",
                      isMenuOpen ? "z-30 relative" : "relative",
                    )}
                    onClick={() => {
                      if (editingProjectId) return;
                      onSelectProject(project.id);
                    }}
                  >
                    <div className="col-span-6 sm:col-span-5 md:col-span-5 lg:col-span-4 flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="shrink-0 w-9 h-9 border rounded-[4px] flex items-center justify-center transition-colors border-black dark:border-white/40 bg-transparent text-black dark:text-white group-hover:bg-[#E9FFA3] group-hover:text-black">
                        <Folder className="w-4 h-4 stroke-[1.8]" />
                      </div>

                      {editingProjectId === project.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleFinishRename(project.id);
                            if (e.key === "Escape") setEditingProjectId(null);
                          }}
                          onBlur={() => handleFinishRename(project.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 text-xs font-bold bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white focus:outline-none min-w-0 w-full"
                        />
                      ) : (
                        <div className="min-w-0 flex-1 truncate">
                          <div className="font-semibold text-sm sm:text-[15px] truncate font-sans text-black dark:text-white group-hover:underline">
                            {project.name}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 hidden sm:flex items-center min-w-0">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-[0.35px] border border-black bg-white dark:bg-black text-black dark:text-white rounded-[4px] whitespace-nowrap">
                        {count} {count === 1 ? "CANVAS" : "CANVASES"}
                      </span>
                    </div>

                    <div className="col-span-2 hidden md:flex items-center min-w-0">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-[0.35px] border border-black rounded-[4px] whitespace-nowrap",
                          project.archivedAt
                            ? "bg-[#FED7D7] text-black"
                            : isEditor
                              ? "bg-[#E9FFA3] text-black"
                              : "bg-[#ECE7E0] dark:bg-[#282a30] text-black dark:text-white dark:border-white/40",
                        )}
                      >
                        {project.archivedAt
                          ? "ARCHIVED"
                          : isEditor
                            ? "EDITOR"
                            : "VIEWER"}
                      </span>
                    </div>

                    <div className="col-span-2 hidden lg:flex items-center font-mono text-xs text-[#636363] dark:text-white/70 min-w-0 truncate">
                      {project.updatedAt || project.createdAt || "18/10/2026"}
                    </div>

                    <div className="col-span-6 sm:col-span-5 md:col-span-3 lg:col-span-2 flex items-center justify-end gap-2 sm:gap-3 shrink-0 whitespace-nowrap pr-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-[0.35px] text-black dark:text-white hover:underline cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        <span>OPEN</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          aria-label="Project actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : project.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer rounded-[4px]"
                        >
                          <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
                        </button>

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
                              className={cn(
                                "absolute right-0 z-50 w-44 bg-white dark:bg-[#1c1d20] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-1 text-xs",
                                isNearBottom
                                  ? "bottom-full mb-1"
                                  : "top-full mt-1",
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onSelectProject(project.id);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-semibold text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black cursor-pointer font-sans"
                              >
                                <FolderOpen className="w-3.5 h-3.5 stroke-[2]" />
                                <span>Open Project</span>
                              </button>

                              {isOwnerOrAdmin && workspaceId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setManagingProject(project);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-semibold text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black cursor-pointer font-sans"
                                >
                                  <Shield className="w-3.5 h-3.5 stroke-[2]" />
                                  <span>Manage Permissions</span>
                                </button>
                              )}

                              {isOwnerOrAdmin && onRenameProject && (
                                <button
                                  type="button"
                                  onClick={(e) => handleStartRename(e, project)}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-sans"
                                >
                                  <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                                  <span>Rename</span>
                                </button>
                              )}

                              {isOwnerOrAdmin &&
                                onDeleteProject &&
                                !project.archivedAt && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      onDeleteProject(project.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-semibold text-[#E5484D] hover:bg-[#E5484D]/10 cursor-pointer font-sans"
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
      </RoughBox>
      {managingProject && workspaceId && (
        <ProjectPermissionsModal
          isOpen={Boolean(managingProject)}
          onClose={() => setManagingProject(null)}
          project={managingProject}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}
