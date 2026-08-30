"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanedName = fullName.trim();
    const cleanedNickname = nickname.trim();
    const cleanedPhone = phoneNumber.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedName) {
      alert("Please enter your full name.");
      return;
    }

    if (!cleanedPhone) {
      alert("Please enter your phone number.");
      return;
    }

    if (!cleanedEmail) {
      alert("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      alert("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setCreatingAccount(true);

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
          nickname: cleanedNickname || null,
          phone_number: cleanedPhone,
          phone: cleanedPhone,
        },
        emailRedirectTo: `${window.location.origin}/logins`,
      },
    });

    if (error) {
      alert(error.message);
      setCreatingAccount(false);
      return;
    }

    setCreatingAccount(false);

    alert(
      "Account created successfully! Please check your email to verify your account."
    );

    window.location.href = "/logins";
  }

  const inputClassName =
    "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#b7ff00] focus:ring-2 focus:ring-[#b7ff00]/20";

  return (
    <main className="flex min-h-[100svh] items-start justify-center bg-[#020617] px-4 pb-8 pt-4 sm:items-center sm:py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-2xl sm:p-8">
        <div className="mb-5 text-center sm:mb-8">
          <div className="mb-3 flex justify-center sm:mb-5">
            <div className="relative h-[44px] w-[172px] sm:h-[58px] sm:w-[205px]">
              <Image
                src="/fidelity-wordmark-dark.png"
                alt="Fidelity Traders Hub"
                fill
                priority
                sizes="(max-width: 640px) 172px, 205px"
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Create Your Account
          </h1>

          <p className="mt-1.5 text-sm text-slate-400 sm:mt-2 sm:text-base">
            Join Fidelity Traders Hub and start your journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-medium text-slate-300 sm:mb-2"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="nickname"
              className="mb-1.5 block text-sm font-medium text-slate-300 sm:mb-2"
            >
              Nickname{" "}
              <span className="font-normal text-slate-500">
                (optional)
              </span>
            </label>

            <input
              id="nickname"
              type="text"
              maxLength={30}
              autoComplete="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="What should we call you?"
              className={inputClassName}
            />

            <p className="mt-1.5 text-xs text-slate-500 sm:mt-2">
              This name can be used to welcome you on your dashboard.
            </p>
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-1.5 block text-sm font-medium text-slate-300 sm:mb-2"
            >
              Phone Number
            </label>

            <input
              id="phoneNumber"
              type="tel"
              required
              autoComplete="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="+234 801 234 5678"
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-300 sm:mb-2"
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
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-300 sm:mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              className={inputClassName}
            />

            <p className="mt-1.5 text-xs text-slate-500 sm:mt-2">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-slate-300 sm:mb-2"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm your password"
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={creatingAccount}
            className="w-full rounded-xl bg-[#b7ff00] py-3 font-semibold text-[#061006] transition hover:bg-[#a6e600] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingAccount
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-400 sm:mt-7">
          Already have an account?{" "}
          <Link
            href="/logins"
            className="font-semibold text-[#b7ff00] hover:text-[#d2ff66]"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
