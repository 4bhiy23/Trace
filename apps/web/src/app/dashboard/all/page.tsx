import type { Metadata } from "next";
import { AuthGuard } from "@/modules/auth/AuthGuard";
import { WorkspaceView } from "@/modules/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "All Files - Trace Workspace",
  description:
    "Collaborative workspace for technical documentation and engineering diagrams.",
};

export default function DashboardAllPage() {
  return (
    <AuthGuard>
      <WorkspaceView />
    </AuthGuard>
  );
}
