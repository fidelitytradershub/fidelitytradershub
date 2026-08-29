"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function handleForgotPassword() {
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail) {
      alert("Enter your email address first.");
      return;
    }

    setSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanedEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      alert(error.message);
      setSendingReset(false);
      return;
    }

    setSendingReset(false);

    alert(
      "Password reset email sent. Check your inbox and follow the reset link."
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !password) {
      alert("Enter your email and password.");
      return;
    }

    setSigningIn(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
      });

    if (error) {
      alert(error.message);
      setSigningIn(false);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("Could not load your account.");
      setSigningIn(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      alert("Could not determine your account type.");
      setSigningIn(false);
      return;
    }

    if (profile?.status && profile.status !== "active") {
      await supabase.auth.signOut();

      alert(
        "Your account is currently inactive. Please contact support."
      );

      setSigningIn(false);
      return;
    }

    if (
      profile?.role === "admin" ||
      profile?.role === "super_admin" ||
      profile?.role === "finance"
    ) {
      window.location.href = "/admin";
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="relative h-[58px] w-[205px]">
              <Image
                src="/fidelity-wordmark-dark.png"
                alt="Fidelity Traders Hub"
                fill
                priority
                sizes="205px"
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white">
            Fidelity Traders Hub
          </h1>

          <p className="mt-2 text-slate-400">
            Welcome back. Sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#b7ff00]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#b7ff00]"
            />

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={sendingReset}
              className="mt-3 text-sm font-medium text-[#b7ff00] hover:text-[#d2ff66] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingReset
                ? "Sending reset email..."
                : "Forgot Password?"}
            </button>
          </div>

          <button
            type="submit"
            disabled={signingIn}
            className="w-full rounded-xl bg-[#b7ff00] py-3 font-semibold text-[#061006] transition hover:bg-[#a6e600] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingIn ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-400">
          New to Fidelity Traders Hub?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#b7ff00] hover:text-[#d2ff66]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}