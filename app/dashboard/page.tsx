"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BrandLogo from "../BrandLogo";
import PartnerReferralLinkCard from "./PartnerReferralLinkCard";

// Display-only cleanup for old records whose names already include
// "TradingView" more than once. This does not change database data.
function cleanProductName(value: unknown) {
  const name = String(value ?? "").trim();

  if (!name) return "Trading product";

  return name
    .replace(/^(TradingView\s+)+/i, "TradingView ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const [loading, setLoading] = useState(true);

  const [walletBalance, setWalletBalance] = useState(0);
  const [walletId, setWalletId] = useState("");

  const [depositAmount, setDepositAmount] = useState("");

  // Withdrawals

  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState("");
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [savingBankAccount, setSavingBankAccount] = useState(false);

  const [savingsGoal, setSavingsGoal] = useState<any>(null);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [savingsContribution, setSavingsContribution] = useState("");
  const [contributingToSavings, setContributingToSavings] = useState(false);
  const [completingSavingsPurchase, setCompletingSavingsPurchase] = useState(false);

  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [propPurchases, setPropPurchases] = useState<any[]>([]);

  // Outside prop-firm Buy Now / Pay Small Small

  const [outsidePropRequests, setOutsidePropRequests] = useState<any[]>([]);
  const [outsidePropFirms, setOutsidePropFirms] = useState<any[]>([]);
  const [outsidePropFirmId, setOutsidePropFirmId] = useState("");
  const [outsideSavingsGoals, setOutsideSavingsGoals] = useState<any[]>([]);
  const [outsideContributionAmounts, setOutsideContributionAmounts] =
    useState<Record<string, string>>({});
  const [outsideContributingGoalId, setOutsideContributingGoalId] =
    useState<string | number | null>(null);
  const [outsideAccountSize, setOutsideAccountSize] = useState("");
  const [outsidePhase, setOutsidePhase] = useState("");
  const [outsideAccountPrice, setOutsideAccountPrice] = useState("");
  const [outsidePurchaseEmail, setOutsidePurchaseEmail] = useState("");
  const [outsidePortalPassword, setOutsidePortalPassword] = useState("");
  const [outsideNotes, setOutsideNotes] = useState("");
  const [submittingOutsideRequest, setSubmittingOutsideRequest] = useState(false);

  // TradingView

  const [tradingViewPlan, setTradingViewPlan] = useState<any>(null);
  const [latestTradingViewPurchase, setLatestTradingViewPurchase] =
    useState<any>(null);

  // Support messaging

  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // Announcements

  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Trade Journal dashboard integration
  const [journalAccess, setJournalAccess] = useState<{
    allowed?: boolean;
    plan?: "free" | "pro";
    source?: string;
  } | null>(null);
  const [journalStats, setJournalStats] = useState({
    activeAccounts: 0,
    todayTrades: 0,
    closedTrades: 0,
    winRate: 0,
    ruleAdherence: 0,
  });

  function getDaysRemaining(expiresAt: string) {
    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();

    const difference = expiry - now;

    if (difference <= 0) return 0;

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  }

  async function loadAnnouncements() {
    const { data, error } = await supabase
      .from("announcements")
      .select("id, title, message, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading announcements:", error);
      return;
    }

    setAnnouncements(data ?? []);
  }

  async function loadSupportMessages(userId: string) {
    const { data, error } = await supabase
      .from("support_messages")
      .select(
        "id, user_id, sender_role, message, is_read, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "Error loading support messages:",
        error
      );
      return;
    }

    setSupportMessages(data ?? []);
  }

  async function loadBankAccounts(userId: string) {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select(
        "id, bank_name, bank_code, account_number, account_name, verification_status, is_default, created_at"
      )
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading bank accounts:", error);
      return;
    }

    const accounts = data ?? [];
    setBankAccounts(accounts);

    if (accounts.length > 0) {
      const preferred =
        accounts.find((account) => account.is_default) ?? accounts[0];

      setSelectedBankAccountId((current) =>
        current || preferred.id
      );
    }
  }

  async function loadWithdrawals(userId: string) {
    const { data, error } = await supabase
      .from("withdrawals")
      .select(
        "id, user_id, wallet_id, bank_account_id, reference, requested_amount, processing_fee, net_amount, currency, status, rejection_reason, requested_at, approved_at, processing_at"
      )
      .is("archived_at", null)
      .eq("user_id", userId)
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error loading withdrawals:", error);
      return;
    }

    setWithdrawals(data ?? []);
  }

  async function loadOutsidePropRequests(userId: string) {
    const { data, error } = await supabase
      .from("prop_firm_requests")
      .select(
        "id, prop_firm, account_size, phase, notes, status, admin_note, account_price, currency, service_fee_percent, service_fee_amount, total_target, purchase_email, purchase_method, savings_goal_id, funded_at, delivered_at, variation_amount, variation_reason, refund_amount, refunded_at, created_at, updated_at"
      )
      .is("archived_at", null)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading outside prop requests:", error);
      return;
    }

    const requests = data ?? [];
    setOutsidePropRequests(requests);

    const goalIds = requests
      .map((request) => request.savings_goal_id)
      .filter(Boolean);

    if (goalIds.length === 0) {
      setOutsideSavingsGoals([]);
      return;
    }

    const { data: goalData, error: goalError } = await supabase
      .from("savings_goals")
      .select(
        "id, goal_name, target_amount, saved_amount, currency, status, created_at, updated_at"
      )
      .is("archived_at", null)
      .in("id", goalIds)
      .order("created_at", { ascending: false });

    if (goalError) {
      console.error("Error loading outside savings goals:", goalError);
      return;
    }

    setOutsideSavingsGoals(goalData ?? []);
  }

  async function loadTradeJournalSummary(userId: string) {
    const { data: accessData, error: accessError } = await supabase.rpc(
      "get_my_trade_journal_access"
    );

    if (accessError) {
      console.error("Trade Journal access error:", accessError);
      setJournalAccess(null);
      return;
    }

    const access = (accessData ?? null) as {
      allowed?: boolean;
      plan?: "free" | "pro";
      source?: string;
    } | null;

    setJournalAccess(access);

    if (!access?.allowed) {
      setJournalStats({
        activeAccounts: 0,
        todayTrades: 0,
        closedTrades: 0,
        winRate: 0,
        ruleAdherence: 0,
      });
      return;
    }

    const [accountsResult, tradesResult] = await Promise.all([
      supabase
        .from("journal_accounts")
        .select("id,status")
        .eq("user_id", userId),
      supabase
        .from("journal_trades")
        .select("id,status,outcome,rules_followed,created_at")
        .eq("user_id", userId)
        .is("deleted_at", null),
    ]);

    if (accountsResult.error) {
      console.error("Trade Journal accounts error:", accountsResult.error);
    }

    if (tradesResult.error) {
      console.error("Trade Journal trades error:", tradesResult.error);
    }

    const journalAccounts = accountsResult.data ?? [];
    const journalTrades = tradesResult.data ?? [];
    const activeJournalAccounts = journalAccounts.filter(
      (account) => account.status === "active"
    );

    const closedJournalTrades = journalTrades.filter(
      (trade) => trade.status === "closed"
    );
    const wins = closedJournalTrades.filter(
      (trade) => trade.outcome === "win"
    ).length;
    const reviewedForRules = closedJournalTrades.filter(
      (trade) => trade.rules_followed !== null
    );
    const rulesFollowed = reviewedForRules.filter(
      (trade) => trade.rules_followed === true
    ).length;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const todayTrades = journalTrades.filter((trade) => {
      const created = new Date(trade.created_at);
      return Number.isFinite(created.getTime()) && created >= startOfToday;
    }).length;

    setJournalStats({
      activeAccounts: activeJournalAccounts.length,
      todayTrades,
      closedTrades: closedJournalTrades.length,
      winRate: closedJournalTrades.length
        ? (wins / closedJournalTrades.length) * 100
        : 0,
      ruleAdherence: reviewedForRules.length
        ? (rulesFollowed / reviewedForRules.length) * 100
        : 0,
    });
  }

  async function loadOutsidePropFirms() {
    const { data, error } = await supabase
      .from("prop_firms")
      .select("id, name, registration_url, registration_link_label")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading prop firms:", error);
      return;
    }

    setOutsidePropFirms(data ?? []);
  }

  useEffect(() => {
    async function loadDashboard() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Session error:",
          sessionError
        );
        setLoading(false);
        return;
      }

      const sessionUser =
        sessionData.session?.user;

      if (!sessionUser) {
        window.location.href = "/logins";
        return;
      }

      setUser(sessionUser);
      setOutsidePurchaseEmail(sessionUser.email ?? "");

      // Pay Small Small

      const { data: savingsData, error: savingsError } = await supabase
        .from("savings_goals")
        .select(
          "id, offer_id, goal_name, target_amount, saved_amount, currency, status, created_at, updated_at"
        )
        .is("archived_at", null)
        .eq("user_id", sessionUser.id)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        });

      if (savingsError) {
        console.error("Savings goal error:", savingsError);
      } else {
        const loadedGoals = savingsData ?? [];
        setSavingsGoals(loadedGoals);
        setSavingsGoal(loadedGoals[0] ?? null);
      }

      // Wallet

      const {
        data: walletData,
        error: walletError,
      } = await supabase
        .from("wallet_balances")
        .select(
          "wallet_id, available_balance"
        )
        .eq("user_id", sessionUser.id)
        .maybeSingle();

      if (walletError) {
        console.error(
          "Wallet error:",
          walletError
        );
      } else {
        setWalletBalance(
          walletData?.available_balance ?? 0
        );

        setWalletId(
          walletData?.wallet_id ?? ""
        );
      }

      // Trading accounts

      const {
        data: accountData,
        error: accountError,
      } = await supabase
        .from("client_accounts")
        .select(
          "id, account_name, prop_firm, account_size, phase, amount_paid, status, created_at, co_sponsor_name, co_sponsor_phone, co_sponsor_visible"
        )
        .is("archived_at", null)
        .eq("user_id", sessionUser.id)
        .order("created_at", {
          ascending: false,
        });

      if (accountError) {
        console.error(
          "Error loading client accounts:",
          accountError
        );
      } else {
        setClientAccounts(
          accountData ?? []
        );
      }

      // Prop purchases and fulfilment status

      const {
        data: propPurchaseData,
        error: propPurchaseError,
      } = await supabase
        .from("prop_offer_purchases")
        .select(
          `
            id,
            offer_id,
            client_account_id,
            purchase_type,
            total_price,
            amount_paid,
            currency,
            status,
            fulfillment_status,
            funded_at,
            approved_at,
            delivered_at,
            admin_note,
            created_at,
            prop_offers!prop_offer_purchases_offer_id_fkey (
              account_size,
              prop_programs!prop_offers_program_id_fkey (
                name,
                phase,
                prop_firms!prop_programs_firm_id_fkey (
                  name
                )
              )
            )
          `
        )
        .is("archived_at", null)
        .eq("user_id", sessionUser.id)
        .order("created_at", { ascending: false });

      if (propPurchaseError) {
        console.error("Error loading prop purchases:", propPurchaseError);
      } else {
        setPropPurchases(propPurchaseData ?? []);
      }

      // TradingView

      const {
        data: tradingViewData,
        error: tradingViewError,
      } = await supabase
        .from("tradingview_subscriptions")
        .select(
          "id, plan_name, started_at, expires_at, status, login_email, login_password, delivery_note, details_visible, co_sponsor_name, co_sponsor_phone, co_sponsor_visible"
        )
        .is("archived_at", null)
        .eq("user_id", sessionUser.id)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (tradingViewError) {
        console.error(
          "Error loading TradingView:",
          tradingViewError
        );
      } else {
        setTradingViewPlan(
          tradingViewData
        );
      }

      const {
        data: tradingViewPurchaseData,
        error: tradingViewPurchaseError,
      } = await supabase
        .from("tradingview_purchases")
        .select(
          `
            id, purchase_type, purchase_email, total_price, amount_paid,
            currency, status, funded_at, delivered_at, created_at,
            tradingview_plans!tradingview_purchases_plan_id_fkey (
              name, duration_days, access_type
            )
          `
        )
        .is("archived_at", null)
        .eq("user_id", sessionUser.id)
        .order("created_at", { ascending: false })
        ;

      if (tradingViewPurchaseError) {
        console.error(
          "Error loading latest TradingView purchase:",
          tradingViewPurchaseError
        );
      } else {
        setLatestTradingViewPurchase(tradingViewPurchaseData);
      }

      // Trade Journal

      await loadTradeJournalSummary(sessionUser.id);

      // Support messages

      await loadSupportMessages(
        sessionUser.id
      );

      // Announcements

      await loadAnnouncements();

      // Bank accounts + withdrawals

      await loadBankAccounts(sessionUser.id);
      await loadWithdrawals(sessionUser.id);
      await loadOutsidePropFirms();
      await loadOutsidePropRequests(sessionUser.id);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  const createSavingsGoal = async () => {
    if (!user || !goalName.trim() || !targetAmount) {
      alert("Enter a goal name and target amount.");
      return;
    }

    const target = Number(targetAmount);

    if (!Number.isFinite(target) || target <= 0) {
      alert("Enter a valid target amount.");
      return;
    }

    const { data, error } = await supabase
      .from("savings_goals")
      .insert({
        user_id: user.id,
        offer_id: null,
        goal_name: goalName.trim(),
        target_amount: target,
        saved_amount: 0,
        currency: "NGN",
        status: "active",
      })
      .select(
        "id, offer_id, goal_name, target_amount, saved_amount, currency, status, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Create savings goal error:", error);
      alert(`Could not create savings goal: ${error.message}`);
      return;
    }

    setSavingsGoal(data);
    setGoalName("");
    setTargetAmount("");

    alert("Savings goal created.");
  };

  async function contributeToSavingsGoal() {
    if (!savingsGoal?.id) {
      alert("No active savings goal found.");
      return;
    }

    if (savingsGoal.status !== "active") {
      alert("This savings goal is already fully funded.");
      return;
    }

    const amount = Number(savingsContribution);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid contribution amount.");
      return;
    }

    const remaining =
      Number(savingsGoal.target_amount ?? 0) -
      Number(savingsGoal.saved_amount ?? 0);

    if (amount > remaining) {
      alert(
        `You only need â‚¦${Math.max(remaining, 0).toLocaleString()} more to complete this goal.`
      );
      return;
    }

    setContributingToSavings(true);

    const { data, error } = await supabase.rpc(
      "contribute_to_savings_goal",
      {
        p_goal_id: savingsGoal.id,
        p_amount: amount,
      }
    );

    if (error) {
      console.error("Savings contribution error:", error);
      alert(error.message || "Could not add money to this goal.");
      setContributingToSavings(false);
      return;
    }

    setSavingsContribution("");

    setSavingsGoal((current: any) => ({
      ...current,
      saved_amount: Number(data?.saved_amount ?? current?.saved_amount ?? 0),
      status: data?.goal_completed ? "completed" : "active",
    }));

    if (typeof data?.wallet_balance === "number") {
      setWalletBalance(data.wallet_balance);
    }

    setContributingToSavings(false);

    if (data?.goal_completed) {
      alert(
        "Goal fully funded! We will now re-check the current offer price and stock before completing the purchase."
      );
    } else {
      alert(
        `Contribution added. â‚¦${Number(
          data?.remaining_amount ?? 0
        ).toLocaleString()} remaining.`
      );
    }
  }


  async function completeSavingsPurchase() {
    if (!savingsGoal?.id) {
      alert("No Pay Small Small goal found.");
      return;
    }

    if (!savingsGoal.offer_id) {
      alert("This savings goal is not linked to a prop firm offer.");
      return;
    }

    if (savingsGoal.status !== "completed") {
      alert("This savings goal is not fully funded yet.");
      return;
    }

    const confirmed = window.confirm(
      "Complete this Pay Small Small purchase now? Fidelity Traders Hub will re-check the current price and stock before releasing the account."
    );

    if (!confirmed) return;

    setCompletingSavingsPurchase(true);

    const { data, error } = await supabase.rpc(
      "complete_prop_savings_purchase",
      {
        p_goal_id: savingsGoal.id,
      }
    );

    if (error) {
      console.error("Complete savings purchase error:", error);
      alert(error.message || "Could not complete this purchase.");
      setCompletingSavingsPurchase(false);
      return;
    }

    if (data?.needs_more_money || data?.price_changed) {
      const amountNeeded = Number(data?.amount_needed ?? 0);
      const currentPrice = Number(data?.current_price ?? savingsGoal.target_amount ?? 0);

      setSavingsGoal((current: any) => ({
        ...current,
        target_amount: currentPrice,
        status: "active",
      }));

      alert(
        `The offer price changed. Your savings are safe. You now need ${savingsGoal.currency || "NGN"} ${amountNeeded.toLocaleString()} more to complete this purchase.`
      );

      setCompletingSavingsPurchase(false);
      return;
    }

    if (data?.success) {
      if (Number(data?.refund_amount ?? 0) > 0) {
        const refundAmount = Number(data.refund_amount);

        alert(
          `Purchase completed successfully. The price dropped, so ${savingsGoal.currency || "NGN"} ${refundAmount.toLocaleString()} was returned to your wallet.`
        );
      } else {
        alert(
          data?.already_completed
            ? "This Pay Small Small goal was already converted into a purchase."
            : "Purchase completed successfully. Your account is now pending delivery. Fidelity Traders Hub will process it using your registered email address."
        );
      }

      window.location.href = "/dashboard";
      return;
    }

    setCompletingSavingsPurchase(false);
  }

  async function submitOutsidePropPurchase(
    purchaseMethod: "buy_now" | "pay_small_small"
  ) {
    if (!user) return;

    const accountPrice = Number(outsideAccountPrice);
    const selectedFirm = outsidePropFirms.find(
      (firm) => firm.id === outsidePropFirmId
    );

    if (
      !selectedFirm ||
      !outsideAccountSize.trim() ||
      !Number.isFinite(accountPrice) ||
      accountPrice <= 0 ||
      !outsidePurchaseEmail.trim()
    ) {
      alert("Please complete all required outside prop-firm fields.");
      return;
    }

    const paymentLabel =
      purchaseMethod === "buy_now" ? "Buy Now" : "Pay Small Small";

    const confirmed = window.confirm(
      `${paymentLabel}: the account price is NGN ${accountPrice.toLocaleString()}, the 5% service fee is NGN ${(
        accountPrice * 0.05
      ).toLocaleString()}, and the total payable is NGN ${(
        accountPrice * 1.05
      ).toLocaleString()}. Continue?`
    );

    if (!confirmed) return;

    setSubmittingOutsideRequest(true);

    const { data, error } = await supabase.rpc(
      "start_outside_prop_purchase",
      {
      p_prop_firm: selectedFirm.name,
      p_account_size: outsideAccountSize.trim(),
      p_phase: outsidePhase.trim() || null,
      p_account_price: accountPrice,
      p_purchase_email: outsidePurchaseEmail.trim(),
      p_portal_password: outsidePortalPassword || null,
      p_purchase_method: purchaseMethod,
      p_notes: outsideNotes.trim() || null,
      }
    );

    if (error) {
      console.error("Outside prop request error:", error);
      alert(`Could not submit request: ${error.message}`);
      setSubmittingOutsideRequest(false);
      return;
    }

    setOutsidePropFirmId("");
    setOutsideAccountSize("");
    setOutsidePhase("");
    setOutsideAccountPrice("");
    setOutsidePortalPassword("");
    setOutsideNotes("");

    await loadOutsidePropRequests(user.id);
    setSubmittingOutsideRequest(false);

    if (purchaseMethod === "buy_now") {
      alert(
        `Payment successful. NGN ${Number(
          data?.total_paid ?? outsideTargetPreview
        ).toLocaleString()} was paid from your wallet. Your order is pending price verification.`
      );
    } else {
      alert(
        "Your Pay Small Small goal is active. You can now contribute gradually from your wallet."
      );
    }
  }

  async function contributeToOutsideGoal(request: any, goal: any) {
    if (!user || !goal?.id) return;

    if (goal.status !== "active") {
      alert("This Pay Small Small goal is already fully funded.");
      return;
    }

    const amount = Number(outsideContributionAmounts[String(goal.id)] || 0);
    const remaining = Math.max(
      Number(goal.target_amount || 0) - Number(goal.saved_amount || 0),
      0
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid top-up amount.");
      return;
    }

    if (amount > remaining) {
      alert(
        `You only need NGN ${remaining.toLocaleString()} more to complete this goal.`
      );
      return;
    }

    setOutsideContributingGoalId(goal.id);

    const { data, error } = await supabase.rpc(
      "contribute_to_savings_goal",
      {
        p_goal_id: goal.id,
        p_amount: amount,
      }
    );

    if (error) {
      console.error("Outside savings contribution error:", error);
      alert(error.message || "Could not top up this Pay Small Small goal.");
      setOutsideContributingGoalId(null);
      return;
    }

    setOutsideContributionAmounts((current) => ({
      ...current,
      [String(goal.id)]: "",
    }));

    if (typeof data?.wallet_balance === "number") {
      setWalletBalance(data.wallet_balance);
    }

    await loadOutsidePropRequests(user.id);
    setOutsideContributingGoalId(null);

    if (data?.goal_completed) {
      alert(
        "Goal fully funded. Your outside prop-firm purchase is now pending price verification."
      );
    } else {
      alert(
        `Top-up successful. NGN ${Number(
          data?.remaining_amount ?? 0
        ).toLocaleString()} remaining.`
      );
    }
  }

  const createDeposit = async () => {
    if (!user || !depositAmount) return;

    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid payment amount.");
      return;
    }

    const { error } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount,
        currency: "NGN",
        duration_months: 1,
        status: "pending",
        payment_note: "Wallet funding request",
        payer_name:
          user?.user_metadata?.full_name ||
          user?.email ||
          "Customer",
        transaction_reference: `WALLET-${crypto.randomUUID()}`,
      });

    if (error) {
      console.error("Wallet funding payment error:", error);
      alert(`Could not submit payment request: ${error.message}`);
      return;
    }

    setDepositAmount("");

    alert(
      "Payment request submitted. Your wallet will be credited after admin confirmation."
    );
  };

  async function saveBankAccount() {
    if (!user) return;

    if (
      !bankName.trim() ||
      !accountName.trim() ||
      !accountNumber.trim()
    ) {
      alert(
        "Please complete the bank name, account name, and account number."
      );
      return;
    }

    setSavingBankAccount(true);

    const { error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        bank_name: bankName.trim(),
        bank_code: null,
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        verification_status: "pending",
        is_default: bankAccounts.length === 0,
      });

    if (error) {
      console.error("Bank account error:", error);
      alert(`Could not save bank account: ${error.message}`);
      setSavingBankAccount(false);
      return;
    }

    setBankName("");
    setAccountName("");
    setAccountNumber("");

    await loadBankAccounts(user.id);

    setSavingBankAccount(false);
    alert("Bank account saved successfully.");
  }

  async function createWithdrawal() {
    if (!user) return;

    const amount = Number(withdrawalAmount);

    if (!walletId) {
      alert("Wallet not found.");
      return;
    }

    if (!selectedBankAccountId) {
      alert("Please save or select a bank account first.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid withdrawal amount.");
      return;
    }

    if (amount > Number(walletBalance)) {
      alert("Withdrawal amount cannot be more than your available wallet balance.");
      return;
    }

    const hasPendingWithdrawal = withdrawals.some(
      (withdrawal) => withdrawal.status === "pending"
    );

    if (hasPendingWithdrawal) {
      alert("You already have a pending withdrawal request.");
      return;
    }

    setSubmittingWithdrawal(true);

    const reference = `WD-${crypto.randomUUID()}`;

    const { error } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        wallet_id: walletId,
        bank_account_id: selectedBankAccountId,
        reference,
        requested_amount: amount,
        processing_fee: 0,
        net_amount: amount,
        currency: "NGN",
        status: "pending",
      });

    if (error) {
      console.error("Withdrawal error:", error);
      alert(`Could not submit withdrawal: ${error.message}`);
      setSubmittingWithdrawal(false);
      return;
    }

    setWithdrawalAmount("");
    await loadWithdrawals(user.id);

    setSubmittingWithdrawal(false);
    alert("Withdrawal request submitted for admin review.");
  }

  async function sendSupportMessage() {
    if (!user) return;

    if (!newMessage.trim()) {
      alert(
        "Please type a message first."
      );
      return;
    }

    setSendingMessage(true);

    const { error } = await supabase
      .from("support_messages")
      .insert({
        user_id: user.id,
        sender_role: "customer",
        message: newMessage.trim(),
        is_read: false,
      });

    if (error) {
      console.error(
        "Error sending message:",
        error
      );

      alert(
        `Could not send message: ${error.message}`
      );

      setSendingMessage(false);
      return;
    }

    setNewMessage("");

    await loadSupportMessages(
      user.id
    );

    setSendingMessage(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/logins";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading...
      </main>
    );
  }

  const tradingViewDays =
    tradingViewPlan?.expires_at
      ? getDaysRemaining(
          tradingViewPlan.expires_at
        )
      : 0;

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] || "Trader";

  const savingsTarget = Number(savingsGoal?.target_amount ?? 0);
  const savingsSaved = Number(savingsGoal?.saved_amount ?? 0);
  const savingsPercent =
    savingsTarget > 0
      ? Math.min(100, Math.round((savingsSaved / savingsTarget) * 100))
      : 0;

  const savingsRemaining = Math.max(
    savingsTarget - savingsSaved,
    0
  );

  const savingsCurrency = savingsGoal?.currency || "NGN";

  const totalSavingsPaid = savingsGoals.reduce(
    (total, goal) => total + Number(goal.saved_amount ?? 0),
    0
  );
  const totalSavingsTarget = savingsGoals.reduce(
    (total, goal) => total + Number(goal.target_amount ?? 0),
    0
  );
  const totalSavingsOutstanding = Math.max(
    totalSavingsTarget - totalSavingsPaid,
    0
  );
  const activeSavingsPlans = savingsGoals.filter(
    (goal) => Number(goal.saved_amount ?? 0) < Number(goal.target_amount ?? 0)
  ).length;
  const pendingSavingsGoals = savingsGoals
    .filter(
      (goal) => Number(goal.saved_amount ?? 0) < Number(goal.target_amount ?? 0)
    )
    .slice(0, 4);

  const outsidePricePreview = Number(outsideAccountPrice || 0);
  const outsideFeePreview = Number.isFinite(outsidePricePreview)
    ? outsidePricePreview * 0.05
    : 0;
  const outsideTargetPreview = outsidePricePreview + outsideFeePreview;

  const dashboardAccount =
    clientAccounts.find((account) =>
      ["active", "delivered", "working_on", "pending_delivery"].includes(
        String(account.status || "").toLowerCase()
      )
    ) ??
    clientAccounts[0] ??
    null;

  const latestPropPurchase = propPurchases[0] ?? null;

  const dashboardTradingViewName =
    tradingViewPlan?.plan_name ||
    (Array.isArray(latestTradingViewPurchase)
      ? latestTradingViewPurchase[0]?.tradingview_plans?.name
      : latestTradingViewPurchase?.tradingview_plans?.name) ||
    "No active plan";

  return (
    <main className="fth-client-dashboard fth-unified-board min-h-screen text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* APPROVED MOCKUP #2 SIDEBAR */}
        <aside className="fth-app-sidebar border-b border-slate-800 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex min-h-screen flex-col p-5">
            <a
              href="/dashboard"
              className="fth-sidebar-brand flex min-h-14 items-center"
              aria-label="Fidelity Traders Hub dashboard"
            >
              <BrandLogo priority />
            </a>

            <nav className="fth-sidebar-nav mt-8 space-y-1.5 text-sm">
              <a href="/dashboard" className="fth-nav-active flex items-center gap-3 rounded-xl px-4 py-3 font-bold">
                <span aria-hidden="true">âŒ‚</span>
                Dashboard
              </a>

              <a href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">â–¦</span>
                Marketplace
              </a>

              <a href="#my-accounts" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">â—Ž</span>
                My Accounts
              </a>

              <a href="/pay-small-small" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">â—”</span>
                Pay Small Small
              </a>

              <a href="/trade-journal" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">â–¤</span>
                Trade Journal
              </a>

              <a href="#withdrawals" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">â—«</span>
                Wallet & Withdrawals
              </a>

              <a href="#my-purchases" className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300">
                <span aria-hidden="true">â†»</span>
                Orders & Requests
              </a>

              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-300"
              >
                <span aria-hidden="true">?</span>
                Support
              </button>
            </nav>

            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="truncate text-sm font-bold">{firstName}</p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {user?.email || "Fidelity Traders Hub client"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-bold text-slate-400 hover:bg-white/5"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* APPROVED MOCKUP #2 CONTENT */}
        <div className="min-w-0">
          <header className="fth-topbar sticky top-0 z-30 border-b border-slate-800 px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                  Client Dashboard
                </p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">
                  Welcome back, {firstName}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/marketplace"
                  className="hidden rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold sm:inline-flex"
                >
                  Browse Marketplace
                </a>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {firstName.slice(0, 1).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1440px] p-5 sm:p-8">
            {/* PRIMARY SUMMARY */}
            <section className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
              <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                <div className="grid min-h-[235px] min-w-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
                  <div className="min-w-0 p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-slate-400">Fidelity Wallet</p>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                        Available
                      </span>
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                      Available balance
                    </p>
                    <p className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl 2xl:text-5xl">
                      â‚¦{Number(walletBalance).toLocaleString()}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <a
                        href="#wallet-funding"
                        className="fth-primary-button rounded-xl px-5 py-3 text-sm font-black"
                      >
                        + Fund Wallet
                      </a>
                      <a
                        href="#withdrawals"
                        className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-bold text-slate-300"
                      >
                        Withdraw
                      </a>
                    </div>
                  </div>

                  <div className="min-w-0 flex flex-col justify-between border-t border-slate-800 bg-blue-500/10 p-6 lg:border-l lg:border-t-0">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                        TradingView
                      </p>
                      <p className="mt-3 text-xl font-black">
                        {cleanProductName(dashboardTradingViewName)}
                      </p>

                      {tradingViewPlan && tradingViewDays > 0 ? (
                        <>
                          <p className="mt-5 text-4xl font-black text-emerald-400">
                            {tradingViewDays}
                          </p>
                          <p className="text-xs text-slate-400">days remaining</p>
                        </>
                      ) : latestTradingViewPurchase?.status === "pending_delivery" ? (
                        <p className="mt-5 text-sm font-bold text-amber-400">
                          Fully paid Â· Pending delivery
                        </p>
                      ) : (
                        <p className="mt-5 text-sm text-slate-400">
                          No active TradingView subscription.
                        </p>
                      )}
                    </div>

                    <a href="/marketplace" className="mt-5 text-sm font-black text-blue-400">
                      View TradingView plans â†’
                    </a>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                      Payments & Plans
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {activeSavingsPlans
                        ? `${activeSavingsPlans} active ${activeSavingsPlans === 1 ? "plan" : "plans"}`
                        : "No active plans"}
                    </h2>
                  </div>

                  {totalSavingsOutstanding > 0 && (
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                      â‚¦{totalSavingsOutstanding.toLocaleString()} left
                    </span>
                  )}
                </div>

                {pendingSavingsGoals.length ? (
                  <div className="mt-5 space-y-3">
                    {pendingSavingsGoals.slice(0, 3).map((goal) => {
                      const target = Number(goal.target_amount ?? 0);
                      const paid = Number(goal.saved_amount ?? 0);
                      const remaining = Math.max(target - paid, 0);
                      const percent =
                        target > 0
                          ? Math.min(100, Math.round((paid / target) * 100))
                          : 0;

                      return (
                        <a
                          key={goal.id}
                          href={`/pay-small-small?goal=${goal.id}`}
                          className="block rounded-2xl border border-slate-800 bg-slate-950 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">
                                {cleanProductName(goal.goal_name)}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {goal.currency || "NGN"} {remaining.toLocaleString()} remaining
                              </p>
                            </div>
                            <span className="text-xs font-black text-blue-400">{percent}%</span>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-slate-800 p-5 text-sm text-slate-400">
                    Choose any eligible product in Marketplace and use Pay Small Small when you want to pay gradually.
                  </div>
                )}

                <a
                  href="/pay-small-small"
                  className="fth-primary-button mt-5 inline-flex rounded-xl px-5 py-3 text-sm font-black"
                >
                  Open Payments & Plans â†’
                </a>
              </article>
            </section>

            {/* QUICK ACTIONS */}
            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Quick actions</p>
                  <h2 className="mt-1 text-lg font-black">What do you want to do?</h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Browse Marketplace", "Find prop accounts and TradingView plans", "/marketplace", "â–¦"],
                  ["Pay Small Small", "Continue or review payment plans", "/pay-small-small", "â—”"],
                  ["Trade Journal", "Plan, log and review your trades", "/trade-journal", "â–¤"],
                  ["My Accounts", "View your delivered trading accounts", "#my-accounts", "â—Ž"],
                ].map(([title, helper, href, icon]) => (
                  <a
                    key={title}
                    href={href}
                    className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl text-blue-400">
                        {icon}
                      </span>
                      <span className="text-slate-500 group-hover:text-blue-400">â†’</span>
                    </div>
                    <p className="mt-4 font-black">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{helper}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* ANNOUNCEMENTS */}
            {announcements.length > 0 && (
              <section className="mt-5">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                        Latest announcement
                      </p>
                      <h2 className="mt-2 text-xl font-black">{announcements[0].title}</h2>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                        {announcements[0].message}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                      {announcements.length} active
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* REFERRAL PARTNER CARD â€” automatically hidden for ordinary clients */}
            <PartnerReferralLinkCard />

            {/* ACCOUNT + JOURNAL */}
            <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr]">
              <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                      Trading account
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      {dashboardAccount
                        ? dashboardAccount.account_name ||
                          `${dashboardAccount.prop_firm || "Prop Firm"} ${dashboardAccount.account_size || ""}`
                        : "No delivered account yet"}
                    </h2>
                  </div>

                  {dashboardAccount && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      {String(dashboardAccount.status || "active").replaceAll("_", " ")}
                    </span>
                  )}
                </div>

                {dashboardAccount ? (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">Prop firm</p>
                      <p className="mt-2 font-black">{dashboardAccount.prop_firm || "â€”"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">Account size</p>
                      <p className="mt-2 font-black">{dashboardAccount.account_size || "â€”"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    Your delivered Fidelity or outside prop-firm accounts will appear here.
                  </p>
                )}

                <a href="#my-accounts" className="mt-5 inline-flex text-sm font-black text-blue-400">
                  View all accounts â†’
                </a>
              </article>

              <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-blue-400">
                      Fidelity Trade Journal
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      {journalAccess?.allowed ? "Your trading process at a glance" : "Start building your trading record"}
                    </h2>
                  </div>

                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-400">
                    {journalAccess?.allowed
                      ? journalAccess.plan === "pro"
                        ? "PRO"
                        : "FREE"
                      : "FREE + PRO"}
                  </span>
                </div>

                {journalAccess?.allowed ? (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                      ["Accounts", journalStats.activeAccounts],
                      ["Today", journalStats.todayTrades],
                      ["Closed", journalStats.closedTrades],
                      ["Win Rate", `${journalStats.winRate.toFixed(1)}%`],
                      ["Rules", `${journalStats.ruleAdherence.toFixed(1)}%`],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
                        <p className="mt-2 text-lg font-black">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    Plan trades, record execution and review real performance from one professional workspace.
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/trade-journal" className="fth-primary-button rounded-xl px-5 py-3 text-sm font-black">
                    Open Trade Journal â†’
                  </a>
                  <a href="/marketplace#trade-journal" className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-bold text-slate-400">
                    View Pro
                  </a>
                </div>
              </article>
            </section>

            {/* ORDER STATUS STRIP */}
            {latestPropPurchase && (
              <section className="mt-5">
                <div className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Latest prop order</p>
                    <p className="mt-2 font-black">
                      {cleanProductName(
                        latestPropPurchase?.prop_offers?.prop_programs?.prop_firms?.name ||
                        latestPropPurchase?.prop_offers?.prop_programs?.name ||
                        "Prop account"
                      )}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-400">
                    {String(
                      latestPropPurchase.fulfillment_status ||
                      latestPropPurchase.status ||
                      "processing"
                    ).replaceAll("_", " ")}
                  </span>
                </div>
              </section>
            )}

          {/* Pay Small Small plans are consolidated in the Payments & Plans card above. */}
          {/* Payments and savings are managed on /pay-small-small. */}
      {/* WITHDRAWALS */}

      <section id="withdrawals" className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              Withdraw Funds
            </h2>

            <p className="mt-2 text-slate-400">
              Save a bank account once, then use it for withdrawal requests.
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            Withdrawable Funds â‚¦{Number(walletBalance).toLocaleString()}
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Bank Account
            </h3>

            {bankAccounts.length > 0 && (
              <div className="mt-4">
                <label className="mb-2 block text-sm text-slate-400">
                  Select saved bank account
                </label>

                <select
                  value={selectedBankAccountId}
                  onChange={(e) =>
                    setSelectedBankAccountId(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                >
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} â€” {account.account_name} â€” {account.account_number}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Saved accounts: {bankAccounts.length}
                </p>
              </div>
            )}

            <div className="mt-5 border-t border-slate-800 pt-5">
              <p className="text-sm font-semibold text-slate-300">
                Add another bank account
              </p>

              <div className="mt-3 grid gap-3">
                <input
                  type="text"
                  placeholder="Bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <input
                  type="text"
                  placeholder="Account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <button
                type="button"
                onClick={saveBankAccount}
                disabled={savingBankAccount}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingBankAccount ? "Saving..." : "Save Bank Account"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              New Withdrawal
            </h3>

            <input
              type="number"
              min="1"
              placeholder="Withdrawal amount"
              value={withdrawalAmount}
              onChange={(e) =>
                setWithdrawalAmount(e.target.value)
              }
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <button
              type="button"
              onClick={createWithdrawal}
              disabled={
                submittingWithdrawal ||
                !selectedBankAccountId ||
                !walletId
              }
              className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingWithdrawal
                ? "Submitting..."
                : "Request Withdrawal"}
            </button>

            <p className="mt-3 text-xs text-slate-500">
              The request is sent for admin review. Wallet deduction will be handled safely during approval.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-semibold">
            Withdrawal History
          </h3>

          {withdrawals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No withdrawal requests yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {withdrawals.map((withdrawal) => {
                const bank = bankAccounts.find(
                  (account) => account.id === withdrawal.bank_account_id
                );

                return (
                  <div
                    key={withdrawal.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">
                          {withdrawal.currency || "NGN"}{" "}
                          {Number(withdrawal.requested_amount).toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {bank
                            ? `${bank.bank_name} â€¢ ${bank.account_number}`
                            : `Bank account â€¢ ${withdrawal.bank_account_id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Ref: {withdrawal.reference}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          withdrawal.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : withdrawal.status === "rejected"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {String(withdrawal.status).toUpperCase()}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Requested{" "}
                      {new Date(withdrawal.requested_at).toLocaleString()}
                    </p>

                    {Number(withdrawal.processing_fee || 0) > 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        Fee: {withdrawal.currency || "NGN"}{" "}
                        {Number(withdrawal.processing_fee).toLocaleString()} â€¢
                        Net: {withdrawal.currency || "NGN"}{" "}
                        {Number(withdrawal.net_amount).toLocaleString()}
                      </p>
                    )}

                    {withdrawal.rejection_reason && (
                      <p className="mt-2 text-sm text-red-300">
                        Reason: {withdrawal.rejection_reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* TRADINGVIEW DETAILS */}

      {tradingViewPlan && (
        <section id="tradingview-details" className="mt-10">
          <h2 className="text-2xl font-bold">
            My TradingView Subscription
          </h2>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs text-slate-500">
                  Plan
                </p>

                <p className="mt-1 font-semibold">
                  {cleanProductName(tradingViewPlan.plan_name)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Days Remaining
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-400">
                  {tradingViewDays}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Started
                </p>

                <p className="mt-1 font-semibold">
                  {new Date(
                    tradingViewPlan.started_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Expires
                </p>

                <p className="mt-1 font-semibold">
                  {new Date(
                    tradingViewPlan.expires_at
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            {tradingViewPlan.details_visible && (
              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-400">
                      Your TradingView Login Details
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      These details were sent to you by Fidelity Traders Hub.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    READY
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Login Email
                    </p>

                    <p className="mt-1 break-all font-semibold">
                      {tradingViewPlan.login_email || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Login Password
                    </p>

                    <p className="mt-1 break-all font-semibold">
                      {tradingViewPlan.login_password || "Not provided"}
                    </p>
                  </div>
                </div>

                {tradingViewPlan.delivery_note && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Note from Admin
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                      {tradingViewPlan.delivery_note}
                    </p>
                  </div>
                )}
              </div>
            )}

            {tradingViewPlan.co_sponsor_visible && (
              <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                <p className="text-sm font-semibold text-blue-300">
                  TradingView Co-sponsor Details
                </p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Co-sponsor Name
                    </p>

                    <p className="mt-1 font-semibold">
                      {tradingViewPlan.co_sponsor_name || "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <p className="text-xs text-slate-500">
                      Co-sponsor Phone
                    </p>

                    <p className="mt-1 font-semibold">
                      {tradingViewPlan.co_sponsor_phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {!tradingViewPlan &&
        latestTradingViewPurchase?.status === "pending_delivery" && (
          <section id="tradingview-details" className="mt-10">
            <h2 className="text-2xl font-bold">
              My TradingView Subscription
            </h2>

            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-slate-900 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Plan</p>
                  <p className="mt-1 text-xl font-bold">
                    {cleanProductName(
                      Array.isArray(latestTradingViewPurchase.tradingview_plans)
                        ? latestTradingViewPurchase.tradingview_plans[0]?.name
                        : latestTradingViewPurchase.tradingview_plans?.name
                    )}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Payment complete â€” Fidelity Traders Hub is preparing your login details.
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  PENDING DELIVERY
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Amount Paid</p>
                  <p className="mt-1 font-semibold text-emerald-300">
                    {latestTradingViewPurchase.currency || "NGN"}{" "}
                    {Number(latestTradingViewPurchase.amount_paid || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Purchase Method</p>
                  <p className="mt-1 font-semibold">
                    {latestTradingViewPurchase.purchase_type === "pay_small_small"
                      ? "Pay Small Small"
                      : "Buy Now"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-xs text-slate-500">Delivery</p>
                  <p className="mt-1 font-semibold text-amber-300">
                    Awaiting Admin Activation
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* OUTSIDE PROP FIRM BUY NOW / PAY SMALL SMALL */}

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-bold">
            My Outside Account Requests
          </h2>
          <p className="mt-2 text-slate-400">
            Track outside prop accounts you requested from the Marketplace and
            continue any linked Pay Small Small plan.
          </p>
          <a
            href="/marketplace"
            className="mt-3 inline-block text-sm font-semibold text-amber-400"
          >
            Request another account in Marketplace â†’
          </a>
        </div>

        <div className="mt-5">
          <div className="hidden rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Enter Your Account Details
            </h3>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select
                value={outsidePropFirmId}
                onChange={(event) => setOutsidePropFirmId(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              >
                <option value="">Select prop firm *</option>
                {outsidePropFirms.map((firm) => (
                  <option key={firm.id} value={firm.id}>
                    {firm.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Account size e.g. $100,000 *"
                value={outsideAccountSize}
                onChange={(event) => setOutsideAccountSize(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Account type/phase e.g. 2-Step"
                value={outsidePhase}
                onChange={(event) => setOutsidePhase(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="number"
                min="1"
                placeholder="Current account price in NGN *"
                value={outsideAccountPrice}
                onChange={(event) => setOutsideAccountPrice(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="email"
                placeholder="Purchase email *"
                value={outsidePurchaseEmail}
                onChange={(event) => setOutsidePurchaseEmail(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="password"
                placeholder="Prop-firm portal password (optional)"
                value={outsidePortalPassword}
                onChange={(event) =>
                  setOutsidePortalPassword(event.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              {outsidePropFirmId && (() => {
                const selectedFirm = outsidePropFirms.find(
                  (firm) => firm.id === outsidePropFirmId
                );

                return selectedFirm?.registration_url ? (
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3 text-sm sm:col-span-2">
                    <span className="text-slate-300">
                      Not registered with {selectedFirm.name}?{" "}
                    </span>
                    <a
                      href={selectedFirm.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sky-300 underline"
                    >
                      {selectedFirm.registration_link_label ||
                        "Register with this prop firm"}
                    </a>
                  </div>
                ) : (
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300 sm:col-span-2">
                    Registration link unavailable. Please contact support if
                    you are not registered with this prop firm.
                  </p>
                );
              })()}

              <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-300 sm:col-span-2">
                If you provide a portal password, do not enter your Gmail,
                Yahoo or email inbox password.
              </p>

              <textarea
                rows={3}
                placeholder="Optional instructions"
                value={outsideNotes}
                onChange={(event) => setOutsideNotes(event.target.value)}
                className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2"
              />
            </div>

            <div className="mt-5 grid gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Account Price</p>
                <p className="mt-1 font-bold">
                  NGN {outsidePricePreview.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Service Fee (5%)</p>
                <p className="mt-1 font-bold text-amber-400">
                  NGN {outsideFeePreview.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Payable</p>
                <p className="mt-1 font-bold text-amber-300">
                  NGN {outsideTargetPreview.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => submitOutsidePropPurchase("buy_now")}
                disabled={submittingOutsideRequest || outsideTargetPreview <= 0}
                className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingOutsideRequest
                  ? "Processing..."
                  : `Buy Now â€” NGN ${outsideTargetPreview.toLocaleString()}`}
              </button>

              <button
                type="button"
                onClick={() =>
                  submitOutsidePropPurchase("pay_small_small")
                }
                disabled={submittingOutsideRequest || outsideTargetPreview <= 0}
                className="rounded-xl bg-[#071A33] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingOutsideRequest
                  ? "Processing..."
                  : "Pay Small Small"}
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Buy Now pays the complete amount from your Fidelity wallet. Pay
              Small Small creates a goal so you can contribute gradually.
              Prices are verified before Fidelity Traders Hub processes the
              final purchase.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">My Outside Requests</h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {outsidePropRequests.length} Requests
              </span>
            </div>

            {outsidePropRequests.length === 0 ? (
              <p className="mt-5 text-sm text-slate-400">
                No outside prop-firm requests yet.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {outsidePropRequests.map((request) => {
                  const goal = outsideSavingsGoals.find(
                    (item) => item.id === request.savings_goal_id
                  );
                  const target = Number(goal?.target_amount || request.total_target || 0);
                  const saved = Number(goal?.saved_amount || 0);
                  const outstanding = Math.max(target - saved, 0);
                  const progress = target > 0
                    ? Math.min(100, Math.round((saved / target) * 100))
                    : 0;

                  return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">{request.prop_firm}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {request.account_size || "Size not provided"}
                          {request.phase ? ` â€” ${request.phase}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-slate-300">
                        {String(request.status).replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500">Purchase Email</p>
                        <p className="mt-1 break-all text-sm font-semibold">
                          {request.purchase_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Target</p>
                        <p className="mt-1 text-sm font-bold">
                          {request.currency || "NGN"}{" "}
                          {Number(request.total_target || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Payment Method</p>
                        <p className="mt-1 text-sm font-semibold">
                          {request.purchase_method === "buy_now"
                            ? "Buy Now"
                            : request.purchase_method === "pay_small_small"
                              ? "Pay Small Small"
                              : "Previous Request"}
                        </p>
                      </div>
                    </div>

                    {request.purchase_method === "pay_small_small" && goal && (
                      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/40 p-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-slate-500">Saved</p>
                            <p className="mt-1 font-bold text-emerald-300">
                              {goal.currency || "NGN"} {saved.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Outstanding</p>
                            <p className="mt-1 font-bold text-amber-300">
                              {goal.currency || "NGN"} {outstanding.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Progress</p>
                            <p className="mt-1 font-bold">{progress}%</p>
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {goal.status === "active" && outstanding > 0 ? (
                          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                            <input
                              type="number"
                              min="1"
                              max={outstanding}
                              placeholder={`Amount to add (max ${outstanding.toLocaleString()})`}
                              value={outsideContributionAmounts[String(goal.id)] || ""}
                              onChange={(event) =>
                                setOutsideContributionAmounts((current) => ({
                                  ...current,
                                  [String(goal.id)]: event.target.value,
                                }))
                              }
                              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                            />
                            <button
                              type="button"
                              onClick={() => contributeToOutsideGoal(request, goal)}
                              disabled={outsideContributingGoalId === goal.id}
                              className="rounded-xl bg-[#071A33] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {outsideContributingGoalId === goal.id
                                ? "Adding..."
                                : "Top Up from Wallet"}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-4 text-sm font-semibold text-emerald-300">
                            Fully funded â€” pending price verification.
                          </p>
                        )}
                      </div>
                    )}

                    {request.status === "pending" && (
                      <p className="mt-3 text-sm text-amber-300">
                        Waiting for Admin price verification.
                      </p>
                    )}
                    {request.status === "saving" && (
                      <p className="mt-3 text-sm text-amber-400">
                        Your Pay Small Small goal is active. Use the top-up
                        control on this request whenever you want to add money.
                      </p>
                    )}
                    {request.status === "fully_funded" && (
                      <p className="mt-3 text-sm text-emerald-300">
                        Fully funded and waiting for final price verification.
                      </p>
                    )}
                    {request.status === "pending_price_verification" && (
                      <p className="mt-3 text-sm text-amber-300">
                        Fully paid. Fidelity Traders Hub is verifying the live
                        account price before processing your purchase.
                      </p>
                    )}
                    {request.status === "variation_required" && (
                      <p className="mt-3 text-sm text-orange-300">
                        A price change requires your attention. Additional
                        amount: {request.currency || "NGN"}{" "}
                        {Number(request.variation_amount || 0).toLocaleString()}.
                        {request.variation_reason
                          ? ` ${request.variation_reason}`
                          : " Please contact support for assistance."}
                      </p>
                    )}
                    {request.status === "variation_pending_payment" && (
                      <p className="mt-3 text-sm text-orange-300">
                        Waiting for the additional price difference to be paid.
                      </p>
                    )}
                    {request.status === "pending_delivery" && (
                      <p className="mt-3 text-sm text-amber-300">
                        Purchase is being processed using your purchase email.
                      </p>
                    )}
                    {request.status === "delivered" && (
                      <p className="mt-3 text-sm text-emerald-300">
                        Deliveredâ€”check your purchase email and spam folder.
                      </p>
                    )}
                    {request.status === "not_delivered" && (
                      <p className="mt-3 text-sm text-red-300">
                        Not delivered. Please contact support below.
                      </p>
                    )}
                    {request.status === "refund_pending" && (
                      <p className="mt-3 text-sm text-amber-300">
                        Refund pending: {request.currency || "NGN"}{" "}
                        {Number(request.refund_amount || 0).toLocaleString()}.
                      </p>
                    )}
                    {request.status === "refunded" && (
                      <p className="mt-3 text-sm text-emerald-300">
                        Refund completed.
                      </p>
                    )}
                    {request.status === "rejected" && (
                      <p className="mt-3 text-sm text-red-300">
                        Request rejected. Please contact support for details.
                      </p>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MY PROP PURCHASES */}
      <div id="my-purchases" className="scroll-mt-24" />

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">
              My Prop Purchases
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Track payment and email delivery of your prop account.
            </p>
          </div>

          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-400">
            {
              propPurchases.filter(
                (purchase) =>
                  purchase.fulfillment_status === "pending_delivery"
              ).length
            }{" "}
            Pending
          </span>
        </div>

        {propPurchases.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">
              No prop account purchases yet. Buy an account or start Pay Small
              Small from the marketplace.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {propPurchases.map((purchase) => {
              const offer = Array.isArray(purchase.prop_offers)
                ? purchase.prop_offers[0]
                : purchase.prop_offers;
              const program = Array.isArray(offer?.prop_programs)
                ? offer.prop_programs[0]
                : offer?.prop_programs;
              const firm = Array.isArray(program?.prop_firms)
                ? program.prop_firms[0]
                : program?.prop_firms;
              const isDelivered =
                purchase.fulfillment_status === "delivered";
              const isNotDelivered =
                purchase.fulfillment_status === "not_delivered";

              return (
                <div
                  key={purchase.id}
                  className={`rounded-2xl border bg-slate-900 p-5 ${
                    isDelivered
                      ? "border-emerald-500/30"
                      : isNotDelivered
                        ? "border-red-500/30"
                        : "border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-amber-400">
                        {firm?.name || "Prop Firm"}
                      </p>
                      <h3 className="mt-1 text-lg font-bold">
                        {program?.name || "Prop Account"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        USD {Number(offer?.account_size ?? 0).toLocaleString()}
                        {program?.phase ? ` â€” ${program.phase}` : ""}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        isDelivered
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isNotDelivered
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {String(purchase.fulfillment_status).replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">Account Fee Paid</p>
                      <p className="mt-1 font-bold">
                        {purchase.currency || "NGN"}{" "}
                        {Number(purchase.amount_paid).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">Purchase Method</p>
                      <p className="mt-1 font-semibold capitalize">
                        {String(purchase.purchase_type).replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  {purchase.fulfillment_status === "pending_delivery" && (
                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <p className="font-semibold text-amber-300">
                        Payment completeâ€”delivery pending
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Fidelity Traders Hub is processing your order. The prop
                        firm will send the account directly to your registered
                        email address.
                      </p>
                    </div>
                  )}

                  {isDelivered && (
                    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="font-semibold text-emerald-300">
                        Account deliveredâ€”check your email
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Check your inbox and spam folder for the message from
                        the prop firm. Contact support through this Dashboard if
                        you cannot find it.
                      </p>
                    </div>
                  )}

                  {isNotDelivered && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="font-semibold text-red-300">
                        Account not delivered
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Please contact Fidelity Traders Hub through the support
                        chat below for assistance.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* MY ACCOUNTS */}
      <div id="my-accounts" className="scroll-mt-24" />

      <section id="trading-accounts" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            My Accounts
          </h2>

          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            {clientAccounts.length} Accounts
          </span>
        </div>

        {clientAccounts.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">
              No trading accounts assigned yet.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {clientAccounts.map(
              (account) => (
                <div
                  key={account.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-bold">
                        {
                          account.account_name
                        }
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {account.prop_firm ||
                          "No prop firm"}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                      {account.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">
                        Account Size
                      </p>

                      <p className="mt-1 font-semibold">
                        {
                          account.account_size
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Phase
                      </p>

                      <p className="mt-1 font-semibold">
                        {account.phase}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Amount Paid
                      </p>

                      <p className="mt-1 font-semibold">
                        â‚¦
                        {Number(
                          account.amount_paid
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Status
                      </p>

                      <p className="mt-1 font-semibold capitalize">
                        {account.status}
                      </p>
                    </div>
                  </div>

                  {account.co_sponsor_visible && (
                    <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                      <p className="text-sm font-semibold text-blue-300">
                        Co-sponsor Details
                      </p>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-500">
                            Name
                          </p>

                          <p className="mt-1 font-semibold">
                            {account.co_sponsor_name || "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Phone
                          </p>

                          <p className="mt-1 font-semibold">
                            {account.co_sponsor_phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* FLOATING SUPPORT CHAT */}
      <button
        type="button"
        onClick={() => setSupportOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-4 font-semibold shadow-2xl shadow-blue-950/50 hover:bg-blue-500"
      >
        <span className="text-xl">ðŸ’¬</span>
        Support
      </button>

      {supportOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/60 p-4 sm:p-6">
          <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h2 className="font-bold">Fidelity Support</h2>
                <p className="text-xs text-slate-400">We are here to help.</p>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {supportMessages.length === 0 ? (
                <div className="rounded-xl bg-slate-950 p-4 text-sm text-slate-400">
                  No messages yet. Send us a message whenever you need help.
                </div>
              ) : (
                supportMessages.map((supportMessage) => (
                  <div
                    key={supportMessage.id}
                    className={`flex ${
                      supportMessage.sender_role === "customer"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        supportMessage.sender_role === "customer"
                          ? "bg-blue-600"
                          : "bg-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{supportMessage.message}</p>
                      <p className="mt-2 text-[10px] opacity-60">
                        {new Date(supportMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-800 p-4">
              <textarea
                rows={3}
                placeholder="Type your message..."
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
              />
              <button
                type="button"
                disabled={sendingMessage || !newMessage.trim()}
                onClick={sendSupportMessage}
                className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50"
              >
                {sendingMessage ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .fth-client-dashboard {
          background: #05090c !important;
          color: #ffffff !important;
        }

        .fth-client-dashboard aside {
          background: #050b0d !important;
          border-color: #1d292e !important;
        }

        .fth-client-dashboard aside a,
        .fth-client-dashboard aside button {
          color: #f1f5f5 !important;
        }

        .fth-client-dashboard aside a[href="/dashboard"] {
          background: #b7ff00 !important;
          color: #071006 !important;
        }

        .fth-client-dashboard .bg-slate-900 {
          background: #0b1216 !important;
        }

        .fth-client-dashboard .bg-slate-950,
        .fth-client-dashboard .bg-slate-950\/40 {
          background: #070d10 !important;
        }

        .fth-client-dashboard .bg-slate-800 {
          background: #182126 !important;
        }

        .fth-client-dashboard .border-slate-800,
        .fth-client-dashboard .border-slate-700 {
          border-color: #26343a !important;
        }

        .fth-client-dashboard .text-slate-300,
        .fth-client-dashboard .text-slate-400,
        .fth-client-dashboard .text-slate-500 {
          color: #bac7cc !important;
        }

        .fth-client-dashboard a.bg-amber-400,
        .fth-client-dashboard button.bg-amber-400,
        .fth-client-dashboard .bg-blue-600 {
          background: #b7ff00 !important;
          color: #071006 !important;
        }

        .fth-client-dashboard a.bg-amber-400:hover,
        .fth-client-dashboard button.bg-amber-400:hover,
        .fth-client-dashboard .bg-blue-600:hover {
          background: #a6e600 !important;
        }

        .fth-client-dashboard .fth-payment-summary,
        .fth-client-dashboard .fth-journal-teaser {
          background-image: none !important;
        }

        .fth-client-dashboard .fth-journal-preview {
          background: #0b1216 !important;
          color: #ffffff !important;
        }

        .fth-client-dashboard .fth-journal-preview h2 {
          color: #ffffff !important;
        }

        :root[data-theme="light"] .fth-client-dashboard {
          background: #f4f7fb !important;
          color: #0b1828 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard aside {
          background: #ffffff !important;
          border-color: #d9e2ec !important;
        }

        :root[data-theme="light"] .fth-client-dashboard aside a,
        :root[data-theme="light"] .fth-client-dashboard aside button {
          color: #526477 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard aside a[href="/dashboard"] {
          background: #eaf0ff !important;
          color: #405de6 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .bg-slate-900 {
          background: #ffffff !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .bg-slate-950,
        :root[data-theme="light"] .fth-client-dashboard .bg-slate-950\/40 {
          background: #f0f4f8 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .bg-slate-800 {
          background: #e5ebf2 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .border-slate-800,
        :root[data-theme="light"] .fth-client-dashboard .border-slate-700 {
          border-color: #d7e0ea !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .text-white {
          color: #0b1828 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .text-slate-300,
        :root[data-theme="light"] .fth-client-dashboard .text-slate-400,
        :root[data-theme="light"] .fth-client-dashboard .text-slate-500 {
          color: #5e6f82 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .fth-journal-preview {
          background: #ffffff !important;
          color: #0b1828 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .fth-journal-preview h2,
        :root[data-theme="light"] .fth-client-dashboard .fth-journal-preview .font-bold {
          color: #0b1828 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .fth-journal-preview .bg-white\/5 {
          background: #f0f4f8 !important;
          border-color: #d7e0ea !important;
        }

        .fth-client-dashboard .text-purple-300,
        .fth-client-dashboard .text-purple-400,
        .fth-client-dashboard .text-blue-300,
        .fth-client-dashboard .text-blue-400 {
          color: #b7ff00 !important;
        }

        .fth-client-dashboard .fth-primary-button {
          background: #b7ff00 !important;
          color: #071006 !important;
          box-shadow: 0 12px 30px rgba(183, 255, 0, 0.14);
        }

        .fth-client-dashboard .fth-primary-button:hover {
          background: #a6e600 !important;
        }

        /* One visual language across the client portal. Status colours must
           never colour an entire card or section. */
        .fth-client-dashboard [class*="border-amber"],
        .fth-client-dashboard [class*="border-emerald"],
        .fth-client-dashboard [class*="border-purple"],
        .fth-client-dashboard [class*="border-blue"] {
          border-color: #26343a !important;
        }

        .fth-client-dashboard [class*="bg-amber-500/"],
        .fth-client-dashboard [class*="bg-emerald-500/"],
        .fth-client-dashboard [class*="bg-purple-500/"],
        .fth-client-dashboard [class*="bg-blue-500/"] {
          background-color: #141d20 !important;
        }

        .fth-client-dashboard a.bg-blue-600,
        .fth-client-dashboard button.bg-blue-600 {
          background-color: #b7ff00 !important;
          border-color: #b7ff00 !important;
          color: #071006 !important;
        }

        .fth-client-dashboard a.bg-blue-600:hover,
        .fth-client-dashboard button.bg-blue-600:hover {
          background-color: #a6e600 !important;
        }

        /* Final dashboard design system: calm, consistent and accessible. */
        .fth-client-dashboard > div > div {
          width: 100%;
        }

        .fth-client-dashboard > div > div > div {
          max-width: 1680px;
          margin-inline: auto;
        }

        .fth-client-dashboard .fth-sidebar-brand {
          background: transparent !important;
        }

        .fth-client-dashboard .fth-sidebar-nav a,
        .fth-client-dashboard .fth-sidebar-nav button {
          opacity: 1 !important;
          font-weight: 700;
        }

        .fth-client-dashboard .fth-sidebar-nav a:hover,
        .fth-client-dashboard .fth-sidebar-nav button:hover {
          background: #111a1d !important;
          color: #b7ff00 !important;
        }

        .fth-client-dashboard .fth-sidebar-nav .fth-nav-active:hover {
          background: #b7ff00 !important;
          color: #071006 !important;
        }

        .fth-client-dashboard .fth-brand-light {
          display: none;
        }

        .fth-client-dashboard .fth-brand-dark {
          display: block;
        }

        .fth-client-dashboard aside img {
          max-height: 46px;
          width: auto;
          object-fit: contain;
        }

        .fth-client-dashboard header h1,
        .fth-client-dashboard section h2,
        .fth-client-dashboard section h3 {
          letter-spacing: -0.025em;
        }

        .fth-client-dashboard .text-amber-400 {
          color: #b7ff00 !important;
        }

        .fth-client-dashboard .fth-payment-summary {
          border-color: #2c3b40 !important;
        }

        .fth-client-dashboard .fth-journal-preview {
          border-color: #2c3b40 !important;
          box-shadow: none !important;
        }

        .fth-client-dashboard section {
          scroll-margin-top: 24px;
        }

        :root[data-theme="light"] .fth-client-dashboard .fth-brand-light {
          display: block;
        }

        :root[data-theme="light"] .fth-client-dashboard .fth-brand-dark {
          display: none;
        }

        :root[data-theme="light"] .fth-client-dashboard .text-amber-400 {
          color: #3157d5 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard [class*="border-amber"],
        :root[data-theme="light"] .fth-client-dashboard [class*="border-emerald"],
        :root[data-theme="light"] .fth-client-dashboard [class*="border-purple"],
        :root[data-theme="light"] .fth-client-dashboard [class*="border-blue"] {
          border-color: #d7e0ea !important;
        }

        :root[data-theme="light"] .fth-client-dashboard [class*="bg-amber-500/"],
        :root[data-theme="light"] .fth-client-dashboard [class*="bg-emerald-500/"],
        :root[data-theme="light"] .fth-client-dashboard [class*="bg-purple-500/"],
        :root[data-theme="light"] .fth-client-dashboard [class*="bg-blue-500/"] {
          background-color: #eef3f8 !important;
        }

        :root[data-theme="light"] .fth-client-dashboard .fth-payment-summary,
        :root[data-theme="light"] .fth-client-dashboard .fth-journal-preview {
          border-color: #d7e0ea !important;
        }

        @media (min-width: 1024px) {
          .fth-client-dashboard aside .sticky {
            height: 100vh;
            overflow-y: auto;
          }
        }
      `}</style>
            </div>
          </div>
      </div>
    </main>
  );
}