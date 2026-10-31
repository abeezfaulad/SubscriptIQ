
"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

/**
 * Get the configured application URL.
 * Works with localhost during development and Vercel in production.
 */
function getSiteUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return null;
  }

  try {
    return new URL(configuredUrl).origin;
  } catch {
    return null;
  }
}

/**
 * EMAIL LOGIN
 */
export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=invalid-credentials");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const errorCode = error.code?.toLowerCase() ?? "";
    const errorMessage = error.message.toLowerCase();

    if (
      errorCode === "email_not_confirmed" ||
      errorMessage.includes("email not confirmed")
    ) {
      redirect("/login?error=email-not-confirmed");
    }

    redirect("/login?error=invalid-credentials");
  }

  redirect("/dashboard");
}

/**
 * EMAIL SIGNUP
 */
export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  // Full name is optional.
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password || password.length < 8) {
    redirect("/login?error=signup-failed");
  }

  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/dashboard`,
      data: fullName
        ? {
            full_name: fullName,
          }
        : {},
    },
  });

  if (error) {
    redirect("/login?error=signup-failed");
  }

  // If email confirmation is disabled, a session may be returned.
  if (data.session) {
    redirect("/dashboard");
  }

  // Otherwise, ask the user to confirm their email.
  redirect("/login?success=signup");
}

/**
 * GOOGLE SIGN-IN
 */
export async function signInWithGoogle() {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=google");
  }

  redirect(data.url);
}

/**
 * REQUEST PASSWORD RESET EMAIL
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email) {
    redirect("/forgot-password?error=missing-email");
  }

  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    redirect("/forgot-password?error=configuration");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    redirect("/forgot-password?error=send-failed");
  }

  redirect("/forgot-password?sent=1");
}

/**
 * UPDATE PASSWORD
 */
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  const confirmPassword = String(
    formData.get("confirmPassword") ?? ""
  );

  if (password.length < 8) {
    redirect("/reset-password?error=weak-password");
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=password-mismatch");
  }

  const supabase = await createClient();

  // Verify that the recovery session is valid.
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    redirect("/forgot-password?error=invalid-link");
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect("/reset-password?error=update-failed");
  }

  // Sign out so the user can log in with the new password.
  await supabase.auth.signOut();

  redirect("/login?success=password-updated");
}

/**
 * LOGOUT
 */
export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

