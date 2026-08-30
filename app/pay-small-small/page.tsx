"use client";
import BrandLogo from "../BrandLogo";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PaymentRequest = {
  depositId: string;
  amount: number;
  reference: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  productLabel: string;
};

export default function PaySmallSmallPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [outsideRequests, setOutsideRequests] = useState<any[]>([]);
  const [tvPurchases, setTvPurchases] = useState<any[]>([]);
  const [journalPurchases, setJournalPurchases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [openingGoalId, setOpeningGoalId] = useState<number | null>(null);
  const [completingGoalId, setCompletingGoalId] = useState<number | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  async function loadPage(userId: string) {
    const [goalsResult, outsideResult, tvResult, journalResult, paymentsResult] = await Promise.all([
      supabase.from("savings_goals")
        .select("id, offer_id, goal_name, target_amount, saved_amount, currency, status, created_at, updated_at")
        .eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("prop_firm_requests")
        .select("id, savings_goal_id, prop_firm, account_size, phase, status")
        .eq("user_id", userId),
      supabase.from("tradingview_purchases")
        .select(`id, savings_goal_id, purchase_type, status,
          tradingview_plans!tradingview_purchases_plan_id_fkey(name, duration_days, access_type)`)
        .eq("user_id", userId),
      supabase.from("trade_journal_purchases")
        .select(`id, savings_goal_id, status, duration_months, total_price, amount_paid, currency,
          trade_journal_plans!trade_journal_purchases_plan_id_fkey(name, billing_period)`)
        .eq("user_id", userId)
        .not("savings_goal_id", "is", null),
      supabase.from("deposits")
        .select("id, savings_goal_id, reference, amount, currency, status, sender_name, sender_bank, submitted_at, verified_at, created_at")
        .eq("user_id", userId).not("savings_goal_id", "is", null)
        .order("created_at", { ascending: false }),
    ]);

    if (goalsResult.error) console.warn("Savings goals:", goalsResult.error.message);
    else setGoals(goalsResult.data ?? []);
    if (!outsideResult.error) setOutsideRequests(outsideResult.data ?? []);
    if (!tvResult.error) setTvPurchases(tvResult.data ?? []);
    if (!journalResult.error) setJournalPurchases(journalResult.data ?? []);
    if (!paymentsResult.error) setPayments(paymentsResult.data ?? []);
  }

  useEffect(() => {
    async function start() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser) {
        window.location.href = "/logins";
        return;
      }
      setUser(sessionUser);
      await loadPage(sessionUser.id);
      setLoading(false);
    }
    start();
  }, []);

  const goalContext = useMemo(() => {
    const map = new Map<number, any>();
    outsideRequests.forEach((request) => {
      if (request.savings_goal_id) map.set(Number(request.savings_goal_id), {
        type: "outside",
        label: `${request.prop_firm} ${request.account_size || ""}`.trim(),
      });
    });
    tvPurchases.forEach((purchase) => {
      if (!purchase.savings_goal_id) return;
      const plan = Array.isArray(purchase.tradingview_plans)
        ? purchase.tradingview_plans[0] : purchase.tradingview_plans;
      map.set(Number(purchase.savings_goal_id), {
        type: "tradingview",
        label: `TradingView ${plan?.name || "Plan"}`,
      });
    });
    journalPurchases.forEach((purchase) => {
      if (!purchase.savings_goal_id) return;
      const plan = Array.isArray(purchase.trade_journal_plans)
        ? purchase.trade_journal_plans[0] : purchase.trade_journal_plans;
      const duration = Number(purchase.duration_months || 1);
      map.set(Number(purchase.savings_goal_id), {
        type: "journal",
        label: `Fidelity Journal ${plan?.name || "Pro"} — ${duration} month${duration === 1 ? "" : "s"}`,
      });
    });
    return map;
  }, [outsideRequests, tvPurchases, journalPurchases]);

  function normalizePayment(data: any, productLabel: string): PaymentRequest {
    const account = data?.payment_account || data?.bank_account || data || {};
    return {
      depositId: String(data?.deposit_id || data?.payment_request_id || ""),
      amount: Number(data?.amount || data?.payment_amount || 0),
      reference: String(data?.reference || data?.payment_reference || ""),
      bankName: String(account?.bank_name || data?.bank_name || ""),
      accountName: String(account?.account_name || data?.account_name || ""),
      accountNumber: String(account?.account_number || data?.account_number || ""),
      productLabel,
    };
  }

  async function openPayment(goal: any) {
    const amount = Number(String(amounts[goal.id] || "").replace(/,/g, ""));
    const remaining = Math.max(Number(goal.target_amount || 0) - Number(goal.saved_amount || 0), 0);
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      alert(`Enter an amount between NGN 1 and NGN ${remaining.toLocaleString()}.`);
      return;
    }

    const context = goalContext.get(Number(goal.id));
    const label = context?.label || goal.goal_name || "Pay Small Small";
    setOpeningGoalId(Number(goal.id));

    let data: any = null;
    let error: any = null;

    if (context?.type === "journal") {
      const created = await supabase.rpc("create_trade_journal_savings_payment_request", {
        p_goal_id: Number(goal.id),
        p_amount: amount,
      });
      data = created.data;
      error = created.error;

      if (error?.message?.toLowerCase().includes("payment awaiting submission or verification")) {
        const resumed = await supabase.rpc("resume_trade_journal_savings_payment_request", {
          p_goal_id: Number(goal.id),
        });
        data = resumed.data;
        error = resumed.error;
      }
    } else {
      const purpose = context?.type === "tradingview"
        ? "tradingview_savings_contribution"
        : context?.type === "outside"
          ? "outside_prop_savings_contribution"
          : "prop_savings_contribution";

      const created = await supabase.rpc("create_product_payment_request", {
        p_payment_purpose: purpose,
        p_amount: amount,
        p_prop_offer_id: null,
        p_outside_request_id: null,
        p_tradingview_purchase_id: null,
        p_savings_goal_id: Number(goal.id),
      });
      data = created.data;
      error = created.error;

      if (error?.message?.toLowerCase().includes("payment awaiting submission or verification")) {
        const resumed = await supabase.rpc("resume_product_payment_request", {
          p_payment_purpose: purpose,
          p_prop_offer_id: null,
          p_outside_request_id: null,
          p_tradingview_purchase_id: null,
          p_savings_goal_id: Number(goal.id),
        });
        data = resumed.data;
        error = resumed.error;
      }
    }

    setOpeningGoalId(null);

    if (error) {
      alert(`Could not open payment details: ${error.message}`);
      return;
    }

    const normalized = normalizePayment(data, label);
    if (!normalized.depositId || !normalized.reference || !normalized.accountNumber) {
      alert("Payment details are incomplete. Please contact support.");
      return;
    }

    setSenderName("");
    setSenderBank("");
    setPaymentRequest(normalized);
  }

  async function submitTransfer() {
    if (!paymentRequest || !user) return;
    if (!senderName.trim() || !senderBank.trim()) {
      alert("Enter the sender name and sender bank.");
      return;
    }
    setSubmittingTransfer(true);
    const { error } = await supabase.rpc("submit_deposit_details", {
      p_deposit_id: paymentRequest.depositId,
      p_payment_reference: paymentRequest.reference,
      p_sender_name: senderName.trim(),
      p_sender_bank: senderBank.trim(),
      p_payment_date: new Date().toISOString(),
      p_proof_file_url: null,
    });
    if (error) {
      alert(`Could not submit payment: ${error.message}`);
      setSubmittingTransfer(false);
      return;
    }
    setSubmittingTransfer(false);
    setPaymentRequest(null);
    await loadPage(user.id);
    alert("Payment submitted. Admin will verify it and update this goal.");
  }

  async function completePurchase(goal: any) {
    if (!goal.offer_id || !window.confirm("Complete this fully funded purchase now?")) return;
    setCompletingGoalId(Number(goal.id));
    const { data, error } = await supabase.rpc("complete_prop_savings_purchase", {
      p_goal_id: Number(goal.id),
    });
    setCompletingGoalId(null);
    if (error) {
      alert(`Could not complete purchase: ${error.message}`);
      return;
    }
    await loadPage(user.id);
    const refund = Number(data?.refund_amount || 0);
    alert(refund > 0
      ? `Purchase completed. NGN ${refund.toLocaleString()} was returned as a price difference.`
      : "Purchase completed. It is now pending delivery.");
  }

  function paymentStatus(status: string) {
    if (status === "approved") return "PAYMENT APPROVED";
    if (status === "awaiting_verification") return "UNDER REVIEW";
    if (status === "rejected") return "REJECTED";
    return "PAYMENT STARTED";
  }

  if (loading) {
    return (
      <main className="fth-pay-small-small fth-unified-board min-h-screen p-8">
        <p className="text-sm font-bold text-slate-400">Loading Pay Small Small...</p>
      </main>
    );
  }

  const activeGoals = goals.filter((goal) => goal.status === "active");
  const fundedGoals = goals.filter((goal) =>
    ["completed", "purchased"].includes(goal.status)
  );
  const totalTarget = goals.reduce(
    (sum, goal) => sum + Number(goal.target_amount || 0),
    0
  );
  const totalSaved = goals.reduce(
    (sum, goal) => sum + Number(goal.saved_amount || 0),
    0
  );
  const totalOutstanding = Math.max(totalTarget - totalSaved, 0);

  return (
    <main className="fth-pay-small-small fth-unified-board min-h-screen text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* APPROVED MOCKUP #2 SIDEBAR */}
        <aside className="fth-app-sidebar border-b border-slate-800 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex min-h-screen flex-col p-5">
            <Link
              href="/dashboard"
              className="fth-sidebar-brand flex min-h-14 items-center"
              aria-label="Fidelity Traders Hub"
            >
              <BrandLogo priority />
            </Link>

            <nav className="mt-8 space-y-1.5 text-sm">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">⌂</span>
                Dashboard
              </Link>

              <Link href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">▦</span>
                Marketplace
              </Link>

              <Link href="/dashboard#my-accounts" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">◎</span>
                My Accounts
              </Link>

              <Link href="/pay-small-small" className="fth-nav-active flex items-center gap-3 rounded-xl px-4 py-3 font-bold">
                <span aria-hidden="true">◔</span>
                Pay Small Small
              </Link>

              <Link href="/trade-journal" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">▤</span>
                Trade Journal
              </Link>

              <Link href="/dashboard#withdrawals" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">◫</span>
                Balance & Withdrawals
              </Link>
            </nav>

            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">
                  Payment workspace
                </p>
                <p className="mt-2 truncate text-sm font-black">
                  {user?.email || "Fidelity Traders Hub"}
                </p>
              </div>

              <Link
                href="/marketplace"
                className="fth-primary-button mt-3 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-black"
              >
                Choose Product
              </Link>
            </div>
          </div>
        </aside>

        {/* APPROVED MOCKUP #2 CONTENT */}
        <div className="min-w-0">
          <header className="fth-topbar sticky top-0 z-30 border-b border-slate-800 px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                  Payments & Plans
                </p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  Pay Small Small
                </h1>
              </div>

              <Link
                href="/marketplace"
                className="fth-primary-button rounded-xl px-4 py-2.5 text-sm font-black"
              >
                + New Plan
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-5 sm:p-8">
            {/* HERO */}
            <section className="fth-savings-hero rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                    Flexible payment workspace
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    One place for every active payment plan.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Continue payments for prop accounts, TradingView, Fidelity Journal
                    and outside prop-firm requests. Each product stays inside one plan
                    with its own progress and payment history.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 lg:min-w-[260px]">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">
                    Total outstanding
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    NGN {totalOutstanding.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Across {activeGoals.length} active {activeGoals.length === 1 ? "plan" : "plans"}
                  </p>
                </div>
              </div>
            </section>

            {/* SUMMARY */}
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Summary label="All Plans" value={goals.length} />
              <Summary label="Active Plans" value={activeGoals.length} color="text-blue-400" />
              <Summary label="Fully Funded" value={fundedGoals.length} color="text-emerald-400" />
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Total Paid</p>
                <p className="mt-2 text-2xl font-black text-emerald-400">
                  NGN {totalSaved.toLocaleString()}
                </p>
              </div>
            </section>

            {/* PLANS */}
            <section className="mt-8">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                    Your products
                  </p>
                  <h2 className="mt-1 text-2xl font-black">My Payment Plans</h2>
                </div>
                <p className="text-sm text-slate-400">
                  Pay any amount up to the remaining balance.
                </p>
              </div>

              {goals.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-slate-800 bg-slate-900 p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
                    ◔
                  </div>
                  <p className="mt-5 text-xl font-black">No Pay Small Small plan yet</p>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                    Choose an eligible product in Marketplace and select Pay Small Small.
                    Your new plan will appear here automatically.
                  </p>
                  <Link
                    href="/marketplace"
                    className="fth-primary-button mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-black"
                  >
                    Open Marketplace
                  </Link>
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  {goals.map((goal) => {
                    const target = Number(goal.target_amount || 0);
                    const saved = Number(goal.saved_amount || 0);
                    const remaining = Math.max(target - saved, 0);
                    const percent =
                      target > 0
                        ? Math.min(100, Math.round((saved / target) * 100))
                        : 0;
                    const currency = goal.currency || "NGN";
                    const context = goalContext.get(Number(goal.id));
                    const goalPayments = payments.filter(
                      (payment) =>
                        Number(payment.savings_goal_id) === Number(goal.id)
                    );
                    const funded =
                      remaining <= 0 ||
                      ["completed", "purchased"].includes(goal.status);
                    const category =
                      context?.type === "journal"
                        ? "Fidelity Journal"
                        : context?.type === "tradingview"
                          ? "TradingView"
                          : context?.type === "outside"
                            ? "Outside Prop Account"
                            : "Fidelity Prop Account";

                    return (
                      <article
                        key={goal.id}
                        className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-blue-400">
                                  {category}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] ${
                                    funded
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-amber-500/10 text-amber-400"
                                  }`}
                                >
                                  {funded ? "Fully Funded" : "Active"}
                                </span>
                              </div>

                              <h3 className="mt-3 text-xl font-black">
                                {context?.label || goal.goal_name}
                              </h3>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                                Outstanding
                              </p>
                              <p className="mt-1 text-xl font-black">
                                {currency} {remaining.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <Amount
                                label="Paid"
                                value={`${currency} ${saved.toLocaleString()}`}
                                color="text-emerald-400"
                              />
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <Amount
                                label="Target"
                                value={`${currency} ${target.toLocaleString()}`}
                              />
                            </div>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <Amount
                                label="Remaining"
                                value={`${currency} ${remaining.toLocaleString()}`}
                                color="text-blue-400"
                              />
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-500">Plan progress</span>
                              <span className="text-blue-400">
                                {funded ? 100 : percent}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full ${
                                  funded ? "bg-emerald-500" : "bg-blue-600"
                                }`}
                                style={{ width: `${funded ? 100 : percent}%` }}
                              />
                            </div>
                          </div>

                          {!funded ? (
                            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                              <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">
                                Make another payment
                              </p>

                              <div className="mt-3 flex flex-col gap-3 lg:flex-row">
                                <input
                                  type="number"
                                  min="1"
                                  max={remaining}
                                  value={amounts[goal.id] || ""}
                                  onChange={(event) =>
                                    setAmounts((current) => ({
                                      ...current,
                                      [goal.id]: event.target.value,
                                    }))
                                  }
                                  placeholder={`Enter amount up to ${currency} ${remaining.toLocaleString()}`}
                                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                                />

                                <button
                                  type="button"
                                  onClick={() => openPayment(goal)}
                                  disabled={openingGoalId === Number(goal.id)}
                                  className="fth-primary-button rounded-xl px-5 py-3 font-black disabled:opacity-50"
                                >
                                  {openingGoalId === Number(goal.id)
                                    ? "Opening..."
                                    : "Pay Now"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setAmounts((current) => ({
                                      ...current,
                                      [goal.id]: String(remaining),
                                    }))
                                  }
                                  className="rounded-xl border border-slate-800 px-5 py-3 font-bold text-slate-300"
                                >
                                  Pay Full Balance
                                </button>
                              </div>
                            </div>
                          ) : goal.offer_id && goal.status !== "purchased" ? (
                            <button
                              type="button"
                              onClick={() => completePurchase(goal)}
                              disabled={completingGoalId === Number(goal.id)}
                              className="fth-primary-button mt-6 rounded-xl px-5 py-3 font-black disabled:opacity-50"
                            >
                              {completingGoalId === Number(goal.id)
                                ? "Completing..."
                                : "Complete Purchase"}
                            </button>
                          ) : (
                            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                              <p className="text-sm font-bold text-emerald-400">
                                Payment completed. Your order is being prepared for delivery.
                              </p>
                            </div>
                          )}
                        </div>

                        <details className="border-t border-slate-800">
                          <summary className="cursor-pointer px-5 py-4 text-sm font-black text-slate-300 sm:px-6">
                            Payment History ({goalPayments.length})
                          </summary>

                          <div className="grid gap-2 border-t border-slate-800 p-5 sm:p-6">
                            {goalPayments.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No submitted payment recorded yet.
                              </p>
                            ) : (
                              goalPayments.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center"
                                >
                                  <div>
                                    <p className="font-black">
                                      {payment.currency || "NGN"}{" "}
                                      {Number(payment.amount || 0).toLocaleString()}
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs text-slate-500">
                                      {payment.reference}
                                    </p>
                                  </div>

                                  <span className="text-xs font-black text-blue-400">
                                    {paymentStatus(payment.status)}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </details>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* BANK TRANSFER MODAL */}
      {paymentRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                  Fidelity Traders Hub Payment
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Complete Bank Transfer
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {paymentRequest.productLabel}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPaymentRequest(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <Amount
                  label="Exact Amount"
                  value={`NGN ${paymentRequest.amount.toLocaleString()}`}
                  color="text-emerald-400"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <Amount
                  label="Your FTH Reference"
                  value={paymentRequest.reference}
                  color="text-blue-400"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <Amount label="Bank" value={paymentRequest.bankName} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <Amount label="Account Number" value={paymentRequest.accountNumber} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <Amount label="Account Name" value={paymentRequest.accountName} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="font-black">After making the transfer</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Enter the sender account name and sender bank. No receipt upload is required.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Sender account name *"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
                <input
                  value={senderBank}
                  onChange={(event) => setSenderBank(event.target.value)}
                  placeholder="Sender bank *"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <button
                type="button"
                onClick={submitTransfer}
                disabled={submittingTransfer}
                className="fth-primary-button mt-4 w-full rounded-xl px-5 py-3 font-black disabled:opacity-50"
              >
                {submittingTransfer
                  ? "Submitting..."
                  : "I Have Paid — Submit for Verification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Summary({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function Amount({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.10em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 break-all font-black ${color}`}>{value}</p>
    </div>
  );
}
