# Trace

> A collaborative workspace for developers to create, edit, review, and preserve engineering diagrams and technical documentation in one project.

Trace is a project-based engineering workspace where teams can keep documentation, database schemas, UML diagrams, architecture diagrams, and process flows together without stitching together a pile of unrelated tools.

## What it supports

Each project can contain multiple **independent canvases**:

| Canvas | Source / Model | Experience |
|---|---|---|
| Markdown | Markdown | CodeMirror editor + live preview |
| DBML | DBML | Code editor + interactive ERD |
| UML Class | PlantUML | Interactive graph editor |
| UML Sequence | PlantUML | Timeline / lifeline editor |
| Architecture | Visual JSON model | Visual-first diagram editor |
| Flow | Mermaid | Code editor + interactive flow graph |

Canvases are intentionally independent. Each has its own content, collaboration room, layout, and version history.

## Core ideas

- **Real-time collaboration** with Yjs + authenticated WebSockets
- **Offline editing** with local persistence and sync on reconnect
- **Project-level RBAC** with Owner, Editor, and Viewer roles
- **Explicit versioning**: live edits update the draft; clicking **Save** creates a permanent version
- **Restorable history** for each individual canvas
- **Portable formats** using Markdown, DBML, PlantUML, and Mermaid where appropriate
- **Shared canvas primitives** for zoom, pan, selection, undo/redo, nodes, edges, and keyboard interactions
- **Server-side authorization** at project, canvas, collaboration, save, and restore boundaries

## Tech stack

**Frontend:** Next + TypeScript + Vite, Tailwind CSS, React Flow, CodeMirror 6  
**Backend:** Node.js + TypeScript + Express  
**Database:** PostgreSQL + Drizzle ORM  
**Auth:** Better Auth  
**Validation:** Zod  
**Collaboration:** Yjs + WebSocket  
**Offline storage:** IndexedDB  
**Optional coordination:** Redis  
**Local services:** Docker Compose

## Repository direction

```text
apps/
├── web/              # React frontend
└── server/           # Express API + WebSocket server

packages/
├── shared/           # Types, Zod schemas, API contracts
├── canvas-core/      # Shared canvas behavior
└── editors/          # Canvas-specific adapters
```

The **backend** owns authentication, authorization, persistence, version history, and synchronization.

The **frontend** owns rendering, syntax parsing/serialization, visual interactions, layout, and editor-specific behavior.

## Build order

The implementation is planned around vertical slices rather than building every subsystem in isolation:

`Shared contracts → Product foundation → Shared canvas platform → Markdown → Collaboration → DBML → Architecture → UML → Flow → Hardening`

The first major milestone is a complete Markdown canvas. Real-time collaboration is then validated on that simpler canvas before the more complex visual editors are built.

## Not in the initial scope

The first version deliberately excludes:

- End-to-end encryption and custom KMS
- Cross-canvas links and backlinks
- AI diagram generation
- Advanced presence and comments

The initial security boundary is an authenticated backend, transport security, strict server-side authorization, and project-level permissions.

## Product goal

A developer should be able to:

**sign in → create a project → choose the right canvas → design or document → collaborate → save a meaningful version → come back later and continue from a clear shared state.**

For the full behavior, requirements, acceptance criteria, and implementation phases, see the Product Requirements Document.
