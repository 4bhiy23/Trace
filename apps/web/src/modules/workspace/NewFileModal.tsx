"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Layers,
  GitFork,
  Database,
  Code,
  Check,
} from "lucide-react";
import { CanvasType, WorkspaceFolder } from "./types";
import { cn } from "@/lib/utils";

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: WorkspaceFolder[];
  onCreateFile: (data: {
    name: string;
    type: CanvasType;
    location: string | null;
  }) => void;
}

export function NewFileModal({
  isOpen,
  onClose,
  folders,
  onCreateFile,
}: NewFileModalProps) {
  const [name, setName] = useState("Untitled File");
  const [selectedType, setSelectedType] = useState<CanvasType>("markdown");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  if (!isOpen) return null;

  const canvasOptions: {
    type: CanvasType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      type: "markdown",
      label: "Markdown Canvas",
      description: "Technical documentation, code snippets & notes",
      icon: FileText,
    },
    {
      type: "architecture",
      label: "Architecture Diagram",
      description: "Cloud infrastructure, services & API boundaries",
      icon: Layers,
    },
    {
      type: "flow",
      label: "Flowchart & Process",
      description: "State machines, user journeys & logic paths",
      icon: GitFork,
    },
    {
      type: "dbml",
      label: "Database Schema",
      description: "Entity relationships, tables & foreign keys",
      icon: Database,
    },
    {
      type: "uml",
      label: "UML Diagram",
      description: "Class hierarchies & sequence timelines",
      icon: Code,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateFile({
        name: name.trim(),
        type: selectedType,
        location: selectedFolder,
      });
      setName("Untitled File");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
              Create New Canvas
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Choose a canvas type to start documenting or diagramming.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Name */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              File Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Cache Design"
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all"
            />
          </div>

          {/* Folder Location */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Folder
            </label>
            <select
              value={selectedFolder || ""}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)] cursor-pointer"
            >
              <option value="">Root (No folder)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.name}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Canvas Types Grid */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Canvas Type
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {canvasOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedType(opt.type)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] shadow-xs"
                        : "border-[var(--border)]/70 hover:border-[var(--border)] hover:bg-[var(--secondary)]/30 text-[var(--muted-foreground)]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          isSelected
                            ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                            : "bg-[var(--secondary)]/40 text-[var(--foreground)]",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--foreground)]">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)]">
                          {opt.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--primary)] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 border border-[var(--border)] shadow-sm transition-all duration-150 cursor-pointer"
            >
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
