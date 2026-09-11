import { useState } from "react";

import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import * as authApi from "../api/authApi";

import { Banner, Field, PrimaryButton, TextInput } from "../components/ui";

export default function VerifyOtpPage() {
  const navigate = useNavigate();

  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!email) {
      setError(
        "Email information not found. Please start the password reset process again.",
      );

      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");

      return;
    }

    setLoading(true);

    try {
      const result = await authApi.verifyResetOtp(email, otp);

    //   console.log("OTP VERIFY RESPONSE:", result);

    //   console.log("RESET TOKEN:", result.resetToken);

      if (!result.resetToken) {
        throw new Error("Reset token was not received from the server.");
      }

      sessionStorage.setItem("resetToken", result.resetToken);

      navigate("/reset-password", {
        replace: true,
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
            <ShieldCheck className="h-6 w-6" />
          </div>

          <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-[#6C8CFF] uppercase">
            Leave Management
          </p>

          <h1 className="mt-1 font-serif text-[28px] text-[#1E2761]">
            Verify OTP
          </h1>

          <p className="mt-2 text-sm text-[#6D7597]">
            Enter the 6-digit verification code sent to
          </p>

          <p className="mt-1 text-sm font-medium text-[#1E2761]">{email}</p>
        </div>

        <form
          onSubmit={submit}
          className="mt-6 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6 space-y-5"
        >
          {error && <Banner tone="error">{error}</Banner>}

          <Field label="Verification Code">
            <TextInput
              type="text"
              required
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </Field>

          <PrimaryButton type="submit" loading={loading} className="w-full">
            <CheckCircle2 className="h-4 w-4" />
            Verify OTP
          </PrimaryButton>
        </form>

        <Link
          to="/forgot-password"
          className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-[#526FE8] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forgot Password
        </Link>
      </div>
    </div>
  );
}
