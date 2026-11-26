import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "@/modules/auth/session-cookie";

export function proxy(request: NextRequest) {
  const sessionToken = getSessionCookie(request.cookies);

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/canvas/");

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // Root redirect
  if (pathname === "/") {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/workspace", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protected routes require authentication
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in users visiting login/signup redirect to workspace
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/workspace/:path*",
    "/dashboard/:path*",
    "/canvas/:path*",
    "/login",
    "/signup",
  ],
};
