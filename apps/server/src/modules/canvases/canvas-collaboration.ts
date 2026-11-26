import type { RequestListener } from "node:http";
import { Server, type Document, type Hocuspocus } from "@hocuspocus/server";
import {
  apiPaths,
  canEditProject,
  canvasCollaboration,
  type CanvasParticipant,
} from "@trace/shared";
import { and, eq, isNull, sql } from "drizzle-orm";
import * as Y from "yjs";
import { z } from "zod";
import { env } from "../../config/env";
import { db } from "../../db/client";
import { canvas } from "../../db/schema";
import { findProjectMembership } from "../../shared/auth/require-workspace-access";
import { HttpError } from "../../shared/http/errors";
import { logger } from "../../shared/logger";
import { auth } from "../auth/auth";

type Session = {
  userId: string;
  name: string;
  projectId: string;
  readOnly: boolean;
};

export type CanvasRooms = Hocuspocus<Session>;

type SavedDraft = {
  revision: number;
  source: string;
  snapshot: Y.Snapshot;
};

const savedDrafts = new WeakMap<Document, SavedDraft>();
const uuid = z.string().uuid();
const unauthorized = { code: 4403, reason: canvasCollaboration.accessDenied };

export function disconnectCanvasRoom(rooms: CanvasRooms, canvasId: string) {
  const document = rooms.documents.get(canvasId);
  for (const connection of document?.getConnections() ?? []) {
    connection.close(unauthorized);
  }
}

const cursorPalette = [
  "#3e51bd",
  "#a22458",
  "#216c4e",
  "#884611",
  "#6535a2",
  "#166881",
  "#a32e20",
  "#556715",
  "#8c396c",
  "#395981",
];
const roomColors = new WeakMap<
  Document,
  Map<string, Pick<CanvasParticipant, "color" | "colorLight">>
>();

function getParticipant(
  document: Document,
  context: Session,
): CanvasParticipant {
  let colors = roomColors.get(document);
  if (!colors) {
    colors = new Map();
    roomColors.set(document, colors);
  }
  let swatch = colors.get(context.userId);
  if (!swatch) {
    const color = cursorPalette[colors.size];
    const hue = Math.round(colors.size * 137.508) % 360;
    swatch = color
      ? { color, colorLight: color + "33" }
      : {
          color: `hsl(${hue} 64% 35%)`,
          colorLight: `hsl(${hue} 64% 35% / 20%)`,
        };
    colors.set(context.userId, swatch);
  }
  return {
    id: context.userId,
    name: context.name || "Collaborator",
    access: context.readOnly ? "viewer" : "editor",
    ...swatch,
  };
}

async function getRoomAccess(headers: Headers, projectId: string) {
  const session = await auth.api.getSession({
    headers,
    query: { disableRefresh: true },
  });
  if (!session) return;
  const project = await findProjectMembership(session.user.id, projectId);
  if (!project) return;
  return {
    userId: session.user.id,
    name: session.user.name,
    projectId,
    readOnly:
      Boolean(project.archivedAt) ||
      !canEditProject(project.role, project.editorId !== null),
  };
}

async function hasUnchangedAccess(headers: Headers, context: Session) {
  const access = await getRoomAccess(headers, context.projectId);
  return (
    access?.userId === context.userId && access.readOnly === context.readOnly
  );
}

function getSavedDraft(document: Document) {
  const saved = savedDrafts.get(document);
  if (!saved) throw new Error("Markdown draft is not loaded");
  return saved;
}

const savedMessage = (snapshot: Y.Snapshot) =>
  canvasCollaboration.saved +
  Buffer.from(Y.encodeSnapshot(snapshot)).toString("base64");

async function loadDraft(document: Document) {
  const [item] = await db
    .select({
      source: sql<string | null>`${canvas.draft}->>'source'`,
      yjsState: canvas.yjsState,
      revision: canvas.revision,
    })
    .from(canvas)
    .where(and(eq(canvas.id, document.name), eq(canvas.type, "markdown")));
  if (!item) throw new Error("Markdown canvas not found");

  const source = item.source ?? "";
  if (item.yjsState) {
    Y.applyUpdate(document, item.yjsState);
  } else {
    if (source) document.getText(canvasCollaboration.text).insert(0, source);
    // Persist the original Yjs IDs before any client can sync this draft.
    const [seed] = await db
      .update(canvas)
      .set({
        yjsState: Buffer.from(Y.encodeStateAsUpdate(document)),
        updatedAt: canvas.updatedAt,
      })
      .where(
        and(
          eq(canvas.id, document.name),
          eq(canvas.revision, item.revision),
          isNull(canvas.yjsState),
        ),
      )
      .returning({ id: canvas.id });
    if (!seed) throw new Error("Markdown draft changed while opening");
  }
  savedDrafts.set(document, {
    revision: item.revision,
    source,
    snapshot: Y.snapshot(document),
  });
}

// Called with Hocuspocus's document save mutex held.
async function storeDraft(document: Document) {
  const saved = getSavedDraft(document);
  const snapshot = Y.snapshot(document);
  if (Y.equalSnapshots(saved.snapshot, snapshot)) return;

  const source = document.getText(canvasCollaboration.text).toString();
  try {
    const [updated] = await db
      .update(canvas)
      .set({
        yjsState: Buffer.from(Y.encodeStateAsUpdate(document)),
        draft: sql`jsonb_set(${canvas.draft}, '{source}', to_jsonb(${source}::text))`,
        revision: sql`${canvas.revision} + 1`,
      })
      .where(
        and(eq(canvas.id, document.name), eq(canvas.revision, saved.revision)),
      )
      .returning({ revision: canvas.revision });
    if (!updated) {
      const [existing] = await db
        .select({ id: canvas.id })
        .from(canvas)
        .where(eq(canvas.id, document.name));
      if (!existing) return;
      throw new Error("Markdown draft changed outside this room");
    }
    savedDrafts.set(document, { revision: updated.revision, source, snapshot });
    document.broadcastStateless(savedMessage(snapshot));
  } catch {
    document.broadcastStateless(canvasCollaboration.saveFailed);
    // Database errors can contain query parameters, including private draft text.
    logger.error(
      { canvasId: document.name },
      "Markdown draft could not be stored",
    );
    throw new Error("Markdown draft could not be stored");
  }
}

export function createCollaborationServer(handleRequest: RequestListener) {
  let accessTimer: ReturnType<typeof setInterval> | undefined;
  let checkingAccess = false;
  const origins = new Set([
    new URL(env.WEB_URL).origin,
    new URL(env.BETTER_AUTH_URL).origin,
  ]);

  return new Server<Session>({
    port: env.PORT,
    stopOnSignals: false,
    quiet: true,
    debounce: 500,
    maxDebounce: 2_000,
    websocketOptions: { maxPayload: 2 * 1024 * 1024 },
    async onRequest({ request, response }) {
      handleRequest(request, response);
      // A falsy rejection tells the built-in server that Express owns the response.
      return Promise.reject(null);
    },
    async onUpgrade({ request, socket }) {
      if (
        request.url?.split("?")[0] !== apiPaths.canvasCollaboration ||
        !origins.has(request.headers.origin ?? "")
      ) {
        socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
        return Promise.reject(null);
      }
    },
    async onAuthenticate({ documentName, requestHeaders, connectionConfig }) {
      if (!uuid.safeParse(documentName).success) throw unauthorized;
      const [item] = await db
        .select({ projectId: canvas.projectId })
        .from(canvas)
        .where(and(eq(canvas.id, documentName), eq(canvas.type, "markdown")));
      const access =
        item && (await getRoomAccess(requestHeaders, item.projectId));
      if (!access) throw unauthorized;
      connectionConfig.readOnly = access.readOnly;
      return access;
    },
    async beforeHandleMessage({ context, requestHeaders }) {
      if (!(await hasUnchangedAccess(requestHeaders, context)))
        throw unauthorized;
    },
    async onLoadDocument({ document }) {
      try {
        await loadDraft(document);
      } catch {
        logger.error(
          { canvasId: document.name },
          "Markdown draft could not be loaded",
        );
        throw new Error("Markdown draft could not be loaded");
      }
    },
    async connected({ connection, context }) {
      const [existing] = await db
        .select({ id: canvas.id })
        .from(canvas)
        .where(eq(canvas.id, connection.document.name));
      if (!existing) {
        connection.close(unauthorized);
        return;
      }
      connection.sendStateless(
        canvasCollaboration.participant +
          JSON.stringify(getParticipant(connection.document, context)),
      );
      connection.sendStateless(
        savedMessage(getSavedDraft(connection.document).snapshot),
      );
    },
    async beforeHandleAwareness({
      context,
      document,
      awareness,
      states,
      removedClients,
    }) {
      if (!context) return;
      const participant = getParticipant(document, context);
      const active = awareness.getStates();
      for (const [clientId, state] of states) {
        const existing = active.get(clientId)?.user;
        if (existing && existing.id !== participant.id) {
          states.delete(clientId);
          continue;
        }
        state.user = participant;
        if (context.readOnly) delete state.cursor;
      }
      for (const clientId of removedClients) {
        if (active.get(clientId)?.user?.id !== participant.id) {
          removedClients.delete(clientId);
        }
      }
    },
    async onStoreDocument({ document }) {
      await storeDraft(document);
    },
    async beforeUnloadDocument({ document }) {
      // A previous failed store must not discard the room when the last client leaves.
      await document.saveMutex.runExclusive(() => storeDraft(document));
    },
    async onStateless({ document, connection, payload }) {
      if (connection.readOnly || payload !== canvasCollaboration.retrySave)
        return;
      await document.saveMutex
        .runExclusive(() => storeDraft(document))
        .catch(() => {
          // The room notified the client and still has the unsaved draft.
        });
    },
    async onListen({ instance }) {
      // An idle reader may receive updates without sending a document message.
      accessTimer = setInterval(async () => {
        if (checkingAccess) return;
        checkingAccess = true;
        try {
          await Promise.allSettled(
            [...instance.documents.values()].flatMap((document) =>
              document.getConnectionsCount() === 0
                ? [instance.unloadDocument(document)]
                : document.getConnections().map(async (connection) => {
                    const allowed = await hasUnchangedAccess(
                      connection.request.headers,
                      connection.context,
                    ).catch(() => false);
                    if (!allowed) connection.close(unauthorized);
                  }),
            ),
          );
        } finally {
          checkingAccess = false;
        }
      }, 30_000);
      accessTimer.unref();
    },
    async onDestroy() {
      clearInterval(accessTimer);
    },
  });
}

export async function replaceCollaborativeDraft(
  rooms: CanvasRooms,
  canvasId: string,
  revision: number,
  source: string,
) {
  const connection = await rooms.openDirectConnection(canvasId);
  const document = connection.document;
  if (!document) throw new Error("Markdown draft could not be opened");

  try {
    await document.saveMutex.runExclusive(async () => {
      await connection.transact(() => {
        const saved = getSavedDraft(document);
        const text = document.getText(canvasCollaboration.text);
        if (saved.revision !== revision || text.toString() !== saved.source) {
          throw new HttpError(
            409,
            "CONFLICT",
            "This draft changed in another session. Reopen the canvas before replacing the draft.",
          );
        }
        if (source === saved.source) return;
        text.delete(0, text.length);
        text.insert(0, source);
      });
      await storeDraft(document);
    });
  } finally {
    await connection.disconnect({ unloadImmediately: false });
  }
}
