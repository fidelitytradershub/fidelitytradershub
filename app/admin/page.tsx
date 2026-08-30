"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BrandLogo from "../BrandLogo";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState("announcements");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [requestingNotificationPermission, setRequestingNotificationPermission] = useState(false);
  const [adminDebug, setAdminDebug] = useState<{
    userId: string;
    email: string;
    profileRole: string | null;
  } | null>(null);

  // ADMIN
  const [adminUserId, setAdminUserId] = useState("");

  // CLIENT DIRECTORY
  const [clientProfiles, setClientProfiles] = useState<any[]>([]);

  // DEPOSITS
  const [deposits, setDeposits] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // FTH CUSTOMER PAYMENT ACCOUNT
  const [businessPaymentAccounts, setBusinessPaymentAccounts] = useState<any[]>([]);
  const [businessBankName, setBusinessBankName] = useState("");
  const [businessAccountName, setBusinessAccountName] = useState("");
  const [businessAccountNumber, setBusinessAccountNumber] = useState("");
  const [businessPaymentInstructions, setBusinessPaymentInstructions] = useState("");
  const [savingBusinessAccount, setSavingBusinessAccount] = useState(false);

  // WITHDRAWALS
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<any[]>([]);
  const [withdrawalBankAccounts, setWithdrawalBankAccounts] = useState<any[]>([]);
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState<string | null>(null);

  // CLIENT ACCOUNT FORM
  const [clientUserId, setClientUserId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [propFirm, setPropFirm] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [phase, setPhase] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [accountStatus, setAccountStatus] = useState("working_on");

  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [savingAccount, setSavingAccount] = useState(false);
  const [archivedRecords, setArchivedRecords] = useState<any[]>([]);
  const [processingArchiveKey, setProcessingArchiveKey] = useState<string | null>(null);

  // TRADINGVIEW
  const [tvUserId, setTvUserId] = useState("");
  const [tvPlanName, setTvPlanName] = useState("");
  const [tvLoginEmail, setTvLoginEmail] = useState("");
  const [tvLoginPassword, setTvLoginPassword] = useState("");
  const [tvDeliveryNote, setTvDeliveryNote] = useState("");
  const [tvDetailsVisible, setTvDetailsVisible] = useState(false);
  const [tvStatus, setTvStatus] = useState("active");
  const [tvCoSponsorName, setTvCoSponsorName] = useState("");
  const [tvCoSponsorPhone, setTvCoSponsorPhone] = useState("");
  const [tvCoSponsorVisible, setTvCoSponsorVisible] = useState(false);
  const [savingTvPlan, setSavingTvPlan] = useState(false);
  const [tvSubscriptions, setTvSubscriptions] = useState<any[]>([]);
  const [tvPendingDeliveries, setTvPendingDeliveries] = useState<any[]>([]);
  const [tvDeliveryDrafts, setTvDeliveryDrafts] = useState<
    Record<string, {
      loginEmail: string;
      loginPassword: string;
      deliveryNote: string;
      coSponsorName: string;
      coSponsorPhone: string;
      showCoSponsor: boolean;
    }>
  >({});
  const [activatingTvPurchaseId, setActivatingTvPurchaseId] =
    useState<string | null>(null);

  // SUPPORT MESSAGING
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [selectedSupportUser, setSelectedSupportUser] = useState("");
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // PROP FIRM REQUESTS
  const [propFirmRequests, setPropFirmRequests] = useState<any[]>([]);
  const [processingPropFirmRequestId, setProcessingPropFirmRequestId] = useState<string | null>(null);

  // PROP FIRM INVENTORY
  // Correct Fidelity Traders Hub schema:
  // keep existing deposits/client_accounts/withdrawals/TradingView systems,
  // and layer prop_firms -> prop_programs -> prop_offers on top.
  const [propFirms, setPropFirms] = useState<any[]>([]);
  const [propPrograms, setPropPrograms] = useState<any[]>([]);
  const [propOffers, setPropOffers] = useState<any[]>([]);

  // PROP PURCHASE DELIVERIES
  const [propPurchaseApprovals, setPropPurchaseApprovals] = useState<any[]>([]);
  const [processingPurchaseId, setProcessingPurchaseId] = useState<string | null>(null);

  const [newFirmName, setNewFirmName] = useState("");
  const [newFirmRegistrationUrl, setNewFirmRegistrationUrl] = useState("");
  const [newFirmLinkLabel, setNewFirmLinkLabel] = useState(
    "Register with this prop firm"
  );
  const [firmLinkDrafts, setFirmLinkDrafts] = useState<
    Record<string, { registration_url: string; registration_link_label: string; active: boolean }>
  >({});
  const [savingFirmLinkId, setSavingFirmLinkId] = useState<string | null>(null);
  const [savingFirm, setSavingFirm] = useState(false);

  const [programFirmId, setProgramFirmId] = useState("");
  const [programName, setProgramName] = useState("");
  const [programPhase, setProgramPhase] = useState("");
  const [programCurrency, setProgramCurrency] = useState("USD");
  const [programAccountSizes, setProgramAccountSizes] = useState("");
  const [savingProgram, setSavingProgram] = useState(false);

  const [offerProgramId, setOfferProgramId] = useState("");
  const [offerAccountSize, setOfferAccountSize] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerCurrency, setOfferCurrency] = useState("NGN");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerFeatures, setOfferFeatures] = useState("");
  const [offerStock, setOfferStock] = useState("1");
  const [offerAllowBuyNow, setOfferAllowBuyNow] = useState(true);
  const [offerAllowPaySmallSmall, setOfferAllowPaySmallSmall] = useState(true);
  const [offerActive, setOfferActive] = useState(true);
  const [savingOffer, setSavingOffer] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // TRADINGVIEW PLAN CATALOG
  const [tvCatalogPlans, setTvCatalogPlans] = useState<any[]>([]);
  const [tvCatalogEditingId, setTvCatalogEditingId] = useState<string | null>(null);
  const [tvCatalogName, setTvCatalogName] = useState("");
  const [tvCatalogTier, setTvCatalogTier] = useState("premium");
  const [tvCatalogAccessType, setTvCatalogAccessType] = useState("individual");
  const [tvCatalogDurationDays, setTvCatalogDurationDays] = useState("30");
  const [tvCatalogPrice, setTvCatalogPrice] = useState("");
  const [tvCatalogCurrency, setTvCatalogCurrency] = useState("NGN");
  const [tvCatalogDescription, setTvCatalogDescription] = useState("");
  const [tvCatalogFeatures, setTvCatalogFeatures] = useState("");
  const [tvCatalogAllowBuyNow, setTvCatalogAllowBuyNow] = useState(true);
  const [tvCatalogAllowPaySmallSmall, setTvCatalogAllowPaySmallSmall] = useState(true);
  const [tvCatalogActive, setTvCatalogActive] = useState(true);
  const [savingTvCatalogPlan, setSavingTvCatalogPlan] = useState(false);
  const [processingTvCatalogPlanId, setProcessingTvCatalogPlanId] = useState<string | null>(null);

  // ANNOUNCEMENTS
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [publishingAnnouncement, setPublishingAnnouncement] = useState(false);

  // REFERRALS & DISCOUNTS
  const [referralPartners, setReferralPartners] = useState<any[]>([]);
  const [referralCodes, setReferralCodes] = useState<any[]>([]);
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [referralCommissions, setReferralCommissions] = useState<any[]>([]);
  const [partnerPayouts, setPartnerPayouts] = useState<any[]>([]);
  const [referralLinkClicks, setReferralLinkClicks] = useState<any[]>([]);
  const [partnerUserId, setPartnerUserId] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerCommissionRate, setPartnerCommissionRate] = useState("10");
  const [partnerMinimumPayout, setPartnerMinimumPayout] = useState("10000");
  const [partnerHoldDays, setPartnerHoldDays] = useState("7");
  const [savingPartner, setSavingPartner] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountKind, setDiscountKind] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discountScope, setDiscountScope] = useState("all");
  const [discountMaximum, setDiscountMaximum] = useState("");
  const [discountMinimumOrder, setDiscountMinimumOrder] = useState("0");
  const [discountMaxUses, setDiscountMaxUses] = useState("");
  const [discountPerUser, setDiscountPerUser] = useState("1");
  const [discountExpiry, setDiscountExpiry] = useState("");
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [processingPartnerPayoutId, setProcessingPartnerPayoutId] = useState<string | null>(null);

  // TRADE JOURNAL — embedded in the main FTH admin workspace
  const [journalSubscriptions, setJournalSubscriptions] = useState<any[]>([]);
  const [journalPayments, setJournalPayments] = useState<any[]>([]);
  const [journalActivationCodes, setJournalActivationCodes] = useState<any[]>([]);
  const [journalPricingPlans, setJournalPricingPlans] = useState<any[]>([]);
  const [journalAccessMode, setJournalAccessMode] = useState("premium");
  const [journalPaymentFilter, setJournalPaymentFilter] = useState("pending");
  const [journalUserSearch, setJournalUserSearch] = useState("");
  const [journalCodeMonths, setJournalCodeMonths] = useState("1");
  const [processingJournalPaymentId, setProcessingJournalPaymentId] = useState<string | null>(null);
  const [processingJournalCodeId, setProcessingJournalCodeId] = useState<string | null>(null);
  const [savingJournalPriceMonths, setSavingJournalPriceMonths] = useState<number | null>(null);
  const [savingJournalAccess, setSavingJournalAccess] = useState(false);
  const [processingJournalUserId, setProcessingJournalUserId] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------

  async function loadTradeJournalWorkspace() {
    const [subscriptionsResult, paymentsResult, codesResult, pricingResult, accessResult] =
      await Promise.all([
        supabase
          .from("trade_journal_subscriptions")
          .select("*")
          .order("updated_at", { ascending: false }),
        supabase
          .from("trade_journal_payments")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("trade_journal_activation_codes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("trade_journal_pricing_plans")
          .select("*")
          .order("duration_months", { ascending: true }),
        supabase
          .from("trade_journal_access_settings")
          .select("access_mode")
          .eq("id", 1)
          .maybeSingle(),
      ]);

    if (subscriptionsResult.error) {
      console.error("Error loading journal subscriptions:", subscriptionsResult.error);
    } else {
      setJournalSubscriptions(subscriptionsResult.data ?? []);
    }

    if (paymentsResult.error) {
      console.error("Error loading journal payments:", paymentsResult.error);
    } else {
      setJournalPayments(paymentsResult.data ?? []);
    }

    if (codesResult.error) {
      console.error("Error loading journal activation codes:", codesResult.error);
    } else {
      setJournalActivationCodes(codesResult.data ?? []);
    }

    if (pricingResult.error) {
      console.error("Error loading journal pricing:", pricingResult.error);
    } else {
      setJournalPricingPlans(pricingResult.data ?? []);
    }

    if (accessResult.error) {
      console.error("Error loading journal access settings:", accessResult.error);
    } else {
      setJournalAccessMode(accessResult.data?.access_mode ?? "premium");
    }
  }

  async function loadReferralWorkspace() {
    const [partnersResult, codesResult, discountsResult, commissionsResult, payoutsResult, clicksResult] =
      await Promise.all([
        supabase.from("partner_dashboard_summary").select("*").order("display_name"),
        supabase.from("referral_codes").select("*").order("created_at", { ascending: false }),
        supabase.from("discount_codes").select("*").is("archived_at", null).order("created_at", { ascending: false }),
        supabase.from("referral_commissions").select("*").order("created_at", { ascending: false }).limit(250),
        supabase.from("partner_payout_requests").select("*").order("requested_at", { ascending: false }),
        supabase.from("referral_link_clicks").select("id,partner_id,referred_user_id,clicked_at").order("clicked_at", { ascending: false }).limit(500),
      ]);

    if (partnersResult.error) console.error("Error loading referral partners:", partnersResult.error);
    if (codesResult.error) console.error("Error loading referral codes:", codesResult.error);
    if (discountsResult.error) console.error("Error loading discount codes:", discountsResult.error);
    if (commissionsResult.error) console.error("Error loading referral commissions:", commissionsResult.error);
    if (payoutsResult.error) console.error("Error loading partner payouts:", payoutsResult.error);
    if (clicksResult.error) console.error("Error loading referral link clicks:", clicksResult.error);

    setReferralPartners(partnersResult.data ?? []);
    setReferralCodes(codesResult.data ?? []);
    setDiscountCodes(discountsResult.data ?? []);
    setReferralCommissions(commissionsResult.data ?? []);
    setPartnerPayouts(payoutsResult.data ?? []);
    setReferralLinkClicks(clicksResult.data ?? []);
  }

  async function loadPendingDeposits() {
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .is("archived_at", null)
      .in("status", ["pending", "awaiting_verification"])
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error loading deposits:", error);
      return;
    }

    setDeposits(data ?? []);
  }

  async function loadAdminNotifications() {
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("id, event_type, title, message, target_section, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading Admin notifications:", error);
      return;
    }

    setAdminNotifications(data ?? []);
  }

  function playAdminNotificationSound() {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.36);
    } catch (error) {
      console.warn("Notification sound could not play:", error);
    }
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    setRequestingNotificationPermission(true);
    const permission = await Notification.requestPermission();
    setRequestingNotificationPermission(false);

    if (permission === "granted") {
      new Notification("Fidelity Traders Hub", {
        body: "Admin notifications are now enabled on this device.",
        icon: "/brand/fidelity-mark.png",
      });
    } else {
      alert("Notification permission was not enabled. You can change it from your browser site settings.");
    }
  }

  async function openAdminNotification(notification: any) {
    if (!notification.read_at) {
      const readAt = new Date().toISOString();
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read_at: readAt })
        .eq("id", notification.id);

      if (!error) {
        setAdminNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, read_at: readAt } : item
          )
        );
      }
    }

    setActiveAdminSection(notification.target_section || "announcements");
    setNotificationPanelOpen(false);
  }

  async function loadBusinessPaymentAccounts() {
    const { data, error } = await supabase
      .from("business_payment_accounts")
      .select(
        "id, bank_name, account_name, account_number, currency, payment_instructions, active, is_default, created_at, updated_at"
      )
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading business payment accounts:", error);
      return;
    }

    const accounts = data ?? [];
    setBusinessPaymentAccounts(accounts);

    const currentDefault =
      accounts.find((account) => account.is_default) ?? accounts[0];

    if (currentDefault) {
      setBusinessBankName(currentDefault.bank_name || "");
      setBusinessAccountName(currentDefault.account_name || "");
      setBusinessAccountNumber(currentDefault.account_number || "");
      setBusinessPaymentInstructions(
        currentDefault.payment_instructions || ""
      );
    }
  }

  async function loadPendingWithdrawals() {
    const { data, error } = await supabase
      .from("withdrawals")
      .select(
        "id, user_id, wallet_id, bank_account_id, reference, requested_amount, processing_fee, net_amount, currency, status, rejection_reason, requested_at"
      )
      .is("archived_at", null)
      .eq("status", "pending")
      .order("requested_at", { ascending: false });

    if (error) {
      console.error("Error loading withdrawals:", error);
      return;
    }

    setWithdrawals(data ?? []);
  }

  async function loadApprovedWithdrawals() {
    const { data, error } = await supabase
      .from("withdrawals")
      .select(
        "id, user_id, wallet_id, bank_account_id, reference, requested_amount, processing_fee, net_amount, currency, status, rejection_reason, requested_at, approved_at, processing_at"
      )
      .is("archived_at", null)
      .eq("status", "approved")
      .order("approved_at", { ascending: false });

    if (error) {
      console.error("Error loading approved withdrawals:", error);
      return;
    }

    setApprovedWithdrawals(data ?? []);
  }

  async function loadWithdrawalBankAccounts() {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select(
        "id, user_id, bank_name, bank_code, account_number, account_name, verification_status, is_default"
      );

    if (error) {
      console.error("Error loading withdrawal bank accounts:", error);
      return;
    }

    setWithdrawalBankAccounts(data ?? []);
  }

  async function loadClientAccounts() {
    const { data, error } = await supabase
      .from("client_accounts")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading client accounts:", error);
      return;
    }

    setClientAccounts(data ?? []);
  }

  const archiveTables = [
    "client_accounts",
    "tradingview_purchases",
    "tradingview_subscriptions",
    "prop_offer_purchases",
    "prop_firm_requests",
    "deposits",
    "withdrawals",
  ] as const;

  async function loadArchivedRecords() {
    const results = await Promise.all(
      archiveTables.map(async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .not("archived_at", "is", null)
          .order("archived_at", { ascending: false });
        if (error) {
          console.error(`Error loading archive ${table}:`, error);
          return [];
        }
        return (data ?? []).map((record) => ({ ...record, __table: table }));
      })
    );
    setArchivedRecords(results.flat().sort((a, b) =>
      new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime()
    ));
  }

  async function archiveRecord(table: string, id: string) {
    const reason = window.prompt("Reason for archiving (optional):");
    if (reason === null) return;
    const key = `${table}:${id}`;
    setProcessingArchiveKey(key);
    const { error } = await supabase.rpc("admin_archive_record", {
      p_table: table,
      p_id: id,
      p_reason: reason.trim() || null,
    });
    setProcessingArchiveKey(null);
    if (error) return alert(`Could not archive: ${error.message}`);
    await Promise.all([loadClientAccounts(), loadArchivedRecords()]);
  }

  async function restoreRecord(table: string, id: string) {
    const key = `${table}:${id}`;
    setProcessingArchiveKey(key);
    const { error } = await supabase.rpc("admin_restore_record", { p_table: table, p_id: id });
    setProcessingArchiveKey(null);
    if (error) return alert(`Could not restore: ${error.message}`);
    await Promise.all([loadClientAccounts(), loadArchivedRecords()]);
  }

  async function permanentlyDeleteRecord(table: string, id: string) {
    if (!window.confirm("Permanently delete this archived operational record? This cannot be undone.")) return;
    const key = `${table}:${id}`;
    setProcessingArchiveKey(key);
    const { error } = await supabase.rpc("admin_permanently_delete_record", { p_table: table, p_id: id });
    setProcessingArchiveKey(null);
    if (error) return alert(`Could not permanently delete: ${error.message}`);
    await loadArchivedRecords();
  }

  async function loadTradingViewSubscriptions() {
    const { data, error } = await supabase
      .from("tradingview_subscriptions")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error loading TradingView subscriptions:",
        error
      );
      return;
    }

    setTvSubscriptions(data ?? []);
  }

  async function loadTradingViewCatalogPlans() {
    const { data, error } = await supabase
      .from("tradingview_plans")
      .select("id, name, tier, access_type, duration_days, price, currency, description, features, allow_buy_now, allow_pay_small_small, active, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading TradingView plans:", error);
      return;
    }

    setTvCatalogPlans(data ?? []);
  }

  async function loadSupportMessages() {
    const { data, error } = await supabase
      .from("support_messages")
      .select(
        "id, user_id, sender_role, message, is_read, created_at"
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading support messages:", error);
      return;
    }

    const messages = data ?? [];

    setSupportMessages(messages);

    if (!selectedSupportUser && messages.length > 0) {
      setSelectedSupportUser(messages[0].user_id);
    }
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

  async function loadClientProfiles() {
    const { data, error } = await supabase
      .rpc("get_admin_customers");

    if (error) {
      console.error("Error loading client profiles:", error);
      return;
    }

    setClientProfiles(data ?? []);
  }

  async function loadPropFirmRequests() {
    const { data, error } = await supabase
      .from("prop_firm_requests")
      .select("id, user_id, prop_firm, account_size, phase, notes, status, admin_note, created_at, updated_at")
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading prop firm requests:", error);
      return;
    }

    setPropFirmRequests(data ?? []);
  }

  async function loadPropInventory() {
    const [
      { data: firmsData, error: firmsError },
      { data: programsData, error: programsError },
      { data: offersData, error: offersError },
    ] = await Promise.all([
      supabase
        .from("prop_firms")
        .select("id, name, slug, active, registration_url, registration_link_label, created_at, updated_at")
        .is("archived_at", null)
        .order("name", { ascending: true }),

      supabase
        .from("prop_programs")
        .select("id, firm_id, name, phase, native_currency, account_sizes, rules")
        .is("archived_at", null)
        .order("name", { ascending: true }),

      supabase
        .from("prop_offers")
        .select(
          "id, program_id, account_size, price, currency, description, features, stock_quantity, allow_buy_now, allow_pay_small_small, active, created_at, updated_at"
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
    ]);

    if (firmsError) {
      console.error("Error loading prop firms:", firmsError);
    } else {
      const firms = firmsData ?? [];
      setPropFirms(firms);
      setFirmLinkDrafts(
        Object.fromEntries(
          firms.map((firm) => [
            firm.id,
            {
              registration_url: firm.registration_url || "",
              registration_link_label:
                firm.registration_link_label || "Register with this prop firm",
              active: firm.active !== false,
            },
          ])
        )
      );
    }

    if (programsError) {
      console.error("Error loading prop programs:", programsError);
    } else {
      setPropPrograms(programsData ?? []);
    }

    if (offersError) {
      console.error("Error loading prop offers:", offersError);
    } else {
      setPropOffers(offersData ?? []);
    }
  }

  async function loadPropPurchaseApprovals() {
    const { data, error } = await supabase
      .from("prop_offer_purchases")
      .select(
        `
          id,
          user_id,
          offer_id,
          purchase_type,
          total_price,
          amount_paid,
          currency,
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
      .in("fulfillment_status", [
        "pending_delivery",
        "delivered",
        "not_delivered",
      ])
      .order("funded_at", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error loading prop purchase approvals:", error);
      return;
    }

    setPropPurchaseApprovals(data ?? []);
  }

  function getClientLabel(profile: any) {
    const fullName =
      profile.full_name?.trim?.() ||
      [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    const preferredName =
      profile.nickname?.trim?.() ||
      profile.display_name?.trim?.() ||
      fullName;

    if (preferredName && profile.email) {
      return `${preferredName} — ${profile.email}`;
    }

    if (preferredName) return preferredName;
    if (profile.email) return profile.email;
    if (profile.phone || profile.phone_number) {
      return profile.phone || profile.phone_number;
    }

    return "Unnamed client";
  }

  function getClientById(userId: string) {
    return clientProfiles.find(
      (profile) =>
        profile.id === userId ||
        profile.user_id === userId
    );
  }

  function getClientFirstName(profile: any) {
    return (
      profile?.nickname?.trim?.() ||
      profile?.first_name?.trim?.() ||
      profile?.full_name?.trim?.()?.split(/\s+/)[0] ||
      "there"
    );
  }

  function getClientWhatsAppNumber(profile: any) {
    const rawPhone = String(
      profile?.phone || profile?.phone_number || ""
    ).trim();

    if (!rawPhone) return "";

    let digits = rawPhone.replace(/\D/g, "");

    // Convert common Nigerian local numbers such as 08012345678 to 2348012345678.
    if (digits.startsWith("0")) {
      digits = `234${digits.slice(1)}`;
    }

    return digits;
  }

  function openClientWhatsApp(profile: any) {
    const phone = getClientWhatsAppNumber(profile);

    if (!phone) {
      alert("This client has no phone number saved.");
      return;
    }

    const firstName = getClientFirstName(profile);
    const defaultMessage = `Hello ${firstName}, this is Fidelity Traders Hub. We are contacting you regarding your account. How may we assist you?`;
    const message = window.prompt(
      "Edit the WhatsApp message before sending:",
      defaultMessage
    );

    if (message === null) return;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message.trim() || defaultMessage)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function getSupportClientLabel(userId: string) {
    const profile = getClientById(userId);
    return profile
      ? getClientLabel(profile)
      : "Client profile unavailable";
  }

  function getJournalClientLabel(userId: string) {
    const profile = getClientById(userId);
    return profile ? getClientLabel(profile) : userId;
  }

  function getJournalSubscription(userId: string) {
    return journalSubscriptions.find((subscription) => subscription.user_id === userId);
  }

  async function setJournalGlobalAccess(nextMode: "premium" | "free_all") {
    const label = nextMode === "free_all" ? "FREE FOR EVERYONE" : "PREMIUM / INDIVIDUAL ACCESS";
    if (!window.confirm(`Change Trade Journal access to ${label}?`)) return;

    setSavingJournalAccess(true);
    const { error } = await supabase.rpc("admin_set_trade_journal_global_access", {
      p_access_mode: nextMode,
    });

    if (error) {
      alert(`Could not change journal access: ${error.message}`);
      setSavingJournalAccess(false);
      return;
    }

    await loadTradeJournalWorkspace();
    setSavingJournalAccess(false);
    alert(nextMode === "free_all" ? "Trade Journal is now free for everyone." : "Trade Journal now uses individual Free/Pro access.");
  }

  async function grantJournalFreeAccess(userId: string) {
    setProcessingJournalUserId(userId);
    const { error } = await supabase.rpc("admin_grant_trade_journal_access", {
      p_user_id: userId,
    });

    if (error) {
      alert(`Could not grant free access: ${error.message}`);
      setProcessingJournalUserId(null);
      return;
    }

    await loadTradeJournalWorkspace();
    setProcessingJournalUserId(null);
    alert("Free Trade Journal access granted to this client.");
  }

  async function revokeJournalFreeAccess(userId: string) {
    if (!window.confirm("Remove this client's complimentary Journal access? Paid access will never be removed by this action.")) return;

    setProcessingJournalUserId(userId);
    const { error } = await supabase.rpc("admin_revoke_trade_journal_access", {
      p_user_id: userId,
    });

    if (error) {
      alert(`Could not revoke free access: ${error.message}`);
      setProcessingJournalUserId(null);
      return;
    }

    await loadTradeJournalWorkspace();
    setProcessingJournalUserId(null);
    alert("Complimentary access removed.");
  }

  async function approveJournalPayment(paymentId: string) {
    const confirmed = window.confirm(
      "Approve this Trade Journal payment and activate/extend the client's Pro access?"
    );
    if (!confirmed) return;

    setProcessingJournalPaymentId(paymentId);
    const { data, error } = await supabase.rpc("admin_approve_trade_journal_payment", {
      p_payment_id: paymentId,
    });

    if (error) {
      alert(`Could not approve journal payment: ${error.message}`);
      setProcessingJournalPaymentId(null);
      return;
    }

    await Promise.all([loadTradeJournalWorkspace(), loadAdminNotifications()]);
    setProcessingJournalPaymentId(null);
    alert(
      `Journal payment approved. Pro access is active until ${new Date(
        data?.end_date
      ).toLocaleDateString()}.`
    );
  }

  async function rejectJournalPayment(paymentId: string) {
    const reason = window.prompt("Enter the reason for rejecting this journal payment:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    setProcessingJournalPaymentId(paymentId);
    const { error } = await supabase.rpc("admin_reject_trade_journal_payment", {
      p_payment_id: paymentId,
      p_reason: reason.trim(),
    });

    if (error) {
      alert(`Could not reject journal payment: ${error.message}`);
      setProcessingJournalPaymentId(null);
      return;
    }

    await Promise.all([loadTradeJournalWorkspace(), loadAdminNotifications()]);
    setProcessingJournalPaymentId(null);
    alert("Journal payment rejected.");
  }

  async function generateJournalActivationCode() {
    const months = Number(journalCodeMonths);
    if (!Number.isInteger(months) || months < 1 || months > 12) {
      alert("Choose a duration between 1 and 12 months.");
      return;
    }

    const { data, error } = await supabase.rpc(
      "admin_generate_trade_journal_activation_code",
      { p_duration_months: months }
    );

    if (error) {
      alert(`Could not generate activation code: ${error.message}`);
      return;
    }

    await loadTradeJournalWorkspace();
    alert(`Activation code generated: ${data?.code}`);
  }

  async function revokeJournalActivationCode(codeId: string) {
    setProcessingJournalCodeId(codeId);
    const { error } = await supabase
      .from("trade_journal_activation_codes")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", codeId)
      .eq("status", "unused");

    if (error) {
      alert(`Could not revoke code: ${error.message}`);
      setProcessingJournalCodeId(null);
      return;
    }

    await loadTradeJournalWorkspace();
    setProcessingJournalCodeId(null);
  }

  async function saveJournalPrice(plan: any, nextPrice: number) {
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      alert("Enter a valid journal price.");
      return;
    }

    setSavingJournalPriceMonths(plan.duration_months);
    const { error } = await supabase
      .from("trade_journal_pricing_plans")
      .update({ price: nextPrice, updated_at: new Date().toISOString() })
      .eq("duration_months", plan.duration_months);

    if (error) {
      alert(`Could not save journal price: ${error.message}`);
      setSavingJournalPriceMonths(null);
      return;
    }

    await loadTradeJournalWorkspace();
    setSavingJournalPriceMonths(null);
    alert("Journal pricing updated.");
  }

  // ---------------------------------------------------------
  // ADMIN AUTH CHECK
  // ---------------------------------------------------------

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getSession();

        if (authError) {
          console.error("Auth error:", authError);
          setLoading(false);
          return;
        }

        const user = authData.session?.user;

        if (!user) {
          window.location.href = "/logins";
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          setLoading(false);
          return;
        }

        const debugInfo = {
          userId: user.id,
          email: user.email ?? "",
          profileRole: profile?.role ?? null,
        };

        console.log("ADMIN DEBUG", debugInfo);
        setAdminDebug(debugInfo);

        if (profile?.role !== "admin") {
          setLoading(false);
          return;
        }

        setAdminUserId(user.id);
        setIsAdmin(true);

        await Promise.all([
          loadAdminNotifications(),
          loadPendingDeposits(),
          loadBusinessPaymentAccounts(),
          loadPendingWithdrawals(),
          loadApprovedWithdrawals(),
          loadWithdrawalBankAccounts(),
          loadClientAccounts(),
          loadArchivedRecords(),
          loadTradingViewSubscriptions(),
          loadTradingViewCatalogPlans(),
          loadTradingViewPendingDeliveries(),
          loadSupportMessages(),
          loadAnnouncements(),
          loadClientProfiles(),
          loadPropFirmRequests(),
          loadPropInventory(),
          loadPropPurchaseApprovals(),
          loadReferralWorkspace(),
          loadTradeJournalWorkspace(),
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Admin check error:", error);
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel("fth-admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
        },
        (payload) => {
          const notification = payload.new as any;
          setAdminNotifications((current) => [notification, ...current]);
          playAdminNotificationSound();

          if ("Notification" in window && Notification.permission === "granted") {
            const browserNotification = new Notification(notification.title, {
              body: notification.message,
              icon: "/brand/fidelity-mark.png",
              tag: `fth-${notification.id}`,
            });

            browserNotification.onclick = () => {
              window.focus();
              openAdminNotification(notification);
            };
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // ---------------------------------------------------------
  // DEPOSIT APPROVAL
  // ---------------------------------------------------------

  async function approveDeposit(depositId: string) {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();
    const currentAdminId = authData.user?.id;

    if (authError || !currentAdminId) {
      alert("Your Admin session has expired. Please sign in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to approve this deposit?"
    );

    if (!confirmed) return;

    setProcessingId(depositId);

    const { error } = await supabase.rpc("approve_deposit", {
      p_deposit_id: depositId,
      p_admin_user_id: currentAdminId,
    });

    if (error) {
      console.warn("Deposit approval failed:", error.message);
      alert(`Could not approve deposit: ${error.message}`);
      setProcessingId(null);
      return;
    }

    await loadPendingDeposits();

    setProcessingId(null);

    alert("Deposit approved successfully.");
  }

  async function rejectDeposit(depositId: string) {
    const { data: authData, error: authError } =
      await supabase.auth.getUser();
    const currentAdminId = authData.user?.id;

    if (authError || !currentAdminId) {
      alert("Your Admin session has expired. Please sign in again.");
      return;
    }

    const reason = window.prompt(
      "Why are you rejecting this deposit?"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    setProcessingId(depositId);

    const { error } = await supabase.rpc("reject_deposit", {
      p_deposit_id: depositId,
      p_admin_user_id: currentAdminId,
      p_rejection_reason: reason.trim(),
    });

    if (error) {
      console.warn("Deposit rejection failed:", error.message);
      alert(`Could not reject deposit: ${error.message}`);
      setProcessingId(null);
      return;
    }

    await loadPendingDeposits();

    setProcessingId(null);

    alert("Deposit rejected.");
  }

  async function loadTradingViewPendingDeliveries() {
    const { data, error } = await supabase
      .from("tradingview_purchases")
      .select(
        `
          id,
          user_id,
          plan_id,
          purchase_type,
          purchase_email,
          total_price,
          amount_paid,
          currency,
          status,
          funded_at,
          created_at,
          tradingview_plans!tradingview_purchases_plan_id_fkey (
            name,
            duration_days,
            access_type
          )
        `
      )
      .is("archived_at", null)
      .eq("status", "pending_delivery")
      .order("funded_at", { ascending: true, nullsFirst: false });

    if (error) {
      console.warn(
        "TradingView pending deliveries could not load:",
        error.message
      );
      return;
    }

    setTvPendingDeliveries(data ?? []);
  }

  async function saveBusinessPaymentAccount() {
    if (
      !businessBankName.trim() ||
      !businessAccountName.trim() ||
      !businessAccountNumber.trim()
    ) {
      alert("Enter the bank name, account name and account number.");
      return;
    }

    if (businessAccountNumber.trim().length < 8) {
      alert("Enter a valid account number.");
      return;
    }

    setSavingBusinessAccount(true);

    const currentDefault =
      businessPaymentAccounts.find((account) => account.is_default) ??
      businessPaymentAccounts[0];

    const accountData = {
      bank_name: businessBankName.trim(),
      account_name: businessAccountName.trim(),
      account_number: businessAccountNumber.trim(),
      currency: "NGN",
      payment_instructions:
        businessPaymentInstructions.trim() || null,
      active: true,
      is_default: true,
      updated_at: new Date().toISOString(),
    };

    const operation = currentDefault
      ? supabase
          .from("business_payment_accounts")
          .update(accountData)
          .eq("id", currentDefault.id)
      : supabase
          .from("business_payment_accounts")
          .insert(accountData);

    const { error } = await operation;

    if (error) {
      console.error("Error saving business payment account:", error);
      alert(`Could not save payment account: ${error.message}`);
      setSavingBusinessAccount(false);
      return;
    }

    await loadBusinessPaymentAccounts();
    setSavingBusinessAccount(false);
    alert("Customer payment account saved.");
  }

  // ---------------------------------------------------------
  // WITHDRAWAL APPROVAL
  // ---------------------------------------------------------

  async function approveWithdrawal(withdrawalId: string) {
    const confirmed = window.confirm(
      "Approve this withdrawal? The client's wallet balance will be deducted."
    );

    if (!confirmed) return;

    setProcessingWithdrawalId(withdrawalId);

    const { error } = await supabase.rpc("approve_withdrawal", {
      p_withdrawal_id: withdrawalId,
    });

    if (error) {
      console.error("Error approving withdrawal:", error);
      alert(`Could not approve withdrawal: ${error.message}`);
      setProcessingWithdrawalId(null);
      return;
    }

    await Promise.all([
      loadPendingWithdrawals(),
      loadApprovedWithdrawals(),
    ]);

    setProcessingWithdrawalId(null);
    alert("Withdrawal approved successfully.");
  }

  async function completeWithdrawal(withdrawalId: string) {
    const confirmed = window.confirm(
      "Mark this withdrawal as PAID/COMPLETED? Only do this after you have actually sent the money to the client's bank."
    );

    if (!confirmed) return;

    setProcessingWithdrawalId(withdrawalId);

    const { error } = await supabase.rpc("complete_withdrawal", {
      p_withdrawal_id: withdrawalId,
    });

    if (error) {
      console.error("Error completing withdrawal:", error);
      alert(`Could not complete withdrawal: ${error.message}`);
      setProcessingWithdrawalId(null);
      return;
    }

    await loadApprovedWithdrawals();

    setProcessingWithdrawalId(null);
    alert("Withdrawal marked as paid and completed.");
  }

  async function rejectWithdrawal(withdrawalId: string) {
    const reason = window.prompt(
      "Why are you rejecting this withdrawal?"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }

    setProcessingWithdrawalId(withdrawalId);

    const { error } = await supabase.rpc("reject_withdrawal", {
      p_withdrawal_id: withdrawalId,
      p_reason: reason.trim(),
    });

    if (error) {
      console.error("Error rejecting withdrawal:", error);
      alert(`Could not reject withdrawal: ${error.message}`);
      setProcessingWithdrawalId(null);
      return;
    }

    await loadPendingWithdrawals();

    setProcessingWithdrawalId(null);
    alert("Withdrawal rejected.");
  }

  // ---------------------------------------------------------
  // CLIENT ACCOUNT ASSIGNMENT
  // ---------------------------------------------------------

  async function assignClientAccount() {
    if (
      !clientUserId.trim() ||
      !accountName.trim() ||
      !accountSize.trim() ||
      !phase.trim() ||
      !amountPaid
    ) {
      alert("Please complete all required account fields.");
      return;
    }

    setSavingAccount(true);

    const { error } = await supabase
      .from("client_accounts")
      .insert({
        user_id: clientUserId.trim(),
        account_name: accountName.trim(),
        prop_firm: propFirm.trim() || null,
        account_size: accountSize.trim(),
        phase: phase.trim(),
        amount_paid: Number(amountPaid),
        status: accountStatus,
      });

    if (error) {
      console.error("Error assigning client account:", error);
      alert(`Could not assign client account: ${error.message}`);
      setSavingAccount(false);
      return;
    }

    setClientUserId("");
    setAccountName("");
    setPropFirm("");
    setAccountSize("");
    setPhase("");
    setAmountPaid("");
    setAccountStatus("working_on");

    await loadClientAccounts();

    setSavingAccount(false);

    alert("Client account assigned successfully.");
  }

  // ---------------------------------------------------------
  // TRADINGVIEW
  // ---------------------------------------------------------

  function updateTvDeliveryDraft(
    purchaseId: string,
    field: string,
    value: string | boolean,
    purchaseEmail = ""
  ) {
    setTvDeliveryDrafts((current) => ({
      ...current,
      [purchaseId]: {
        loginEmail: current[purchaseId]?.loginEmail ?? purchaseEmail,
        loginPassword: current[purchaseId]?.loginPassword || "",
        deliveryNote: current[purchaseId]?.deliveryNote || "",
        coSponsorName: current[purchaseId]?.coSponsorName || "",
        coSponsorPhone: current[purchaseId]?.coSponsorPhone || "",
        showCoSponsor: current[purchaseId]?.showCoSponsor || false,
        [field]: value,
      },
    }));
  }

  async function activateTradingViewPurchase(purchase: any) {
    const draft = tvDeliveryDrafts[purchase.id] || {
      loginEmail: purchase.purchase_email ?? "",
      loginPassword: "",
      deliveryNote: "",
      coSponsorName: "",
      coSponsorPhone: "",
      showCoSponsor: false,
    };

    if (!draft.loginEmail.trim() || !draft.loginPassword.trim()) {
      alert("Enter the TradingView username/email and password.");
      return;
    }

    const confirmed = window.confirm(
      "Activate this TradingView account now? The 30-day countdown will start immediately and the login details will become visible to the customer."
    );

    if (!confirmed) return;
    setActivatingTvPurchaseId(purchase.id);

    const { data, error } = await supabase.rpc(
      "admin_activate_tradingview_purchase",
      {
        p_purchase_id: purchase.id,
        p_login_email: draft.loginEmail.trim(),
        p_login_password: draft.loginPassword,
        p_delivery_note: draft.deliveryNote.trim() || null,
        p_co_sponsor_name: draft.coSponsorName.trim() || null,
        p_co_sponsor_phone: draft.coSponsorPhone.trim() || null,
        p_show_co_sponsor: draft.showCoSponsor,
      }
    );

    if (error) {
      console.warn("TradingView activation failed:", error.message);
      alert(`Could not activate TradingView account: ${error.message}`);
      setActivatingTvPurchaseId(null);
      return;
    }

    setTvDeliveryDrafts((current) => {
      const next = { ...current };
      delete next[purchase.id];
      return next;
    });

    await Promise.all([
      loadTradingViewPendingDeliveries(),
      loadTradingViewSubscriptions(),
    ]);
    setActivatingTvPurchaseId(null);

    alert(
      `TradingView account activated. It expires ${new Date(
        data?.expires_at
      ).toLocaleString()}.`
    );
  }

  async function assignTradingViewPlan() {
    if (!tvUserId.trim() || !tvPlanName.trim()) {
      alert(
        "Please select a client and enter the TradingView plan name."
      );
      return;
    }

    setSavingTvPlan(true);

    const startDate = new Date();

    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { error } = await supabase
      .from("tradingview_subscriptions")
      .insert({
        user_id: tvUserId.trim(),
        plan_name: tvPlanName.trim(),
        started_at: startDate.toISOString(),
        expires_at: expiryDate.toISOString(),
        status: tvStatus,
        login_email: tvLoginEmail.trim() || null,
        login_password: tvLoginPassword.trim() || null,
        delivery_note: tvDeliveryNote.trim() || null,
        details_visible: tvDetailsVisible,
        co_sponsor_name: tvCoSponsorName.trim() || null,
        co_sponsor_phone: tvCoSponsorPhone.trim() || null,
        co_sponsor_visible: tvCoSponsorVisible,
      });

    if (error) {
      console.error(
        "Error assigning TradingView plan:",
        error
      );

      alert(
        `Could not assign TradingView plan: ${error.message}`
      );

      setSavingTvPlan(false);
      return;
    }

    setTvUserId("");
    setTvPlanName("");
    setTvLoginEmail("");
    setTvLoginPassword("");
    setTvDeliveryNote("");
    setTvDetailsVisible(false);
    setTvStatus("active");
    setTvCoSponsorName("");
    setTvCoSponsorPhone("");
    setTvCoSponsorVisible(false);

    await loadTradingViewSubscriptions();

    setSavingTvPlan(false);

    alert(
      "TradingView plan assigned successfully. It will expire automatically in 30 days."
    );
  }

  function getDaysRemaining(expiresAt: string) {
    const expiry = new Date(expiresAt).getTime();
    const now = Date.now();

    const difference = expiry - now;

    if (difference <= 0) return 0;

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  }

  function resetTradingViewCatalogForm() {
    setTvCatalogEditingId(null);
    setTvCatalogName("");
    setTvCatalogTier("premium");
    setTvCatalogAccessType("individual");
    setTvCatalogDurationDays("30");
    setTvCatalogPrice("");
    setTvCatalogCurrency("NGN");
    setTvCatalogDescription("");
    setTvCatalogFeatures("");
    setTvCatalogAllowBuyNow(true);
    setTvCatalogAllowPaySmallSmall(true);
    setTvCatalogActive(true);
  }

  function editTradingViewCatalogPlan(plan: any) {
    setTvCatalogEditingId(plan.id);
    setTvCatalogName(plan.name || "");
    setTvCatalogTier(plan.tier || "premium");
    setTvCatalogAccessType(plan.access_type || "individual");
    setTvCatalogDurationDays(String(plan.duration_days ?? 30));
    setTvCatalogPrice(String(plan.price ?? ""));
    setTvCatalogCurrency(plan.currency || "NGN");
    setTvCatalogDescription(plan.description || "");
    setTvCatalogFeatures(Array.isArray(plan.features) ? plan.features.join("\n") : "");
    setTvCatalogAllowBuyNow(plan.allow_buy_now !== false);
    setTvCatalogAllowPaySmallSmall(plan.allow_pay_small_small !== false);
    setTvCatalogActive(plan.active !== false);
    window.setTimeout(() => {
      document.getElementById("tradingview-offers")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function saveTradingViewCatalogPlan() {
    const name = tvCatalogName.trim();
    const durationDays = Number(tvCatalogDurationDays);
    const price = Number(tvCatalogPrice);
    if (!name) return alert("Enter the TradingView plan name.");
    if (!tvCatalogTier.trim()) return alert("Enter the plan tier.");
    if (!Number.isInteger(durationDays) || durationDays <= 0) return alert("Duration must be a positive whole number of days.");
    if (!Number.isFinite(price) || price <= 0) return alert("Enter a valid plan price.");

    const payload = {
      name,
      tier: tvCatalogTier.trim().toLowerCase(),
      access_type: tvCatalogAccessType.trim().toLowerCase() || "individual",
      duration_days: durationDays,
      price,
      currency: tvCatalogCurrency.trim().toUpperCase() || "NGN",
      description: tvCatalogDescription.trim() || null,
      features: tvCatalogFeatures.split("\n").map((item) => item.trim()).filter(Boolean),
      allow_buy_now: tvCatalogAllowBuyNow,
      allow_pay_small_small: tvCatalogAllowPaySmallSmall,
      active: tvCatalogActive,
      updated_at: new Date().toISOString(),
    };

    const wasEditing = Boolean(tvCatalogEditingId);
    setSavingTvCatalogPlan(true);
    const query = tvCatalogEditingId
      ? supabase.from("tradingview_plans").update(payload).eq("id", tvCatalogEditingId)
      : supabase.from("tradingview_plans").insert(payload);
    const { error } = await query;
    setSavingTvCatalogPlan(false);
    if (error) return alert(`Could not save TradingView plan: ${error.message}`);
    resetTradingViewCatalogForm();
    await loadTradingViewCatalogPlans();
    alert(wasEditing ? "TradingView plan updated." : "TradingView plan posted.");
  }

  async function toggleTradingViewCatalogPlan(plan: any) {
    setProcessingTvCatalogPlanId(plan.id);
    const { error } = await supabase.from("tradingview_plans").update({ active: !plan.active, updated_at: new Date().toISOString() }).eq("id", plan.id);
    setProcessingTvCatalogPlanId(null);
    if (error) return alert(`Could not update TradingView plan: ${error.message}`);
    await loadTradingViewCatalogPlans();
  }

  async function deleteTradingViewCatalogPlan(plan: any) {
    if (!window.confirm(`Permanently delete "${plan.name}"? If it has purchase history, the database may block deletion.`)) return;
    setProcessingTvCatalogPlanId(plan.id);
    const { error } = await supabase.from("tradingview_plans").delete().eq("id", plan.id);
    setProcessingTvCatalogPlanId(null);
    if (error) return alert(`Could not delete this plan: ${error.message}\n\nIf it has purchase history, use Deactivate instead.`);
    if (tvCatalogEditingId === plan.id) resetTradingViewCatalogForm();
    await loadTradingViewCatalogPlans();
  }

  // ---------------------------------------------------------
  // SUPPORT MESSAGING
  // ---------------------------------------------------------

  async function sendAdminReply() {
    if (!selectedSupportUser) {
      alert("Select a client conversation first.");
      return;
    }

    if (!adminReply.trim()) {
      alert("Please type a reply.");
      return;
    }

    setSendingReply(true);

    const { error } = await supabase
      .from("support_messages")
      .insert({
        user_id: selectedSupportUser,
        sender_role: "admin",
        message: adminReply.trim(),
        is_read: false,
      });

    if (error) {
      console.error("Error sending admin reply:", error);

      alert(
        `Could not send reply: ${error.message}`
      );

      setSendingReply(false);
      return;
    }

    setAdminReply("");

    await loadSupportMessages();

    setSendingReply(false);
  }

  const supportUsers = useMemo(() => {
    const ids = supportMessages.map(
      (message) => message.user_id
    );

    return Array.from(new Set(ids));
  }, [supportMessages]);

  const businessAnalytics = useMemo(() => {
    const numberValue = (value: unknown) => {
      const parsed = Number(value ?? 0);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const uniqueUsers = (records: any[]) =>
      new Set(
        records
          .map((record) => record?.user_id ?? record?.profile_id ?? record?.id)
          .filter(Boolean)
      ).size;

    const propCustomerRecords = [
      ...clientAccounts,
      ...propFirmRequests,
      ...propPurchaseApprovals,
    ];

    const activeTradingViewPlans = tvSubscriptions.filter((subscription) => {
      if (subscription?.status && subscription.status !== "active") return false;
      if (!subscription?.expires_at) return true;
      return new Date(subscription.expires_at).getTime() > Date.now();
    }).length;

    return {
      registeredClients: clientProfiles.length,
      propCustomers: uniqueUsers(propCustomerRecords),
      tradingViewCustomers: uniqueUsers(tvSubscriptions),
      activeTradingViewPlans,
      activePropAccounts: clientAccounts.filter(
        (account) => !["archived", "closed", "cancelled"].includes(account?.status)
      ).length,
      deliveredPropPurchases: propPurchaseApprovals.filter(
        (purchase) => purchase?.fulfillment_status === "delivered"
      ).length,
      openSupportConversations: supportUsers.length,
      pendingDepositValue: deposits.reduce(
        (total, deposit) => total + numberValue(deposit?.amount),
        0
      ),
      pendingWithdrawalValue: withdrawals.reduce(
        (total, withdrawal) => total + numberValue(withdrawal?.requested_amount),
        0
      ),
      recordedPropPurchaseValue: propPurchaseApprovals.reduce(
        (total, purchase) =>
          total + numberValue(purchase?.amount_paid ?? purchase?.total_price),
        0
      ),
    };
  }, [
    clientProfiles,
    clientAccounts,
    propFirmRequests,
    propPurchaseApprovals,
    tvSubscriptions,
    supportUsers,
    deposits,
    withdrawals,
  ]);

  const selectedConversation =
    supportMessages.filter(
      (message) =>
        message.user_id === selectedSupportUser
    );

  // ---------------------------------------------------------
  // PROP FIRM INVENTORY
  // ---------------------------------------------------------

  function slugifyPropFirm(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getPropFirmById(firmId: string) {
    return propFirms.find((firm) => firm.id === firmId);
  }

  function getPropProgramById(programId: string) {
    return propPrograms.find((program) => program.id === programId);
  }

  function getPropProgramLabel(program: any) {
    const firm = getPropFirmById(program.firm_id);

    return [
      firm?.name || "Unknown firm",
      program.name || "Program",
      program.phase || null,
    ]
      .filter(Boolean)
      .join(" — ");
  }

  async function createPropFirm() {
    const name = newFirmName.trim();

    if (!name) {
      alert("Enter the prop firm name.");
      return;
    }

    const slug = slugifyPropFirm(name);

    if (!slug) {
      alert("Could not create a valid firm slug.");
      return;
    }

    const registrationUrl = newFirmRegistrationUrl.trim();

    if (registrationUrl && !/^https?:\/\//i.test(registrationUrl)) {
      alert("Registration link must begin with http:// or https://");
      return;
    }

    setSavingFirm(true);

    const { error } = await supabase
      .from("prop_firms")
      .insert({
        name,
        slug,
        active: true,
        registration_url: registrationUrl || null,
        registration_link_label:
          newFirmLinkLabel.trim() || "Register with this prop firm",
      });

    if (error) {
      console.error("Error creating prop firm:", error);
      alert(`Could not create prop firm: ${error.message}`);
      setSavingFirm(false);
      return;
    }

    setNewFirmName("");
    setNewFirmRegistrationUrl("");
    setNewFirmLinkLabel("Register with this prop firm");
    await loadPropInventory();
    setSavingFirm(false);

    alert("Prop firm created successfully.");
  }

  async function savePropFirmRegistrationLink(firm: any) {
    const draft = firmLinkDrafts[firm.id];
    if (!draft) return;

    const registrationUrl = draft.registration_url.trim();
    const linkLabel = draft.registration_link_label.trim();

    if (registrationUrl && !/^https?:\/\//i.test(registrationUrl)) {
      alert("Registration link must begin with http:// or https://");
      return;
    }

    setSavingFirmLinkId(firm.id);

    const { error } = await supabase
      .from("prop_firms")
      .update({
        registration_url: registrationUrl || null,
        registration_link_label:
          linkLabel || "Register with this prop firm",
        active: draft.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", firm.id);

    if (error) {
      console.error("Error saving prop firm link:", error);
      alert(`Could not save registration link: ${error.message}`);
      setSavingFirmLinkId(null);
      return;
    }

    await loadPropInventory();
    setSavingFirmLinkId(null);
    alert(`${firm.name} registration link saved.`);
  }

  async function createPropProgram() {
    if (!programFirmId) {
      alert("Select a prop firm.");
      return;
    }

    if (!programName.trim()) {
      alert("Enter the program/challenge name.");
      return;
    }

    const accountSizes = programAccountSizes
      .split(",")
      .map((value) => Number(value.replace(/[^0-9.]/g, "")))
      .filter((value) => Number.isFinite(value) && value > 0);

    setSavingProgram(true);

    const { error } = await supabase
      .from("prop_programs")
      .insert({
        firm_id: programFirmId,
        name: programName.trim(),
        phase: programPhase.trim() || null,
        native_currency: programCurrency.trim().toUpperCase() || "USD",
        account_sizes: accountSizes,
        rules: {},
      });

    if (error) {
      console.error("Error creating prop program:", error);
      alert(`Could not create prop program: ${error.message}`);
      setSavingProgram(false);
      return;
    }

    setProgramName("");
    setProgramPhase("");
    setProgramCurrency("USD");
    setProgramAccountSizes("");

    await loadPropInventory();
    setSavingProgram(false);

    alert("Prop firm program created successfully.");
  }

  function resetPropOfferForm() {
    setEditingOfferId(null);
    setOfferProgramId("");
    setOfferAccountSize("");
    setOfferPrice("");
    setOfferCurrency("NGN");
    setOfferDescription("");
    setOfferFeatures("");
    setOfferStock("1");
    setOfferAllowBuyNow(true);
    setOfferAllowPaySmallSmall(true);
    setOfferActive(true);
  }

  function editPropOffer(offer: any) {
    setEditingOfferId(offer.id);
    setOfferProgramId(offer.program_id || "");
    setOfferAccountSize(String(offer.account_size ?? ""));
    setOfferPrice(String(offer.price ?? ""));
    setOfferCurrency(offer.currency || "NGN");
    setOfferDescription(offer.description || "");
    setOfferFeatures(Array.isArray(offer.features) ? offer.features.join("\n") : "");
    setOfferStock(String(offer.stock_quantity ?? 0));
    setOfferAllowBuyNow(offer.allow_buy_now !== false);
    setOfferAllowPaySmallSmall(offer.allow_pay_small_small !== false);
    setOfferActive(offer.active !== false);
    window.setTimeout(() => {
      document.getElementById("prop-offer-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function createPropOffer() {
    if (!offerProgramId) return alert("Select a prop firm program.");
    const accountSize = Number(offerAccountSize);
    const price = Number(offerPrice);
    const stock = Number(offerStock);
    if (!Number.isFinite(accountSize) || accountSize <= 0) return alert("Enter a valid account size.");
    if (!Number.isFinite(price) || price <= 0) return alert("Enter a valid selling price.");
    if (!Number.isInteger(stock) || stock < 0) return alert("Stock quantity must be zero or a positive whole number.");

    const payload = {
      program_id: offerProgramId,
      account_size: accountSize,
      price,
      currency: offerCurrency.trim().toUpperCase() || "NGN",
      description: offerDescription.trim() || null,
      features: offerFeatures.split("\n").map((feature) => feature.trim()).filter(Boolean),
      stock_quantity: stock,
      allow_buy_now: offerAllowBuyNow,
      allow_pay_small_small: offerAllowPaySmallSmall,
      active: offerActive,
      updated_at: new Date().toISOString(),
    };

    const wasEditing = Boolean(editingOfferId);
    setSavingOffer(true);
    const query = editingOfferId
      ? supabase.from("prop_offers").update(payload).eq("id", editingOfferId)
      : supabase.from("prop_offers").insert(payload);
    const { error } = await query;
    setSavingOffer(false);
    if (error) return alert(`Could not save prop offer: ${error.message}`);
    resetPropOfferForm();
    await loadPropInventory();
    alert(wasEditing ? "Prop firm offer updated successfully." : "Prop firm offer posted successfully.");
  }

  async function archivePropOffer(offer: any) {
    if (!window.confirm("Delete this prop offer from active inventory? Historical purchases will remain safe.")) return;
    const { error } = await supabase
      .from("prop_offers")
      .update({ active: false, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", offer.id);
    if (error) return alert(`Could not delete/archive offer: ${error.message}`);
    if (editingOfferId === offer.id) resetPropOfferForm();
    await loadPropInventory();
  }

  async function togglePropOfferActive(offer: any) {
    const { error } = await supabase
      .from("prop_offers")
      .update({
        active: !offer.active,
      })
      .eq("id", offer.id);

    if (error) {
      console.error("Error updating prop offer:", error);
      alert(`Could not update offer: ${error.message}`);
      return;
    }

    await loadPropInventory();
  }

  async function updatePropOfferStock(offer: any) {
    const value = window.prompt(
      "Enter the new stock quantity:",
      String(offer.stock_quantity ?? 0)
    );

    if (value === null) return;

    const stock = Number(value);

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Stock quantity must be zero or a positive whole number.");
      return;
    }

    const { error } = await supabase
      .from("prop_offers")
      .update({
        stock_quantity: stock,
      })
      .eq("id", offer.id);

    if (error) {
      console.error("Error updating prop offer stock:", error);
      alert(`Could not update stock: ${error.message}`);
      return;
    }

    await loadPropInventory();
  }

  async function updatePropOfferPrice(offer: any) {
    const value = window.prompt(
      `Enter the new ${offer.currency || "NGN"} selling price:`,
      String(offer.price ?? "")
    );

    if (value === null) return;

    const price = Number(value);

    if (!Number.isFinite(price) || price <= 0) {
      alert("Enter a valid selling price.");
      return;
    }

    const { error } = await supabase
      .from("prop_offers")
      .update({
        price,
      })
      .eq("id", offer.id);

    if (error) {
      console.error("Error updating prop offer price:", error);
      alert(`Could not update price: ${error.message}`);
      return;
    }

    await loadPropInventory();
  }

  // ---------------------------------------------------------
  // PROP PURCHASE DELIVERIES
  // ---------------------------------------------------------

  async function updatePropDeliveryStatus(
    purchase: any,
    deliveryStatus: "pending_delivery" | "delivered" | "not_delivered"
  ) {
    const label =
      deliveryStatus === "delivered"
        ? "DELIVERED"
        : deliveryStatus === "not_delivered"
          ? "NOT DELIVERED"
          : "PENDING DELIVERY";

    const confirmed = window.confirm(
      `Mark this customer's prop account order as ${label}?`
    );

    if (!confirmed) return;

    setProcessingPurchaseId(purchase.id);

    const { error } = await supabase.rpc(
      "admin_set_prop_delivery_status",
      {
        p_purchase_id: purchase.id,
        p_delivery_status: deliveryStatus,
      }
    );

    if (error) {
      console.error("Error updating delivery status:", error);
      alert(`Could not update delivery status: ${error.message}`);
      setProcessingPurchaseId(null);
      return;
    }

    await loadPropPurchaseApprovals();
    setProcessingPurchaseId(null);
    alert(`Order marked as ${label}.`);
  }

  // ---------------------------------------------------------
  // PROP FIRM REQUESTS
  // ---------------------------------------------------------

  async function updatePropFirmRequestStatus(
    requestId: string,
    status: "reviewing" | "approved" | "rejected" | "completed"
  ) {
    let adminNote: string | null = null;

    if (status === "rejected") {
      const reason = window.prompt("Why are you rejecting this request?");
      if (reason === null) return;
      if (!reason.trim()) {
        alert("Please enter a rejection reason.");
        return;
      }
      adminNote = reason.trim();
    } else {
      const note = window.prompt(
        "Optional admin note for the client/request. Leave blank if none."
      );
      if (note === null) return;
      adminNote = note.trim() || null;
    }

    setProcessingPropFirmRequestId(requestId);

    const { error } = await supabase
      .from("prop_firm_requests")
      .update({ status, admin_note: adminNote })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating prop firm request:", error);
      alert(`Could not update request: ${error.message}`);
      setProcessingPropFirmRequestId(null);
      return;
    }

    await loadPropFirmRequests();
    setProcessingPropFirmRequestId(null);
  }

  // ---------------------------------------------------------
  // ANNOUNCEMENTS
  // ---------------------------------------------------------

  async function createReferralPartner() {
    if (!partnerUserId || !partnerName.trim() || !partnerCode.trim()) {
      alert("Select a client and enter the partner name and referral code.");
      return;
    }

    const rate = Number(partnerCommissionRate);
    const minimum = Number(partnerMinimumPayout);
    const holdDays = Number(partnerHoldDays);
    if (!Number.isFinite(rate) || rate < 0 || rate > 100 || minimum < 0 || holdDays < 0) {
      alert("Enter valid commission, minimum payout and hold-day values.");
      return;
    }

    setSavingPartner(true);
    const { error } = await supabase.rpc("admin_create_referral_partner", {
      p_user_id: partnerUserId,
      p_display_name: partnerName.trim(),
      p_code: partnerCode.trim(),
      p_commission_rate: rate,
      p_minimum_payout: minimum,
      p_hold_days: Math.floor(holdDays),
    });
    setSavingPartner(false);

    if (error) {
      alert(`Could not create referral partner: ${error.message}`);
      return;
    }

    setPartnerUserId("");
    setPartnerName("");
    setPartnerCode("");
    await loadReferralWorkspace();
    alert("Referral partner and code created.");
  }

  async function copyPartnerReferralLink(code: string) {
    const normalizedCode = String(code || "").trim().toUpperCase();
    if (!normalizedCode) {
      alert("This partner does not have an active referral code.");
      return;
    }

    const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    const baseUrl = configuredBase || window.location.origin;
    const referralUrl = `${baseUrl}/register?ref=${encodeURIComponent(normalizedCode)}`;

    try {
      await navigator.clipboard.writeText(referralUrl);
      alert(`Referral link copied:\n${referralUrl}`);
    } catch {
      window.prompt("Copy this referral link:", referralUrl);
    }
  }

  async function createDiscountCode() {
    if (!discountCode.trim() || !discountValue) {
      alert("Enter a discount code and value.");
      return;
    }

    const value = Number(discountValue);
    if (!Number.isFinite(value) || value <= 0 || (discountKind === "percentage" && value > 100)) {
      alert("Enter a valid discount value. Percentage discounts cannot exceed 100%.");
      return;
    }

    const scopeMap: Record<string, string[]> = {
      all: ["all"],
      prop_firm: ["prop_firm"],
      tradingview: ["tradingview"],
      trade_journal: ["trade_journal"],
    };

    setSavingDiscount(true);
    const { error } = await supabase.rpc("admin_create_discount_code", {
      p_code: discountCode.trim(),
      p_kind: discountKind,
      p_value: value,
      p_applies_to: scopeMap[discountScope] ?? ["all"],
      p_maximum_discount: discountMaximum ? Number(discountMaximum) : null,
      p_minimum_order: Number(discountMinimumOrder || 0),
      p_max_total_uses: discountMaxUses ? Number(discountMaxUses) : null,
      p_max_uses_per_user: Number(discountPerUser || 1),
      p_expires_at: discountExpiry ? new Date(discountExpiry).toISOString() : null,
    });
    setSavingDiscount(false);

    if (error) {
      alert(`Could not create discount code: ${error.message}`);
      return;
    }

    setDiscountCode("");
    setDiscountValue("");
    setDiscountMaximum("");
    setDiscountMaxUses("");
    setDiscountExpiry("");
    await loadReferralWorkspace();
    alert("Discount code created.");
  }

  async function toggleDiscountCode(code: any) {
    const { error } = await supabase
      .from("discount_codes")
      .update({ active: !code.active, updated_at: new Date().toISOString() })
      .eq("id", code.id);
    if (error) {
      alert(`Could not update discount code: ${error.message}`);
      return;
    }
    await loadReferralWorkspace();
  }

  async function updatePartnerPayout(payout: any, status: "approved" | "processing" | "paid" | "rejected") {
    const action = status === "paid" ? "mark this payout as paid" : `${status} this payout`;
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    const note = status === "rejected" ? window.prompt("Reason for rejection:") : "";
    if (status === "rejected" && !note?.trim()) return;

    setProcessingPartnerPayoutId(payout.id);
    const { error } = await supabase.rpc("admin_update_partner_payout", {
      p_payout_id: payout.id,
      p_status: status,
      p_approved_amount: Number(payout.approved_amount ?? payout.requested_amount),
      p_admin_note: note?.trim() || null,
    });
    setProcessingPartnerPayoutId(null);

    if (error) {
      alert(`Could not update payout: ${error.message}`);
      return;
    }
    await loadReferralWorkspace();
  }

  async function publishAnnouncement() {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      alert("Please enter both a title and message.");
      return;
    }

    setPublishingAnnouncement(true);

    const { error } = await supabase
      .from("announcements")
      .insert({
        title: announcementTitle.trim(),
        message: announcementMessage.trim(),
        is_active: true,
      });

    if (error) {
      console.error("Error publishing announcement:", error);
      alert(`Could not publish announcement: ${error.message}`);
      setPublishingAnnouncement(false);
      return;
    }

    setAnnouncementTitle("");
    setAnnouncementMessage("");

    await loadAnnouncements();

    setPublishingAnnouncement(false);
    alert("Announcement published successfully.");
  }

  async function removeAnnouncement(announcementId: number) {
    const confirmed = window.confirm(
      "Remove this announcement from client dashboards?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("announcements")
      .update({ is_active: false })
      .eq("id", announcementId);

    if (error) {
      console.error("Error removing announcement:", error);
      alert(`Could not remove announcement: ${error.message}`);
      return;
    }

    await loadAnnouncements();
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Checking admin access...
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-7 text-center shadow-2xl sm:p-10">
          <div
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400"
          >
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Admin access required
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            This area is restricted to authorised Fidelity Traders Hub
            administrators.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/dashboard"
              className="rounded-xl bg-[#5a72ea] px-5 py-3 font-bold text-white transition hover:bg-[#6b82f3]"
            >
              Return to dashboard
            </a>

            <a
              href="/"
              className="rounded-xl border border-slate-700 px-5 py-3 font-bold text-slate-200 transition hover:bg-slate-800"
            >
              Go to homepage
            </a>
          </div>
        </section>
      </main>
    );
  }

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <main className="fth-admin-dashboard fth-unified-board min-h-screen text-white">
      <div className="min-h-screen lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="fth-app-sidebar border-b border-slate-800 lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="sticky top-0 flex min-h-screen flex-col p-5">
            <a
              href="/dashboard"
              className="fth-sidebar-brand flex min-h-14 items-center"
              aria-label="Fidelity Traders Hub"
            >
              <BrandLogo priority />
            </a>

            <p className="mt-8 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">
              Admin workspace
            </p>

            <nav className="mt-3 space-y-1.5 text-sm">
              {[
                ["announcements", "⌂", "Overview"],
                ["inventory", "▦", "Prop Inventory"],
                ["deliveries", "✓", "Prop Deliveries"],
                ["payments", "₦", "Payments & Deposits"],
                ["tradingview", "◫", "TradingView"],
                ["accounts", "◎", "Client Accounts"],
                ["withdrawals", "↗", "Withdrawals"],
                ["support", "✉", "Support Inbox"],
                ["referrals", "%", "Referrals & Discounts"],
                ["trade_journal", "▤", "Trade Journal"],
                ["archive", "□", "Archive"],
              ].map(([sectionId, icon, label]) => (
                <button
                  key={sectionId}
                  type="button"
                  onClick={() => {
                    setActiveAdminSection(sectionId);
                    if (sectionId === "tradingview") {
                      window.setTimeout(() => {
                        document.getElementById("tradingview-offers")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 0);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    activeAdminSection === sectionId
                      ? "fth-nav-active font-black"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center" aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-500">Signed in as</p>
                <p className="mt-2 truncate text-sm font-black">{adminDebug?.email || "Administrator"}</p>
                <p className="mt-1 text-xs text-emerald-400">● Admin access active</p>
              </div>
              <a href="/dashboard" className="mt-3 block rounded-xl border border-slate-800 px-4 py-3 text-center text-sm font-black">
                Client Dashboard
              </a>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="fth-topbar sticky top-0 z-40 border-b border-slate-800 px-5 py-4 sm:px-8">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">Fidelity Traders Hub</p>
                <h1 className="mt-1 text-xl font-black sm:text-2xl">Admin Control Center</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={enableBrowserNotifications}
                  disabled={requestingNotificationPermission}
                  className="hidden rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold disabled:opacity-50 sm:block"
                >
                  {requestingNotificationPermission ? "Enabling..." : "Device Alerts"}
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationPanelOpen((current) => !current)}
                  className="relative rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white"
                >
                  🔔 Alerts
                  {adminNotifications.filter((item) => !item.read_at).length > 0 && (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {adminNotifications.filter((item) => !item.read_at).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
            <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
                <div className="max-w-3xl">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">Operations overview</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Run the whole platform from one place.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    Payments, client accounts, prop inventory, TradingView delivery, Journal access,
                    referrals, support and withdrawals stay inside one unified admin workspace.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Pending deposits", deposits.length],
                    ["Withdrawals", withdrawals.length],
                    ["Deliveries", propPurchaseApprovals.filter((item) => item.fulfillment_status === "pending_delivery").length + tvPendingDeliveries.length],
                    ["Unread alerts", adminNotifications.filter((item) => !item.read_at).length],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="min-w-[120px] rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</p>
                      <p className="mt-1 text-2xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {activeAdminSection === "announcements" && (
              <section className="mb-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setAnalyticsOpen((current) => !current)}
                  className="flex w-full flex-col gap-3 px-6 py-5 text-left sm:flex-row sm:items-center sm:justify-between sm:px-8"
                  aria-expanded={analyticsOpen}
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">
                      Business snapshot
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {businessAnalytics.registeredClients} clients · {businessAnalytics.propCustomers} prop customers · {businessAnalytics.tradingViewCustomers} TradingView customers
                    </p>
                  </div>
                  <span className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-bold text-slate-200">
                    {analyticsOpen ? "Hide analytics ↑" : "View analytics ↓"}
                  </span>
                </button>

                {analyticsOpen && (
                  <div className="border-t border-slate-800 px-6 py-6 sm:px-8">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Registered clients", businessAnalytics.registeredClients],
                        ["Prop customers", businessAnalytics.propCustomers],
                        ["TradingView customers", businessAnalytics.tradingViewCustomers],
                        ["Active TV plans", businessAnalytics.activeTradingViewPlans],
                        ["Active prop accounts", businessAnalytics.activePropAccounts],
                        ["Delivered prop purchases", businessAnalytics.deliveredPropPurchases],
                        ["Support conversations", businessAnalytics.openSupportConversations],
                        ["Pending actions", deposits.length + withdrawals.length + tvPendingDeliveries.length],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">
                            {label}
                          </p>
                          <p className="mt-2 text-2xl font-black">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {[
                        ["Pending deposit value", businessAnalytics.pendingDepositValue],
                        ["Pending withdrawal value", businessAnalytics.pendingWithdrawalValue],
                        ["Recorded prop purchase value", businessAnalytics.recordedPropPurchaseValue],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[.12em] text-blue-300">
                            {label}
                          </p>
                          <p className="mt-2 text-xl font-black">
                            ₦{Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Figures are calculated from the records already loaded in this admin page. Pending values are not completed revenue.
                    </p>
                  </div>
                )}
              </section>
            )}

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="hidden">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-400">Fidelity Traders Hub Administration</p>
        </div>

        <div className="hidden flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={enableBrowserNotifications}
            disabled={requestingNotificationPermission}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 disabled:opacity-50"
          >
            {requestingNotificationPermission ? "Enabling..." : "Enable device alerts"}
          </button>

          <button
            type="button"
            onClick={() => setNotificationPanelOpen((current) => !current)}
            className="relative rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
            aria-label="Open Admin notifications"
          >
            🔔 Notifications
            {adminNotifications.filter((item) => !item.read_at).length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {adminNotifications.filter((item) => !item.read_at).length}
              </span>
            )}
          </button>
        </div>

        {notificationPanelOpen && (
          <div className="absolute right-0 top-full z-50 mt-3 w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div>
                <p className="font-bold">Admin notifications</p>
                <p className="text-xs text-slate-400">Select an alert to open its workspace.</p>
              </div>
              <button type="button" onClick={() => setNotificationPanelOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div className="max-h-[430px] overflow-y-auto p-2">
              {adminNotifications.length === 0 ? (
                <p className="p-5 text-sm text-slate-400">No notifications yet.</p>
              ) : (
                adminNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openAdminNotification(notification)}
                    className={`mb-2 w-full rounded-xl border p-4 text-left ${
                      notification.read_at
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-blue-500/40 bg-blue-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{notification.title}</p>
                      {!notification.read_at && <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(notification.created_at).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <nav className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-3 lg:hidden">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Admin workspace
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            ["announcements", "Announcements"],
            ["inventory", "Prop Inventory"],
            ["deliveries", "Prop Deliveries"],
            ["payments", "Payments & Deposits"],
            ["tradingview", "TradingView"],
            ["accounts", "Client Accounts"],
            ["withdrawals", "Withdrawals"],
            ["support", "Support Inbox"],
            ["referrals", "Referrals & Discounts"],
            ["trade_journal", "Trade Journal"],
            ["archive", "Archive"],
          ].map(([sectionId, label]) => (
            <button
              key={sectionId}
              type="button"
              onClick={() => {
                setActiveAdminSection(sectionId);
                if (sectionId === "tradingview") {
                  window.setTimeout(() => {
                    document.getElementById("tradingview-offers")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 0);
                }
              }}
              className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeAdminSection === sectionId
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                  : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-500 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ANNOUNCEMENTS */}

      <section className={`mt-8 ${activeAdminSection === "announcements" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Publish updates that clients can see on their dashboards.
            </p>
          </div>

          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-400">
            {announcements.length} Active
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              New Announcement
            </h3>

            <input
              type="text"
              placeholder="Announcement title"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <textarea
              rows={5}
              placeholder="Write the announcement..."
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <button
              type="button"
              onClick={publishAnnouncement}
              disabled={publishingAnnouncement}
              className="mt-4 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishingAnnouncement
                ? "Publishing..."
                : "Publish Announcement"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Active Announcements
            </h3>

            {announcements.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                No active announcements.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {announcement.title}
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">
                          {announcement.message}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(
                            announcement.created_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeAnnouncement(announcement.id)
                        }
                        className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PROP FIRM INVENTORY */}

      <section className={`mt-8 ${activeAdminSection === "inventory" ? "block" : "hidden"}`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Prop Firm Inventory
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create firms and programs, then post the actual accounts
              Fidelity Traders Hub has available for clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-blue-400">
              {propFirms.length} Firms
            </span>

            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-400">
              {propPrograms.length} Programs
            </span>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">
              {propOffers.filter((offer) => offer.active).length} Active Offers
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {/* CREATE FIRM */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Step 1
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Create Prop Firm
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add the firm once. Its programs and account offers will sit under it.
            </p>

            <input
              type="text"
              placeholder="e.g. Funding Pips"
              value={newFirmName}
              onChange={(e) => setNewFirmName(e.target.value)}
              className="mt-5 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="url"
              placeholder="Registration/affiliate link (optional)"
              value={newFirmRegistrationUrl}
              onChange={(e) => setNewFirmRegistrationUrl(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="text"
              placeholder="Customer link label"
              value={newFirmLinkLabel}
              onChange={(e) => setNewFirmLinkLabel(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <button
              type="button"
              onClick={createPropFirm}
              disabled={savingFirm}
              className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingFirm ? "Creating..." : "Create Firm"}
            </button>

            {propFirms.length > 0 && (
              <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Existing Firms
                </p>

                <div className="mt-3 space-y-4">
                  {propFirms.map((firm) => {
                    const draft = firmLinkDrafts[firm.id] || {
                      registration_url: firm.registration_url || "",
                      registration_link_label:
                        firm.registration_link_label ||
                        "Register with this prop firm",
                      active: firm.active !== false,
                    };

                    return (
                    <div
                      key={firm.id}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {firm.name}
                        </p>
                        <label className="flex items-center gap-2 text-xs text-slate-400">
                          <input
                            type="checkbox"
                            checked={draft.active}
                            onChange={(e) =>
                              setFirmLinkDrafts((current) => ({
                                ...current,
                                [firm.id]: {
                                  ...draft,
                                  active: e.target.checked,
                                },
                              }))
                            }
                          />
                          Visible
                        </label>
                      </div>

                      <input
                        type="url"
                        placeholder="https://registration-or-affiliate-link"
                        value={draft.registration_url}
                        onChange={(e) =>
                          setFirmLinkDrafts((current) => ({
                            ...current,
                            [firm.id]: {
                              ...draft,
                              registration_url: e.target.value,
                            },
                          }))
                        }
                        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                      />

                      <input
                        type="text"
                        placeholder="Register with this prop firm"
                        value={draft.registration_link_label}
                        onChange={(e) =>
                          setFirmLinkDrafts((current) => ({
                            ...current,
                            [firm.id]: {
                              ...draft,
                              registration_link_label: e.target.value,
                            },
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => savePropFirmRegistrationLink(firm)}
                        disabled={savingFirmLinkId === firm.id}
                        className="mt-3 w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingFirmLinkId === firm.id
                          ? "Saving..."
                          : "Save Registration Link"}
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* CREATE PROGRAM */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Step 2
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Create Program / Challenge
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Example: 2-Step Challenge, 1-Step, Instant Funding or Evaluation.
            </p>

            <div className="mt-5 grid gap-3">
              <select
                value={programFirmId}
                onChange={(e) => setProgramFirmId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              >
                <option value="">Select Prop Firm</option>

                {propFirms.map((firm) => (
                  <option key={firm.id} value={firm.id}>
                    {firm.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Program name e.g. 2-Step Challenge"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Phase e.g. Phase 1 / Instant"
                value={programPhase}
                onChange={(e) => setProgramPhase(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Native currency e.g. USD"
                value={programCurrency}
                onChange={(e) => setProgramCurrency(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Account sizes e.g. 5000, 10000, 25000, 50000, 100000"
                value={programAccountSizes}
                onChange={(e) => setProgramAccountSizes(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

            </div>

            <button
              type="button"
              onClick={createPropProgram}
              disabled={savingProgram || !programFirmId}
              className="mt-4 w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProgram ? "Creating..." : "Create Program"}
            </button>
          </div>

          {/* POST OFFER */}
          <div id="prop-offer-form" className="scroll-mt-6 rounded-2xl border border-blue-500/20 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Step 3
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {editingOfferId ? "Edit Account Offer" : "Post Available Account"}
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              This is the actual account offer customers will see and buy.
            </p>

            <div className="mt-5 grid gap-3">
              <select
                value={offerProgramId}
                onChange={(e) => setOfferProgramId(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              >
                <option value="">Select Program</option>

                {propPrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {getPropProgramLabel(program)}
                  </option>
                ))}
              </select>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Account size e.g. 100000"
                  value={offerAccountSize}
                  onChange={(e) => setOfferAccountSize(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <input
                  type="number"
                  min="1"
                  placeholder="Selling price"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Currency e.g. NGN"
                  value={offerCurrency}
                  onChange={(e) => setOfferCurrency(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />

                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Stock quantity"
                  value={offerStock}
                  onChange={(e) => setOfferStock(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Short customer-facing description"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <textarea
                rows={5}
                placeholder={"Features — one per line\n5% Daily Loss\n10% Max Drawdown\n8% Profit Target\nNews Trading Allowed"}
                value={offerFeatures}
                onChange={(e) => setOfferFeatures(e.target.value)}
                className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
              />

              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={offerAllowBuyNow}
                  onChange={(e) => setOfferAllowBuyNow(e.target.checked)}
                />
                <span className="text-sm text-slate-300">
                  Allow Buy Now
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={offerAllowPaySmallSmall}
                  onChange={(e) =>
                    setOfferAllowPaySmallSmall(e.target.checked)
                  }
                />
                <span className="text-sm text-slate-300">
                  Allow Pay Small Small
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
                <input
                  type="checkbox"
                  checked={offerActive}
                  onChange={(e) => setOfferActive(e.target.checked)}
                />
                <span className="text-sm text-slate-300">
                  Publish as active
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={createPropOffer}
              disabled={savingOffer || !offerProgramId}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingOffer
                ? editingOfferId ? "Saving..." : "Posting..."
                : editingOfferId ? "Save Offer Changes" : "Post Account Offer"}
            </button>
            {editingOfferId && (
              <button type="button" onClick={resetPropOfferForm} className="mt-2 w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300">
                Cancel Editing
              </button>
            )}
          </div>
        </div>

        {/* CURRENT INVENTORY */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-semibold">
                Current Prop Firm Offers
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Change price or stock at any time. Inactive offers remain saved
                but will be hidden from customers.
              </p>
            </div>

            <span className="w-fit rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              {propOffers.length} Total
            </span>
          </div>

          {propOffers.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-400">
              No prop firm offers have been posted yet.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {propOffers.map((offer) => {
                const program = getPropProgramById(offer.program_id);
                const firm = program
                  ? getPropFirmById(program.firm_id)
                  : null;

                const features = Array.isArray(offer.features)
                  ? offer.features
                  : [];

                return (
                  <div
                    key={offer.id}
                    className={`rounded-2xl border p-5 ${
                      offer.active
                        ? "border-emerald-500/20 bg-slate-950"
                        : "border-slate-800 bg-slate-950/60 opacity-75"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-amber-400">
                          {firm?.name || "Unknown Prop Firm"}
                        </p>

                        <h4 className="mt-1 text-lg font-bold">
                          {program?.name || "Unknown Program"}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {program?.phase || "No phase specified"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          offer.active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {offer.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800 p-3">
                        <p className="text-xs text-slate-500">
                          Account Size
                        </p>
                        <p className="mt-1 font-bold">
                          {program?.native_currency || "USD"}{" "}
                          {Number(offer.account_size).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 p-3">
                        <p className="text-xs text-slate-500">
                          Selling Price
                        </p>
                        <p className="mt-1 font-bold text-amber-300">
                          {offer.currency || "NGN"}{" "}
                          {Number(offer.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 p-3">
                        <p className="text-xs text-slate-500">
                          Stock
                        </p>
                        <p className="mt-1 font-bold">
                          {offer.stock_quantity}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {offer.allow_buy_now && (
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                          Buy Now
                        </span>
                      )}

                      {offer.allow_pay_small_small && (
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
                          Pay Small Small
                        </span>
                      )}
                    </div>

                    {features.length > 0 && (
                      <div className="mt-4 rounded-xl border border-slate-800 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Features
                        </p>

                        <ul className="mt-2 space-y-1 text-sm text-slate-300">
                          {features.slice(0, 6).map((feature: string) => (
                            <li key={feature}>
                              ✓ {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {offer.description && (
                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        {offer.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => editPropOffer(offer)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Edit Offer</button>
                      <button type="button" onClick={() => updatePropOfferPrice(offer)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Quick Price</button>
                      <button type="button" onClick={() => updatePropOfferStock(offer)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Quick Stock</button>
                      <button type="button" onClick={() => togglePropOfferActive(offer)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${offer.active ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{offer.active ? "Deactivate" : "Activate"}</button>
                      <button type="button" onClick={() => archivePropOffer(offer)} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400">Delete / Archive</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PROP PURCHASE DELIVERIES */}

      <section className={`mt-8 ${activeAdminSection === "deliveries" ? "block" : "hidden"}`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Prop Account Deliveries
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Process fully paid orders using the client's email, then update
              the delivery status after the prop firm sends the account.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-amber-500/10 px-3 py-1 font-semibold text-amber-400">
              {
                propPurchaseApprovals.filter(
                  (purchase) =>
                    purchase.fulfillment_status === "pending_delivery"
                ).length
              }{" "}
              Pending
            </span>

            <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-400">
              {
                propPurchaseApprovals.filter(
                  (purchase) => purchase.fulfillment_status === "delivered"
                ).length
              }{" "}
              Delivered
            </span>

            <span className="rounded-full bg-red-500/10 px-3 py-1 font-semibold text-red-400">
              {
                propPurchaseApprovals.filter(
                  (purchase) =>
                    purchase.fulfillment_status === "not_delivered"
                ).length
              }{" "}
              Not Delivered
            </span>
          </div>
        </div>

        {propPurchaseApprovals.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No fully paid prop account orders yet.
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {propPurchaseApprovals.map((purchase) => {
              const offer = Array.isArray(purchase.prop_offers)
                ? purchase.prop_offers[0]
                : purchase.prop_offers;
              const program = Array.isArray(offer?.prop_programs)
                ? offer.prop_programs[0]
                : offer?.prop_programs;
              const firm = Array.isArray(program?.prop_firms)
                ? program.prop_firms[0]
                : program?.prop_firms;
              const client = getClientById(purchase.user_id);
              const busy = processingPurchaseId === purchase.id;
              const isPending =
                purchase.fulfillment_status === "pending_delivery";
              const isDelivered =
                purchase.fulfillment_status === "delivered";
              const fundingPercent =
                Number(purchase.total_price) > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (Number(purchase.amount_paid) /
                          Number(purchase.total_price)) *
                          100
                      )
                    )
                  : 0;

              return (
                <div
                  key={purchase.id}
                  className={`rounded-2xl border bg-slate-900 p-6 ${
                    isDelivered
                      ? "border-emerald-500/30"
                      : purchase.fulfillment_status === "not_delivered"
                        ? "border-red-500/30"
                        : "border-amber-500/30"
                  }`}
                >
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Client
                      </p>
                      <p className="mt-1 font-semibold">
                        {client ? getClientLabel(client) : purchase.user_id}
                      </p>
                      <p className="mt-2 break-all text-sm text-blue-300">
                        {client?.email || "Email not found"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Account Ordered
                      </p>
                      <p className="mt-1 text-lg font-bold text-amber-300">
                        {firm?.name || "Unknown firm"}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">
                        {program?.name || "Program"}
                        {program?.phase ? ` — ${program.phase}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Size: USD{" "}
                        {Number(offer?.account_size ?? 0).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Payment
                      </p>
                      <p className="mt-1 font-bold">
                        {purchase.currency || "NGN"}{" "}
                        {Number(purchase.amount_paid).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-400">
                        {fundingPercent}% paid
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {String(purchase.purchase_type || "").replace(/_/g, " ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Delivery Status
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          isDelivered
                            ? "bg-emerald-500/10 text-emerald-400"
                            : purchase.fulfillment_status === "not_delivered"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {purchase.fulfillment_status.replace(/_/g, " ")}
                      </span>
                      <p className="mt-3 text-xs text-slate-500">
                        Order ID: {purchase.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-800 pt-5">
                    {isPending && (
                      <p className="mb-4 text-sm text-slate-400">
                        Purchase the account using the client's email above.
                        After the prop firm sends it, mark this order as
                        delivered.
                      </p>
                    )}

                    {isDelivered && purchase.delivered_at && (
                      <p className="mb-4 text-sm text-emerald-300">
                        Marked delivered on{" "}
                        {new Date(purchase.delivered_at).toLocaleString()}.
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {!isDelivered && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updatePropDeliveryStatus(purchase, "delivered")
                          }
                          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? "Updating..." : "Mark as Delivered"}
                        </button>
                      )}

                      {purchase.fulfillment_status !== "not_delivered" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updatePropDeliveryStatus(
                              purchase,
                              "not_delivered"
                            )
                          }
                          className="rounded-xl bg-red-500/10 px-5 py-3 font-semibold text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Mark as Not Delivered
                        </button>
                      )}

                      {!isPending && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updatePropDeliveryStatus(
                              purchase,
                              "pending_delivery"
                            )
                          }
                          className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Return to Pending
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* PROP FIRM REQUESTS */}

      <section className={`mt-8 ${activeAdminSection === "deliveries" ? "block" : "hidden"}`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Prop Firm Requests</h2>
            <p className="mt-1 text-sm text-slate-400">
              Review accounts clients want that are not currently in your inventory.
            </p>
          </div>

          <span className="w-fit rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">
            {propFirmRequests.filter((request) => request.status === "pending").length} Pending
          </span>
        </div>

        {propFirmRequests.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No prop firm requests yet.
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {propFirmRequests.map((request) => {
              const client = getClientById(request.user_id);
              const busy = processingPropFirmRequestId === request.id;

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">Client</p>
                        <p className="mt-1 font-semibold">
                          {client ? getClientLabel(client) : request.user_id}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">Prop Firm</p>
                        <p className="mt-1 text-lg font-bold text-purple-300">{request.prop_firm}</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Size: {request.account_size || "Not specified"}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Type: {request.phase || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">Client Notes</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                          {request.notes || "No additional notes."}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
                        <span className="mt-2 inline-block rounded-full bg-white/5 px-3 py-1 text-sm font-semibold capitalize">
                          {request.status}
                        </span>
                        {request.admin_note && (
                          <p className="mt-3 text-sm text-amber-300">
                            Admin note: {request.admin_note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:max-w-[300px] xl:justify-end">
                      <button type="button" disabled={busy} onClick={() => updatePropFirmRequestStatus(request.id, "reviewing")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">
                        Reviewing
                      </button>
                      <button type="button" disabled={busy} onClick={() => updatePropFirmRequestStatus(request.id, "approved")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">
                        Approve
                      </button>
                      <button type="button" disabled={busy} onClick={() => updatePropFirmRequestStatus(request.id, "rejected")} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">
                        Reject
                      </button>
                      <button type="button" disabled={busy} onClick={() => updatePropFirmRequestStatus(request.id, "completed")} className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">
                        Complete
                      </button>
                      <button type="button" disabled={busy || processingArchiveKey === `prop_firm_requests:${request.id}`} onClick={() => archiveRecord("prop_firm_requests", request.id)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 disabled:opacity-50">
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SUPPORT INBOX */}

      <section className={`mt-8 ${activeAdminSection === "support" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Support Inbox
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Read and reply to messages from clients.
            </p>
          </div>

          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            {supportUsers.length} Conversations
          </span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">

          {/* CLIENT LIST */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h3 className="font-semibold">
              Clients
            </h3>

            <div className="mt-4 space-y-2">
              {supportUsers.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No client messages yet.
                </p>
              ) : (
                supportUsers.map((userId) => {
                  const userMessages =
                    supportMessages.filter(
                      (message) =>
                        message.user_id ===
                        userId
                    );

                  const latestMessage =
                    userMessages[
                      userMessages.length - 1
                    ];

                  return (
                    <button
                      key={userId}
                      type="button"
                      onClick={() =>
                        setSelectedSupportUser(
                          userId
                        )
                      }
                      className={`w-full rounded-xl border p-3 text-left ${
                        selectedSupportUser ===
                        userId
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-800 bg-slate-950"
                      }`}
                    >
                      <p className="truncate text-sm font-semibold">
                        {getSupportClientLabel(userId)}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {latestMessage?.message}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* CONVERSATION */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            {!selectedSupportUser ? (
              <div className="flex min-h-80 items-center justify-center text-slate-400">
                Select a client conversation.
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                  <p className="text-sm text-slate-400">
                    Client
                  </p>

                  <p className="break-all font-semibold">
                    {getSupportClientLabel(selectedSupportUser)}
                  </p>

                  {getClientById(selectedSupportUser) && (
                    <p className="mt-1 text-xs text-slate-400">
                      {[
                        getClientById(selectedSupportUser)?.phone,
                        getClientById(selectedSupportUser)?.phone_number,
                      ].find(Boolean) || "No phone number saved"}
                    </p>
                  )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openClientWhatsApp(getClientById(selectedSupportUser))}
                    disabled={!getClientWhatsAppNumber(getClientById(selectedSupportUser))}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      getClientWhatsAppNumber(getClientById(selectedSupportUser))
                        ? "Open a personalised WhatsApp message"
                        : "This client has no phone number saved"
                    }
                  >
                    WhatsApp client
                  </button>
                </div>

                <div className="mt-5 max-h-[450px] space-y-4 overflow-y-auto pr-2">
                  {selectedConversation.map(
                    (message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_role ===
                          "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xl rounded-2xl border px-4 py-3 ${
                            message.sender_role ===
                            "admin"
                              ? "fth-support-message-admin"
                              : "fth-support-message-client"
                          }`}
                        >
                          <p className="text-xs font-semibold opacity-70">
                            {message.sender_role ===
                            "admin"
                              ? "You"
                              : "Client"}
                          </p>

                          <p className="mt-1 whitespace-pre-wrap">
                            {message.message}
                          </p>

                          <p className="mt-2 text-xs opacity-60">
                            {new Date(
                              message.created_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-5 border-t border-slate-800 pt-5">
                  <textarea
                    rows={4}
                    placeholder="Reply to this client..."
                    value={adminReply}
                    onChange={(e) =>
                      setAdminReply(
                        e.target.value
                      )
                    }
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                  />

                  <button
                    type="button"
                    disabled={sendingReply}
                    onClick={sendAdminReply}
                    className="mt-3 rounded-xl bg-blue-600 px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingReply
                      ? "Sending..."
                      : "Send Reply"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* PENDING WITHDRAWALS */}

      <section className={`mt-8 ${activeAdminSection === "withdrawals" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Pending Withdrawals
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review client withdrawal requests and their saved bank details.
            </p>
          </div>

          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-400">
            {withdrawals.length} Pending
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">
              No pending withdrawals.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {withdrawals.map((withdrawal) => {
              const client = getClientById(withdrawal.user_id);
              const bank = withdrawalBankAccounts.find(
                (account) => account.id === withdrawal.bank_account_id
              );

              return (
                <div
                  key={withdrawal.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-400">
                          Withdrawal Amount
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {withdrawal.currency || "NGN"}{" "}
                          {Number(withdrawal.requested_amount).toLocaleString()}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Ref: {withdrawal.reference}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(withdrawal.requested_at).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">
                          Client
                        </p>

                        <p className="mt-1 font-semibold">
                          {client
                            ? getClientLabel(client)
                            : withdrawal.user_id}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">
                          Bank Details
                        </p>

                        {bank ? (
                          <div className="mt-1 space-y-1 text-sm">
                            <p className="font-semibold">
                              {bank.bank_name}
                            </p>
                            <p>{bank.account_name}</p>
                            <p className="font-mono">
                              {bank.account_number}
                            </p>
                            <p className="text-xs text-slate-500">
                              Verification: {bank.verification_status || "pending"}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-amber-400">
                            Bank details unavailable
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={
                          processingWithdrawalId === withdrawal.id
                        }
                        onClick={() =>
                          approveWithdrawal(withdrawal.id)
                        }
                        className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingWithdrawalId === withdrawal.id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          processingWithdrawalId === withdrawal.id
                        }
                        onClick={() =>
                          rejectWithdrawal(withdrawal.id)
                        }
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* APPROVED WITHDRAWALS / PAYOUTS */}

      <section className={`mt-8 ${activeAdminSection === "withdrawals" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Approved Withdrawals
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              After you actually send the money to the client's bank, mark the payout as completed.
            </p>
          </div>

          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            {approvedWithdrawals.length} Awaiting Payout
          </span>
        </div>

        {approvedWithdrawals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">
              No approved withdrawals awaiting payout.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {approvedWithdrawals.map((withdrawal) => {
              const client = getClientById(withdrawal.user_id);
              const bank = withdrawalBankAccounts.find(
                (account) => account.id === withdrawal.bank_account_id
              );

              return (
                <div
                  key={withdrawal.id}
                  className="rounded-2xl border border-blue-500/20 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-400">
                          Amount to Pay
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                          {withdrawal.currency || "NGN"}{" "}
                          {Number(withdrawal.net_amount ?? withdrawal.requested_amount).toLocaleString()}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Ref: {withdrawal.reference}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">
                          Client
                        </p>

                        <p className="mt-1 font-semibold">
                          {client
                            ? getClientLabel(client)
                            : withdrawal.user_id}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-400">
                          Bank Details
                        </p>

                        {bank ? (
                          <div className="mt-1 space-y-1 text-sm">
                            <p className="font-semibold">
                              {bank.bank_name}
                            </p>
                            <p>{bank.account_name}</p>
                            <p className="font-mono">
                              {bank.account_number}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm text-amber-400">
                            Bank details unavailable
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        processingWithdrawalId === withdrawal.id
                      }
                      onClick={() =>
                        completeWithdrawal(withdrawal.id)
                      }
                      className="rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingWithdrawalId === withdrawal.id
                        ? "Processing..."
                        : "Mark Paid / Completed"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CUSTOMER PAYMENT ACCOUNT */}

      <section className={`mt-8 ${activeAdminSection === "payments" ? "block" : "hidden"}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Customer Payment Account</h2>
            <p className="mt-2 text-sm text-slate-400">
              This is the Fidelity Traders Hub bank account customers see after
              choosing Buy Now or Add Payment.
            </p>
          </div>

          <span className={`w-fit rounded-full px-3 py-1 text-sm ${
            businessPaymentAccounts.some(
              (account) => account.active && account.is_default
            )
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400"
          }`}>
            {businessPaymentAccounts.some(
              (account) => account.active && account.is_default
            )
              ? "Active"
              : "Setup Required"}
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-slate-900 p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-sm text-slate-300">
              Bank Name
              <input
                value={businessBankName}
                onChange={(event) => setBusinessBankName(event.target.value)}
                placeholder="e.g. Moniepoint"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </label>

            <label className="text-sm text-slate-300">
              Account Name
              <input
                value={businessAccountName}
                onChange={(event) => setBusinessAccountName(event.target.value)}
                placeholder="Fidelity Traders Hub"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </label>

            <label className="text-sm text-slate-300">
              Account Number
              <input
                value={businessAccountNumber}
                onChange={(event) =>
                  setBusinessAccountNumber(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                inputMode="numeric"
                placeholder="Enter account number"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-white outline-none focus:border-emerald-500"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm text-slate-300">
            Optional Payment Instructions
            <textarea
              value={businessPaymentInstructions}
              onChange={(event) =>
                setBusinessPaymentInstructions(event.target.value)
              }
              placeholder="Example: Use the payment reference shown in the popup."
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
          </label>

          <button
            type="button"
            onClick={saveBusinessPaymentAccount}
            disabled={savingBusinessAccount}
            className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingBusinessAccount ? "Saving..." : "Save Customer Payment Account"}
          </button>
        </div>
      </section>

      {/* PENDING DEPOSITS */}

      <section className={`mt-8 ${activeAdminSection === "payments" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Pending Deposits
          </h2>

          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-400">
            {deposits.length} Pending
          </span>
        </div>

        {deposits.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">
              No pending deposits.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {deposits.map((deposit) => {
              const client = getClientById(deposit.user_id);
              const readyForVerification =
                deposit.status === "awaiting_verification";

              return (
              <div
                key={deposit.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="grid flex-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                    <p className="text-sm text-slate-400">
                      {deposit.product_label || "Wallet Payment"}
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      ₦
                      {Number(
                        deposit.amount
                      ).toLocaleString()}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      FTH Ref: {deposit.reference}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Purpose: {String(
                        deposit.payment_purpose || "wallet_funding"
                      ).replaceAll("_", " ")}
                    </p>
                  </div>

                    <div>
                      <p className="text-sm text-slate-400">Customer</p>
                      <p className="mt-1 font-semibold">
                        {client ? getClientLabel(client) : deposit.user_id}
                      </p>
                      <p className={`mt-3 w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                        readyForVerification
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {readyForVerification
                          ? "Awaiting Verification"
                          : "Waiting for Transfer Details"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Transfer Details</p>
                      <div className="mt-1 space-y-1 text-sm">
                        <p>FTH ref: {deposit.payment_reference || deposit.reference}</p>
                        <p>Sender: {deposit.sender_name || "Not submitted"}</p>
                        <p>Sender bank: {deposit.sender_bank || "Not submitted"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={
                        processingId ===
                          deposit.id || !readyForVerification
                      }
                      onClick={() =>
                        approveDeposit(
                          deposit.id
                        )
                      }
                      className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold disabled:opacity-50"
                      title={
                        readyForVerification
                          ? "Approve and apply this payment"
                          : "Customer must submit transfer details first"
                      }
                    >
                      {processingId ===
                      deposit.id
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        deposit.id
                      }
                      onClick={() =>
                        rejectDeposit(
                          deposit.id
                        )
                      }
                      className="rounded-xl bg-red-600 px-5 py-3 font-semibold disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ASSIGN CLIENT ACCOUNT */}

      <section className={`mt-8 ${activeAdminSection === "accounts" ? "block" : "hidden"}`}>
        <h2 className="text-2xl font-bold">
          Assign Client Account
        </h2>

        <p className="mt-2 text-slate-400">
          Add a trading account purchased by a client.
        </p>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Client contacts</h3>
              <p className="mt-1 text-sm text-slate-400">
                Open a personalised WhatsApp message for any registered client.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {clientProfiles.filter((profile) => getClientWhatsAppNumber(profile)).length} with phone numbers
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clientProfiles.map((profile) => {
              const phone = profile.phone || profile.phone_number || "";
              const canMessage = Boolean(getClientWhatsAppNumber(profile));

              return (
                <div key={profile.id || profile.user_id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{getClientLabel(profile)}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {phone || "Phone unavailable"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openClientWhatsApp(profile)}
                    disabled={!canMessage}
                    className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    WhatsApp
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={clientUserId}
              onChange={(e) =>
                setClientUserId(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="">
                Select Client
              </option>

              {clientProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {getClientLabel(profile)}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Account name"
              value={accountName}
              onChange={(e) =>
                setAccountName(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="text"
              placeholder="Prop firm"
              value={propFirm}
              onChange={(e) =>
                setPropFirm(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="text"
              placeholder="Account size e.g. 50000"
              value={accountSize}
              onChange={(e) =>
                setAccountSize(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="text"
              placeholder="Phase e.g. Phase 1"
              value={phase}
              onChange={(e) =>
                setPhase(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="number"
              placeholder="Amount paid"
              value={amountPaid}
              onChange={(e) =>
                setAmountPaid(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <select
              value={accountStatus}
              onChange={(e) =>
                setAccountStatus(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="working_on">
                Working On
              </option>

              <option value="pending_delivery">
                Pending Delivery
              </option>

              <option value="delivered">
                Delivered
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={assignClientAccount}
            disabled={savingAccount}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold disabled:opacity-50"
          >
            {savingAccount
              ? "Saving..."
              : "Assign Account"}
          </button>
        </div>
      </section>

      {/* TRADINGVIEW PLAN CATALOG */}

      <section id="tradingview-offers" className={`scroll-mt-6 mt-8 ${activeAdminSection === "tradingview" ? "block" : "hidden"}`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">TradingView Offers</h2>
            <p className="mt-1 text-sm text-slate-400">Post, edit, activate/deactivate and delete the plans shown in Marketplace.</p>
          </div>
          <span className="w-fit rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">{tvCatalogPlans.length} Plans</span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">{tvCatalogEditingId ? "Editing plan" : "New offer"}</p>
            <h3 className="mt-2 text-lg font-semibold">{tvCatalogEditingId ? "Edit TradingView Plan" : "Post TradingView Plan"}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input value={tvCatalogName} onChange={(e) => setTvCatalogName(e.target.value)} placeholder="Plan name e.g. Premium" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2" />
              <input value={tvCatalogTier} onChange={(e) => setTvCatalogTier(e.target.value)} placeholder="Tier e.g. premium" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <select value={tvCatalogAccessType} onChange={(e) => setTvCatalogAccessType(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><option value="individual">Individual</option><option value="co_sponsor">Co-sponsor</option><option value="full">Full access</option></select>
              <input type="number" min="1" step="1" value={tvCatalogDurationDays} onChange={(e) => setTvCatalogDurationDays(e.target.value)} placeholder="Duration days" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="number" min="1" value={tvCatalogPrice} onChange={(e) => setTvCatalogPrice(e.target.value)} placeholder="Selling price" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input value={tvCatalogCurrency} onChange={(e) => setTvCatalogCurrency(e.target.value)} placeholder="Currency" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <textarea rows={3} value={tvCatalogDescription} onChange={(e) => setTvCatalogDescription(e.target.value)} placeholder="Customer-facing description" className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2" />
              <textarea rows={5} value={tvCatalogFeatures} onChange={(e) => setTvCatalogFeatures(e.target.value)} placeholder={"Features — one per line\n30-day access\nPrivate login\nSupport included"} className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2" />
              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><input type="checkbox" checked={tvCatalogAllowBuyNow} onChange={(e) => setTvCatalogAllowBuyNow(e.target.checked)} /><span className="text-sm text-slate-300">Allow Buy Now</span></label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><input type="checkbox" checked={tvCatalogAllowPaySmallSmall} onChange={(e) => setTvCatalogAllowPaySmallSmall(e.target.checked)} /><span className="text-sm text-slate-300">Allow Pay Small Small</span></label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2"><input type="checkbox" checked={tvCatalogActive} onChange={(e) => setTvCatalogActive(e.target.checked)} /><span className="text-sm text-slate-300">Publish as active</span></label>
            </div>
            <button type="button" onClick={saveTradingViewCatalogPlan} disabled={savingTvCatalogPlan} className="mt-4 w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold disabled:opacity-50">{savingTvCatalogPlan ? "Saving..." : tvCatalogEditingId ? "Save Plan Changes" : "Post TradingView Plan"}</button>
            {tvCatalogEditingId && <button type="button" onClick={resetTradingViewCatalogForm} className="mt-2 w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300">Cancel Editing</button>}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">Current TradingView Plans</h3>
            <p className="mt-1 text-sm text-slate-400">Inactive plans stay saved but disappear from Marketplace.</p>
            {tvCatalogPlans.length === 0 ? <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-400">No TradingView plans posted yet.</div> : (
              <div className="mt-5 space-y-4">{tvCatalogPlans.map((plan) => (
                <div key={plan.id} className={`rounded-xl border p-4 ${plan.active ? "border-purple-500/20 bg-slate-950" : "border-slate-800 bg-slate-950/60 opacity-75"}`}>
                  <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{plan.name}</p><p className="mt-1 text-xs text-slate-500">{plan.tier} · {plan.access_type} · {plan.duration_days} days</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>{plan.active ? "ACTIVE" : "INACTIVE"}</span></div>
                  <p className="mt-3 text-xl font-bold text-amber-300">{plan.currency || "NGN"} {Number(plan.price || 0).toLocaleString()}</p>
                  {plan.description && <p className="mt-2 text-sm text-slate-400">{plan.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => editTradingViewCatalogPlan(plan)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold">Edit</button><button type="button" disabled={processingTvCatalogPlanId === plan.id} onClick={() => toggleTradingViewCatalogPlan(plan)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${plan.active ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>{plan.active ? "Deactivate" : "Activate"}</button><button type="button" disabled={processingTvCatalogPlanId === plan.id} onClick={() => deleteTradingViewCatalogPlan(plan)} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400">Delete</button></div>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </section>

      {/* TRADINGVIEW PURCHASE DELIVERIES */}

      <section className={`mt-8 ${activeAdminSection === "tradingview" ? "block" : "hidden"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">TradingView Deliveries</h2>
            <p className="mt-2 text-slate-400">
              Fully paid orders waiting for login details and activation.
            </p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
            {tvPendingDeliveries.length} Pending
          </span>
        </div>

        {tvPendingDeliveries.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No fully paid TradingView orders are waiting for delivery.
          </div>
        ) : (
          <div className="mt-5 grid gap-5">
            {tvPendingDeliveries.map((purchase) => {
              const plan = Array.isArray(purchase.tradingview_plans)
                ? purchase.tradingview_plans[0]
                : purchase.tradingview_plans;
              const client = getClientById(purchase.user_id);
              const draft = tvDeliveryDrafts[purchase.id] ?? {
                loginEmail: purchase.purchase_email ?? "",
                loginPassword: "",
                deliveryNote: "",
                coSponsorName: "",
                coSponsorPhone: "",
                showCoSponsor: false,
              };

              return (
                <div key={purchase.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                      <div className="text-sm text-blue-300">{plan?.name ?? "TradingView Plan"}</div>
                      <div className="mt-1 text-xl font-bold">
                        {purchase.currency} {Number(purchase.total_price ?? 0).toLocaleString()}
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        {plan?.access_type ?? "Individual"} · {plan?.duration_days ?? 30} days · {purchase.purchase_type === "pay_small_small" ? "Pay Small Small" : "Buy Now"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Customer</div>
                      <div className="mt-1 font-semibold">{client ? getClientLabel(client) : purchase.user_id}</div>
                      <div className="mt-1 text-sm text-slate-300">{purchase.purchase_email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Payment</div>
                      <div className="mt-1 font-semibold text-emerald-300">Fully Paid</div>
                      <div className="mt-1 text-sm text-slate-300">
                        {purchase.currency} {Number(purchase.amount_paid ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input
                      value={draft.loginEmail}
                      onChange={(e) => updateTvDeliveryDraft(purchase.id, "loginEmail", e.target.value, purchase.purchase_email)}
                      placeholder="TradingView username or login email *"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                    <input
                      value={draft.loginPassword}
                      onChange={(e) => updateTvDeliveryDraft(purchase.id, "loginPassword", e.target.value, purchase.purchase_email)}
                      placeholder="TradingView password *"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                    <textarea
                      value={draft.deliveryNote}
                      onChange={(e) => updateTvDeliveryDraft(purchase.id, "deliveryNote", e.target.value, purchase.purchase_email)}
                      placeholder="Message or usage instructions (optional)"
                      rows={3}
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 md:col-span-2"
                    />
                    <input
                      value={draft.coSponsorName}
                      onChange={(e) => updateTvDeliveryDraft(purchase.id, "coSponsorName", e.target.value, purchase.purchase_email)}
                      placeholder="Co-sponsor name (optional)"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                    <input
                      value={draft.coSponsorPhone}
                      onChange={(e) => updateTvDeliveryDraft(purchase.id, "coSponsorPhone", e.target.value, purchase.purchase_email)}
                      placeholder="Co-sponsor phone (optional)"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                    <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={draft.showCoSponsor}
                        onChange={(e) => updateTvDeliveryDraft(purchase.id, "showCoSponsor", e.target.checked, purchase.purchase_email)}
                      />
                      <span className="text-sm text-slate-300">Show co-sponsor details to this customer</span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => activateTradingViewPurchase(purchase)}
                    disabled={activatingTvPurchaseId === purchase.id}
                    className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-semibold disabled:opacity-50"
                  >
                    {activatingTvPurchaseId === purchase.id
                      ? "Activating..."
                      : `Activate & Send Details (${plan?.duration_days ?? 30} Days)`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* MANUAL TRADINGVIEW ASSIGNMENT */}

      <section className={`mt-8 ${activeAdminSection === "tradingview" ? "block" : "hidden"}`}>
        <h2 className="text-2xl font-bold">
          Assign TradingView Plan
        </h2>

        <p className="mt-2 text-slate-400">
          Give a 30-day TradingView subscription to a client.
        </p>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={tvUserId}
              onChange={(e) =>
                setTvUserId(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="">
                Select Client
              </option>

              {clientProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {getClientLabel(profile)}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Plan name e.g. TradingView Premium"
              value={tvPlanName}
              onChange={(e) =>
                setTvPlanName(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="email"
              placeholder="TradingView login email"
              value={tvLoginEmail}
              onChange={(e) =>
                setTvLoginEmail(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="text"
              placeholder="TradingView login password"
              value={tvLoginPassword}
              onChange={(e) =>
                setTvLoginPassword(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <select
              value={tvStatus}
              onChange={(e) =>
                setTvStatus(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="completed">Completed</option>
              <option value="suspended">Suspended</option>
            </select>

            <input
              type="text"
              placeholder="TradingView co-sponsor name (optional)"
              value={tvCoSponsorName}
              onChange={(e) =>
                setTvCoSponsorName(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              type="tel"
              placeholder="TradingView co-sponsor phone (optional)"
              value={tvCoSponsorPhone}
              onChange={(e) =>
                setTvCoSponsorPhone(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
              <input
                type="checkbox"
                checked={tvCoSponsorVisible}
                onChange={(e) =>
                  setTvCoSponsorVisible(e.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-slate-300">
                Show TradingView co-sponsor details to this client
              </span>
            </label>

            <textarea
              rows={3}
              placeholder="Delivery note (optional)"
              value={tvDeliveryNote}
              onChange={(e) =>
                setTvDeliveryNote(e.target.value)
              }
              className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 md:col-span-2"
            />

            <label className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 md:col-span-2">
              <input
                type="checkbox"
                checked={tvDetailsVisible}
                onChange={(e) =>
                  setTvDetailsVisible(e.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-purple-200">
                Make these TradingView login details visible to this client
              </span>
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
            <p className="text-sm text-purple-300">
              Subscription duration:
              30 days
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Start and expiry dates are
              generated automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={
              assignTradingViewPlan
            }
            disabled={savingTvPlan}
            className="mt-5 rounded-xl bg-purple-600 px-6 py-3 font-semibold disabled:opacity-50"
          >
            {savingTvPlan
              ? "Assigning..."
              : "Assign TradingView Plan"}
          </button>
        </div>
      </section>

      {/* TRADINGVIEW SUBSCRIPTIONS */}

      <section className={`mt-8 ${activeAdminSection === "tradingview" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            TradingView Subscriptions
          </h2>

          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-sm text-purple-400">
            {tvSubscriptions.length} Plans
          </span>
        </div>

        {tvSubscriptions.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            No TradingView subscriptions
            assigned yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {tvSubscriptions.map(
              (subscription) => {
                const daysRemaining =
                  getDaysRemaining(
                    subscription.expires_at
                  );

                return (
                  <div
                    key={
                      subscription.id
                    }
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {
                            subscription.plan_name
                          }
                        </h3>

                        <p className="mt-1 break-all text-sm text-slate-400">
                          Client:{" "}
                          {getClientById(subscription.user_id)
                            ? getClientLabel(
                                getClientById(subscription.user_id)
                              )
                            : subscription.user_id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          daysRemaining >
                          0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {daysRemaining >
                        0
                          ? "Active"
                          : "Expired"}
                      </span>
                    </div>

                    <div className="mt-5">
                      <p className="text-sm text-slate-400">
                        Days Remaining
                      </p>

                      <p className="mt-1 text-3xl font-bold">
                        {
                          daysRemaining
                        }
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Expires:{" "}
                        {new Date(
                          subscription.expires_at
                        ).toLocaleString()}
                      </p>

                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
                        <p>
                          <span className="text-slate-400">
                            Login Email:
                          </span>{" "}
                          {subscription.login_email || "Not added"}
                        </p>

                        <p className="mt-2">
                          <span className="text-slate-400">
                            Login Password:
                          </span>{" "}
                          {subscription.login_password || "Not added"}
                        </p>

                        {subscription.delivery_note && (
                          <p className="mt-2">
                            <span className="text-slate-400">
                              Delivery Note:
                            </span>{" "}
                            {subscription.delivery_note}
                          </p>
                        )}

                        <p className="mt-2">
                          <span className="text-slate-400">
                            Visible to Client:
                          </span>{" "}
                          {subscription.details_visible ? "Yes" : "No"}
                        </p>

                        <p className="mt-2">
                          <span className="text-slate-400">
                            Co-sponsor:
                          </span>{" "}
                          {subscription.co_sponsor_name || "None"}
                        </p>

                        <p className="mt-2">
                          <span className="text-slate-400">
                            Co-sponsor Phone:
                          </span>{" "}
                          {subscription.co_sponsor_phone || "None"}
                        </p>

                        <p className="mt-2">
                          <span className="text-slate-400">
                            Co-sponsor Visible:
                          </span>{" "}
                          {subscription.co_sponsor_visible ? "Yes" : "No"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => archiveRecord("tradingview_subscriptions", subscription.id)}
                        disabled={processingArchiveKey === `tradingview_subscriptions:${subscription.id}`}
                        className="mt-4 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 disabled:opacity-50"
                      >Archive Subscription</button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* CLIENT ACCOUNTS */}

      <section className={`mt-8 ${activeAdminSection === "accounts" ? "block" : "hidden"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Client Accounts
          </h2>

          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            {clientAccounts.length} Accounts
          </span>
        </div>

        {clientAccounts.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">
              No client accounts assigned yet.
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

                  <div className="mt-5 space-y-2 text-sm">
                    <p>
                      <span className="text-slate-400">
                        Account Size:
                      </span>{" "}
                      {
                        account.account_size
                      }
                    </p>

                    <p>
                      <span className="text-slate-400">
                        Phase:
                      </span>{" "}
                      {account.phase}
                    </p>

                    <p>
                      <span className="text-slate-400">
                        Amount Paid:
                      </span>{" "}
                      ₦
                      {Number(
                        account.amount_paid
                      ).toLocaleString()}
                    </p>

                    <p className="break-all">
                      <span className="text-slate-400">
                        Client ID:
                      </span>{" "}
                      {getClientById(account.user_id)
                        ? getClientLabel(
                            getClientById(account.user_id)
                          )
                        : account.user_id}
                    </p>

                  </div>
                  <button
                    type="button"
                    onClick={() => archiveRecord("client_accounts", account.id)}
                    disabled={processingArchiveKey === `client_accounts:${account.id}`}
                    className="mt-5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 disabled:opacity-50"
                  >
                    {processingArchiveKey === `client_accounts:${account.id}` ? "Archiving..." : "Archive Account"}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <section className={`mt-8 ${activeAdminSection === "referrals" ? "block" : "hidden"}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Growth workspace</p>
            <h2 className="mt-2 text-2xl font-bold">Referrals & Discounts</h2>
            <p className="mt-1 text-sm text-slate-400">Manage partners, referral earnings, payouts and flexible service discounts.</p>
          </div>
          <button type="button" onClick={loadReferralWorkspace} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300">
            Refresh data
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-slate-900 p-5">
          <p className="font-semibold text-blue-300">Commission eligibility rule</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Eligible: TradingView, Trade Journal and prop accounts listed by Fidelity Traders Hub (including giveaways).
            Outside prop-firm requests are never commissionable.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Active Partners", referralPartners.filter((item) => item.status === "active").length],
            ["Available Commission", `NGN ${referralPartners.reduce((sum, item) => sum + Number(item.available_commission || 0), 0).toLocaleString()}`],
            ["Pending Payouts", partnerPayouts.filter((item) => item.status === "pending").length],
            ["Active Discounts", discountCodes.filter((item) => item.active).length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Create Referral Partner</h3>
            <p className="mt-1 text-sm text-slate-400">Connect an existing client account to a unique referral code.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select value={partnerUserId} onChange={(e) => setPartnerUserId(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2">
                <option value="">Select partner/client</option>
                {clientProfiles.map((profile) => <option key={profile.id} value={profile.id}>{getClientLabel(profile)}</option>)}
              </select>
              <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="Public partner name" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input value={partnerCode} onChange={(e) => setPartnerCode(e.target.value.toUpperCase())} placeholder="Referral code e.g. FARIDA10" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 uppercase" />
              <input type="number" min="0" max="100" value={partnerCommissionRate} onChange={(e) => setPartnerCommissionRate(e.target.value)} placeholder="Commission %" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="number" min="0" value={partnerMinimumPayout} onChange={(e) => setPartnerMinimumPayout(e.target.value)} placeholder="Minimum payout" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="number" min="0" value={partnerHoldDays} onChange={(e) => setPartnerHoldDays(e.target.value)} placeholder="Hold days" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2" />
            </div>
            <button type="button" onClick={createReferralPartner} disabled={savingPartner} className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50">
              {savingPartner ? "Creating..." : "Create Partner & Referral Code"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Create Discount Code</h3>
            <p className="mt-1 text-sm text-slate-400">Choose the service, value, limits and expiry.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} placeholder="Code e.g. WELCOME10" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 uppercase" />
              <select value={discountKind} onChange={(e) => setDiscountKind(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select>
              <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="Discount value" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <select value={discountScope} onChange={(e) => setDiscountScope(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><option value="all">All services</option><option value="prop_firm">FTH prop offers</option><option value="tradingview">TradingView</option><option value="trade_journal">Trade Journal</option></select>
              <input type="number" min="0" value={discountMaximum} onChange={(e) => setDiscountMaximum(e.target.value)} placeholder="Maximum discount (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="number" min="0" value={discountMinimumOrder} onChange={(e) => setDiscountMinimumOrder(e.target.value)} placeholder="Minimum order" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="number" min="1" value={discountMaxUses} onChange={(e) => setDiscountMaxUses(e.target.value)} placeholder="Total uses (blank = unlimited)" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="number" min="1" value={discountPerUser} onChange={(e) => setDiscountPerUser(e.target.value)} placeholder="Uses per client" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" />
              <input type="datetime-local" value={discountExpiry} onChange={(e) => setDiscountExpiry(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:col-span-2" />
            </div>
            <button type="button" onClick={createDiscountCode} disabled={savingDiscount} className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50">
              {savingDiscount ? "Creating..." : "Create Discount Code"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Partner Performance</h3>
            <div className="mt-4 space-y-3">
              {referralPartners.length === 0 ? <p className="text-sm text-slate-400">No referral partners yet.</p> : referralPartners.map((partner) => {
                const code = referralCodes.find((item) => item.partner_id === partner.partner_id);
                const clickCount = referralLinkClicks.filter((item) => item.partner_id === partner.partner_id).length;
                return <div key={partner.partner_id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{partner.display_name}</p><p className="mt-1 text-sm text-blue-300">{code?.code || "No code"} · {partner.default_commission_rate}%</p></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">{partner.status}</span></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p><span className="text-slate-500">Link clicks:</span> {clickCount}</p><p><span className="text-slate-500">Conversions:</span> {partner.conversion_count}</p><p><span className="text-slate-500">Revenue:</span> NGN {Number(partner.referred_revenue || 0).toLocaleString()}</p><p><span className="text-slate-500">Available:</span> NGN {Number(partner.available_commission || 0).toLocaleString()}</p><p><span className="text-slate-500">Paid:</span> NGN {Number(partner.paid_commission || 0).toLocaleString()}</p></div>
                  <button type="button" disabled={!code?.code} onClick={() => copyPartnerReferralLink(code?.code)} className="mt-4 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Copy referral link</button>
                </div>;
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Discount Codes</h3>
            <div className="mt-4 space-y-3">
              {discountCodes.length === 0 ? <p className="text-sm text-slate-400">No discount codes yet.</p> : discountCodes.map((code) => <div key={code.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"><div><p className="font-bold text-blue-300">{code.code}</p><p className="mt-1 text-sm text-slate-400">{code.discount_kind === "percentage" ? `${code.discount_value}%` : `NGN ${Number(code.discount_value).toLocaleString()}`} · {code.applies_to?.join(", ")} · {code.usage_count} uses</p></div><button type="button" onClick={() => toggleDiscountCode(code)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${code.active ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"}`}>{code.active ? "Deactivate" : "Activate"}</button></div>)}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Partner Payout Requests</h3><span className="text-sm text-slate-400">{referralCommissions.length} commission records</span></div>
          <div className="mt-4 space-y-3">
            {partnerPayouts.length === 0 ? <p className="text-sm text-slate-400">No payout requests yet.</p> : partnerPayouts.map((payout) => {
              const partner = referralPartners.find((item) => item.partner_id === payout.partner_id);
              const busy = processingPartnerPayoutId === payout.id;
              return <div key={payout.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold">{partner?.display_name || "Referral partner"}</p><p className="mt-1 text-xl font-bold">{payout.currency} {Number(payout.requested_amount).toLocaleString()}</p><p className="mt-1 text-sm text-slate-400">{payout.bank_name} · {payout.account_name} · {payout.account_number}</p></div><span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase text-blue-300">{payout.status}</span></div>{payout.status !== "paid" && payout.status !== "rejected" && <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={() => updatePartnerPayout(payout, "approved")} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold disabled:opacity-50">Approve</button><button disabled={busy} onClick={() => updatePartnerPayout(payout, "processing")} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold disabled:opacity-50">Processing</button><button disabled={busy} onClick={() => updatePartnerPayout(payout, "paid")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold disabled:opacity-50">Mark Paid</button><button disabled={busy} onClick={() => updatePartnerPayout(payout, "rejected")} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 disabled:opacity-50">Reject</button></div>}</div>;
            })}
          </div>
        </div>
      </section>

      <section className={`mt-8 ${activeAdminSection === "trade_journal" ? "block" : "hidden"}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Product operations
            </p>
            <h2 className="mt-2 text-2xl font-bold">Trade Journal</h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage journal access, payment verification, activation codes and pricing from your main FTH admin.
            </p>
          </div>
          <button
            type="button"
            onClick={loadTradeJournalWorkspace}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300"
          >
            Refresh journal data
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <p className="font-semibold text-blue-200">One-dashboard operating rule</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Journal payments and access are managed here. Referrals remain in Referrals &amp; Discounts,
            support remains in Support Inbox, and prop-firm catalogue management remains in Prop Inventory.
            No duplicate admin system is created.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Journal access policy</p>
              <h3 className="mt-2 text-lg font-bold">
                {journalAccessMode === "free_all" ? "Free for everyone" : "Premium with individual free grants"}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Global free mode opens the Journal to every signed-in FTH client. Premium mode keeps paid subscriptions active and lets you grant complimentary access to selected clients below.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={savingJournalAccess || journalAccessMode === "free_all"}
                onClick={() => setJournalGlobalAccess("free_all")}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Make free for everyone
              </button>
              <button
                type="button"
                disabled={savingJournalAccess || journalAccessMode === "premium"}
                onClick={() => setJournalGlobalAccess("premium")}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Use premium access
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Journal Clients", journalSubscriptions.length],
            ["Active Pro", journalSubscriptions.filter((item) => item.plan === "pro" && item.status === "active" && (!item.end_date || new Date(item.end_date) > new Date())).length],
            ["Pending Payments", journalPayments.filter((item) => item.status === "pending").length],
            ["Approved Revenue", `NGN ${journalPayments.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Journal Clients &amp; Access</h3>
              <p className="mt-1 text-sm text-slate-400">
                See each client's Free/Pro access, status and expiry using the existing FTH client identity.
              </p>
            </div>
            <input
              value={journalUserSearch}
              onChange={(event) => setJournalUserSearch(event.target.value)}
              placeholder="Search client or email"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 sm:max-w-sm"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr className="border-b border-slate-800">
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Started</th>
                  <th className="px-3 py-3">Expiry</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Access control</th>
                </tr>
              </thead>
              <tbody>
                {clientProfiles
                  .filter((profile) => {
                    const query = journalUserSearch.trim().toLowerCase();
                    if (!query) return true;
                    return getClientLabel(profile).toLowerCase().includes(query);
                  })
                  .map((profile) => {
                    const subscription = getJournalSubscription(profile.id);
                    const plan = subscription?.plan === "pro" ? "Pro" : "Free";
                    const complimentary = subscription?.source === "admin" && subscription?.plan === "pro";
                    const busy = processingJournalUserId === profile.id;
                    return (
                      <tr key={profile.id} className="border-b border-slate-800/70">
                        <td className="px-3 py-4">
                          <p className="font-semibold">{getClientLabel(profile)}</p>
                        </td>
                        <td className="px-3 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan === "Pro" ? "bg-blue-500/10 text-blue-300" : "bg-slate-800 text-slate-400"}`}>
                            {plan}
                          </span>
                        </td>
                        <td className="px-3 py-4 capitalize">{subscription?.status || "free"}</td>
                        <td className="px-3 py-4 text-slate-400">
                          {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-4 text-slate-400">
                          {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-4">{subscription?.duration_months || 0} months</td>
                        <td className="px-3 py-4">
                          {complimentary ? (
                            <button type="button" disabled={busy} onClick={() => revokeJournalFreeAccess(profile.id)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 disabled:opacity-50">
                              {busy ? "Updating..." : "Revoke free access"}
                            </button>
                          ) : subscription?.source === "payment" || subscription?.source === "activation_code" ? (
                            <span className="text-xs text-emerald-300">Paid/code access protected</span>
                          ) : (
                            <button type="button" disabled={busy} onClick={() => grantJournalFreeAccess(profile.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">
                              {busy ? "Granting..." : "Grant free access"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Trade Journal Payments</h3>
              <p className="mt-1 text-sm text-slate-400">
                Approval is atomic: one payment can extend a subscription only once.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["pending", "confirmed", "rejected", "all"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setJournalPaymentFilter(status)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${journalPaymentFilter === status ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {journalPayments
              .filter((payment) => journalPaymentFilter === "all" || payment.status === journalPaymentFilter)
              .map((payment) => {
                const busy = processingJournalPaymentId === payment.id;
                return (
                  <div key={payment.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <div className="xl:col-span-2">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Client</p>
                        <p className="mt-1 font-semibold">{getJournalClientLabel(payment.user_id)}</p>
                      </div>
                      <div><p className="text-xs text-slate-500">Duration</p><p className="mt-1 font-semibold">{payment.duration_months} months</p></div>
                      <div><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-semibold">NGN {Number(payment.amount || 0).toLocaleString()}</p></div>
                      <div><p className="text-xs text-slate-500">Reference</p><p className="mt-1 break-all font-semibold">{payment.transaction_reference || "—"}</p></div>
                      <div><p className="text-xs text-slate-500">Status</p><p className="mt-1 capitalize font-semibold">{payment.status}</p></div>
                    </div>
                    {payment.status === "pending" && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                        <button disabled={busy} onClick={() => approveJournalPayment(payment.id)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-50">
                          {busy ? "Processing..." : "Approve & Activate Pro"}
                        </button>
                        <button disabled={busy} onClick={() => rejectJournalPayment(payment.id)} className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    )}
                    {payment.rejection_reason && <p className="mt-3 text-sm text-red-300">Reason: {payment.rejection_reason}</p>}
                  </div>
                );
              })}
            {journalPayments.filter((payment) => journalPaymentFilter === "all" || payment.status === journalPaymentFilter).length === 0 && (
              <p className="text-sm text-slate-400">No {journalPaymentFilter === "all" ? "" : journalPaymentFilter} journal payments.</p>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Activation Codes</h3>
            <p className="mt-1 text-sm text-slate-400">
              Generate controlled Pro access for a giveaway, manual sale or support replacement.
            </p>
            <div className="mt-4 flex gap-2">
              <select value={journalCodeMonths} onChange={(event) => setJournalCodeMonths(event.target.value)} className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
                {[1, 2, 3, 6, 12].map((months) => <option key={months} value={months}>{months} month{months === 1 ? "" : "s"}</option>)}
              </select>
              <button type="button" onClick={generateJournalActivationCode} className="rounded-xl bg-blue-600 px-4 py-3 font-semibold">
                Generate Code
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {journalActivationCodes.slice(0, 10).map((code) => (
                <div key={code.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div><p className="font-mono font-bold text-blue-300">{code.code}</p><p className="mt-1 text-sm text-slate-400">{code.duration_months} months · {code.status}</p></div>
                  {code.status === "unused" && (
                    <button type="button" disabled={processingJournalCodeId === code.id} onClick={() => revokeJournalActivationCode(code.id)} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 disabled:opacity-50">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
              {journalActivationCodes.length === 0 && <p className="text-sm text-slate-400">No activation codes generated yet.</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-bold">Plans &amp; Pricing</h3>
            <p className="mt-1 text-sm text-slate-400">
              These are the prices displayed in the Trade Journal checkout.
            </p>
            <div className="mt-5 space-y-3">
              {journalPricingPlans.map((plan) => (
                <div key={plan.duration_months} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className="font-semibold">{plan.duration_months} month{plan.duration_months === 1 ? "" : "s"}</p><p className="mt-1 text-sm text-blue-300">NGN {Number(plan.price || 0).toLocaleString()}</p></div>
                    <button
                      type="button"
                      disabled={savingJournalPriceMonths === plan.duration_months}
                      onClick={() => {
                        const value = window.prompt("Enter the new NGN price:", String(plan.price));
                        if (value !== null) saveJournalPrice(plan, Number(value));
                      }}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 disabled:opacity-50"
                    >
                      {savingJournalPriceMonths === plan.duration_months ? "Saving..." : "Change Price"}
                    </button>
                  </div>
                </div>
              ))}
              {journalPricingPlans.length === 0 && <p className="text-sm text-slate-400">No journal pricing plans found. Run the journal SQL foundation first.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className={`mt-8 ${activeAdminSection === "archive" ? "block" : "hidden"}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Archive</h2>
            <p className="mt-1 text-sm text-slate-400">
              Restore hidden records or permanently remove archived operational test data.
              Financial records remain archive-only for audit safety.
            </p>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
            {archivedRecords.length} Archived
          </span>
        </div>

        {archivedRecords.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
            The archive is empty.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {archivedRecords.map((record) => {
              const table = record.__table as string;
              const key = `${table}:${record.id}`;
              const financial = table === "deposits" || table === "withdrawals";
              const label =
                record.account_name || record.plan_name || record.prop_firm ||
                record.product_label || record.purchase_email || record.reference || record.id;
              return (
                <article key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                        {table.replaceAll("_", " ")}
                      </p>
                      <h3 className="mt-1 break-words font-bold">{label}</h3>
                      <p className="mt-2 text-xs text-slate-500">
                        Archived {new Date(record.archived_at).toLocaleString()}
                      </p>
                      {record.archive_reason && (
                        <p className="mt-2 text-sm text-slate-400">Reason: {record.archive_reason}</p>
                      )}
                    </div>
                    {financial && (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">Audit record</span>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => restoreRecord(table, record.id)}
                      disabled={processingArchiveKey === key}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >Restore</button>
                    {!financial && (
                      <button
                        type="button"
                        onClick={() => permanentlyDeleteRecord(table, record.id)}
                        disabled={processingArchiveKey === key}
                        className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 disabled:opacity-50"
                      >Delete Permanently</button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

          </div>
        </div>
      </div>

      <style jsx global>{`
        .fth-admin-dashboard {
          --fth-bg: #05080c;
          --fth-surface: #0a0f14;
          --fth-muted-surface: #0e151b;
          --fth-border: #202d35;
          --fth-text: #f7fbfc;
          --fth-muted: #91a1a9;
          --fth-primary: #c8ff00;
          --fth-primary-hover: #b3ea00;
          --fth-success: #9fe600;
          --fth-pending: #ffd23f;
          --fth-danger: #ff6f77;
          background: var(--fth-bg) !important;
          color: var(--fth-text) !important;
        }

        .fth-admin-dashboard section {
          scroll-margin-top: 1.5rem;
        }

        .fth-admin-dashboard .bg-slate-900 {
          background: var(--fth-surface) !important;
        }

        .fth-admin-dashboard .bg-slate-950,
        .fth-admin-dashboard .bg-slate-950\/40 {
          background: var(--fth-muted-surface) !important;
        }

        .fth-admin-dashboard .bg-slate-800 {
          background: #121c23 !important;
        }

        .fth-admin-dashboard .border-slate-800,
        .fth-admin-dashboard .border-slate-700,
        .fth-admin-dashboard .border-amber-500,
        .fth-admin-dashboard .border-amber-500\/30,
        .fth-admin-dashboard .border-purple-800 {
          border-color: var(--fth-border) !important;
        }

        .fth-admin-dashboard .text-slate-300,
        .fth-admin-dashboard .text-slate-400,
        .fth-admin-dashboard .text-slate-500 {
          color: var(--fth-muted) !important;
        }

        .fth-admin-dashboard button.bg-amber-400,
        .fth-admin-dashboard button.bg-amber-500,
        .fth-admin-dashboard button.bg-amber-600,
        .fth-admin-dashboard button.bg-blue-600,
        .fth-admin-dashboard a.bg-amber-400,
        .fth-admin-dashboard a.bg-blue-600 {
          background: var(--fth-primary) !important;
          color: #061006 !important;
        }

        .fth-admin-dashboard button.bg-amber-400:hover,
        .fth-admin-dashboard button.bg-amber-500:hover,
        .fth-admin-dashboard button.bg-amber-600:hover,
        .fth-admin-dashboard button.bg-blue-600:hover {
          background: var(--fth-primary-hover) !important;
        }

        .fth-admin-dashboard .text-amber-300,
        .fth-admin-dashboard .text-amber-400,
        .fth-admin-dashboard .text-amber-500 {
          color: var(--fth-pending) !important;
        }

        .fth-admin-dashboard .text-emerald-300,
        .fth-admin-dashboard .text-emerald-400,
        .fth-admin-dashboard .text-emerald-500 {
          color: var(--fth-success) !important;
        }

        .fth-admin-dashboard .text-red-300,
        .fth-admin-dashboard .text-red-400,
        .fth-admin-dashboard .text-rose-300,
        .fth-admin-dashboard .text-rose-400 {
          color: var(--fth-danger) !important;
        }

        .fth-admin-dashboard .bg-gradient-to-br,
        .fth-admin-dashboard .bg-gradient-to-r {
          background-image: none !important;
          background-color: var(--fth-surface) !important;
        }

        .fth-admin-dashboard .fth-support-message-client {
          background: var(--fth-muted-surface) !important;
          border-color: var(--fth-border) !important;
          color: var(--fth-text) !important;
        }

        .fth-admin-dashboard .fth-support-message-admin {
          background: #24343c !important;
          border-color: #38505c !important;
          color: #f7fbfc !important;
        }

        :root[data-theme="light"] .fth-admin-dashboard {
          --fth-bg: #f7f7ff;
          --fth-surface: #ffffff;
          --fth-muted-surface: #f5f3ff;
          --fth-border: #e1dcfb;
          --fth-text: #171329;
          --fth-muted: #6c6882;
          --fth-primary: #655cff;
          --fth-primary-hover: #5147f2;
          --fth-success: #13815f;
          --fth-pending: #a86f00;
          --fth-danger: #c63f4b;
        }

        :root[data-theme="light"] .fth-admin-dashboard .fth-support-message-admin {
          background: #655cff !important;
          border-color: #5147f2 !important;
          color: #ffffff !important;
        }

        :root[data-theme="light"] .fth-admin-dashboard .text-white {
          color: var(--fth-text) !important;
        }

        :root[data-theme="light"] .fth-admin-dashboard input,
        :root[data-theme="light"] .fth-admin-dashboard textarea,
        :root[data-theme="light"] .fth-admin-dashboard select {
          background: #ffffff !important;
          border-color: var(--fth-border) !important;
          color: var(--fth-text) !important;
        }

        :root[data-theme="light"] .fth-admin-dashboard button.bg-amber-400,
        :root[data-theme="light"] .fth-admin-dashboard button.bg-amber-500,
        :root[data-theme="light"] .fth-admin-dashboard button.bg-amber-600,
        :root[data-theme="light"] .fth-admin-dashboard button.bg-blue-600,
        :root[data-theme="light"] .fth-admin-dashboard a.bg-blue-600 {
          color: #ffffff !important;
        }

        :root[data-theme="light"] .fth-admin-dashboard input::placeholder,
        :root[data-theme="light"] .fth-admin-dashboard textarea::placeholder {
          color: #817b96 !important;
          opacity: 1;
        }

        :root[data-theme="light"] .fth-admin-dashboard button:disabled {
          color: #68637c !important;
          background: #e8e6f2 !important;
          border-color: #d7d2e5 !important;
          opacity: 1 !important;
        }
      `}</style>
    </main>
  );
}
