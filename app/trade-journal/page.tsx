"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TradeJournalWorkspace from "./TradeJournalWorkspace";

type Plan = { id:string; name:string; description:string|null; billing_period:string; price:number; currency:string };
type Preview = { valid:boolean; code_type?:"none"|"discount"|"referral"; gross_amount?:number; discount_amount?:number; net_amount?:number; message?:string; partner_name?:string };
type PaymentRequest = { depositId:string; amount:number; currency:string; reference:string; bankName:string; accountName:string; accountNumber:string; instructions:string; productLabel:string };
type JournalAccess = { allowed?: boolean; plan?: "free" | "pro"; source?: string };

const money = (currency:string, value:number) => `${currency} ${Number(value || 0).toLocaleString()}`;

const FREE_FEATURES = [
  "1 trading account",
  "1 reusable trading system",
  "30 new trades per calendar month",
  "Trade logging and journal history",
  "Before and after chart screenshots for every permitted trade",
  "Basic win/loss and R analytics",
  "Risk-plan validation warnings",
];

const PRO_FEATURES = [
  "Multiple trading accounts",
  "Multiple reusable trading systems",
  "Unlimited trade entries and chart screenshots",
  "Expanded analytics by system, market, session and setup layer",
  "Full journal workflow with Pro feature access",
];

export default function TradeJournalPage() {
  const [plans,setPlans] = useState<Plan[]>([]);
  const [selected,setSelected] = useState<Plan|null>(null);
  const [email,setEmail] = useState("");
  const [code,setCode] = useState("");
  const [preview,setPreview] = useState<Preview|null>(null);
  const [loading,setLoading] = useState(true);
  const [checking,setChecking] = useState(false);
  const [submitting,setSubmitting] = useState(false);
  const [paymentRequest,setPaymentRequest] = useState<PaymentRequest|null>(null);
  const [senderName,setSenderName] = useState("");
  const [senderBank,setSenderBank] = useState("");
  const [submittingTransfer,setSubmittingTransfer] = useState(false);
  const [journalAccess,setJournalAccess] = useState<JournalAccess|null>(null);
  const [forceCheckout,setForceCheckout] = useState(false);
  const [checkoutMethod,setCheckoutMethod] = useState<"pay_now"|"pay_small_small">("pay_now");
  const [months,setMonths] = useState(1);
  const [startingSavings,setStartingSavings] = useState(false);

  useEffect(() => { (async () => {
    const params = new URLSearchParams(window.location.search);
    const wantsCheckout = params.get("checkout") === "pro";
    const requestedMethod =
      params.get("method") === "pay-small-small"
        ? "pay_small_small"
        : "pay_now";

    setForceCheckout(wantsCheckout);
    setCheckoutMethod(requestedMethod);

    const { data:auth } = await supabase.auth.getUser();
    let access: JournalAccess | null = null;
    if (auth.user) {
      const { data, error } = await supabase.rpc("get_my_trade_journal_access");
      if (!error) access = data as JournalAccess;
    }
    setJournalAccess(access);

    if (access?.allowed && !wantsCheckout) {
      setEmail(auth.user?.email ?? "");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("trade_journal_plans")
      .select("id,name,description,billing_period,price,currency")
      .eq("active",true)
      .is("archived_at",null)
      .order("sort_order");
    if (error) alert(`Could not load plans: ${error.message}`);
    const rows = (data ?? []) as Plan[];
    setPlans(rows);
    const proPlan =
      rows.find((plan) => plan.name.toLowerCase().includes("pro")) ??
      rows[0] ??
      null;
    setSelected(proPlan);
    setEmail(auth.user?.email ?? "");
    setLoading(false);
  })(); }, []);

  useEffect(() => { setPreview(null); }, [selected?.id, code, months]);

  const bundleDiscountPercent = useMemo(() => {
    if (months >= 12) return 10;
    if (months >= 7) return 8;
    if (months >= 4) return 5;
    if (months >= 2) return 3;
    return 0;
  }, [months]);

  const multiMonthGross = useMemo(
    () => Number(selected?.price || 0) * months,
    [selected, months]
  );

  const bundleDiscountAmount = useMemo(
    () => Math.round((multiMonthGross * bundleDiscountPercent / 100) * 100) / 100,
    [multiMonthGross, bundleDiscountPercent]
  );

  const afterBundle = useMemo(
    () => Math.max(multiMonthGross - bundleDiscountAmount, 0),
    [multiMonthGross, bundleDiscountAmount]
  );

  const payable = useMemo(
    () => preview?.valid ? Number(preview.net_amount) : afterBundle,
    [preview, afterBundle]
  );

  async function applyCode() {
    if (!selected || !code.trim()) return;
    setChecking(true);
    const { data,error } = await supabase.rpc("preview_checkout_code", {
      p_code:code.trim(),
      p_product_type:"trade_journal",
      p_gross_amount:afterBundle
    });
    setChecking(false);
    if (error) return alert(error.message);
    setPreview(data as Preview);
  }

  async function startJournalPaySmallSmall() {
    if (!selected) return;
    if (!email.trim()) {
      alert("Enter the delivery email first.");
      return;
    }

    setStartingSavings(true);
    const { data, error } = await supabase.rpc("start_trade_journal_savings_goal", {
      p_plan_id: selected.id,
      p_purchase_email: email.trim(),
      p_code: code.trim() || null,
      p_months: months,
    });
    setStartingSavings(false);

    if (error) {
      alert(`Could not start Pay Small Small: ${error.message}`);
      return;
    }

    const goalId = Number(data?.goal_id || data?.savings_goal_id || 0);
    if (!goalId) {
      alert("The Fidelity Journal savings goal was created, but its ID was not returned.");
      return;
    }

    window.location.href = `/pay-small-small?goal=${goalId}`;
  }

  async function checkout() {
    if (!selected) return;
    if (!email.trim()) return alert("Enter your delivery email.");
    const { data:auth } = await supabase.auth.getUser();
    if (!auth.user) { alert("Please sign in before purchasing Trade Journal."); window.location.href="/logins"; return; }
    setSubmitting(true);
    const { data,error } = await supabase.rpc("start_trade_journal_checkout_multi_month", {
      p_plan_id:selected.id,
      p_purchase_email:email.trim(),
      p_code:code.trim() || null,
      p_months:months
    });
    if (error) { setSubmitting(false); return alert(`Could not start checkout: ${error.message}`); }
    try {
      const purchaseId=String(data?.purchase_id||"");
      if(!purchaseId) throw new Error("Trade Journal purchase ID was not returned.");
      let payment=await supabase.rpc("create_trade_journal_payment_request",{p_purchase_id:purchaseId});
      if(payment.error){
        const duplicate=payment.error.message.toLowerCase().includes("payment awaiting submission or verification");
        if(!duplicate) throw payment.error;
        payment=await supabase.rpc("resume_trade_journal_payment_request",{p_purchase_id:purchaseId});
        if(payment.error) throw payment.error;
      }
      const raw:any=payment.data||{};
      const account=raw.payment_account||raw.bank_account||raw;
      const normalized:PaymentRequest={
        depositId:String(raw.deposit_id||raw.payment_request_id||""), amount:Number(raw.amount||raw.payment_amount||0),
        currency:String(raw.currency||"NGN"), reference:String(raw.reference||raw.payment_reference||""),
        bankName:String(account.bank_name||raw.bank_name||""), accountName:String(account.account_name||raw.account_name||""),
        accountNumber:String(account.account_number||raw.account_number||""), instructions:String(account.payment_instructions||raw.payment_instructions||""),
        productLabel:String(raw.product_label||`Trade Journal - ${selected.name}`)
      };
      if(!normalized.depositId||!normalized.reference||!normalized.accountNumber) throw new Error("Payment request was created without complete bank details. Please contact Admin.");
      setSenderName(""); setSenderBank(""); setPaymentRequest(normalized);
    } catch(paymentError:any){ alert(`Checkout was created, but payment details could not open: ${paymentError.message}`); }
    setSubmitting(false);
  }

  async function submitTransferDetails(){
    if(!paymentRequest) return;
    if(!senderName.trim()||!senderBank.trim()) return alert("Enter the sender name and sender bank.");
    setSubmittingTransfer(true);
    const {error}=await supabase.rpc("submit_deposit_details",{
      p_deposit_id:paymentRequest.depositId,p_payment_reference:paymentRequest.reference,
      p_sender_name:senderName.trim(),p_sender_bank:senderBank.trim(),
      p_payment_date:new Date().toISOString(),p_proof_file_url:null
    });
    setSubmittingTransfer(false);
    if(error) return alert(`Could not submit transfer details: ${error.message}`);
    setPaymentRequest(null);
    alert("Payment details submitted. Admin will verify the transfer and activate your Trade Journal plan.");
    window.location.href="/dashboard";
  }

  if (loading) return <main className="min-h-screen bg-[#07111f] p-8 text-white">Loading Trade Journal…</main>;

  const effectivePlan = journalAccess?.plan === "pro" ? "pro" : "free";

  if (journalAccess?.allowed && !forceCheckout) {
    return <TradeJournalWorkspace plan={effectivePlan} />;
  }

  return (
    <main
      id="trade-journal-checkout"
      className="fth-trade-journal fth-unified-board min-h-screen text-white"
    >
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* MOCKUP #2 SIDEBAR */}
        <aside className="fth-app-sidebar border-b border-slate-800 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex min-h-screen flex-col p-5">
            <a
              href="/dashboard"
              className="fth-sidebar-brand flex min-h-14 items-center"
              aria-label="Fidelity Traders Hub"
            >
              <div className="text-lg font-black tracking-tight">
                FIDELITY
              </div>
            </a>

            <nav className="mt-8 space-y-1.5 text-sm">
              <a href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">⌂</span>
                Dashboard
              </a>
              <a href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">▦</span>
                Marketplace
              </a>
              <a href="/pay-small-small" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">◔</span>
                Pay Small Small
              </a>
              <a href="/trade-journal" className="fth-nav-active flex items-center gap-3 rounded-xl px-4 py-3 font-bold">
                <span aria-hidden="true">▤</span>
                Trade Journal
              </a>
            </nav>

            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">
                  Journal plans
                </p>
                <p className="mt-2 text-sm font-black">
                  Free + Pro
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="fth-topbar sticky top-0 z-30 border-b border-slate-800 px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                  Fidelity Trade Journal
                </p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  Plans & Checkout
                </h1>
              </div>

              <a
                href="/marketplace"
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold"
              >
                Back to Marketplace
              </a>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-5 sm:p-8">
            {/* HERO */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-3xl">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                    Trading operating system
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                    Track. Review. Improve. Repeat.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    Start free, then move to Pro for multiple accounts, chart evidence,
                    deeper analytics and longer subscription options.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 lg:min-w-[300px]">
                  <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">
                    Secure checkout
                  </p>
                  <p className="mt-2 text-sm font-black">
                    Server-verified pricing
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Supabase confirms your final amount and Fidelity bank details.
                  </p>
                </div>
              </div>
            </section>

            {forceCheckout && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-300">
                {checkoutMethod === "pay_small_small"
                  ? "You selected Pay Small Small for Journal Pro. Choose your duration, then continue to your Pay Small Small workspace."
                  : "You selected Journal Pro from Marketplace. Choose your duration and complete checkout below."}
              </div>
            )}

            {/* FREE + PRO */}
            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400">
                      Free
                    </span>
                    <h2 className="mt-4 text-2xl font-black">
                      Trade Journal Free
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      The core plan → log → review workflow for traders building consistency.
                    </p>
                  </div>

                  <p className="text-3xl font-black">₦0</p>
                </div>

                <ul className="mt-6 grid gap-3 text-sm">
                  {FREE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 text-emerald-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-400">
                  No payment is required. Free access follows your existing Journal access rules.
                </div>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-400">
                      Pro
                    </span>
                    <h2 className="mt-4 text-2xl font-black">
                      Trade Journal Pro
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      For traders who want deeper evidence, more capacity and chart-based review.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      From
                    </p>
                    <p className="mt-1 text-2xl font-black text-blue-400">
                      {plans[0]
                        ? money(plans[0].currency, plans[0].price)
                        : "Marketplace price"}
                    </p>
                    <p className="text-xs text-slate-500">
                      per month
                    </p>
                  </div>
                </div>

                <ul className="mt-6 grid gap-3 text-sm">
                  {PRO_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 text-blue-400">★</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-5 text-slate-400">
                  Pro pricing is loaded from the active Journal Marketplace plan below.
                </div>
              </article>
            </section>

            {plans.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900 p-7 text-slate-400">
                No Trade Journal Pro plan is active yet. Admin must add the real plan and price first.
              </div>
            ) : (
              <section className="mt-5 grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
                {/* SELECTED PRODUCT */}
                <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                      Selected product
                    </p>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase text-blue-400">
                      Pro
                    </span>
                  </div>

                  {selected && (
                    <>
                      <div className="mt-6 flex h-44 items-center justify-center rounded-3xl border border-slate-800 bg-slate-950">
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                            ▤
                          </div>
                          <p className="mt-4 text-sm font-black text-blue-400">
                            Analytics · Journal · Risk
                          </p>
                        </div>
                      </div>

                      <p className="mt-6 text-xs font-black uppercase tracking-wider text-blue-400">
                        {selected.billing_period}
                      </p>

                      <h3 className="mt-2 text-2xl font-black">
                        {selected.name}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {selected.description || "Professional trading journal access."}
                      </p>

                      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Starting from
                        </p>
                        <p className="mt-2 text-3xl font-black">
                          {money(selected.currency, selected.price)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          per month
                        </p>
                      </div>
                    </>
                  )}
                </article>

                {/* CHECKOUT */}
                {selected && (
                  <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                        Secure checkout
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        Checkout summary
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose your duration and review the exact amount before payment.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.62fr]">
                      <div className="space-y-5">
                        <label className="block text-sm text-slate-300">
                          Delivery email
                          <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                          />
                        </label>

                        {selected.billing_period === "monthly" && (
                          <label className="block text-sm text-slate-300">
                            Number of months
                            <select
                              value={months}
                              onChange={(e) => setMonths(Number(e.target.value))}
                              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((value) => {
                                const discount =
                                  value >= 12
                                    ? 10
                                    : value >= 7
                                      ? 8
                                      : value >= 4
                                        ? 5
                                        : value >= 2
                                          ? 3
                                          : 0;

                                return (
                                  <option key={value} value={value}>
                                    {value} month{value > 1 ? "s" : ""}
                                    {discount ? ` — save ${discount}%` : ""}
                                  </option>
                                );
                              })}
                            </select>

                            {bundleDiscountPercent > 0 && (
                              <span className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-400">
                                {bundleDiscountPercent}% multi-month discount applied
                              </span>
                            )}
                          </label>
                        )}

                        <div>
                          <label className="block text-sm text-slate-300">
                            Discount or referral code{" "}
                            <span className="text-slate-500">(optional)</span>
                          </label>

                          <div className="mt-2 flex gap-2">
                            <input
                              value={code}
                              onChange={(e) => setCode(e.target.value.toUpperCase())}
                              placeholder="Enter code"
                              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 uppercase"
                            />
                            <button
                              onClick={applyCode}
                              disabled={!code.trim() || checking}
                              className="fth-primary-button rounded-xl px-5 font-black disabled:opacity-40"
                            >
                              {checking ? "Checking…" : "Apply"}
                            </button>
                          </div>

                          {preview && (
                            <p
                              className={`mt-3 text-sm ${
                                preview.valid
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {preview.valid
                                ? preview.code_type === "discount"
                                  ? `Promo discount applied: ${money(
                                      selected.currency,
                                      Number(preview.discount_amount)
                                    )}`
                                  : `Referral applied${
                                      preview.partner_name
                                        ? ` for ${preview.partner_name}`
                                        : ""
                                    }. Price is unchanged.`
                                : preview.message}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-400">
                              <span>Monthly price</span>
                              <span>{money(selected.currency, selected.price)}</span>
                            </div>

                            <div className="flex justify-between text-slate-400">
                              <span>Duration</span>
                              <span>
                                {months} month{months > 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="flex justify-between text-slate-400">
                              <span>Subtotal</span>
                              <span>{money(selected.currency, multiMonthGross)}</span>
                            </div>

                            {bundleDiscountAmount > 0 && (
                              <div className="flex justify-between text-emerald-400">
                                <span>
                                  Multi-month discount ({bundleDiscountPercent}%)
                                </span>
                                <span>
                                  − {money(selected.currency, bundleDiscountAmount)}
                                </span>
                              </div>
                            )}

                            {preview?.code_type === "discount" && (
                              <div className="flex justify-between text-emerald-400">
                                <span>Promo discount</span>
                                <span>
                                  −{" "}
                                  {money(
                                    selected.currency,
                                    Number(preview.discount_amount)
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-5">
                            <span className="text-lg font-black">
                              Total amount due
                            </span>
                            <span className="text-2xl font-black text-blue-400">
                              {money(selected.currency, payable)}
                            </span>
                          </div>
                        </div>

                        {checkoutMethod === "pay_small_small" ? (
                          <button
                            type="button"
                            onClick={startJournalPaySmallSmall}
                            disabled={startingSavings}
                            className="fth-primary-button w-full rounded-xl px-5 py-3.5 font-black disabled:opacity-50"
                          >
                            {startingSavings
                              ? "Creating savings plan…"
                              : "Continue with Pay Small Small"}
                          </button>
                        ) : (
                          <button
                            onClick={checkout}
                            disabled={submitting}
                            className="fth-primary-button w-full rounded-xl px-5 py-3.5 font-black disabled:opacity-50"
                          >
                            {submitting
                              ? "Creating checkout…"
                              : "Continue to payment"}
                          </button>
                        )}

                        <p className="text-xs leading-5 text-slate-500">
                          Final pricing is verified on the server before the payment request is created.
                        </p>
                      </div>

                      <aside className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <p className="text-sm font-black">
                          More months, more savings
                        </p>

                        <div className="mt-4 space-y-3 text-xs">
                          {[
                            ["1 month", "—"],
                            ["2–3 months", "3%"],
                            ["4–6 months", "5%"],
                            ["7–11 months", "8%"],
                            ["12 months", "10%"],
                          ].map(([duration, discount]) => (
                            <div
                              key={duration}
                              className="flex justify-between border-b border-slate-800 pb-2"
                            >
                              <span className="text-slate-400">{duration}</span>
                              <span
                                className={
                                  discount === "—"
                                    ? "text-slate-500"
                                    : "font-black text-emerald-400"
                                }
                              >
                                {discount}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 space-y-4">
                          {[
                            ["Secure payment", "Unique Fidelity payment reference and bank details."],
                            ["Correct access duration", "The exact number of purchased months is recorded."],
                            ["Promo codes still work", "Eligible promo discounts apply after the automatic multi-month saving."],
                          ].map(([title, helper]) => (
                            <div key={title} className="flex gap-3">
                              <span className="text-emerald-400">✓</span>
                              <div>
                                <p className="text-xs font-black">{title}</p>
                                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                                  {helper}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </aside>
                    </div>
                  </article>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* BANK TRANSFER */}
      {paymentRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
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
              {[
                ["Exact Amount", money(paymentRequest.currency, paymentRequest.amount)],
                ["Your FTH Reference", paymentRequest.reference],
                ["Bank", paymentRequest.bankName],
                ["Account Number", paymentRequest.accountNumber],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-[.10em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 break-all font-black">{value}</p>
                </div>
              ))}

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.10em] text-slate-500">
                  Account Name
                </p>
                <p className="mt-2 font-black">
                  {paymentRequest.accountName}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="font-black">After making the transfer</p>
              <p className="mt-1 text-sm text-slate-400">
                Enter the name and bank used to make the transfer.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Sender account name *"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <input
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  placeholder="Sender bank *"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <button
                type="button"
                onClick={submitTransferDetails}
                disabled={submittingTransfer}
                className="fth-primary-button mt-4 w-full rounded-xl px-5 py-3 font-black disabled:opacity-50"
              >
                {submittingTransfer
                  ? "Submitting…"
                  : "I Have Paid — Submit for Verification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

}
