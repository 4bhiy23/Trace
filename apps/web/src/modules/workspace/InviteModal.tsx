"use client";

import { useRef, useState, type FormEvent } from "react";
import { Search, Shield, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inviteRoleSchema, type InviteRole } from "@trace/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { workspaceQueries } from "@/features/workspaces/queries/workspace.options";
import {
  useInviteMember,
  useUpdateMemberRole,
} from "@/features/workspaces/queries/workspace.mutations";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string;
  workspaceName?: string;
  currentUserId?: string;
  canChangeMemberRoles?: boolean;
  canInviteMembers?: boolean;
}

const roleDescription = {
  admin: "Can manage members and edit every project in this workspace.",
  member:
    "Can view every project and edit projects where they have editor access.",
};

export function InviteModal({
  isOpen,
  onClose,
  workspaceId = "",
  workspaceName,
  currentUserId,
  canChangeMemberRoles = false,
  canInviteMembers = canChangeMemberRoles,
}: InviteModalProps) {
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");
  const [roleChange, setRoleChange] = useState<{
    userId: string;
    role: InviteRole;
  } | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const roleButton = useRef<HTMLButtonElement>(null);

  const membersQuery = useQuery({
    ...workspaceQueries.members(workspaceId),
    enabled: isOpen && Boolean(workspaceId),
  });
  const inviteMutation = useInviteMember(workspaceId);
  const roleMutation = useUpdateMemberRole(workspaceId);

  const members = membersQuery.data ?? [];
  const term = search.trim().toLowerCase();
  const visibleMembers = members.filter((member) =>
    [member.name, member.email, member.role].some((value) =>
      value.toLowerCase().includes(term),
    ),
  );
  const selectedInviteRole = canChangeMemberRoles ? inviteRole : "member";

  function handleClose() {
    setSearch("");
    setEmail("");
    setInviteRole("member");
    setRoleChange(null);
    inviteMutation.reset();
    roleMutation.reset();
    onClose();
  }

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (
      !canInviteMembers ||
      !workspaceId ||
      !address ||
      inviteMutation.isPending
    )
      return;

    inviteMutation.mutate(
      { email: address, role: selectedInviteRole },
      { onSuccess: () => setEmail("") },
    );
  }

  function closeRoleChange() {
    (roleButton.current ?? title.current)?.focus();
    setRoleChange(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        initialFocus={title}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-lg border-2 border-[#24211c] bg-[#faf5ec] p-0 text-[#24211c] shadow-xl sm:max-w-xl dark:border-[#686359] dark:bg-[#23221f] dark:text-[#faf5ec]"
      >
        <header className="border-b border-black/15 bg-[#f1e8d8] px-4 py-4 pr-12 sm:px-6 sm:pr-12 dark:border-white/15 dark:bg-[#2e2b25]">
          <DialogTitle
            ref={title}
            tabIndex={-1}
            className="font-brand-sans text-xl font-bold leading-tight outline-none"
          >
            Workspace people
          </DialogTitle>
          <DialogDescription className="mt-1 wrap-anywhere text-sm text-[#595146] dark:text-[#d0c4b1]">
            {workspaceName || "Workspace"}
          </DialogDescription>
        </header>

        <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <section aria-labelledby="workspace-members-heading">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 id="workspace-members-heading" className="font-semibold">
                Members{" "}
                {membersQuery.data && (
                  <span className="ml-1 text-xs tabular-nums opacity-70">
                    ({members.length})
                  </span>
                )}
              </h3>
              {!canChangeMemberRoles && (
                <p className="text-xs text-[#595146] dark:text-[#d0c4b1]">
                  The workspace owner can change roles.
                </p>
              )}
            </div>

            {membersQuery.isPending ? (
              <p role="status" className="py-4">
                Loading members…
              </p>
            ) : membersQuery.isError && !membersQuery.data ? (
              <div className="flex flex-wrap items-center gap-3 py-2">
                <p role="alert">Could not load workspace members.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void membersQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : members.length === 0 ? (
              <p className="py-4">There are no members to show.</p>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-70"
                  />
                  <Input
                    type="search"
                    aria-label="Search members"
                    placeholder="Search by name, email, or role"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 rounded-md bg-white pl-9 dark:bg-black/20"
                  />
                </div>
                {visibleMembers.length === 0 ? (
                  <p role="status" className="py-4">
                    No members match your search.
                  </p>
                ) : (
                  <ul className="divide-y divide-black/10 rounded-md border border-black/15 bg-white/75 dark:divide-white/10 dark:border-white/15 dark:bg-black/15">
                    {visibleMembers.map((member) => {
                      const name = member.name || member.email;
                      const canEditRole =
                        canChangeMemberRoles && member.role !== "owner";
                      const isReviewing =
                        canEditRole && roleChange?.userId === member.userId;
                      return (
                        <li key={member.userId} className="px-3 py-3">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:flex">
                            <div
                              className={`flex min-w-0 flex-1 items-center gap-2.5 ${canEditRole ? "row-span-2" : ""}`}
                            >
                              <span
                                aria-hidden="true"
                                className="grid size-8 shrink-0 place-items-center rounded-full bg-[#27241f] text-xs font-bold text-[#e9ffa3]"
                              >
                                {name.slice(0, 2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="wrap-anywhere font-semibold">
                                  {name}{" "}
                                  {member.userId === currentUserId && (
                                    <span className="text-xs font-normal opacity-75">
                                      (you)
                                    </span>
                                  )}
                                </p>
                                {member.name && (
                                  <p className="wrap-anywhere text-xs text-[#595146] dark:text-[#d0c4b1]">
                                    {member.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="justify-self-end rounded border border-black/15 bg-[#f1e8d8] px-2 py-1 text-xs font-semibold capitalize text-[#24211c] dark:border-white/15 dark:bg-[#3a3429] dark:text-[#faf5ec]">
                              {member.role}
                            </span>
                            {canEditRole && (
                              <Button
                                ref={isReviewing ? roleButton : undefined}
                                type="button"
                                variant="ghost"
                                aria-label={`Change role for ${name}`}
                                aria-expanded={isReviewing}
                                aria-disabled={roleMutation.isPending}
                                onClick={() => {
                                  if (roleMutation.isPending) return;
                                  roleMutation.reset();
                                  setRoleChange(
                                    isReviewing
                                      ? null
                                      : {
                                          userId: member.userId,
                                          role:
                                            member.role === "admin"
                                              ? "member"
                                              : "admin",
                                        },
                                  );
                                }}
                                className="min-h-9 justify-self-end rounded-md px-2 aria-disabled:opacity-50"
                              >
                                Change role
                              </Button>
                            )}
                          </div>
                          {isReviewing && (
                            <div className="mt-3 rounded-md border border-black/15 bg-[#f7f0e3] p-3 dark:border-white/15 dark:bg-[#302b23]">
                              <p className="font-semibold">
                                {roleChange.role === "admin"
                                  ? "Make admin"
                                  : "Make member"}
                              </p>
                              <p className="mt-1 text-xs text-[#595146] dark:text-[#d0c4b1]">
                                {roleDescription[roleChange.role]}
                              </p>
                              {roleMutation.isError && (
                                <p
                                  role="alert"
                                  className="mt-2 text-sm text-red-800 dark:text-red-300"
                                >
                                  {roleMutation.error.message}
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={roleMutation.isPending}
                                  onClick={() => {
                                    roleMutation.reset();
                                    closeRoleChange();
                                  }}
                                  className="min-h-9 rounded-md"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  disabled={roleMutation.isPending}
                                  onClick={() =>
                                    roleMutation.mutate(roleChange, {
                                      onSuccess: closeRoleChange,
                                    })
                                  }
                                  className="min-h-9 rounded-md border-[#24211c] bg-[#e9ffa3] text-[#24211c] shadow-none hover:bg-[#ddf58f]"
                                >
                                  {roleMutation.isPending
                                    ? "Saving…"
                                    : "Save role"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {roleMutation.isSuccess && (
              <p role="status" className="mt-2 text-sm">
                {roleMutation.data.name || roleMutation.data.email} is now{" "}
                {roleMutation.data.role === "admin" ? "an admin" : "a member"}.
              </p>
            )}
          </section>

          {canInviteMembers && (
            <section
              aria-labelledby="invite-member-heading"
              className="border-t border-black/15 pt-4 dark:border-white/15"
            >
              <h3
                id="invite-member-heading"
                className="flex items-center gap-2 font-semibold"
              >
                <UserPlus aria-hidden="true" className="size-4" />
                Invite by email
              </h3>
              <form onSubmit={handleInvite} className="mt-3">
                <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                  <label className="grid min-w-0 gap-1 text-xs font-semibold">
                    Email address
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={inviteMutation.isPending}
                      required
                      className="h-10 rounded-md bg-white font-normal dark:bg-black/20"
                    />
                  </label>
                  {canChangeMemberRoles && (
                    <label className="grid gap-1 text-xs font-semibold">
                      Workspace role
                      <select
                        value={selectedInviteRole}
                        disabled={inviteMutation.isPending}
                        onChange={(event) =>
                          setInviteRole(
                            inviteRoleSchema.parse(event.target.value),
                          )
                        }
                        aria-describedby="invite-role-description"
                        className="h-10 rounded-md border border-input bg-white px-2 text-sm font-normal focus-visible:ring-2 focus-visible:ring-ring dark:bg-[#2e2b25]"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      inviteMutation.isPending || !email.trim() || !workspaceId
                    }
                    className="h-10 rounded-md border-[#24211c] bg-[#e9ffa3] text-[#24211c] shadow-none hover:bg-[#ddf58f]"
                  >
                    {inviteMutation.isPending ? "Sending…" : "Send invite"}
                  </Button>
                </div>
                <p
                  id="invite-role-description"
                  className="mt-2 flex items-start gap-1.5 text-xs text-[#595146] dark:text-[#d0c4b1]"
                >
                  <Shield aria-hidden="true" className="size-3.5 shrink-0" />
                  {selectedInviteRole === "admin" ? "Admin" : "Member"} ·{" "}
                  {roleDescription[selectedInviteRole]}
                </p>
                {inviteMutation.isError && (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-800 dark:text-red-300"
                  >
                    {inviteMutation.error.message}
                  </p>
                )}
                {inviteMutation.isSuccess && (
                  <p role="status" className="mt-2 text-sm">
                    Invitation sent to {inviteMutation.variables.email}.
                  </p>
                )}
              </form>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
