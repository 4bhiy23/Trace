import type { Metadata } from "next";
import { WorkspaceView } from "@/modules/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "Dashboard - Trace",
  description:
    "Collaborative workspace for technical documentation and engineering diagrams.",
};

export default function DashboardPage() {
  return <WorkspaceView />;
}
