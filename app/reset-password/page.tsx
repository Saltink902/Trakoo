"use client";

/**
 * Set new password after clicking the reset link in email.
 * Requires Supabase URL Configuration (see src/lib/supabase.ts): Site URL and
 * Redirect URLs must include your app origin so reset links land here.
 */
import { Button } from "@/components/auth/Button";
import { Input } from "@/components/auth/Input";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mismatch, setMismatch] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMismatch(false);

    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.replace("/"), 2000);
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-dashboard-gradient px-4 py-8">
      <div className="soft-card w-full max-w-sm p-6">
        <h1 className="mb-2 text-center text-xl font-bold text-trakoo-text">
          Set a new password
        </h1>
        <p className="mb-6 text-center text-sm text-trakoo-muted">
          Enter your new password below.
        </p>

        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-green-700" role="status">
              Password updated. Redirecting you…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMismatch(false);
              }}
              showPasswordToggle
              disabled={loading}
            />
            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setMismatch(false);
              }}
              showPasswordToggle
              error={mismatch ? "Passwords don't match." : undefined}
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" fullWidth loading={loading}>
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
