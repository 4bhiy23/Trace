import type { Metadata } from "next";
import { AuthPageLayout } from "@/modules/auth/AuthPageLayout";

export const metadata: Metadata = {
  title: "Sign Up - Trace",
  description:
    "Create your free Trace account and start sketching and collaborating.",
};

export default function SignupPage() {
  return <AuthPageLayout initialMode="sign-up" />;
}
