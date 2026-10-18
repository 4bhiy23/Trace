"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  HelpCircle,
  FolderKanban,
  FileCode,
  Users,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { CreateBlankCard } from "./CreateBlankCard";
import { FilesTable } from "./FilesTable";
import { ProjectsTable } from "./ProjectsTable";
import { NewFileModal } from "./NewFileModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { InviteModal } from "./InviteModal";
import { ShortcutsModal } from "./ShortcutsModal";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { useAuth } from "@/modules/auth/AuthGuard";
import { cn } from "@/lib/utils";
import {
  WorkspaceFile,
  WorkspaceProject,
  WorkspaceItem,
  FilterTab,
  SortField,
  SortDirection,
  CanvasType,
  AccessPermission,
  ProjectMemberAssignment,
} from "./types";
import { useQuery } from "@tanstack/react-query";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import { projectQueries } from "@/features/projects/queries/project.options";
import {
  useUpdateProject,
  useArchiveProject,
} from "@/features/projects/queries/project.mutations";

export function WorkspaceView() {
  const { user } = useAuth();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [currentTab, setCurrentTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("edited");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Modals state
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Workspaces Query
  const { data: workspacesData = [] } = useQuery(workspaceQueries.list());

  const workspaces: WorkspaceItem[] = useMemo(() => {
    return workspacesData.map((ws) => ({
      id: ws.id,
      name: ws.name,
      ownerId: ws.ownerId,
      isDefault: ws.isDefault,
      role: ws.role,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
    }));
  }, [workspacesData]);

  const activeWorkspace = useMemo(() => {
    if (!workspaces.length) return null;
    return (
      workspaces.find((w) => w.id === activeWorkspaceId) ||
      workspaces.find((w) => w.isDefault) ||
      workspaces[0]
    );
  }, [workspaces, activeWorkspaceId]);

  const effectiveWorkspaceId = activeWorkspace?.id || "";

  // Live Projects Query
  const { data: projectsData = [] } = useQuery(
    projectQueries.listByWorkspace(effectiveWorkspaceId),
  );

  // Live Workspace Members Query
  const { data: workspaceMembers = [] } = useQuery(
    workspaceQueries.members(effectiveWorkspaceId),
  );

  const projects: WorkspaceProject[] = useMemo(() => {
    return projectsData.map((p) => {
      const pFiles = files.filter((f) => f.projectId === p.id);
      return {
        id: p.id,
        name: p.name,
        count: pFiles.length,
        access: p.access === "editor" ? "workspace" : "private",
        createdAt: new Date(p.createdAt).toLocaleDateString(),
        updatedAt: new Date(p.updatedAt).toLocaleDateString(),
        updatedTimestamp: new Date(p.updatedAt).getTime(),
      };
    });
  }, [projectsData, files]);

  const updateProjectMutation = useUpdateProject(effectiveWorkspaceId);
  const archiveProjectMutation = useArchiveProject(effectiveWorkspaceId);

  // Sync activeWorkspaceId with available workspaces
  useEffect(() => {
    if (workspaces.length > 0) {
      const exists = workspaces.some((w) => w.id === activeWorkspaceId);
      if (!exists) {
        const def = workspaces.find((w) => w.isDefault);
        setActiveWorkspaceId(def ? def.id : workspaces[0].id);
      }
    }
  }, [workspaces, activeWorkspaceId]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "d" || e.key === "D" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        setCurrentView("dashboard");
        setCurrentTab("all");
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsNewFileModalOpen(true);
      } else if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Active chosen project
  const selectedProject = useMemo(() => {
    if (currentView.startsWith("project:")) {
      const pId = currentView.replace("project:", "");
      return projects.find((p) => p.id === pId) || null;
    }
    return null;
  }, [currentView, projects]);

  // Live Project Editors Query
  const { data: projectEditors = [] } = useQuery(
    projectQueries.editors(selectedProject?.id || ""),
  );

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Project partition filter
        if (currentView.startsWith("project:")) {
          const projectId = currentView.replace("project:", "");
          return file.projectId === projectId;
        }

        // Top Filter Tabs
        if (currentTab === "created-by-me") {
          return file.author.initials === "SG";
        }
        if (currentTab === "recents") {
          return Date.now() - file.editedTimestamp < 3 * 24 * 60 * 60 * 1000;
        }

        return true;
      })
      .filter((file) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          file.name.toLowerCase().includes(q) ||
          file.type.toLowerCase().includes(q) ||
          file.author.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "name") {
          diff = a.name.localeCompare(b.name);
        } else if (sortField === "type") {
          diff = a.type.localeCompare(b.type);
        } else if (sortField === "created") {
          diff = a.createdTimestamp - b.createdTimestamp;
        } else if (sortField === "edited") {
          diff = a.editedTimestamp - b.editedTimestamp;
        }
        return sortDirection === "asc" ? diff : -diff;
      });
  }, [files, currentView, currentTab, searchQuery, sortField, sortDirection]);

  // Metrics for overview cards
  const stats = useMemo(() => {
    const totalCanvases = files.filter((f) => !f.isArchived).length;
    const totalProjects = projects.length;
    const recentEdits = files.filter(
      (f) => Date.now() - f.editedTimestamp < 24 * 60 * 60 * 1000,
    ).length;
    const totalMembers = workspaceMembers.length;
    return {
      totalCanvases,
      totalProjects,
      recentEdits,
      totalMembers,
    };
  }, [files, projects, workspaceMembers.length]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCreateFile = ({
    name,
    type,
    projectId,
  }: {
    name: string;
    type: CanvasType;
    projectId: string;
  }) => {
    const targetProjectId =
      projectId ||
      (currentView.startsWith("project:")
        ? currentView.replace("project:", "")
        : projects[0]?.id || "proj-arch");

    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      name,
      type,
      projectId: targetProjectId,
      createdAt: "Just now",
      createdTimestamp: Date.now(),
      editedAt: "Just now",
      editedTimestamp: Date.now(),
      author: {
        name: user?.name || user?.email || "User",
        initials: (user?.name || user?.email || "U").slice(0, 2).toUpperCase(),
        color: "bg-amber-600",
      },
      isPrivate: false,
      isArchived: false,
    };

    setFiles((prev) => [newFile, ...prev]);
    showToast(`Created canvas "${name}"`);
  };

  const handleCreateProject = ({
    name,
  }: {
    name: string;
    access?: AccessPermission;
    members?: ProjectMemberAssignment[];
  }) => {
    showToast(`Created project "${name}"`);
  };

  const handleOpenFile = (file: WorkspaceFile) => {
    showToast(`Opening canvas: ${file.name}`);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    showToast("File deleted");
  };

  const handleDuplicateFile = (file: WorkspaceFile) => {
    const copy: WorkspaceFile = {
      ...file,
      id: `file-${Date.now()}`,
      name: `${file.name} (Copy)`,
      createdAt: "Just now",
      createdTimestamp: Date.now(),
      editedAt: "Just now",
      editedTimestamp: Date.now(),
    };
    setFiles((prev) => [copy, ...prev]);
    showToast(`Duplicated "${file.name}"`);
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f)),
    );
    showToast(`Renamed to "${newName}"`);
  };

  const handleCreateWorkspace = (newWorkspace: WorkspaceItem) => {
    setActiveWorkspaceId(newWorkspace.id);
    showToast(`Workspace "${newWorkspace.name}" created`);
  };

  // Filtered projects for dashboard directory
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, searchQuery]);

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      await updateProjectMutation.mutateAsync({
        projectId,
        input: { name: newName },
      });
      showToast(`Renamed project to "${newName}"`);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to rename project",
      );
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    try {
      await archiveProjectMutation.mutateAsync(projectId);
      setFiles((prev) => prev.filter((f) => f.projectId !== projectId));
      if (currentView === `project:${projectId}`) {
        setCurrentView("dashboard");
      }
      showToast(`Archived project "${proj?.name || ""}"`);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete project",
      );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFFEFC] dark:bg-[#0c0d0e] text-black dark:text-white transition-colors duration-200 font-brand-sans">
      {/* Left Sidebar */}
      <WorkspaceSidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
        }}
        projects={projects}
        onOpenNewProjectModal={() => setIsCreateProjectModalOpen(true)}
        onOpenNewFileModal={() => setIsNewFileModalOpen(true)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={(wsId) => setActiveWorkspaceId(wsId)}
        onOpenNewWorkspaceModal={() => setIsCreateWorkspaceModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Filter / Search bar */}
        <WorkspaceHeader
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
        />

        {/* Content Body with MailerBot Grid Paper */}
        <main className="grid-paper relative min-h-0 flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in-0 duration-200 ease-out">
          <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Project Header Banner when a project is chosen */}
            {selectedProject && (
              <div className="bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[5px_6px_0px_0px_rgba(0,0,0,0.14)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 border-2 border-black bg-[#E9FFA3] text-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
                    <FolderKanban className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="font-brand-display text-base sm:text-lg font-bold text-black dark:text-white">
                        {selectedProject.name}
                      </h1>
                      <span className="px-2 py-0.5 text-[10px] font-roboto-mono font-bold uppercase tracking-wider bg-[#D3B8FC] text-black border border-black">
                        {selectedProject.access === "private"
                          ? "Restricted Access"
                          : "Workspace Access"}
                      </span>
                    </div>
                    <p className="font-roboto-mono text-xs text-[#636363] dark:text-white/60 mt-0.5">
                      {filteredAndSortedFiles.length}{" "}
                      {filteredAndSortedFiles.length === 1
                        ? "canvas"
                        : "canvases"}{" "}
                      •{" "}
                      {projectEditors.length > 0
                        ? `${projectEditors.length} ${projectEditors.length === 1 ? "member" : "members"}`
                        : "Workspace Access"}{" "}
                      • Full Collaboration
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView("dashboard")}
                  className="self-start sm:self-auto px-3 py-1.5 bg-white dark:bg-[#202227] hover:bg-[#E9FFA3] dark:hover:bg-[#E9FFA3] text-black dark:text-white hover:text-black dark:hover:text-black border-2 border-black font-brand-sans font-bold text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Back to Projects</span>
                </button>
              </div>
            )}

            {/* Quick Overview Metric Tiles (MailerBot Dashboard Recipe) */}
            <div
              className={cn(
                "grid gap-3 lg:gap-4",
                selectedProject
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-2 lg:grid-cols-4",
              )}
            >
              <div className="bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#636363] dark:text-white/70">
                  <span>
                    {selectedProject ? "Project Canvases" : "Total Canvases"}
                  </span>
                  <FileCode className="w-4 h-4 text-black dark:text-white" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold font-brand-display text-black dark:text-white">
                    {selectedProject
                      ? files.filter(
                          (f) =>
                            f.projectId === selectedProject.id && !f.isArchived,
                        ).length
                      : stats.totalCanvases}
                  </div>
                  <p className="text-[11px] font-roboto-mono text-[#636363] dark:text-white/50 mt-0.5">
                    {selectedProject
                      ? "In this project"
                      : "Across all projects"}
                  </p>
                </div>
              </div>

              {!selectedProject && (
                <div className="bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#636363] dark:text-white/70">
                    <span>Projects</span>
                    <FolderKanban className="w-4 h-4 text-black dark:text-white" />
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold font-brand-display text-black dark:text-white">
                      {stats.totalProjects}
                    </div>
                    <p className="text-[11px] font-roboto-mono text-[#636363] dark:text-white/50 mt-0.5">
                      Organized groups
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#636363] dark:text-white/70">
                  <span>Recent Edits</span>
                  <Clock className="w-4 h-4 text-black dark:text-white" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold font-brand-display text-black dark:text-white">
                    {selectedProject
                      ? files.filter(
                          (f) =>
                            f.projectId === selectedProject.id &&
                            Date.now() - f.editedTimestamp <
                              24 * 60 * 60 * 1000,
                        ).length
                      : stats.recentEdits}
                  </div>
                  <p className="text-[11px] font-roboto-mono text-[#636363] dark:text-white/50 mt-0.5">
                    Last 24 hours
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#636363] dark:text-white/70">
                  <span>Team Sync</span>
                  <Users className="w-4 h-4 text-black dark:text-white" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold font-brand-display text-black dark:text-white">
                    {selectedProject
                      ? projectEditors.length
                      : stats.totalMembers}
                  </div>
                  <p className="text-[11px] font-roboto-mono text-[#636363] dark:text-white/50 mt-0.5">
                    Active collaborators
                  </p>
                </div>
              </div>
            </div>

            {/* "Create a Blank File" Card */}
            <CreateBlankCard onClick={() => setIsNewFileModalOpen(true)} />

            {/* Architectural Section Divider matching MailerBot Dash-drift */}
            <div className="py-2">
              <div
                aria-hidden="true"
                className="w-full text-black/30 dark:text-white/30"
              >
                <svg aria-hidden="true" className="h-[2px] w-full">
                  <line
                    x1="0"
                    y1="1"
                    x2="100%"
                    y2="1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="dash-drift"
                  />
                </svg>
              </div>
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#E9FFA3] text-black border border-black font-roboto-mono text-xs font-bold">
                    02
                  </span>
                  <span className="font-brand-display font-bold text-xs uppercase tracking-widest text-black dark:text-white">
                    {selectedProject
                      ? "CANVAS REPOSITORY • ACTIVE DIRECTORY"
                      : "PROJECTS DIRECTORY • ACTIVE REPOSITORY"}
                  </span>
                </div>
                <span className="font-roboto-mono text-xs text-[#636363] dark:text-white/60">
                  {selectedProject
                    ? `${String(filteredAndSortedFiles.length).padStart(2, "0")} / ${String(files.filter((f) => f.projectId === selectedProject.id).length).padStart(2, "0")} ITEMS`
                    : `${String(filteredProjects.length).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")} PROJECTS`}
                </span>
              </div>
            </div>

            {/* If viewing a project, render FilesTable. If on Dashboard, render ProjectsTable */}
            {selectedProject ? (
              <FilesTable
                files={filteredAndSortedFiles}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onOpenFile={handleOpenFile}
                onDeleteFile={handleDeleteFile}
                onDuplicateFile={handleDuplicateFile}
                onRenameFile={handleRenameFile}
              />
            ) : (
              <ProjectsTable
                projects={filteredProjects}
                files={files}
                onSelectProject={(projectId) =>
                  setCurrentView(`project:${projectId}`)
                }
                onRenameProject={handleRenameProject}
                onDeleteProject={handleDeleteProject}
                onOpenNewProjectModal={() => setIsCreateProjectModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Help / Shortcuts Button in bottom-right corner */}
      <button
        type="button"
        aria-label="Keyboard shortcuts and help"
        onClick={() => setIsShortcutsModalOpen(true)}
        className="fixed bottom-5 right-5 w-9 h-9 border-2 border-black bg-white dark:bg-[#18191c] hover:bg-[#E9FFA3] dark:hover:bg-[#E9FFA3] text-black dark:text-white dark:hover:text-black shadow-[3px_3px_0px_#000000] flex items-center justify-center transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer z-30"
        title="Keyboard shortcuts (?)"
      >
        <HelpCircle className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Modals */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        projects={projects}
        defaultProjectId={selectedProject?.id || projects[0]?.id}
        onCreateFile={handleCreateFile}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        workspaceId={effectiveWorkspaceId}
        onCreateProject={handleCreateProject}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={effectiveWorkspaceId}
        workspaceName={activeWorkspace?.name}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-black text-[#E9FFA3] border-2 border-black text-xs font-roboto-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
