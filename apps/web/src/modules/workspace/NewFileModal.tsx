"use client";

import React, { useState } from "react";
import { X, FileText, Layers, Database, ChevronDown } from "lucide-react";
import { CanvasType, WorkspaceProject } from "./types";
import { SpiralBinding } from "./SpiralBinding";
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
    icon: (props: { className?: string }) => React.ReactNode;
  }[] = [
    {
      type: "markdown",
      label: "Markdown Canvas",
      description: "Technical documentation, code snippets & notes",
      icon: (props) => <FileText {...props} />,
    },
    {
      type: "architecture",
      label: "Architecture Diagram",
      description: "Cloud infrastructure, services & API boundaries",
      icon: (props) => <Layers {...props} />,
    },
    {
      type: "flow",
      label: "Flowchart & Process",
      description: "State machines, user journeys & logic paths",
      icon: (props) => (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={props.className}
        >
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M9 12h3a3 3 0 0 0 3-3V6" />
          <path d="M12 12a3 3 0 0 1 3 3v3" />
        </svg>
      ),
    },
    {
      type: "dbml",
      label: "Database Schema",
      description: "Entity relationships, tables & foreign keys",
      icon: (props) => <Database {...props} />,
    },
    {
      type: "uml",
      label: "UML Diagram",
      description: "Class hierarchies & sequence timelines",
      icon: () => (
        <span className="font-mono text-xs font-black tracking-tight text-black">
          &lt; &gt;
        </span>
      ),
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="modal-r1" x="-4%" y="-8%" width="108%" height="116%">
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
          <filter id="modal-r2" x="-4%" y="-8%" width="108%" height="116%">
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

      <style>{`
        .modal-rough-btn {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          --fill: #fffefc;
          --sx: 4px;
          --sy: 5px;
          cursor: pointer;
          border: 0;
          background: none;
          padding: 10px 22px;
          transition: transform 0.08s ease;
        }
        .modal-rough-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#modal-r1);
        }
        .modal-rough-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background: #111;
          border-radius: 2px;
          transform: translate(var(--sx), var(--sy));
          filter: url(#modal-r2);
        }
        .modal-rough-btn:active {
          transform: translate(2px, 3px);
          --sx: 2px;
          --sy: 2px;
        }
        .modal-rough-btn--lime {
          --fill: #ddfc78;
        }

        .modal-rough-card {
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          --fill: #fffefc;
          border: 0;
          background: none;
          width: 100%;
          padding: 9px 14px;
          cursor: pointer;
        }
        .modal-rough-card::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: var(--fill);
          border: 2px solid #111;
          border-radius: 2px;
          filter: url(#modal-r1);
          pointer-events: none;
        }
        .modal-rough-card--selected {
          --fill: #ddfc78;
        }
      `}</style>

      <div
        className="relative w-full max-w-[540px] my-6 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute -right-3 -bottom-2.5 top-3.5 left-2 bg-[#e6d6a2] border-2 border-[#111] rounded-r-xl pointer-events-none -z-10 shadow-[4px_6px_0px_rgba(0,0,0,0.22)]"
          aria-hidden="true"
        />

        <div
          className="relative bg-[#FAF5EC] border-2 border-[#111] rounded-lg shadow-[2px_3px_0px_rgba(0,0,0,0.12)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ece3d3 1px, transparent 1px), linear-gradient(#ece3d3 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="absolute left-6 right-6 -top-5 z-20 pointer-events-none">
            <SpiralBinding seed={7} />
          </div>

          <div className="p-5 sm:p-7 pt-11 sm:pt-12">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#636056] mb-1">
                  CANVAS CREATION
                </div>
                <div className="flex items-center">
                  <h2 className="font-brand-sans font-black text-2xl sm:text-[26px] tracking-tight text-[#111] leading-none">
                    Draft New Canvas
                  </h2>

                  <svg
                    width="18"
                    height="16"
                    viewBox="0 0 20 16"
                    fill="none"
                    stroke="#111"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    className="inline-block ml-2 text-black shrink-0"
                    aria-hidden="true"
                  >
                    <line x1="4" y1="14" x2="16" y2="3" />
                  </svg>
                </div>
                <p className="font-mono text-xs text-[#524f46] mt-1.5 leading-snug">
                  Select a canvas format for technical documentation or system
                  architectures.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="modal-rough-btn w-9 h-9 !p-0 flex items-center justify-center cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-5 h-5 stroke-[2.6] text-black" />
              </button>
            </div>

            <div className="w-full border-b-[1.5px] border-black my-4" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111] mb-1.5">
                  FILE NAME
                </label>
                <div className="modal-rough-card">
                  <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shrink-0 rounded-[2px] shadow-[1px_1px_0px_#000]">
                    <FileText className="w-4 h-4 stroke-[2.2] text-black" />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Untitled File"
                    required
                    className="flex-1 bg-transparent font-mono text-xs sm:text-sm font-bold text-black border-none outline-none focus:ring-0 ml-3 placeholder:text-black/40"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111] mb-1.5">
                  TARGET PROJECT
                </label>
                <div className="modal-rough-card relative">
                  <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center shrink-0 rounded-[2px] shadow-[1px_1px_0px_#000]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#111"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                  </div>

                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="flex-1 bg-transparent font-mono text-xs sm:text-sm font-bold text-black border-none outline-none focus:ring-0 ml-3 appearance-none cursor-pointer pr-6"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.count} canvases)
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="w-4 h-4 stroke-[2.5] text-black shrink-0 pointer-events-none absolute right-3.5" />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#111] mb-2">
                  CANVAS FORMAT
                </label>

                <div className="space-y-2">
                  {canvasOptions.map((option) => {
                    const isSelected = selectedType === option.type;
                    const IconComponent = option.icon;

                    return (
                      <div key={option.type} className="relative">
                        {isSelected && (
                          <>
                            <div
                              className="absolute -left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden sm:block"
                              aria-hidden="true"
                            >
                              <svg
                                width="14"
                                height="22"
                                viewBox="0 0 14 22"
                                fill="none"
                                stroke="#111"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              >
                                <line x1="12" y1="4" x2="2" y2="2" />
                                <line x1="12" y1="11" x2="2" y2="11" />
                                <line x1="12" y1="18" x2="2" y2="20" />
                              </svg>
                            </div>

                            <div
                              className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 hidden sm:block"
                              aria-hidden="true"
                            >
                              <svg
                                width="14"
                                height="22"
                                viewBox="0 0 14 22"
                                fill="none"
                                stroke="#111"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              >
                                <line x1="2" y1="4" x2="12" y2="2" />
                                <line x1="2" y1="11" x2="12" y2="11" />
                                <line x1="2" y1="18" x2="12" y2="20" />
                              </svg>
                            </div>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedType(option.type)}
                          className={cn(
                            "modal-rough-card justify-between",
                            isSelected && "modal-rough-card--selected",
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 border-2 border-black bg-white flex items-center justify-center shrink-0 rounded-[2px] shadow-[1px_1px_0px_#000]">
                              <IconComponent className="w-4 h-4 stroke-[2.2] text-black" />
                            </div>

                            <div className="text-left min-w-0">
                              <div className="font-brand-sans font-extrabold text-xs sm:text-sm text-black tracking-tight leading-tight">
                                {option.label}
                              </div>
                              <div className="font-mono text-[11px] text-[#555] truncate leading-tight mt-0.5">
                                {option.description}
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 border-black shrink-0 transition-colors ml-3",
                              isSelected
                                ? "bg-black shadow-[inset_0_0_0_3px_#ddfc78]"
                                : "bg-white",
                            )}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="modal-rough-btn font-brand-sans font-black text-xs uppercase tracking-wider text-black"
                >
                  <span>CANCEL</span>

                  <svg
                    className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M14 2L2 14"
                      stroke="#111"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </button>

                <button
                  type="submit"
                  className="modal-rough-btn modal-rough-btn--lime font-brand-sans font-black text-xs uppercase tracking-wider text-black"
                >
                  <span>CREATE FILE</span>

                  <svg
                    className="absolute right-1 bottom-1 w-3.5 h-3.5 pointer-events-none z-10"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M14 2L2 14"
                      stroke="#111"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
