import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const requestedNext = searchParams.get("next") ?? "/dashboard";

  // Only allow safe internal paths.
  const next =
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//") &&
    !requestedNext.includes("\\")
      ? requestedNext
      : "/dashboard";

  const errorPath =
    type === "recovery"
      ? "/forgot-password?error=invalid-link"
      : "/login?error=confirmation";

  if (
    !tokenHash ||
    (type !== "email" && type !== "recovery")
  ) {
    return NextResponse.redirect(new URL(errorPath, request.url));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(new URL(errorPath, request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
