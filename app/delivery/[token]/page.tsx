"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BrandLogo from "../../BrandLogo";

export default function OfflineDeliveryPage() {
  const params = useParams<{ token: string }>();
  const token = String(params?.token || "");
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDelivery() {
      if (!token) {
        setErrorMessage("This delivery link is invalid.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_offline_delivery_by_token", {
        p_token: token,
      });

      if (!active) return;

      if (error) {
        console.error("Could not load delivery:", error);
        setErrorMessage("We could not open this delivery link.");
        setLoading(false);
        return;
      }

      const row = Array.isArray(data) ? data[0] : data;

      if (!row) {
        setErrorMessage(
          "This delivery link is invalid, disabled, or no longer available."
        );
        setLoading(false);
        return;
      }

      setDelivery(row);
      setLoading(false);
    }

    loadDelivery();
    return () => {
      active = false;
    };
  }, [token]);

  const productLabel =
    delivery?.plan_name ||
    delivery?.product_name ||
    delivery?.prop_firm ||
    String(delivery?.product_type || "Fidelity Traders Hub service").replaceAll("_", " ");

  const daysRemaining = delivery?.expires_at
    ? Math.ceil(
        (new Date(delivery.expires_at).getTime() - Date.now()) / 86400000
      )
    : null;

  return (
    <main className="min-h-screen bg-[#050a08] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[#202d35] bg-[#0b1216] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-5 border-b border-[#202d35] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <BrandLogo className="w-[190px]" />
            <div className="sm:text-right">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#c8ff00]">
                Private Delivery
              </p>
              <p className="mt-1 text-sm text-slate-300">
                fidelitytradershub.com
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <p className="text-lg font-bold">Opening your delivery…</p>
              <p className="mt-2 text-sm text-slate-400">
                Please wait a moment.
              </p>
            </div>
          ) : errorMessage ? (
            <div className="py-20 text-center">
              <div className="mx-auto max-w-lg rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                <p className="text-xl font-black text-red-300">
                  Delivery unavailable
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {errorMessage}
                </p>
                <p className="mt-4 text-sm text-slate-400">
                  Contact Fidelity Traders Hub on WhatsApp if you need a new link.
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-7">
              <p className="text-sm text-slate-400">Hello</p>
              <h1 className="mt-1 text-3xl font-black">
                {delivery.customer_name || "Fidelity Traders Hub customer"}
              </h1>
              <p className="mt-3 leading-7 text-slate-300">
                Your delivery is ready. Keep this page and its login details private.
              </p>

              <div className="mt-7 rounded-2xl border border-[#c8ff00]/25 bg-[#c8ff00]/5 p-5">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#c8ff00]">
                  Product
                </p>
                <h2 className="mt-2 text-2xl font-black">{productLabel}</h2>
                {(delivery.account_size || delivery.phase) && (
                  <p className="mt-2 text-sm text-slate-300">
                    {[delivery.account_size, delivery.phase].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              {(delivery.product_type === "tradingview" || delivery.delivery_method === "credentials") && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#202d35] bg-[#081015] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Login / Username</p>
                    <p className="mt-2 break-all text-lg font-black">{delivery.delivery_username || "Not required"}</p>
                  </div>
                  <div className="rounded-2xl border border-[#202d35] bg-[#081015] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Password / Access Code</p>
                    <p className="mt-2 break-all text-lg font-black">{delivery.delivery_password || "Not required"}</p>
                  </div>
                </div>
              )}

              {delivery.product_type === "prop_firm" && delivery.delivery_method === "claim_code" && (
                <div className="mt-5 rounded-2xl border border-[#c8ff00]/30 bg-[#c8ff00]/5 p-5">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#c8ff00]">Claim Code</p>
                  <p className="mt-3 break-all text-3xl font-black">{delivery.claim_code || "Contact support"}</p>
                  {delivery.claim_url && <p className="mt-3 break-all text-sm text-slate-300">Claim link: {delivery.claim_url}</p>}
                </div>
              )}

              {delivery.product_type === "prop_firm" && delivery.delivery_method === "check_email" && (
                <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                  <p className="font-black text-blue-200">Check your registered email</p>
                  <p className="mt-2 leading-7 text-slate-300">Your prop firm account details were sent to the email address used for registration. Check your Inbox, Spam and Junk folders.</p>
                </div>
              )}

              {delivery.product_type === "prop_firm" && delivery.delivery_method === "whatsapp_instruction" && (
                <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="font-black text-emerald-200">WhatsApp delivery</p>
                  <p className="mt-2 leading-7 text-slate-300">Follow the WhatsApp instructions sent to you by Fidelity Traders Hub.</p>
                </div>
              )}

              {delivery.delivery_message && (
                <div className="mt-5 rounded-2xl border border-[#202d35] bg-[#081015] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Instructions
                  </p>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-200">
                    {delivery.delivery_message}
                  </p>
                </div>
              )}

              {(delivery.started_at || delivery.expires_at) && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#202d35] bg-[#081015] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Start date
                    </p>
                    <p className="mt-2 font-bold">
                      {delivery.started_at
                        ? new Date(delivery.started_at).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#202d35] bg-[#081015] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Expiry
                    </p>
                    <p className="mt-2 font-bold">
                      {delivery.expires_at
                        ? new Date(delivery.expires_at).toLocaleDateString()
                        : "Not set"}
                    </p>
                    {typeof daysRemaining === "number" && (
                      <p
                        className={`mt-2 text-sm font-bold ${
                          daysRemaining < 0
                            ? "text-red-300"
                            : daysRemaining <= 7
                              ? "text-amber-300"
                              : "text-[#c8ff00]"
                        }`}
                      >
                        {daysRemaining < 0
                          ? "Expired"
                          : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-6 text-slate-300">
                <strong className="text-amber-300">Security:</strong> Do not share this
                private link, login or password publicly. Fidelity Traders Hub will never
                ask you to post these credentials on social media.
              </div>

              <div className="mt-7 border-t border-[#202d35] pt-6 text-center">
                <p className="font-black">Fidelity Traders Hub</p>
                <p className="mt-1 text-sm text-slate-400">
                  Where Traders Meet Possibilities
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
