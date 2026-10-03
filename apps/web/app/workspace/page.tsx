import type { Metadata } from "next";
import { WorkspaceView } from "@/src/modules/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "User’s TEAM Workspaces - Trace",
  description:
    "Collaborative workspace for technical documentation and engineering diagrams.",
};

export default function WorkspacePage() {
  return <WorkspaceView />;
}
