"use client";

import { Button } from "@/components/auth/Button";
import { Input } from "@/components/auth/Input";
import { SegmentedToggle } from "@/components/auth/SegmentedToggle";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession()
      .then(async (session) => {
        if (!session) {
          setChecking(false);
          return;
        }
        const isAnonymous = session.user?.is_anonymous === true;
        if (isAnonymous) {
          await supabase.auth.signOut();
          setChecking(false);
          return;
        }
        router.replace("/");
      })
      .catch(() => setChecking(false));
  }, [router]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleModeChange = (v: "login" | "signup") => {
    setMode(v);
    clearMessages();
  };

  const handleForgot = () => {
    setMode("forgot");
    setPassword("");
    clearMessages();
  };

  const handleBackToLogin = () => {
    setMode("login");
    setPassword("");
    clearMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Enter your email address.");
        return;
      }
      setLoading(true);
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : "https://trakoo.vercel.app"}/reset-password`,
      });
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setSuccess("Check your email for a link to reset your password.");
      return;
    }

    if (mode === "login") {
      if (!email.trim() || !password) {
        setError("Enter your email and password.");
        return;
      }
      setLoading(true);
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      router.replace("/");
      return;
    }

    if (mode === "signup") {
      if (!email.trim() || !password) {
        setError("Enter your email and password.");
        return;
      }
      setLoading(true);
      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      if (data?.user && !data.user.identities?.length) {
        setError("An account with this email already exists. Try logging in.");
        return;
      }
      if (data?.session) {
        router.replace("/");
        return;
      }
      setSuccess("Check your email to confirm your account.");
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-dashboard-gradient">
        <p className="text-trakoo-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-dashboard-gradient px-4 py-8">
      <div className="soft-card w-full max-w-sm p-6">
        <h1 className="mb-6 text-center text-xl font-bold text-trakoo-text">Trakoo</h1>

        {mode === "forgot" ? (
          <>
            <h2 className="mb-4 text-center text-lg font-semibold text-trakoo-text">
              Reset password
            </h2>
            <p className="mb-4 text-center text-sm text-trakoo-muted">
              Enter your email and we&apos;ll send you a link to set a new password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error && !success ? error : undefined}
                disabled={loading}
              />
              {success && (
                <p className="text-sm text-green-700" role="status">
                  {success}
                </p>
              )}
              <Button type="submit" fullWidth loading={loading}>
                Send reset link
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-trakoo-mood-2 hover:underline"
                >
                  Back to log in
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <SegmentedToggle
                options={[
                  { value: "login", label: "Log in" },
                  { value: "signup", label: "Sign up" },
                ]}
                value={mode}
                onChange={handleModeChange}
                aria-label="Log in or Sign up"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                label="Password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPasswordToggle
                disabled={loading}
              />
              {error && !success && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-700" role="status">
                  {success}
                </p>
              )}
              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgot}
                    className="text-sm text-trakoo-mood-2 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" fullWidth loading={loading}>
                {mode === "login" ? "Log in" : "Sign up"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
