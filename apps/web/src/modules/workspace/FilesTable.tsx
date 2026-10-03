"use client";

import React, { useState } from "react";
import {
  FileText,
  Layers,
  GitFork,
  Database,
  Code,
  ArrowUpDown,
  MoreHorizontal,
  Folder as FolderIcon,
  Trash2,
  Copy,
  Edit3,
  Archive,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { WorkspaceFile, CanvasType, SortField, SortDirection } from "./types";
import { cn } from "@/lib/utils";

interface FilesTableProps {
  files: WorkspaceFile[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onOpenFile: (file: WorkspaceFile) => void;
  onDeleteFile: (fileId: string) => void;
  onDuplicateFile: (file: WorkspaceFile) => void;
  onArchiveFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

export function FilesTable({
  files,
  sortField,
  sortDirection,
  onOpenFile,
  onDeleteFile,
  onDuplicateFile,
  onArchiveFile,
  onRenameFile,
  onSort,
}: FilesTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const getCanvasIcon = (type: CanvasType) => {
    switch (type) {
      case "architecture":
        return <Layers className="w-4 h-4 text-sky-500" />;
      case "flow":
        return <GitFork className="w-4 h-4 text-emerald-500" />;
      case "dbml":
        return <Database className="w-4 h-4 text-purple-500" />;
      case "uml":
        return <Code className="w-4 h-4 text-indigo-500" />;
      case "markdown":
      default:
        return <FileText className="w-4 h-4 text-[var(--chart-1)]" />;
    }
  };

  const handleStartRename = (file: WorkspaceFile) => {
    setEditingFileId(file.id);
    setEditingName(file.name);
    setActiveMenuId(null);
  };

  const handleFinishRename = (fileId: string) => {
    if (editingName.trim()) {
      onRenameFile(fileId, editingName.trim());
    }
    setEditingFileId(null);
    setEditingName("");
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[11px] font-semibold tracking-wider uppercase text-[var(--muted-foreground)]/80 border-b border-[var(--border)] select-none">
        <div
          className="col-span-4 flex items-center gap-1.5 cursor-pointer hover:text-[var(--foreground)] transition-colors"
          onClick={() => onSort("name")}
        >
          <span>Name</span>
          {sortField === "name" && (
            <span className="text-xs">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div className="col-span-2 hidden md:block">Location</div>
        <div
          className="col-span-2 hidden sm:block cursor-pointer hover:text-[var(--foreground)] transition-colors"
          onClick={() => onSort("created")}
        >
          <span>Created</span>
          {sortField === "created" && (
            <span className="text-xs">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div
          className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[var(--foreground)] transition-colors"
          onClick={() => onSort("edited")}
        >
          <ArrowUpDown className="w-3 h-3" />
          <span>Edited</span>
          {sortField === "edited" && (
            <span className="text-xs">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div className="col-span-1 text-center hidden lg:block">Comments</div>
        <div className="col-span-1 text-right">Author</div>
      </div>

      {/* Table Rows */}
      {files.length === 0 ? (
        <div className="py-16 text-center text-xs text-[var(--muted-foreground)]">
          <p className="font-medium">No files found</p>
          <p className="text-[11px] mt-1 text-[var(--muted-foreground)]/70">
            Create a new blank canvas or change your search filter.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]/40">
          {files.map((file) => {
            const isMenuOpen = activeMenuId === file.id;

            return (
              <div
                key={file.id}
                className="group relative grid grid-cols-12 gap-3 px-4 py-3 items-center text-xs hover:bg-[var(--card)]/50 transition-colors duration-150 rounded-lg cursor-pointer"
                onClick={() => {
                  if (!editingFileId) onOpenFile(file);
                }}
              >
                {/* Name & Icon */}
                <div className="col-span-4 flex items-center gap-3 min-w-0 pr-2">
                  <div className="shrink-0 p-1.5 rounded-md bg-[var(--secondary)]/30 border border-[var(--border)]/40">
                    {getCanvasIcon(file.type)}
                  </div>

                  {editingFileId === file.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleFinishRename(file.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishRename(file.id);
                        if (e.key === "Escape") setEditingFileId(null);
                      }}
                      className="px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--primary)] text-xs text-[var(--foreground)] outline-none"
                    />
                  ) : (
                    <span className="font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {file.name}
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="col-span-2 hidden md:flex items-center gap-1.5 text-[var(--muted-foreground)]">
                  {file.location ? (
                    <div className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-[var(--secondary)]/40">
                      <FolderIcon className="w-3 h-3 opacity-60" />
                      <span className="truncate">{file.location}</span>
                    </div>
                  ) : (
                    <span className="text-[var(--muted-foreground)]/50">—</span>
                  )}
                </div>

                {/* Created */}
                <div className="col-span-2 hidden sm:block text-[var(--muted-foreground)]">
                  {file.createdAt}
                </div>

                {/* Edited */}
                <div className="col-span-2 text-[var(--muted-foreground)]">
                  {file.editedAt}
                </div>

                {/* Comments */}
                <div className="col-span-1 hidden lg:flex items-center justify-center text-[var(--muted-foreground)] gap-1">
                  {file.commentsCount > 0 && (
                    <MessageSquare className="w-3 h-3 opacity-70" />
                  )}
                  <span>{file.commentsCount}</span>
                </div>

                {/* Author & Action Menu */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs",
                      file.author.color,
                    )}
                    title={file.author.name}
                  >
                    {file.author.initials}
                  </div>

                  {/* Actions Dropdown Button */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      aria-label="File options"
                      onClick={() =>
                        setActiveMenuId(isMenuOpen ? null : file.id)
                      }
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/60 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-1.5 text-xs animate-in fade-in-50 zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenFile(file);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]/40 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Canvas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartRename(file)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]/40 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDuplicateFile(file);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]/40 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onArchiveFile(file.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]/40 transition-colors cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive</span>
                          </button>
                          <div className="border-t border-[var(--border)] my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteFile(file.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
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
