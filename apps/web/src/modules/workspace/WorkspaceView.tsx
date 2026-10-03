"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { CreateBlankCard } from "./CreateBlankCard";
import { FilesTable } from "./FilesTable";
import { NewFileModal } from "./NewFileModal";
import { InviteModal } from "./InviteModal";
import { ShortcutsModal } from "./ShortcutsModal";
import {
  WorkspaceFile,
  WorkspaceFolder,
  FilterTab,
  SortField,
  SortDirection,
  CanvasType,
} from "./types";
import { initialFiles, initialFolders } from "./mockData";

export function WorkspaceView() {
  const [files, setFiles] = useState<WorkspaceFile[]>(initialFiles);
  const [folders, setFolders] = useState<WorkspaceFolder[]>(initialFolders);
  const [currentView, setCurrentView] = useState<
    "all" | "private" | "archive" | string
  >("all");
  const [currentTab, setCurrentTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("edited");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Modals state
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setCurrentView("all");
        setCurrentTab("all");
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        setCurrentView("private");
      } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        setCurrentView("archive");
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

  // Filter and sort files
  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Sidebar View Filter
        if (currentView === "archive") {
          return file.isArchived === true;
        }
        if (file.isArchived) return false;

        if (currentView === "private") {
          return file.isPrivate === true;
        }

        if (currentView.startsWith("folder:")) {
          const folderName = currentView.replace("folder:", "");
          return file.location === folderName;
        }

        // Top Filter Tabs
        if (currentTab === "created-by-me") {
          return file.author.initials === "SG";
        }
        if (currentTab === "folders") {
          return file.location !== null;
        }
        if (currentTab === "unsorted") {
          return file.location === null;
        }
        if (currentTab === "recents") {
          // files edited within the last 3 days
          return Date.now() - file.editedTimestamp < 3 * 24 * 60 * 60 * 1000;
        }

        return true;
      })
      .filter((file) => {
        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          file.name.toLowerCase().includes(q) ||
          file.type.toLowerCase().includes(q) ||
          (file.location && file.location.toLowerCase().includes(q)) ||
          file.author.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === "name") {
          diff = a.name.localeCompare(b.name);
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

  const handleCreateFile = ({
    name,
    type,
    location,
  }: {
    name: string;
    type: CanvasType;
    location: string | null;
  }) => {
    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      name,
      type,
      location,
      createdAt: "Just now",
      createdTimestamp: Date.now(),
      editedAt: "Just now",
      editedTimestamp: Date.now(),
      commentsCount: 0,
      author: {
        name: "Sarthak Gupta",
        initials: "SG",
        color: "bg-amber-600",
      },
      isPrivate: false,
      isArchived: false,
    };

    setFiles((prev) => [newFile, ...prev]);
    showToast(`Created canvas "${name}"`);

    // If assigned to a folder, increment folder count
    if (location) {
      setFolders((prev) =>
        prev.map((f) =>
          f.name === location ? { ...f, count: f.count + 1 } : f,
        ),
      );
    }
  };

  const handleAddFolder = (name: string) => {
    const exists = folders.some(
      (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      showToast(`Folder "${name}" already exists`);
      return;
    }
    const newFolder: WorkspaceFolder = {
      id: `folder-${Date.now()}`,
      name,
      count: 0,
    };
    setFolders((prev) => [...prev, newFolder]);
    showToast(`Added folder "${name}"`);
  };

  const handleOpenFile = (file: WorkspaceFile) => {
    showToast(`Opening canvas: ${file.name}`);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    showToast("File deleted");
  };

  const handleArchiveFile = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, isArchived: !f.isArchived } : f,
      ),
    );
    showToast("File moved to archive");
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      {/* Left Sidebar */}
      <WorkspaceSidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view.startsWith("folder:")) {
            setCurrentTab("folders");
          }
        }}
        folders={folders}
        onAddFolder={handleAddFolder}
        onOpenNewFileModal={() => setIsNewFileModalOpen(true)}
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

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* "Create a Blank File" Card - only shown on active canvas views */}
            {currentView !== "archive" && (
              <CreateBlankCard onClick={() => setIsNewFileModalOpen(true)} />
            )}

            {/* Files List / Table */}
            <FilesTable
              files={filteredAndSortedFiles}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onOpenFile={handleOpenFile}
              onDeleteFile={handleDeleteFile}
              onDuplicateFile={handleDuplicateFile}
              onArchiveFile={handleArchiveFile}
              onRenameFile={handleRenameFile}
            />
          </div>
        </main>
      </div>

      {/* Floating Help / Shortcuts Button in bottom-right corner */}
      <button
        type="button"
        aria-label="Keyboard shortcuts and help"
        onClick={() => setIsShortcutsModalOpen(true)}
        className="fixed bottom-5 right-5 w-8 h-8 rounded-full bg-[var(--card)] hover:bg-[var(--card)]/90 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)] shadow-lg flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer z-30"
        title="Keyboard shortcuts (?)"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Modals */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        folders={folders}
        onCreateFile={handleCreateFile}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--background)] text-xs font-semibold shadow-xl border border-[var(--border)]/40 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
