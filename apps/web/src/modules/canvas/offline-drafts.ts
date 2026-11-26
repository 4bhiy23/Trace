import { openDB, type DBSchema } from "idb";
import type { CanvasDetail } from "@trace/shared";
import { mergeUpdates } from "yjs";

export type OfflineCanvas = Pick<
  CanvasDetail,
  "id" | "projectId" | "workspaceId" | "name"
>;
export type OfflineSession = { id: string; userId: string; expiresAt: number };

type OfflineDraft = {
  canvas: OfflineCanvas;
  state?: Uint8Array;
  pending?: boolean;
};

interface DraftDatabase extends DBSchema {
  sessions: {
    key: string;
    value: OfflineSession;
    indexes: { account: string };
  };
  drafts: { key: [string, string]; value: OfflineDraft };
}

function openOfflineDatabase() {
  return openDB<DraftDatabase>("trace-offline-drafts", 1, {
    upgrade(database) {
      database.createObjectStore("sessions").createIndex("account", "userId");
      database.createObjectStore("drafts");
    },
  });
}

async function withDatabase<T>(
  operation: (
    db: Awaited<ReturnType<typeof openOfflineDatabase>>,
  ) => Promise<T>,
) {
  const database = await openOfflineDatabase();
  try {
    return await operation(database);
  } finally {
    database.close();
  }
}

export function getOfflineSession(key: string) {
  return withDatabase(async (db) => {
    const session = await db.get("sessions", key);
    return session && session.expiresAt > Date.now() ? session : undefined;
  });
}

export function readOfflineDraft(
  key: string,
  accountId: string,
  canvasId: string,
) {
  return withDatabase(async (db) => {
    const tx = db.transaction(["sessions", "drafts"], "readonly");
    const session = await tx.objectStore("sessions").get(key);
    if (session?.userId !== accountId || session.expiresAt <= Date.now())
      return;
    return tx.objectStore("drafts").get([accountId, canvasId]);
  });
}

export function rememberOfflineDraft(
  key: string,
  session: OfflineSession,
  { id, name, projectId, workspaceId }: OfflineCanvas,
) {
  return withDatabase(async (db) => {
    const tx = db.transaction(["sessions", "drafts"], "readwrite");
    const drafts = tx.objectStore("drafts");
    const draftKey: [string, string] = [session.userId, id];
    const previous = await drafts.get(draftKey);
    const draft = { ...previous, canvas: { id, name, projectId, workspaceId } };
    await Promise.all([
      tx.objectStore("sessions").put(session, key),
      drafts.put(draft, draftKey),
      tx.done,
    ]);
    return draft;
  });
}

export function writeOfflineDraft(
  key: string,
  accountId: string,
  canvasId: string,
  state: Uint8Array,
  pending: boolean,
) {
  return withDatabase(async (db) => {
    const tx = db.transaction(["sessions", "drafts"], "readwrite");
    const drafts = tx.objectStore("drafts");
    const draftKey: [string, string] = [accountId, canvasId];
    const session = await tx.objectStore("sessions").get(key);
    const draft = await drafts.get(draftKey);
    // A closed or revoked tab may have queued a write before the record was cleared.
    if (
      session?.userId !== accountId ||
      session.expiresAt <= Date.now() ||
      !draft
    )
      return false;

    const merged = draft.state ? mergeUpdates([draft.state, state]) : state;
    // Preserve pending edits from another tab even when this tab is already synced.
    const hasOtherEdits =
      draft.pending &&
      (merged.length !== state.length ||
        merged.some((byte, index) => byte !== state[index]));
    await Promise.all([
      drafts.put(
        { ...draft, state: merged, pending: pending || hasOtherEdits },
        draftKey,
      ),
      tx.done,
    ]);
    return true;
  });
}

export function forgetOfflineDraft(accountId: string, canvasId: string) {
  return withDatabase((db) => db.delete("drafts", [accountId, canvasId]));
}

export function clearOfflineAccount(accountId: string) {
  return withDatabase(async (db) => {
    const tx = db.transaction(["sessions", "drafts"], "readwrite");
    const sessions = tx.objectStore("sessions");
    const drafts = tx.objectStore("drafts");
    const sessionKeys = await sessions.index("account").getAllKeys(accountId);
    const draftKeys = await drafts.getAllKeys(
      IDBKeyRange.bound([accountId, ""], [accountId, "\uffff"]),
    );
    await Promise.all([
      ...sessionKeys.map((key) => sessions.delete(key)),
      ...draftKeys.map((key) => drafts.delete(key)),
      tx.done,
    ]);
  });
}
