"use client";
import BrandLogo from "../BrandLogo";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type PropOffer = {
  id: string;
  account_size: number;
  price: number;
  currency: string;
  description: string | null;
  features: string[] | null;
  stock_quantity: number;
  allow_buy_now: boolean;
  allow_pay_small_small: boolean;
  active: boolean;
  prop_programs: any;
};

type OfferDetails = {
  name: string;
  prop_firm: string;
  phase: string;
};

type PaymentRequest = {
  depositId: string;
  amount: number;
  reference: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  productLabel: string;
  returnPath: string;
};

type TradingViewPlan = {
  id: string;
  name: string;
  tier: string;
  access_type: string;
  duration_days: number;
  price: number;
  currency: string;
  description: string | null;
  features: string[] | null;
  allow_buy_now: boolean;
  allow_pay_small_small: boolean;
  active: boolean;
};

type TradeJournalPlan = {
  id: string;
  name: string;
  description: string | null;
  billing_period: string;
  price: number;
  currency: string;
};

type CheckoutPreview = {
  valid: boolean;
  code_type?: "none" | "discount" | "referral";
  gross_amount?: number;
  discount_amount?: number;
  net_amount?: number;
  message?: string;
  partner_name?: string;
};


export default function MarketplacePage() {
  const [products, setProducts] = useState<PropOffer[]>([]);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [startingSavingsId, setStartingSavingsId] = useState<string | null>(null);

  // Outside prop-firm request
  const [outsidePropFirms, setOutsidePropFirms] = useState<any[]>([]);
  const [outsidePropFirmId, setOutsidePropFirmId] = useState("");
  const [outsideManualPropFirm, setOutsideManualPropFirm] = useState("");
  const [outsideAccountSize, setOutsideAccountSize] = useState("");
  const [outsidePhase, setOutsidePhase] = useState("");
  const [outsideAccountPrice, setOutsideAccountPrice] = useState("");
  const [outsidePurchaseEmail, setOutsidePurchaseEmail] = useState("");
  const [outsidePortalPassword, setOutsidePortalPassword] = useState("");
  const [outsideNotes, setOutsideNotes] = useState("");
  const [submittingOutsideRequest, setSubmittingOutsideRequest] = useState(false);

  // TradingView plans
  const [tradingViewPlans, setTradingViewPlans] = useState<TradingViewPlan[]>([]);
  const [tradingViewEmail, setTradingViewEmail] = useState("");
  const [processingTradingViewPlanId, setProcessingTradingViewPlanId] =
    useState<string | null>(null);

  // Trade Journal plans
  const [tradeJournalPlans, setTradeJournalPlans] = useState<TradeJournalPlan[]>([]);

  // Universal Marketplace discount / referral codes
  const [propCodes, setPropCodes] = useState<Record<string, string>>({});
  const [propPreviews, setPropPreviews] = useState<Record<string, CheckoutPreview | null>>({});
  const [checkingPropCodeId, setCheckingPropCodeId] = useState<string | null>(null);

  const [tradingViewCodes, setTradingViewCodes] = useState<Record<string, string>>({});
  const [tradingViewPreviews, setTradingViewPreviews] = useState<Record<string, CheckoutPreview | null>>({});
  const [checkingTradingViewCodeId, setCheckingTradingViewCodeId] = useState<string | null>(null);

  // Direct bank payment
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderBank, setSenderBank] = useState("");
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  useEffect(() => {
    async function loadMarketplace() {
      try {
        // -----------------------------------------
        // CURRENT USER
        // -----------------------------------------

        const { data: sessionData } =
          await supabase.auth.getSession();

        const currentUser =
          sessionData.session?.user ?? null;

        setUser(currentUser);
        setOutsidePurchaseEmail(currentUser?.email ?? "");
        setTradingViewEmail(currentUser?.email ?? "");

        if (currentUser) {
          // -----------------------------------------
          // PROFILE / ROLE
          // -----------------------------------------

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .maybeSingle();

          setRole(profile?.role ?? null);

        }

        // -----------------------------------------
        // ACTIVE PROP OFFERS
        // -----------------------------------------

        const { data, error } = await supabase
          .from("prop_offers")
          .select(
            `
              id,
              account_size,
              price,
              currency,
              description,
              features,
              stock_quantity,
              allow_buy_now,
              allow_pay_small_small,
              active,
              created_at,
              prop_programs!prop_offers_program_id_fkey (
                name,
                phase,
                native_currency,
                prop_firms!prop_programs_firm_id_fkey (
                  name
                )
              )
            `
          )
          .eq("active", true)
          .is("archived_at", null)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error(
            "Marketplace error:",
            error
          );

          setErrorMessage(error.message);
          return;
        }

        setProducts((data ?? []) as unknown as PropOffer[]);

        const { data: firmsData, error: firmsError } = await supabase
          .from("prop_firms")
          .select("id, name, registration_url, registration_link_label")
          .eq("active", true)
          .is("archived_at", null)
          .order("name", { ascending: true });

        if (firmsError) {
          console.error("Prop firm directory error:", firmsError);
        } else {
          setOutsidePropFirms(firmsData ?? []);
        }

        const { data: plansData, error: plansError } = await supabase
          .from("tradingview_plans")
          .select(
            "id, name, tier, access_type, duration_days, price, currency, description, features, allow_buy_now, allow_pay_small_small, active"
          )
          .eq("active", true)
          .order("price", { ascending: false });

        if (plansError) {
          console.warn("TradingView plans could not load:", plansError.message);
        } else {
          setTradingViewPlans((plansData ?? []) as TradingViewPlan[]);
        }

        const { data: journalPlansData, error: journalPlansError } = await supabase
          .from("trade_journal_plans")
          .select("id, name, description, billing_period, price, currency")
          .eq("active", true)
          .is("archived_at", null)
          .order("sort_order");

        if (journalPlansError) {
          console.warn("Trade Journal plans could not load:", journalPlansError.message);
        } else {
          setTradeJournalPlans((journalPlansData ?? []) as TradeJournalPlan[]);
        }
      } catch (error) {
        console.error(
          "Marketplace loading error:",
          error
        );

        setErrorMessage(
          "Something went wrong while loading the marketplace."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMarketplace();
  }, []);

  function getOfferDetails(offer: PropOffer): OfferDetails {
    const program = Array.isArray(offer.prop_programs)
      ? offer.prop_programs[0]
      : offer.prop_programs;
    const firm = Array.isArray(program?.prop_firms)
      ? program.prop_firms[0]
      : program?.prop_firms;

    return {
      name: program?.name || "Prop Account",
      prop_firm: firm?.name || "Prop Firm",
      phase: program?.phase || "Not specified",
    };
  }

  function formatProductPrice(product: PropOffer) {
    const currency =
      product.currency?.toUpperCase() || "NGN";

    if (currency === "NGN") {
      return `\u20A6${Number(
        product.price
      ).toLocaleString()}`;
    }

    return `${currency} ${Number(
      product.price
    ).toLocaleString()}`;
  }


  function money(currency: string, amount: number) {
    const normalized = (currency || "NGN").toUpperCase();
    return normalized === "NGN"
      ? `\u20A6${Number(amount || 0).toLocaleString()}`
      : `${normalized} ${Number(amount || 0).toLocaleString()}`;
  }

  function getNetAmount(basePrice: number, preview?: CheckoutPreview | null) {
    return preview?.valid
      ? Number(preview.net_amount ?? basePrice)
      : Number(basePrice);
  }

  async function previewMarketplaceCode(
    productType: "prop_firm" | "tradingview",
    grossAmount: number,
    code: string
  ) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      return {
        valid: true,
        code_type: "none",
        gross_amount: grossAmount,
        discount_amount: 0,
        net_amount: grossAmount,
      } as CheckoutPreview;
    }

    const { data, error } = await supabase.rpc("preview_checkout_code", {
      p_code: normalizedCode,
      p_product_type: productType,
      p_gross_amount: grossAmount,
    });

    if (error) throw error;
    return data as CheckoutPreview;
  }

  async function applyPropCode(product: PropOffer) {
    if (!user) {
      alert("Please sign in before applying a discount or referral code.");
      window.location.href = "/logins";
      return;
    }

    const code = (propCodes[product.id] || "").trim();
    if (!code) return;

    setCheckingPropCodeId(product.id);
    try {
      const preview = await previewMarketplaceCode("prop_firm", Number(product.price), code);
      setPropPreviews((current) => ({ ...current, [product.id]: preview }));
    } catch (error: any) {
      alert(`Could not check code: ${error.message}`);
    } finally {
      setCheckingPropCodeId(null);
    }
  }

  async function applyTradingViewCode(plan: TradingViewPlan) {
    if (!user) {
      alert("Please sign in before applying a discount or referral code.");
      window.location.href = "/logins";
      return;
    }

    const code = (tradingViewCodes[plan.id] || "").trim();
    if (!code) return;

    setCheckingTradingViewCodeId(plan.id);
    try {
      const preview = await previewMarketplaceCode("tradingview", Number(plan.price), code);
      setTradingViewPreviews((current) => ({ ...current, [plan.id]: preview }));
    } catch (error: any) {
      alert(`Could not check code: ${error.message}`);
    } finally {
      setCheckingTradingViewCodeId(null);
    }
  }

  function normalizePaymentRequest(
    data: any,
    productLabel: string,
    returnPath: string
  ): PaymentRequest {
    const account = data?.payment_account || data?.bank_account || data || {};

    return {
      depositId: String(data?.deposit_id || data?.payment_request_id || ""),
      amount: Number(data?.amount || data?.payment_amount || 0),
      reference: String(data?.reference || data?.payment_reference || ""),
      bankName: String(account?.bank_name || data?.bank_name || ""),
      accountName: String(account?.account_name || data?.account_name || ""),
      accountNumber: String(account?.account_number || data?.account_number || ""),
      instructions: String(
        account?.payment_instructions || data?.payment_instructions || ""
      ),
      productLabel,
      returnPath,
    };
  }

  async function createDirectPayment(
    purpose:
      | "prop_buy_now"
      | "prop_savings_contribution"
      | "outside_prop_buy_now"
      | "outside_prop_savings_contribution"
      | "tradingview_buy_now"
      | "tradingview_savings_contribution",
    productLabel: string,
    links: {
      amount?: number | null;
      propOfferId?: string | null;
      outsideRequestId?: string | null;
      tradingViewPurchaseId?: string | null;
      savingsGoalId?: number | null;
    }
  ) {
    const { data, error } = await supabase.rpc(
      "create_product_payment_request",
      {
        p_payment_purpose: purpose,
        p_amount: links.amount ?? null,
        p_prop_offer_id: links.propOfferId ?? null,
        p_outside_request_id: links.outsideRequestId ?? null,
        p_tradingview_purchase_id: links.tradingViewPurchaseId ?? null,
        p_savings_goal_id: links.savingsGoalId ?? null,
      }
    );

    let paymentData = data;

    if (error) {
      const duplicatePayment = error.message
        .toLowerCase()
        .includes("payment awaiting submission or verification");

      if (!duplicatePayment) throw error;

      const { data: resumedData, error: resumeError } = await supabase.rpc(
        "resume_product_payment_request",
        {
          p_payment_purpose: purpose,
          p_prop_offer_id: links.propOfferId ?? null,
          p_outside_request_id: links.outsideRequestId ?? null,
          p_tradingview_purchase_id:
            links.tradingViewPurchaseId ?? null,
          p_savings_goal_id: links.savingsGoalId ?? null,
        }
      );

      if (resumeError) throw resumeError;
      paymentData = resumedData;
    }

    const normalized = normalizePaymentRequest(
      paymentData,
      productLabel,
      purpose.includes("savings_contribution")
        ? "/pay-small-small"
        : "/dashboard"
    );

    if (
      !normalized.depositId ||
      !normalized.reference ||
      !normalized.accountNumber
    ) {
      throw new Error(
        "Payment request was created without complete bank details. Please contact Admin."
      );
    }

    setSenderName("");
    setSenderBank("");
    setPaymentRequest(normalized);
  }

  async function buyAccount(
    product: PropOffer
  ) {
    if (!user) {
      alert("Please sign in before purchasing an account.");
      window.location.href = "/logins";
      return;
    }

    if (role === "admin") {
      alert("Admin accounts cannot purchase marketplace products. Please use a client account.");
      return;
    }

    const details = getOfferDetails(product);
    const code = (propCodes[product.id] || "").trim().toUpperCase();
    const preview = propPreviews[product.id] ?? null;
    const payable = getNetAmount(Number(product.price), preview);

    const confirmed = window.confirm(
      `Buy ${details.prop_firm} ${details.name} for ${money(product.currency, payable)}${preview?.code_type === "discount" ? ` after discount` : ""}? Your unique payment reference and Fidelity Traders Hub bank details will be displayed next.`
    );

    if (!confirmed) return;
    setBuyingId(product.id);

    try {
      const { data, error } = await supabase.rpc("create_prop_payment_with_code", {
        p_prop_offer_id: product.id,
        p_code: code || null,
      });

      if (error) throw error;

      const normalized = normalizePaymentRequest(
        data,
        `${details.prop_firm} ${details.name}`,
        "/dashboard"
      );

      if (
        !normalized.depositId ||
        !normalized.reference ||
        !normalized.accountNumber
      ) {
        throw new Error(
          "Payment request was created without complete bank details. Please contact Admin."
        );
      }

      setSenderName("");
      setSenderBank("");
      setPaymentRequest(normalized);
    } catch (error: any) {
      console.error("Payment request error:", error);
      alert(`Could not create payment request: ${error.message}`);
    } finally {
      setBuyingId(null);
    }
  }

  async function startPaySmallSmall(product: PropOffer) {
    if (!user) {
      alert("Please sign in before starting Pay Small Small.");
      window.location.href = "/logins";
      return;
    }

    if (role === "admin") {
      alert("Admin accounts cannot start customer savings goals.");
      return;
    }

    const details = getOfferDetails(product);
    const code = (propCodes[product.id] || "").trim().toUpperCase();
    const preview = propPreviews[product.id] ?? null;
    const target = getNetAmount(Number(product.price), preview);

    const confirmed = window.confirm(
      `Start Pay Small Small for ${details.prop_firm} ${details.name} at ${money(product.currency, target)}${preview?.code_type === "discount" ? " after discount" : ""}?`
    );

    if (!confirmed) return;

    setStartingSavingsId(product.id);

    const { data, error } = await supabase.rpc(
      "start_prop_savings_goal_with_code",
      {
        p_offer_id: product.id,
        p_code: code || null,
      }
    );

    if (error) {
      console.error("Start Pay Small Small error:", error);
      alert(`Could not start Pay Small Small: ${error.message}`);
      setStartingSavingsId(null);
      return;
    }

    const goalId = Number(data?.goal_id || data?.savings_goal_id || 0);
    const serverTarget = Number(data?.target_amount ?? target);

    if (!goalId) {
      alert("The savings goal was created, but its ID was not returned. Open your Dashboard to continue.");
      setStartingSavingsId(null);
      window.location.href = "/pay-small-small";
      return;
    }

    const amountText = window.prompt(
      `Your Pay Small Small goal is ready. Enter the amount you want to pay now.\n\nTotal target: ${money(product.currency, serverTarget)}`
    );

    if (amountText === null) {
      setStartingSavingsId(null);
      window.location.href = "/pay-small-small";
      return;
    }

    const amount = Number(amountText.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0 || amount > serverTarget) {
      alert("Enter a valid payment amount that does not exceed the remaining target.");
      setStartingSavingsId(null);
      return;
    }

    try {
      await createDirectPayment(
        "prop_savings_contribution",
        `${details.prop_firm} ${details.name} \u2014 Pay Small Small`,
        { amount, savingsGoalId: goalId }
      );
    } catch (paymentError: any) {
      console.error("Savings payment request error:", paymentError);
      alert(`Goal created, but payment details could not open: ${paymentError.message}`);
    }

    setStartingSavingsId(null);
  }

  async function submitOutsidePropPurchase(
    purchaseMethod: "buy_now" | "pay_small_small"
  ) {
    if (!user) {
      alert("Please sign in before requesting an outside prop account.");
      window.location.href = "/logins";
      return;
    }

    const selectedFirm = outsidePropFirms.find(
      (firm) => firm.id === outsidePropFirmId
    );
    const selectedFirmName =
      outsidePropFirmId === "__other__"
        ? outsideManualPropFirm.trim()
        : selectedFirm?.name || "";
    const accountPrice = Number(outsideAccountPrice);
    const serviceFee = accountPrice * 0.05;
    const total = accountPrice + serviceFee;

    if (
      !selectedFirmName ||
      !outsideAccountSize.trim() ||
      !Number.isFinite(accountPrice) ||
      accountPrice <= 0 ||
      !outsidePurchaseEmail.trim()
    ) {
      alert("Complete the required outside-account fields.");
      return;
    }

    const label = purchaseMethod === "buy_now" ? "Buy Now" : "Pay Small Small";
    const confirmed = window.confirm(
      `${label}: account price NGN ${accountPrice.toLocaleString()}, 5% service fee NGN ${serviceFee.toLocaleString()}, total NGN ${total.toLocaleString()}. Continue?`
    );

    if (!confirmed) return;
    setSubmittingOutsideRequest(true);

    const { data, error } = await supabase.rpc("start_outside_prop_purchase", {
      p_prop_firm: selectedFirmName,
      p_account_size: outsideAccountSize.trim(),
      p_phase: outsidePhase.trim() || null,
      p_account_price: accountPrice,
      p_purchase_email: outsidePurchaseEmail.trim(),
      p_portal_password: outsidePortalPassword || null,
      p_purchase_method: purchaseMethod,
      p_notes: outsideNotes.trim() || null,
    });

    if (error) {
      console.error("Outside prop purchase error:", error);
      alert(`Could not continue: ${error.message}`);
      setSubmittingOutsideRequest(false);
      return;
    }

    const requestId = String(data?.request_id || data?.outside_request_id || "");
    const goalId = Number(data?.goal_id || data?.savings_goal_id || 0);

    try {
      if (purchaseMethod === "buy_now") {
        if (!requestId) throw new Error("Outside request ID was not returned.");
        await createDirectPayment(
          "outside_prop_buy_now",
          `${selectedFirmName} ${outsideAccountSize}`,
          { outsideRequestId: requestId }
        );
      } else {
        if (!goalId) throw new Error("Savings goal ID was not returned.");

        const amountText = window.prompt(
          `Your goal is ready. Enter the amount you want to pay now.\n\nTotal target: NGN ${total.toLocaleString()}`
        );

        if (amountText === null) {
          setSubmittingOutsideRequest(false);
          window.location.href = "/pay-small-small";
          return;
        }

        const amount = Number(amountText.replace(/,/g, ""));
        if (!Number.isFinite(amount) || amount <= 0 || amount > total) {
          throw new Error("Enter a valid payment amount within the savings target.");
        }

        await createDirectPayment(
          "outside_prop_savings_contribution",
          `${selectedFirmName} ${outsideAccountSize} \u2014 Pay Small Small`,
          { amount, savingsGoalId: goalId }
        );
      }
    } catch (paymentError: any) {
      console.error("Outside payment request error:", paymentError);
      alert(`Request created, but payment details could not open: ${paymentError.message}`);
    }

    setSubmittingOutsideRequest(false);
  }

  async function startTradingViewPurchase(
    plan: TradingViewPlan,
    purchaseMethod: "buy_now" | "pay_small_small"
  ) {
    if (!user) {
      alert("Please sign in before purchasing a TradingView plan.");
      window.location.href = "/logins";
      return;
    }

    if (role === "admin") {
      alert("Admin accounts cannot create customer purchases.");
      return;
    }

    if (!tradingViewEmail.trim()) {
      alert("Enter the email address to use for TradingView delivery.");
      return;
    }

    const code = (tradingViewCodes[plan.id] || "").trim().toUpperCase();
    const preview = tradingViewPreviews[plan.id] ?? null;
    const target = getNetAmount(Number(plan.price), preview);
    const methodLabel =
      purchaseMethod === "buy_now" ? "Buy Now" : "Pay Small Small";

    const confirmed = window.confirm(
      `${methodLabel}: ${plan.name} for ${money(plan.currency, target)}${preview?.code_type === "discount" ? " after discount" : ""}. Continue?`
    );

    if (!confirmed) return;
    setProcessingTradingViewPlanId(plan.id);

    const { data, error } = await supabase.rpc(
      "start_tradingview_purchase_with_code",
      {
        p_plan_id: plan.id,
        p_purchase_method: purchaseMethod,
        p_purchase_email: tradingViewEmail.trim(),
        p_code: code || null,
      }
    );

    if (error) {
      console.warn("TradingView purchase could not start:", error.message);
      alert(`Could not start TradingView purchase: ${error.message}`);
      setProcessingTradingViewPlanId(null);
      return;
    }

    try {
      if (purchaseMethod === "buy_now") {
        const purchaseId = String(data?.purchase_id || "");
        if (!purchaseId) throw new Error("TradingView purchase ID was not returned.");

        await createDirectPayment(
          "tradingview_buy_now",
          `TradingView ${plan.name}`,
          { tradingViewPurchaseId: purchaseId }
        );
      } else {
        const goalId = Number(data?.goal_id || data?.savings_goal_id || 0);
        const serverTarget = Number(data?.total_price ?? target);
        if (!goalId) throw new Error("TradingView savings goal ID was not returned.");

        const amountText = window.prompt(
          `Your TradingView goal is ready. Enter the amount you want to pay now.\n\nTotal target: ${money(plan.currency, serverTarget)}`
        );

        if (amountText === null) {
          setProcessingTradingViewPlanId(null);
          window.location.href = "/pay-small-small";
          return;
        }

        const amount = Number(amountText.replace(/,/g, ""));
        if (
          !Number.isFinite(amount) ||
          amount <= 0 ||
          amount > serverTarget
        ) {
          throw new Error("Enter a valid contribution within the plan price.");
        }

        await createDirectPayment(
          "tradingview_savings_contribution",
          `TradingView ${plan.name} \u2014 Pay Small Small`,
          { amount, savingsGoalId: goalId }
        );
      }
    } catch (paymentError: any) {
      console.warn("TradingView payment details could not open:", paymentError.message);
      alert(`Purchase created, but payment details could not open: ${paymentError.message}`);
    }

    setProcessingTradingViewPlanId(null);
  }

  async function submitTransferDetails() {
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
      console.warn("Transfer submission failed:", error.message);
      alert(`Could not submit transfer details: ${error.message}`);
      setSubmittingTransfer(false);
      return;
    }

    setSubmittingTransfer(false);
    const returnPath = paymentRequest.returnPath;
    setPaymentRequest(null);
    alert("Payment details submitted. Admin will verify the transfer and apply it to your purchase.");
    window.location.href = returnPath;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--surface-2)] p-8 text-[var(--foreground)]">
        Loading marketplace...
      </main>
    );
  }

  return (
    <main className="fth-marketplace fth-unified-board min-h-screen text-[var(--foreground)]">
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* APPROVED MOCKUP #2 SIDEBAR */}
        <aside className="fth-app-sidebar border-b border-[var(--border)] lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex min-h-screen flex-col p-5">
            <Link
              href="/dashboard"
              className="fth-sidebar-brand flex min-h-14 items-center"
              aria-label="Fidelity Traders Hub"
            >
              <BrandLogo priority />
            </Link>

            <nav className="mt-8 space-y-1.5 text-sm">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
                <span aria-hidden="true">&#8962;</span>
                Dashboard
              </Link>

              <Link href="/marketplace" className="fth-nav-active flex items-center gap-3 rounded-xl px-4 py-3 font-bold">
                <span aria-hidden="true">&#9638;</span>
                Marketplace
              </Link>

              <a href="#prop-accounts" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
                <span aria-hidden="true">&#9678;</span>
                Prop Accounts
              </a>

              <a href="#tradingview-plans" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
                <span aria-hidden="true">&#9707;</span>
                TradingView
              </a>

              <a href="#trade-journal" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
                <span aria-hidden="true">&#9636;</span>
                Fidelity Journal
              </a>

              <a href="#outside-prop" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
                <span aria-hidden="true">&#65291;</span>
                Outside Prop Firm
              </a>

              {user && role !== "admin" && (
                <Link href="/pay-small-small" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
                  <span aria-hidden="true">&#9684;</span>
                  Pay Small Small
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--muted-2)]">
                  {user ? "Signed in" : "Guest"}
                </p>
                <p className="mt-2 truncate text-sm font-black">
                  {user?.email || "Browse before signing in"}
                </p>
              </div>

              <Link
                href={user ? (role === "admin" ? "/admin" : "/dashboard") : "/logins"}
                className="fth-primary-button mt-3 flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-black"
              >
                {user ? (role === "admin" ? "Admin Dashboard" : "My Dashboard") : "Sign In"}
              </Link>
            </div>
          </div>
        </aside>

        {/* APPROVED MOCKUP #2 MARKETPLACE */}
        <div className="min-w-0">
          <header className="fth-topbar sticky top-0 z-30 border-b border-[var(--border)] px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">
                  Marketplace
                </p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  All Products
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {user && role !== "admin" && (
                  <Link
                    href="/pay-small-small"
                    className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold sm:inline-flex"
                  >
                    Pay Small Small
                  </Link>
                )}

                <Link
                  href={user ? (role === "admin" ? "/admin" : "/dashboard") : "/logins"}
                  className="fth-primary-button rounded-xl px-4 py-2.5 text-sm font-black"
                >
                  {user ? "My Account" : "Sign In"}
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-5 sm:p-8">
        {/* PAGE HEADING */}
        <section className="fth-marketplace-hero rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">
                Fidelity Traders Hub Marketplace
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Find the right trading product.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Buy Fidelity prop accounts, TradingView access and Journal Pro.
                If what you need is not in stock, request an outside prop account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--muted-2)]">Prop stock</p>
                <p className="mt-1 text-xl font-black">
                  {products.filter((product) => Number(product.stock_quantity) > 0).length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--muted-2)]">TradingView</p>
                <p className="mt-1 text-xl font-black">{tradingViewPlans.length}</p>
              </div>
            </div>
          </div>
        </section>

        <nav className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2">
          <a href="#prop-accounts" className="fth-nav-active rounded-xl px-4 py-2.5 text-sm font-black">
            Prop Firms
          </a>
          <a href="#tradingview-plans" className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--muted)]">
            TradingView
          </a>
          <a href="#trade-journal" className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--muted)]">
            Fidelity Journal
          </a>
          <a href="#outside-prop" className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--muted)]">
            Outside Prop Firm
          </a>
        </nav>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/40 p-5">
            <p className="font-semibold text-[var(--danger)]">
              Could not load marketplace products
            </p>

            <p className="mt-2 text-sm text-[var(--danger)]">
              {errorMessage}
            </p>
          </div>
        )}

        {/* EMPTY MARKETPLACE */}

        {!errorMessage &&
          products.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="text-[var(--muted)]">
                No trading accounts are currently available.
              </p>
            </div>
          )}

        {/* AVAILABLE PROP ACCOUNTS */}

        <div id="prop-accounts" className="mt-10 scroll-mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--warning)]">
              Product Category
            </p>
            <h2 className="mt-1 text-2xl font-bold">Available Prop Firms from Fidelity</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Admin-posted Fidelity Traders Hub stock. The displayed price is
              final and no additional 5% service fee applies.
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-[var(--success)]">
            {products.filter((product) => Number(product.stock_quantity) > 0).length}{" "}
            Available
          </span>
        </div>

        {/* PRODUCTS */}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const details = getOfferDetails(product);
            const features = Array.isArray(product.features)
              ? product.features
              : [];
            const isOutOfStock = Number(product.stock_quantity) <= 0;
            const isBusy =
              buyingId === product.id ||
              startingSavingsId === product.id;

            return (
              <div
                key={product.id}
                className="group flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--warning)]">
                    {details.prop_firm}
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {details.name}
                  </h2>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isOutOfStock
                      ? "bg-red-500/10 text-[var(--danger)]"
                      : "bg-emerald-500/10 text-[var(--success)]"
                  }`}
                >
                  {isOutOfStock ? "Out of stock" : "Available"}
                </span>
              </div>

              {product.description && (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {product.description}
                </p>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex justify-between border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--muted)]">
                    Account Size
                  </span>

                  <span className="font-semibold">
                    $ 
                    {Number(
                      product.account_size
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between border-b border-[var(--border)] pb-3">
                  <span className="text-[var(--muted)]">
                    Phase
                  </span>

                  <span className="font-semibold">
                    {details.phase}
                  </span>
                </div>

                <div className="flex justify-between pb-3">
                  <span className="text-[var(--muted)]">
                    Price
                  </span>

                  <span className="font-semibold text-[var(--warning)]">
                    {formatProductPrice(
                      product
                    )}
                  </span>
                </div>
              </div>

              {features.length > 0 && (
                <ul className="mt-4 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--foreground)]">
                  {features.slice(0, 6).map((feature) => (
                    <li key={feature}>{"\u2713"} {feature}</li>
                  ))}
                </ul>
              )}

              {user && role !== "admin" && !isOutOfStock && (
                <div className="mt-5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Discount or referral code
                  </label>

                  <div className="mt-2 flex gap-2">
                    <input
                      value={propCodes[product.id] || ""}
                      onChange={(event) => {
                        const value = event.target.value.toUpperCase();
                        setPropCodes((current) => ({
                          ...current,
                          [product.id]: value,
                        }));
                        setPropPreviews((current) => ({
                          ...current,
                          [product.id]: null,
                        }));
                      }}
                      placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 uppercase text-[var(--foreground)] placeholder:text-[var(--muted-2)]"
                    />

                    <button
                      type="button"
                      onClick={() => applyPropCode(product)}
                      disabled={
                        !String(propCodes[product.id] || "").trim() ||
                        checkingPropCodeId === product.id
                      }
                      className="rounded-xl border border-amber-400/40 px-4 py-2 text-sm font-semibold text-[var(--warning)] disabled:opacity-40"
                    >
                      {checkingPropCodeId === product.id
                        ? "Checking..."
                        : "Apply"}
                    </button>
                  </div>

                  {propPreviews[product.id] && (
                    <div className="mt-3 text-sm">
                      <p
                        className={
                          propPreviews[product.id]?.valid
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]"
                        }
                      >
                        {propPreviews[product.id]?.valid
                          ? propPreviews[product.id]?.code_type === "discount"
                            ? `Discount applied: ${money(
                                product.currency,
                                Number(
                                  propPreviews[product.id]?.discount_amount || 0
                                )
                              )}`
                            : propPreviews[product.id]?.code_type === "referral"
                              ? `Referral applied${
                                  propPreviews[product.id]?.partner_name
                                    ? ` for ${propPreviews[product.id]?.partner_name}`
                                    : ""
                                }. Price is unchanged.`
                              : "Code cleared."
                          : propPreviews[product.id]?.message}
                      </p>

                      {propPreviews[product.id]?.valid &&
                        propPreviews[product.id]?.code_type === "discount" && (
                          <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-2">
                            <span className="text-[var(--muted)]">Amount due</span>
                            <strong className="text-[var(--warning)]">
                              {money(
                                product.currency,
                                getNetAmount(
                                  Number(product.price),
                                  propPreviews[product.id]
                                )
                              )}
                            </strong>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.allow_buy_now && (
                  <button
                    type="button"
                    disabled={isBusy || role === "admin" || isOutOfStock}
                    onClick={() => buyAccount(product)}
                    className="fth-primary-button rounded-xl px-4 py-3 font-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {buyingId === product.id
                      ? "Processing..."
                      : role === "admin"
                        ? "Client Purchase Only"
                        : user
                          ? "Buy Now"
                          : "Sign In to Buy"}
                  </button>
                )}

                {product.allow_pay_small_small && (
                  <button
                    type="button"
                    disabled={isBusy || role === "admin" || isOutOfStock}
                    onClick={() => startPaySmallSmall(product)}
                    className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 font-black text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {startingSavingsId === product.id
                      ? "Starting..."
                      : role === "admin"
                        ? "Client Savings Only"
                        : user
                          ? "Pay Small Small"
                          : "Sign In to Save"}
                  </button>
                )}
              </div>

              {!product.allow_buy_now &&
                !product.allow_pay_small_small && (
                  <p className="mt-5 rounded-xl bg-[var(--surface-3)] px-4 py-3 text-center text-sm text-[var(--muted)]">
                    Purchasing is temporarily unavailable for this account.
                  </p>
                )}

              </div>
            );
          })}
        </div>

        {/* TRADINGVIEW PLANS */}

        <section id="tradingview-plans" className="mt-14 scroll-mt-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                Marketplace Category
              </p>
              <h2 className="mt-1 text-2xl font-bold">TradingView Plans</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Buy immediately or pay gradually. The displayed FTH price is final.
              </p>
            </div>
            <span className="w-fit rounded-full bg-sky-500/10 px-3 py-1 text-sm text-[var(--brand-primary)]">
              {tradingViewPlans.length} Plans
            </span>
          </div>

          {user && role !== "admin" && (
            <label className="mt-5 block max-w-xl text-sm text-[var(--foreground)]">
              TradingView delivery email
              <input
                type="email"
                value={tradingViewEmail}
                onChange={(event) => setTradingViewEmail(event.target.value)}
                placeholder="Email used for TradingView delivery"
                className="mt-2 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)]"
              />
            </label>
          )}

          {tradingViewPlans.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--muted)]">
              No TradingView plans are currently available.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {tradingViewPlans.map((plan) => {
                const busy = processingTradingViewPlanId === plan.id;
                const features = Array.isArray(plan.features) ? plan.features : [];

                return (
                  <article
                    key={plan.id}
                    className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                          {plan.access_type.replaceAll("_", " ")}
                        </p>
                        <h3 className="mt-2 text-xl font-bold">{plan.name}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-[var(--success)]">
                        Available
                      </span>
                    </div>

                    {plan.description && (
                      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-3 border-y border-[var(--border)] py-4 text-sm">
                      <p className="flex justify-between gap-3">
                        <span className="text-[var(--muted)]">Access</span>
                        <strong className="capitalize">{plan.access_type.replaceAll("_", " ")}</strong>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span className="text-[var(--muted)]">Duration</span>
                        <strong>{plan.duration_days} days</strong>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span className="text-[var(--muted)]">Price</span>
                        <strong className="text-[var(--warning)]">
                          NGN {Number(plan.price).toLocaleString()}
                        </strong>
                      </p>
                    </div>

                    {features.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]">
                        {features.slice(0, 4).map((feature) => (
                          <li key={feature}>{"\u2713"} {feature}</li>
                        ))}
                      </ul>
                    )}

                    {user && role !== "admin" && (
                      <div className="mt-5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                          Discount or referral code
                        </label>

                        <div className="mt-2 flex gap-2">
                          <input
                            value={tradingViewCodes[plan.id] || ""}
                            onChange={(event) => {
                              const value = event.target.value.toUpperCase();
                              setTradingViewCodes((current) => ({
                                ...current,
                                [plan.id]: value,
                              }));
                              setTradingViewPreviews((current) => ({
                                ...current,
                                [plan.id]: null,
                              }));
                            }}
                            placeholder="Enter code"
                            className="min-w-0 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-3 py-2 uppercase text-[var(--foreground)] placeholder:text-[var(--muted-2)]"
                          />

                          <button
                            type="button"
                            onClick={() => applyTradingViewCode(plan)}
                            disabled={
                              !String(tradingViewCodes[plan.id] || "").trim() ||
                              checkingTradingViewCodeId === plan.id
                            }
                            className="rounded-xl border border-sky-400/40 px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] disabled:opacity-40"
                          >
                            {checkingTradingViewCodeId === plan.id
                              ? "Checking..."
                              : "Apply"}
                          </button>
                        </div>

                        {tradingViewPreviews[plan.id] && (
                          <div className="mt-3 text-sm">
                            <p
                              className={
                                tradingViewPreviews[plan.id]?.valid
                                  ? "text-[var(--success)]"
                                  : "text-[var(--danger)]"
                              }
                            >
                              {tradingViewPreviews[plan.id]?.valid
                                ? tradingViewPreviews[plan.id]?.code_type ===
                                  "discount"
                                  ? `Discount applied: ${money(
                                      plan.currency,
                                      Number(
                                        tradingViewPreviews[plan.id]
                                          ?.discount_amount || 0
                                      )
                                    )}`
                                  : tradingViewPreviews[plan.id]?.code_type ===
                                      "referral"
                                    ? `Referral applied${
                                        tradingViewPreviews[plan.id]?.partner_name
                                          ? ` for ${tradingViewPreviews[plan.id]?.partner_name}`
                                          : ""
                                      }. Price is unchanged.`
                                    : "Code cleared."
                                : tradingViewPreviews[plan.id]?.message}
                            </p>

                            {tradingViewPreviews[plan.id]?.valid &&
                              tradingViewPreviews[plan.id]?.code_type ===
                                "discount" && (
                                <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-2">
                                  <span className="text-[var(--muted)]">
                                    Amount due
                                  </span>
                                  <strong className="text-[var(--warning)]">
                                    {money(
                                      plan.currency,
                                      getNetAmount(
                                        Number(plan.price),
                                        tradingViewPreviews[plan.id]
                                      )
                                    )}
                                  </strong>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-auto grid gap-3 pt-6">
                      {plan.allow_buy_now && (
                        <button
                          type="button"
                          disabled={busy || role === "admin"}
                          onClick={() => startTradingViewPurchase(plan, "buy_now")}
                          className="fth-primary-button rounded-xl px-4 py-3 font-black disabled:opacity-50"
                        >
                          {busy
                            ? "Processing..."
                            : role === "admin"
                              ? "Client Purchase Only"
                              : user
                                ? "Buy Now"
                                : "Sign In to Buy"}
                        </button>
                      )}
                      {plan.allow_pay_small_small && (
                        <button
                          type="button"
                          disabled={busy || role === "admin"}
                          onClick={() =>
                            startTradingViewPurchase(plan, "pay_small_small")
                          }
                          className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 font-black disabled:opacity-50"
                        >
                          {busy
                            ? "Processing..."
                            : role === "admin"
                              ? "Client Savings Only"
                              : user
                                ? "Pay Small Small"
                                : "Sign In to Save"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* TRADE JOURNAL */}
        <section id="trade-journal" className="mt-14 scroll-mt-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--success)]">
                Marketplace Category
              </p>
              <h2 className="mt-1 text-2xl font-bold">Fidelity Journal</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                Plan your trades, log executions, review discipline and study performance.
                Start with Free or move to Pro for the complete journaling toolkit.
              </p>
            </div>
            <span className="w-fit rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-[var(--success)]">
              Free + Pro
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Trade Journal
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">Free</h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-[var(--success)]">
                  FREE
                </span>
              </div>

              <p className="mt-5 text-3xl font-black text-[var(--foreground)]">{"\u20A6"}0</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Core plan {"\u2192"} log {"\u2192"} review workflow for traders building consistency.
              </p>

              <ul className="mt-5 space-y-2 text-sm text-[var(--foreground)]">
                <li>{"\u2713"} Create and manage a trading account</li>
                <li>{"\u2713"} Plan and log trades</li>
                <li>{"\u2713"} Journal and review closed trades</li>
                <li>{"\u2713"} Core performance statistics</li>
                <li>{"\u2713"} Risk and rule tracking</li>
              </ul>

              <Link
                href="/trade-journal"
                className="fth-primary-button mt-6 rounded-xl px-5 py-3 text-center font-black"
              >
                Start Free
              </Link>
            </article>

            <article className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--warning)]">
                    Trade Journal
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">Pro</h3>
                </div>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
                  PRO
                </span>
              </div>

              {(() => {
                const proPlan =
                  tradeJournalPlans.find((plan) =>
                    plan.name.toLowerCase().includes("pro")
                  ) ?? tradeJournalPlans[0] ?? null;

                const proFeatures = [
                  "Everything in Free",
                  "Multiple trading accounts",
                  "Multiple reusable trading systems",
                  "Before/after chart screenshots",
                  "Expanded analytics",
                  "Advanced review tools",
                ];

                return (
                  <>
                    <p className="mt-5 text-3xl font-black text-[var(--warning)]">
                      {proPlan
                        ? `${proPlan.currency?.toUpperCase() === "NGN" ? "\u20A6" : `${proPlan.currency?.toUpperCase()} `}${Number(proPlan.price).toLocaleString()}`
                        : "\u20A65,000"}
                    </p>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--warning)]">
                      {proPlan?.billing_period || "Monthly"}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Choose 1{"\u2013"}12 months at checkout. Longer subscriptions receive an automatic multi-month discount.
                    </p>

                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {proPlan?.description ||
                        "Full Trade Journal access for traders who want deeper review and analytics."}
                    </p>

                    <ul className="mt-5 space-y-2 text-sm text-[var(--foreground)]">
                      {proFeatures.map((feature) => (
                        <li key={feature}>{"\u2713"} {feature}</li>
                      ))}
                    </ul>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Link
                        href="/trade-journal?checkout=pro"
                        className="fth-primary-button rounded-xl px-5 py-3 text-center font-black"
                      >
                        Pay Now
                      </Link>

                      <Link
                        href="/trade-journal?checkout=pro&method=pay-small-small"
                        className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-center font-black text-[var(--foreground)]"
                      >
                        Pay Small Small
                      </Link>
                    </div>

                    {!user && (
                      <p className="mt-3 text-xs text-[var(--muted-2)]">
                        You will be asked to sign in before payment.
                      </p>
                    )}
                  </>
                );
              })()}
            </article>
          </div>
        </section>

        {/* OUTSIDE PROP ACCOUNT REQUEST */}

        <section id="outside-prop" className="mt-14 scroll-mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
            Marketplace Category
          </p>
          <h2 className="mt-2 text-2xl font-bold">Request an Outside Prop Account</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Cannot find the account in our available stock? Submit the external
            account here. A fixed 5% service fee applies.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <label className="block text-sm font-semibold text-[var(--brand-primary)]">
                Step 1 &mdash; Select the prop firm first *
              </label>
              <select
                value={outsidePropFirmId}
                onChange={(event) => {
                  setOutsidePropFirmId(event.target.value);
                  if (event.target.value !== "__other__") {
                    setOutsideManualPropFirm("");
                  }
                }}
                className="relative z-10 mt-2 w-full cursor-pointer rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)]"
              >
                <option value="">Click here to select a prop firm</option>
                {outsidePropFirms.map((firm) => (
                  <option key={firm.id} value={firm.id}>{firm.name}</option>
                ))}
                <option value="__other__">Other prop firm &#8212; type the name</option>
              </select>

              {outsidePropFirmId === "__other__" && (
                <input
                  type="text"
                  value={outsideManualPropFirm}
                  onChange={(event) => setOutsideManualPropFirm(event.target.value)}
                  placeholder="Type the prop firm name *"
                  className="mt-3 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)]"
                />
              )}

              {!outsidePropFirmId && (
                <p className="mt-2 text-xs text-[var(--brand-primary)]/70">
                  The account details below will unlock after you select a prop firm.
                </p>
              )}
            </div>

            <input
              disabled={!(outsidePropFirmId && (outsidePropFirmId !== "__other__" || outsideManualPropFirm.trim()))}
              type="text"
              placeholder="Account size e.g. $100,000 *"
              value={outsideAccountSize}
              onChange={(event) => setOutsideAccountSize(event.target.value)}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
            />

            <input
              disabled={!(outsidePropFirmId && (outsidePropFirmId !== "__other__" || outsideManualPropFirm.trim()))}
              type="text"
              placeholder="Account type/phase e.g. 2-Step"
              value={outsidePhase}
              onChange={(event) => setOutsidePhase(event.target.value)}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
            />

            <input
              disabled={!(outsidePropFirmId && (outsidePropFirmId !== "__other__" || outsideManualPropFirm.trim()))}
              type="number"
              min="1"
              placeholder="Current account price in NGN *"
              value={outsideAccountPrice}
              onChange={(event) => setOutsideAccountPrice(event.target.value)}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
            />

            <input
              disabled={!(outsidePropFirmId && (outsidePropFirmId !== "__other__" || outsideManualPropFirm.trim()))}
              type="email"
              placeholder="Purchase email *"
              value={outsidePurchaseEmail}
              onChange={(event) => setOutsidePurchaseEmail(event.target.value)}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
            />

            <input
              disabled={!(outsidePropFirmId && (outsidePropFirmId !== "__other__" || outsideManualPropFirm.trim()))}
              type="password"
              placeholder="Prop-firm portal password (optional)"
              value={outsidePortalPassword}
              onChange={(event) => setOutsidePortalPassword(event.target.value)}
              className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
            />

            {outsidePropFirmId && (() => {
              const firm = outsidePropFirms.find(
                (item) => item.id === outsidePropFirmId
              );
              return firm?.registration_url ? (
                <p className="rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm text-[var(--foreground)] sm:col-span-2">
                  Not registered with {firm.name}?{" "}
                  <a
                    href={firm.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[var(--brand-primary)] underline"
                  >
                    {firm.registration_link_label || "Register here"}
                  </a>
                </p>
              ) : null;
            })()}

            <textarea
              disabled={!(outsidePropFirmId && (outsidePropFirmId !== "__other__" || outsideManualPropFirm.trim()))}
              rows={3}
              placeholder="Optional instructions"
              value={outsideNotes}
              onChange={(event) => setOutsideNotes(event.target.value)}
              className="resize-none rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 sm:col-span-2"
            />
          </div>

          {(() => {
            const price = Number(outsideAccountPrice || 0);
            const fee = Number.isFinite(price) ? price * 0.05 : 0;
            const total = price + fee;
            return (
              <>
                <div className="mt-5 grid gap-3 rounded-xl bg-[var(--surface-2)] p-4 sm:grid-cols-3">
                  <p>Account: <strong>NGN {price.toLocaleString()}</strong></p>
                  <p>FTH fee (5%): <strong>NGN {fee.toLocaleString()}</strong></p>
                  <p>Total: <strong className="text-[var(--warning)]">NGN {total.toLocaleString()}</strong></p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={submittingOutsideRequest || total <= 0}
                    onClick={() => submitOutsidePropPurchase("buy_now")}
                    className="fth-primary-button rounded-xl px-5 py-3 font-black disabled:opacity-50"
                  >
                    Buy Now &mdash; NGN {total.toLocaleString()}
                  </button>
                  <button
                    type="button"
                    disabled={submittingOutsideRequest || total <= 0}
                    onClick={() => submitOutsidePropPurchase("pay_small_small")}
                    className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 font-black text-[var(--foreground)] disabled:opacity-50"
                  >
                    Pay Small Small
                  </button>
                </div>
              </>
            );
          })()}
        </section>

        {/* BOTTOM ACTIONS */}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:flex-row">
          <div>
            <p className="font-semibold">How payment works</p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Choose Buy Now or Pay Small Small. Your exact amount, unique
              reference and Fidelity Traders Hub bank account will appear.
            </p>
          </div>

          {user && role !== "admin" ? (
            <Link
              href="/pay-small-small"
              className="fth-primary-button rounded-xl px-5 py-3 font-black"
            >
              View Pay Small Small Plans
            </Link>
          ) : !user ? (
            <Link
              href="/logins"
              className="fth-primary-button rounded-xl px-5 py-3 font-black"
            >
              Sign In
            </Link>
          ) : null}
        </div>
          </div>
        </div>
      </div>

      {paymentRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-primary)]">
                  Fidelity Traders Hub Payment
                </p>
                <h2 className="mt-2 text-2xl font-bold">Complete Bank Transfer</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {paymentRequest.productLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentRequest(null)}
                className="rounded-lg border border-[var(--border-strong)] px-3 py-2 text-[var(--foreground)]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--muted)]">Exact Amount</p>
                <p className="mt-1 text-2xl font-bold text-[var(--success)]">
                  NGN {paymentRequest.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Your FTH Reference</p>
                <p className="mt-1 break-all font-mono font-bold text-[var(--warning)]">
                  {paymentRequest.reference}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Bank</p>
                <p className="mt-1 font-semibold">{paymentRequest.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Account Number</p>
                <p className="mt-1 font-mono text-xl font-bold">
                  {paymentRequest.accountNumber}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[var(--muted)]">Account Name</p>
                <p className="mt-1 font-semibold">{paymentRequest.accountName}</p>
              </div>
              {paymentRequest.instructions && (
                <p className="rounded-xl bg-blue-500/10 p-3 text-sm text-blue-200 sm:col-span-2">
                  {paymentRequest.instructions}
                </p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="font-bold">After making the transfer</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Enter the name and bank used to make the transfer.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                  placeholder="Sender account name *"
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
                />
                <input
                  value={senderBank}
                  onChange={(event) => setSenderBank(event.target.value)}
                  placeholder="Sender bank *"
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted-2)] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--muted)] disabled:opacity-100"
                />
              </div>

              <button
                type="button"
                onClick={submitTransferDetails}
                disabled={submittingTransfer}
                className="fth-primary-button mt-4 w-full rounded-xl px-5 py-3 font-black disabled:opacity-50"
              >
                {submittingTransfer
                  ? "Submitting..."
                  : "I Have Paid \u2014 Submit for Verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .fth-marketplace input,
        .fth-marketplace select,
        .fth-marketplace textarea {
          color: var(--foreground);
          background: var(--surface);
          border-color: var(--border-strong);
        }

        .fth-marketplace input::placeholder,
        .fth-marketplace textarea::placeholder {
          color: var(--muted-2);
          opacity: 1;
        }

        .fth-marketplace input:disabled,
        .fth-marketplace select:disabled,
        .fth-marketplace textarea:disabled {
          color: var(--muted);
          background: var(--surface-3);
          border-color: var(--border);
          opacity: 1;
          cursor: not-allowed;
        }

        .fth-marketplace select option {
          color: var(--foreground);
          background: var(--surface);
        }

        :root[data-theme="light"] .fth-marketplace .fth-primary-button {
          color: #ffffff !important;
        }

        :root[data-theme="light"] .fth-marketplace input,
        :root[data-theme="light"] .fth-marketplace select,
        :root[data-theme="light"] .fth-marketplace textarea {
          color: #171329 !important;
          background: #ffffff !important;
          border-color: #cfc6fb !important;
        }

        :root[data-theme="light"] .fth-marketplace input::placeholder,
        :root[data-theme="light"] .fth-marketplace textarea::placeholder {
          color: #746e88 !important;
        }

        :root[data-theme="light"] .fth-marketplace input:disabled,
        :root[data-theme="light"] .fth-marketplace select:disabled,
        :root[data-theme="light"] .fth-marketplace textarea:disabled {
          color: #625d73 !important;
          background: #eeecf7 !important;
          border-color: #d7d2e8 !important;
        }

        :root[data-theme="light"] .fth-marketplace button:disabled {
          color: #625d73 !important;
          background: #e4e1ef !important;
          border-color: #d1cce1 !important;
          opacity: 1 !important;
          box-shadow: none !important;
        }

        :root[data-theme="light"] .fth-marketplace .text-blue-200,
        :root[data-theme="light"] .fth-marketplace .text-sky-200,
        :root[data-theme="light"] .fth-marketplace .text-cyan-200 {
          color: #5147f2 !important;
        }

        :root[data-theme="dark"] .fth-marketplace .fth-primary-button {
          color: #071009 !important;
        }
      `}</style>

    </main>
  );
}
