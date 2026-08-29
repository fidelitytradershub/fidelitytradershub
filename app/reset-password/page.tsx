"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setUpdating(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
      setUpdating(false);
      return;
    }

    alert(
      "Password updated successfully. You can now sign in with your new password."
    );

    window.location.href = "/logins";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Reset Password
          </h1>

          <p className="mt-3 text-slate-400">
            Create a new password for your Fidelity Traders Hub account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              New Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter new password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#b7ff00] focus:ring-2 focus:ring-[#b7ff00]/20"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#b7ff00] focus:ring-2 focus:ring-[#b7ff00]/20"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full rounded-xl bg-[#b7ff00] px-5 py-3 font-semibold text-[#061006] transition hover:bg-[#a6e600] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updating
              ? "Updating Password..."
              : "Update Password"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/logins";
          }}
          className="mt-4 w-full text-sm font-semibold text-[#b7ff00] hover:text-[#d2ff66]"
        >
          Back to Sign In
        </button>
      </div>
    </main>
  );
}