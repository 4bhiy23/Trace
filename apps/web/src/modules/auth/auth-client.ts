import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000",
});

export const { useSession, signIn, signOut, signUp } = authClient;

export async function signOutWithOfflineCleanup(userId: string | undefined) {
  try {
    await authClient.signOut();
  } finally {
    if (userId) {
      const { clearOfflineAccount } = await import("../canvas/offline-drafts");
      await clearOfflineAccount(userId).catch(() => {});
    }
  }
}
