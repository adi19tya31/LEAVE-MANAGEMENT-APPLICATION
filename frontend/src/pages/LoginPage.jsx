import { useState } from "react";
import { Send, KeyRound } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  Banner,
  Field,
  PrimaryButton,
  TextInput,
} from "../components/ui";

export default function LoginPage() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setError("");

    setLoading(true);

    try {
      await login(email, password);

      navigate("/apply", {
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

        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6C8CFF] uppercase text-center">
          Leave Management
        </p>

        <h1 className="mt-1 font-serif text-[28px] text-[#1E2761] text-center">
          Sign in
        </h1>

        <form
          onSubmit={submit}
          className="mt-6 rounded-2xl bg-white border border-[#E3E7F5] shadow-sm p-6 space-y-4"
        >

          {error && (
            <Banner tone="error">
              {error}
            </Banner>
          )}

          <Field label="Email">

            <TextInput
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@company.com"
            />

          </Field>

          <Field label="Password">

            <TextInput
              type="password"
              required
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="••••••••"
            />

          </Field>

          {/* FORGOT PASSWORD */}

          <div className="flex justify-end -mt-1">

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[#526FE8] hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          <PrimaryButton
            type="submit"
            loading={loading}
            className="w-full"
          >
            <Send className="h-3.5 w-3.5" />

            Sign in
          </PrimaryButton>

        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#8A91B4]">

          <KeyRound className="h-3.5 w-3.5" />

          <span>
            Secure employee login
          </span>

        </div>

      </div>
    </div>
  );
}