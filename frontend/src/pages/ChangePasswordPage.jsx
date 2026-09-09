import { useState } from "react";
import { LockKeyhole, Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import * as employeeApi from "../api/employeeApi";

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggleShow,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#33395C]">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#D9DEF0] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#1E2761]"
        />

        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A83A6]"
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const { token } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const result = await employeeApi.changePassword(token, {
        currentPassword,
        newPassword,
      });

      setSuccess(result.message || "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      {/* HEADER */}

      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-serif text-[24px] text-[#1E2761]">
          <LockKeyhole size={24} />
          Change Password
        </h2>

        <p className="mt-1 text-sm text-[#5B6485]">
          Update your account password to keep your account secure.
        </p>
      </div>

      {/* CARD */}

      <div className="rounded-2xl border border-[#E3E7F5] bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />

            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            toggleShow={() => setShowCurrent(!showCurrent)}
            placeholder="Enter current password"
          />

          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            toggleShow={() => setShowNew(!showNew)}
            placeholder="Enter new password"
          />

          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            toggleShow={() => setShowConfirm(!showConfirm)}
            placeholder="Confirm new password"
          />

          <div className="rounded-lg bg-[#F7F8FD] p-4">
            <p className="text-xs font-medium text-[#1E2761]">
              Password requirements
            </p>

            <ul className="mt-2 space-y-1 text-xs text-[#6D7597]">
              <li>• Minimum 6 characters</li>

              <li>
                • New password must be different from your current password
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E2761] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#273274] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole size={17} />

            {loading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
