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
import { CanvasType, WorkspaceProject } from "./types";
import { cn } from "@/lib/utils";

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WorkspaceProject[];
  defaultProjectId?: string;
  onCreateFile: (data: {
    name: string;
    type: CanvasType;
    projectId: string;
  }) => void;
}

export function NewFileModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
  onCreateFile,
}: NewFileModalProps) {
  const [name, setName] = useState("Untitled File");
  const [selectedType, setSelectedType] = useState<CanvasType>("markdown");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId || projects[0]?.id || "",
  );

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
        projectId: selectedProjectId || projects[0]?.id || "",
      });
      setName("Untitled File");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200 font-brand-sans">
      <div
        className="w-full max-w-lg bg-[#FFFEFC] dark:bg-[#18191c] text-black dark:text-white border-2 border-black dark:border-white/30 shadow-[8px_10px_0px_0px_#000000] p-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-black dark:border-white/20">
          <div>
            <div className="font-roboto-mono text-[10px] uppercase tracking-[0.2em] text-[#636363] dark:text-white/60 font-semibold mb-0.5">
              CANVAS CREATION
            </div>
            <h2 className="font-brand-display font-bold text-xl text-black dark:text-white tracking-tight">
              Draft New Canvas
            </h2>
            <p className="font-brand-sans text-xs text-[#636363] dark:text-white/60 mt-0.5">
              Select a canvas format for technical documentation or system
              architectures.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border border-black hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Name */}
          <div>
            <label className="block font-roboto-mono text-[10.5px] uppercase tracking-wider text-black dark:text-white mb-1.5 font-bold">
              FILE NAME
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Cache Design"
              required
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white focus:outline-none shadow-[2px_2px_0px_#000000] focus:shadow-[3px_3px_0px_#000000] transition-all placeholder:text-[#636363]"
            />
          </div>

          {/* Project Selection */}
          {projects.length > 0 && (
            <div>
              <label className="block font-roboto-mono text-[10.5px] uppercase tracking-wider text-black dark:text-white mb-1.5 font-bold">
                TARGET PROJECT
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#111213] border-2 border-black dark:border-white/40 text-black dark:text-white cursor-pointer focus:outline-none shadow-[2px_2px_0px_#000000] font-brand-sans"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.count} canvases)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Canvas Types Grid */}
          <div>
            <label className="block font-roboto-mono text-[10.5px] uppercase tracking-wider text-black dark:text-white mb-1.5 font-bold">
              CANVAS FORMAT
            </label>
            <div className="space-y-1.5">
              {canvasOptions.map((option) => {
                const isSelected = selectedType === option.type;
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => setSelectedType(option.type)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 text-left transition-all cursor-pointer font-brand-sans",
                      isSelected
                        ? "bg-[#E9FFA3] text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
                        : "bg-white dark:bg-[#111213] text-black dark:text-white border-2 border-black/20 dark:border-white/20 hover:border-black hover:bg-black/5",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "p-1.5 border border-black",
                          isSelected
                            ? "bg-black text-[#E9FFA3]"
                            : "bg-[#ECE7E0] dark:bg-black text-black dark:text-white",
                        )}
                      >
                        <IconComponent className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-brand-display font-bold text-xs tracking-tight">
                          {option.label}
                        </div>
                        <div className="text-[11px] font-brand-sans text-[#636363] dark:text-white/60 truncate">
                          {option.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-black stroke-[3] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold border-2 border-black bg-white dark:bg-[#111213] text-black dark:text-white hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-[#E9FFA3] hover:text-black border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
