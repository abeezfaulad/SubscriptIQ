
import Link from "next/link";
import {
  login,
  signup,
} from "./actions";

export const instant = false;

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "invalid-credentials": "Incorrect email or password.",
  "email-not-confirmed": "Please confirm your email before signing in.",
  "google": "Google sign-in failed. Please try again.",
  "confirmation": "Your confirmation link is invalid or expired. Please request another one.",
  "missing-email": "Please enter your email address.",
  "send-failed": "We couldn't send the password reset email.",
  "configuration": "Authentication configuration error.",
};

const successMessages: Record<string, string> = {
  "signup": "Account created! Check your email to confirm your account.",
  "password-updated": "Password updated successfully. Please sign in.",
};

export default async function LoginPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const errorMessage = params.error
    ? errorMessages[params.error] ?? "Something went wrong. Please try again."
    : null;

  const successMessage = params.success
    ? successMessages[params.success] ?? null
    : null;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <div className="auth-logo">S</div>
          <h1>SubscriptIQ</h1>
          <p>Take control of your subscriptions.</p>
        </header>

        <div className="auth-content">
          <h2>Welcome back</h2>
          <p>Sign in or create your account.</p>

          {errorMessage && (
            <div className="auth-message error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-message success" role="status">
              {successMessage}
            </div>
          )}

          {/* Email and password authentication */}
          <form className="auth-form">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <div className="password-heading">
              <label htmlFor="password">Password</label>
              <Link href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button
              type="submit"
              formAction={login}
              className="auth-button primary"
            >
              Sign In
            </button>

            <button
              type="submit"
              formAction={signup}
              className="auth-button secondary"
            >
              Create Account
            </button>
          </form>

          

          {/* Google authentication */}
          
        </div>

        <footer className="auth-footer">
          <p>
            By continuing, you agree to use SubscriptIQ responsibly.
          </p>
        </footer>
      </section>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: #080b14;
          color: #f8fafc;
        }

        .auth-card {
          width: 100%;
          max-width: 430px;
          padding: 36px;
          border: 1px solid #252b3a;
          border-radius: 18px;
          background: #101522;
          box-shadow: 0 20px 70px rgba(0,0,0,.35);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          border-radius: 14px;
          background: #7656f6;
          font-size: 24px;
          font-weight: 800;
        }

        .auth-header h1 {
          margin: 0;
          font-size: 25px;
        }

        .auth-header p,
        .auth-content > p {
          color: #94a3b8;
          font-size: 14px;
        }

        .auth-content h2 {
          margin-bottom: 4px;
          font-size: 22px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }

        .auth-form label {
          font-size: 13px;
          font-weight: 600;
        }

        .auth-form input {
          width: 100%;
          box-sizing: border-box;
          padding: 13px 14px;
          border: 1px solid #30394b;
          border-radius: 9px;
          outline: none;
          background: #0b1020;
          color: white;
          font-size: 14px;
        }

        .auth-form input:focus {
          border-color: #8b70ff;
        }

        .password-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .password-heading a {
          color: #a994ff;
          font-size: 12px;
          text-decoration: none;
        }

        .password-heading a:hover {
          text-decoration: underline;
        }

        .auth-button {
          width: 100%;
          padding: 13px;
          border: 0;
          border-radius: 9px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
        }

        .primary {
          margin-top: 10px;
          background: #7656f6;
          color: white;
        }

        .secondary {
          border: 1px solid #343d50;
          background: transparent;
          color: white;
        }

        .auth-button:hover {
          opacity: .88;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: #64748b;
          font-size: 11px;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #30394b;
        }

        .auth-message {
          padding: 12px;
          margin-top: 16px;
          border-radius: 8px;
          font-size: 13px;
        }

        .error {
          background: #3b1720;
          color: #fda4af;
        }

        .success {
          background: #123323;
          color: #86efac;
        }

        .auth-footer {
          margin-top: 28px;
          text-align: center;
          color: #64748b;
          font-size: 11px;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}

