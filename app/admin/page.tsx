"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BrandLogo from "../BrandLogo";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeAdminSection, setActiveAdminSection] = useState("announcements");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [showProfitFigures, setShowProfitFigures] = useState(false);
  const [profitCostDrafts, setProfitCostDrafts] = useState<Record<string, string>>({});
  const [savingProfitKey, setSavingProfitKey] = useState<string | null>(null);
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

  // UNIFIED CUSTOMERS — website clients + WhatsApp/offline clients
  const [offlineCustomers, setOfflineCustomers] = useState<any[]>([]);
  const [offlinePurchases, setOfflinePurchases] = useState<any[]>([]);
  const [onlineTradingViewPurchases, setOnlineTradingViewPurchases] = useState<any[]>([]);
  const [onlineJournalPurchases, setOnlineJournalPurchases] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSourceFilter, setCustomerSourceFilter] = useState<"all" | "website" | "offline">("all");
  const [selectedCustomerKey, setSelectedCustomerKey] = useState("");
  const [showOfflineCustomerForm, setShowOfflineCustomerForm] = useState(false);
  const [showOfflinePurchaseForm, setShowOfflinePurchaseForm] = useState(false);
  const [showOfflinePurchaseHistory, setShowOfflinePurchaseHistory] = useState(false);
  const [editingOfflineCustomerId, setEditingOfflineCustomerId] = useState<string | null>(null);
  const [editingOfflinePurchaseId, setEditingOfflinePurchaseId] = useState<string | null>(null);
  const [savingOfflineCustomer, setSavingOfflineCustomer] = useState(false);
  const [savingOfflinePurchase, setSavingOfflinePurchase] = useState(false);
  const [offlineCustomerName, setOfflineCustomerName] = useState("");
  const [offlineCustomerPhone, setOfflineCustomerPhone] = useState("");
  const [offlineCustomerEmail, setOfflineCustomerEmail] = useState("");
  const [offlineCustomerSource, setOfflineCustomerSource] = useState("whatsapp");
  const [offlineCustomerNotes, setOfflineCustomerNotes] = useState("");
  const [offlinePurchaseType, setOfflinePurchaseType] = useState("tradingview");
  const [offlinePurchaseName, setOfflinePurchaseName] = useState("");
  const [offlinePurchasePropFirm, setOfflinePurchasePropFirm] = useState("");
  const [offlinePurchaseAccountSize, setOfflinePurchaseAccountSize] = useState("");
  const [offlinePurchasePhase, setOfflinePurchasePhase] = useState("");
  const [offlinePurchasePlanName, setOfflinePurchasePlanName] = useState("");
  const [offlinePurchaseAmount, setOfflinePurchaseAmount] = useState("");
  const [offlinePurchaseCostPrice, setOfflinePurchaseCostPrice] = useState("");
  const [offlinePurchaseCostNote, setOfflinePurchaseCostNote] = useState("");
  const [offlinePurchasePaymentStatus, setOfflinePurchasePaymentStatus] = useState("paid");
  const [offlinePurchaseOrderStatus, setOfflinePurchaseOrderStatus] = useState("processing");
  const [offlinePurchaseStartedAt, setOfflinePurchaseStartedAt] = useState("");
  const [offlinePurchaseExpiresAt, setOfflinePurchaseExpiresAt] = useState("");
  const [offlinePurchaseReference, setOfflinePurchaseReference] = useState("");
  const [offlinePurchaseNotes, setOfflinePurchaseNotes] = useState("");
  const [offlinePurchaseDeliveryUsername, setOfflinePurchaseDeliveryUsername] = useState("");
  const [offlinePurchaseDeliveryPassword, setOfflinePurchaseDeliveryPassword] = useState("");
  const [offlinePurchaseDeliveryMessage, setOfflinePurchaseDeliveryMessage] = useState("");
  const [offlinePurchaseDeliveryMethod, setOfflinePurchaseDeliveryMethod] = useState("credentials");
  const [offlinePurchaseClaimCode, setOfflinePurchaseClaimCode] = useState("");
  const [offlinePurchaseClaimUrl, setOfflinePurchaseClaimUrl] = useState("");
  const [offlinePurchaseIncludeSignupOffer, setOfflinePurchaseIncludeSignupOffer] = useState(true);
  const [offlinePurchaseIncludeReferralOffer, setOfflinePurchaseIncludeReferralOffer] = useState(true);
  const [offlinePurchaseIncludeFreeJournal, setOfflinePurchaseIncludeFreeJournal] = useState(true);

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
  const [verifiedAmountDrafts, setVerifiedAmountDrafts] = useState<Record<string, string>>({});
  const [whatsAppNumberDrafts, setWhatsAppNumberDrafts] = useState<Record<string, string>>({});
  const [savingAccuracyKey, setSavingAccuracyKey] = useState<string | null>(null);
  const [propDeliveryDrafts, setPropDeliveryDrafts] = useState<Record<string, {
    deliveryMethod: string;
    deliveryUsername: string;
    deliveryPassword: string;
    deliveryMessage: string;
    claimCode: string;
    claimUrl: string;
  }>>({});

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
  const [partnerCommissionRate, setPartnerCommissionRate] = useState("15");
  const [partnerMinimumPayout, setPartnerMinimumPayout] = useState("10000");
  const [partnerHoldDays, setPartnerHoldDays] = useState("7");
  const [savingPartner, setSavingPartner] = useState(false);
  const [invitationPartnerId, setInvitationPartnerId] = useState("");
  const [invitationName, setInvitationName] = useState("");
  const [invitationXHandle, setInvitationXHandle] = useState("");
  const [invitationPreviewOpen, setInvitationPreviewOpen] = useState(false);
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

  async function loadUnifiedCustomerWorkspace() {
    const [customersResult, purchasesResult, tvPurchasesResult, journalPurchasesResult] = await Promise.all([
      supabase.from("offline_customers").select("*").order("created_at", { ascending: false }),
      supabase.from("offline_customer_purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("tradingview_purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("trade_journal_purchases").select("*").order("created_at", { ascending: false }),
    ]);

    if (customersResult.error) console.error("Error loading offline customers:", customersResult.error);
    else setOfflineCustomers(customersResult.data ?? []);

    if (purchasesResult.error) console.error("Error loading offline purchases:", purchasesResult.error);
    else setOfflinePurchases(purchasesResult.data ?? []);

    if (tvPurchasesResult.error) console.error("Error loading TradingView purchases for analytics:", tvPurchasesResult.error);
    else setOnlineTradingViewPurchases(tvPurchasesResult.data ?? []);

    if (journalPurchasesResult.error) console.error("Error loading Journal purchases for profit tracking:", journalPurchasesResult.error);
    else setOnlineJournalPurchases(journalPurchasesResult.data ?? []);
  }

  function resetOfflineCustomerForm() {
    setEditingOfflineCustomerId(null);
    setOfflineCustomerName("");
    setOfflineCustomerPhone("");
    setOfflineCustomerEmail("");
    setOfflineCustomerSource("whatsapp");
    setOfflineCustomerNotes("");
    setShowOfflineCustomerForm(false);
  }

  function editOfflineCustomer(customer: any) {
    setEditingOfflineCustomerId(customer.id);
    setOfflineCustomerName(customer.full_name || "");
    setOfflineCustomerPhone(customer.phone || "");
    setOfflineCustomerEmail(customer.email || "");
    setOfflineCustomerSource(customer.source || "whatsapp");
    setOfflineCustomerNotes(customer.notes || "");
    setShowOfflineCustomerForm(true);
    window.setTimeout(() => {
      document.getElementById("offline-customer-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  async function deleteOfflineCustomer(customer: any) {
    const confirmed = window.confirm(
      `Delete ${customer.full_name || "this customer"} and all purchase records linked to this offline customer? This cannot be undone.`
    );
    if (!confirmed) return;

    const { error: purchaseDeleteError } = await supabase
      .from("offline_customer_purchases")
      .delete()
      .eq("offline_customer_id", customer.id);

    if (purchaseDeleteError) {
      return alert(`Could not delete this customer's purchase history: ${purchaseDeleteError.message}`);
    }

    const { error } = await supabase.from("offline_customers").delete().eq("id", customer.id);
    if (error) return alert(`Could not delete customer: ${error.message}`);

    setSelectedCustomerKey("");
    setShowOfflinePurchaseHistory(false);
    resetOfflineCustomerForm();
    await loadUnifiedCustomerWorkspace();
  }

  async function createOfflineCustomer() {
    const fullName = offlineCustomerName.trim();
    const phone = offlineCustomerPhone.trim();
    if (!fullName || !phone) return alert("Enter the customer's full name and WhatsApp/phone number.");

    const payload = {
      full_name: fullName,
      phone,
      email: offlineCustomerEmail.trim() || null,
      source: offlineCustomerSource,
      notes: offlineCustomerNotes.trim() || null,
    };

    setSavingOfflineCustomer(true);

    if (editingOfflineCustomerId) {
      const { error } = await supabase
        .from("offline_customers")
        .update(payload)
        .eq("id", editingOfflineCustomerId);

      setSavingOfflineCustomer(false);
      if (error) return alert(`Could not update customer: ${error.message}`);

      const editedId = editingOfflineCustomerId;
      resetOfflineCustomerForm();
      await loadUnifiedCustomerWorkspace();
      setSelectedCustomerKey(`offline:${editedId}`);
      return;
    }

    const { data, error } = await supabase.from("offline_customers").insert({
      ...payload,
      created_by: adminUserId || null,
    }).select("*").single();
    setSavingOfflineCustomer(false);

    if (error) return alert(`Could not add customer: ${error.message}`);
    resetOfflineCustomerForm();
    await loadUnifiedCustomerWorkspace();
    if (data?.id) setSelectedCustomerKey(`offline:${data.id}`);
  }

  function resetOfflinePurchaseForm() {
    setEditingOfflinePurchaseId(null);
    setOfflinePurchaseType("tradingview");
    setOfflinePurchaseName("");
    setOfflinePurchasePropFirm("");
    setOfflinePurchaseAccountSize("");
    setOfflinePurchasePhase("");
    setOfflinePurchasePlanName("");
    setOfflinePurchaseAmount("");
    setOfflinePurchaseCostPrice("");
    setOfflinePurchaseCostNote("");
    setOfflinePurchasePaymentStatus("paid");
    setOfflinePurchaseOrderStatus("processing");
    setOfflinePurchaseStartedAt("");
    setOfflinePurchaseExpiresAt("");
    setOfflinePurchaseReference("");
    setOfflinePurchaseNotes("");
    setOfflinePurchaseDeliveryUsername("");
    setOfflinePurchaseDeliveryPassword("");
    setOfflinePurchaseDeliveryMessage("");
    setOfflinePurchaseDeliveryMethod("credentials");
    setOfflinePurchaseClaimCode("");
    setOfflinePurchaseClaimUrl("");
    setOfflinePurchaseIncludeSignupOffer(true);
    setOfflinePurchaseIncludeReferralOffer(true);
    setOfflinePurchaseIncludeFreeJournal(true);
    setShowOfflinePurchaseForm(false);
  }

  function editOfflinePurchase(purchase: any) {
    setEditingOfflinePurchaseId(purchase.id);
    setOfflinePurchaseType(purchase.product_type || "tradingview");
    setOfflinePurchaseName(purchase.product_name || "");
    setOfflinePurchasePropFirm(purchase.prop_firm || "");
    setOfflinePurchaseAccountSize(purchase.account_size || "");
    setOfflinePurchasePhase(purchase.phase || "");
    setOfflinePurchasePlanName(purchase.plan_name || "");
    setOfflinePurchaseAmount(String(purchase.amount ?? ""));
    setOfflinePurchaseCostPrice(purchase.cost_price == null ? "" : String(purchase.cost_price));
    setOfflinePurchaseCostNote(purchase.cost_note || "");
    setOfflinePurchasePaymentStatus(purchase.payment_status || "paid");
    setOfflinePurchaseOrderStatus(purchase.order_status || "processing");
    setOfflinePurchaseStartedAt(purchase.started_at ? new Date(purchase.started_at).toISOString().slice(0, 10) : "");
    setOfflinePurchaseExpiresAt(purchase.expires_at ? new Date(purchase.expires_at).toISOString().slice(0, 10) : "");
    setOfflinePurchaseReference(purchase.payment_reference || "");
    setOfflinePurchaseNotes(purchase.notes || "");
    setOfflinePurchaseDeliveryUsername(purchase.delivery_username || "");
    setOfflinePurchaseDeliveryPassword(purchase.delivery_password || "");
    setOfflinePurchaseDeliveryMessage(purchase.delivery_message || "");
    setOfflinePurchaseDeliveryMethod(purchase.delivery_method || "credentials");
    setOfflinePurchaseClaimCode(purchase.claim_code || "");
    setOfflinePurchaseClaimUrl(purchase.claim_url || "");
    setOfflinePurchaseIncludeSignupOffer(purchase.include_signup_offer !== false);
    setOfflinePurchaseIncludeReferralOffer(purchase.include_referral_offer !== false);
    setOfflinePurchaseIncludeFreeJournal(purchase.include_free_journal !== false);
    setShowOfflinePurchaseForm(true);
  }

  async function deleteOfflinePurchase(purchase: any) {
    const label = purchase.plan_name || purchase.product_name || purchase.prop_firm || "this purchase";
    const confirmed = window.confirm(`Delete ${label}? This cannot be undone.`);
    if (!confirmed) return;

    const { error } = await supabase.from("offline_customer_purchases").delete().eq("id", purchase.id);
    if (error) return alert(`Could not delete purchase: ${error.message}`);

    if (editingOfflinePurchaseId === purchase.id) resetOfflinePurchaseForm();
    await loadUnifiedCustomerWorkspace();
  }

  async function createOfflinePurchase() {
    if (!selectedCustomerKey.startsWith("offline:")) return alert("Select a WhatsApp/offline customer first.");
    const customerId = selectedCustomerKey.replace("offline:", "");
    const amount = Number(offlinePurchaseAmount);
    const costPrice = offlinePurchaseCostPrice.trim() === "" ? null : Number(offlinePurchaseCostPrice);
    if (!Number.isFinite(amount) || amount < 0) return alert("Enter a valid amount.");
    if (costPrice !== null && (!Number.isFinite(costPrice) || costPrice < 0)) return alert("Enter a valid buying cost.");
    if (!offlinePurchaseName.trim() && !offlinePurchasePlanName.trim() && !offlinePurchasePropFirm.trim()) {
      return alert("Enter the product, plan, or prop firm name.");
    }

    const payload = {
      offline_customer_id: customerId,
      product_type: offlinePurchaseType,
      product_name: offlinePurchaseName.trim() || null,
      prop_firm: offlinePurchasePropFirm.trim() || null,
      account_size: offlinePurchaseAccountSize.trim() || null,
      phase: offlinePurchasePhase.trim() || null,
      plan_name: offlinePurchasePlanName.trim() || null,
      amount,
      cost_price: costPrice,
      cost_note: offlinePurchaseCostNote.trim() || null,
      currency: "NGN",
      payment_status: offlinePurchasePaymentStatus,
      order_status: offlinePurchaseOrderStatus,
      started_at: offlinePurchaseStartedAt ? new Date(offlinePurchaseStartedAt).toISOString() : null,
      expires_at: offlinePurchaseExpiresAt ? new Date(offlinePurchaseExpiresAt).toISOString() : null,
      payment_reference: offlinePurchaseReference.trim() || null,
      notes: offlinePurchaseNotes.trim() || null,
      delivery_username: offlinePurchaseDeliveryUsername.trim() || null,
      delivery_password: offlinePurchaseDeliveryPassword.trim() || null,
      delivery_message: offlinePurchaseDeliveryMessage.trim() || null,
      delivery_method:
        offlinePurchaseType === "tradingview" ? "credentials" : offlinePurchaseDeliveryMethod,
      claim_code:
        offlinePurchaseType === "prop_firm" && offlinePurchaseDeliveryMethod === "claim_code"
          ? offlinePurchaseClaimCode.trim() || null
          : null,
      claim_url:
        offlinePurchaseType === "prop_firm" && offlinePurchaseDeliveryMethod === "claim_code"
          ? offlinePurchaseClaimUrl.trim() || null
          : null,
      include_signup_offer: offlinePurchaseIncludeSignupOffer,
      include_referral_offer: offlinePurchaseIncludeReferralOffer,
      include_free_journal: offlinePurchaseIncludeFreeJournal,
    };

    setSavingOfflinePurchase(true);

    const { error } = editingOfflinePurchaseId
      ? await supabase.from("offline_customer_purchases").update(payload).eq("id", editingOfflinePurchaseId)
      : await supabase.from("offline_customer_purchases").insert({
          ...payload,
          created_by: adminUserId || null,
        });

    setSavingOfflinePurchase(false);
    if (error) {
      return alert(`${editingOfflinePurchaseId ? "Could not update purchase" : "Could not add purchase"}: ${error.message}`);
    }

    resetOfflinePurchaseForm();
    setShowOfflinePurchaseHistory(true);
    await loadUnifiedCustomerWorkspace();
  }

  function createSecureDeliveryToken() {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function ensureOfflineDeliveryLink(purchase: any) {
    let token = String(purchase?.delivery_token || "").trim();

    if (!token) {
      token = createSecureDeliveryToken();
      const { error } = await supabase
        .from("offline_customer_purchases")
        .update({
          delivery_token: token,
          delivery_link_enabled: true,
          delivered_at:
            ["delivered", "completed"].includes(purchase?.order_status) && !purchase?.delivered_at
              ? new Date().toISOString()
              : purchase?.delivered_at || null,
        })
        .eq("id", purchase.id);

      if (error) {
        alert(`Could not create secure delivery link: ${error.message}`);
        return null;
      }

      await loadUnifiedCustomerWorkspace();
    } else if (purchase?.delivery_link_enabled === false) {
      const { error } = await supabase
        .from("offline_customer_purchases")
        .update({ delivery_link_enabled: true })
        .eq("id", purchase.id);

      if (error) {
        alert(`Could not enable delivery link: ${error.message}`);
        return null;
      }

      await loadUnifiedCustomerWorkspace();
    }

    return `${window.location.origin}/delivery/${token}`;
  }

  async function viewOfflineDelivery(purchase: any) {
    const link = await ensureOfflineDeliveryLink(purchase);
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function copyOfflineDeliveryLink(purchase: any) {
    const link = await ensureOfflineDeliveryLink(purchase);
    if (!link) return;
    await navigator.clipboard.writeText(link);
    alert("Secure delivery link copied.");
  }

  async function sendOfflineDeliveryWhatsApp(purchase: any, customer: any) {
    const link = await ensureOfflineDeliveryLink(purchase);
    if (!link) return;

    const phone = getClientWhatsAppNumber({ phone: customer?.phone });
    if (!phone) return alert("This customer has no phone number saved.");

    const firstName =
      String(customer?.full_name || "there").trim().split(/\s+/)[0] || "there";
    const product =
      purchase?.plan_name ||
      purchase?.product_name ||
      purchase?.prop_firm ||
      String(purchase?.product_type || "purchase").replaceAll("_", " ");
    const method = purchase?.delivery_method || "credentials";

    const lines: string[] = [
      `Hello ${firstName} 👋`,
      "",
      `Your ${product} delivery from Fidelity Traders Hub is ready.`,
      "",
    ];

    if (purchase?.product_type === "tradingview") {
      if (purchase?.delivery_username) lines.push(`Login / Username: ${purchase.delivery_username}`);
      if (purchase?.delivery_password) lines.push(`Password: ${purchase.delivery_password}`);
      if (purchase?.expires_at) lines.push(`Expiry: ${new Date(purchase.expires_at).toLocaleDateString()}`);
      lines.push("", "Please keep these TradingView login details private.");
    } else if (purchase?.product_type === "prop_firm" && method === "claim_code") {
      if (purchase?.prop_firm) lines.push(`Prop Firm: ${purchase.prop_firm}`);
      lines.push(`Claim Code: ${purchase?.claim_code || "See your private delivery page"}`);
      if (purchase?.claim_url) lines.push(`Claim Link: ${purchase.claim_url}`);
      lines.push("", "Please keep your claim code private.");
    } else if (purchase?.product_type === "prop_firm" && method === "check_email") {
      if (purchase?.prop_firm) lines.push(`Prop Firm: ${purchase.prop_firm}`);
      lines.push(
        "Your account details were sent to the email address used for the prop firm registration.",
        "Please check your Inbox, Spam and Junk folders."
      );
    } else if (purchase?.product_type === "prop_firm" && method === "whatsapp_instruction") {
      if (purchase?.prop_firm) lines.push(`Prop Firm: ${purchase.prop_firm}`);
      if (purchase?.delivery_message) lines.push(purchase.delivery_message);
    } else {
      if (purchase?.prop_firm) lines.push(`Prop Firm: ${purchase.prop_firm}`);
      if (purchase?.delivery_username) lines.push(`Login / Account ID: ${purchase.delivery_username}`);
      if (purchase?.delivery_password) lines.push(`Password / Access Code: ${purchase.delivery_password}`);
    }

    if (purchase?.delivery_message && method !== "whatsapp_instruction") {
      lines.push("", `Instructions: ${purchase.delivery_message}`);
    }

    lines.push("", "Private FTH Delivery View:", link);

    if (purchase?.include_signup_offer !== false) {
      lines.push(
        "",
        "Not registered on Fidelity Traders Hub yet?",
        "Sign up at fidelitytradershub.com to manage your purchases and deliveries."
      );
    }
    if (purchase?.include_referral_offer !== false) {
      lines.push("", "🎁 Get 15% discount where the Fidelity Traders Hub referral offer applies.");
    }
    if (purchase?.include_free_journal !== false) {
      lines.push("🎁 Get 1 month FREE Trade Journal access to journal and review your trades.");
    }

    lines.push(
      "",
      "Already registered? Log in to your Fidelity Traders Hub dashboard to view and manage your services.",
      "",
      "Need help? Reply to this WhatsApp message.",
      "",
      "Fidelity Traders Hub",
      "Where Traders Meet Possibilities"
    );

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function disableOfflineDeliveryLink(purchase: any) {
    const confirmed = window.confirm(
      "Disable this customer's delivery link? The existing link will stop working until you enable/generate it again."
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("offline_customer_purchases")
      .update({ delivery_link_enabled: false })
      .eq("id", purchase.id);

    if (error) return alert(`Could not disable delivery link: ${error.message}`);
    await loadUnifiedCustomerWorkspace();
  }

  async function updateOfflineRenewalStatus(purchaseId: string, status: string) {
    const { error } = await supabase.from("offline_customer_purchases")
      .update({ renewal_followup_status: status }).eq("id", purchaseId);
    if (error) return alert(`Could not update renewal status: ${error.message}`);
    await loadUnifiedCustomerWorkspace();
  }

  async function savePurchaseCost(table: string, id: string, currentCost: unknown) {
    const key = `${table}:${id}`;
    const raw = profitCostDrafts[key] ?? String(currentCost ?? "");
    const cost = Number(raw);
    if (!Number.isFinite(cost) || cost < 0) return alert("Enter a valid buying cost.");

    setSavingProfitKey(key);
    const { error } = await supabase.from(table).update({ cost_price: cost }).eq("id", id);
    setSavingProfitKey(null);
    if (error) return alert(`Could not save buying cost: ${error.message}`);

    setProfitCostDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    if (table === "prop_offer_purchases") await loadPropPurchaseApprovals();
    else await loadUnifiedCustomerWorkspace();
  }

  function openOfflineWhatsApp(customer: any) {
    const phone = getClientWhatsAppNumber({ phone: customer?.phone });
    if (!phone) return alert("This customer has no phone number saved.");
    const firstName = String(customer?.full_name || "there").trim().split(/\s+/)[0] || "there";
    const defaultMessage = `Hello ${firstName}, this is Fidelity Traders Hub. We are contacting you regarding your account. How may we assist you?`;
    const message = window.prompt("Edit the WhatsApp message before sending:", defaultMessage);
    if (message === null) return;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message.trim() || defaultMessage)}`, "_blank", "noopener,noreferrer");
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
          admin_verified_amount,
          admin_verified_note,
          cost_price,
          currency,
          fulfillment_status,
          funded_at,
          approved_at,
          delivered_at,
          admin_note,
          delivery_method,
          delivery_username,
          delivery_password,
          delivery_message,
          claim_code,
          claim_url,
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

  function maskEmail(value: unknown) {
    const email = String(value || "").trim();
    if (!email || !email.includes("@")) return email || "Email not found";
    const [local, domain] = email.split("@");
    const lead = local.slice(0, Math.min(2, local.length));
    return `${lead}${local.length > 2 ? "***" : "*"}@${domain}`;
  }

  function maskPhone(value: unknown) {
    const raw = String(value || "").trim();
    if (!raw) return "No phone saved";
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 7) return "***";
    return `${digits.slice(0, 3)}***${digits.slice(-4)}`;
  }

  function maskId(value: unknown) {
    const text = String(value || "");
    if (text.length <= 12) return "••••••";
    return `${text.slice(0, 6)}…${text.slice(-4)}`;
  }

  function displayEmail(value: unknown) {
    return privacyMode ? maskEmail(value) : String(value || "Email not found");
  }

  function displayPhone(value: unknown) {
    return privacyMode ? maskPhone(value) : String(value || "No phone saved");
  }

  function displayAmount(currency: unknown, amount: unknown) {
    if (privacyMode) return "Hidden for privacy";
    return `${String(currency || "NGN")} ${Number(amount || 0).toLocaleString()}`;
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
      return privacyMode ? `${preferredName} — ${maskEmail(profile.email)}` : `${preferredName} — ${profile.email}`;
    }

    if (preferredName) return preferredName;
    if (profile.email) return displayEmail(profile.email);
    if (profile.phone || profile.phone_number) {
      return displayPhone(profile.phone || profile.phone_number);
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

  function getVerifiedAmount(record: any, originalField = "amount_paid") {
    const verified = Number(record?.admin_verified_amount);
    if (Number.isFinite(verified) && verified >= 0 && record?.admin_verified_amount !== null && record?.admin_verified_amount !== undefined) {
      return verified;
    }
    return Number(record?.[originalField] ?? 0);
  }

  function getVerifiedAmountDraft(table: string, record: any, originalField = "amount_paid") {
    const key = `${table}:${record.id}`;
    return verifiedAmountDrafts[key] ?? String(getVerifiedAmount(record, originalField));
  }

  function setVerifiedAmountDraft(table: string, recordId: string, value: string) {
    const key = `${table}:${recordId}`;
    setVerifiedAmountDrafts((current) => ({ ...current, [key]: value }));
  }

  async function saveVerifiedAmount(
    table: string,
    record: any,
    originalField = "amount_paid",
    reload?: () => Promise<any>
  ) {
    const key = `${table}:${record.id}`;
    const value = Number(verifiedAmountDrafts[key] ?? getVerifiedAmount(record, originalField));
    if (!Number.isFinite(value) || value < 0) {
      alert("Enter a valid actual amount paid.");
      return;
    }

    const note = window.prompt(
      "Optional reason/note for this verified amount (example: customer entered wrong amount or discount applied):",
      record?.admin_verified_note || ""
    );
    if (note === null) return;

    setSavingAccuracyKey(`amount:${key}`);
    const { error } = await supabase.rpc("admin_set_verified_amount", {
      p_table: table,
      p_record_id: record.id,
      p_amount: value,
      p_note: note.trim() || null,
    });

    if (error) {
      setSavingAccuracyKey(null);
      alert(`Could not save verified amount: ${error.message}`);
      return;
    }

    if (reload) await reload();
    setSavingAccuracyKey(null);
    alert(`Verified actual amount saved: ${record.currency || "NGN"} ${value.toLocaleString()}`);
  }

  function getWhatsAppDraft(userId: string, profile: any) {
    return whatsAppNumberDrafts[userId] ?? String(profile?.phone || profile?.phone_number || "");
  }

  function setWhatsAppDraft(userId: string, value: string) {
    setWhatsAppNumberDrafts((current) => ({ ...current, [userId]: value }));
  }

  async function saveWebsiteCustomerWhatsApp(userId: string, profile: any) {
    const phone = getWhatsAppDraft(userId, profile).trim();
    if (!phone) {
      alert("Enter the customer's WhatsApp number.");
      return;
    }

    setSavingAccuracyKey(`phone:${userId}`);
    const { error } = await supabase.rpc("admin_update_customer_phone", {
      p_user_id: userId,
      p_phone: phone,
    });

    if (error) {
      setSavingAccuracyKey(null);
      alert(`Could not save WhatsApp number: ${error.message}`);
      return;
    }

    await loadClientProfiles();
    setSavingAccuracyKey(null);
    alert("Customer WhatsApp number saved.");
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

        if (
          profile?.role !== "admin" &&
          profile?.role !== "super_admin" &&
          profile?.role !== "finance"
        ) {
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
          loadUnifiedCustomerWorkspace(),
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
          admin_verified_amount,
          admin_verified_note,
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

  function buildTradingViewWhatsAppMessage(
    purchase: any,
    plan: any,
    client: any,
    draft: any,
    expiresAt?: string | null
  ) {
    const firstName = getClientFirstName(client);
    const durationDays = plan?.duration_days ?? 30;
    const expiryLine = expiresAt
      ? `\nExpiry: ${new Date(expiresAt).toLocaleString()}`
      : "";
    const noteLine = draft.deliveryNote?.trim()
      ? `\n\nInstructions: ${draft.deliveryNote.trim()}`
      : "";
    const coSponsorLine =
      draft.showCoSponsor && (draft.coSponsorName?.trim() || draft.coSponsorPhone?.trim())
        ? `\n\nCo-sponsor: ${draft.coSponsorName?.trim() || "Not provided"}${
            draft.coSponsorPhone?.trim() ? ` — ${draft.coSponsorPhone.trim()}` : ""
          }`
        : "";

    return `Hello ${firstName}, your Fidelity Traders Hub TradingView account is ready ✅

Plan: ${
      plan?.name ?? "TradingView Plan"
    }
Login: ${draft.loginEmail.trim()}
Password: ${draft.loginPassword}
Validity: ${durationDays} days${expiryLine}${noteLine}${coSponsorLine}

Please keep these login details private.

Log in to your Fidelity Traders Hub dashboard to manage your services:
fidelitytradershub.com

🎁 Get 15% discount where our referral offer applies.
🎁 Get 1 month FREE Trade Journal access to journal and review your trades.

If you need help, reply to us here on WhatsApp.

Fidelity Traders Hub
Where Traders Meet Possibilities`;
  }

  async function activateTradingViewPurchase(
    purchase: any,
    openWhatsAppAfter = false
  ) {
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

    if (openWhatsAppAfter) {
      const client = getClientById(purchase.user_id);
      const phone = getClientWhatsAppNumber(client);
      if (phone) {
        const plan = Array.isArray(purchase.tradingview_plans)
          ? purchase.tradingview_plans[0]
          : purchase.tradingview_plans;
        const message = buildTradingViewWhatsAppMessage(
          purchase,
          plan,
          client,
          draft,
          data?.expires_at ?? null
        );
        window.open(
          `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        alert(
          "TradingView was activated, but this customer has no phone/WhatsApp number saved."
        );
      }
    }

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
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    const mondayOffset = (startOfToday.getDay() + 6) % 7;
    startOfWeek.setDate(startOfToday.getDate() - mondayOffset);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const inRange = (value: any, start: Date) => value && new Date(value).getTime() >= start.getTime();

    const onlineSales = [
      ...propPurchaseApprovals
        .filter((item) => numberValue(item?.admin_verified_amount ?? item?.amount_paid) > 0)
        .map((item) => ({ source: "website", product: "Prop Firm", amount: numberValue(item.admin_verified_amount ?? item.amount_paid), date: item.funded_at || item.approved_at || item.created_at, customer: item.user_id })),
      ...onlineTradingViewPurchases
        .filter((item) => numberValue(item?.admin_verified_amount ?? item?.amount_paid) > 0)
        .map((item) => ({ source: "website", product: "TradingView", amount: numberValue(item.admin_verified_amount ?? item.amount_paid), date: item.funded_at || item.approved_at || item.updated_at || item.created_at, customer: item.user_id })),
      ...journalPayments
        .filter((item) => item?.status === "confirmed" && numberValue(item?.admin_verified_amount ?? item?.amount) > 0)
        .map((item) => ({ source: "website", product: "Trade Journal", amount: numberValue(item.admin_verified_amount ?? item.amount), date: item.confirmed_at || item.updated_at || item.created_at, customer: item.user_id })),
    ];
    const offlineSales = offlinePurchases
      .filter((item) => ["paid", "part_paid"].includes(item?.payment_status) && numberValue(item?.admin_verified_amount ?? item?.amount) > 0)
      .map((item) => ({ source: "offline", product: item.product_type === "prop_firm" ? "Prop Firm" : item.product_type === "tradingview" ? "TradingView" : item.product_type === "trade_journal" ? "Trade Journal" : "Other", amount: numberValue(item.admin_verified_amount ?? item.amount), date: item.created_at, customer: item.offline_customer_id }));
    const allSales = [...onlineSales, ...offlineSales];

    const period = (start: Date) => {
      const rows = allSales.filter((item) => inRange(item.date, start));
      const website = rows.filter((item) => item.source === "website");
      const offline = rows.filter((item) => item.source === "offline");
      const sum = (items: any[]) => items.reduce((total, item) => total + item.amount, 0);
      return {
        revenue: sum(rows), orders: rows.length,
        customers: new Set(rows.map((item) => `${item.source}:${item.customer}`).filter(Boolean)).size,
        websiteRevenue: sum(website), offlineRevenue: sum(offline),
        propRevenue: sum(rows.filter((item) => item.product === "Prop Firm")),
        tvRevenue: sum(rows.filter((item) => item.product === "TradingView")),
        journalRevenue: sum(rows.filter((item) => item.product === "Trade Journal")),
        otherRevenue: sum(rows.filter((item) => item.product === "Other")),
      };
    };

    const expiringSoon = [
      ...tvSubscriptions.map((item) => item?.expires_at),
      ...offlinePurchases.filter((item) => item.product_type === "tradingview").map((item) => item?.expires_at),
    ].filter((date) => {
      if (!date) return false;
      const days = Math.ceil((new Date(date).getTime() - now.getTime()) / 86400000);
      return days >= 0 && days <= 7;
    }).length;

    return {
      totalCustomers: clientProfiles.length + offlineCustomers.length,
      registeredClients: clientProfiles.length,
      offlineCustomers: offlineCustomers.length,
      today: period(startOfToday), week: period(startOfWeek), month: period(startOfMonth),
      expiringSoon,
      pendingDeliveries: propPurchaseApprovals.filter((item) => item.fulfillment_status === "pending_delivery").length + tvPendingDeliveries.length + offlinePurchases.filter((item) => item.order_status === "processing").length,
    };
  }, [clientProfiles, offlineCustomers, offlinePurchases, propPurchaseApprovals, onlineTradingViewPurchases, journalPayments, tvSubscriptions, tvPendingDeliveries]);

  const profitAnalytics = useMemo(() => {
    const money = (value: unknown) => {
      const parsed = Number(value ?? 0);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    startWeek.setDate(startToday.getDate() - ((startToday.getDay() + 6) % 7));
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rows = [
      ...propPurchaseApprovals.filter((item) => money(item?.amount_paid) > 0).map((item) => ({ table: "prop_offer_purchases", id: item.id, label: item.prop_firm || item.product_label || "Prop Firm", source: "Website", selling: money(item.admin_verified_amount ?? item.amount_paid), cost: money(item.cost_price), rawCost: item.cost_price, date: item.funded_at || item.approved_at || item.created_at })),
      ...onlineTradingViewPurchases.filter((item) => money(item?.amount_paid) > 0).map((item) => ({ table: "tradingview_purchases", id: item.id, label: item.plan_name || item.product_label || "TradingView", source: "Website", selling: money(item.admin_verified_amount ?? item.amount_paid), cost: money(item.cost_price), rawCost: item.cost_price, date: item.funded_at || item.approved_at || item.updated_at || item.created_at })),
      ...onlineJournalPurchases.filter((item) => money(item?.amount_paid) > 0).map((item) => ({ table: "trade_journal_purchases", id: item.id, label: item.plan_name || "Trade Journal", source: "Website", selling: money(item.admin_verified_amount ?? item.amount_paid), cost: money(item.cost_price), rawCost: item.cost_price, date: item.activated_at || item.updated_at || item.created_at })),
      ...offlinePurchases.filter((item) => ["paid", "part_paid"].includes(item?.payment_status) && money(item?.amount) > 0).map((item) => ({ table: "offline_customer_purchases", id: item.id, label: item.product_name || item.plan_name || item.prop_firm || "Offline sale", source: "WhatsApp / Offline", selling: money(item.admin_verified_amount ?? item.amount), cost: money(item.cost_price), rawCost: item.cost_price, date: item.created_at })),
    ].filter((item) => item.id && item.date);

    const summarize = (start: Date) => {
      const periodRows = rows.filter((item) => new Date(item.date).getTime() >= start.getTime());
      const sales = periodRows.reduce((sum, item) => sum + item.selling, 0);
      const cost = periodRows.reduce((sum, item) => sum + item.cost, 0);
      const profit = sales - cost;
      return { sales, cost, profit, margin: sales > 0 ? (profit / sales) * 100 : 0, orders: periodRows.length };
    };

    return {
      today: summarize(startToday),
      week: summarize(startWeek),
      month: summarize(startMonth),
      rows: rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }, [propPurchaseApprovals, onlineTradingViewPurchases, onlineJournalPurchases, offlinePurchases]);

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

  function getPropDeliveryDraft(purchase: any) {
    return propDeliveryDrafts[purchase.id] || {
      deliveryMethod: purchase.delivery_method || "check_email",
      deliveryUsername: purchase.delivery_username || "",
      deliveryPassword: purchase.delivery_password || "",
      deliveryMessage: purchase.delivery_message || "",
      claimCode: purchase.claim_code || "",
      claimUrl: purchase.claim_url || "",
    };
  }

  function updatePropDeliveryDraft(purchase: any, field: string, value: string) {
    const current = getPropDeliveryDraft(purchase);
    setPropDeliveryDrafts((drafts) => ({
      ...drafts,
      [purchase.id]: { ...current, [field]: value },
    }));
  }

  async function saveOnlinePropDelivery(purchase: any, markDelivered = false) {
    const draft = getPropDeliveryDraft(purchase);

    if (draft.deliveryMethod === "claim_code" && !draft.claimCode.trim()) {
      return alert("Enter the prop firm claim/delivery code.");
    }
    if (
      draft.deliveryMethod === "credentials" &&
      (!draft.deliveryUsername.trim() || !draft.deliveryPassword.trim())
    ) {
      return alert("Enter the prop account login/account ID and password.");
    }

    setProcessingPurchaseId(purchase.id);
    const { error } = await supabase
      .from("prop_offer_purchases")
      .update({
        delivery_method: draft.deliveryMethod,
        delivery_username: draft.deliveryUsername.trim() || null,
        delivery_password: draft.deliveryPassword || null,
        delivery_message: draft.deliveryMessage.trim() || null,
        claim_code: draft.claimCode.trim() || null,
        claim_url: draft.claimUrl.trim() || null,
      })
      .eq("id", purchase.id);

    if (error) {
      setProcessingPurchaseId(null);
      return alert(`Could not save delivery details: ${error.message}`);
    }

    if (markDelivered) {
      const { error: statusError } = await supabase.rpc("admin_set_prop_delivery_status", {
        p_purchase_id: purchase.id,
        p_delivery_status: "delivered",
      });
      if (statusError) {
        setProcessingPurchaseId(null);
        return alert(`Delivery details saved, but status could not be updated: ${statusError.message}`);
      }
    }

    await loadPropPurchaseApprovals();
    setProcessingPurchaseId(null);
    alert(markDelivered ? "Delivery details saved and order marked delivered." : "Delivery details saved.");
  }

  function buildOnlinePropWhatsAppMessage(purchase: any, firmName: string, client: any) {
    const draft = getPropDeliveryDraft(purchase);
    const firstName = getClientFirstName(client);
    const lines = [
      `Hello ${firstName} 👋`,
      "",
      `Your ${firmName || "Prop Firm"} account from Fidelity Traders Hub is ready.`,
      "",
      `Prop Firm: ${firmName || "Prop Firm"}`,
    ];

    if (draft.deliveryMethod === "claim_code") {
      lines.push(`Claim Code: ${draft.claimCode || "Contact Fidelity Traders Hub"}`);
      if (draft.claimUrl) lines.push(`Claim Link: ${draft.claimUrl}`);
      lines.push("", "Please keep this code private.");
    } else if (draft.deliveryMethod === "check_email") {
      lines.push(
        "",
        "Your account details were sent to the email address used for the prop firm registration.",
        "Please check your Inbox, Spam and Junk folders."
      );
    } else if (draft.deliveryMethod === "whatsapp_instruction") {
      if (draft.deliveryMessage) lines.push("", draft.deliveryMessage);
    } else {
      if (draft.deliveryUsername) lines.push(`Login / Account ID: ${draft.deliveryUsername}`);
      if (draft.deliveryPassword) lines.push(`Password / Access Code: ${draft.deliveryPassword}`);
    }

    if (draft.deliveryMessage && draft.deliveryMethod !== "whatsapp_instruction") {
      lines.push("", `Instructions: ${draft.deliveryMessage}`);
    }

    lines.push(
      "",
      "Log in to your Fidelity Traders Hub dashboard to view your delivery and manage your account:",
      "fidelitytradershub.com",
      "",
      "🎁 You can get 15% discount where our referral offer applies.",
      "🎁 You also get 1 month FREE Trade Journal access to journal and review your trades.",
      "",
      "Need help? Reply to this WhatsApp message.",
      "",
      "Fidelity Traders Hub",
      "Where Traders Meet Possibilities"
    );

    return lines.join("\n");
  }

  async function sendOnlinePropWhatsApp(purchase: any, firmName: string, client: any) {
    const phone = getClientWhatsAppNumber(client);
    if (!phone) return alert("This website customer has no WhatsApp/phone number saved.");

    const draft = getPropDeliveryDraft(purchase);
    if (draft.deliveryMethod === "claim_code" && !draft.claimCode.trim()) {
      return alert("Enter the claim code first.");
    }

    await saveOnlinePropDelivery(purchase, false);
    const message = buildOnlinePropWhatsAppMessage(purchase, firmName, client);
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

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

  function getReferralCodeForPartner(partnerId: string) {
    return referralCodes.find((item) => item.partner_id === partnerId)?.code || "";
  }

  function getReferralLinkForPartner(partnerId: string) {
    const code = getReferralCodeForPartner(partnerId);
    if (!code) return "";
    if (typeof window === "undefined") {
      return `https://fidelitytradershub.com/register?ref=${encodeURIComponent(code)}`;
    }
    return `${window.location.origin}/register?ref=${encodeURIComponent(code)}`;
  }

  function escapeInvitationHtml(value: unknown) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getInvitationRecipient(partner?: any) {
    const typedName = invitationName.trim();
    return typedName || partner?.display_name || "Affiliate Partner";
  }

  function getInvitationCommissionRate(partner?: any) {
    const rate = Number(partner?.default_commission_rate ?? 15);
    return Number.isFinite(rate) && rate >= 0 ? rate : 15;
  }

  function copyAffiliateXMessage(partner?: any) {
    const name = getInvitationRecipient(partner);
    const firstName = name.split(/\s+/)[0] || name;
    const message = `Hi ${firstName}, Fidelity Traders Hub would love to invite you to join our Affiliate Programme. We have prepared an official invitation letter for you with the commission structure and programme details. I will attach the PDF here. — Fidelity Traders Hub | fidelitytradershub.com`;
    navigator.clipboard
      .writeText(message)
      .then(() => alert("X DM message copied. Open X, paste the message and attach the invitation PDF."))
      .catch(() => window.prompt("Copy this X DM message:", message));
  }

  function openXMessages() {
    window.open("https://x.com/messages", "_blank", "noopener,noreferrer");
  }

  function printAffiliateInvitation(partner?: any) {
    const recipient = getInvitationRecipient(partner);
    if (!recipient || recipient === "Affiliate Partner") {
      return alert("Enter the person’s name or select an existing affiliate first.");
    }

    const code = partner ? getReferralCodeForPartner(partner.partner_id) : "";
    const referralLink = partner ? getReferralLinkForPartner(partner.partner_id) : "";
    const rate = getInvitationCommissionRate(partner);
    const invitationWindow = window.open("", "_blank", "width=900,height=900");

    if (!invitationWindow) {
      return alert("Your browser blocked the letter window. Please allow pop-ups for this Admin page and try again.");
    }

    const partnerName = escapeInvitationHtml(recipient);
    const safeCode = escapeInvitationHtml(code || "Will be assigned after acceptance");
    const safeLink = escapeInvitationHtml(referralLink || "Will be assigned after acceptance");
    const safeRate = escapeInvitationHtml(rate);
    const logoUrl = "data:image/png;base64,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vLDwG/eE8/s3BCkeAAAACXBIWXMAAEzlAABM5QF1zvCVAAADbWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4NCjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iPjxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9InV1aWQ6ZmFmNWJkZDUtYmEzZC0xMWRhLWFkMzEtZDMzZDc1MTgyZjFiIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPjxkYzpjcmVhdG9yPjxyZGY6U2VxIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PHJkZjpsaT5Pbmx5T25lSXNyYWVsPC9yZGY6bGk+PC9yZGY6U2VxPg0KCQkJPC9kYzpjcmVhdG9yPjwvcmRmOkRlc2NyaXB0aW9uPjxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSJ1dWlkOmZhZjViZGQ1LWJhM2QtMTFkYS1hZDMxLWQzM2Q3NTE4MmYxYiIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPjxleGlmOkRhdGVUaW1lT3JpZ2luYWw+MjAyNS0wNC0yMlQxMDo1NDozMy42NjY8L2V4aWY6RGF0ZVRpbWVPcmlnaW5hbD48L3JkZjpEZXNjcmlwdGlvbj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyI+PHhtcDpDcmVhdGVEYXRlPjIwMjUtMDQtMjJUMTA6NTQ6MzMuNjY2PC94bXA6Q3JlYXRlRGF0ZT48L3JkZjpEZXNjcmlwdGlvbj48L3JkZjpSREY+PC94OnhtcG1ldGE+DQo8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";
    const dateLabel = escapeInvitationHtml(
      new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
    );

    const commission = (price: number) => Math.round((price * rate) / 100);

    invitationWindow.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Fidelity Traders Hub Affiliate Invitation - ${partnerName}</title>
<style>
  @page { size: A4; margin: 13mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #142033; background: #eef2f5; }
  .sheet { max-width: 820px; min-height: 1080px; margin: 24px auto; background: white; padding: 34px 44px; border-top: 8px solid #c8ff00; box-shadow: 0 18px 60px rgba(5,8,12,.14); }
  .header { display: flex; align-items: center; gap: 14px; padding-bottom: 15px; border-bottom: 1px solid #e3e8ed; }
  .logo { width: 58px; height: 58px; object-fit: contain; border-radius: 50%; flex: 0 0 auto; }
  .brand { color: #0a1628; font-size: 23px; font-weight: 900; letter-spacing: -.02em; }
  .tagline { margin-top: 4px; color: #5d6878; font-size: 12px; }
  .date { margin-top: 18px; color: #5d6878; font-size: 12px; }
  h1 { margin: 18px 0 8px; font-size: 22px; color: #0a1628; line-height: 1.22; }
  h2 { margin: 20px 0 7px; font-size: 15.5px; color: #0a1628; }
  p, li { font-size: 12.5px; line-height: 1.58; }
  ul { margin-top: 7px; padding-left: 20px; }
  .highlight { color: #526700; font-weight: 800; }
  .refbox { margin: 15px 0; padding: 12px 14px; border: 1px solid #dce3e8; border-left: 5px solid #c8ff00; background: #f8fafb; overflow-wrap: anywhere; font-size: 12px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th, td { border: 1px solid #dce3e8; padding: 7px 8px; text-align: left; }
  th { background: #0a1628; color: white; }
  .commission { font-weight: 800; color: #526700; }
  .flow { margin: 12px 0; padding: 12px 14px; border-radius: 8px; background: #0a1628; color: white; font-size: 12.5px; font-weight: 800; text-align: center; }
  .footer { margin-top: 22px; padding-top: 14px; border-top: 1px solid #dce3e8; }
  .small { color: #5d6878; font-size: 11px; }
  .printbar { max-width: 820px; margin: 16px auto 0; display: flex; gap: 8px; justify-content: flex-end; }
  .printbar button { border: 0; border-radius: 9px; background: #c8ff00; color: #071006; padding: 11px 16px; font-weight: 800; cursor: pointer; }
  @media print {
    body { background: white; }
    .printbar { display: none; }
    .sheet { margin: 0; max-width: none; min-height: 0; box-shadow: none; padding: 0; border-top-width: 6px; }
    .sheet + .sheet { break-before: page; page-break-before: always; }
  }
</style>
</head>
<body>
<div class="printbar"><button onclick="window.print()">Print / Save as PDF</button></div>

<div class="sheet">
  <div class="header">
    <img class="logo" src="${logoUrl}" alt="Fidelity Traders Hub logo" />
    <div><div class="brand">Fidelity Traders Hub</div><div class="tagline">Where Traders Meet Possibilities · fidelitytradershub.com</div></div>
  </div>
  <div class="date">${dateLabel}</div>
  <h1>Invitation to Join the Fidelity Traders Hub Affiliate Programme</h1>
  <p>Dear <strong>${partnerName}</strong>,</p>
  <p>We are pleased to formally invite you to become an <strong>Affiliate Partner of Fidelity Traders Hub (FTH)</strong>.</p>
  <p>Fidelity Traders Hub was established in <strong>2023</strong> to make access to essential trading tools and services easier and more affordable for traders, particularly within Nigeria. Since commencing operations, we have fulfilled <strong>more than 2,000 Prop Firm and TradingView orders/services</strong> for customers.</p>
  <p>Fidelity Traders Hub operates under <strong>Fidelity Nasir Innovation Limited</strong>, a company registered in Nigeria with the Corporate Affairs Commission under <strong>RC 8581474</strong>.</p>
  <p>Our services include TradingView subscriptions, access to Prop Firm opportunities, Pay Small Small payment solutions, Trade Journal tools and other trader-focused services.</p>

  <h2>How You Earn</h2>
  <p>As an FTH Affiliate Partner, you can earn <span class="highlight">15% commission</span> on qualifying sales made through your unique affiliate/referral link or code.</p>
  <table>
    <thead><tr><th>Product</th><th>Customer Price</th><th>Your 15% Commission</th></tr></thead>
    <tbody>
      <tr><td>TradingView Premium</td><td>NGN 50,000</td><td class="commission">NGN 7,500</td></tr>
      <tr><td>TradingView Premium Co-Sponsor</td><td>NGN 25,000</td><td class="commission">NGN 3,750</td></tr>
      <tr><td>TradingView Essential</td><td>NGN 24,000</td><td class="commission">NGN 3,600</td></tr>
      <tr><td>TradingView Essential Co-Sponsor</td><td>NGN 12,000</td><td class="commission">NGN 1,800</td></tr>
    </tbody>
  </table>
  <p class="small">These examples show the standard 15% commission calculation. Where product prices or eligible offers change, commission is calculated from the qualifying transaction recorded on the Fidelity Traders Hub platform.</p>

  <div class="refbox">
    <strong>Your referral code:</strong> ${safeCode}<br/>
    <strong>Your referral link:</strong> ${safeLink}
  </div>

  <p>We believe trusted partners and creators can play an important role in introducing more traders to the solutions we provide, and we would be delighted to have you grow with us.</p>
</div>

<div class="sheet">
  <div class="header">
    <img class="logo" src="${logoUrl}" alt="Fidelity Traders Hub logo" />
    <div><div class="brand">Fidelity Traders Hub</div><div class="tagline">Affiliate Programme · Where Traders Meet Possibilities</div></div>
  </div>

  <h1>Your Dedicated Affiliate Dashboard</h1>
  <p>We have built a <strong>dedicated Affiliate Dashboard</strong> so that the programme is transparent and easy to manage. Once your affiliate account is activated, you can use your dashboard to monitor:</p>
  <ul>
    <li>Your unique referral link and referral code.</li>
    <li>Successful referrals and qualifying sales.</li>
    <li>Commission earned and available commission balance.</li>
    <li>Previous earnings and payout records.</li>
    <li>Payout/withdrawal requests.</li>
  </ul>
  <p>This means you do not have to depend on screenshots, messages or manual calculations to know how much you have earned. Your affiliate activity can be tracked from your FTH account.</p>

  <h2>Commission Withdrawal</h2>
  <p>Your earned and available affiliate commission can be withdrawn once your eligible balance reaches <strong>NGN 10,000 or above</strong>. You can submit the withdrawal request directly from your Affiliate Dashboard, after which it goes through our normal verification and payout process.</p>
  <div class="flow">Share → Customer purchases → Sale is verified → Commission is recorded → Reach NGN 10,000 → Request withdrawal → Receive payment</div>

  <h2>Why Partner With Fidelity Traders Hub?</h2>
  <p>We are building more than a sales page. Our goal is to create an ecosystem where traders can access useful products and services while partners have a structured way to benefit from helping us grow.</p>
  <p>As an affiliate, you will be working with a Nigerian registered business that has been operating since <strong>2023</strong>, has fulfilled <strong>more than 2,000 Prop Firm and TradingView orders/services</strong>, and continues to invest in systems that improve transparency, customer experience and partner management.</p>
  <p>You are not required to handle customer payments or product delivery yourself. Your role is primarily to introduce potential customers to Fidelity Traders Hub through your approved referral channel. Our team and platform handle the transaction, verification and fulfilment process.</p>

  <h2>Acceptance &amp; Onboarding</h2>
  <p>If you would like to accept this invitation, simply respond to our message and we will complete your affiliate onboarding. Once activated, you will receive your unique affiliate link/code and access to your Fidelity Traders Hub Affiliate Dashboard.</p>
  <p>We look forward to the possibility of working together and building a mutually beneficial partnership.</p>

  <div class="footer">
    <p><strong>Warm regards,</strong><br/><strong>Nasir Adamu Musa</strong><br/>Founder, Fidelity Traders Hub<br/>Fidelity Nasir Innovation Limited<br/>CAC RC 8581474<br/>fidelitytradershub.com</p>
    <p class="small">Where Traders Meet Possibilities</p>
  </div>
</div>
</body>
</html>`);

    invitationWindow.document.close();
    invitationWindow.focus();
  }

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
        <aside className="fth-app-sidebar hidden border-b border-slate-800 lg:block lg:min-h-screen lg:border-b-0 lg:border-r">
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
                ["customers", "♙", "Customers"],
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
                <p className="mt-2 truncate text-sm font-black">{privacyMode ? maskEmail(adminDebug?.email) : (adminDebug?.email || "Administrator")}</p>
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
                  onClick={() => setPrivacyMode((current) => !current)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-black ${privacyMode ? "bg-emerald-600 text-white" : "border border-slate-800 bg-slate-900 text-slate-200"}`}
                  title="Hide customer contact details, order IDs and money before taking screenshots"
                >
                  {privacyMode ? "🔒 Privacy ON" : "🔓 Privacy OFF"}
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
                <div className="px-6 py-6 sm:px-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">Business snapshot</p><h3 className="mt-2 text-2xl font-black">Online + offline sales in one view</h3><p className="mt-2 text-sm text-slate-400">Only recorded paid amounts are counted as sales. Deposits are not counted again.</p></div>
                    <button type="button" onClick={() => setAnalyticsOpen((current) => !current)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-bold">{analyticsOpen ? "Show less" : "Show details"}</button>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[["Total customers", businessAnalytics.totalCustomers],["Website customers", businessAnalytics.registeredClients],["WhatsApp / offline", businessAnalytics.offlineCustomers],["TV expiring ≤ 7 days", businessAnalytics.expiringSoon]].map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {[
                      { label: "Today", data: businessAnalytics.today },
                      { label: "This week", data: businessAnalytics.week },
                      { label: "This month", data: businessAnalytics.month },
                    ].map(({ label, data }) => (
                      <div key={label} className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                        <p className="text-xs font-black uppercase tracking-[.14em] text-blue-300">{label}</p>
                        <p className="mt-2 text-2xl font-black">₦{Number(data.revenue).toLocaleString("en-NG")}</p>
                        <p className="mt-2 text-sm text-slate-300">{data.orders} orders · {data.customers} customers</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                          <span>Website ₦{Number(data.websiteRevenue).toLocaleString("en-NG")}</span>
                          <span>Offline ₦{Number(data.offlineRevenue).toLocaleString("en-NG")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {analyticsOpen && <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Prop Firm", businessAnalytics.month.propRevenue],["TradingView", businessAnalytics.month.tvRevenue],["Trade Journal", businessAnalytics.month.journalRevenue],["Other", businessAnalytics.month.otherRevenue],["Pending deliveries", businessAnalytics.pendingDeliveries]].map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-black">{label === "Pending deliveries" ? value : `₦${Number(value).toLocaleString("en-NG")}`}</p></div>)}</div>}
                </div>
              </section>
            )}

            {activeAdminSection === "announcements" && (
              <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-amber-300">Private profit tracker</p>
                    <h3 className="mt-2 text-2xl font-black">Buying cost, selling price & profit</h3>
                    <p className="mt-2 text-sm text-slate-400">Hidden by default on every page load. Privacy Mode does not reveal these figures.</p>
                  </div>
                  <button type="button" onClick={() => setShowProfitFigures((current) => !current)} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-black text-amber-200">
                    {showProfitFigures ? "🔒 Hide profit figures" : "👁 Show profit figures"}
                  </button>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {[{label:"Today",data:profitAnalytics.today},{label:"This week",data:profitAnalytics.week},{label:"This month",data:profitAnalytics.month}].map(({label,data}) => (
                    <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                      <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">{label}</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Sales</span><strong>{showProfitFigures ? `₦${data.sales.toLocaleString("en-NG")}` : "••••••••"}</strong></div>
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Buying cost</span><strong>{showProfitFigures ? `₦${data.cost.toLocaleString("en-NG")}` : "••••••••"}</strong></div>
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Gross profit</span><strong className={showProfitFigures && data.profit < 0 ? "text-red-300" : "text-emerald-300"}>{showProfitFigures ? `₦${data.profit.toLocaleString("en-NG")}` : "••••••••"}</strong></div>
                        <div className="flex justify-between gap-3"><span className="text-slate-400">Margin</span><strong>{showProfitFigures ? `${data.margin.toFixed(1)}%` : "••••"}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>

                {showProfitFigures && (
                  <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="min-w-[900px] w-full text-left text-sm">
                      <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Sale</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Selling price</th><th className="px-4 py-3">Buying cost</th><th className="px-4 py-3">Profit</th><th className="px-4 py-3">Action</th></tr></thead>
                      <tbody>
                        {profitAnalytics.rows.slice(0, 40).map((row) => { const key = `${row.table}:${row.id}`; const draft = profitCostDrafts[key] ?? (row.rawCost == null ? "" : String(row.rawCost)); const draftNumber = Number(draft || 0); const previewProfit = row.selling - (Number.isFinite(draftNumber) ? draftNumber : 0); return <tr key={key} className="border-t border-slate-800"><td className="px-4 py-3"><p className="font-bold text-slate-100">{row.label}</p><p className="mt-1 text-xs text-slate-500">{new Date(row.date).toLocaleDateString()}</p></td><td className="px-4 py-3 text-slate-300">{row.source}</td><td className="px-4 py-3 font-bold">₦{row.selling.toLocaleString("en-NG")}</td><td className="px-4 py-3"><input type="number" min="0" value={draft} onChange={(event) => setProfitCostDrafts((current) => ({...current,[key]:event.target.value}))} placeholder="Enter cost" className="w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"/></td><td className={`px-4 py-3 font-black ${previewProfit < 0 ? "text-red-300" : "text-emerald-300"}`}>₦{previewProfit.toLocaleString("en-NG")}</td><td className="px-4 py-3"><button type="button" disabled={savingProfitKey===key} onClick={() => savePurchaseCost(row.table,row.id,row.rawCost)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold disabled:opacity-50">{savingProfitKey===key ? "Saving..." : "Save cost"}</button></td></tr>; })}
                        {profitAnalytics.rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No paid sales found yet.</td></tr>}
                      </tbody>
                    </table>
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
            ["announcements", "Overview"],
            ["customers", "Customers"],
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

      {/* CUSTOMERS — unified website + WhatsApp/offline CRM */}
      <section className={`mt-8 ${activeAdminSection === "customers" ? "block" : "hidden"}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">Customer CRM</p><h2 className="mt-2 text-2xl font-bold">Customers</h2><p className="mt-1 text-sm text-slate-400">Website clients and WhatsApp/offline customers in one workspace.</p></div>
          <button type="button" onClick={() => setShowOfflineCustomerForm((v) => !v)} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold">+ Add WhatsApp customer</button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { key: "all" as const, label: "All customers", value: businessAnalytics.totalCustomers, helper: "Website + WhatsApp/offline" },
            { key: "website" as const, label: "Website customers", value: businessAnalytics.registeredClients, helper: "Registered on the website" },
            { key: "offline" as const, label: "WhatsApp / offline", value: businessAnalytics.offlineCustomers, helper: "Added manually by Admin" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCustomerSourceFilter(item.key)}
              className={`rounded-2xl border p-5 text-left transition ${customerSourceFilter === item.key ? "border-[#c8ff00] bg-[#c8ff00]/10" : "border-slate-700 bg-slate-900 hover:border-slate-500"}`}
            >
              <p className="text-xs font-black uppercase tracking-wider text-slate-300">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-300">{item.helper}</p>
            </button>
          ))}
        </div>

        {showOfflineCustomerForm && <div id="offline-customer-form" className="mt-5 rounded-2xl border border-blue-500/20 bg-slate-900 p-6"><h3 className="font-bold">{editingOfflineCustomerId ? "Edit WhatsApp / offline customer" : "Add WhatsApp / offline customer"}</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><input value={offlineCustomerName} onChange={(e)=>setOfflineCustomerName(e.target.value)} placeholder="Full name *" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"/><input value={offlineCustomerPhone} onChange={(e)=>setOfflineCustomerPhone(e.target.value)} placeholder="WhatsApp / phone *" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"/><input value={offlineCustomerEmail} onChange={(e)=>setOfflineCustomerEmail(e.target.value)} placeholder="Email (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"/><select value={offlineCustomerSource} onChange={(e)=>setOfflineCustomerSource(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><option value="whatsapp">WhatsApp</option><option value="walk_in">Walk-in</option><option value="referral">Referral</option><option value="other">Other</option></select><input value={offlineCustomerNotes} onChange={(e)=>setOfflineCustomerNotes(e.target.value)} placeholder="Notes" className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"/></div><div className="mt-4 flex gap-2"><button disabled={savingOfflineCustomer} onClick={createOfflineCustomer} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold disabled:opacity-50">{savingOfflineCustomer ? "Saving..." : editingOfflineCustomerId ? "Update customer" : "Save customer"}</button><button onClick={resetOfflineCustomerForm} className="rounded-xl border border-slate-700 px-5 py-3">Cancel</button></div></div>}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><input value={customerSearch} onChange={(e)=>setCustomerSearch(e.target.value)} placeholder="Search name, email or phone" className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400"/><div className="mt-4 max-h-[650px] space-y-2 overflow-y-auto pr-1">
            {[...clientProfiles.map((c:any)=>({key:`website:${c.id || c.user_id}`, source:"Website", sourceKind:"website", name:getClientLabel(c), phone:c.phone || c.phone_number, raw:c})), ...offlineCustomers.map((c:any)=>({key:`offline:${c.id}`, source:c.source === "whatsapp" ? "WhatsApp / Offline" : c.source, sourceKind:"offline", name:c.full_name, phone:c.phone, raw:c}))]
              .filter((c:any)=>customerSourceFilter === "all" || c.sourceKind === customerSourceFilter)
              .filter((c:any)=>`${c.name} ${c.phone || ""}`.toLowerCase().includes(customerSearch.trim().toLowerCase()))
              .map((c:any)=><button key={c.key} type="button" onClick={()=>{setSelectedCustomerKey(c.key);setShowOfflinePurchaseForm(false);setShowOfflinePurchaseHistory(false);setEditingOfflinePurchaseId(null)}} className={`w-full rounded-xl border p-4 text-left transition ${selectedCustomerKey===c.key ? "border-[#c8ff00] bg-[#c8ff00]/10" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-bold text-white">{c.name}</p><p className="mt-1 text-sm font-medium text-slate-300">{displayPhone(c.phone)}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${c.key.startsWith("website:") ? "bg-blue-500/15 text-blue-200" : "bg-emerald-400/15 text-emerald-200"}`}>{c.source}</span></div></button>)}
          </div></div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">{!selectedCustomerKey ? <div className="py-16 text-center text-slate-500">Select a customer to view their profile and purchase history.</div> : (()=>{ const isOffline=selectedCustomerKey.startsWith("offline:"); const id=selectedCustomerKey.split(":")[1]; const customer=isOffline ? offlineCustomers.find((c:any)=>c.id===id) : clientProfiles.find((c:any)=>(c.id || c.user_id)===id); if(!customer) return <p className="text-slate-400">Customer not found.</p>; const purchases=isOffline ? offlinePurchases.filter((p:any)=>p.offline_customer_id===id) : []; const total=purchases.filter((p:any)=>["paid","part_paid"].includes(p.payment_status)).reduce((sum:number,p:any)=>sum+Number(p.amount||0),0); return <><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-slate-500">{isOffline ? "WhatsApp / offline customer" : "Registered website customer"}</p><h3 className="mt-1 text-xl font-black">{isOffline ? customer.full_name : getClientLabel(customer)}</h3><p className="mt-2 text-sm text-slate-400">{isOffline ? displayPhone(customer.phone) : (customer.phone || customer.phone_number ? displayPhone(customer.phone || customer.phone_number) : displayEmail(customer.email))}</p>{isOffline && <p className="mt-1 text-sm text-slate-500">Total recorded spend: {privacyMode ? "Hidden for privacy" : `₦${total.toLocaleString("en-NG")}`}</p>}</div><div className="flex flex-wrap gap-2"><button onClick={()=>isOffline ? openOfflineWhatsApp(customer) : openClientWhatsApp(customer)} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-slate-950">WhatsApp</button>{isOffline && <><button onClick={()=>{resetOfflinePurchaseForm();setShowOfflinePurchaseForm(true)}} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold">+ Add purchase</button><button onClick={()=>setShowOfflinePurchaseHistory((v)=>!v)} className="rounded-xl border border-lime-400/40 bg-lime-400/10 px-4 py-2.5 text-sm font-bold text-lime-300">{showOfflinePurchaseHistory ? "Hide history" : `Show history (${purchases.length})`}</button><button onClick={()=>editOfflineCustomer(customer)} className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Edit</button><button onClick={()=>deleteOfflineCustomer(customer)} className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300">Delete</button></>}</div></div>
            {!isOffline && <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-slate-300">This is an existing website customer. Their purchases remain in the normal Prop Firm, TradingView and Trade Journal systems so we do not duplicate their records.</div>}
            {isOffline && showOfflinePurchaseForm && <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4"><h4 className="font-bold">{editingOfflinePurchaseId ? "Edit purchase" : "Record purchase"}</h4><div className="mt-3 grid gap-3 md:grid-cols-2"><select value={offlinePurchaseType} onChange={(e)=>setOfflinePurchaseType(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"><option value="tradingview">TradingView</option><option value="prop_firm">Prop Firm</option><option value="trade_journal">Trade Journal</option><option value="other">Other</option></select><input value={offlinePurchaseName} onChange={(e)=>setOfflinePurchaseName(e.target.value)} placeholder="Product name" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><input value={offlinePurchaseAmount} onChange={(e)=>setOfflinePurchaseAmount(e.target.value)} type="number" min="0" placeholder="Selling price / amount paid (NGN)" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><input value={offlinePurchaseCostPrice} onChange={(e)=>setOfflinePurchaseCostPrice(e.target.value)} type="number" min="0" placeholder="Private buying cost (NGN)" className="rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-3"/><input value={offlinePurchaseCostNote} onChange={(e)=>setOfflinePurchaseCostNote(e.target.value)} placeholder="Private cost note (optional)" className="rounded-xl border border-amber-500/30 bg-slate-900 px-3 py-3"/><select value={offlinePurchasePaymentStatus} onChange={(e)=>setOfflinePurchasePaymentStatus(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"><option value="paid">Paid</option><option value="part_paid">Part paid</option><option value="pending">Pending</option><option value="refunded">Refunded</option></select><select value={offlinePurchaseOrderStatus} onChange={(e)=>setOfflinePurchaseOrderStatus(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"><option value="pending">Pending</option><option value="processing">Processing</option><option value="delivered">Delivered</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><input value={offlinePurchaseReference} onChange={(e)=>setOfflinePurchaseReference(e.target.value)} placeholder="Payment reference" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/>{offlinePurchaseType==="prop_firm" && <><input value={offlinePurchasePropFirm} onChange={(e)=>setOfflinePurchasePropFirm(e.target.value)} placeholder="Prop firm" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><input value={offlinePurchaseAccountSize} onChange={(e)=>setOfflinePurchaseAccountSize(e.target.value)} placeholder="Account size" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><input value={offlinePurchasePhase} onChange={(e)=>setOfflinePurchasePhase(e.target.value)} placeholder="Phase / challenge type" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/></>}{offlinePurchaseType==="tradingview" && <><input value={offlinePurchasePlanName} onChange={(e)=>setOfflinePurchasePlanName(e.target.value)} placeholder="TradingView plan" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><label className="text-xs text-slate-400">Start date<input value={offlinePurchaseStartedAt} onChange={(e)=>setOfflinePurchaseStartedAt(e.target.value)} type="date" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white"/></label><label className="text-xs text-slate-400">Expiry date<input value={offlinePurchaseExpiresAt} onChange={(e)=>setOfflinePurchaseExpiresAt(e.target.value)} type="date" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white"/></label></>}<div className="md:col-span-2 rounded-xl border border-lime-400/20 bg-lime-400/5 p-4"><p className="text-xs font-black uppercase tracking-[.14em] text-lime-300">Customer delivery</p>{offlinePurchaseType==="prop_firm" && <div className="mt-3"><label className="text-xs font-bold text-slate-300">Delivery method<select value={offlinePurchaseDeliveryMethod} onChange={(e)=>setOfflinePurchaseDeliveryMethod(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white"><option value="credentials">Login credentials</option><option value="claim_code">Claim code</option><option value="check_email">Check registered email</option><option value="whatsapp_instruction">WhatsApp instructions</option></select></label></div>}<div className="mt-3 grid gap-3 md:grid-cols-2">{(offlinePurchaseType==="tradingview" || offlinePurchaseDeliveryMethod==="credentials") && <><input value={offlinePurchaseDeliveryUsername} onChange={(e)=>setOfflinePurchaseDeliveryUsername(e.target.value)} placeholder={offlinePurchaseType==="tradingview" ? "TradingView username / login" : "Login / account ID"} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><input value={offlinePurchaseDeliveryPassword} onChange={(e)=>setOfflinePurchaseDeliveryPassword(e.target.value)} placeholder={offlinePurchaseType==="tradingview" ? "TradingView password" : "Password / access code"} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/></>}{offlinePurchaseType==="prop_firm" && offlinePurchaseDeliveryMethod==="claim_code" && <><input value={offlinePurchaseClaimCode} onChange={(e)=>setOfflinePurchaseClaimCode(e.target.value)} placeholder="Claim / delivery code" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/><input value={offlinePurchaseClaimUrl} onChange={(e)=>setOfflinePurchaseClaimUrl(e.target.value)} placeholder="Claim URL (optional)" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3"/></>}<textarea value={offlinePurchaseDeliveryMessage} onChange={(e)=>setOfflinePurchaseDeliveryMessage(e.target.value)} rows={3} placeholder={offlinePurchaseDeliveryMethod==="check_email" ? "Extra email instructions (optional)" : "Customer instructions / delivery message (optional)"} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 md:col-span-2"/></div><div className="mt-4 grid gap-2 sm:grid-cols-3"><label className="flex items-center gap-2 text-xs font-bold text-slate-300"><input type="checkbox" checked={offlinePurchaseIncludeSignupOffer} onChange={(e)=>setOfflinePurchaseIncludeSignupOffer(e.target.checked)}/>Signup invitation</label><label className="flex items-center gap-2 text-xs font-bold text-slate-300"><input type="checkbox" checked={offlinePurchaseIncludeReferralOffer} onChange={(e)=>setOfflinePurchaseIncludeReferralOffer(e.target.checked)}/>15% referral offer</label><label className="flex items-center gap-2 text-xs font-bold text-slate-300"><input type="checkbox" checked={offlinePurchaseIncludeFreeJournal} onChange={(e)=>setOfflinePurchaseIncludeFreeJournal(e.target.checked)}/>1-month free journal</label></div><p className="mt-3 text-xs text-slate-400">{offlinePurchaseType==="tradingview" ? "TradingView delivery uses username and password only." : "Choose how this prop account is delivered. Claim codes can be sent directly in WhatsApp and shown in the private Delivery View."}</p></div><input value={offlinePurchaseNotes} onChange={(e)=>setOfflinePurchaseNotes(e.target.value)} placeholder="Notes" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 md:col-span-2"/></div><button disabled={savingOfflinePurchase} onClick={createOfflinePurchase} className="mt-3 rounded-xl bg-emerald-600 px-5 py-3 font-bold disabled:opacity-50">{savingOfflinePurchase ? "Saving..." : editingOfflinePurchaseId ? "Update purchase" : "Save purchase"}</button><button type="button" onClick={resetOfflinePurchaseForm} className="mt-3 ml-2 rounded-xl border border-slate-700 px-5 py-3 font-bold">Cancel</button></div>}
            {isOffline && showOfflinePurchaseHistory && <div className="mt-5"><h4 className="font-bold">Purchase history</h4><div className="mt-3 space-y-3">{purchases.length===0 ? <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">No purchases recorded yet.</p> : purchases.map((p:any)=>{ const days=p.expires_at ? getDaysRemaining(p.expires_at) : null; return <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">{["delivered","completed"].includes(p.order_status) && <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-400">Share-safe delivery proof</p><div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-xs uppercase text-slate-500">Client</p><p className="mt-1 font-bold">{privacyMode ? `${String(customer.full_name || "Customer").split(" ")[0]} ${String(customer.full_name || "").split(" ").slice(1).map(()=>"•").join("")}` : customer.full_name}</p><p className="mt-1 text-xs text-slate-400">{displayPhone(customer.phone)}</p></div><div><p className="text-xs uppercase text-slate-500">Product</p><p className="mt-1 font-bold text-amber-300">{p.prop_firm || p.plan_name || p.product_name || p.product_type.replaceAll("_"," ")}</p>{p.account_size && <p className="mt-1 text-sm text-slate-400">{p.account_size}{p.phase ? ` · ${p.phase}` : ""}</p>}</div><div><p className="text-xs uppercase text-slate-500">Payment</p><p className="mt-1 font-bold text-emerald-400">PAID</p><p className="mt-1 text-xs text-slate-500">Amount hidden for social proof</p></div><div><p className="text-xs uppercase text-slate-500">Delivery status</p><span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase text-emerald-400">{p.order_status}</span></div></div></div>}<div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{p.plan_name || p.product_name || p.prop_firm || p.product_type.replaceAll("_"," ")}</p><p className="mt-1 text-sm text-slate-400">{privacyMode ? "Amount hidden" : `₦${Number(p.amount||0).toLocaleString("en-NG")}`} · {p.payment_status} · {p.order_status}</p>{p.expires_at && <p className={`mt-2 text-sm font-semibold ${Number(days)<0 ? "text-red-400" : Number(days)<=7 ? "text-amber-300" : "text-emerald-400"}`}>{Number(days)<0 ? "Expired" : `${days} days remaining`} · expires {new Date(p.expires_at).toLocaleDateString()}</p>}</div><span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase text-slate-300">{p.product_type.replaceAll("_"," ")}</span></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>viewOfflineDelivery(p)} className="rounded-lg bg-lime-400 px-3 py-2 text-xs font-black text-slate-950">View delivery</button><button type="button" onClick={()=>sendOfflineDeliveryWhatsApp(p,customer)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Send delivery on WhatsApp</button><button type="button" onClick={()=>copyOfflineDeliveryLink(p)} className="rounded-lg border border-lime-400/40 bg-lime-400/10 px-3 py-2 text-xs font-bold text-lime-300">Copy delivery link</button>{p.delivery_token && p.delivery_link_enabled !== false && <button type="button" onClick={()=>disableOfflineDeliveryLink(p)} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300">Disable link</button>}<button type="button" onClick={()=>editOfflinePurchase(p)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-bold text-white">Edit purchase</button><button type="button" onClick={()=>deleteOfflinePurchase(p)} className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">Delete purchase</button></div>{p.product_type==="tradingview" && <div className="mt-3 flex flex-wrap gap-2"><select value={p.renewal_followup_status || "not_due"} onChange={(e)=>updateOfflineRenewalStatus(p.id,e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><option value="not_due">Not due</option><option value="due">Due</option><option value="contacted">Contacted</option><option value="renewed">Renewed</option><option value="declined">Declined</option></select><button onClick={()=>openOfflineWhatsApp(customer)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold">Follow up on WhatsApp</button></div>}</div>})}</div></div>}</>; })()}</div>
        </div>
      </section>

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
                        (getVerifiedAmount(purchase) /
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
                        {displayEmail(client?.email)}
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
                        {displayAmount(purchase.currency, getVerifiedAmount(purchase))}
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
                        Order ID: {privacyMode ? maskId(purchase.id) : purchase.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[.14em] text-violet-300">Sales Data Accuracy</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-400">Customer / system recorded amount</p>
                        <p className="mt-1 font-bold text-white">{purchase.currency} {Number(purchase.amount_paid ?? 0).toLocaleString()}</p>
                      </div>
                      <label className="text-xs font-bold text-slate-300">Verified actual amount paid
                        <input type="number" min="0" value={getVerifiedAmountDraft("prop_offer_purchases", purchase)} onChange={(e)=>setVerifiedAmountDraft("prop_offer_purchases", purchase.id, e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white"/>
                      </label>
                      <label className="text-xs font-bold text-slate-300 md:col-span-2">Customer WhatsApp number
                        <div className="mt-1 flex gap-2">
                          <input value={getWhatsAppDraft(purchase.user_id, client)} onChange={(e)=>setWhatsAppDraft(purchase.user_id, e.target.value)} placeholder="e.g. 0803... or +234803..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white"/>
                          <button type="button" disabled={savingAccuracyKey===`phone:${purchase.user_id}`} onClick={()=>saveWebsiteCustomerWhatsApp(purchase.user_id, client)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Save WhatsApp</button>
                        </div>
                      </label>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <button type="button" disabled={savingAccuracyKey===`amount:prop_offer_purchases:${purchase.id}`} onClick={()=>saveVerifiedAmount("prop_offer_purchases", purchase, "amount_paid", loadPropPurchaseApprovals)} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save Verified Amount</button>
                      {purchase.admin_verified_amount !== null && purchase.admin_verified_amount !== undefined && <span className="text-xs text-emerald-300">Verified record active{purchase.admin_verified_note ? ` — ${purchase.admin_verified_note}` : ""}</span>}
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

                    <div className="mb-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[.14em] text-blue-300">Customer Delivery View</p>
                      {(() => {
                        const draft = getPropDeliveryDraft(purchase);
                        return <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <select value={draft.deliveryMethod} onChange={(e)=>updatePropDeliveryDraft(purchase,"deliveryMethod",e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white">
                            <option value="credentials">Login credentials</option>
                            <option value="claim_code">Claim code</option>
                            <option value="check_email">Check registered email</option>
                            <option value="whatsapp_instruction">WhatsApp instructions</option>
                          </select>
                          {draft.deliveryMethod==="claim_code" && <input value={draft.claimCode} onChange={(e)=>updatePropDeliveryDraft(purchase,"claimCode",e.target.value)} placeholder="Claim / delivery code" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"/>}
                          {draft.deliveryMethod==="claim_code" && <input value={draft.claimUrl} onChange={(e)=>updatePropDeliveryDraft(purchase,"claimUrl",e.target.value)} placeholder="Claim URL (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 md:col-span-2"/>}
                          {draft.deliveryMethod==="credentials" && <><input value={draft.deliveryUsername} onChange={(e)=>updatePropDeliveryDraft(purchase,"deliveryUsername",e.target.value)} placeholder="Login / account ID" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"/><input value={draft.deliveryPassword} onChange={(e)=>updatePropDeliveryDraft(purchase,"deliveryPassword",e.target.value)} placeholder="Password / access code" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"/></>}
                          <textarea value={draft.deliveryMessage} onChange={(e)=>updatePropDeliveryDraft(purchase,"deliveryMessage",e.target.value)} rows={3} placeholder="Extra customer instructions (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 md:col-span-2"/>
                          <div className="flex flex-wrap gap-2 md:col-span-2">
                            <button type="button" disabled={busy} onClick={()=>saveOnlinePropDelivery(purchase,false)} className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-200">Save Delivery</button>
                            <button type="button" disabled={busy} onClick={()=>sendOnlinePropWhatsApp(purchase,firm?.name || "Prop Firm",client)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white">Send on WhatsApp</button>
                            {!isDelivered && <button type="button" disabled={busy} onClick={()=>saveOnlinePropDelivery(purchase,true)} className="rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-black text-slate-950">Save & Mark Delivered</button>}
                          </div>
                        </div>;
                      })()}
                    </div>

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
              <select value={tvCatalogAccessType} onChange={(e) => setTvCatalogAccessType(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"><option value="individual">Individual</option><option value="co_sponsor">Co-sponsor</option></select>
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
                        {purchase.currency} {getVerifiedAmount(purchase).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[.14em] text-violet-300">Sales Data Accuracy</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div><p className="text-xs text-slate-400">Customer / system recorded amount</p><p className="mt-1 font-bold text-white">{purchase.currency} {Number(purchase.amount_paid ?? 0).toLocaleString()}</p></div>
                      <label className="text-xs font-bold text-slate-300">Verified actual amount paid<input type="number" min="0" value={getVerifiedAmountDraft("tradingview_purchases", purchase)} onChange={(e)=>setVerifiedAmountDraft("tradingview_purchases", purchase.id, e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white"/></label>
                      <label className="text-xs font-bold text-slate-300 md:col-span-2">Customer WhatsApp number<div className="mt-1 flex gap-2"><input value={getWhatsAppDraft(purchase.user_id, client)} onChange={(e)=>setWhatsAppDraft(purchase.user_id, e.target.value)} placeholder="e.g. 0803... or +234803..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white"/><button type="button" disabled={savingAccuracyKey===`phone:${purchase.user_id}`} onClick={()=>saveWebsiteCustomerWhatsApp(purchase.user_id, client)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Save WhatsApp</button></div></label>
                    </div>
                    <button type="button" disabled={savingAccuracyKey===`amount:tradingview_purchases:${purchase.id}`} onClick={()=>saveVerifiedAmount("tradingview_purchases", purchase, "amount_paid", loadTradingViewPendingDeliveries)} className="mt-3 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save Verified Amount</button>
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

                  <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">Delivery View</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Preview the exact account details before activating or sending them on WhatsApp.
                        </p>
                      </div>
                      <span className="rounded-full bg-[#c8ff00]/10 px-3 py-1 text-xs font-black text-[#c8ff00]">
                        {plan?.duration_days ?? 30} days
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div><span className="text-slate-400">Customer</span><p className="mt-1 font-bold text-white">{client ? getClientLabel(client) : purchase.user_id}</p></div>
                      <div><span className="text-slate-400">Plan</span><p className="mt-1 font-bold text-white">{plan?.name ?? "TradingView Plan"}</p></div>
                      <div><span className="text-slate-400">Login</span><p className="mt-1 break-all font-bold text-white">{draft.loginEmail || "Enter login email above"}</p></div>
                      <div><span className="text-slate-400">Password</span><p className="mt-1 break-all font-bold text-white">{draft.loginPassword || "Enter password above"}</p></div>
                    </div>
                    {draft.deliveryNote?.trim() && (
                      <div className="mt-3 border-t border-slate-800 pt-3">
                        <span className="text-xs text-slate-400">Instructions</span>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-white">{draft.deliveryNote}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => activateTradingViewPurchase(purchase)}
                      disabled={activatingTvPurchaseId === purchase.id}
                      className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold disabled:opacity-50"
                    >
                      {activatingTvPurchaseId === purchase.id
                        ? "Activating..."
                        : `Activate & Send Details (${plan?.duration_days ?? 30} Days)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => activateTradingViewPurchase(purchase, true)}
                      disabled={
                        activatingTvPurchaseId === purchase.id ||
                        !draft.loginEmail.trim() ||
                        !draft.loginPassword.trim() ||
                        !getClientWhatsAppNumber(client)
                      }
                      className="rounded-xl bg-[#c8ff00] px-6 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                      title={
                        !getClientWhatsAppNumber(client)
                          ? "This customer has no phone/WhatsApp number saved"
                          : "Activate the account and open WhatsApp with the delivery details already filled in"
                      }
                    >
                      WhatsApp Delivery Details
                    </button>
                  </div>
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

        <div className="mt-5 rounded-2xl border border-lime-400/20 bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime-300">Affiliate invitation letter</p>
              <h3 className="mt-2 text-xl font-bold text-white">Create a personalised FTH invitation</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Type the person’s name even if they are not yet registered, or select an existing affiliate. The official PDF-ready letter includes the Fidelity Traders Hub logo, commission schedule and referral details when available.
              </p>
            </div>
            <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lime-300">
              PDF + X DM ready
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-200">
              Person’s full name
              <input
                id="affiliate-invitation-name"
                type="text"
                value={invitationName}
                onChange={(e) => setInvitationName(e.target.value)}
                placeholder="e.g. Ahmad Musa"
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
            <label className="text-sm text-slate-200">
              X handle (optional)
              <input
                type="text"
                value={invitationXHandle}
                onChange={(e) => setInvitationXHandle(e.target.value)}
                placeholder="e.g. @ahmadfx"
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm text-slate-200">
            Existing affiliate (optional)
            <select
              value={invitationPartnerId}
              onChange={(e) => {
                const nextId = e.target.value;
                setInvitationPartnerId(nextId);
                const selected = referralPartners.find((partner) => partner.partner_id === nextId);
                if (selected?.display_name) setInvitationName(selected.display_name);
              }}
              className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white"
            >
              <option value="">New person / not yet an affiliate</option>
              {referralPartners.map((partner) => (
                <option key={partner.partner_id} value={partner.partner_id}>
                  {partner.display_name} {getReferralCodeForPartner(partner.partner_id) ? `— ${getReferralCodeForPartner(partner.partner_id)}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!invitationName.trim() && !invitationPartnerId}
              onClick={() => printAffiliateInvitation(referralPartners.find((partner) => partner.partner_id === invitationPartnerId))}
              className="rounded-xl bg-lime-400 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Preview / Save as PDF
            </button>
            <button
              type="button"
              disabled={!invitationName.trim() && !invitationPartnerId}
              onClick={() => copyAffiliateXMessage(referralPartners.find((partner) => partner.partner_id === invitationPartnerId))}
              className="rounded-xl border border-slate-600 bg-slate-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Copy X DM message
            </button>
            <button
              type="button"
              onClick={openXMessages}
              className="rounded-xl border border-slate-600 bg-slate-950 px-5 py-3 font-bold text-white"
            >
              Open X Messages
            </button>

            {(invitationName.trim() || invitationPartnerId) && (
              <>
                <button
                  type="button"
                  onClick={() => setInvitationPreviewOpen((current) => !current)}
                  className="rounded-xl border border-lime-400/40 bg-lime-400/10 px-5 py-3 font-bold text-lime-300"
                >
                  {invitationPreviewOpen ? "Hide preview" : "Show preview"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInvitationPreviewOpen(false);
                    window.setTimeout(() => {
                      document.getElementById("affiliate-invitation-name")?.focus();
                    }, 0);
                  }}
                  className="rounded-xl border border-slate-600 bg-slate-950 px-5 py-3 font-bold text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm("Clear this invitation draft?");
                    if (!confirmed) return;
                    setInvitationName("");
                    setInvitationXHandle("");
                    setInvitationPartnerId("");
                    setInvitationPreviewOpen(false);
                  }}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {invitationPreviewOpen && (invitationName.trim() || invitationPartnerId) && (() => {
            const partner = referralPartners.find((item) => item.partner_id === invitationPartnerId);
            const recipient = getInvitationRecipient(partner);
            const rate = getInvitationCommissionRate(partner);
            const code = partner ? getReferralCodeForPartner(partner.partner_id) : "";
            const link = partner ? getReferralLinkForPartner(partner.partner_id) : "";
            return (
              <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Letter preview</p>
                <p className="mt-3 text-lg font-bold text-white">Dear {recipient},</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We are pleased to invite you to join the Fidelity Traders Hub Affiliate Programme. The standard invitation explains our 15% commission structure, dedicated Affiliate Dashboard, NGN 10,000 minimum withdrawal, our operations since 2023 and more than 2,000 Prop Firm and TradingView orders/services fulfilled.
                </p>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p><span className="font-semibold text-slate-200">Referral code:</span> <span className="text-lime-300">{code || "Assigned after acceptance"}</span></p>
                  <p className="break-all"><span className="font-semibold text-slate-200">Referral link:</span> <span className="text-blue-300">{link || "Assigned after acceptance"}</span></p>
                </div>
                {invitationXHandle.trim() && <p className="mt-3 text-sm text-slate-300">X: <span className="text-white">{invitationXHandle.trim()}</span></p>}
                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Save the letter as PDF, click “Copy X DM message”, open X Messages, paste the message and attach the PDF to the DM.
                </p>
              </div>
            );
          })()}
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
            ["Approved Revenue", `NGN ${journalPayments.filter((item) => item.status === "confirmed").reduce((sum, item) => sum + Number(item.admin_verified_amount ?? item.amount ?? 0), 0).toLocaleString()}`],
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
                const journalClient = getClientById(payment.user_id);
                return (
                  <div key={payment.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <div className="xl:col-span-2">
                        <p className="text-xs uppercase tracking-wider text-slate-500">Client</p>
                        <p className="mt-1 font-semibold">{getJournalClientLabel(payment.user_id)}</p>
                      </div>
                      <div><p className="text-xs text-slate-500">Duration</p><p className="mt-1 font-semibold">{payment.duration_months} months</p></div>
                      <div><p className="text-xs text-slate-500">Amount</p><p className="mt-1 font-semibold">NGN {getVerifiedAmount(payment, "amount").toLocaleString()}</p></div>
                      <div><p className="text-xs text-slate-500">Reference</p><p className="mt-1 break-all font-semibold">{payment.transaction_reference || "—"}</p></div>
                      <div><p className="text-xs text-slate-500">Status</p><p className="mt-1 capitalize font-semibold">{payment.status}</p></div>
                    </div>
                    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="text-xs font-black uppercase tracking-[.14em] text-violet-300">Sales Data Accuracy</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div><p className="text-xs text-slate-400">Customer recorded amount</p><p className="mt-1 font-bold">NGN {Number(payment.amount ?? 0).toLocaleString()}</p></div>
                        <label className="text-xs font-bold text-slate-300">Verified actual amount paid<input type="number" min="0" value={getVerifiedAmountDraft("trade_journal_payments", payment, "amount")} onChange={(e)=>setVerifiedAmountDraft("trade_journal_payments", payment.id, e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white"/></label>
                        <label className="text-xs font-bold text-slate-300 md:col-span-2">Customer WhatsApp number<div className="mt-1 flex gap-2"><input value={getWhatsAppDraft(payment.user_id, journalClient)} onChange={(e)=>setWhatsAppDraft(payment.user_id, e.target.value)} placeholder="e.g. 0803... or +234803..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white"/><button type="button" disabled={savingAccuracyKey===`phone:${payment.user_id}`} onClick={()=>saveWebsiteCustomerWhatsApp(payment.user_id, journalClient)} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Save WhatsApp</button></div></label>
                      </div>
                      <button type="button" disabled={savingAccuracyKey===`amount:trade_journal_payments:${payment.id}`} onClick={()=>saveVerifiedAmount("trade_journal_payments", payment, "amount", loadTradeJournalWorkspace)} className="mt-3 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Save Verified Amount</button>
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
          --fth-muted: #d7e0e5;
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
        .fth-admin-dashboard .text-slate-400 {
          color: var(--fth-muted) !important;
        }

        .fth-admin-dashboard .text-slate-500 {
          color: #c4d0d6 !important;
        }

        .fth-admin-dashboard input,
        .fth-admin-dashboard textarea,
        .fth-admin-dashboard select {
          color: #f8fafc !important;
          font-weight: 500;
        }

        .fth-admin-dashboard input::placeholder,
        .fth-admin-dashboard textarea::placeholder {
          color: #c0cbd1 !important;
          opacity: 1 !important;
        }

        .fth-admin-dashboard p,
        .fth-admin-dashboard span,
        .fth-admin-dashboard label,
        .fth-admin-dashboard td,
        .fth-admin-dashboard th,
        .fth-admin-dashboard input,
        .fth-admin-dashboard textarea,
        .fth-admin-dashboard select,
        .fth-admin-dashboard button {
          text-rendering: optimizeLegibility;
        }

        .fth-admin-dashboard button.bg-emerald-500,
        .fth-admin-dashboard button.bg-emerald-600 {
          color: #061006 !important;
          font-weight: 800 !important;
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


        /* Strong readability override: keep Admin text crisp on dark mode */
        .fth-admin-dashboard .text-slate-300,
        .fth-admin-dashboard .text-slate-400,
        .fth-admin-dashboard .text-slate-500 {
          color: #eaf2f6 !important;
        }

        .fth-admin-dashboard input::placeholder,
        .fth-admin-dashboard textarea::placeholder {
          color: #dbe7ec !important;
          opacity: 1 !important;
        }

        .fth-admin-dashboard input,
        .fth-admin-dashboard textarea,
        .fth-admin-dashboard select {
          color: #ffffff !important;
          font-weight: 600 !important;
        }

        .fth-admin-dashboard button.bg-emerald-500,
        .fth-admin-dashboard button.bg-emerald-600,
        .fth-admin-dashboard button.bg-lime-400,
        .fth-admin-dashboard button.bg-lime-500 {
          color: #071006 !important;
          font-weight: 800 !important;
          text-shadow: none !important;
        }

        :root:not([data-theme="light"]) .fth-admin-dashboard p,
        :root:not([data-theme="light"]) .fth-admin-dashboard label {
          text-shadow: none !important;
        }

      `}</style>
    </main>
  );
}
