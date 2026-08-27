"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PartnerReferralLinkCard() {
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);
  const [code, setCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [savingBank, setSavingBank] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  async function loadPartnerData(userId: string) {
    const { data: summary } = await supabase
      .from("partner_dashboard_summary")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!summary) return false;

    const [{ data: referralCode }, { data: details }, { data: requests }] =
      await Promise.all([
        supabase
          .from("referral_codes")
          .select("code,active,expires_at")
          .eq("partner_id", summary.partner_id)
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("referral_partners")
          .select("payout_bank_name,payout_account_name,payout_account_number")
          .eq("id", summary.partner_id)
          .maybeSingle(),
        supabase
          .from("partner_payout_requests")
          .select("id,requested_amount,approved_amount,currency,status,admin_note,requested_at,paid_at")
          .eq("partner_id", summary.partner_id)
          .order("requested_at", { ascending: false })
          .limit(10),
      ]);

    setPartner(summary);
    setCode(referralCode?.code ?? "");
    setBankName(details?.payout_bank_name ?? "");
    setAccountName(details?.payout_account_name ?? "");
    setAccountNumber(details?.payout_account_number ?? "");
    setPayoutRequests(requests ?? []);
    return true;
  }

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      await loadPartnerData(userId);
      setLoading(false);
    })();
  }, []);

  if (loading || !partner || !code) return null;

  const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const baseUrl = configuredBase || (typeof window !== "undefined" ? window.location.origin : "");
  const referralLink = `${baseUrl}/register?ref=${encodeURIComponent(code)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      alert("Your referral link has been copied.");
    } catch {
      window.prompt("Copy your referral link:", referralLink);
    }
  }

  async function savePayoutAccount() {
    if (!bankName.trim() || !accountName.trim() || accountNumber.replace(/\D/g, "").length < 8) {
      alert("Enter a valid bank name, account name and account number.");
      return;
    }

    setSavingBank(true);
    const { error } = await supabase.rpc("update_partner_payout_details", {
      p_bank_name: bankName.trim(),
      p_account_name: accountName.trim(),
      p_account_number: accountNumber.replace(/\D/g, ""),
    });
    setSavingBank(false);

    if (error) {
      alert(`Could not save payout account: ${error.message}`);
      return;
    }

    alert("Payout bank account saved.");
  }

  async function requestPayout() {
    const amount = Number(payoutAmount);
    const available = Number(partner.available_commission || 0);
    const minimum = Number(partner.minimum_payout || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid payout amount.");
      return;
    }
    if (amount < minimum) {
      alert(`The minimum referral payout is NGN ${minimum.toLocaleString()}.`);
      return;
    }
    if (amount > available) {
      alert("The requested amount is higher than your available commission.");
      return;
    }
    if (!bankName.trim() || !accountName.trim() || accountNumber.replace(/\D/g, "").length < 8) {
      alert("Save your payout bank details first.");
      return;
    }
    if (!window.confirm(`Request NGN ${amount.toLocaleString()} referral payout?`)) return;

    setRequestingPayout(true);
    const { data: authData } = await supabase.auth.getUser();
    const { error } = await supabase.rpc("create_partner_payout_request", {
      p_amount: amount,
    });

    if (error) {
      alert(`Could not request payout: ${error.message}`);
      setRequestingPayout(false);
      return;
    }

    if (authData.user) await loadPartnerData(authData.user.id);
    setPayoutAmount("");
    setRequestingPayout(false);
    alert("Payout request sent to Fidelity Traders Hub Admin.");
  }

  return (
    <section className="mt-7 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
        Referral partner
      </p>
      <h2 className="mt-2 text-xl font-bold">Share your personal referral link</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Anyone who registers or signs in through this link is attached to you automatically for eligible purchases.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          readOnly
          value={referralLink}
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200"
        />
        <button type="button" onClick={copyLink} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold">
          Copy link
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <p><span className="block text-slate-500">Code</span><strong>{code}</strong></p>
        <p><span className="block text-slate-500">Conversions</span><strong>{partner.conversion_count ?? 0}</strong></p>
        <p><span className="block text-slate-500">Available</span><strong>NGN {Number(partner.available_commission || 0).toLocaleString()}</strong></p>
        <p><span className="block text-slate-500">Paid</span><strong>NGN {Number(partner.paid_commission || 0).toLocaleString()}</strong></p>
      </div>

      <div className="mt-6 border-t border-slate-800 pt-5">
        <h3 className="text-lg font-bold">Referral payout</h3>
        <p className="mt-1 text-sm text-slate-400">
          Save the bank account where Fidelity Traders Hub should send your approved commission.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Bank name" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm" />
          <input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Account name" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm" />
          <input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Account number" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm" />
        </div>

        <button type="button" onClick={savePayoutAccount} disabled={savingBank} className="mt-3 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold disabled:opacity-50">
          {savingBank ? "Saving..." : "Save payout account"}
        </button>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input value={payoutAmount} onChange={(event) => setPayoutAmount(event.target.value)} type="number" min="1" placeholder={`Payout amount · minimum NGN ${Number(partner.minimum_payout || 0).toLocaleString()}`} className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm" />
          <button type="button" onClick={requestPayout} disabled={requestingPayout || Number(partner.available_commission || 0) <= 0} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {requestingPayout ? "Sending request..." : "Request payout"}
          </button>
        </div>

        {payoutRequests.length > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent payout requests</p>
            {payoutRequests.map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
                <div>
                  <p className="font-semibold">{request.currency || "NGN"} {Number(request.requested_amount).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(request.requested_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase text-blue-300">{String(request.status).replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
