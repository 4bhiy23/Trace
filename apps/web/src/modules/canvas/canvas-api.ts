import {
  apiRoutes,
  type CanvasCreateInput,
  type CanvasDetail,
  type CanvasRenameInput,
  type CanvasSummary,
} from "@trace/shared";
import { apiClient } from "@/lib/api-client";

export const canvasHref = (id: string) => `/canvas/${id}`;

export const canvasApi = {
  list: (projectId: string) =>
    apiClient<CanvasSummary[]>(apiRoutes.canvases(projectId), {
      cache: "no-store",
    }),
  create: (projectId: string, input: CanvasCreateInput) =>
    apiClient<CanvasDetail>(apiRoutes.canvases(projectId), {
      method: "POST",
      body: JSON.stringify(input),
    }),
  read: (id: string, signal: AbortSignal) =>
    apiClient<CanvasDetail>(apiRoutes.canvas(id), {
      signal,
      cache: "no-store",
    }),
  remove: (id: string) =>
    apiClient<void>(apiRoutes.canvas(id), { method: "DELETE" }),
  rename: (id: string, input: CanvasRenameInput) =>
    apiClient<CanvasSummary>(apiRoutes.canvasName(id), {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};

export function canvasSocketUrl() {
  const base =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";
  const url = new URL(apiRoutes.canvasCollaboration, base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
}
