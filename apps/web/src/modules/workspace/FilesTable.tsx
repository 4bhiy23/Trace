"use client";

import React, { useState } from "react";
import {
  FileText,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit3,
  ExternalLink,
  Plus,
} from "lucide-react";
import { WorkspaceFile, CanvasType, SortField, SortDirection } from "./types";
import { RoughBox } from "./RoughBox";
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
  onOpenNewFileModal?: () => void;
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
  onOpenNewFileModal,
}: FilesTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

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

  const renderTypeBadge = (type: CanvasType) => {
    const isMarkdown = type === "markdown";
    const isUml = type === "uml";
    const isArch = type === "architecture";

    let bgClass = "bg-transparent text-black dark:text-white";
    if (isUml) bgClass = "bg-[#E9FFA3] text-black";
    else if (isArch) bgClass = "bg-[#D3B8FC] text-black";
    else if (type === "flow") bgClass = "bg-[#E9FFA3] text-black";
    else if (type === "dbml") bgClass = "bg-[#FFC4A3] text-black";

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 border border-black rounded-[4px] font-mono font-bold text-xs uppercase tracking-[0.35px] whitespace-nowrap",
          bgClass,
        )}
      >
        {isMarkdown ? (
          <>
            <FileText className="w-3.5 h-3.5 stroke-[2]" />
            <span>MARKDOWN</span>
          </>
        ) : isUml ? (
          <>
            <span className="text-[11px] font-bold">&lt; &gt;</span>
            <span>UML</span>
          </>
        ) : (
          <span>{type.toUpperCase()}</span>
        )}
      </span>
    );
  };

  return (
    <div className="relative pt-3 pb-8 select-none">
      {/* Binder Sheet using RoughBox matching Section 12 & 13 */}
      <RoughBox
        seed={11}
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
          {/* Table Header Row: clean shaded band, no borders */}
          <div className="grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 min-h-[46px] items-center bg-[#ece7e0] dark:bg-[#202227] text-xs sm:text-[13px] font-mono font-bold uppercase tracking-[0.5px] text-black dark:text-white select-none">
            <div
              className="col-span-5 flex items-center gap-1.5 cursor-pointer hover:underline"
              onClick={() => onSort("name")}
            >
              <span>NAME</span>
              {sortField === "name" && (
                <span className="text-xs font-bold text-black dark:text-white">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div
              className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:underline"
              onClick={() => onSort("type")}
            >
              <span>TYPE</span>
              {sortField === "type" && (
                <span className="text-xs font-bold text-black dark:text-white">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
            <div
              className="col-span-2 hidden sm:flex items-center gap-1.5 cursor-pointer hover:underline"
              onClick={() => onSort("created")}
            >
              <span>CREATED</span>
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
              <span>LAST EDITED</span>
              <span className="text-xs font-bold">
                {sortField === "edited"
                  ? sortDirection === "asc"
                    ? "↑"
                    : "↓"
                  : "↓"}
              </span>
            </div>
            <div className="col-span-1 text-right">
              <span>ACTION</span>
            </div>
          </div>

          {/* Table Rows */}
          {files.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#636363] dark:text-white/60">
              <FileText className="w-8 h-8 stroke-[1.5] text-black/40 dark:text-white/40 mx-auto mb-2" />
              <p className="font-mono font-bold text-base text-black dark:text-white">
                No canvases found
              </p>
              <p className="text-xs font-mono mt-1 text-[#636363] dark:text-white/60">
                Create a canvas to start sketching, writing, or architecting.
              </p>
              {onOpenNewFileModal && (
                <button
                  type="button"
                  onClick={onOpenNewFileModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E9FFA3] text-black border-2 border-black font-mono font-bold text-xs shadow-[0_3px_0_0_#000] hover:bg-black hover:text-[#E9FFA3] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>CREATE FIRST CANVAS</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              {files.map((file, index) => {
                const isMenuOpen = activeMenuId === file.id;
                const isNearBottom = index >= Math.max(1, files.length - 2);

                return (
                  <div
                    key={file.id}
                    className={cn(
                      "grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 min-h-[68px] sm:min-h-[72px] items-center border-b border-[#dad1c5] dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors cursor-pointer group",
                      isMenuOpen ? "z-30 relative" : "relative",
                    )}
                    onClick={() => {
                      if (!editingFileId) onOpenFile(file);
                    }}
                  >
                    {/* Col 1: NAME (Square Icon + Title + Description) */}
                    <div className="col-span-5 flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="w-9 h-9 border border-black dark:border-white/40 rounded-[4px] bg-transparent flex items-center justify-center shrink-0">
                        {file.type === "markdown" ? (
                          <FileText className="w-4 h-4 stroke-[1.8] text-black dark:text-white" />
                        ) : (
                          <span className="font-mono font-bold text-xs tracking-tighter text-black dark:text-white">
                            &lt; &gt;
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {editingFileId === file.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => handleFinishRename(file.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                handleFinishRename(file.id);
                              if (e.key === "Escape") setEditingFileId(null);
                            }}
                            className="px-2 py-1 bg-white border-2 border-black text-xs text-black outline-none font-sans w-full"
                          />
                        ) : (
                          <>
                            <div className="font-sans font-bold text-sm text-black dark:text-white leading-tight truncate group-hover:underline">
                              {file.name}
                            </div>
                            <div className="font-sans text-xs text-[#737373] dark:text-white/60 leading-tight mt-0.5 truncate">
                              {file.description ||
                                "Workspace canvas and documentation"}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

           
                    <div className="col-span-2 flex items-center min-w-0">
                      {renderTypeBadge(file.type)}
                    </div>

              
                    <div className="col-span-2 hidden sm:flex items-center font-mono text-xs text-[#636363] dark:text-white/70 min-w-0 truncate">
                      {file.createdAt}
                    </div>

                 
                    <div className="col-span-2 flex items-center font-mono text-xs text-[#636363] dark:text-white/70 min-w-0 truncate">
                      {file.editedAt}
                    </div>

                    {/* Col 5: ACTION */}
                    <div className="col-span-1 flex items-center justify-end relative">
                      <button
                        type="button"
                        aria-label="File options"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : file.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer rounded-[4px]"
                      >
                        <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
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
                            className={cn(
                              "absolute right-0 z-50 w-44 bg-white dark:bg-[#18191c] border-2 border-black dark:border-white/30 shadow-[4px_5px_0px_0px_rgba(0,0,0,0.14)] p-1.5 text-xs animate-in fade-in-50 duration-150",
                              isNearBottom
                                ? "bottom-full mb-1.5"
                                : "top-full mt-1.5",
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onOpenFile(file);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 font-semibold text-black dark:text-white hover:bg-[#E9FFA3] hover:text-black cursor-pointer font-sans"
                            >
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Open Canvas</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartRename(file)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-sans"
                            >
                              <Edit3 className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Rename</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onDuplicateFile(file);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer font-sans"
                            >
                              <Copy className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Duplicate</span>
                            </button>
                            <div className="border-t-2 border-black/15 dark:border-white/15 my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteFile(file.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 font-semibold text-[#E5484D] hover:bg-[#E5484D]/10 cursor-pointer font-sans"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                              <span>Delete Canvas</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </RoughBox>
    </div>
  );
}
