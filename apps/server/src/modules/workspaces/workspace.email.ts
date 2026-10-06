import { env } from "../../config/env";
import { HttpError } from "../../shared/http/errors";

/**
 * Sends an invitation email through Resend with the token encoded in the acceptance URL.
 * Throws 503 when email delivery is unconfigured and 502 when Resend rejects the request.
 */
export async function sendWorkspaceInvite(
  email: string,
  workspaceName: string,
  token: string,
) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    throw new HttpError(
      503,
      "EMAIL_DELIVERY_FAILED",
      "Workspace invitation email is not configured",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [email],
      subject: `Join ${workspaceName} on Trace`,
      text: `You were invited to ${workspaceName} on Trace. Accept the invitation: ${env.WEB_URL}/join/workspace?token=${encodeURIComponent(token)}`,
    }),
  });

  if (!response.ok) {
    throw new HttpError(
      502,
      "EMAIL_DELIVERY_FAILED",
      "Invitation created, but the email could not be sent",
    );
  }
}
