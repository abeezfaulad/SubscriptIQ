
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
