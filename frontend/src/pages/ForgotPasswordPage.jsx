import { useState } from "react";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { forgotPassword } from "../api/authApi";

import {
  Banner,
  Field,
  PrimaryButton,
  TextInput,
} from "../components/ui";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);

      // console.log("Forgot password result:", result);

      navigate("/verify-otp", {
        state: {
          email,
        },
      });
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
            <KeyRound className="h-6 w-6" />
          </div>

          <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[#6C8CFF] uppercase">
            Leave Management
          </p>

          <h1 className="mt-1 font-serif text-[28px] text-[#1E2761]">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-[#6D7597]">
            Enter your registered email address to reset your password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6 space-y-5"
        >
          {error && <Banner tone="error">{error}</Banner>}

          <Field label="Email Address">
            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </Field>

          <PrimaryButton
            type="submit"
            loading={loading}
            className="w-full"
          >
            <Mail className="h-4 w-4" />
            Continue
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