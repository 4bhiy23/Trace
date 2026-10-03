import { useState } from "react";
import type { FormEvent } from "react";
import { authClient } from "./auth-client";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });

      setMessage(error?.message ?? "Account created. You are signed in.");
    } catch {
      setMessage("Could not connect to the API. Is the server running?");
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
      <h2>Create your account</h2>
      <label>
        Email
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        Password
        <input
          autoComplete="new-password"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account…" : "Sign up"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
