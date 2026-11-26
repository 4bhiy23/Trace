export function getSessionCookie(cookies: {
  get(name: string): { value: string } | undefined;
}) {
  return (
    cookies.get("better-auth.session_token")?.value ||
    cookies.get("__Secure-better-auth.session_token")?.value
  );
}
