import { authClient } from "./auth-client";

export function AuthStatus() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <p>Checking session…</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <button onClick={() => authClient.signOut()} type="button">
      Sign out
    </button>
  );
}
