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
    <main className="fth-auth-shell fth-login-shell min-h-[100svh] px-4 py-6 sm:px-6 sm:py-10">
      <div className="fth-login-layout mx-auto grid min-h-[calc(100svh-3rem)] w-full max-w-6xl overflow-hidden rounded-[30px] border lg:grid-cols-[1fr_1fr]">
        <aside className="fth-login-aside hidden flex-col justify-between p-10 lg:flex">
          <Link href="/" aria-label="Fidelity Traders Hub home" className="fth-auth-brand">
            <Image src="/fidelity-wordmark-dark.png" alt="Fidelity Traders Hub" width={205} height={58} priority />
          </Link>
          <div className="relative z-10">
            <span className="fth-auth-kicker">WELCOME BACK</span>
            <h2 className="mt-5 max-w-lg text-5xl font-black leading-[1.04] tracking-tight">
              Same ambition.<br /><span>Greater opportunities.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              Sign in to access your dashboard, manage purchases, track your trading tools and keep building with purpose.
            </p>
            <div className="fth-login-highlights mt-9 grid gap-3">
              <div><span>01</span><p><strong>Trade</strong><small>Access your trading tools and services.</small></p></div>
              <div><span>02</span><p><strong>Track</strong><small>Follow orders, payments and requests.</small></p></div>
              <div><span>03</span><p><strong>Improve</strong><small>Keep your trading journal organized.</small></p></div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Fidelity Nasir Innovation Limited</p>
        </aside>

        <section className="fth-login-panel flex items-center justify-center p-5 sm:p-10 lg:p-12">
          <div className="fth-login-card w-full max-w-md rounded-[26px] p-6 sm:p-9">
            <div className="mb-7 text-center">
              <div className="mb-5 flex justify-center">
                <div className="relative h-[48px] w-[180px] sm:h-[58px] sm:w-[205px]">
                  <Image src="/fidelity-wordmark-dark.png" alt="Fidelity Traders Hub" fill priority sizes="(max-width: 640px) 180px, 205px" className="object-contain" />
                </div>
              </div>
              <span className="fth-auth-kicker">YOUR TRADING JOURNEY CONTINUES</span>
              <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Welcome Back</h1>
              <p className="mt-2 text-sm text-slate-400 sm:text-base">Sign in to your Fidelity Traders Hub account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-200">Email Address</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="fth-auth-input w-full rounded-xl px-4 py-3.5 text-white outline-none transition" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-200">Password</label>
                <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="fth-auth-input w-full rounded-xl px-4 py-3.5 text-white outline-none transition" />
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={handleForgotPassword} disabled={sendingReset} className="text-sm font-semibold text-[#c4ff00] transition hover:text-white disabled:opacity-50">
                    {sendingReset ? "Sending reset email..." : "Forgot Password?"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={signingIn} className="fth-auth-submit w-full rounded-xl px-5 py-3.5 font-bold text-[#071000] transition disabled:cursor-not-allowed disabled:opacity-50">
                {signingIn ? "Signing In..." : "Sign In  →"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-400">
              New to Fidelity Traders Hub?{" "}
              <Link href="/register" className="font-bold text-[#c4ff00] hover:text-white">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
