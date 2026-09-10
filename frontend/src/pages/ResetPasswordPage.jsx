import { useState } from "react";

import { LockKeyhole, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import * as authApi from "../api/authApi";

import { Banner, Field, PrimaryButton, TextInput } from "../components/ui";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [token] = useState(sessionStorage.getItem("resetToken") || "");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!token) {
      setError("Reset token not found. Please start again.");

      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, newPassword);

      sessionStorage.removeItem("resetToken");

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#526FE8]">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[#6C8CFF] uppercase">
            Leave Management
          </p>

          <h1 className="mt-1 font-serif text-[28px] text-[#1E2761]">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-[#6D7597]">
            Create a new secure password for your account.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mt-6 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6 space-y-5"
        >
          {error && <Banner tone="error">{error}</Banner>}

          {success && (
            <Banner tone="success">
              Password changed successfully! Redirecting to login...
            </Banner>
          )}

          <Field label="New Password">
            <TextInput
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </Field>

          <Field label="Confirm Password">
            <TextInput
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
            />
          </Field>

          <PrimaryButton type="submit" loading={loading} className="w-full">
            <CheckCircle2 className="h-4 w-4" />
            Reset Password
          </PrimaryButton>
        </form>

        <Link
          to="/login"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[#526FE8] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
