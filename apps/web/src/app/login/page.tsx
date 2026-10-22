import type { Metadata } from "next";
import { AuthPageLayout } from "@/modules/auth/AuthPageLayout";

export const metadata: Metadata = {
  title: "Sign In - Trace",
  description: "Sign in to your Trace account to access your canvases.",
};

export default function LoginPage() {
  return <AuthPageLayout initialMode="sign-in" />;
}
