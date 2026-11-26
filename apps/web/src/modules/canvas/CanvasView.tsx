"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { defaultKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { GFM } from "@lezer/markdown";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  canvasCollaboration,
  canvasParticipantSchema,
  type CanvasParticipant,
} from "@trace/shared";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import * as Y from "yjs";
import { ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/modules/auth/AuthGuard";
import { RoughBox } from "@/modules/workspace/RoughBox";
import { canvasApi, canvasSocketUrl } from "./canvas-api";
import { markdownPreview } from "./markdown-preview";
import {
  forgetOfflineDraft,
  readOfflineDraft,
  rememberOfflineDraft,
  writeOfflineDraft,
  type OfflineCanvas,
} from "./offline-drafts";
import styles from "./CanvasView.module.css";

type DraftStatus =
  | "Connecting"
  | "Saving"
  | "Saved"
  | "Save failed"
  | "Offline"
  | "Saved on device"
  | "Read only"
  | "Access denied";

const editAccess = (readOnly: boolean) => [
  EditorState.readOnly.of(readOnly),
  EditorView.editable.of(!readOnly),
  EditorView.contentAttributes.of(readOnly ? { tabindex: "0" } : {}),
  keymap.of(readOnly ? [] : yUndoManagerKeymap),
  placeholder(
    readOnly ? "This canvas is empty." : "Start writing in Markdown…",
  ),
];

export function CanvasView({ canvasId }: { canvasId: string }) {
  const { user, session, offlineSessionKey } = useAuth();
  const accountId = user?.id ?? "";
  const sessionId = session?.id ?? "";
  const expiresAt = session?.expiresAt
    ? new Date(session.expiresAt).getTime()
    : 0;
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["canvas", accountId, sessionId, canvasId],
    queryFn: async ({ signal }) => {
      const key = offlineSessionKey;
      try {
        const canvas = await canvasApi.read(
          canvasId,
          AbortSignal.any([signal, AbortSignal.timeout(3_500)]),
        );
        if (canvas.type !== "markdown" || canvas.access !== "editor") {
          await forgetOfflineDraft(accountId, canvasId).catch(() => {});
          return { canvas };
        }

        const local =
          key && expiresAt > Date.now()
            ? await rememberOfflineDraft(
                key,
                { id: sessionId, userId: accountId, expiresAt },
                canvas,
              ).catch(() => undefined)
            : undefined;
        return { canvas, local };
      } catch (error) {
        if (signal.aborted) throw error;
        if (error instanceof ApiClientError && error.status < 500) {
          if ([401, 403, 404].includes(error.status)) {
            await forgetOfflineDraft(accountId, canvasId).catch(() => {});
          }
          throw error;
        }
        const local = key
          ? await readOfflineDraft(key, accountId, canvasId).catch(
              () => undefined,
            )
          : undefined;
        if (!local?.state) throw error;
        return {
          canvas: {
            ...local.canvas,
            type: "markdown" as const,
            access: "editor" as const,
          },
          local,
        };
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
    retry: false,
  });

  return (
    <main className={`grid-paper ${styles.canvas}`}>
      {isPending ? (
        <p role="status" className={styles.notice}>
          Opening canvas…
        </p>
      ) : isError ? (
        <p role="alert" className={styles.notice}>
          Could not open this canvas.{" "}
          <button type="button" onClick={() => void refetch()}>
            Retry
          </button>
          {" · "}
          <Link href="/workspace">Workspaces</Link>
        </p>
      ) : data.canvas.type !== "markdown" ? (
        <p className={styles.notice}>
          This canvas format does not have an editor yet.{" "}
          <Link href={projectHref(data.canvas)}>Back to project</Link>
        </p>
      ) : (
        <MarkdownEditor
          key={`${accountId}/${sessionId}/${data.canvas.id}`}
          canvas={data.canvas}
          accountId={accountId}
          offlineSessionKey={data.local ? offlineSessionKey : undefined}
          cachedState={data.local?.state}
          cachedPending={data.local?.pending}
        />
      )}
    </main>
  );
}

const projectHref = ({ workspaceId, projectId }: OfflineCanvas) =>
  `/workspace/${workspaceId}/project/${projectId}`;

function MarkdownEditor({
  canvas,
  accountId,
  offlineSessionKey,
  cachedState,
  cachedPending,
}: {
  canvas: OfflineCanvas;
  accountId: string;
  offlineSessionKey?: string;
  cachedState?: Uint8Array;
  cachedPending?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mount = useRef<HTMLDivElement>(null);
  const hasUnprotectedEdits = useRef(false);
  const [discardCachedState, setDiscardCachedState] = useState(false);
  const retrySave = useRef<() => void>(() => {});
  const [status, setStatus] = useState<DraftStatus>("Connecting");
  const { id, projectId } = canvas;
  const [people, setPeople] = useState<CanvasParticipant[]>([]);
  const [selfId, setSelfId] = useState<string>();

  useEffect(() => {
    if (!mount.current) return;

    const document = new Y.Doc();
    const recoveredState = discardCachedState ? undefined : cachedState;
    if (recoveredState) Y.applyUpdate(document, recoveredState);
    const text = document.getText(canvasCollaboration.text);
    const undoManager = new Y.UndoManager(text);
    const access = new Compartment();
    let view: EditorView | undefined;
    let saved: Y.Snapshot | undefined;
    let readOnly = !recoveredState;
    let hasPendingEdits = Boolean(recoveredState && cachedPending);
    let savedOnDevice = Boolean(recoveredState);
    let cacheEnabled = Boolean(offlineSessionKey) && !discardCachedState;
    let writeNumber = 0;
    let connected = false;
    let synced = false;
    let denied = false;
    let saveFailed = false;
    let disposed = false;

    function refreshStatus() {
      if (disposed) return;
      const persisted = saved && Y.equalSnapshots(saved, Y.snapshot(document));
      if (persisted && hasPendingEdits) {
        hasPendingEdits = false;
        void queryClient.invalidateQueries({
          queryKey: ["canvases", projectId],
        });
      }
      hasUnprotectedEdits.current = hasPendingEdits && !savedOnDevice;
      setStatus(
        denied
          ? "Access denied"
          : !connected && view
            ? hasPendingEdits && savedOnDevice
              ? "Saved on device"
              : "Offline"
            : !synced
              ? "Connecting"
              : readOnly
                ? "Read only"
                : persisted
                  ? "Saved"
                  : saveFailed
                    ? "Save failed"
                    : "Saving",
      );
    }

    function cacheDraft() {
      if (!offlineSessionKey || !cacheEnabled || readOnly) return;
      const write = ++writeNumber;
      savedOnDevice = false;
      void writeOfflineDraft(
        offlineSessionKey,
        accountId,
        id,
        Y.encodeStateAsUpdate(document),
        hasPendingEdits,
      )
        .catch(() => false)
        .then((stored) => {
          if (disposed || write !== writeNumber) return;
          savedOnDevice = stored;
          refreshStatus();
        });
    }

    function clearDraft() {
      cacheEnabled = false;
      writeNumber++;
      hasPendingEdits = false;
      void forgetOfflineDraft(accountId, id).catch(() => {});
      view?.destroy();
      view = undefined;
    }

    function denyAccess() {
      denied = true;
      setPeople([]);
      clearDraft();
      refreshStatus();
    }

    function openEditor(provider: HocuspocusProvider) {
      const parent = mount.current;
      if (!parent || view || denied) return;
      view = new EditorView({
        parent,
        state: EditorState.create({
          doc: text.toString(),
          extensions: [
            EditorState.lineSeparator.of("\n"),
            markdown({ base: markdownLanguage, extensions: [GFM] }),
            keymap.of(defaultKeymap),
            EditorView.lineWrapping,
            access.of(editAccess(readOnly)),
            EditorView.contentAttributes.of({
              "aria-label": "Markdown document",
              "aria-multiline": "true",
            }),
            markdownPreview,
            yCollab(text, provider.awareness, { undoManager }),
          ],
        }),
      });
      if (!readOnly) view.focus();
    }

    const provider = new HocuspocusProvider({
      url: canvasSocketUrl(),
      name: id,
      document,
      onStatus({ status }) {
        connected = status === "connected";
        if (!connected) {
          synced = false;
          setPeople([]);
        }
        refreshStatus();
      },
      onAuthenticated({ scope }) {
        if (denied) return;
        readOnly = scope !== "read-write";
        if (readOnly && recoveredState) {
          denied = true;
          clearDraft();
          setDiscardCachedState(true);
          return;
        }
        if (readOnly) clearDraft();
        view?.dispatch({ effects: access.reconfigure(editAccess(readOnly)) });
        refreshStatus();
      },
      onAuthenticationFailed({ reason }) {
        if (reason === canvasCollaboration.accessDenied) denyAccess();
        else {
          connected = synced = false;
          refreshStatus();
        }
      },
      onClose({ event }) {
        if (event.reason === canvasCollaboration.accessDenied) {
          denyAccess();
        } else {
          connected = synced = false;
          setPeople([]);
          refreshStatus();
        }
      },
      onSynced({ state }) {
        synced = state;
        if (state) {
          openEditor(provider);
          cacheDraft();
        }
        refreshStatus();
      },
      onAwarenessChange({ states }) {
        if (disposed || !connected || denied) return;
        const participants = new Map<string, CanvasParticipant>();
        for (const state of states) {
          const parsed = canvasParticipantSchema.safeParse(state.user);
          if (parsed.success) participants.set(parsed.data.id, parsed.data);
        }
        const next = [...participants.values()];
        setPeople((previous) =>
          previous.length === next.length &&
          previous.every((person, index) => {
            const peer = next[index];
            return (
              person.id === peer.id &&
              person.name === peer.name &&
              person.access === peer.access &&
              person.color === peer.color
            );
          })
            ? previous
            : next,
        );
      },
      onStateless({ payload }) {
        if (payload.startsWith(canvasCollaboration.participant)) {
          const participant = canvasParticipantSchema.parse(
            JSON.parse(payload.slice(canvasCollaboration.participant.length)),
          );
          setSelfId(participant.id);
          provider.setAwarenessField("user", participant);
          return;
        }
        if (payload.startsWith(canvasCollaboration.saved)) {
          saved = Y.decodeSnapshot(
            Uint8Array.from(
              atob(payload.slice(canvasCollaboration.saved.length)),
              (character) => character.charCodeAt(0),
            ),
          );
          saveFailed = false;
          if (
            hasPendingEdits &&
            Y.equalSnapshots(saved, Y.snapshot(document))
          ) {
            refreshStatus();
            cacheDraft();
          }
        } else if (payload === canvasCollaboration.saveFailed) {
          saveFailed = true;
        }
        refreshStatus();
      },
    });

    document.on("update", (_update: Uint8Array, origin: unknown) => {
      if (origin !== provider) hasPendingEdits = true;
      cacheDraft();
      refreshStatus();
    });
    if (recoveredState) openEditor(provider);
    refreshStatus();
    retrySave.current = () => {
      saveFailed = false;
      provider.sendStateless(canvasCollaboration.retrySave);
      refreshStatus();
    };

    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnprotectedEdits.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      disposed = true;
      window.removeEventListener("beforeunload", beforeUnload);
      view?.destroy();
      provider.destroy();
      undoManager.destroy();
      document.destroy();
    };
  }, [
    accountId,
    cachedPending,
    cachedState,
    discardCachedState,
    id,
    offlineSessionKey,
    projectId,
    queryClient,
  ]);

  return (
    <>
      <header className={styles.toolbar}>
        <button
          type="button"
          className={styles.back}
          onClick={() => {
            if (
              !hasUnprotectedEdits.current ||
              window.confirm("This canvas has unsaved edits. Leave anyway?")
            ) {
              router.push(projectHref(canvas));
            }
          }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to project
        </button>
        <h1 className={styles.title}>
          <FileText size={17} aria-hidden="true" />
          <span>{canvas.name}</span>
        </h1>
        <div className={styles.activity}>
          {people.length > 0 && (
            <CanvasParticipants people={people} selfId={selfId} />
          )}
          <span className={styles.status} role="status">
            {status}
          </span>
        </div>
      </header>
      <div className={styles.desk}>
        {status === "Save failed" && (
          <div className={styles.saveError} role="alert">
            Your edits are still in the editor.
            <button type="button" onClick={() => retrySave.current()}>
              Retry save
            </button>
          </div>
        )}
        {status === "Access denied" && (
          <p className={styles.saveError} role="alert">
            You no longer have access to this collaboration session. Reload to
            check your permissions.
          </p>
        )}
        <RoughBox
          className={styles.notebook}
          fill="var(--canvas-paper)"
          step={20}
        >
          <div className={styles.sheet} ref={mount} />
        </RoughBox>
      </div>
    </>
  );
}

function CanvasParticipants({
  people,
  selfId,
}: {
  people: CanvasParticipant[];
  selfId?: string;
}) {
  const label = (person: CanvasParticipant) =>
    `${person.name}${person.id === selfId ? " (you)" : ""} · ${person.access === "editor" ? "Editing" : "Viewing"}`;

  const visible = people.slice(0, 4);
  const remaining = people.slice(4);
  return (
    <ul className={styles.participants} aria-label="People in this canvas">
      {visible.map((person) => (
        <li
          key={person.id}
          className={styles.avatar}
          title={label(person)}
          style={{ backgroundColor: person.color }}
        >
          <span aria-hidden="true">
            {person.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => Array.from(word)[0])
              .join("")
              .toUpperCase()}
          </span>
          <span className="sr-only">{label(person)}</span>
        </li>
      ))}
      {remaining.length > 0 && (
        <li
          className={`${styles.avatar} ${styles.overflowAvatar}`}
          title={remaining.map(label).join("\n")}
        >
          <span aria-hidden="true">+{remaining.length}</span>
          <span className="sr-only">{remaining.map(label).join(", ")}</span>
        </li>
      )}
    </ul>
  );
}
