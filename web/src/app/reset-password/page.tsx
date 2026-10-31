import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { updatePassword } from "../login/actions";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/forgot-password?error=invalid-link");
  }

  const params = await searchParams;

  let message = "";

  switch (params.error) {
    case "weak-password":
      message = "Password must contain at least 8 characters.";
      break;
    case "password-mismatch":
      message = "The passwords do not match.";
      break;
    case "update-failed":
      message = "Password update failed. Please try again.";
      break;
  }

  return (
    <main style={{ maxWidth: 420, margin: "80px auto", padding: 24 }}>
      <h1>Create a new password</h1>

      <p>Choose a new password for your SubscriptIQ account.</p>

      {message && <p aria-live="polite">{message}</p>}

      <form action={updatePassword}>
        <label htmlFor="password">New password</label>

        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />

        <label htmlFor="confirmPassword">Confirm new password</label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />

        <button type="submit">Update Password</button>
      </form>
    </main>
  );
}
