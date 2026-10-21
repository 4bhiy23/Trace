import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthGuard } from "@/modules/auth/AuthGuard";
import { WorkspaceView } from "@/modules/workspace/WorkspaceView";

export const metadata: Metadata = {
  title: "Workspace - Trace",
  description:
    "Collaborative workspace for technical documentation and engineering diagrams.",
};

export default function WorkspaceSlugPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center grid-paper">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <WorkspaceView />
      </Suspense>
    </AuthGuard>
  );
}
