import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getSessionCookie } from "@/modules/auth/session-cookie";
import { AuthGuard } from "@/modules/auth/AuthGuard";
import { CanvasView } from "@/modules/canvas/CanvasView";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ canvasId: string }>;
}) {
  const { canvasId } = await params;
  const token = getSessionCookie(await cookies());
  const offlineSessionKey = token
    ? createHash("sha256").update(token).digest("hex")
    : undefined;
  return (
    <AuthGuard offlineSessionKey={offlineSessionKey}>
      <CanvasView key={canvasId} canvasId={canvasId} />
    </AuthGuard>
  );
}
