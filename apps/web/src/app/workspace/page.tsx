import type { Metadata } from "next";
import { AuthGuard } from "@/modules/auth/AuthGuard";
import { WorkspaceView } from "@/modules/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "User’s TEAM Workspaces - Trace",
  description:
    "Collaborative workspace for technical documentation and engineering diagrams.",
};

export default function WorkspacePage() {
  return (
    <AuthGuard>
      <WorkspaceView />
    </AuthGuard>
  );
}
