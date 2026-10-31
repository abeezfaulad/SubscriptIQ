
"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

function getField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function login(formData: FormData) {
  const email = getField(formData, "email").toLowerCase();
  const password = formData.get("password");

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    !password
  ) {
    redirect("/login?error=invalid-input");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid-credentials");
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = getField(formData, "email").toLowerCase();
  const password = formData.get("password");
  const fullName = getField(formData, "fullName");

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 6 ||
    fullName.length > 100
  ) {
    redirect("/login?error=invalid-input");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    redirect("/login?error=configuration");
  }

  let emailRedirectTo: string;

  try {
    const parsedUrl = new URL(siteUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      redirect("/login?error=configuration");
    }

    emailRedirectTo = new URL(
      "/auth/callback",
      parsedUrl.origin
    ).toString();
  } catch {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    redirect("/login?error=signup-failed");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/login?error=logout");
  }

  redirect("/login?message=logged-out");
}
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/forgot-password?error=missing-email");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    redirect("/forgot-password?error=configuration");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl.replace(/\/$/, "")}/auth/confirm?next=/reset-password`,
  });

  if (error) {
    redirect("/forgot-password?error=send-failed");
  }

  redirect("/forgot-password?sent=1");
}

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

  await supabase.auth.signOut();

  redirect("/login?success=password-updated");
}
emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/dashboard`,
