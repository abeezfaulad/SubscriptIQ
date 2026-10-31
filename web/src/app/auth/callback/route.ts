
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

  // Only allow redirects to paths within this application.
  let redirectTo = new URL("/dashboard", origin);

  if (
    requestedNext?.startsWith("/") &&
    !requestedNext.startsWith("//")
  ) {
    const candidate = new URL(requestedNext, origin);

    if (candidate.origin === origin) {
      redirectTo = candidate;
    }
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=auth", origin)
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=auth", origin)
    );
  }

  return NextResponse.redirect(redirectTo);
}
