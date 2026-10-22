"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  HelpCircle,
  ArrowLeft,
  Folder,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { CreateBlankCard } from "./CreateBlankCard";
import { FilesTable } from "./FilesTable";
import { ProjectsTable } from "./ProjectsTable";
import { RoughBox } from "./RoughBox";
import { NewFileModal } from "./NewFileModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { InviteModal } from "./InviteModal";
import { ShortcutsModal } from "./ShortcutsModal";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";
import { CollaboratorsDirectory } from "./CollaboratorsDirectory";
import { useAuth } from "@/modules/auth/AuthGuard";
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
import { useParams, useRouter, usePathname } from "next/navigation";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import { projectQueries } from "@/features/projects/queries/project.options";
import {
  useUpdateProject,
  useArchiveProject,
  usePermanentlyDeleteArchivedProject,
} from "@/features/projects/queries/project.mutations";
import {
  toSlug,
  findWorkspaceBySlugOrId,
  findProjectBySlugOrId,
  getSavedWorkspaceId,
  saveActiveWorkspace,
} from "./workspace-routing";

const INITIAL_DEMO_FILES: WorkspaceFile[] = [
  {
    id: "file-roadmap",
    name: "Product Roadmap",
    type: "markdown",
    projectId: "demo",
    description: "Initial roadmap and milestones",
    createdAt: "18/10/2026",
    createdTimestamp: 1729209600000,
    editedAt: "18/10/2026",
    editedTimestamp: 1729209600000,
    author: { name: "Sarthak Gupta", initials: "SG", color: "bg-emerald-600" },
  },
  {
    id: "file-architecture",
    name: "System Architecture",
    type: "uml",
    projectId: "demo",
    description: "High level architecture",
    createdAt: "17/10/2026",
    createdTimestamp: 1729123200000,
    editedAt: "17/10/2026",
    editedTimestamp: 1729123200000,
    author: { name: "Sarthak Gupta", initials: "SG", color: "bg-emerald-600" },
  },
  {
    id: "file-research",
    name: "Research Notes",
    type: "markdown",
    projectId: "demo",
    description: "User research and insights",
    createdAt: "15/10/2026",
    createdTimestamp: 1728950400000,
    editedAt: "16/10/2026",
    editedTimestamp: 1729036800000,
    author: { name: "Sarthak Gupta", initials: "SG", color: "bg-emerald-600" },
  },
  {
    id: "file-design-system",
    name: "Design System",
    type: "uml",
    projectId: "demo",
    description: "UI components and guidelines",
    createdAt: "14/10/2026",
    createdTimestamp: 1728864000000,
    editedAt: "14/10/2026",
    editedTimestamp: 1728864000000,
    author: { name: "Sarthak Gupta", initials: "SG", color: "bg-emerald-600" },
  },
];

const isProjectFile = (
  file: WorkspaceFile,
  targetProjectId: string,
  projectName?: string,
) => {
  return (
    file.projectId === targetProjectId ||
    file.projectId === "demo" ||
    (file.projectId === "patra" && projectName?.toLowerCase() === "patra")
  );
};

export function WorkspaceView() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const slug = (params?.slug as string[] | undefined) || [];
  const workspaceSlugParam = slug[0];
  const sectionParam = slug[1]; // "project" | "archived" | "collaborators"
  const projectSlugParam = slug[2]; // e.g. "asdfg"

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    return getSavedWorkspaceId() || "";
  });
  const [files, setFiles] = useState<WorkspaceFile[]>(INITIAL_DEMO_FILES);
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
  const [workspaceToDelete, setWorkspaceToDelete] =
    useState<WorkspaceItem | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isProjectHeaderMenuOpen, setIsProjectHeaderMenuOpen] = useState(false);
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

  // Robust active workspace resolution: URL slug > active state > localStorage > default > first
  const activeWorkspace = useMemo(() => {
    if (!workspaces.length) return null;

    if (workspaceSlugParam) {
      const matched = findWorkspaceBySlugOrId(workspaces, workspaceSlugParam);
      if (matched) return matched;
    }

    if (activeWorkspaceId) {
      const matched = workspaces.find((w) => w.id === activeWorkspaceId);
      if (matched) return matched;
    }

    const savedId = getSavedWorkspaceId();
    if (savedId) {
      const matched = workspaces.find((w) => w.id === savedId);
      if (matched) return matched;
    }

    return (
      workspaces.find((w) => w.isDefault && w.ownerId === user?.id) ||
      workspaces[0]
    );
  }, [workspaces, workspaceSlugParam, activeWorkspaceId, user?.id]);

  const effectiveWorkspaceId = activeWorkspace?.id || "";

  // Live Projects Query
  const { data: projectsData = [] } = useQuery(
    projectQueries.listByWorkspace(effectiveWorkspaceId),
  );

  const allProjects: WorkspaceProject[] = useMemo(() => {
    return projectsData.map((p) => {
      const pFiles = files.filter((f) => isProjectFile(f, p.id, p.name));
      const dateObj = new Date(p.updatedAt);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      return {
        id: p.id,
        name: p.name,
        count: pFiles.length,
        access: p.access,
        archivedAt: p.archivedAt,
        createdAt: formattedDate,
        updatedAt: formattedDate,
        updatedTimestamp: dateObj.getTime(),
      };
    });
  }, [projectsData, files]);

  // Active (unarchived) projects only
  const activeProjects = useMemo(() => {
    return allProjects.filter((p) => !p.archivedAt);
  }, [allProjects]);

  // Archived projects only
  const archivedProjects = useMemo(() => {
    return allProjects.filter((p) => Boolean(p.archivedAt));
  }, [allProjects]);

  const updateProjectMutation = useUpdateProject(effectiveWorkspaceId);
  const archiveProjectMutation = useArchiveProject(effectiveWorkspaceId);
  const permanentlyDeleteProjectMutation =
    usePermanentlyDeleteArchivedProject(effectiveWorkspaceId);

  // Sync active workspace ID and maintain URL when on /workspace or /dashboard
  useEffect(() => {
    if (!activeWorkspace) return;
    if (activeWorkspace.id !== activeWorkspaceId) {
      setActiveWorkspaceId(activeWorkspace.id);
    }
    saveActiveWorkspace(activeWorkspace);

    // If on /workspace or /dashboard without a workspace in the URL, redirect to /workspace/:workspacename
    if (
      !workspaceSlugParam &&
      (pathname?.startsWith("/workspace") || pathname?.startsWith("/dashboard"))
    ) {
      router.replace(`/workspace/${toSlug(activeWorkspace.name)}`);
    }
  }, [
    activeWorkspace,
    activeWorkspaceId,
    workspaceSlugParam,
    pathname,
    router,
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const handleWorkspaceDeleted = useCallback(
    (deletedId: string) => {
      showToast(
        workspaceToDelete
          ? `Workspace "${workspaceToDelete.name}" deleted.`
          : "Workspace deleted.",
      );

      // If the deleted workspace was currently active, switch back to the default workspace
      if (deletedId === activeWorkspaceId) {
        const fallback =
          workspaces.find((w) => w.isDefault && w.ownerId === user?.id) ||
          workspaces[0];
        if (fallback) {
          setActiveWorkspaceId(fallback.id);
          saveActiveWorkspace(fallback);
          router.replace(`/workspace/${toSlug(fallback.name)}`);
        }
      }
      setWorkspaceToDelete(null);
    },
    [
      activeWorkspaceId,
      workspaces,
      workspaceToDelete,
      showToast,
      router,
      user?.id,
    ],
  );

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

  // Synchronize view state from route segments
  useEffect(() => {
    if (sectionParam === "collaborators") {
      setCurrentView("collaborators");
      return;
    }

    if (sectionParam === "archived") {
      setCurrentView("archived");
      return;
    }

    if (sectionParam === "project") {
      if (projectSlugParam) {
        const matched = findProjectBySlugOrId(allProjects, projectSlugParam);
        if (matched) {
          setCurrentView(`project:${matched.id}`);
        }
      } else {
        setCurrentView("project");
      }
      return;
    }

    if (!sectionParam) {
      setCurrentView("dashboard");
    }
  }, [sectionParam, projectSlugParam, allProjects]);

  const isOwnerOrAdmin =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";

  // Active chosen project
  const selectedProject = useMemo(() => {
    if (currentView.startsWith("project:")) {
      const pId = currentView.replace("project:", "");
      return allProjects.find((p) => p.id === pId) || null;
    }
    if (
      sectionParam === "project" &&
      projectSlugParam &&
      allProjects.length > 0
    ) {
      return findProjectBySlugOrId(allProjects, projectSlugParam);
    }
    return null;
  }, [currentView, sectionParam, projectSlugParam, allProjects]);

  const isArchivedView =
    currentView === "archived" || sectionParam === "archived";

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Project partition filter
        if (currentView.startsWith("project:")) {
          const projectId = currentView.replace("project:", "");
          return isProjectFile(file, projectId, selectedProject?.name);
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

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleSelectWorkspace = useCallback(
    (wsId: string) => {
      const target = workspaces.find((w) => w.id === wsId);
      if (!target) return;
      setActiveWorkspaceId(wsId);
      saveActiveWorkspace(target);
      setCurrentView("dashboard");
      router.push(`/workspace/${toSlug(target.name)}`);
    },
    [workspaces, router],
  );

  const handleSelectView = useCallback(
    (view: string) => {
      setCurrentView(view);
      if (!activeWorkspace) return;
      const wsSlug = toSlug(activeWorkspace.name);

      if (view === "dashboard") {
        router.push(`/workspace/${wsSlug}`);
      } else if (view === "collaborators") {
        router.push(`/workspace/${wsSlug}/collaborators`);
      } else if (view === "project") {
        router.push(`/workspace/${wsSlug}/project`);
      } else if (view === "archived") {
        router.push(`/workspace/${wsSlug}/archived`);
      } else if (view.startsWith("project:")) {
        const pId = view.replace("project:", "");
        const target = allProjects.find((p) => p.id === pId);
        const pSlug = target ? toSlug(target.name) : pId;
        router.push(`/workspace/${wsSlug}/project/${pSlug}`);
      }
    },
    [activeWorkspace, allProjects, router],
  );

  const handleSelectProject = useCallback(
    (projectId: string) => {
      setCurrentView(`project:${projectId}`);
      if (!activeWorkspace) return;
      const wsSlug = toSlug(activeWorkspace.name);
      const target = allProjects.find((p) => p.id === projectId);
      const pSlug = target ? toSlug(target.name) : projectId;
      router.push(`/workspace/${wsSlug}/project/${pSlug}`);
    },
    [activeWorkspace, allProjects, router],
  );

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
        : activeProjects[0]?.id || "");

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

  // Filtered projects for dashboard or archived directory
  const filteredProjects = useMemo(() => {
    const targetList = isArchivedView ? archivedProjects : activeProjects;
    if (!searchQuery.trim()) return targetList;
    const q = searchQuery.toLowerCase();
    return targetList.filter((p) => p.name.toLowerCase().includes(q));
  }, [isArchivedView, archivedProjects, activeProjects, searchQuery]);

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

  const handleArchiveProject = async (projectId: string) => {
    const proj = allProjects.find((p) => p.id === projectId);
    try {
      await archiveProjectMutation.mutateAsync(projectId);
      setFiles((prev) => prev.filter((f) => f.projectId !== projectId));
      if (currentView === `project:${projectId}`) {
        setCurrentView("dashboard");
      }
      showToast(`Archived project "${proj?.name || ""}"`);
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to archive project",
      );
    }
  };

  const handlePermanentlyDeleteProject = async (projectId: string) => {
    const proj = allProjects.find((p) => p.id === projectId);
    try {
      await permanentlyDeleteProjectMutation.mutateAsync(projectId);
      setFiles((prev) => prev.filter((file) => file.projectId !== projectId));
      if (currentView === `project:${projectId}`) {
        setCurrentView("dashboard");
      }
      showToast(`Permanently deleted project "${proj?.name || ""}"`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to permanently delete project";
      showToast(message);
      throw err;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FFFEFC] dark:bg-[#0c0d0e] text-black dark:text-white transition-colors duration-200 font-brand-sans">
      {/* SVG filter for organic wobbly paper buttons */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="pbtn-r1" x="-8%" y="-12%" width="116%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045 0.07"
              numOctaves="3"
              seed="3"
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
          <filter id="pbtn-r2" x="-8%" y="-12%" width="116%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.08"
              numOctaves="3"
              seed="11"
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

      {/* Scoped styles for paper button prototype */}
      <style>{`
        .paper-btn {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          --fill: #faf7f2;
          --ink: #111111;
          color: var(--ink);
          cursor: pointer;
          border: 0;
          background: transparent;
          transition: transform 0.08s ease, opacity 0.15s ease;
        }
        .paper-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid var(--ink);
          border-radius: 2px;
          filter: url(#pbtn-r1);
          pointer-events: none;
        }
        .paper-btn:hover {
          opacity: 0.94;
        }
        .paper-btn:active {
          transform: translate(1px, 1.5px);
        }
        .paper-btn--lime {
          --fill: #e9ffa3;
        }
        .paper-btn--paper {
          --fill: #faf7f2;
        }
        .paper-btn--help {
          --fill: #ffffff;
        }
        .paper-btn--help:hover {
          --fill: #e9ffa3;
        }
        .paper-btn--shadow {
          --sx: 3.5px;
          --sy: 4.5px;
        }
        .paper-btn--shadow::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: var(--ink);
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#pbtn-r2);
          pointer-events: none;
        }
        .paper-btn--shadow:active {
          transform: translate(2px, 2.5px);
          --sx: 1.5px;
          --sy: 2px;
        }
        .dark .paper-btn--paper {
          --fill: #1e1e22;
          --ink: #ffffff;
        }
        .dark .paper-btn--lime {
          --ink: #111111;
        }
        .dark .paper-btn--help {
          --fill: #18191c;
          --ink: #ffffff;
        }
        .dark .paper-btn--help:hover {
          --fill: #e9ffa3;
          --ink: #111111;
        }
      `}</style>

      {/* Left Sidebar */}
      <WorkspaceSidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        projects={activeProjects}
        archivedProjectsCount={archivedProjects.length}
        onOpenNewProjectModal={
          isOwnerOrAdmin ? () => setIsCreateProjectModalOpen(true) : undefined
        }
        onOpenNewFileModal={() => setIsNewFileModalOpen(true)}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={handleSelectWorkspace}
        onOpenNewWorkspaceModal={() => setIsCreateWorkspaceModalOpen(true)}
        onDeleteWorkspace={(ws) => setWorkspaceToDelete(ws)}
        onLeaveWorkspace={() => router.replace("/workspace")}
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

        {/* Content Body with Technical Grid Paper */}
        <main className="grid-paper relative min-h-0 flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in-0 duration-200 ease-out">
          <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {currentView === "collaborators" ? (
              <CollaboratorsDirectory
                workspaceId={effectiveWorkspaceId}
                workspaceName={activeWorkspace?.name}
                workspaceRole={activeWorkspace?.role}
                isDefaultWorkspace={activeWorkspace?.isDefault}
              />
            ) : (
              <>
            {/* Project Header Banner when a project is chosen (§12 & §13) */}
            {selectedProject && (
              <div className="relative pt-2 pb-1">
                <RoughBox
                  seed={9}
                  fill="#ffffff"
                  amp={1.25}
                  rings="none"
                  tape="none"
                  shadow={false}
                  className="w-full"
                >
                  <div className="py-5 px-6 mr-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Big Lime Folder Box */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-black bg-[#E9FFA3] text-black flex items-center justify-center shrink-0 rounded-[4px] paper-texture-wash">
                        <Folder className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                      </div>

                      <div className="min-w-0">
                        <h1 className="font-brand-sans font-bold text-2xl sm:text-3xl text-black tracking-tight truncate">
                          {selectedProject.name}
                        </h1>
                        {selectedProject.description && (
                          <p className="font-brand-sans text-xs sm:text-sm text-[#636363] mt-0.5 truncate">
                            {selectedProject.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                      {/* 3-dots actions button (Owner & Admin only) */}
                      {isOwnerOrAdmin && !selectedProject.archivedAt && (
                        <div className="relative">
                          <button
                            type="button"
                            aria-label="Project actions"
                            onClick={() =>
                              setIsProjectHeaderMenuOpen(
                                !isProjectHeaderMenuOpen,
                              )
                            }
                            className="paper-btn paper-btn--paper w-9 h-9 text-black flex items-center justify-center cursor-pointer select-none"
                          >
                            <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
                          </button>

                          {isProjectHeaderMenuOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() =>
                                  setIsProjectHeaderMenuOpen(false)
                                }
                              />
                              <div
                                className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white dark:bg-[#18191c] border-2 border-black p-1.5 text-xs animate-in fade-in-50 duration-150 rounded-[2px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsProjectHeaderMenuOpen(false);
                                    handleArchiveProject(selectedProject.id);
                                    handleSelectView("dashboard");
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left font-semibold text-[#E5484D] hover:bg-[#E5484D]/10 cursor-pointer font-sans rounded-[2px]"
                                >
                                  <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                                  <span>Archive Project</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Back to Projects Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectView("dashboard")}
                        className="paper-btn paper-btn--lime px-4 py-2 font-brand-sans font-bold text-xs flex items-center gap-2 cursor-pointer select-none"
                      >
                        <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        <span>Back to Projects</span>
                      </button>
                    </div>
                  </div>
                </RoughBox>
              </div>
            )}

            {/* "Create a Project" Hero Card on Dashboard - Owner & Admin only */}
            {!selectedProject && !isArchivedView && isOwnerOrAdmin && (
              <CreateBlankCard
                title="Create a Project"
                subtitle="Organize canvases, specs and your work"
                onClick={() => setIsCreateProjectModalOpen(true)}
              />
            )}

            {/* "Create a Blank File" Hero Card on Project Page (§13.2) */}
            {selectedProject && (
              <CreateBlankCard
                title="Create a Blank File"
                subtitle="Infinite drafting canvas & specs"
                tag="BLANK CANVAS"
                punchedHoles={true}
                onClick={() => setIsNewFileModalOpen(true)}
              />
            )}

            {/* Section Header: [01] PROJECT FILES • 4 ITEMS --- sparks */}
            <div className="py-2">
              <div className="section-head flex items-center gap-3">
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="px-1.5 py-0.5 bg-[#E9FFA3] text-black border border-black font-mono text-xs font-bold rounded-[2px]">
                    {selectedProject
                      ? String(filteredAndSortedFiles.length).padStart(2, "0")
                      : String(filteredProjects.length).padStart(2, "0")}
                  </span>
                  <span className="font-mono font-bold text-xs uppercase tracking-[0.5px] text-black dark:text-white">
                    {selectedProject
                      ? `PROJECT FILES • ${filteredAndSortedFiles.length} ${filteredAndSortedFiles.length === 1 ? "ITEM" : "ITEMS"}`
                      : isArchivedView
                        ? "ARCHIVED DIRECTORY • SOFT-DELETED PROJECTS"
                        : "PROJECTS DIRECTORY • ACTIVE REPOSITORY"}
                  </span>
                </div>

                <div className="rule flex-1 border-t-[1.5px] border-dashed border-[#DAD1C5] dark:border-white/20" />

                {!selectedProject && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-xs text-black/80 dark:text-white/80 uppercase tracking-[0.35px]">
                      {isArchivedView
                        ? `${String(filteredProjects.length).padStart(2, "0")} / ${String(archivedProjects.length).padStart(2, "0")} ARCHIVED`
                        : `${String(filteredProjects.length).padStart(2, "0")} / ${String(activeProjects.length).padStart(2, "0")} PROJECTS`}
                    </span>
                  </div>
                )}

                {/* 3 Doodle Spark Rays on the Right (§13.3) */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-black dark:text-white shrink-0"
                  aria-hidden="true"
                >
                  <line x1="4" y1="4" x2="16" y2="1" />
                  <line x1="2" y1="10" x2="18" y2="10" />
                  <line x1="4" y1="16" x2="16" y2="19" />
                </svg>
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
                onOpenNewFileModal={() => setIsNewFileModalOpen(true)}
              />
            ) : (
              <ProjectsTable
                projects={filteredProjects}
                files={files}
                isArchived={isArchivedView}
                currentUserRole={activeWorkspace?.role || "member"}
                onSelectProject={handleSelectProject}
                onRenameProject={
                  isOwnerOrAdmin ? handleRenameProject : undefined
                }
                onArchiveProject={
                  isOwnerOrAdmin ? handleArchiveProject : undefined
                }
                onPermanentlyDeleteProject={
                  activeWorkspace?.role === "owner"
                    ? handlePermanentlyDeleteProject
                    : undefined
                }
                onOpenNewProjectModal={
                  isOwnerOrAdmin
                    ? () => setIsCreateProjectModalOpen(true)
                    : undefined
                }
                workspaceId={effectiveWorkspaceId}
              />
            )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Floating Help / Shortcuts Button in bottom-right corner */}
      <div className="fixed bottom-5 right-5 z-30">
        <button
          type="button"
          aria-label="Keyboard shortcuts and help"
          onClick={() => setIsShortcutsModalOpen(true)}
          className="w-9 h-9 paper-btn paper-btn--help paper-btn--shadow cursor-pointer"
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Modals */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        projects={activeProjects}
        defaultProjectId={selectedProject?.id || activeProjects[0]?.id}
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

      <DeleteWorkspaceModal
        isOpen={Boolean(workspaceToDelete)}
        onClose={() => setWorkspaceToDelete(null)}
        workspace={workspaceToDelete}
        onDeleted={handleWorkspaceDeleted}
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
