import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinWorkspaceView } from "@/modules/workspace/JoinWorkspaceView";

export const metadata: Metadata = {
  title: "Join Workspace - Trace",
  description: "Accept your invitation to collaborate on Trace.",
};

export default function JoinWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center grid-paper">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinWorkspaceView />
    </Suspense>
  );
}
