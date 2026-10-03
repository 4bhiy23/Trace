import { AuthStatus } from "./modules/auth/AuthStatus";
import { SignupForm } from "./modules/auth/SignupForm";

export function App() {
  return (
    <main
      style={{
        fontFamily: "system-ui",
        maxWidth: 720,
        margin: "15vh auto",
        padding: 24,
      }}
    >
      <p style={{ color: "#666", marginBottom: 8 }}>Trace</p>
      <h1>Build clearly.</h1>
      <p>Collaborative technical workspaces are coming soon.</p>
      <SignupForm />
      <AuthStatus />
    </main>
  );
}
