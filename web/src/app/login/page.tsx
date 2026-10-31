
import { login, signup } from "./actions";

export default function LoginPage(_props: PageProps<"/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl">

        <h1 className="text-3xl font-bold tracking-tight">
          SubscriptIQ
        </h1>

        <p className="mt-2 text-slate-400">
          Bring all your subscriptions into one place.
        </p>

        <form className="mt-8 space-y-4">
          <input
            name="fullName"
            type="text"
            placeholder="Full name (for new accounts)"
            autoComplete="name"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            formAction={login}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold hover:bg-blue-500"
          >
            Log in
          </button>

          <button
            type="submit"
            formAction={signup}
            className="w-full rounded-lg border border-slate-700 p-3 font-semibold hover:bg-slate-800"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Intelligent subscription management.
        </p>

      </div>
    </main>
  );
}

