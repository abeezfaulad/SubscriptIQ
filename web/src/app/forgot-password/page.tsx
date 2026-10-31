import Link from "next/link";
import { requestPasswordReset } from "../login/actions";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    sent?: string;
    error?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1>Forgot your password?</h1>

      <p>Enter your email address and we'll send you a reset link.</p>

      {params.sent === "1" && (
        <p aria-live="polite">
          If an account exists for this email, password reset instructions
          have been sent.
        </p>
      )}

      {params.error && (
        <p aria-live="polite">
          {params.error === "invalid-link"
            ? "This reset link is invalid or expired. Request another one."
            : "We couldn't process your request. Please try again."}
        </p>
      )}

      <form action={requestPasswordReset}>
        <label htmlFor="email">Email address</label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />

        <button type="submit">Send Reset Link</button>
      </form>

      <p>
        <Link href="/login">Back to login</Link>
      </p>
    </main>
  );
}
