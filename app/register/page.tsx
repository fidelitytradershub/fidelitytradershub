"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setCreatingAccount(true);

    const cleanedName = fullName.trim();
    const cleanedEmail = email.trim().toLowerCase();

    const nameParts = cleanedName.split(/\s+/);

    const firstName = nameParts[0] || "";
    const lastName =
      nameParts.length > 1
        ? nameParts.slice(1).join(" ")
        : "";

    const { error } = await supabase.auth.signUp({
      email: cleanedEmail,
      password,
      options: {
        data: {
          full_name: cleanedName,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      alert(error.message);
      setCreatingAccount(false);
      return;
    }

    setCreatingAccount(false);

    alert(
      "Account created successfully! Check your email to verify your account."
    );

    window.location.href = "/logins";
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">
            Fidelity Traders Hub
          </h1>

          <p className="mt-3 text-lg text-blue-300">
            Create your account and start your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block font-medium text-white"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-medium text-white"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-medium text-white"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block font-medium text-white"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 text-white outline-none placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={creatingAccount}
            className="w-full rounded-xl bg-blue-600 px-5 py-4 text-lg font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingAccount
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-7 text-center text-slate-400">
          Already have an account?{" "}
          <Link
            href="/logins"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}