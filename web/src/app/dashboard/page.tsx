import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SubscriptIQ</h1>

        <form action={logout}>
          <button className="rounded-lg border border-slate-700 px-4 py-2">
            Logout
          </button>
        </form>
      </header>

      <section className="mt-16">
        <p className="text-slate-400">Your workspace</p>
        <h2 className="mt-2 text-4xl font-bold">Welcome to SubscriptIQ</h2>
        <p className="mt-4 text-slate-400">
          Your subscription management dashboard is ready.
        </p>
      </section>
    </main>
  );
}
