"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type TestType = "backtest" | "forward_test";
type ResearchTrade = {
  id: string;
  session_id: string | null;
  symbol: string;
  direction: string;
  entry_time: string;
  exit_time: string | null;
  entry_price: number | null;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  exit_price: number | null;
  risk_percent: number | null;
  outcome: string | null;
  trade_status: string;
  pnl: number | null;
  r_multiple: number | null;
  setup_type: string | null;
  structure_timeframe: string | null;
  setup_notes: string | null;
  tags: string[] | null;
};
type LegacySession = { id: string; research_type: TestType; strategy_id: string; symbol: string; timeframe: string | null };
type LegacyStrategy = { id: string; name: string };
type Evidence = { id: string; trade_id: string; evidence_type: string; file_path: string; caption: string | null };
type Props = { userId: string };

const TEST_TAG = "__research_type:";
const inputClass = "mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-950 placeholder:text-gray-500 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 [&>option]:bg-white [&>option]:text-gray-950";
const cardClass = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5";
const blankForm = {
  symbol: "GBPUSD", strategy: "", direction: "buy", timeframe: "H4", risk: "1",
  entry: "", stop: "", target: "", entryTime: "", exitTime: "", outcome: "win",
  rMultiple: "", pnl: "", notes: "",
};
const numOrNull = (value: string) => value.trim() === "" ? null : Number(value);

function getTestType(trade: ResearchTrade, sessions: LegacySession[]): TestType {
  const marker = (trade.tags || []).find((tag) => tag.startsWith(TEST_TAG));
  if (marker === `${TEST_TAG}forward_test`) return "forward_test";
  if (marker === `${TEST_TAG}backtest`) return "backtest";
  const oldSession = sessions.find((session) => session.id === trade.session_id);
  return oldSession?.research_type || "backtest";
}

function getStrategyName(trade: ResearchTrade, sessions: LegacySession[], strategies: LegacyStrategy[]) {
  if (trade.setup_type?.trim()) return trade.setup_type.trim();
  const session = sessions.find((item) => item.id === trade.session_id);
  return strategies.find((item) => item.id === session?.strategy_id)?.name || "Unspecified";
}

function getTimeframe(trade: ResearchTrade, sessions: LegacySession[]) {
  return trade.structure_timeframe || sessions.find((item) => item.id === trade.session_id)?.timeframe || "Unspecified";
}

async function optimizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) { bitmap.close(); return file; }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "chart"}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function ResearchLab({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<"backtest" | "forward_test" | "analytics">("backtest");
  const activeType: TestType = activeTab === "forward_test" ? "forward_test" : "backtest";
  const [trades, setTrades] = useState<ResearchTrade[]>([]);
  const [sessions, setSessions] = useState<LegacySession[]>([]);
  const [strategies, setStrategies] = useState<LegacyStrategy[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [beforeScreenshot, setBeforeScreenshot] = useState<File | null>(null);
  const [afterScreenshot, setAfterScreenshot] = useState<File | null>(null);
  const [selectedTrade, setSelectedTrade] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("entry");
  const [evidenceCaption, setEvidenceCaption] = useState("");
  const [notice, setNotice] = useState("");
  const [filterSymbol, setFilterSymbol] = useState("all");

  const loadResearch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [tradeResult, evidenceResult, sessionResult, strategyResult] = await Promise.all([
      supabase.from("research_trades").select("*").eq("user_id", userId).order("entry_time", { ascending: false }),
      supabase.from("research_evidence").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      // Read-only compatibility for older records. New trades do not create sessions.
      supabase.from("research_sessions").select("id,research_type,strategy_id,symbol,timeframe").eq("user_id", userId),
      supabase.from("research_strategies").select("id,name").eq("user_id", userId),
    ]);
    const firstError = tradeResult.error || evidenceResult.error;
    if (firstError) alert(firstError.message);
    if (!tradeResult.error) setTrades((tradeResult.data || []) as ResearchTrade[]);
    if (!evidenceResult.error) setEvidence((evidenceResult.data || []) as Evidence[]);
    if (!sessionResult.error) setSessions((sessionResult.data || []) as LegacySession[]);
    if (!strategyResult.error) setStrategies((strategyResult.data || []) as LegacyStrategy[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void loadResearch(); }, [loadResearch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paths: string[] = Array.from(new Set(evidence.map((item) => item.file_path).filter((path): path is string => Boolean(path))));
      const entries = await Promise.all(paths.map(async (path) => {
        if (/^https?:\/\//i.test(path)) return [path, path] as const;
        const { data } = await supabase.storage.from("trade-journal").createSignedUrl(path, 3600);
        return [path, data?.signedUrl || ""] as const;
      }));
      if (!cancelled) setEvidenceUrls(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [evidence]);

  const typeTrades = useMemo(() => trades.filter((trade) => getTestType(trade, sessions) === activeType), [trades, sessions, activeType]);
  const allClosedTrades = useMemo(() => trades.filter((trade) => trade.trade_status === "closed" && trade.r_multiple !== null), [trades]);
  const closedTrades = typeTrades.filter((trade) => trade.trade_status === "closed" && trade.r_multiple !== null);
  const wins = closedTrades.filter((trade) => Number(trade.r_multiple) > 0);
  const losses = closedTrades.filter((trade) => Number(trade.r_multiple) < 0);
  const breakeven = closedTrades.filter((trade) => Number(trade.r_multiple) === 0);
  const netR = closedTrades.reduce((sum, trade) => sum + Number(trade.r_multiple || 0), 0);
  const winRate = closedTrades.length ? wins.length / closedTrades.length * 100 : 0;
  const symbols = Array.from(new Set(typeTrades.map((trade) => trade.symbol))).sort();
  const visibleTrades = filterSymbol === "all" ? typeTrades : typeTrades.filter((trade) => trade.symbol === filterSymbol);

  async function saveTrade() {
    if (!form.symbol.trim() || !form.strategy.trim() || !form.entryTime) {
      alert("Please enter the market pair, strategy and entry date/time.");
      return;
    }
    if (form.rMultiple.trim() === "") {
      alert("Please enter the trade result in R, for example 2, -1 or 0.");
      return;
    }
    if ([beforeScreenshot, afterScreenshot].some((file) => file && !file.type.startsWith("image/"))) {
      alert("Please choose valid image files for the before/after screenshots.");
      return;
    }
    setSaving(true);
    setNotice("");
    const userTags = [] as string[];
    const tags = [...userTags, `${TEST_TAG}${activeType}`];
    const r = Number(form.rMultiple);
    const outcome = r > 0 ? "win" : r < 0 ? "loss" : "breakeven";
    const payload = {
      user_id: userId,
      // session_id remains null for new records: no session is created or required.
      session_id: null,
      symbol: form.symbol.trim().toUpperCase(),
      direction: form.direction,
      entry_time: new Date(form.entryTime).toISOString(),
      exit_time: form.exitTime ? new Date(form.exitTime).toISOString() : null,
      entry_price: numOrNull(form.entry),
      stop_loss_price: numOrNull(form.stop),
      take_profit_price: numOrNull(form.target),
      exit_price: null,
      risk_percent: numOrNull(form.risk),
      outcome,
      trade_status: "closed",
      pnl: numOrNull(form.pnl),
      r_multiple: r,
      setup_type: form.strategy.trim(),
      structure_timeframe: form.timeframe.trim() || null,
      setup_notes: form.notes.trim() || null,
      tags,
    };
    const { data, error } = await supabase.from("research_trades").insert(payload).select("id").single();
    if (error) { setSaving(false); alert(error.message); return; }

    const screenshots = [
      { file: beforeScreenshot, type: "before", caption: "Before entry" },
      { file: afterScreenshot, type: "after", caption: "After exit" },
    ].filter((item): item is { file: File; type: string; caption: string } => Boolean(item.file));

    for (const item of screenshots) {
      const imageFile = await optimizeImage(item.file);
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${userId}/research/${data.id}/${Date.now()}-${item.type}-${safeName}`;
      const upload = await supabase.storage.from("trade-journal").upload(path, imageFile, {
        upsert: false, contentType: imageFile.type, cacheControl: "3600",
      });
      if (upload.error) {
        setSaving(false);
        setNotice(`Trade saved, but ${item.caption.toLowerCase()} image upload failed: ${upload.error.message}. You can add it below.`);
        await loadResearch();
        return;
      }
      const evidenceInsert = await supabase.from("research_evidence").insert({
        user_id: userId, session_id: null, trade_id: data.id,
        evidence_type: item.type, file_path: path, caption: item.caption,
      });
      if (evidenceInsert.error) {
        await supabase.storage.from("trade-journal").remove([path]);
        setSaving(false);
        setNotice(`Trade saved, but ${item.caption.toLowerCase()} image record failed: ${evidenceInsert.error.message}. You can add it below.`);
        await loadResearch();
        return;
      }
    }

    setForm({ ...blankForm, symbol: form.symbol.trim().toUpperCase() });
    setBeforeScreenshot(null);
    setAfterScreenshot(null);
    setSaving(false);
    setNotice("Trade saved successfully.");
    await loadResearch();
  }

  async function uploadEvidence() {
    if (!selectedTrade || !evidenceFile) return;
    if (!evidenceFile.type.startsWith("image/")) { setNotice("Choose a PNG, JPG or WEBP image."); return; }
    setSaving(true);
    const imageFile = await optimizeImage(evidenceFile);
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/research/${selectedTrade}/${Date.now()}-${safeName}`;
    const upload = await supabase.storage.from("trade-journal").upload(path, imageFile, { upsert: false, contentType: imageFile.type, cacheControl: "3600" });
    if (upload.error) { setSaving(false); setNotice(`Screenshot upload failed: ${upload.error.message}`); return; }
    const { error } = await supabase.from("research_evidence").insert({
      user_id: userId, session_id: null, trade_id: selectedTrade,
      evidence_type: evidenceType, file_path: path, caption: evidenceCaption.trim() || null,
    });
    if (error) {
      await supabase.storage.from("trade-journal").remove([path]);
      setSaving(false);
      setNotice(`Screenshot record failed: ${error.message}`);
      return;
    }
    setEvidenceFile(null);
    setEvidenceCaption("");
    setSaving(false);
    setNotice("Screenshot uploaded successfully.");
    await loadResearch();
  }

  function exportCsv() {
    const columns = ["symbol", "setup_type", "structure_timeframe", "direction", "entry_time", "entry_price", "stop_loss_price", "take_profit_price", "risk_percent", "outcome", "r_multiple", "pnl"] as const;
    const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [columns.join(","), ...visibleTrades.map((trade) => columns.map((column) => escape(trade[column])).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeType === "backtest" ? "backtesting" : "forward-testing"}-trades.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const groupStats = (rowsToGroup: ResearchTrade[], keyFor: (trade: ResearchTrade) => string) => {
    const groups = new Map<string, ResearchTrade[]>();
    for (const trade of rowsToGroup) {
      const key = keyFor(trade) || "Unspecified";
      groups.set(key, [...(groups.get(key) || []), trade]);
    }
    return Array.from(groups.entries()).map(([label, rows]) => {
      const groupWins = rows.filter((row) => Number(row.r_multiple) > 0).length;
      const resultR = rows.reduce((sum, row) => sum + Number(row.r_multiple || 0), 0);
      return { label, count: rows.length, wins: groupWins, winRate: groupWins / rows.length * 100, resultR };
    }).sort((a, b) => b.resultR - a.resultR);
  };

  const strategyStats = groupStats(allClosedTrades, (trade) => getStrategyName(trade, sessions, strategies));
  const pairStats = groupStats(allClosedTrades, (trade) => trade.symbol);
  const timeframeStats = groupStats(allClosedTrades, (trade) => getTimeframe(trade, sessions));
  const backtestClosed = allClosedTrades.filter((trade) => getTestType(trade, sessions) === "backtest");
  const forwardClosed = allClosedTrades.filter((trade) => getTestType(trade, sessions) === "forward_test");
  const summarize = (rows: ResearchTrade[]) => {
    const winsCount = rows.filter((trade) => Number(trade.r_multiple) > 0).length;
    return { count: rows.length, wins: winsCount, losses: rows.filter((trade) => Number(trade.r_multiple) < 0).length,
      winRate: rows.length ? winsCount / rows.length * 100 : 0,
      netR: rows.reduce((sum, trade) => sum + Number(trade.r_multiple || 0), 0) };
  };
  const backtestSummary = summarize(backtestClosed);
  const forwardSummary = summarize(forwardClosed);
  const typeLabel = activeType === "backtest" ? "Backtesting Lab" : "Forward Testing";

  return (
    <section className="mt-6 space-y-5">
      <header className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">Fidelity Research Lab</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Test. Measure. Improve.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground)]/75">Record each trade directly. No strategy setup, no session name and no extra creation steps. Analytics compares your pairs, written strategies and timeframes.</p>
      </header>

      <nav className="grid grid-cols-3 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2" aria-label="Research Lab sections">
        <button type="button" onClick={() => { setActiveTab("backtest"); setFilterSymbol("all"); setNotice(""); }} className={`rounded-xl px-2 py-3 text-sm font-bold ${activeTab === "backtest" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"}`}>Backtesting Lab</button>
        <button type="button" onClick={() => { setActiveTab("forward_test"); setFilterSymbol("all"); setNotice(""); }} className={`rounded-xl px-2 py-3 text-sm font-bold ${activeTab === "forward_test" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"}`}>Forward Testing</button>
        <button type="button" onClick={() => { setActiveTab("analytics"); setNotice(""); }} className={`rounded-xl px-2 py-3 text-sm font-bold ${activeTab === "analytics" ? "bg-[var(--brand-primary)] text-white" : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"}`}>Analytics</button>
      </nav>

      {loading ? <div className={cardClass}>Loading research data…</div> : <>
        {activeTab === "analytics" ? (
          <div className="space-y-5">
            <div className={cardClass}>
              <div className="mb-4"><h3 className="text-lg font-black">Combined performance analytics</h3><p className="mt-1 text-sm text-[var(--foreground)]/70">Analytics uses closed trades with a recorded R result from both testing modes.</p></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[["Trades", allClosedTrades.length], ["Win rate", `${summarize(allClosedTrades).winRate.toFixed(1)}%`], ["Wins", summarize(allClosedTrades).wins], ["Losses", summarize(allClosedTrades).losses], ["Net R", `${summarize(allClosedTrades).netR.toFixed(2)}R`]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><p className="text-xs text-[var(--foreground)]/70">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>)}
              </div>
              <p className="mt-3 text-xs text-[var(--foreground)]/65">Open or unscored trades are excluded. {allClosedTrades.length < 30 ? "Treat early results as preliminary until you collect a larger sample." : "Compare backtesting results with forward testing before drawing conclusions."}</p>
            </div>
            <div className={cardClass}>
              <h3 className="text-lg font-black">Backtesting vs Forward Testing</h3>
              <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="text-xs text-[var(--foreground)]/65">{["Testing mode","Trades","Wins","Losses","Win rate","Net R"].map((heading) => <th key={heading} className="border-b border-[var(--border)] px-3 py-3">{heading}</th>)}</tr></thead><tbody>{[["Backtesting", backtestSummary], ["Forward Testing", forwardSummary]].map(([label, stats]) => <tr key={String(label)}><td className="border-b border-[var(--border)] px-3 py-3 font-bold">{label as string}</td><td className="border-b border-[var(--border)] px-3 py-3">{(stats as typeof backtestSummary).count}</td><td className="border-b border-[var(--border)] px-3 py-3">{(stats as typeof backtestSummary).wins}</td><td className="border-b border-[var(--border)] px-3 py-3">{(stats as typeof backtestSummary).losses}</td><td className="border-b border-[var(--border)] px-3 py-3">{(stats as typeof backtestSummary).winRate.toFixed(1)}%</td><td className="border-b border-[var(--border)] px-3 py-3">{(stats as typeof backtestSummary).netR.toFixed(2)}R</td></tr>)}</tbody></table></div>
            </div>
            <div className={cardClass}>
              <h3 className="text-lg font-black">Performance by strategy, pair and timeframe</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {[["By strategy", strategyStats], ["By market pair", pairStats], ["By timeframe", timeframeStats]].map(([title, stats]) => <div key={String(title)} className="rounded-xl border border-[var(--border)] p-3"><h4 className="font-bold">{title as string}</h4><div className="mt-3 space-y-3">{(stats as ReturnType<typeof groupStats>).length ? (stats as ReturnType<typeof groupStats>).map((item) => <div key={item.label} className="border-b border-[var(--border)] pb-2 last:border-0"><div className="flex items-center justify-between gap-2 text-sm"><span className="font-semibold">{item.label}</span><span className="font-bold">{item.resultR.toFixed(2)}R</span></div><p className="mt-1 text-xs text-[var(--foreground)]/65">{item.count} trades · {item.winRate.toFixed(1)}% wins · {item.wins} wins</p></div>) : <p className="text-sm text-[var(--foreground)]/60">No completed trades yet.</p>}</div></div>)}
              </div>
            </div>
          </div>
        ) : <>
        <div className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div><h3 className="text-lg font-black">{typeLabel} · Add trade</h3><p className="mt-1 text-sm text-[var(--foreground)]/70">Enter the information once and save.</p></div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">{typeTrades.length} recorded</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold">Market pair<input className={inputClass} value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value })} placeholder="GBPUSD" /></label>
            <label className="text-sm font-semibold">Strategy<input className={inputClass} value={form.strategy} onChange={(event) => setForm({ ...form, strategy: event.target.value })} placeholder="Daily H4 Breakout" /></label>
            <label className="text-sm font-semibold">Timeframe<input className={inputClass} value={form.timeframe} onChange={(event) => setForm({ ...form, timeframe: event.target.value.toUpperCase() })} placeholder="D1, H4, H1, M15…" /></label>
            <label className="text-sm font-semibold">Direction<select className={inputClass} value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value })}><option value="buy">Buy</option><option value="sell">Sell</option></select></label>
            <label className="text-sm font-semibold">Risk (%)<input type="number" min="0" step="0.01" className={inputClass} value={form.risk} onChange={(event) => setForm({ ...form, risk: event.target.value })} placeholder="1" /></label>
            <label className="text-sm font-semibold">Result (R)<input type="number" step="0.01" className={inputClass} value={form.rMultiple} onChange={(event) => setForm({ ...form, rMultiple: event.target.value })} placeholder="2, -1 or 0" /></label>
            <label className="text-sm font-semibold">Entry price<input type="number" step="any" className={inputClass} value={form.entry} onChange={(event) => setForm({ ...form, entry: event.target.value })} /></label>
            <label className="text-sm font-semibold">Stop loss<input type="number" step="any" className={inputClass} value={form.stop} onChange={(event) => setForm({ ...form, stop: event.target.value })} /></label>
            <label className="text-sm font-semibold">Take profit<input type="number" step="any" className={inputClass} value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} /></label>
            <label className="text-sm font-semibold">Entry date & time<input type="datetime-local" className={inputClass} value={form.entryTime} onChange={(event) => setForm({ ...form, entryTime: event.target.value })} /></label>
            <label className="text-sm font-semibold">Exit date & time (optional)<input type="datetime-local" className={inputClass} value={form.exitTime} onChange={(event) => setForm({ ...form, exitTime: event.target.value })} /></label>
            <label className="text-sm font-semibold">P/L amount (optional)<input type="number" step="any" className={inputClass} value={form.pnl} onChange={(event) => setForm({ ...form, pnl: event.target.value })} placeholder="Account currency" /></label>
            <label className="text-sm font-semibold">Before-entry screenshot (optional)<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={inputClass} onChange={(event) => setBeforeScreenshot(event.target.files?.[0] || null)} /><span className="mt-1 block text-xs font-normal text-[var(--foreground)]/65">Upload the chart before taking the trade.</span></label>
            <label className="text-sm font-semibold">After-exit screenshot (optional)<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={inputClass} onChange={(event) => setAfterScreenshot(event.target.files?.[0] || null)} /><span className="mt-1 block text-xs font-normal text-[var(--foreground)]/65">Upload the chart after the trade closes.</span></label>
            <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Notes (optional)<textarea rows={2} className={inputClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Any brief observation about this trade…" /></label>
          </div>
          <button type="button" disabled={saving} onClick={() => void saveTrade()} className="mt-5 rounded-xl bg-[var(--brand-primary)] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Save trade"}</button>
          {notice && <p className="mt-3 text-sm" role="status">{notice}</p>}
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-black">Trade history</h3><select className={`${inputClass} mt-0 max-w-48`} value={filterSymbol} onChange={(event) => setFilterSymbol(event.target.value)}><option value="all">All pairs</option>{symbols.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}</select></div>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="text-xs text-[var(--foreground)]/65">{["Date", "Pair", "Strategy", "Timeframe", "Side", "Risk", "Outcome", "R"].map((heading) => <th key={heading} className="border-b border-[var(--border)] px-3 py-3">{heading}</th>)}</tr></thead><tbody>{visibleTrades.map((trade) => <tr key={trade.id}><td className="border-b border-[var(--border)] px-3 py-3">{new Date(trade.entry_time).toLocaleDateString()}</td><td className="border-b border-[var(--border)] px-3 py-3 font-bold">{trade.symbol}</td><td className="border-b border-[var(--border)] px-3 py-3">{getStrategyName(trade, sessions, strategies)}</td><td className="border-b border-[var(--border)] px-3 py-3">{getTimeframe(trade, sessions)}</td><td className="border-b border-[var(--border)] px-3 py-3 capitalize">{trade.direction}</td><td className="border-b border-[var(--border)] px-3 py-3">{trade.risk_percent ?? "—"}%</td><td className="border-b border-[var(--border)] px-3 py-3 capitalize">{trade.outcome || trade.trade_status}</td><td className="border-b border-[var(--border)] px-3 py-3">{trade.r_multiple === null ? "—" : `${Number(trade.r_multiple).toFixed(2)}R`}</td></tr>)}</tbody></table>{visibleTrades.length === 0 && <p className="py-6 text-center text-sm text-[var(--foreground)]/65">No trades recorded in this testing section yet.</p>}</div>
        </div>

        <div className={cardClass}>
          <h3 className="text-lg font-black">Additional chart evidence</h3><p className="mt-1 text-sm text-[var(--foreground)]/70">You can also add key-level, before-entry, entry or after-exit screenshots to an already saved trade.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold">Trade<select className={inputClass} value={selectedTrade} onChange={(event) => setSelectedTrade(event.target.value)}><option value="">Choose a trade</option>{typeTrades.map((trade) => <option key={trade.id} value={trade.id}>{trade.symbol} · {new Date(trade.entry_time).toLocaleString()}</option>)}</select></label>
            <label className="text-sm font-semibold">Screenshot type<select className={inputClass} value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)}><option value="key_level">Key level / bias</option><option value="before">Before entry</option><option value="entry">Entry</option><option value="after">After exit</option><option value="other">Other</option></select></label>
            <label className="text-sm font-semibold">Image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={inputClass} onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)} /></label>
            <label className="text-sm font-semibold">Caption<input className={inputClass} value={evidenceCaption} onChange={(event) => setEvidenceCaption(event.target.value)} placeholder="Optional caption" /></label>
          </div>
          <button type="button" disabled={saving || !selectedTrade || !evidenceFile} onClick={() => void uploadEvidence()} className="mt-3 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Uploading…" : "Upload screenshot"}</button>
          {evidence.filter((item) => typeTrades.some((trade) => trade.id === item.trade_id)).length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{evidence.filter((item) => typeTrades.some((trade) => trade.id === item.trade_id)).map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-[var(--border)]"><a href={evidenceUrls[item.file_path] || "#"} target="_blank" rel="noreferrer">{evidenceUrls[item.file_path] ? <img src={evidenceUrls[item.file_path]} alt={item.caption || "Research chart"} className="h-40 w-full object-cover" loading="lazy" /> : <div className="flex h-40 items-center justify-center text-sm">Loading image…</div>}</a><div className="p-3"><p className="text-xs font-bold uppercase">{item.evidence_type}</p><p className="mt-1 text-sm text-[var(--foreground)]/70">{item.caption || "No caption"}</p></div></article>)}</div>}
        </div>
        </>}
      </>}
    </section>
  );
}
