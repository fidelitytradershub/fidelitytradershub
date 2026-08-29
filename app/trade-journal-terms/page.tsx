"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  billing_period: string;
  price: number;
  currency: string;
};

type Preview = {
  valid: boolean;
  code_type?: "none" | "discount" | "referral";
  gross_amount?: number;
  discount_amount?: number;
  net_amount?: number;
  message?: string;
  partner_name?: string;
};

const money = (currency: string, value: number) =>
  `${currency} ${Number(value || 0).toLocaleString()}`;

export default function TradeJournalPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPage() {
      const [{ data: auth }, { data, error }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("trade_journal_plans")
          .select(
            "id,name,description,billing_period,price,currency"
          )
          .eq("active", true)
          .is("archived_at", null)
          .order("sort_order"),
      ]);

      if (error) {
        alert(`Could not load plans: ${error.message}`);
      }

      const rows = (data ?? []) as Plan[];

      setPlans(rows);
      setSelected(rows[0] ?? null);
      setEmail(auth.user?.email ?? "");
      setLoading(false);
    }

    void loadPage();
  }, []);

  useEffect(() => {
    setPreview(null);
  }, [selected?.id, code]);

  const payable = useMemo(
    () =>
      preview?.valid
        ? Number(preview.net_amount)
        : Number(selected?.price || 0),
    [preview, selected]
  );

  async function applyCode() {
    if (!selected || !code.trim()) return;

    setChecking(true);

    const { data, error } = await supabase.rpc(
      "preview_checkout_code",
      {
        p_code: code.trim(),
        p_product_type: "trade_journal",
        p_gross_amount: selected.price,
      }
    );

    setChecking(false);

    if (error) {
      alert(error.message);
      return;
    }

    setPreview(data as Preview);
  }

  async function checkout() {
    if (!selected) return;

    if (!email.trim()) {
      alert("Enter your delivery email.");
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.rpc(
      "start_trade_journal_checkout",
      {
        p_plan_id: selected.id,
        p_purchase_email: email.trim(),
        p_code: code.trim() || null,
      }
    );

    setSubmitting(false);

    if (error) {
      alert(`Could not start checkout: ${error.message}`);
      return;
    }

    alert(
      `Checkout created successfully. Amount due: ${money(
        data.currency,
        data.total_price
      )}.`
    );

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#7ea6ff]">
          Fidelity Trade Journal
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">
          Build discipline. Review every trade. Improve with evidence.
        </h1>

        <p className="mt-4 max-w-2xl text-[#9fb0c5]">
          Choose a plan, apply an eligible discount or referral code,
          and complete a secure checkout.
        </p>

        {loading ? (
          <p className="mt-10 text-[#9fb0c5]">Loading plans…</p>
        ) : plans.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#28374b] bg-[#111c2e] p-6">
            No Trade Journal plan is active yet. Admin must add the real
            plan and price first.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <section className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelected(plan)}
                  className={`rounded-2xl border p-6 text-left transition ${
                    selected?.id === plan.id
                      ? "border-[#5a72ea] bg-[#162440]"
                      : "border-[#28374b] bg-[#111c2e]"
                  }`}
                >
                  <p className="text-sm text-[#7ea6ff]">
                    {plan.billing_period}
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {plan.name}
                  </h2>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-[#9fb0c5]">
                    {plan.description ||
                      "Professional trading journal access."}
                  </p>

                  <p className="mt-5 text-2xl font-bold">
                    {money(plan.currency, plan.price)}
                  </p>
                </button>
              ))}
            </section>

            {selected && (
              <section className="rounded-2xl border border-[#28374b] bg-[#111c2e] p-6">
                <h2 className="text-xl font-bold">
                  Checkout summary
                </h2>

                <label className="mt-5 block text-sm text-[#9fb0c5]">
                  Delivery email

                  <input
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    type="email"
                    className="mt-2 w-full rounded-xl border border-[#34455d] bg-[#0b1626] px-4 py-3 text-white outline-none focus:border-[#5a72ea]"
                  />
                </label>

                <label className="mt-4 block text-sm text-[#9fb0c5]">
                  Discount or referral code
                </label>

                <div className="mt-2 flex gap-2">
                  <input
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-xl border border-[#34455d] bg-[#0b1626] px-4 py-3 uppercase text-white outline-none focus:border-[#5a72ea]"
                  />

                  <button
                    type="button"
                    onClick={applyCode}
                    disabled={!code.trim() || checking}
                    className="rounded-xl border border-[#5a72ea] px-4 font-semibold text-[#9bb2ff] disabled:opacity-40"
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
                        ? `Discount applied: ${money(
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

                <div className="mt-6 space-y-3 border-t border-[#28374b] pt-5 text-sm">
                  <div className="flex justify-between text-[#9fb0c5]">
                    <span>Plan price</span>

                    <span>
                      {money(
                        selected.currency,
                        selected.price
                      )}
                    </span>
                  </div>

                  {preview?.code_type === "discount" && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount</span>

                      <span>
                        −{" "}
                        {money(
                          selected.currency,
                          Number(preview.discount_amount)
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold">
                    <span>Amount due</span>

                    <span>
                      {money(selected.currency, payable)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkout}
                  disabled={submitting}
                  className="mt-6 w-full rounded-xl bg-[#5a72ea] px-5 py-3 font-bold hover:bg-[#6b82f3] disabled:opacity-50"
                >
                  {submitting
                    ? "Creating checkout…"
                    : "Continue to payment"}
                </button>

                <p className="mt-3 text-xs leading-5 text-[#7890ab]">
                  Final pricing is verified on the server. Outside
                  prop-firm requests do not earn referral commission.
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}