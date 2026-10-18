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
  Trash2,
  Copy,
  Edit3,
  ExternalLink,
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
  onRenameFile: (fileId: string, newName: string) => void;
}

export function FilesTable({
  files,
  sortField,
  sortDirection,
  onOpenFile,
  onDeleteFile,
  onDuplicateFile,
  onRenameFile,
  onSort,
}: FilesTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const getCanvasTypeLabel = (type: CanvasType) => {
    switch (type) {
      case "architecture":
        return "Architecture";
      case "flow":
        return "Flow";
      case "dbml":
        return "DBML";
      case "uml":
        return "UML";
      case "markdown":
      default:
        return "Markdown";
    }
  };

  const getCanvasTypeIcon = (type: CanvasType, className = "w-3.5 h-3.5") => {
    switch (type) {
      case "architecture":
        return <Layers className={className} />;
      case "flow":
        return <GitFork className={className} />;
      case "dbml":
        return <Database className={className} />;
      case "uml":
        return <Code className={className} />;
      case "markdown":
      default:
        return <FileText className={className} />;
    }
  };

  const getCanvasTypeBadge = (type: CanvasType) => {
    let colorClasses = "bg-white text-black border-black";
    if (type === "architecture")
      colorClasses = "bg-[#D3B8FC] text-black border-black";
    else if (type === "flow")
      colorClasses = "bg-[#E9FFA3] text-black border-black";
    else if (type === "dbml")
      colorClasses = "bg-[#FF9369] text-black border-black";
    else if (type === "uml")
      colorClasses = "bg-[#CFF266] text-black border-black";

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-roboto-mono uppercase tracking-wider font-semibold border",
          colorClasses,
        )}
      >
        {getCanvasTypeIcon(type, "w-3 h-3 stroke-[2.2]")}
        <span>{getCanvasTypeLabel(type)}</span>
      </span>
    );
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
    <div className="w-full bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[5px_6px_0px_0px_rgba(0,0,0,0.14)] font-brand-sans">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-brand-sans font-bold uppercase tracking-wider text-black dark:text-white bg-[#ECE7E0] dark:bg-[#202227] border-b-2 border-black dark:border-white/30 select-none">
        <div
          className="col-span-5 flex items-center gap-1.5 cursor-pointer hover:underline"
          onClick={() => onSort("name")}
        >
          <span>Name</span>
          {sortField === "name" && (
            <span className="text-xs font-bold text-black dark:text-white">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div
          className="col-span-2 hidden md:flex items-center gap-1.5 cursor-pointer hover:underline"
          onClick={() => onSort("type")}
        >
          <span>Canvas Type</span>
          {sortField === "type" && (
            <span className="text-xs font-bold text-black dark:text-white">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div
          className="col-span-2 hidden sm:block cursor-pointer hover:underline"
          onClick={() => onSort("created")}
        >
          <span>Created</span>
          {sortField === "created" && (
            <span className="text-xs font-bold text-black dark:text-white">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div
          className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:underline"
          onClick={() => onSort("edited")}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Edited</span>
          {sortField === "edited" && (
            <span className="text-xs font-bold text-black dark:text-white">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
        <div className="col-span-1 text-right">Author</div>
      </div>

      {/* Table Rows */}
      {files.length === 0 ? (
        <div className="py-16 text-center text-xs text-[#636363] dark:text-white/60">
          <p className="font-brand-display font-bold text-base text-black dark:text-white">
            No canvases found
          </p>
          <p className="text-xs font-roboto-mono mt-1 text-[#636363] dark:text-white/60">
            Create a new blank canvas or adjust your active filters.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-black/15 dark:divide-white/10">
          {files.map((file) => {
            const isMenuOpen = activeMenuId === file.id;

            return (
              <div
                key={file.id}
                className="group relative grid grid-cols-12 gap-3 px-4 py-3 items-center text-xs hover:bg-[#fafbe9] dark:hover:bg-[#202227]/80 transition-colors duration-150 cursor-pointer"
                onClick={() => {
                  if (!editingFileId) onOpenFile(file);
                }}
              >
                {/* Name & Icon */}
                <div className="col-span-5 flex items-center gap-3 min-w-0 pr-2">
                  <div className="shrink-0 p-1.5 border border-black bg-white dark:bg-black text-black dark:text-white shadow-[1px_1px_0px_#000000]">
                    {getCanvasTypeIcon(file.type, "w-3.5 h-3.5 stroke-[2.2]")}
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
                      className="px-2 py-1 bg-white border-2 border-black text-xs text-black outline-none font-brand-sans"
                    />
                  ) : (
                    <span className="font-brand-display font-semibold text-xs sm:text-sm text-black dark:text-white truncate group-hover:underline">
                      {file.name}
                    </span>
                  )}
                </div>

                {/* Canvas Type */}
                <div className="col-span-2 hidden md:flex items-center">
                  {getCanvasTypeBadge(file.type)}
                </div>

                {/* Created */}
                <div className="col-span-2 hidden sm:block font-roboto-mono text-xs text-[#636363] dark:text-white/60">
                  {file.createdAt}
                </div>

                {/* Edited */}
                <div className="col-span-2 font-roboto-mono text-xs font-medium text-black dark:text-white">
                  {file.editedAt}
                </div>

                {/* Author & Action Menu */}
                <div className="col-span-1 flex items-center justify-end gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-brand-display font-bold shrink-0 border-2 border-black",
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
                      className="p-1 border border-black/30 hover:border-black hover:bg-[#E9FFA3] hover:text-black text-black dark:text-white transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>

                    {/* Popover Action Menu */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/40 shadow-[5px_6px_0px_0px_#000000] p-1.5 text-xs animate-in fade-in-50 zoom-in-95 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              onOpenFile(file);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 font-medium text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black border border-transparent hover:border-black transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Canvas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartRename(file)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 font-medium text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black border border-transparent hover:border-black transition-colors cursor-pointer"
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
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 font-medium text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black border border-transparent hover:border-black transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                          <div className="border-t-2 border-black/15 dark:border-white/15 my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteFile(file.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 font-bold text-red-600 hover:bg-red-500 hover:text-white border border-transparent hover:border-black transition-colors cursor-pointer"
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
