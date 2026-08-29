"use client";
import BrandLogo from "../BrandLogo";
import Link from "next/link";
// FINAL: independent account metrics and reusable three-layer systems.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
const split = (v: string) => v.split(/\n|,/).map(x => x.trim()).filter(Boolean);
const cash = (v: any, c = "USD") => `${c} ${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const DEFAULT_MARKETS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", "EURJPY", "GBPJPY", "AUDJPY", "XAUUSD", "XAGUSD", "NAS100", "US30", "SPX500", "BTCUSD", "ETHUSD"];
const FREE_MONTHLY_TRADE_LIMIT = 30;
const currentMonthBounds = () => {
    const now = new Date();
    return {
        start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    };
};
export default function TradeJournalWorkspace({ plan = "free" }: {
    plan?: string;
}) {
    const [userId, setUserId] = useState("");
    const [tab, setTab] = useState("overview");
    const [guide, setGuide] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [analyticsScope, setAnalyticsScope] = useState("all");
    const [analyticsPeriod, setAnalyticsPeriod] = useState("all");
    const [accounts, setAccounts] = useState<any[]>([]);
    const [systems, setSystems] = useState<any[]>([]);
    const [trades, setTrades] = useState<any[]>([]);
    const [freeMonthlyTradeCount, setFreeMonthlyTradeCount] = useState(0);
    const [busy, setBusy] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [review, setReview] = useState<any>(null);
    const [editingAccountId, setEditingAccountId] = useState("");
    const [editingSystemId, setEditingSystemId] = useState("");
    const [beforeTradeFile, setBeforeTradeFile] = useState<File | null>(null);
    const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});
    const [tradeDraftReady, setTradeDraftReady] = useState(false);
    const [account, setAccount] = useState({ name: "", account_type: "personal", prop_firm: "", account_reference: "", currency: "USD", starting_balance: "", default_risk_per_trade: "", daily_risk_limit: "", weekly_risk_limit: "", monthly_risk_limit: "", max_trades_per_day: "", max_consecutive_losses: "", trading_rules: "" });
    const [system, setSystem] = useState({ name: "", description: "", higher_timeframe: "", higher_timeframe_levels: "", confirmation_timeframe: "", confirmation_models: "", entry_timeframe: "", entry_models: "", checklist: "" });
    const [trade, setTrade] = useState({ account_id: "", system_id: "", symbol: "", direction: "buy", market_session: "", setup_name: "", higher_timeframe_bias: "", confirmation: "", entry_trigger: "", before_notes: "", entry_price: "", stop_loss_price: "", take_profit_price: "", planned_risk_percent: "", planned_risk_amount: "", planned_rrr: "", before_emotion: "", status: "open" });
    async function load(uid = userId) {
        if (!uid)
            return;
        const month = currentMonthBounds();
        const [a, s, t, o, u] = await Promise.all([
            supabase.from("journal_accounts").select("*").eq("user_id", uid).is("archived_at", null).order("created_at"),
            supabase.from("journal_systems").select("*").eq("user_id", uid).is("archived_at", null).order("created_at"),
            supabase.from("journal_trades").select("*").eq("user_id", uid).is("deleted_at", null).order("created_at", { ascending: false }),
            supabase.from("trade_journal_onboarding").select("guide_completed").eq("user_id", uid).maybeSingle(),
            supabase.from("journal_trades").select("id", { count: "exact", head: true }).eq("user_id", uid).gte("created_at", month.start).lt("created_at", month.end)
        ]);
        if (a.error || s.error || t.error || u.error)
            console.error(a.error || s.error || t.error || u.error);
        const loadedAccounts = a.data || [];
        setAccounts(loadedAccounts);
        setSelectedAccountId(current => current || loadedAccounts.find((x: any) => x.status === "active")?.id || "");
        setSystems(s.data || []);
        setTrades(t.data || []);
        setFreeMonthlyTradeCount(u.count || 0);
        if (!o.data?.guide_completed)
            setGuide(true);
        setDataLoaded(true);
    }
    useEffect(() => { (async () => { const { data } = await supabase.auth.getUser(); if (!data.user)
        return; setUserId(data.user.id); await load(data.user.id); })(); }, []);
    useEffect(() => {
        if (!userId)
            return;
        try {
            const saved = localStorage.getItem(`fth-journal-trade-draft:${userId}`);
            if (saved)
                setTrade(current => ({ ...current, ...JSON.parse(saved) }));
        }
        catch (error) {
            console.warn("Could not restore journal draft", error);
        }
        setTradeDraftReady(true);
    }, [userId]);
    useEffect(() => {
        if (!userId || !tradeDraftReady)
            return;
        localStorage.setItem(`fth-journal-trade-draft:${userId}`, JSON.stringify(trade));
    }, [trade, userId, tradeDraftReady]);
    useEffect(() => {
        let cancelled = false;
        const paths = Array.from(new Set(trades.flatMap(item => [item.before_screenshot_path, item.after_screenshot_path]).filter(Boolean))) as string[];
        if (!paths.length) {
            setScreenshotUrls({});
            return () => { cancelled = true; };
        }
        (async () => {
            const entries = await Promise.all(paths.map(async path => {
                if (/^https?:\/\//i.test(path))
                    return [path, path] as const;
                const { data } = await supabase.storage.from("trade-journal").createSignedUrl(path, 3600);
                return [path, data?.signedUrl || ""] as const;
            }));
            if (!cancelled)
                setScreenshotUrls(Object.fromEntries(entries));
        })();
        return () => { cancelled = true; };
    }, [trades]);
    const activeAccounts = accounts.filter(x => x.status === "active");
    const activeSystems = systems.filter(x => x.status === "active");
    const selectedAccount = activeAccounts.find(x => x.id === selectedAccountId) || activeAccounts[0] || null;
    const selectedSystem = activeSystems.find(x => x.id === trade.system_id) || null;
    const tradeAccount = activeAccounts.find(x => x.id === trade.account_id) || null;
    const plannedRiskMoney = tradeAccount && Number(trade.planned_risk_percent) > 0 ? Number(tradeAccount.current_balance || 0) * Number(trade.planned_risk_percent) / 100 : 0;
    useEffect(() => {
        const calculated = plannedRiskMoney > 0 ? String(Number(plannedRiskMoney.toFixed(2))) : "";
        if (trade.planned_risk_amount !== calculated)
            setTrade(current => ({ ...current, planned_risk_amount: calculated }));
    }, [plannedRiskMoney, trade.planned_risk_amount]);
    const accountTrades = selectedAccount ? trades.filter(x => x.account_id === selectedAccount.id) : [];
    const closed = accountTrades.filter(x => x.status === "closed");
    const wins = closed.filter(x => x.outcome === "win");
    const net = closed.reduce((n, x) => n + Number(x.actual_pnl || 0), 0);
    const winRate = closed.length ? wins.length / closed.length * 100 : 0;
    const avgR = closed.length ? closed.reduce((n, x) => n + Number(x.actual_r_multiple || 0), 0) / closed.length : 0;
    const adherence = closed.length ? closed.filter(x => x.rules_followed === true).length / closed.length * 100 : 0;
    const recentAccountTrades = accountTrades.slice(0, 5);
    const performanceClosed = [...closed].sort(
        (a, b) =>
            new Date(a.closed_at || a.created_at).getTime() -
            new Date(b.closed_at || b.created_at).getTime()
    );
    let runningPnl = 0;
    const performanceValues = performanceClosed.map(item => {
        runningPnl += Number(item.actual_pnl || 0);
        return runningPnl;
    });
    const performanceMin = Math.min(0, ...performanceValues);
    const performanceMax = Math.max(0, ...performanceValues);
    const performanceRange = Math.max(performanceMax - performanceMin, 1);
    const performancePoints = performanceValues.length
        ? performanceValues
              .map((value, index) => {
                  const x =
                      performanceValues.length === 1
                          ? 50
                          : (index / (performanceValues.length - 1)) * 100;
                  const y =
                      88 -
                      ((value - performanceMin) / performanceRange) * 70;
                  return `${x},${y}`;
              })
              .join(" ")
        : "";
    const analyticsCutoff = analyticsPeriod === "all" ? 0 : Date.now() - Number(analyticsPeriod) * 86400000;
    const analyticsTrades = (analyticsScope === "all" ? trades : trades.filter(x => x.account_id === analyticsScope)).filter(x => analyticsCutoff === 0 || new Date(x.closed_at || x.created_at).getTime() >= analyticsCutoff);
    const analyticsClosed = analyticsTrades.filter(x => x.status === "closed");
    const tradeR = (x: any) => x.actual_r_multiple != null ? Number(x.actual_r_multiple) : Number(x.planned_risk_amount) > 0 ? Number(x.actual_pnl || 0) / Number(x.planned_risk_amount) : 0;
    const analyticsWithR = analyticsClosed.map(x => ({ ...x, normalized_r: tradeR(x) }));
    const analyticsWins = analyticsClosed.filter(x => x.outcome === "win").length;
    const analyticsLosses = analyticsClosed.filter(x => x.outcome === "loss").length;
    const analyticsWinRate = analyticsClosed.length ? analyticsWins / analyticsClosed.length * 100 : 0;
    const analyticsLossRate = analyticsClosed.length ? analyticsLosses / analyticsClosed.length * 100 : 0;
    const analyticsAvgR = analyticsWithR.length ? analyticsWithR.reduce((n, x) => n + x.normalized_r, 0) / analyticsWithR.length : 0;
    const analyticsAdherence = analyticsClosed.length ? analyticsClosed.filter(x => x.rules_followed === true).length / analyticsClosed.length * 100 : 0;
    const winningRs = analyticsWithR.filter(x => x.normalized_r > 0).map(x => x.normalized_r);
    const losingRs = analyticsWithR.filter(x => x.normalized_r < 0).map(x => x.normalized_r);
    const averageWinR = winningRs.length ? winningRs.reduce((n, x) => n + x, 0) / winningRs.length : 0;
    const averageLossR = losingRs.length ? losingRs.reduce((n, x) => n + x, 0) / losingRs.length : 0;
    const grossWinR = winningRs.reduce((n, x) => n + x, 0);
    const grossLossR = Math.abs(losingRs.reduce((n, x) => n + x, 0));
    const profitFactorR = grossLossR > 0 ? grossWinR / grossLossR : null;
    const chronologicalR = [...analyticsWithR].sort((a, b) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
    let cumulativeR = 0, peakR = 0, maxDrawdownR = 0, currentWinStreak = 0, currentLossStreak = 0, bestWinStreak = 0, worstLossStreak = 0;
    const equityR = chronologicalR.map(x => { cumulativeR += x.normalized_r; peakR = Math.max(peakR, cumulativeR); maxDrawdownR = Math.max(maxDrawdownR, peakR - cumulativeR); if (x.normalized_r > 0) { currentWinStreak++; currentLossStreak = 0; bestWinStreak = Math.max(bestWinStreak, currentWinStreak); } else if (x.normalized_r < 0) { currentLossStreak++; currentWinStreak = 0; worstLossStreak = Math.max(worstLossStreak, currentLossStreak); } return cumulativeR; });
    const analyticsAccounts = analyticsScope === "all" ? activeAccounts : activeAccounts.filter(a => a.id === analyticsScope);
    const savedMarkets = useMemo(() => Array.from(new Set([...DEFAULT_MARKETS, ...trades.map(t => String(t.symbol || "").trim().toUpperCase()).filter(Boolean)])), [trades]);
    const moneyByCurrency = analyticsAccounts.map(a => ({ currency: a.currency, pnl: analyticsClosed.filter(t => t.account_id === a.id).reduce((n, t) => n + Number(t.actual_pnl || 0), 0) })).reduce((rows: any[], item: any) => { const found = rows.find(x => x.currency === item.currency); if (found)
        found.pnl += item.pnl;
    else
        rows.push({ ...item }); return rows; }, []);
    const groupPerformance = (field: string, label?: (value: string) => string) => Array.from(new Set(analyticsWithR.map((x: any) => String(x[field] || "Not recorded")))).map(value => { const rows = analyticsWithR.filter((x: any) => String(x[field] || "Not recorded") === value); return { name: label ? label(value) : value, count: rows.length, wins: rows.filter(x => x.outcome === "win").length, avgR: rows.length ? rows.reduce((n, x) => n + x.normalized_r, 0) / rows.length : 0 }; }).sort((a, b) => b.count - a.count);
    const bySystem = groupPerformance("system_id", value => activeSystems.find(s => s.id === value)?.name || "Unknown system");
    const byMarket = groupPerformance("symbol");
    const bySession = groupPerformance("market_session");
    const byHtfLevel = groupPerformance("higher_timeframe_level_snapshot");
    const byConfirmation = groupPerformance("confirmation_model_snapshot");
    const byEntryModel = groupPerformance("entry_model_snapshot");
    const equityMin = Math.min(0, ...equityR);
    const equityMax = Math.max(0, ...equityR);
    const equityRange = Math.max(1, equityMax - equityMin);
    const equityPoints = equityR.map((value, index) => `${equityR.length === 1 ? 100 : index / Math.max(1, equityR.length - 1) * 600},${180 - ((value - equityMin) / equityRange) * 160}`).join(" ");
    const performanceGroups = [
        { title: "Trading systems", rows: bySystem },
        { title: "Markets / pairs", rows: byMarket },
        { title: "Sessions", rows: bySession },
        { title: "Higher-timeframe levels", rows: byHtfLevel },
        { title: "Confirmation models", rows: byConfirmation },
        { title: "Entry models", rows: byEntryModel },
    ];
    function resetAccountForm() {
        setEditingAccountId("");
        setAccount({ name: "", account_type: "personal", prop_firm: "", account_reference: "", currency: "USD", starting_balance: "", default_risk_per_trade: "", daily_risk_limit: "", weekly_risk_limit: "", monthly_risk_limit: "", max_trades_per_day: "", max_consecutive_losses: "", trading_rules: "" });
    }
    function editAccount(saved: any) {
        setEditingAccountId(saved.id);
        setAccount({
            name: saved.name || "",
            account_type: saved.account_type || "personal",
            prop_firm: saved.prop_firm || "",
            account_reference: saved.account_reference || "",
            currency: saved.currency || "USD",
            starting_balance: saved.starting_balance == null ? "" : String(saved.starting_balance),
            default_risk_per_trade: saved.default_risk_per_trade == null ? "" : String(saved.default_risk_per_trade),
            daily_risk_limit: saved.daily_risk_limit == null ? "" : String(saved.daily_risk_limit),
            weekly_risk_limit: saved.weekly_risk_limit == null ? "" : String(saved.weekly_risk_limit),
            monthly_risk_limit: saved.monthly_risk_limit == null ? "" : String(saved.monthly_risk_limit),
            max_trades_per_day: saved.max_trades_per_day == null ? "" : String(saved.max_trades_per_day),
            max_consecutive_losses: saved.max_consecutive_losses == null ? "" : String(saved.max_consecutive_losses),
            trading_rules: Array.isArray(saved.trading_rules) ? saved.trading_rules.join("\n") : saved.trading_rules || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    async function saveAccount() {
        if (!account.name.trim() || Number(account.starting_balance) <= 0)
            return alert("Enter the account name and starting balance.");

        const duplicateAccount = accounts.some(saved =>
            saved.id !== editingAccountId &&
            saved.status === "active" &&
            String(saved.name || "").trim().toLowerCase() === account.name.trim().toLowerCase()
        );

        if (duplicateAccount)
            return alert("An active trading account with this name already exists. Please use a different name or edit the existing account.");

        if (plan !== "pro" && !editingAccountId && activeAccounts.length >= 1) {
            return alert("The Free Trade Journal plan allows 1 active trading account. Upgrade to Pro to manage multiple trading accounts.");
        }

        const payload = {
            user_id: userId,
            name: account.name.trim(),
            account_type: account.account_type,
            prop_firm:
                account.account_type === "prop_firm"
                    ? account.prop_firm.trim() || null
                    : null,
            account_reference: account.account_reference.trim() || null,
            currency: account.currency.toUpperCase(),
            starting_balance: Number(account.starting_balance),
            default_risk_per_trade: account.default_risk_per_trade
                ? Number(account.default_risk_per_trade)
                : null,
            daily_risk_limit: account.daily_risk_limit
                ? Number(account.daily_risk_limit)
                : null,
            weekly_risk_limit: account.weekly_risk_limit
                ? Number(account.weekly_risk_limit)
                : null,
            monthly_risk_limit: account.monthly_risk_limit
                ? Number(account.monthly_risk_limit)
                : null,
            max_trades_per_day: account.max_trades_per_day
                ? Number(account.max_trades_per_day)
                : null,
            max_consecutive_losses: account.max_consecutive_losses
                ? Number(account.max_consecutive_losses)
                : null,
            trading_rules: split(account.trading_rules)
        };

        setBusy(true);

        const { error } = editingAccountId
            ? await supabase
                .from("journal_accounts")
                .update(payload)
                .eq("id", editingAccountId)
                .eq("user_id", userId)
            : await supabase
                .from("journal_accounts")
                .insert({
                    ...payload,
                    current_balance: Number(account.starting_balance)
                });

        setBusy(false);

        if (error)
            return alert(error.message);

        resetAccountForm();
        await load();
    }
    function resetSystemForm() {
        setEditingSystemId("");
        setSystem({ name: "", description: "", higher_timeframe: "", higher_timeframe_levels: "", confirmation_timeframe: "", confirmation_models: "", entry_timeframe: "", entry_models: "", checklist: "" });
    }
    function editSystem(saved: any) {
        const asLines = (value: any) => Array.isArray(value) ? value.join("\n") : value || "";
        setEditingSystemId(saved.id);
        setSystem({
            name: saved.name || "",
            description: saved.description || "",
            higher_timeframe: saved.higher_timeframe || "",
            higher_timeframe_levels: asLines(saved.higher_timeframe_levels),
            confirmation_timeframe: saved.confirmation_timeframe || "",
            confirmation_models: asLines(saved.confirmation_models),
            entry_timeframe: saved.entry_timeframe || "",
            entry_models: asLines(saved.entry_models),
            checklist: asLines(saved.checklist),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    async function saveSystem() { if (!system.name.trim())
        return alert("Enter your trading-system name."); if (!system.higher_timeframe || !system.confirmation_timeframe || !system.entry_timeframe)
        return alert("Select all three system timeframes.");
        const duplicateSystem = systems.some(saved =>
            saved.id !== editingSystemId &&
            saved.status === "active" &&
            String(saved.name || "").trim().toLowerCase() === system.name.trim().toLowerCase()
        );
        if (duplicateSystem)
            return alert("A trading system with this name already exists. Please use a different name or archive the existing system first.");

        if (plan !== "pro" && !editingSystemId && activeSystems.length >= 1) {
            return alert("The Free Trade Journal plan allows 1 active trading system. Upgrade to Pro to create and manage multiple trading systems.");
        }

        const payload = { user_id: userId, name: system.name.trim(), description: system.description.trim() || null, higher_timeframe: system.higher_timeframe, confirmation_timeframe: system.confirmation_timeframe, entry_timeframe: system.entry_timeframe, higher_timeframe_levels: split(system.higher_timeframe_levels), confirmation_models: split(system.confirmation_models), entry_models: split(system.entry_models), checklist: split(system.checklist) };
        setBusy(true);
        const { error } = editingSystemId
            ? await supabase.from("journal_systems").update(payload).eq("id", editingSystemId).eq("user_id", userId)
            : await supabase.from("journal_systems").insert(payload);
        setBusy(false);
        if (error) return alert(error.message);
        resetSystemForm();
        await load();
    }
    async function upload(file: File, kind: string, tradeId: string) { const ext = file.name.split(".").pop() || "jpg"; const path = `${userId}/${tradeId}/${kind}-${Date.now()}.${ext}`; const { error } = await supabase.storage.from("trade-journal").upload(path, file); if (error)
        throw error; return path; }
    async function openScreenshot(path: string) {
        if (!path)
            return;
        if (/^https?:\/\//i.test(path)) {
            window.open(path, "_blank", "noopener,noreferrer");
            return;
        }
        const { data, error } = await supabase.storage.from("trade-journal").createSignedUrl(path, 300);
        if (error || !data?.signedUrl)
            return alert(`Could not open screenshot: ${error?.message || "File unavailable"}`);
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
    function validateTradeForSave() {
        const errors: string[] = [];
        const warnings: string[] = [];

        const accountForTrade = activeAccounts.find(x => x.id === trade.account_id);
        const systemForTrade = activeSystems.find(x => x.id === trade.system_id);
        const isDraft = trade.status === "draft";

        if (!accountForTrade)
            errors.push("Select an active trading account.");
        if (!trade.symbol.trim())
            errors.push("Enter the market / pair.");
        if (!systemForTrade)
            errors.push("Select an active saved trading system.");

        // Drafts may be intentionally incomplete. The browser already autosaves progress,
        // but this keeps the explicit Save as draft option useful without enforcing live-trade rules.
        if (isDraft || !accountForTrade || !systemForTrade)
            return { errors, warnings };

        const asList = (value: any) =>
            Array.isArray(value)
                ? value.map(String).map(x => x.trim()).filter(Boolean)
                : typeof value === "string"
                    ? split(value)
                    : [];

        const htfLevels = asList(systemForTrade.higher_timeframe_levels);
        const confirmations = asList(systemForTrade.confirmation_models);
        const entryModels = asList(systemForTrade.entry_models);

        if (!trade.higher_timeframe_bias)
            errors.push("Select the higher-timeframe level.");
        else if (!htfLevels.includes(trade.higher_timeframe_bias))
            errors.push("The selected higher-timeframe level does not belong to this trading system.");

        if (!trade.confirmation)
            errors.push("Select the confirmation model.");
        else if (!confirmations.includes(trade.confirmation))
            errors.push("The selected confirmation model does not belong to this trading system.");

        if (!trade.entry_trigger)
            errors.push("Select the entry model.");
        else if (!entryModels.includes(trade.entry_trigger))
            errors.push("The selected entry model does not belong to this trading system.");

        const riskPercent = trade.planned_risk_percent === "" ? null : Number(trade.planned_risk_percent);
        const hasRiskRules =
            Number(accountForTrade.default_risk_per_trade || 0) > 0 ||
            Number(accountForTrade.daily_risk_limit || 0) > 0 ||
            Number(accountForTrade.weekly_risk_limit || 0) > 0 ||
            Number(accountForTrade.monthly_risk_limit || 0) > 0;

        if (hasRiskRules && (riskPercent == null || !Number.isFinite(riskPercent) || riskPercent <= 0)) {
            errors.push("Enter a valid planned risk % so the saved risk limits can be checked.");
        } else if (riskPercent != null) {
            if (!Number.isFinite(riskPercent) || riskPercent <= 0)
                errors.push("Planned risk % must be greater than 0.");

            const normalRisk = Number(accountForTrade.default_risk_per_trade || 0);
            if (normalRisk > 0 && riskPercent > normalRisk)
                warnings.push(`Planned risk is ${riskPercent}% while your saved default risk per trade is ${normalRisk}%.`);
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const realAccountTrades = trades.filter(x =>
            x.account_id === accountForTrade.id &&
            x.status !== "draft" &&
            !x.deleted_at
        );

        const inPeriod = (row: any, start: Date) => {
            const when = new Date(row.created_at);
            return Number.isFinite(when.getTime()) && when >= start && when <= now;
        };

        const usedRisk = (start: Date) =>
            realAccountTrades
                .filter(row => inPeriod(row, start))
                .reduce((sum, row) => sum + Math.max(0, Number(row.planned_risk_percent || 0)), 0);

        if (riskPercent != null && Number.isFinite(riskPercent) && riskPercent > 0) {
            const dailyLimit = Number(accountForTrade.daily_risk_limit || 0);
            const weeklyLimit = Number(accountForTrade.weekly_risk_limit || 0);
            const monthlyLimit = Number(accountForTrade.monthly_risk_limit || 0);

            const dailyUsed = usedRisk(startOfDay);
            const weeklyUsed = usedRisk(startOfWeek);
            const monthlyUsed = usedRisk(startOfMonth);

            if (dailyLimit > 0 && dailyUsed + riskPercent > dailyLimit)
                warnings.push(`Daily risk limit would be exceeded: ${dailyUsed.toFixed(2)}% already used + ${riskPercent}% planned, limit ${dailyLimit}%.`);

            if (weeklyLimit > 0 && weeklyUsed + riskPercent > weeklyLimit)
                warnings.push(`Weekly risk limit would be exceeded: ${weeklyUsed.toFixed(2)}% already used + ${riskPercent}% planned, limit ${weeklyLimit}%.`);

            if (monthlyLimit > 0 && monthlyUsed + riskPercent > monthlyLimit)
                warnings.push(`Monthly risk limit would be exceeded: ${monthlyUsed.toFixed(2)}% already used + ${riskPercent}% planned, limit ${monthlyLimit}%.`);
        }

        const maxTradesToday = Number(accountForTrade.max_trades_per_day || 0);
        if (maxTradesToday > 0) {
            const tradesToday = realAccountTrades.filter(row => inPeriod(row, startOfDay)).length;
            if (tradesToday >= maxTradesToday)
                warnings.push(`Maximum trades per day reached: ${tradesToday} of ${maxTradesToday}.`);
        }

        const stopAfterLosses = Number(accountForTrade.max_consecutive_losses || 0);
        if (stopAfterLosses > 0) {
            const recentClosed = realAccountTrades
                .filter(x => x.status === "closed")
                .sort((a, b) =>
                    new Date(b.closed_at || b.created_at).getTime() -
                    new Date(a.closed_at || a.created_at).getTime()
                );

            let consecutiveLosses = 0;
            for (const row of recentClosed) {
                if (row.outcome === "loss")
                    consecutiveLosses++;
                else
                    break;
            }

            if (consecutiveLosses >= stopAfterLosses)
                warnings.push(`Your stop-after-losses rule is active: ${consecutiveLosses} consecutive losses, limit ${stopAfterLosses}.`);
        }

        const entry = trade.entry_price === "" ? null : Number(trade.entry_price);
        const stop = trade.stop_loss_price === "" ? null : Number(trade.stop_loss_price);
        const target = trade.take_profit_price === "" ? null : Number(trade.take_profit_price);

        for (const [label, value] of [["Entry price", entry], ["Stop loss", stop], ["Take profit", target]] as const) {
            if (value != null && (!Number.isFinite(value) || value <= 0))
                errors.push(`${label} must be a positive number when entered.`);
        }

        if (entry != null && stop != null && target != null &&
            Number.isFinite(entry) && Number.isFinite(stop) && Number.isFinite(target)) {
            if (trade.direction === "buy" && !(stop < entry && entry < target))
                errors.push("For a Buy trade, Stop Loss must be below Entry and Take Profit must be above Entry.");
            if (trade.direction === "sell" && !(target < entry && entry < stop))
                errors.push("For a Sell trade, Take Profit must be below Entry and Stop Loss must be above Entry.");
        }

        if (trade.planned_rrr !== "") {
            const rrr = Number(trade.planned_rrr);
            if (!Number.isFinite(rrr) || rrr <= 0)
                errors.push("Planned R:R must be greater than 0 when entered.");
        }

        return { errors, warnings };
    }

    async function saveTrade() {
        if (plan !== "pro") {
            const month = currentMonthBounds();
            const { count, error: usageError } = await supabase
                .from("journal_trades")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .gte("created_at", month.start)
                .lt("created_at", month.end);
            if (usageError) return alert(`Could not verify your free monthly journal allowance: ${usageError.message}`);
            const used = count || 0;
            setFreeMonthlyTradeCount(used);
            if (used >= FREE_MONTHLY_TRADE_LIMIT)
                return alert("You have completed your 30 free journal entries for this month. Upgrade to Pro for unlimited journaling, or continue next month when your free allowance resets.");
        }
        const validation = validateTradeForSave();

        if (validation.errors.length) {
            alert(`Please correct the following before saving:\n\n• ${validation.errors.join("\n• ")}`);
            return;
        }

        if (validation.warnings.length) {
            const proceed = confirm(
                `This trade conflicts with your saved risk plan:\n\n• ${validation.warnings.join("\n• ")}\n\nSave the trade anyway?`
            );
            if (!proceed)
                return;
        }

        setBusy(true);
        const n = (v: string) => v === "" ? null : Number(v);

        const { data: created, error } = await supabase
            .from("journal_trades")
            .insert({
                user_id: userId,
                account_id: trade.account_id,
                system_id: trade.system_id,
                symbol: trade.symbol.trim().toUpperCase(),
                direction: trade.direction,
                market_session: trade.market_session || null,
                setup_name: trade.entry_trigger || null,
                higher_timeframe_bias: trade.higher_timeframe_bias || null,
                confirmation: trade.confirmation || null,
                entry_trigger: trade.entry_trigger || null,
                higher_timeframe_level_snapshot: trade.higher_timeframe_bias || null,
                confirmation_model_snapshot: trade.confirmation || null,
                entry_model_snapshot: trade.entry_trigger || null,
                before_notes: trade.before_notes || null,
                entry_price: n(trade.entry_price),
                stop_loss_price: n(trade.stop_loss_price),
                take_profit_price: n(trade.take_profit_price),
                planned_risk_percent: n(trade.planned_risk_percent),
                planned_risk_amount: n(trade.planned_risk_amount),
                planned_rrr: n(trade.planned_rrr),
                before_emotion: trade.before_emotion || null,
                status: trade.status
            })
            .select("id")
            .single();

        if (error) {
            setBusy(false);
            return alert(error.message);
        }

        if (beforeTradeFile && created?.id) {
            try {
                const beforePath = await upload(beforeTradeFile, "before", created.id);
                const { error: imageError } = await supabase
                    .from("journal_trades")
                    .update({ before_screenshot_path: beforePath })
                    .eq("id", created.id);

                if (imageError)
                    throw imageError;
            } catch (e: any) {
                setBusy(false);
                return alert(`Trade was saved, but the before screenshot failed: ${e.message}`);
            }
        }

        localStorage.removeItem(`fth-journal-trade-draft:${userId}`);
        setBusy(false);
        setBeforeTradeFile(null);
        setTrade({
            ...trade,
            symbol: "",
            setup_name: "",
            higher_timeframe_bias: "",
            confirmation: "",
            entry_trigger: "",
            before_notes: "",
            entry_price: "",
            stop_loss_price: "",
            take_profit_price: "",
            planned_risk_percent: "",
            planned_risk_amount: "",
            planned_rrr: ""
        });
        await load();
        setTab("journal");
    }

    async function saveReview() { if (!review)
        return; const pnl = Number(review.actual_pnl); if (!Number.isFinite(pnl))
        return alert("Enter the final money result. Use a minus sign for a loss, for example -5500."); setBusy(true); let afterPath = review.after_screenshot_path || null; try {
        if (review.afterFile)
            afterPath = await upload(review.afterFile, "after", review.id);
    }
    catch (e: any) {
        setBusy(false);
        return alert(e.message);
    } const outcome = pnl > 0 ? "win" : pnl < 0 ? "loss" : "breakeven"; const { error } = await supabase.from("journal_trades").update({ status: "closed", outcome, actual_pnl: pnl, actual_r_multiple: review.actual_r_multiple === "" ? null : Number(review.actual_r_multiple), after_notes: review.after_notes || null, mistakes: review.mistakes || null, lessons: review.lessons || null, after_emotion: review.after_emotion || null, discipline_score: review.discipline_score === "" ? null : Number(review.discipline_score), rules_followed: review.rules_followed, after_screenshot_path: afterPath, closed_at: new Date().toISOString() }).eq("id", review.id); setBusy(false); if (error)
        return alert(error.message); setReview(null); await load(); }
    async function archive(table: string, id: string, status = "archived") {
        if (!confirm("Archive this item? It will disappear from your active Journal, but its historical data will remain safe."))
            return;
        const { error } = await supabase.from(table).update({ status, archived_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
        if (error)
            return alert(error.message);
        await load();
    }
    async function archiveTrade(id: string) {
        if (!confirm("Archive this trade? It will disappear from the active Journal, but can remain in the database for historical safety."))
            return;
        const { error } = await supabase.from("journal_trades").update({ deleted_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
        if (error)
            return alert(error.message);
        await load();
    }
    async function deletePermanently(table: string, id: string, label: string) {
        if (!confirm(`Permanently delete this ${label}? This cannot be undone.`))
            return;
        if (!confirm(`FINAL WARNING: Are you absolutely sure you want to permanently delete this ${label}?`))
            return;
        const { error } = await supabase.from(table).delete().eq("id", id).eq("user_id", userId);
        if (error)
            return alert(`Could not permanently delete this ${label}: ${error.message}`);
        await load();
    }
    async function finishGuide() { await supabase.from("trade_journal_onboarding").upsert({ user_id: userId, guide_completed: true, completed_at: new Date().toISOString() }); setGuide(false); }
    const input = "min-w-0 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:font-medium placeholder:text-[var(--muted)] placeholder:opacity-100 outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20";
    const accessBadge = (tier: "free" | "pro") =>
        tier === "pro"
            ? "rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--warning)]"
            : "rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--success)]";
    return <main className="fth-trade-journal fth-unified-board min-h-screen text-[var(--foreground)]">
<div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
<aside className="fth-app-sidebar border-b border-[var(--border)] lg:min-h-screen lg:border-b-0 lg:border-r">
  <div className="sticky top-0 flex min-h-screen flex-col p-5">
    <Link href="/dashboard" className="fth-sidebar-brand flex min-h-14 items-center" aria-label="Fidelity Traders Hub">
      <BrandLogo priority />
    </Link>

    <nav className="mt-8 space-y-1.5 text-sm">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
        <span aria-hidden="true">⌂</span> Dashboard
      </Link>
      <Link href="/marketplace" className="flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--foreground)]">
        <span aria-hidden="true">▦</span> Marketplace
      </Link>
      <button type="button" onClick={() => setTab("overview")} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${tab === "overview" ? "fth-nav-active font-bold" : "text-[var(--foreground)]"}`}>
        <span aria-hidden="true">◎</span> Journal Overview
      </button>
      <button type="button" onClick={() => setTab("setup")} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${tab === "setup" ? "fth-nav-active font-bold" : "text-[var(--foreground)]"}`}>
        <span aria-hidden="true">⚙</span> Account & System
      </button>
      <button type="button" onClick={() => setTab("log")} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${tab === "log" ? "fth-nav-active font-bold" : "text-[var(--foreground)]"}`}>
        <span aria-hidden="true">＋</span> Log a Trade
      </button>
      <button type="button" onClick={() => setTab("journal")} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${tab === "journal" ? "fth-nav-active font-bold" : "text-[var(--foreground)]"}`}>
        <span aria-hidden="true">▤</span> Trade Journal
      </button>
      <button type="button" onClick={() => setTab("analytics")} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${tab === "analytics" ? "fth-nav-active font-bold" : "text-[var(--foreground)]"}`}>
        <span aria-hidden="true">↗</span> Analytics
      </button>
    </nav>

    <div className="mt-auto pt-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted-2)]">Journal access</p>
        <p className="mt-2 text-sm font-black">{plan === "pro" ? "Fidelity Journal Pro" : "Fidelity Journal Free"}</p>
      </div>
      <button type="button" onClick={() => setGuide(true)} className="mt-3 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-black">
        Open Journal Guide
      </button>
    </div>
  </div>
</aside>

<div className="min-w-0">
<header className="fth-topbar sticky top-0 z-30 border-b border-[var(--border)] px-5 py-4 sm:px-8">
  <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
    <div>
      <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">Fidelity Trade Journal</p>
      <h1 className="mt-1 text-xl font-black sm:text-2xl">Trading Workspace</h1>
    </div>
    <div className="flex items-center gap-3">
      <span className={accessBadge(plan === "pro" ? "pro" : "free")}>{plan === "pro" ? "PRO ACCESS" : "FREE ACCESS"}</span>
      <button onClick={() => setTab("log")} className="fth-primary-button rounded-xl px-4 py-2.5 text-sm font-black">+ Log Trade</button>
    </div>
  </div>
</header>

<div className="mx-auto max-w-[1440px] p-5 sm:p-8">
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">Your trading operating system</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Plan. Execute. Review. Improve.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Manage accounts and risk rules, document every trade, review execution evidence and turn completed trades into useful analytics.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-2)]">Active accounts</p>
            <p className="mt-1 text-2xl font-black">{activeAccounts.length}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted-2)]">Trades logged</p>
            <p className="mt-1 text-2xl font-black">{trades.length}</p>
          </div>
        </div>
      </div>
    </section>

    <nav className="mt-5 grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 sm:grid-cols-5 lg:hidden">{[["overview", "Overview"], ["setup", "Account & System"], ["log", "Log a Trade"], ["journal", "Journal"], ["analytics", "Analytics"]].map(([id, label], index) => <button key={id} onClick={() => setTab(id)} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${tab === id ? "fth-nav-active" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"}`}>{index === 0 ? label : `${index}. ${label}`}</button>)}</nav>

    {tab === "overview" && <section className="mt-6 space-y-5">
      {!dataLoaded ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)]">
          Loading your journal workspace…
        </div>
      ) : (
        <>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl shadow-black/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">Start here</p>
                <h3 className="mt-1 text-lg font-black">What do you want to do?</h3>
              </div>
              <p className="text-xs text-[var(--muted)]">Plan → execute → review → improve</p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Log a new trade", "Record the plan before entry", "log", "bg-blue-500/10 text-[var(--brand-primary)]", "01"],
                ["Account & system", "Update risk rules and setups", "setup", "bg-emerald-500/10 text-[var(--success)]", "02"],
                ["Review journal", "Study open and closed trades", "journal", "bg-amber-500/10 text-[var(--warning)]", "03"],
                ["View analytics", "Find patterns in completed trades", "analytics", "bg-purple-500/10 text-[var(--brand-secondary)]", "04"],
              ].map(([title, helper, target, tone, number]) => (
                <button
                  key={String(title)}
                  type="button"
                  onClick={() => setTab(String(target))}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand-primary)]"
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${tone}`}>
                      {number}
                    </span>
                    <span className="text-[var(--muted)] transition group-hover:text-[var(--foreground)]">→</span>
                  </div>
                  <p className="mt-4 text-sm font-black">{title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{helper}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.55fr_.65fr]">
            <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#0d1d33] via-[#0b192b] to-[#091522] p-6 shadow-xl shadow-black/10 sm:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.6)]" />
                    <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--brand-primary)]">
                      Performance command center
                    </p>
                  </div>
                  <h2 className="mt-3 text-2xl font-black">
                    {selectedAccount ? selectedAccount.name : "Set up your first trading account"}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Live account metrics, journal discipline and realized performance in one view.
                  </p>
                </div>

                {activeAccounts.length > 0 && (
                  <select
                    className={`${input} min-w-[250px] border-[var(--border-strong)] bg-[var(--surface-2)]`}
                    value={selectedAccount?.id || ""}
                    onChange={e => setSelectedAccountId(e.target.value)}
                  >
                    {activeAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} · {cash(a.current_balance, a.currency)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Balance", cash(selectedAccount?.current_balance || 0, selectedAccount?.currency || "USD"), "Current account equity", "text-[var(--foreground)]"],
                  ["Closed trades", closed.length, "Completed trades", "text-[var(--foreground)]"],
                  ["Win rate", `${winRate.toFixed(1)}%`, "Winning closed trades", winRate >= 50 ? "text-[var(--success)]" : "text-[var(--foreground)]"],
                  ["Net P&L", cash(net, selectedAccount?.currency || "USD"), "Realized performance", net > 0 ? "text-[var(--success)]" : net < 0 ? "text-[var(--danger)]" : "text-[var(--foreground)]"],
                  ["Rule adherence", `${adherence.toFixed(1)}%`, "Execution discipline", adherence >= 80 ? "text-[var(--success)]" : "text-[var(--foreground)]"],
                ].map(([l, v, helper, tone]) => (
                  <div key={String(l)} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--muted)]">{l}</p>
                    <p className={`mt-2 text-xl font-black ${tone}`}>{v}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[var(--muted-2)]">{helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.08] via-[var(--surface)] to-[#091522] p-6 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-[var(--warning)]">
                  {plan === "pro" ? "Pro workspace" : "Free workspace"}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg">◎</span>
              </div>

              <h3 className="mt-6 text-xl font-black">Today’s focus</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Prepare the account. Respect the risk plan. Record the evidence. Review the actual outcome.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  ["Risk plan ready", selectedAccount ? "Review limits before entry" : "Create an account first"],
                  ["Journal current", accountTrades.length ? `${accountTrades.length} trade${accountTrades.length === 1 ? "" : "s"} recorded` : "No trades logged yet"],
                  ["Review discipline", closed.length ? `${closed.length} closed trade${closed.length === 1 ? "" : "s"} available` : "Close trades to build analytics"],
                ].map(([title, helper]) => (
                  <div key={title} className="flex gap-3 rounded-xl border border-white/5 bg-black/15 p-3">
                    <span className="mt-0.5 text-[var(--success)]">✓</span>
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)]">{title}</p>
                      <p className="mt-1 text-[11px] leading-4 text-[var(--muted)]">{helper}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTab("log")}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#4e64f4] to-[#7081ff] px-5 py-3 font-black shadow-lg shadow-indigo-950/30 hover:brightness-110"
              >
                + Log a new trade
              </button>
            </aside>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.45fr_.72fr]">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">
                    Performance overview
                  </p>
                  <h3 className="mt-2 text-xl font-black">Cumulative realized P&L</h3>
                </div>
                <button
                  onClick={() => setTab("analytics")}
                  className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-2 text-xs font-bold text-[var(--muted)] hover:border-[var(--brand-primary)] hover:text-[var(--foreground)]"
                >
                  Open analytics →
                </button>
              </div>

              <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[var(--muted)]">Net closed-trade P&L</p>
                    <p className={`mt-1 text-2xl font-black ${net > 0 ? "text-[var(--success)]" : net < 0 ? "text-[var(--danger)]" : "text-[var(--foreground)]"}`}>
                      {cash(net, selectedAccount?.currency || "USD")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted)]">Average R</p>
                    <p className="mt-1 text-lg font-black">{avgR.toFixed(2)}R</p>
                  </div>
                </div>

                <div className="mt-5 h-56 overflow-hidden rounded-xl border border-white/5 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:100%_25%,12.5%_100%] p-3">
                  {performancePoints ? (
                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="h-full w-full overflow-visible"
                    >
                      <defs>
                        <linearGradient id="journalLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6075ff" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke="url(#journalLine)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        points={performancePoints}
                      />
                    </svg>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <span className="text-3xl text-[var(--muted-2)]">⌁</span>
                      <p className="mt-3 text-sm font-bold text-[var(--muted)]">Your performance chart starts here</p>
                      <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--muted-2)]">
                        Close and review trades to build a real cumulative performance curve.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">Recent activity</p>
                  <h3 className="mt-2 text-xl font-black">Recent trades</h3>
                </div>
                <button onClick={() => setTab("journal")} className="text-xs font-bold text-[var(--brand-primary)]">
                  View all →
                </button>
              </div>

              {recentAccountTrades.length ? (
                <div className="mt-5 space-y-2">
                  {recentAccountTrades.map(item => {
                    const pnl = Number(item.actual_pnl || 0);
                    const isClosed = item.status === "closed";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isClosed) setReview(item);
                          setTab("journal");
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-left transition hover:border-[var(--brand-primary)]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${item.direction === "sell" ? "bg-red-400" : "bg-emerald-400"}`} />
                            <p className="truncate text-sm font-black">{item.symbol || "Trade"}</p>
                          </div>
                          <p className="mt-1 truncate text-[11px] text-[var(--muted)]">
                            {item.market_session || "Session not set"} · {item.setup_name || "No setup label"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className={`text-xs font-black ${isClosed ? pnl > 0 ? "text-[var(--success)]" : pnl < 0 ? "text-[var(--danger)]" : "text-[var(--muted)]" : "text-[var(--warning)]"}`}>
                            {isClosed ? cash(pnl, selectedAccount?.currency || "USD") : "OPEN"}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--muted-2)]">
                            {item.direction || ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-6 text-center">
                  <p className="text-sm font-bold">No trade activity yet</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    Your newest planned, open and closed trades will appear here.
                  </p>
                </div>
              )}
            </aside>
          </div>

        </>
      )}
    </section>}

    {tab === "setup" && <section className="mt-6 grid gap-5 2xl:grid-cols-2">
<div className="self-start rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
<h2 className="text-xl font-bold">{editingAccountId ? "Edit trading account" : "Add a trading account"}</h2>
<p className="mt-1 text-sm text-[var(--muted)]">This is the only account-creation form. Personal and prop accounts keep separate balances, limits, rules and analytics.</p>
<div className="mt-4 grid gap-3 sm:grid-cols-2">
<input className={input} placeholder="Account name *" value={account.name} onChange={e => setAccount({ ...account, name: e.target.value })}/>
<select className={input} value={account.account_type} onChange={e => setAccount({ ...account, account_type: e.target.value })}>
<option value="personal">Personal account</option>
<option value="prop_firm">Prop-firm account</option>
</select>{account.account_type === "prop_firm" && <input className={input} placeholder="Prop firm" value={account.prop_firm} onChange={e => setAccount({ ...account, prop_firm: e.target.value })}/>}<input className={input} placeholder="Account reference (optional)" value={account.account_reference} onChange={e => setAccount({ ...account, account_reference: e.target.value })}/>
<input className={input} type="number" placeholder="Starting balance *" value={account.starting_balance} onChange={e => setAccount({ ...account, starting_balance: e.target.value })}/>
<select className={input} value={account.currency} onChange={e => setAccount({ ...account, currency: e.target.value })}>
<option value="USD">USD — US Dollar</option>
<option value="NGN">NGN — Nigerian Naira</option>
</select>
<input className={input} type="number" placeholder="Default risk per trade %" value={account.default_risk_per_trade} onChange={e => setAccount({ ...account, default_risk_per_trade: e.target.value })}/>
<input className={input} type="number" placeholder="Daily risk limit %" value={account.daily_risk_limit} onChange={e => setAccount({ ...account, daily_risk_limit: e.target.value })}/>
<input className={input} type="number" placeholder="Weekly risk limit %" value={account.weekly_risk_limit} onChange={e => setAccount({ ...account, weekly_risk_limit: e.target.value })}/>
<input className={input} type="number" placeholder="Monthly risk limit %" value={account.monthly_risk_limit} onChange={e => setAccount({ ...account, monthly_risk_limit: e.target.value })}/>
<input className={input} type="number" placeholder="Maximum trades per day" value={account.max_trades_per_day} onChange={e => setAccount({ ...account, max_trades_per_day: e.target.value })}/>
<input className={input} type="number" placeholder="Stop after consecutive losses" value={account.max_consecutive_losses} onChange={e => setAccount({ ...account, max_consecutive_losses: e.target.value })}/>
<textarea className={`${input} sm:col-span-2`} rows={4} placeholder="Personal trading rules — one per line" value={account.trading_rules} onChange={e => setAccount({ ...account, trading_rules: e.target.value })}/>
</div>
<div className="mt-4 flex flex-wrap gap-3">
<button disabled={busy} onClick={saveAccount} className="fth-primary-button rounded-xl px-5 py-3 font-black disabled:opacity-50">{editingAccountId ? "Update account & risk plan" : "Save account & risk plan"}</button>
{editingAccountId && <button type="button" onClick={resetAccountForm} className="rounded-xl border border-[var(--border-strong)] px-5 py-3 font-black text-[var(--muted)] hover:text-[var(--foreground)]">Cancel edit</button>}
</div>
<div className="mt-5 space-y-2">{accounts.map(a => <div key={a.id} className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-3">
<div>
<p className="font-semibold">{a.name}</p>
<p className="text-xs text-[var(--muted)]">{a.account_type.replace("_", " ")} · {cash(a.current_balance, a.currency)} · {a.status}</p>
</div>{a.status === "active" && <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => editAccount(a)} className="text-xs font-bold text-[var(--brand-primary)]">Edit</button><button type="button" onClick={() => archive("journal_accounts", a.id)} className="text-xs font-bold text-[var(--warning)]">Archive</button><button type="button" onClick={() => deletePermanently("journal_accounts", a.id, "trading account")} className="text-xs font-bold text-[var(--danger)]">Delete permanently</button></div>}</div>)}</div>
</div>
      <div className="self-start rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
<h2 className="text-xl font-bold">{editingSystemId ? "Edit trading system" : "Independent trading system"}</h2>
<p className="mt-1 text-sm text-[var(--muted)]">Build the reusable libraries once. Account, pair and session belong only to the real trade.</p>
<datalist id="journal-timeframes">{["MONTHLY", "WEEKLY", "DAILY", "H12", "H8", "H6", "H4", "H2", "H1", "M45", "M30", "M15", "M10", "M5", "M3", "M1"].map(x => <option key={x} value={x}/>)}</datalist>
<div className="mt-4 grid gap-3 sm:grid-cols-2">
<input className={input} placeholder="System name *" value={system.name} onChange={e => setSystem({ ...system, name: e.target.value })}/>
<textarea className={`${input} sm:col-span-2`} placeholder="System description" value={system.description} onChange={e => setSystem({ ...system, description: e.target.value })}/>
<input className={input} list="journal-timeframes" placeholder="Higher timeframe — select or type *" value={system.higher_timeframe} onChange={e => setSystem({ ...system, higher_timeframe: e.target.value.toUpperCase() })}/>
<textarea className={input} rows={3} placeholder="HTF key levels — one per line" value={system.higher_timeframe_levels} onChange={e => setSystem({ ...system, higher_timeframe_levels: e.target.value })}/>
<input className={input} list="journal-timeframes" placeholder="Confirmation timeframe — select or type *" value={system.confirmation_timeframe} onChange={e => setSystem({ ...system, confirmation_timeframe: e.target.value.toUpperCase() })}/>
<textarea className={input} rows={3} placeholder="Confirmation models — one per line" value={system.confirmation_models} onChange={e => setSystem({ ...system, confirmation_models: e.target.value })}/>
<input className={input} list="journal-timeframes" placeholder="Entry timeframe — select or type *" value={system.entry_timeframe} onChange={e => setSystem({ ...system, entry_timeframe: e.target.value.toUpperCase() })}/>
<textarea className={input} rows={3} placeholder="Entry models — one per line" value={system.entry_models} onChange={e => setSystem({ ...system, entry_models: e.target.value })}/>
<textarea className={`${input} sm:col-span-2`} rows={3} placeholder="Optional checklist — one per line" value={system.checklist} onChange={e => setSystem({ ...system, checklist: e.target.value })}/>
</div>
<p className="mt-4 rounded-xl bg-blue-500/10 p-3 text-sm text-[var(--brand-primary)]">Timeframes are flexible: choose a common value or type your own. The saved libraries will become dropdown selections during Log a Trade.</p>
<div className="mt-4 flex flex-wrap gap-3">
<button disabled={busy} onClick={saveSystem} className="fth-primary-button rounded-xl px-5 py-3 font-black disabled:opacity-50">{editingSystemId ? "Update reusable system" : "Save reusable system"}</button>
{editingSystemId && <button type="button" onClick={resetSystemForm} className="rounded-xl border border-[var(--border-strong)] px-5 py-3 font-black text-[var(--muted)] hover:text-[var(--foreground)]">Cancel edit</button>}
</div>
<div className="mt-5 space-y-2">{systems.map(s => <div key={s.id} className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] p-3">
<div>
<p className="font-semibold">{s.name}</p>
<p className="text-xs text-[var(--muted)]">{s.higher_timeframe || "—"} → {s.confirmation_timeframe || "—"} → {s.entry_timeframe || "—"}</p>
</div>{s.status === "active" && <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => editSystem(s)} className="text-xs font-bold text-[var(--brand-primary)]">Edit</button><button type="button" onClick={() => archive("journal_systems", s.id)} className="text-xs font-bold text-[var(--warning)]">Archive</button><button type="button" onClick={() => deletePermanently("journal_systems", s.id, "trading system")} className="text-xs font-bold text-[var(--danger)]">Delete permanently</button></div>}</div>)}</div>
</div>
</section>}

    {tab === "log" && <section className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
<h2 className="text-xl font-bold">Log a Trade — before entry</h2>
<p className="mt-1 text-sm text-[var(--muted)]">Select first; type only what is unique to this trade. Saved system choices appear only after a system is selected.</p>
{plan !== "pro" && <div className="mt-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4"><div className="flex items-center justify-between gap-3 text-sm"><strong>Free monthly journal allowance</strong><span className={freeMonthlyTradeCount >= FREE_MONTHLY_TRADE_LIMIT ? "font-black text-[var(--danger)]" : "font-black text-[var(--brand-primary)]"}>{Math.min(freeMonthlyTradeCount, FREE_MONTHLY_TRADE_LIMIT)} / {FREE_MONTHLY_TRADE_LIMIT} used</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[var(--brand-primary)] transition-all" style={{ width: `${Math.min(100, freeMonthlyTradeCount / FREE_MONTHLY_TRADE_LIMIT * 100)}%` }}/></div><p className="mt-2 text-xs text-[var(--muted)]">Both before-trade and after-trade screenshots are included. Existing trades remain available after the monthly limit is reached.</p></div>}
{!activeAccounts.length ? <button onClick={() => setTab("setup")} className="fth-primary-button mt-4 rounded-xl px-5 py-3 font-black">Add account first</button> : !activeSystems.length ? <button onClick={() => setTab("setup")} className="fth-primary-button mt-4 rounded-xl px-5 py-3 font-black">Build system first</button> : <>
<datalist id="journal-markets">{savedMarkets.map(x => <option key={x} value={x}/>)}</datalist>
<datalist id="journal-rrr">{["0.5", "1", "1.5", "2", "2.5", "3", "4", "5"].map(x => <option key={x} value={x}/>)}</datalist>
<div className="mt-5 grid gap-3 md:grid-cols-3">
<select className={input} value={trade.account_id} onChange={e => { const a = activeAccounts.find(x => x.id === e.target.value); setTrade({ ...trade, account_id: e.target.value, planned_risk_percent: a?.default_risk_per_trade == null ? trade.planned_risk_percent : String(a.default_risk_per_trade) }); }}>
<option value="">Select account *</option>{activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
<select className={input} value={trade.system_id} onChange={e => setTrade({ ...trade, system_id: e.target.value, higher_timeframe_bias: "", confirmation: "", entry_trigger: "" })}>
<option value="">Select trading system *</option>{activeSystems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
<div><input className={`${input} w-full`} list="journal-markets" placeholder="Market / pair — select or type *" value={trade.symbol} onChange={e => setTrade({ ...trade, symbol: e.target.value.toUpperCase() })}/><p className="mt-1 px-1 text-xs text-[var(--muted-2)]">Type a new pair once. After the trade is saved, it joins your reusable pair list.</p></div>
<select className={input} value={trade.direction} onChange={e => setTrade({ ...trade, direction: e.target.value })}>
<option value="buy">Buy</option>
<option value="sell">Sell</option>
</select>
{tradeAccount && <div className="md:col-span-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
<div className="flex flex-wrap items-start justify-between gap-3">
<div>
<p className="text-xs font-bold uppercase tracking-wide text-cyan-300">Selected account</p>
<h3 className="mt-1 text-lg font-bold">{tradeAccount.name}</h3>
<p className="mt-1 text-sm text-[var(--muted)]">{tradeAccount.account_type?.replace?.("_", " ") || "trading account"}{tradeAccount.prop_firm ? ` · ${tradeAccount.prop_firm}` : ""}</p>
</div>
<span className={accessBadge("free")}>ACCOUNT CONTEXT</span>
</div>
<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
<div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-xs text-[var(--muted-2)]">Account size</p><p className="mt-1 font-bold">{cash(tradeAccount.starting_balance || 0, tradeAccount.currency)}</p></div>
<div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-xs text-[var(--muted-2)]">Current balance</p><p className="mt-1 font-bold">{cash(tradeAccount.current_balance || 0, tradeAccount.currency)}</p></div>
<div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-xs text-[var(--muted-2)]">Default risk / trade</p><p className="mt-1 font-bold">{tradeAccount.default_risk_per_trade == null ? "Not set" : `${Number(tradeAccount.default_risk_per_trade)}%`}</p></div>
<div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-xs text-[var(--muted-2)]">Daily risk limit</p><p className="mt-1 font-bold">{tradeAccount.daily_risk_limit == null ? "Not set" : `${Number(tradeAccount.daily_risk_limit)}%`}</p></div>
</div>
</div>}
<select className={input} value={trade.market_session} onChange={e => setTrade({ ...trade, market_session: e.target.value })}>
<option value="">Select session (optional)</option>
<option>Asia</option>
<option>London</option>
<option>New York</option>
<option>London/New York overlap</option>
<option>Swing / no session</option>
</select>
<select className={input} value={trade.before_emotion} onChange={e => setTrade({ ...trade, before_emotion: e.target.value })}>
<option value="">Emotion before trade (optional)</option>
<option>Calm</option>
<option>Focused</option>
<option>Confident</option>
<option>Patient</option>
<option>Fearful</option>
<option>Anxious</option>
<option>Impatient</option>
<option>FOMO</option>
<option>Revenge mindset</option>
<option>Tired</option>
</select>{selectedSystem && <>
<div className="md:col-span-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-[var(--brand-primary)]">
<strong>{selectedSystem.name}</strong> · {selectedSystem.higher_timeframe} → {selectedSystem.confirmation_timeframe} → {selectedSystem.entry_timeframe}</div>
<select className={input} value={trade.higher_timeframe_bias} onChange={e => setTrade({ ...trade, higher_timeframe_bias: e.target.value })}>
<option value="">Select {selectedSystem.higher_timeframe} key level *</option>{(selectedSystem.higher_timeframe_levels || []).map((x: string) => <option key={x}>{x}</option>)}</select>
<select className={input} value={trade.confirmation} onChange={e => setTrade({ ...trade, confirmation: e.target.value })}>
<option value="">Select {selectedSystem.confirmation_timeframe} confirmation *</option>{(selectedSystem.confirmation_models || []).map((x: string) => <option key={x}>{x}</option>)}</select>
<select className={input} value={trade.entry_trigger} onChange={e => setTrade({ ...trade, entry_trigger: e.target.value })}>
<option value="">Select {selectedSystem.entry_timeframe} entry model *</option>{(selectedSystem.entry_models || []).map((x: string) => <option key={x}>{x}</option>)}</select>
</>}<div className="md:col-span-3 grid gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 sm:grid-cols-2 lg:grid-cols-3"><label className="block"><span className="mb-2 block text-xs font-bold text-[var(--foreground)]">Risk per trade (%)</span><input className={input} type="number" min="0" step="0.01" placeholder="Enter risk %" value={trade.planned_risk_percent} onChange={e => setTrade({ ...trade, planned_risk_percent: e.target.value })}/></label><div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-sm"><p className="text-xs text-[var(--muted-2)]">Calculated risk value</p><p className="mt-1 font-bold text-[var(--foreground)]">{plannedRiskMoney > 0 ? cash(plannedRiskMoney, tradeAccount?.currency || "USD") : `Enter risk % to calculate ${tradeAccount?.currency || "USD"}`}</p></div><label className="block"><span className="mb-2 block text-xs font-bold text-[var(--foreground)]">Planned risk-to-reward</span><input className={input} list="journal-rrr" type="number" placeholder="Planned R:R — select or type" value={trade.planned_rrr} onChange={e => setTrade({ ...trade, planned_rrr: e.target.value })}/></label></div><details className="md:col-span-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)]"><summary className="cursor-pointer px-4 py-3 font-semibold text-[var(--foreground)]">Advanced trade details — optional</summary><div className="grid gap-3 border-t border-[var(--border)] p-4 sm:grid-cols-2 lg:grid-cols-3"><input className={input} type="number" placeholder="Entry price" value={trade.entry_price} onChange={e => setTrade({ ...trade, entry_price: e.target.value })}/><input className={input} type="number" placeholder="Stop loss" value={trade.stop_loss_price} onChange={e => setTrade({ ...trade, stop_loss_price: e.target.value })}/><input className={input} type="number" placeholder="Take profit" value={trade.take_profit_price} onChange={e => setTrade({ ...trade, take_profit_price: e.target.value })}/></div></details>
<select className={input} value={trade.status} onChange={e => setTrade({ ...trade, status: e.target.value })}>
<option value="open">Log as open trade</option>
<option value="draft">Save as draft</option>
</select>
<textarea className={`${input} md:col-span-3`} rows={3} placeholder="Before-trade plan and reason (optional)" value={trade.before_notes} onChange={e => setTrade({ ...trade, before_notes: e.target.value })}/>
<label className={`${input} md:col-span-3 block text-[var(--foreground)]`}><span className="mb-2 flex items-center justify-between gap-3"><span>Before-trade chart screenshot</span><span className={accessBadge(plan === "pro" ? "pro" : "free")}>{plan === "pro" ? "PRO" : "FREE"}</span></span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setBeforeTradeFile(e.target.files?.[0] || null)} className="mt-2 block w-full"/><span className="mt-2 block text-xs text-[var(--muted-2)]">Attach the chart exactly as it appeared before entry.</span></label>
</div>
<button disabled={busy || (plan !== "pro" && freeMonthlyTradeCount >= FREE_MONTHLY_TRADE_LIMIT)} onClick={saveTrade} className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50">{plan !== "pro" && freeMonthlyTradeCount >= FREE_MONTHLY_TRADE_LIMIT ? "Monthly free limit reached" : trade.status === "draft" ? "Save draft" : "Log trade"}</button>
{tradeDraftReady && <span className="ml-3 text-xs text-[var(--muted-2)]">Form progress is saved automatically on this device.</span>}
</>}</section>}

    {tab === "journal" && <section className="mt-6">
<div className="flex items-end justify-between">
<div>
<h2 className="text-2xl font-bold">Journal history</h2>
<p className="text-sm text-[var(--muted)]">After a trade ends, use the blue button on its card to enter the actual money won or lost and attach the after-trade chart.</p>
</div>
</div>
<div className="mt-4 space-y-3">{trades.length === 0 ? <p className="rounded-2xl bg-[var(--surface)] p-6 text-[var(--muted)]">No trades logged yet.</p> : trades.map(t => { const a = accounts.find(x => x.id === t.account_id); const s = systems.find(x => x.id === t.system_id); return <div key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
<div className="flex flex-wrap items-start justify-between gap-4">
<div>
<p className="text-xs uppercase text-[var(--muted-2)]">{a?.name || "Account"} · {s?.name || "No system"}</p>
<h3 className="mt-1 text-lg font-bold">{t.symbol} · {t.direction.toUpperCase()}</h3>
<p className="mt-1 text-sm text-[var(--muted)]">{new Date(t.created_at).toLocaleString()} · {t.status}</p>
</div>
<div className="text-right">
<p className={`text-xl font-bold ${Number(t.actual_pnl) > 0 ? "text-[var(--success)]" : Number(t.actual_pnl) < 0 ? "text-[var(--danger)]" : ""}`}>{t.status === "closed" ? cash(t.actual_pnl, a?.currency) : "—"}</p>
<p className="text-sm text-[var(--muted)]">{t.actual_pnl_percent == null ? "" : `${Number(t.actual_pnl_percent).toFixed(2)}%`}</p>
</div>
</div>
<details className="mt-5 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)]">
<summary className="cursor-pointer px-4 py-3 font-semibold text-[var(--brand-primary)]">View full trade report</summary>
<div className="border-t border-[var(--border)] p-4">
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
{[["Account", a?.name || "—"], ["Account type", a?.account_type?.replace?.("_", " ") || "—"], ["System", s?.name || "—"], ["Session", t.market_session || "Not recorded"], ["Market", t.symbol || "—"], ["Direction", t.direction?.toUpperCase?.() || "—"], ["Status", t.status || "—"], ["Outcome", t.outcome?.toUpperCase?.() || (t.status === "closed" ? "BREAKEVEN" : "PENDING")]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><p className="text-xs uppercase tracking-wide text-[var(--muted-2)]">{label}</p><p className="mt-1 font-semibold capitalize">{value}</p></div>)}
</div>
<div className="mt-4 grid gap-4 lg:grid-cols-3">
<div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-primary)]">Higher-timeframe context</p><p className="mt-2 text-sm text-[var(--muted)]">{s?.higher_timeframe || "HTF"}</p><p className="mt-1 font-semibold">{t.higher_timeframe_level_snapshot || t.higher_timeframe_bias || "Not recorded"}</p></div>
<div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-secondary)]">Confirmation</p><p className="mt-2 text-sm text-[var(--muted)]">{s?.confirmation_timeframe || "Confirmation timeframe"}</p><p className="mt-1 font-semibold">{t.confirmation_model_snapshot || t.confirmation || "Not recorded"}</p></div>
<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"><p className="text-xs font-bold uppercase tracking-wide text-[var(--success)]">Entry model</p><p className="mt-2 text-sm text-[var(--muted)]">{s?.entry_timeframe || "Entry timeframe"}</p><p className="mt-1 font-semibold">{t.entry_model_snapshot || t.entry_trigger || t.setup_name || "Not recorded"}</p></div>
</div>
<div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
{[["Entry price", t.entry_price ?? "Not recorded"], ["Stop loss", t.stop_loss_price ?? "Not recorded"], ["Take profit", t.take_profit_price ?? "Not recorded"], ["Planned R:R", t.planned_rrr == null ? "Not recorded" : `${t.planned_rrr}R`], ["Planned risk", t.planned_risk_percent == null ? "Not recorded" : `${t.planned_risk_percent}%`], ["Final money result", t.status === "closed" ? cash(t.actual_pnl, a?.currency) : "Pending"], ["Final percentage", t.actual_pnl_percent == null ? "Pending" : `${Number(t.actual_pnl_percent).toFixed(2)}%`], ["Actual R", t.actual_r_multiple == null ? "Not recorded" : `${Number(t.actual_r_multiple).toFixed(2)}R`]].map(([label, value]) => <div key={label} className="rounded-xl bg-[var(--surface)] p-3"><p className="text-xs text-[var(--muted-2)]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
</div>
<div className="mt-4 grid gap-4 lg:grid-cols-2">
<div className="rounded-xl border border-[var(--border)] p-4"><p className="text-xs font-bold uppercase text-[var(--muted-2)]">Before the trade</p><p className="mt-2 text-sm"><span className="text-[var(--muted)]">Emotion:</span> {t.before_emotion || "Not recorded"}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{t.before_notes || "No before-trade note."}</p></div>
<div className="rounded-xl border border-[var(--border)] p-4"><p className="text-xs font-bold uppercase text-[var(--muted-2)]">After the trade</p><p className="mt-2 text-sm"><span className="text-[var(--muted)]">Emotion:</span> {t.after_emotion || "Not recorded"}</p><p className="mt-2 text-sm"><span className="text-[var(--muted)]">Rules followed:</span> {t.rules_followed == null ? "Not recorded" : t.rules_followed ? "Yes" : "No"}</p><p className="mt-2 text-sm"><span className="text-[var(--muted)]">Discipline:</span> {t.discipline_score == null ? "Not recorded" : `${t.discipline_score}/10`}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{t.after_notes || "No after-trade review."}</p></div>
</div>
<div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="rounded-xl bg-red-500/5 p-4"><p className="text-xs font-bold uppercase text-[var(--danger)]">Mistakes</p><p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{t.mistakes || "None recorded."}</p></div><div className="rounded-xl bg-emerald-500/5 p-4"><p className="text-xs font-bold uppercase text-[var(--success)]">Lessons</p><p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">{t.lessons || "None recorded."}</p></div></div>
<div className="mt-5 grid gap-4 lg:grid-cols-2">
<div className="overflow-hidden rounded-xl border border-blue-500/30 bg-blue-500/5"><div className="flex items-center justify-between px-4 py-3"><div><p className="font-bold text-[var(--brand-primary)]">Before Trade</p><p className="text-xs text-[var(--muted)]">Chart captured before entry</p></div>{t.before_screenshot_path && <button type="button" onClick={() => openScreenshot(t.before_screenshot_path)} className="rounded-lg bg-[#b7ff00] px-3 py-2 text-sm font-black text-[#07111f] shadow-sm">Open full size</button>}</div>{t.before_screenshot_path ? screenshotUrls[t.before_screenshot_path] ? <button type="button" onClick={() => openScreenshot(t.before_screenshot_path)} className="block w-full bg-[var(--surface-2)]"><img src={screenshotUrls[t.before_screenshot_path]} alt={`Before-trade chart for ${t.symbol}`} className="h-64 w-full object-contain sm:h-80"/></button> : <div className="flex h-64 items-center justify-center text-sm text-[var(--foreground)]">Loading before-trade chart…</div> : <div className="flex h-44 items-center justify-center px-4 text-center text-sm text-[var(--muted)]">No before-trade screenshot was attached.</div>}</div>
<div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5"><div className="flex items-center justify-between px-4 py-3"><div><p className="font-bold text-[var(--success)]">After Trade</p><p className="text-xs text-[var(--muted)]">Chart captured after closing</p></div>{t.after_screenshot_path && <button type="button" onClick={() => openScreenshot(t.after_screenshot_path)} className="rounded-lg bg-[#b7ff00] px-3 py-2 text-sm font-black text-[#07111f] shadow-sm">Open full size</button>}</div>{t.after_screenshot_path ? screenshotUrls[t.after_screenshot_path] ? <button type="button" onClick={() => openScreenshot(t.after_screenshot_path)} className="block w-full bg-[var(--surface-2)]"><img src={screenshotUrls[t.after_screenshot_path]} alt={`After-trade chart for ${t.symbol}`} className="h-64 w-full object-contain sm:h-80"/></button> : <div className="flex h-64 items-center justify-center text-sm text-[var(--foreground)]">Loading after-trade chart…</div> : <div className="flex h-44 items-center justify-center px-4 text-center text-sm text-[var(--muted)]">No after-trade screenshot yet. Use “Add final result &amp; after screenshot”.</div>}</div>
</div>
</div>
</details>
<div className="mt-4 flex flex-wrap gap-2">
<button onClick={() => setReview({ ...t, actual_pnl: t.actual_pnl ?? "", actual_r_multiple: t.actual_r_multiple ?? "", discipline_score: t.discipline_score ?? "", rules_followed: t.rules_followed ?? true, beforeFile: null, afterFile: null })} className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold">{t.status === "closed" ? "Update final result & screenshot" : "Add final result & after screenshot"}</button>
{t.before_screenshot_path && <button onClick={() => openScreenshot(t.before_screenshot_path)} className="rounded-lg border border-blue-500/40 px-3 py-2 text-sm text-[var(--brand-primary)]">View before chart</button>}
{t.after_screenshot_path && <button onClick={() => openScreenshot(t.after_screenshot_path)} className="rounded-lg border border-emerald-500/40 px-3 py-2 text-sm text-[var(--success)]">View after chart</button>}
<button type="button" onClick={() => archiveTrade(t.id)} className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm font-bold text-[var(--warning)]">Archive</button>
<button type="button" onClick={() => deletePermanently("journal_trades", t.id, "trade")} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-bold text-[var(--danger)]">Delete permanently</button>
</div>
</div>; })}</div>
</section>}

    {tab === "analytics" && <section className="mt-6 space-y-5">
<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
<div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[var(--brand-primary)]">Analytics access</p><p className="mt-1 text-sm text-[var(--muted)]">{plan === "pro" ? "Full performance breakdowns are unlocked." : "Core results are included. Expanded breakdowns are Pro."}</p></div><span className={accessBadge(plan === "pro" ? "pro" : "free")}>{plan === "pro" ? "PRO" : "FREE"}</span></div>
</div>
<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
<div>
<p className="text-xs font-bold uppercase text-[var(--brand-primary)]">Analytics scope</p>
<p className="text-sm text-[var(--muted)]">Choose one account or combine all accounts for overall process statistics.</p>
</div>
<div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
<select className={input} value={analyticsScope} onChange={e => setAnalyticsScope(e.target.value)}>
<option value="all">All accounts — overall data</option>{activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
<select className={input} value={analyticsPeriod} onChange={e => setAnalyticsPeriod(e.target.value)}>
<option value="all">All history</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
</select>
</div>
</div>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{[["Closed trades", analyticsClosed.length], ["Wins", analyticsWins], ["Losses", analyticsLosses], ["Win rate", `${analyticsWinRate.toFixed(1)}%`], ["Loss rate", `${analyticsLossRate.toFixed(1)}%`], ["Average R", `${analyticsAvgR.toFixed(2)}R`]].map(([l, v]) => <div key={l} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
<p className="text-xs text-[var(--muted-2)]">{l}</p>
<p className="mt-2 text-2xl font-bold">{v}</p>
</div>)}</div>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{[
["Profit factor", profitFactorR == null ? "—" : profitFactorR.toFixed(2)],
["Average win", `${averageWinR.toFixed(2)}R`],
["Average loss", `${averageLossR.toFixed(2)}R`],
["Max drawdown", `${maxDrawdownR.toFixed(2)}R`],
["Best win streak", bestWinStreak],
["Worst loss streak", worstLossStreak],
["Rule adherence", `${analyticsAdherence.toFixed(1)}%`],
].map(([l, v]) => <div key={l} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><p className="text-xs text-[var(--muted-2)]">{l}</p><p className="mt-2 text-xl font-bold">{v}</p></div>)}</div>
<div className="grid gap-5 lg:grid-cols-2">
<div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
<h2 className="text-xl font-bold">Performance curve</h2>
<p className="mt-1 text-sm text-[var(--muted)]">Cumulative R in closing order. R allows fair comparison across different account sizes and currencies.</p>
{equityR.length ? <div className="mt-5 rounded-xl bg-[var(--surface-2)] p-3"><svg viewBox="0 0 600 200" className="h-52 w-full" role="img" aria-label="Cumulative R performance curve"><line x1="0" x2="600" y1={180 - ((0 - equityMin) / equityRange) * 160} y2={180 - ((0 - equityMin) / equityRange) * 160} stroke="currentColor" className="text-slate-700" strokeDasharray="6 6"/><polyline points={equityPoints} fill="none" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="flex justify-between text-xs text-[var(--muted-2)]"><span>First closed trade</span><strong className={cumulativeR >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>{cumulativeR.toFixed(2)}R total</strong><span>Latest</span></div></div> : <p className="mt-5 rounded-xl bg-[var(--surface-2)] p-5 text-sm text-[var(--muted)]">Close trades with actual results to build this curve.</p>}
</div>
<div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
<h2 className="text-xl font-bold">Net P&amp;L by currency</h2>
<p className="mt-1 text-sm text-[var(--muted)]">Different currencies are never added into a misleading total.</p>
<div className="mt-4 space-y-2">{moneyByCurrency.map(x => <div key={x.currency} className="flex justify-between rounded-xl bg-[var(--surface-2)] p-3">
<strong>{x.currency}</strong>
<span className={x.pnl >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>{cash(x.pnl, x.currency)}</span>
</div>)}</div>
</div>
</div>
{plan === "pro" && <div className="grid gap-5 lg:grid-cols-2">{performanceGroups.map(group => <div key={group.title} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
<h2 className="text-lg font-bold">{group.title}</h2>
<div className="mt-4 space-y-2">{group.rows.length ? group.rows.slice(0, 10).map(row => <div key={row.name} className="grid gap-2 rounded-xl bg-[var(--surface-2)] p-3 text-sm sm:grid-cols-[1.4fr_.6fr_.7fr_.7fr]">
<strong className="break-words">{row.name}</strong><span>{row.count} trades</span><span>{row.count ? `${(row.wins / row.count * 100).toFixed(1)}% wins` : "—"}</span><span className={row.avgR >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>{row.avgR.toFixed(2)}R avg</span>
</div>) : <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">No completed trade data yet.</p>}</div>
</div>)}</div>}
{plan !== "pro" && <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-[var(--warning)]">Expanded performance breakdowns</h3><p className="mt-1 text-sm text-[var(--muted)]">Trading-system, market, session, HTF, confirmation and entry-model breakdowns are available on Pro.</p></div><span className={accessBadge("pro")}>PRO</span></div></div>}
</section>}
  </div>

  {review && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4">
<div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-6">
<div className="flex justify-between">
<div>
<p className="text-xs uppercase text-[var(--brand-primary)]">After the trade</p>
<h2 className="mt-1 text-2xl font-bold">Close and review {review.symbol}</h2>
</div>
<button onClick={() => setReview(null)}>Close</button>
</div>
<div className="mt-5 grid gap-4 sm:grid-cols-2">
<div className="rounded-xl border border-[var(--brand-primary)]/30 bg-[var(--surface-2)] px-4 py-4 text-sm leading-6 text-[var(--foreground)] sm:col-span-2"><strong className="text-[var(--brand-primary)]">Enter the actual money result below.</strong><br/>Use a positive number for a win (example: 5500), a negative number for a loss (example: -5500), or 0 for breakeven. The system determines the outcome and percentage automatically.</div>
<label className="text-sm font-semibold text-[var(--foreground)] sm:col-span-2">Actual money won or lost *
<input className={`${input} mt-2 w-full`} type="number" step="any" placeholder="Win: 5500   Loss: -5500   Breakeven: 0" value={review.actual_pnl} onChange={e => setReview({ ...review, actual_pnl: e.target.value })}/>
</label>
<label className="text-sm text-[var(--foreground)]">Actual R multiple (optional)<input className={`${input} mt-2 w-full`} type="number" step="any" placeholder="Example: 2 or -1" value={review.actual_r_multiple} onChange={e => setReview({ ...review, actual_r_multiple: e.target.value })}/></label>
<label className="text-sm text-[var(--foreground)]">Discipline score (optional)<input className={`${input} mt-2 w-full`} type="number" min="1" max="10" placeholder="1–10" value={review.discipline_score} onChange={e => setReview({ ...review, discipline_score: e.target.value })}/></label>
<label className="text-sm text-[var(--foreground)] sm:col-span-2">Emotion after trade (optional)<input className={`${input} mt-2 w-full`} placeholder="How did you feel after the trade?" value={review.after_emotion || ""} onChange={e => setReview({ ...review, after_emotion: e.target.value })}/></label>
<label className={`${input} flex items-center gap-3`}>
<input type="checkbox" checked={review.rules_followed === true} onChange={e => setReview({ ...review, rules_followed: e.target.checked })}/> I followed my rules</label>
<textarea className={`${input} sm:col-span-2`} placeholder="After-trade review" value={review.after_notes || ""} onChange={e => setReview({ ...review, after_notes: e.target.value })}/>
<textarea className={input} placeholder="Mistakes" value={review.mistakes || ""} onChange={e => setReview({ ...review, mistakes: e.target.value })}/>
<textarea className={input} placeholder="Lessons" value={review.lessons || ""} onChange={e => setReview({ ...review, lessons: e.target.value })}/>
<div className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] p-3 text-sm text-[var(--foreground)]"><strong className="text-[var(--brand-primary)]">Before-trade evidence</strong><p className="mt-2 text-[var(--muted)]">The before-trade screenshot was saved when this trade was logged.</p></div>
<label className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm font-semibold text-[var(--success)]">After-trade chart screenshot
<span className="mt-1 block text-xs font-normal text-[var(--muted)]">Included on Free and Pro. Upload the chart after the trade has closed. PNG, JPG or WebP.</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setReview({ ...review, afterFile: e.target.files?.[0] || null })} className="mt-3 block w-full text-[var(--foreground)]"/>
</label></div>
<p className="mt-4 text-sm text-[var(--muted)]">The system calculates the final percentage from the actual money result and the account balance before this trade.</p>
<button disabled={busy} onClick={saveReview} className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold">Save final review</button>
</div>
</div>}

  {guide && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4">
<div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-blue-500/30 bg-[var(--surface)] p-6">
<p className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">Journal navigation guide</p>
<h2 className="mt-2 text-2xl font-bold">One clear method from setup to improvement</h2>
<p className="mt-2 text-sm text-[var(--muted)]">Setup is completed once. Daily trade logging becomes mostly selecting and clicking.</p>
<div className="mt-5 space-y-3">{[["1", "Add a trading account", "Create a personal or prop account and save its balance, risk limits and personal rules."], ["2", "Build an independent system", "Save the HTF key levels, confirmation models and entry models. The system is not tied to an account, pair or session."], ["3", "Log a trade quickly", "Choose the real account, pair, session and system, then click the saved three-layer choices."], ["4", "Close and review", "Enter the actual money won or lost, psychology, mistakes and lessons on the same trade record."], ["5", "Study trustworthy analytics", "The Journal calculates the real percentage and shows which systems and behaviours actually work."]].map(([n, h, p]) => <div key={n} className="flex gap-4 rounded-xl bg-[var(--surface-2)] p-4">
<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">{n}</span>
<div>
<h3 className="font-bold">{h}</h3>
<p className="mt-1 text-sm text-[var(--muted)]">{p}</p>
</div>
</div>)}</div>
<button onClick={() => { finishGuide(); setTab("setup"); }} className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-bold">Start by adding an account</button>
</div>
</div>}
  </div>
</div>
</main>;
}
