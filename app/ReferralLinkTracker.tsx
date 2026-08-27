"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "fth_referral_code";
const LANDING_KEY = "fth_referral_landing_url";
const CAPTURED_AT_KEY = "fth_referral_captured_at";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeCode(value: string | null) {
  return (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

function clearStoredReferral() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LANDING_KEY);
  localStorage.removeItem(CAPTURED_AT_KEY);
}

export default function ReferralLinkTracker() {
  useEffect(() => {
    let stopped = false;

    const currentUrl = new URL(window.location.href);
    const referralCode = normalizeCode(
      currentUrl.searchParams.get("ref")
    );

    if (referralCode) {
      localStorage.setItem(STORAGE_KEY, referralCode);
      localStorage.setItem(LANDING_KEY, window.location.href);
      localStorage.setItem(CAPTURED_AT_KEY, String(Date.now()));

      currentUrl.searchParams.delete("ref");

      window.history.replaceState(
        {},
        "",
        `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
      );
    }

    async function attachReferral() {
      if (stopped) return;

      const code = normalizeCode(
        localStorage.getItem(STORAGE_KEY)
      );

      const capturedAt = Number(
        localStorage.getItem(CAPTURED_AT_KEY) || 0
      );

      if (!code) return;

      if (
        !capturedAt ||
        Date.now() - capturedAt > THIRTY_DAYS_MS
      ) {
        clearStoredReferral();
        return;
      }

      const { data: authData } =
        await supabase.auth.getUser();

      if (!authData.user || stopped) return;

      const { data, error } = await supabase.rpc(
        "claim_referral_link",
        {
          p_code: code,
          p_landing_url:
            localStorage.getItem(LANDING_KEY),
          p_user_agent: navigator.userAgent,
        }
      );

      if (!error && data?.success) {
        clearStoredReferral();
      }
    }

    attachReferral();

    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {
        if (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION"
        ) {
          window.setTimeout(attachReferral, 0);
        }
      });

    return () => {
      stopped = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return null;
}