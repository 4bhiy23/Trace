"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Crown, UserMinus, Users, X } from "lucide-react";
import {
  useRemoveMember,
  useTransferWorkspace,
  useUpdateMemberRole,
} from "@/features/workspaces/queries/workspace.mutations";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import type { InviteRole, WorkspaceRole } from "@/features/workspaces/types/workspace.types";
import { RoughBox } from "./RoughBox";

const roleLabel = (role: "owner" | "admin" | "member") =>
  role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Member";

export function CollaboratorsDirectory({
  workspaceId,
  workspaceName,
  workspaceRole,
  isDefaultWorkspace = false,
}: {
  workspaceId: string;
  workspaceName?: string;
  workspaceRole?: WorkspaceRole;
  isDefaultWorkspace?: boolean;
}) {
  const [pendingRole, setPendingRole] = useState<{
    userId: string;
    role: InviteRole;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<
    { userId: string; name: string } | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const {
    data: members = [],
    isPending,
    isError,
  } = useQuery(workspaceQueries.members(workspaceId));
  const updateMemberRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);
  const transferWorkspace = useTransferWorkspace(workspaceId);

  const changeRole = async (userId: string, role: InviteRole) => {
    setError(null);
    setPendingRole({ userId, role });
    try {
      await updateMemberRole.mutateAsync({ userId, role });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    } finally {
      setPendingRole(null);
    }
  };

  const confirmAction = async () => {
    if (!action) return;
    setActionError(null);
    try {
      await removeMember.mutateAsync(action.userId);
      setAction(null);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Could not update workspace access.",
      );
    }
  };

  const actionPending = removeMember.isPending;

  const confirmTransfer = async () => {
    if (!transferTarget) return;
    setTransferError(null);
    try {
      await transferWorkspace.mutateAsync({ userId: transferTarget.userId });
      setTransferTarget(null);
    } catch (err: unknown) {
      setTransferError(
        err instanceof Error ? err.message : "Could not transfer ownership.",
      );
    }
  };

  return (
    <>
      <div className="relative pt-2 pb-1">
        <RoughBox
          seed={19}
          fill="#ffffff"
          amp={1.25}
          rings="none"
          tape="none"
          shadow={false}
          className="w-full"
        >
          <div className="mr-4 flex items-center gap-4 px-6 py-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[4px] border-2 border-black bg-[#E9FFA3] text-black">
              <Users className="h-7 w-7 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-brand-sans text-2xl font-bold tracking-tight text-black sm:text-3xl">
                Collaborators
              </h1>
              <p className="mt-0.5 font-brand-sans text-xs text-[#636363] sm:text-sm">
                Everyone with access to {workspaceName || "this workspace"}
              </p>
            </div>
          </div>
        </RoughBox>
      </div>

      <div className="py-2">
        <div className="section-head flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="rounded-[2px] border border-black bg-[#E9FFA3] px-1.5 py-0.5 font-mono text-xs font-bold text-black">
              {String(members.length).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.5px] text-black dark:text-white">
              Workspace members
            </span>
          </div>
          <div className="flex-1 border-t-[1.5px] border-dashed border-[#DAD1C5] dark:border-white/20" />
        </div>
      </div>

      <RoughBox
        seed={23}
        fill="#ffffff"
        amp={1.25}
        rings="full"
        tape="tr"
        className="w-full"
      >
        <div className="my-8 mr-3 ml-12 overflow-hidden border border-black/20 sm:ml-14 sm:mr-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-3 bg-[#ECE7E0] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.5px] text-black">
            <span>Collaborator</span>
            <span>Role</span>
            <span className="sr-only">Actions</span>
          </div>

          {error && (
            <p className="border-t border-[#DAD1C5] px-4 py-3 font-mono text-xs text-[#A11B1B]">
              {error}
            </p>
          )}

          {isPending ? (
            <p className="px-4 py-12 text-center font-mono text-xs text-[#636363]">
              Loading collaborators…
            </p>
          ) : isError ? (
            <p className="px-4 py-12 text-center font-mono text-xs text-[#636363]">
              Could not load collaborators.
            </p>
          ) : members.length === 0 ? (
            <p className="px-4 py-12 text-center font-mono text-xs text-[#636363]">
              No collaborators yet.
            </p>
          ) : (
            members.map((member) => (
              <div
                key={member.userId}
                className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-[#DAD1C5] px-4 py-3 transition-colors hover:bg-black/[0.02]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-black font-mono text-xs font-bold text-[#E9FFA3]">
                    {(member.name || member.email)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-brand-sans text-sm font-bold text-black">
                      {member.name}
                    </p>
                    <p className="truncate font-brand-sans text-xs text-[#636363]">
                      {member.email}
                    </p>
                  </div>
                </div>
                {workspaceRole === "owner" && member.role !== "owner" ? (
                  <select
                    aria-label={`Change ${member.name}'s role`}
                    value={
                      pendingRole?.userId === member.userId
                        ? pendingRole.role
                        : member.role
                    }
                    onChange={(event) =>
                      void changeRole(
                        member.userId,
                        event.target.value as InviteRole,
                      )
                    }
                    disabled={updateMemberRole.isPending}
                    className="cursor-pointer rounded-[2px] border border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-black disabled:cursor-wait disabled:opacity-60"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span
                    className={
                      member.role === "owner"
                        ? "rounded-[2px] border border-black bg-[#E9FFA3] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-black"
                        : "rounded-[2px] border border-black/40 bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-black"
                    }
                  >
                    {roleLabel(member.role)}
                  </span>
                )}
                {workspaceRole === "owner" && member.role !== "owner" ? (
                  <div className="flex items-center gap-1.5">
                    {!isDefaultWorkspace && (
                      <button
                        type="button"
                        onClick={() => {
                          setTransferTarget({
                            userId: member.userId,
                            name: member.name || member.email,
                          });
                          setTransferError(null);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-black bg-white text-black shadow-[1px_1px_0px_#000] transition-colors hover:bg-[#E9FFA3]"
                        aria-label={`Transfer ownership to ${member.name}`}
                        title="Transfer ownership"
                      >
                        <Crown className="h-3.5 w-3.5 stroke-[2.2]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setAction({
                          userId: member.userId,
                          name: member.name || member.email,
                        });
                        setActionError(null);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-[2px] border border-black bg-white text-black shadow-[1px_1px_0px_#000] transition-colors hover:bg-[#FFEEEE] hover:text-[#A11B1B]"
                      aria-label={`Remove ${member.name} from workspace`}
                      title="Remove collaborator"
                    >
                      <UserMinus className="h-3.5 w-3.5 stroke-[2.2]" />
                    </button>
                  </div>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
            ))
          )}
        </div>
      </RoughBox>

      {action && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !actionPending && setAction(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-access-action-title"
            className="relative w-full max-w-md border-2 border-black bg-[#FAF5EC] p-6 pt-10 text-black shadow-[5px_6px_0px_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAction(null)}
              disabled={actionPending}
              aria-label="Close dialog"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border-2 border-black bg-white disabled:opacity-50"
            >
              <X className="h-4 w-4 stroke-[2.4]" />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#FFEEEE] text-[#A11B1B]">
                <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#A11B1B]">
                  Confirm access change
                </p>
                <h2
                  id="workspace-access-action-title"
                  className="mt-1 font-brand-sans text-xl font-bold"
                >
                  {`Remove ${action.name}?`}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#524F46]">
              {`${action.name} will lose workspace access and any project-editor grants.`}
            </p>
            {actionError && (
              <p className="mt-4 border-2 border-[#A11B1B] bg-[#FFEEEE] p-2 font-mono text-xs text-[#A11B1B]">
                {actionError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3 border-t border-black/20 pt-4">
              <button
                type="button"
                onClick={() => setAction(null)}
                disabled={actionPending}
                className="border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmAction()}
                disabled={actionPending}
                className="flex items-center gap-2 border-2 border-black bg-[#A11B1B] px-3 py-2 font-mono text-xs font-bold uppercase text-white shadow-[2px_2px_0px_#000] disabled:opacity-50"
              >
                <UserMinus className="h-4 w-4" />
                {actionPending
                  ? "Updating…"
                  : "Remove collaborator"}
              </button>
            </div>
          </div>
        </div>
      )}
      {transferTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() =>
            !transferWorkspace.isPending && setTransferTarget(null)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="workspace-transfer-title"
            className="relative w-full max-w-md border-2 border-black bg-[#FAF5EC] p-6 pt-10 text-black shadow-[5px_6px_0px_#000]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setTransferTarget(null)}
              disabled={transferWorkspace.isPending}
              aria-label="Close dialog"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center border-2 border-black bg-white disabled:opacity-50"
            >
              <X className="h-4 w-4 stroke-[2.4]" />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-[#E9FFA3] text-black">
                <Crown className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#3A5610]">
                  Ownership change
                </p>
                <h2
                  id="workspace-transfer-title"
                  className="mt-1 font-brand-sans text-xl font-bold"
                >
                  {`Make ${transferTarget.name} the owner?`}
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#524F46]">
              {`${transferTarget.name} will become the workspace owner. You will become an admin and can leave the workspace afterward.`}
            </p>
            {transferError && (
              <p className="mt-4 border-2 border-[#A11B1B] bg-[#FFEEEE] p-2 font-mono text-xs text-[#A11B1B]">
                {transferError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3 border-t border-black/20 pt-4">
              <button
                type="button"
                onClick={() => setTransferTarget(null)}
                disabled={transferWorkspace.isPending}
                className="border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold uppercase disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmTransfer()}
                disabled={transferWorkspace.isPending}
                className="flex items-center gap-2 border-2 border-black bg-[#E9FFA3] px-3 py-2 font-mono text-xs font-bold uppercase text-black shadow-[2px_2px_0px_#000] disabled:opacity-50"
              >
                <Crown className="h-4 w-4" />
                {transferWorkspace.isPending
                  ? "Transferring…"
                  : "Transfer ownership"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
