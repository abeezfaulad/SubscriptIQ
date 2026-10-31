
import { login, signup } from "./actions";
export const instant = false;
const errorMessages: Record<string, string> = {
  "invalid-input": "Please check your email, password and name.",
  "invalid-credentials": "Incorrect email or password. Please try again.",
  "signup-failed": "Account creation failed. Please try again.",
  configuration: "Authentication configuration is incomplete.",
  auth: "Your confirmation link is invalid or has expired.",
  logout: "We could not complete logout. Please try again.",
};

const successMessages: Record<string, string> = {
  "check-email": "Account request received. Check your email to confirm your account.",
  "logged-out": "You have successfully logged out.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;

  const error =
    typeof params.error === "string" ? params.error : "";

  const message =
    typeof params.message === "string" ? params.message : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl">

        <h1 className="text-3xl font-bold tracking-tight">
          SubscriptIQ
        </h1>

        <p className="mt-2 text-slate-400">
          Bring all your subscriptions into one place.
        </p>

        {errorMessages[error] && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-300"
          >
            {errorMessages[error]}
          </p>
        )}

        {successMessages[message] && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-green-800 bg-green-950/50 p-3 text-sm text-green-300"
          >
            {successMessages[message]}
          </p>
        )}

        <form className="mt-8 space-y-4">

          <input
            name="fullName"
            type="text"
            placeholder="Full name (for new accounts)"
            autoComplete="name"
            maxLength={100}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <input
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            maxLength={254}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-blue-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
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

