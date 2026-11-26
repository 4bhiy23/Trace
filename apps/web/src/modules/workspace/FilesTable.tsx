"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileText, ArrowUpRight, Pencil, Plus, Trash2 } from "lucide-react";
import type { CanvasSummary, CanvasType } from "@trace/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { canvasApi, canvasHref } from "@/modules/canvas/canvas-api";
import type { SortField, SortDirection } from "./types";
import { RoughBox } from "./RoughBox";
import { cn } from "@/lib/utils";

interface FilesTableProps {
  files: CanvasSummary[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onOpenNewFileModal?: () => void;
  onRenameCanvas?: (file: CanvasSummary) => void;
  onCanvasDeleted?: (file: CanvasSummary) => void;
}

export function FilesTable({
  files,
  sortField,
  sortDirection,
  onSort,
  onOpenNewFileModal,
  onRenameCanvas,
  onCanvasDeleted,
}: FilesTableProps) {
  const hasCanvasActions = Boolean(onRenameCanvas || onCanvasDeleted);
  const nameColumns = hasCanvasActions
    ? "col-span-6 sm:col-span-4"
    : "col-span-7 sm:col-span-5";
  const [canvasToDelete, setCanvasToDelete] = useState<CanvasSummary | null>(
    null,
  );
  const cancelButton = useRef<HTMLButtonElement>(null);
  const deletion = useMutation({
    mutationFn: (file: CanvasSummary) => canvasApi.remove(file.id),
    onSuccess: (_result, file) => {
      onCanvasDeleted?.(file);
      setCanvasToDelete(null);
    },
  });

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
              className={cn(
                "flex items-center gap-1.5 cursor-pointer hover:underline",
                nameColumns,
              )}
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
            <div
              className={cn(
                "text-right",
                hasCanvasActions ? "col-span-2" : "col-span-1",
              )}
            >
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
                {onOpenNewFileModal
                  ? "Create a canvas to start writing."
                  : "Canvases in this project will appear here."}
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
              {files.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-12 gap-2 sm:gap-3 px-3 sm:px-4 min-h-[68px] sm:min-h-[72px] items-center border-b border-[#dad1c5] dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group"
                >
                  <Link
                    href={canvasHref(file.id)}
                    className={cn(
                      "grid min-h-[68px] grid-cols-subgrid items-center gap-2 sm:min-h-[72px] sm:gap-3",
                      hasCanvasActions ? "col-span-10" : "col-span-12",
                    )}
                  >
                    {/* Col 1: NAME (Square Icon + Title + Description) */}
                    <div
                      className={cn(
                        "flex items-center gap-3.5 min-w-0 pr-2",
                        nameColumns,
                      )}
                    >
                      <div className="w-9 h-9 border border-black dark:border-white/40 rounded-[4px] bg-transparent flex items-center justify-center shrink-0">
                        {file.type === "markdown" ? (
                          <FileText className="w-4 h-4 stroke-[1.8] text-black dark:text-white" />
                        ) : (
                          <span className="font-mono font-bold text-xs tracking-tighter text-black dark:text-white">
                            &lt; &gt;
                          </span>
                        )}
                      </div>

                      <span className="min-w-0 truncate font-sans font-bold text-sm text-black dark:text-white group-hover:underline">
                        {file.name}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center min-w-0">
                      {renderTypeBadge(file.type)}
                    </div>

                    <div className="col-span-2 hidden sm:flex items-center font-mono text-xs text-[#636363] dark:text-white/70 min-w-0 truncate">
                      {new Date(file.createdAt).toLocaleDateString("en-GB")}
                    </div>

                    <div className="col-span-2 flex items-center font-mono text-xs text-[#636363] dark:text-white/70 min-w-0 truncate">
                      {new Date(file.updatedAt).toLocaleDateString("en-GB")}
                    </div>

                    {!hasCanvasActions && (
                      <div className="flex justify-end" aria-hidden="true">
                        <ArrowUpRight className="size-4" />
                      </div>
                    )}
                  </Link>
                  {hasCanvasActions && (
                    <div className="col-span-2 flex justify-end">
                      {onRenameCanvas && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Rename canvas: ${file.name}`}
                          title="Rename canvas"
                          className="rounded-sm"
                          onClick={() => onRenameCanvas(file)}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      )}
                      {onCanvasDeleted && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete canvas: ${file.name}`}
                          title="Delete canvas"
                          className="justify-self-end rounded-sm text-red-700 dark:text-red-300"
                          onClick={() => {
                            deletion.reset();
                            setCanvasToDelete(file);
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </RoughBox>
      <Dialog
        open={Boolean(canvasToDelete) && Boolean(onCanvasDeleted)}
        onOpenChange={(open) => {
          if (!open && !deletion.isPending) setCanvasToDelete(null);
        }}
      >
        <DialogContent initialFocus={cancelButton} showCloseButton={false}>
          <DialogTitle>Delete canvas?</DialogTitle>
          <DialogDescription className="wrap-anywhere">
            “{canvasToDelete?.name}” will be permanently deleted from this
            project. This action cannot be undone.
          </DialogDescription>
          {deletion.isError && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {deletion.error.message}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              ref={cancelButton}
              type="button"
              variant="outline"
              disabled={deletion.isPending}
              onClick={() => setCanvasToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletion.isPending}
              onClick={() => {
                if (canvasToDelete && onCanvasDeleted)
                  deletion.mutate(canvasToDelete);
              }}
            >
              {deletion.isPending ? "Deleting…" : "Delete canvas"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
