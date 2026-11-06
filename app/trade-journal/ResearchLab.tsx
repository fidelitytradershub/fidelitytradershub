"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Strategy = {
  id: string; name: string; description: string | null;
  strategy_type: "custom" | "template"; template_key: string | null;
  rules: Record<string, unknown>; checklist: string[]; status: string;
};
type Session = {
  id: string; strategy_id: string; name: string;
  research_type: "backtest" | "forward_test"; symbol: string;
  timeframe: string | null; historical_start_date: string | null;
  historical_end_date: string | null; status: string;
  target_trade_count?: number | null; planned_risk_percent?: number | null;
  risk_mode?: string | null; experiment_model?: string | null;
};
type ResearchTrade = {
  id: string; session_id: string | null; symbol: string; direction: string;
  entry_time: string; exit_time: string | null; entry_price: number | null;
  stop_loss_price: number | null; take_profit_price: number | null;
  exit_price: number | null; risk_percent: number | null; outcome: string | null;
  trade_status: string; pnl: number | null; r_multiple: number | null;
  setup_notes: string | null; mistakes: string | null; lessons: string | null;
  rules_followed: boolean | null; emotion: string | null; tags: string[] | null;
  htf: string | null; itf: string | null; etf: string | null;
  confirmation: string | null; confirmation_timeframe: string | null;
  setup_type: string | null; trading_session: string | null;
  trading_style?: string | null; market_direction?: string | null;
  market_structure?: string | null; structure_timeframe?: string | null;
  trade_vs_structure?: string | null; structure_notes?: string | null;
  timeframe_steps?: Array<{ stage: string; timeframe: string }> | null;
  entry_trigger?: string | null; first_pullback_status?: string | null;
  first_pullback_notes?: string | null; liquidity_status?: string | null;
  liquidity_position?: string | null; liquidity_level_price?: number | null;
  liquidity_swept?: boolean | null; liquidity_notes?: string | null;
};
type Evidence = { id: string; trade_id: string; evidence_type: string; file_path: string; caption: string | null };
type Props = { userId: string };
type Section = "overview" | "strategies" | "backtest" | "forward" | "trades" | "analytics";

const inputClass = "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand-primary)] [&>option]:bg-[var(--surface)] [&>option]:text-[var(--foreground)]";
const cardClass = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5";
const blankTrade = {
  session_id: "", symbol: "GBPUSD", direction: "buy", entry_time: "", exit_time: "",
  entry_price: "", stop_loss_price: "", take_profit_price: "", exit_price: "",
  risk_percent: "1", outcome: "", trade_status: "closed", pnl: "", r_multiple: "",
  htf: "", itf: "", etf: "", confirmation: "", confirmation_timeframe: "",
  trading_style: "day_trading", market_direction: "", market_structure: "", structure_timeframe: "", trade_vs_structure: "", structure_notes: "",
  timeframe_steps_text: "Overall bias | D1\nStructure confirmation | H4\nEntry | M15",
  entry_trigger: "", first_pullback_status: "", first_pullback_notes: "", liquidity_status: "", liquidity_position: "", liquidity_level_price: "", liquidity_swept: "", liquidity_notes: "",
  setup_type: "", trading_session: "London", setup_notes: "", mistakes: "", lessons: "",
  rules_followed: "true", emotion: "", tags: "",
};
const asNumber = (value: string) => value.trim() === "" ? null : Number(value);
const money = (value: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);

export default function ResearchLab({ userId }: Props) {
  const [section, setSection] = useState<Section>("overview");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [trades, setTrades] = useState<ResearchTrade[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState("");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSymbol, setFilterSymbol] = useState("all");
  const [strategyForm, setStrategyForm] = useState({ name: "", description: "", checklist: "" });
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [editingStrategyForm, setEditingStrategyForm] = useState({ name: "", description: "", checklist: "" });
  const [sessionForm, setSessionForm] = useState({ name: "", strategy_id: "", symbol: "GBPUSD", timeframe: "", historical_start_date: "", historical_end_date: "", target_trade_count: "", planned_risk_percent: "1", risk_mode: "fixed", experiment_model: "" });
  const [researchType, setResearchType] = useState<"backtest" | "forward_test">("backtest");
  const [tradeForm, setTradeForm] = useState(blankTrade);
  const [tradeSavedNotice, setTradeSavedNotice] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({ evidence_type: "entry", caption: "" });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [keyLevelFile, setKeyLevelFile] = useState<File | null>(null);
  const [evidencePreviewUrl, setEvidencePreviewUrl] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");

  const loadResearch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const [s, se, t, ev] = await Promise.all([
      supabase.from("research_strategies").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("research_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("research_trades").select("*").eq("user_id", userId).order("entry_time", { ascending: false }),
      supabase.from("research_evidence").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    const error = s.error || se.error || t.error || ev.error;
    if (error) alert(error.message);
    if (!s.error) setStrategies((s.data || []) as Strategy[]);
    if (!se.error) setSessions((se.data || []) as Session[]);
    if (!t.error) setTrades((t.data || []) as ResearchTrade[]);
    if (!ev.error) setEvidence((ev.data || []) as Evidence[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => { void loadResearch(); }, [loadResearch]);

  useEffect(() => {
    if (!evidenceFile) { setEvidencePreviewUrl(""); return; }
    const url = URL.createObjectURL(evidenceFile);
    setEvidencePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [evidenceFile]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const paths = Array.from(new Set(evidence.map((item) => item.file_path).filter(Boolean)));
      const pairs = await Promise.all(paths.map(async (path) => {
        if (/^https?:\/\//i.test(path)) return [path, path] as const;
        const { data } = await supabase.storage.from("trade-journal").createSignedUrl(path, 3600);
        return [path, data?.signedUrl || ""] as const;
      }));
      if (!cancelled) setEvidenceUrls(Object.fromEntries(pairs));
    })();
    return () => { cancelled = true; };
  }, [evidence]);

  async function createStrategy(template = false) {
    const name = template ? "MNSR Strategy" : strategyForm.name.trim();
    if (!name) return alert("Enter a strategy name.");
    setSaving(true);
    const { error } = await supabase.from("research_strategies").insert({
      user_id: userId, name,
      description: template ? "MNSR research template. Add your verified strategy rules and checklist." : strategyForm.description.trim() || null,
      strategy_type: template ? "template" : "custom", template_key: template ? "MNSR" : null,
      rules: {}, checklist: template ? [] : strategyForm.checklist.split("\n").map((x) => x.trim()).filter(Boolean),
    });
    setSaving(false);
    if (error) return alert(error.message);
    setStrategyForm({ name: "", description: "", checklist: "" });
    await loadResearch();
  }

  function startEditingStrategy(strategy: Strategy) {
    setEditingStrategyId(strategy.id);
    setEditingStrategyForm({
      name: strategy.name,
      description: strategy.description || "",
      checklist: (strategy.checklist || []).join("\n"),
    });
  }

  async function saveStrategyChanges() {
    if (!editingStrategyId) return;
    if (!editingStrategyForm.name.trim()) return alert("Enter a strategy name.");
    setSaving(true);
    const { error } = await supabase
      .from("research_strategies")
      .update({
        name: editingStrategyForm.name.trim(),
        description: editingStrategyForm.description.trim() || null,
        checklist: editingStrategyForm.checklist.split("\n").map((x) => x.trim()).filter(Boolean),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingStrategyId)
      .eq("user_id", userId);
    setSaving(false);
    if (error) return alert(error.message);
    setEditingStrategyId(null);
    await loadResearch();
  }

  async function setStrategyArchived(strategy: Strategy, archived: boolean) {
    if (!window.confirm(`${archived ? "Archive" : "Restore"} the strategy “${strategy.name}”? ${archived ? "It will no longer be available for new sessions, but its existing sessions and trades will remain." : "It will become available for new sessions again."}`)) return;
    setSaving(true);
    const { error } = await supabase
      .from("research_strategies")
      .update({ status: archived ? "archived" : "active", updated_at: new Date().toISOString() })
      .eq("id", strategy.id)
      .eq("user_id", userId);
    setSaving(false);
    if (error) return alert(error.message);
    await loadResearch();
  }

  async function deleteStrategy(strategy: Strategy) {
    const linkedSessions = sessions.filter((session) => session.strategy_id === strategy.id);
    if (linkedSessions.length > 0) {
      alert(`This strategy has ${linkedSessions.length} research session(s). To protect your research history, deletion is disabled. Archive it instead.`);
      return;
    }
    if (!window.confirm(`Permanently delete “${strategy.name}”? This cannot be undone.`)) return;
    setSaving(true);
    const { error } = await supabase
      .from("research_strategies")
      .delete()
      .eq("id", strategy.id)
      .eq("user_id", userId);
    setSaving(false);
    if (error) return alert(error.message);
    if (editingStrategyId === strategy.id) setEditingStrategyId(null);
    await loadResearch();
  }

  async function createSession(type: "backtest" | "forward_test" = researchType) {
    if (!sessionForm.name.trim() || !sessionForm.strategy_id || !sessionForm.symbol.trim()) return alert("Enter a session name, select a strategy and enter a symbol.");
    if (type === "backtest" && sessionForm.historical_start_date && sessionForm.historical_end_date && sessionForm.historical_end_date < sessionForm.historical_start_date) return alert("The end date cannot be earlier than the start date.");
    setSaving(true);
    const { error } = await supabase.from("research_sessions").insert({
      user_id: userId, name: sessionForm.name.trim(), strategy_id: sessionForm.strategy_id,
      research_type: type, symbol: sessionForm.symbol.trim().toUpperCase(), timeframe: sessionForm.timeframe || null,
      historical_start_date: type === "backtest" ? sessionForm.historical_start_date || null : null,
      historical_end_date: type === "backtest" ? sessionForm.historical_end_date || null : null, status: "draft",
      target_trade_count: sessionForm.target_trade_count.trim() ? Math.max(1, Math.floor(Number(sessionForm.target_trade_count))) : null,
      planned_risk_percent: sessionForm.planned_risk_percent.trim() ? Number(sessionForm.planned_risk_percent) : null,
      risk_mode: sessionForm.risk_mode, experiment_model: sessionForm.experiment_model.trim() || null,
    });
    setSaving(false);
    if (error) return alert(error.message);
    setSessionForm((v) => ({ ...v, name: "", historical_start_date: "", historical_end_date: "" }));
    await loadResearch(); setSection(type === "backtest" ? "backtest" : "forward");
  }

  async function updateSessionStatus(id: string, status: "active" | "completed" | "archived") {
    const { error } = await supabase.from("research_sessions").update({ status, updated_at: new Date().toISOString(), completed_at: status === "completed" ? new Date().toISOString() : null }).eq("id", id).eq("user_id", userId);
    if (error) return alert(error.message);
    await loadResearch();
  }

  async function saveResearchTrade() {
    if (!tradeForm.entry_time || !tradeForm.symbol.trim()) return alert("Enter the symbol and entry date/time.");
    const session = tradeForm.session_id ? sessions.find((x) => x.id === tradeForm.session_id) : null;
    if (tradeForm.session_id && !session) return alert("The selected research session could not be found. Clear the session selection and try again.");
    const closed = tradeForm.trade_status === "closed";
    setTradeSavedNotice(false);
    setSaving(true);
    const payload = {
      user_id: userId, session_id: tradeForm.session_id || null, symbol: tradeForm.symbol.trim().toUpperCase(), direction: tradeForm.direction,
      entry_time: new Date(tradeForm.entry_time).toISOString(), exit_time: tradeForm.exit_time ? new Date(tradeForm.exit_time).toISOString() : null,
      entry_price: asNumber(tradeForm.entry_price), stop_loss_price: asNumber(tradeForm.stop_loss_price), take_profit_price: asNumber(tradeForm.take_profit_price),
      exit_price: asNumber(tradeForm.exit_price), risk_percent: asNumber(tradeForm.risk_percent), outcome: closed ? (tradeForm.outcome || (tradeForm.r_multiple !== "" ? (Number(tradeForm.r_multiple) > 0 ? "win" : Number(tradeForm.r_multiple) < 0 ? "loss" : "breakeven") : null)) : null,
      trade_status: tradeForm.trade_status, pnl: asNumber(tradeForm.pnl), r_multiple: asNumber(tradeForm.r_multiple),
      htf: tradeForm.htf || null, itf: tradeForm.itf || null, etf: tradeForm.etf || null,
      trading_style: tradeForm.trading_style || null,
      market_direction: tradeForm.market_direction || null,
      market_structure: tradeForm.market_structure || null,
      structure_timeframe: tradeForm.structure_timeframe.trim() || null,
      trade_vs_structure: tradeForm.trade_vs_structure || null,
      structure_notes: tradeForm.structure_notes.trim() || null,
      timeframe_steps: tradeForm.timeframe_steps_text.split("\n").map((line) => { const [stage, timeframe] = line.split("|").map((part) => part.trim()); return stage && timeframe ? { stage, timeframe } : null; }).filter(Boolean),
      entry_trigger: tradeForm.entry_trigger.trim() || null,
      first_pullback_status: tradeForm.first_pullback_status || null,
      first_pullback_notes: tradeForm.first_pullback_notes.trim() || null,
      liquidity_status: tradeForm.liquidity_status || null,
      liquidity_position: tradeForm.liquidity_position || null,
      liquidity_level_price: asNumber(tradeForm.liquidity_level_price),
      liquidity_swept: tradeForm.liquidity_swept === "" ? null : tradeForm.liquidity_swept === "true",
      liquidity_notes: tradeForm.liquidity_notes.trim() || null,
      confirmation: tradeForm.confirmation.trim() || null, confirmation_timeframe: tradeForm.confirmation_timeframe || null,
      setup_type: tradeForm.setup_type.trim() || null, trading_session: tradeForm.trading_session || null,
      setup_notes: tradeForm.setup_notes.trim() || null, mistakes: tradeForm.mistakes.trim() || null, lessons: tradeForm.lessons.trim() || null,
      rules_followed: tradeForm.rules_followed === "true", emotion: tradeForm.emotion || null,
      tags: tradeForm.tags.split(",").map((x) => x.trim()).filter(Boolean),
    };
    const { data: savedTrade, error } = await supabase.from("research_trades").insert(payload).select("id").single();
    if (error) { setSaving(false); return alert(error.message); }

    // Save the optional Key Level / market-bias screenshot against this trade.
    if (keyLevelFile) {
      if (!keyLevelFile.type.startsWith("image/")) {
        setSaving(false);
        return alert("The trade was saved, but the Key Level file must be an image. Please upload it from Chart evidence.");
      }
      const uploadFile = await makeStorageFriendlyImage(keyLevelFile);
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${userId}/research/${savedTrade.id}/${Date.now()}-key-level-${safeName}`;
      const upload = await supabase.storage.from("trade-journal").upload(path, uploadFile, {
        upsert: false, contentType: uploadFile.type, cacheControl: "3600",
      });
      if (upload.error) {
        setSaving(false);
        return alert(`Trade saved, but the Key Level screenshot could not be uploaded: ${upload.error.message}. You can add it later under Chart evidence.`);
      }
      const evidenceInsert = await supabase.from("research_evidence").insert({
        user_id: userId, session_id: null, trade_id: savedTrade.id,
        evidence_type: "key_level", file_path: path, caption: "Key Level — market bias and key level",
      });
      if (evidenceInsert.error) {
        await supabase.storage.from("trade-journal").remove([path]);
        setSaving(false);
        return alert(`Trade saved, but the Key Level screenshot record could not be saved: ${evidenceInsert.error.message}. You can add it later under Chart evidence.`);
      }
    }

    setSaving(false);

    // Prepare the form for the next trade in the same research session.
    setTradeForm({
      ...blankTrade,
      session_id: tradeForm.session_id || "",
      symbol: tradeForm.symbol.trim().toUpperCase(),
    });

    setKeyLevelFile(null);
    await loadResearch();
    setSection("trades");
    setTradeSavedNotice(true);
  }

  async function makeStorageFriendlyImage(file: File): Promise<File> {
    // Compress in the browser before upload. If the browser cannot decode or
    // re-encode this image format, keep the original rather than blocking the user.
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = 1800;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) { bitmap.close(); return file; }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
      if (!blob || blob.size >= file.size) return file;
      const baseName = file.name.replace(/\.[^.]+$/, "") || "research-chart";
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
    } catch {
      return file;
    }
  }

  async function uploadEvidence() {
    if (!selectedTrade || !evidenceFile) return;
    if (!evidenceFile.type.startsWith("image/")) {
      setUploadNotice("Please choose an image file (PNG, JPG or WEBP).");
      return;
    }
    setSaving(true);
    setUploadNotice("Preparing image and uploading…");
    const uploadFile = await makeStorageFriendlyImage(evidenceFile);
    const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/research/${selectedTrade}/${Date.now()}-${safeName}`;
    const upload = await supabase.storage.from("trade-journal").upload(path, uploadFile, { upsert: false, contentType: uploadFile.type, cacheControl: "3600" });
    if (upload.error) {
      setSaving(false);
      setUploadNotice(`Upload couldn't be completed: ${upload.error.message}`);
      return;
    }
    const { error } = await supabase.from("research_evidence").insert({ user_id: userId, session_id: null, trade_id: selectedTrade, evidence_type: evidenceForm.evidence_type, file_path: path, caption: evidenceForm.caption.trim() || null });
    setSaving(false);
    if (error) {
      await supabase.storage.from("trade-journal").remove([path]);
      setUploadNotice(`Image uploaded but its record couldn't be saved: ${error.message}`);
      return;
    }
    const reduced = uploadFile.size < evidenceFile.size;
    setUploadNotice(reduced ? `Uploaded. Image size reduced from ${(evidenceFile.size / 1024).toFixed(0)} KB to ${(uploadFile.size / 1024).toFixed(0)} KB.` : "Uploaded successfully.");
    setEvidenceFile(null);
    setEvidenceForm({ evidence_type: "entry", caption: "" });
    await loadResearch();
  }

  const backtests = sessions.filter((x) => x.research_type === "backtest");
  const forwardTests = sessions.filter((x) => x.research_type === "forward_test");
  const filteredTrades = useMemo(() => trades.filter((trade) => {
    const session = sessions.find((x) => x.id === trade.session_id);
    const matchesStrategy = filterStrategy === "all" || session?.strategy_id === filterStrategy;
    const matchesType = filterType === "all" || session?.research_type === filterType;
    const matchesSymbol = filterSymbol === "all" || trade.symbol === filterSymbol;
    return matchesStrategy && matchesType && matchesSymbol;
  }), [trades, sessions, filterStrategy, filterType, filterSymbol]);
  const closedTrades = filteredTrades.filter((x) => x.trade_status === "closed" && x.r_multiple !== null);
  const wins = closedTrades.filter((x) => Number(x.r_multiple) > 0);
  const losses = closedTrades.filter((x) => Number(x.r_multiple) < 0);
  const breakeven = closedTrades.filter((x) => Number(x.r_multiple) === 0);
  const totalR = closedTrades.reduce((sum, x) => sum + Number(x.r_multiple || 0), 0);
  const grossWin = wins.reduce((sum, x) => sum + Number(x.r_multiple || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, x) => sum + Number(x.r_multiple || 0), 0));
  const winRate = closedTrades.length ? wins.length / closedTrades.length * 100 : 0;
  const profitFactor = grossLoss ? grossWin / grossLoss : grossWin ? Infinity : 0;
  const expectancy = closedTrades.length ? totalR / closedTrades.length : 0;
  const ruleCount = closedTrades.filter((x) => x.rules_followed !== null).length;
  const ruleRate = ruleCount ? closedTrades.filter((x) => x.rules_followed === true).length / ruleCount * 100 : 0;
  const symbols = Array.from(new Set(trades.map((x) => x.symbol))).sort();

  function startNewTrade(session?: Session) {
    setTradeForm({
      ...blankTrade,
      session_id: session?.id || "",
      symbol: session?.symbol || "GBPUSD",
    });
    setTradeSavedNotice(false);
    setKeyLevelFile(null);
    setSection("trades");
  }

  function sessionList(items: Session[]) {
    if (!items.length) return <div className={`${cardClass} text-sm text-[var(--foreground)]/75`}>No research sessions yet. Create your first session to begin.</div>;
    return <div className="space-y-3">{items.map((item) => {
      const strategy = strategies.find((x) => x.id === item.strategy_id);
      const count = trades.filter((x) => x.session_id === item.id).length;
      return <article key={item.id} className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">{item.symbol} · {item.timeframe || "No timeframe"} · {strategy?.name || "Strategy"} · {count} trades{item.target_trade_count ? ` / ${item.target_trade_count} target` : " · no target"}</p></div><span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold capitalize">{item.status.replace("_", " ")}</span></div>
        {item.research_type === "backtest" && <p className="mt-3 text-xs text-[var(--foreground)]/75">Research period: {item.historical_start_date || "Not set"} — {item.historical_end_date || "Not set"}</p>}
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => startNewTrade(item)} className="rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-black text-white shadow-sm">+ Add trade to this {item.research_type === "backtest" ? "backtest" : "forward test"}</button>{item.status === "draft" && <button onClick={() => updateSessionStatus(item.id, "active")} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold">Start session</button>}{item.status === "active" && <button onClick={() => updateSessionStatus(item.id, "completed")} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold">Complete session</button>}</div>
      </article>;
    })}</div>;
  }

  const nav: [Section, string][] = [["overview", "Overview"], ["strategies", "Strategy Manager"], ["backtest", "Backtesting Lab"], ["forward", "Forward Testing"]];

  return <section className="mt-6 space-y-5">
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand-primary)]">Fidelity Research Lab</p><h2 className="mt-2 text-3xl font-black">Test. Measure. Improve.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--foreground)]/75">Research strategies independently of your live trading journal. Research trades, evidence and analytics are stored separately from live journal performance.</p></div>
    <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 sm:grid-cols-4">{nav.map(([id, label]) => <button key={id} onClick={() => setSection(id)} className={`rounded-xl px-3 py-3 text-sm font-bold ${section === id ? "fth-nav-active" : "text-[var(--foreground)]/75 hover:bg-[var(--surface-2)]"}`}>{label}</button>)}</nav>
    {loading ? <div className={`${cardClass} text-sm text-[var(--foreground)]/75`}>Loading Research Lab…</div> : <>
      {section === "overview" && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Strategies", strategies.length], ["Backtest sessions", backtests.length], ["Forward sessions", forwardTests.length], ["Research trades", trades.length]].map(([label, value]) => <div key={label} className={cardClass}><p className="text-sm text-[var(--foreground)]/75">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>)}</div>
        <div className="grid gap-4 md:grid-cols-2"><button onClick={() => setSection("strategies")} className={`${cardClass} text-left`}><h3 className="font-bold">Strategy Manager</h3><p className="mt-2 text-sm text-[var(--foreground)]/75">Create custom strategies and use the MNSR template as a starting point.</p></button><button onClick={() => setSection("trades")} className={`${cardClass} text-left`}><h3 className="font-bold">Trade Log & Evidence</h3><p className="mt-2 text-sm text-[var(--foreground)]/75">Record each research trade, timeframe structure and chart screenshots.</p></button><button onClick={() => setSection("analytics")} className={`${cardClass} text-left md:col-span-2`}><h3 className="font-bold">Research Analytics</h3><p className="mt-2 text-sm text-[var(--foreground)]/75">Review performance using research trades only. Sample size is shown beside the statistics.</p></button></div>
        <div><h3 className="mb-3 text-lg font-bold">Recent research sessions</h3>{sessionList(sessions.slice(0, 4))}</div>
      </>}
      {section === "strategies" && <div className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <div className={cardClass}><h3 className="text-lg font-bold">Create a strategy</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">Create each strategy once and reuse it across different pairs, dates and testing sessions. You do not need a new strategy just because you are testing USDJPY instead of GBPUSD.</p><label className="mt-4 block text-sm font-semibold">Strategy name<input className={`${inputClass} mt-2`} value={strategyForm.name} onChange={(e) => setStrategyForm({ ...strategyForm, name: e.target.value })} placeholder="e.g. GBPUSD London setup" /></label><details className="mt-4 rounded-xl border border-[var(--border)] p-4"><summary className="cursor-pointer select-none text-sm font-bold">Optional strategy description and checklist</summary><label className="mt-4 block text-sm font-semibold">Description<textarea className={`${inputClass} mt-2`} rows={2} value={strategyForm.description} onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })} placeholder="Describe the setup rules…" /></label><label className="mt-4 block text-sm font-semibold">Checklist (one item per line)<textarea className={`${inputClass} mt-2`} rows={3} value={strategyForm.checklist} onChange={(e) => setStrategyForm({ ...strategyForm, checklist: e.target.value })} placeholder={'Higher timeframe bias\nConfirmation\nEntry trigger'} /></label></details><button disabled={saving} onClick={() => createStrategy(false)} className="mt-4 w-full rounded-xl bg-[var(--brand-primary)] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save custom strategy"}</button><div className="mt-5 border-t border-[var(--border)] pt-5"><h4 className="font-bold">Ready-made template</h4><p className="mt-1 text-sm text-[var(--foreground)]/75">MNSR template foundation. Add your verified rules and checklist after creation.</p><button disabled={saving || strategies.some((x) => x.template_key === "MNSR")} onClick={() => createStrategy(true)} className="mt-3 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold disabled:opacity-40">{strategies.some((x) => x.template_key === "MNSR") ? "MNSR template added" : "Add MNSR template"}</button></div></div>
        <div className={cardClass}><h3 className="text-lg font-bold">Your strategies</h3><p className="mt-1 text-xs text-[var(--foreground)]/75">Edit details, archive strategies you are not currently testing, or delete strategies that have no research sessions.</p><div className="mt-4 space-y-3">{strategies.length ? strategies.map((x) => { const linkedCount = sessions.filter((session) => session.strategy_id === x.id).length; const isArchived = x.status === "archived"; return <article key={x.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><strong>{x.name}</strong><p className="mt-1 text-xs uppercase text-[var(--foreground)]/75">{x.strategy_type} · {isArchived ? "Archived" : "Active"}</p></div><span className="text-xs text-[var(--foreground)]/75">{linkedCount} research sessions</span></div><p className="mt-2 text-sm text-[var(--foreground)]/75">{x.description || "No description added."}</p><p className="mt-2 text-xs text-[var(--foreground)]/75">{(x.checklist || []).length} checklist items</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => startEditingStrategy(x)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold">Edit</button><button type="button" disabled={saving} onClick={() => void setStrategyArchived(x, !isArchived)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold disabled:opacity-50">{isArchived ? "Restore" : "Archive"}</button><button type="button" disabled={saving || linkedCount > 0} title={linkedCount > 0 ? "Archive this strategy to preserve its research history." : "Delete strategy"} onClick={() => void deleteStrategy(x)} className="rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-40">Delete</button></div>{editingStrategyId === x.id && <div className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><h4 className="font-bold">Edit strategy</h4><label className="block text-sm font-semibold">Strategy name<input className={`${inputClass} mt-2`} value={editingStrategyForm.name} onChange={(e) => setEditingStrategyForm({ ...editingStrategyForm, name: e.target.value })} /></label><label className="block text-sm font-semibold">Description<textarea className={`${inputClass} mt-2`} rows={3} value={editingStrategyForm.description} onChange={(e) => setEditingStrategyForm({ ...editingStrategyForm, description: e.target.value })} /></label><label className="block text-sm font-semibold">Checklist (one item per line)<textarea className={`${inputClass} mt-2`} rows={4} value={editingStrategyForm.checklist} onChange={(e) => setEditingStrategyForm({ ...editingStrategyForm, checklist: e.target.value })} /></label><div className="flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={() => void saveStrategyChanges()} className="rounded-lg bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={() => setEditingStrategyId(null)} className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-bold">Cancel</button></div></div>}</article>; }) : <p className="rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--foreground)]/75">No strategies yet. Add MNSR or create a custom strategy.</p>}</div></div>
      </div>}
      {(section === "backtest" || section === "forward") && <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--surface-2)] p-4"><div><h3 className="font-bold">{section === "backtest" ? "Backtesting" : "Forward testing"} trade entry</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">Open a session and log each trade inside it. The strategy stays linked to the session, while every trade can have its own timeframe sequence.</p></div><button type="button" onClick={() => startNewTrade()} className="rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-black text-white">+ Add standalone trade</button></div><div className={cardClass}><h3 className="text-lg font-bold">Create {section === "backtest" ? "backtesting" : "forward-testing"} session</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">A session is one test: give it a name, choose a saved strategy and pair, then record trades. Optional settings are tucked away below.</p>{!strategies.length ? <p className="mt-3 text-sm text-[var(--foreground)]/75">Create a strategy in Strategy Manager first.</p> : <><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Session name<input className={`${inputClass} mt-2`} value={sessionForm.name} onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })} placeholder="e.g. GBPUSD 2024–2025 test" /></label><label className="text-sm font-semibold">Strategy<select className={`${inputClass} mt-2`} value={sessionForm.strategy_id} onChange={(e) => setSessionForm({ ...sessionForm, strategy_id: e.target.value })}><option value="">Select strategy</option>{strategies.filter((x) => x.status === "active").map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className="text-sm font-semibold">Market / pair<input className={`${inputClass} mt-2`} value={sessionForm.symbol} onChange={(e) => setSessionForm({ ...sessionForm, symbol: e.target.value })} /></label><details className="sm:col-span-2 rounded-xl border border-[var(--border)] p-4"><summary className="cursor-pointer select-none text-sm font-bold">Optional experiment settings — target trades, risk and test rules</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Target number of trades<input type="number" min="1" step="1" className={`${inputClass} mt-2`} value={sessionForm.target_trade_count} onChange={(e) => setSessionForm({ ...sessionForm, target_trade_count: e.target.value })} placeholder="Optional" /></label><label className="text-sm font-semibold">Risk model<select className={`${inputClass} mt-2`} value={sessionForm.risk_mode} onChange={(e) => setSessionForm({ ...sessionForm, risk_mode: e.target.value })}><option value="fixed">Fixed risk</option><option value="variable">Variable risk</option></select></label><label className="text-sm font-semibold">Planned risk per trade (%)<input type="number" min="0" step="0.01" className={`${inputClass} mt-2`} value={sessionForm.planned_risk_percent} onChange={(e) => setSessionForm({ ...sessionForm, planned_risk_percent: e.target.value })} placeholder="Optional" /></label><label className="text-sm font-semibold sm:col-span-2">Experiment model / rules<textarea className={`${inputClass} mt-2`} rows={2} value={sessionForm.experiment_model} onChange={(e) => setSessionForm({ ...sessionForm, experiment_model: e.target.value })} placeholder="What pattern or condition are you testing?" /></label></div></details>{section === "backtest" && <><label className="text-sm font-semibold">Historical start date<input type="date" className={`${inputClass} mt-2 cursor-pointer`} value={sessionForm.historical_start_date} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* The browser may not expose a native picker. */ } }} onChange={(e) => setSessionForm({ ...sessionForm, historical_start_date: e.target.value })} /></label><label className="text-sm font-semibold">Historical end date<input type="date" className={`${inputClass} mt-2 cursor-pointer`} value={sessionForm.historical_end_date} onClick={(e) => { try { e.currentTarget.showPicker(); } catch { /* The browser may not expose a native picker. */ } }} onChange={(e) => setSessionForm({ ...sessionForm, historical_end_date: e.target.value })} /></label></>}</div><button disabled={saving} onClick={() => { const type = section === "backtest" ? "backtest" : "forward_test"; setResearchType(type); void createSession(type); }} className="mt-5 rounded-xl bg-[var(--brand-primary)] px-6 py-3 font-bold text-white disabled:opacity-50">{saving ? "Creating…" : "Create research session"}</button></>}</div><div><h3 className="mb-3 text-lg font-bold">{section === "backtest" ? "Backtesting sessions" : "Forward-testing sessions"}</h3>{sessionList(section === "backtest" ? backtests : forwardTests)}</div></div>}
      {section === "trades" && <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--surface-2)] p-4"><div><h3 className="font-bold">Trade Log & Evidence</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">Start a fresh trade entry at any time. You can add a standalone sample or link it to a research session.</p></div><button type="button" onClick={() => startNewTrade()} className="rounded-xl bg-[var(--brand-primary)] px-5 py-3 text-sm font-black text-white">+ Add New Trade</button></div>
        <div className={cardClass}><h3 className="text-lg font-bold">Log a research trade</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">Log a trade from your backtest or forward test session. You can also save a standalone sample. Research records remain separate from your live trading journal.</p>
          <div className="mt-4 rounded-2xl border border-[var(--brand-primary)]/40 bg-[var(--surface-2)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3"><div><h4 className="font-bold">Quick trade entry</h4><p className="text-xs text-[var(--foreground)]/75">Start with the pair, direction and entry time. Record the result when the trade closes; all extra analysis is optional.</p></div><span className="rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-bold text-black">Quick log</span></div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-semibold">Market / pair<input className={`${inputClass} mt-2`} value={tradeForm.symbol} onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })} placeholder="e.g. GBPUSD" /></label>
              <label className="text-sm font-semibold">Direction<select className={`${inputClass} mt-2`} value={tradeForm.direction} onChange={(e) => setTradeForm({ ...tradeForm, direction: e.target.value })}><option value="buy">Buy / Long</option><option value="sell">Sell / Short</option></select></label>
              <label className="text-sm font-semibold">Entry date & time<input type="datetime-local" className={`${inputClass} mt-2`} value={tradeForm.entry_time} onChange={(e) => setTradeForm({ ...tradeForm, entry_time: e.target.value })} /></label>
              <label className="text-sm font-semibold">Trade result<select className={`${inputClass} mt-2`} value={tradeForm.outcome} onChange={(e) => setTradeForm({ ...tradeForm, outcome: e.target.value })}><option value="">Not recorded yet</option><option value="win">Win</option><option value="loss">Loss</option><option value="breakeven">Breakeven</option></select></label>
              <label className="text-sm font-semibold">Trade status<select className={`${inputClass} mt-2`} value={tradeForm.trade_status} onChange={(e) => setTradeForm({ ...tradeForm, trade_status: e.target.value })}><option value="closed">Closed</option><option value="open">Open</option></select></label>
            </div>
            <p className="mt-2 text-xs text-[var(--foreground)]/75">Record the outcome here when the trade closes. Entry, stop loss, take profit, exit price, exit time and R multiple are optional.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-semibold">Result (R multiple) — optional<input type="number" step="any" className={`${inputClass} mt-2`} value={tradeForm.r_multiple} onChange={(e) => setTradeForm({ ...tradeForm, r_multiple: e.target.value })} placeholder="e.g. 2, -1, 0" /></label>
              <label className="text-sm font-semibold">Profit / Loss — optional<input type="number" step="any" className={`${inputClass} mt-2`} value={tradeForm.pnl} onChange={(e) => setTradeForm({ ...tradeForm, pnl: e.target.value })} placeholder="Enter amount if known" /></label>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--border)] p-4">
              <label className="block text-sm font-bold">KEY LEVEL & MARKET BIAS — CHART EVIDENCE</label>
              <p className="mt-1 text-xs text-[var(--foreground)]/75">Attach the higher-timeframe bias and key-level screenshot here so it stays with this trade. Entry and after-exit screenshots can be added in the chart evidence area below. Optional for a quick log; recommended for complete research.</p>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={`${inputClass} mt-3`} onChange={(e) => setKeyLevelFile(e.target.files?.[0] || null)} />
              {keyLevelFile && <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-2)] p-3"><span className="min-w-0 truncate text-xs">{keyLevelFile.name} · {(keyLevelFile.size / 1024).toFixed(0)} KB</span><button type="button" onClick={() => setKeyLevelFile(null)} className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold">Remove</button></div>}
            </div>
          </div>
          <details className="mt-4 rounded-2xl border border-[var(--border)] p-4">
            <summary className="cursor-pointer select-none font-bold">Advanced details (optional) — prices, risk, structure, pullback, liquidity and notes</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label className="text-sm font-semibold">Symbol<input className={`${inputClass} mt-2`} value={tradeForm.symbol} onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value })} /></label>
              
              <label className="text-sm font-semibold">Exit date & time<input type="datetime-local" className={`${inputClass} mt-2`} value={tradeForm.exit_time} onChange={(e) => setTradeForm({ ...tradeForm, exit_time: e.target.value })} /></label>
          {([["Entry price","entry_price"],["Stop loss price","stop_loss_price"],["Take profit price","take_profit_price"],["Exit price","exit_price"],["Risk %","risk_percent"],["P&L (account currency)","pnl"]] as const).map(([label,key]) => <label key={key} className="text-sm font-semibold">{label}<input type="number" step="any" className={`${inputClass} mt-2`} value={tradeForm[key]} onChange={(e) => setTradeForm({ ...tradeForm, [key]: e.target.value })} /></label>)}
          <div className="sm:col-span-2 xl:col-span-3 rounded-xl border border-[var(--border)] p-4"><p className="mb-2 text-sm font-bold">Market context and structure</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><label className="text-sm font-semibold">Trading style<select className={`${inputClass} mt-2`} value={tradeForm.trading_style} onChange={(e) => setTradeForm({ ...tradeForm, trading_style: e.target.value })}><option value="scalping">Scalping</option><option value="day_trading">Day trading</option><option value="swing_trading">Swing trading</option><option value="position_trading">Position trading</option><option value="other">Other</option></select></label><label className="text-sm font-semibold">Overall market direction<select className={`${inputClass} mt-2`} value={tradeForm.market_direction} onChange={(e) => setTradeForm({ ...tradeForm, market_direction: e.target.value })}><option value="">Not recorded</option><option value="bullish">Bullish</option><option value="bearish">Bearish</option><option value="ranging">Ranging</option></select></label><label className="text-sm font-semibold">Market structure<select className={`${inputClass} mt-2`} value={tradeForm.market_structure} onChange={(e) => setTradeForm({ ...tradeForm, market_structure: e.target.value })}><option value="">Not recorded</option><option value="bullish">Bullish</option><option value="bearish">Bearish</option><option value="ranging">Ranging</option><option value="unclear">Unclear</option></select></label><label className="text-sm font-semibold">Structure timeframe<input className={`${inputClass} mt-2`} value={tradeForm.structure_timeframe} onChange={(e) => setTradeForm({ ...tradeForm, structure_timeframe: e.target.value })} placeholder="e.g. D1, H4, 2D, 1W" /></label><label className="text-sm font-semibold">Trade versus structure<select className={`${inputClass} mt-2`} value={tradeForm.trade_vs_structure} onChange={(e) => setTradeForm({ ...tradeForm, trade_vs_structure: e.target.value })}><option value="">Not recorded</option><option value="with_trend">With structure</option><option value="against_trend">Against structure</option><option value="neutral">Neutral / ranging</option></select></label><label className="text-sm font-semibold">Structure notes<input className={`${inputClass} mt-2`} value={tradeForm.structure_notes} onChange={(e) => setTradeForm({ ...tradeForm, structure_notes: e.target.value })} placeholder="Describe highs, lows, breaks…" /></label></div><label className="mt-4 block text-sm font-semibold">Flexible timeframe steps <span className="font-normal text-[var(--foreground)]/75">(one per line: Stage | Timeframe)</span><textarea rows={4} className={`${inputClass} mt-2`} value={tradeForm.timeframe_steps_text} onChange={(e) => setTradeForm({ ...tradeForm, timeframe_steps_text: e.target.value })} placeholder={'Overall bias | D1\nStructure confirmation | H4\nEntry | M15'} /></label><p className="mt-1 text-xs text-[var(--foreground)]/75">Record the actual timeframes used on this trade—not a fixed strategy template. Add any stages and timeframes, for example: Daily bias | D1; key level | H4; breakout | H2; confirmation | M30; entry | M15. Each trade can differ.</p></div>
          <div className="sm:col-span-2 xl:col-span-3 rounded-xl border border-[var(--border)] p-4"><p className="mb-3 text-sm font-bold">Entry structure: first pullback and liquidity</p><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><label className="text-sm font-semibold">First pullback<select className={`${inputClass} mt-2`} value={tradeForm.first_pullback_status} onChange={(e) => setTradeForm({ ...tradeForm, first_pullback_status: e.target.value })}><option value="">Not recorded</option><option value="present">Present</option><option value="absent">Absent</option><option value="uncertain">Uncertain</option></select></label><label className="text-sm font-semibold">Liquidity around pullback?<select className={`${inputClass} mt-2`} value={tradeForm.liquidity_status} onChange={(e) => setTradeForm({ ...tradeForm, liquidity_status: e.target.value })}><option value="">Not recorded</option><option value="present">Present</option><option value="absent">Absent</option><option value="uncertain">Uncertain</option></select></label><label className="text-sm font-semibold">Liquidity location<select className={`${inputClass} mt-2`} value={tradeForm.liquidity_position} onChange={(e) => setTradeForm({ ...tradeForm, liquidity_position: e.target.value })}><option value="">Not recorded</option><option value="above_pullback">Above pullback</option><option value="below_pullback">Below pullback</option><option value="both_sides">Both sides</option></select></label><label className="text-sm font-semibold">Liquidity level price<input type="number" step="any" className={`${inputClass} mt-2`} value={tradeForm.liquidity_level_price} onChange={(e) => setTradeForm({ ...tradeForm, liquidity_level_price: e.target.value })} /></label><label className="text-sm font-semibold">Was liquidity swept?<select className={`${inputClass} mt-2`} value={tradeForm.liquidity_swept} onChange={(e) => setTradeForm({ ...tradeForm, liquidity_swept: e.target.value })}><option value="">Not recorded</option><option value="true">Yes</option><option value="false">No</option></select></label><label className="text-sm font-semibold">First-pullback / liquidity notes<input className={`${inputClass} mt-2`} value={tradeForm.liquidity_notes} onChange={(e) => setTradeForm({ ...tradeForm, liquidity_notes: e.target.value })} placeholder="Optional explanation" /></label><label className="text-sm font-semibold sm:col-span-2 xl:col-span-3">Entry trigger<input className={`${inputClass} mt-2`} value={tradeForm.entry_trigger} onChange={(e) => setTradeForm({ ...tradeForm, entry_trigger: e.target.value })} placeholder="e.g. BOS after first pullback, CRT, breaker block…" /></label></div></div>
          <label className="text-sm font-semibold">Confirmation (optional)<input className={`${inputClass} mt-2`} value={tradeForm.confirmation} onChange={(e) => setTradeForm({ ...tradeForm, confirmation: e.target.value })} placeholder="e.g. BOS, MSS, liquidity sweep" /></label><label className="text-sm font-semibold">Confirmation timeframe (optional)<input className={`${inputClass} mt-2`} value={tradeForm.confirmation_timeframe} onChange={(e) => setTradeForm({ ...tradeForm, confirmation_timeframe: e.target.value })} placeholder="e.g. M5" /></label><label className="text-sm font-semibold">Setup type<input className={`${inputClass} mt-2`} value={tradeForm.setup_type} onChange={(e) => setTradeForm({ ...tradeForm, setup_type: e.target.value })} placeholder="Name this setup" /></label><label className="text-sm font-semibold">Trading session<select className={`${inputClass} mt-2`} value={tradeForm.trading_session} onChange={(e) => setTradeForm({ ...tradeForm, trading_session: e.target.value })}><option>London</option><option>New York</option><option>Asian</option><option>London / New York overlap</option><option>Other</option></select></label><label className="text-sm font-semibold">Rules followed?<select className={`${inputClass} mt-2`} value={tradeForm.rules_followed} onChange={(e) => setTradeForm({ ...tradeForm, rules_followed: e.target.value })}><option value="true">Yes</option><option value="false">No</option></select></label><label className="text-sm font-semibold">Emotion<select className={`${inputClass} mt-2`} value={tradeForm.emotion} onChange={(e) => setTradeForm({ ...tradeForm, emotion: e.target.value })}><option value="">Not recorded</option><option>Calm</option><option>Confident</option><option>Fearful</option><option>Greedy</option><option>Frustrated</option><option>FOMO</option></select></label><label className="text-sm font-semibold">Tags (comma separated)<input className={`${inputClass} mt-2`} value={tradeForm.tags} onChange={(e) => setTradeForm({ ...tradeForm, tags: e.target.value })} placeholder="e.g. QMR, continuation" /></label>
          <label className="text-sm font-semibold sm:col-span-2 xl:col-span-3">Setup notes<textarea rows={2} className={`${inputClass} mt-2`} value={tradeForm.setup_notes} onChange={(e) => setTradeForm({ ...tradeForm, setup_notes: e.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2 xl:col-span-3">Mistakes<textarea rows={2} className={`${inputClass} mt-2`} value={tradeForm.mistakes} onChange={(e) => setTradeForm({ ...tradeForm, mistakes: e.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2 xl:col-span-3">Lessons<textarea rows={2} className={`${inputClass} mt-2`} value={tradeForm.lessons} onChange={(e) => setTradeForm({ ...tradeForm, lessons: e.target.value })} /></label>
            </div>
          </details>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveResearchTrade()}
            className="mt-5 rounded-xl bg-[var(--brand-primary)] px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {saving ? "Saving trade…" : "Save research trade"}
          </button>

          {tradeSavedNotice && (
            <div
              className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
              role="status"
            >
              <p className="font-bold text-green-700">
                Trade saved successfully!
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]/75">
                Your trade sample has been saved. The form is ready for the next trade.
              </p>
              <button
                type="button"
                onClick={() => setTradeSavedNotice(false)}
                className="mt-3 rounded-xl bg-[var(--brand-primary)] px-5 py-3 font-bold text-white"
              >
                + Add Another Trade
              </button>
            </div>
          )}
        </div>
        <div className={cardClass}><h3 className="text-lg font-bold">Chart evidence</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">Attach before-entry, entry or after-exit chart screenshots to a research trade.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Research trade<select className={`${inputClass} mt-2`} value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)}><option value="">Select trade</option>{trades.map((x) => <option key={x.id} value={x.id}>{x.symbol} · {new Date(x.entry_time).toLocaleString()} · {x.direction}</option>)}</select></label><label className="text-sm font-semibold">Evidence type<select className={`${inputClass} mt-2`} value={evidenceForm.evidence_type} onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_type: e.target.value })}><option value="key_level">Key Level / market bias</option><option value="before">Before entry</option><option value="entry">Entry</option><option value="after">After exit</option><option value="other">Other</option></select></label><label className="text-sm font-semibold">Choose screenshot<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={`${inputClass} mt-2`} onChange={(e) => { setEvidenceFile(e.target.files?.[0] || null); setUploadNotice(""); }} /></label><label className="text-sm font-semibold">Caption<input className={`${inputClass} mt-2`} value={evidenceForm.caption} onChange={(e) => setEvidenceForm({ ...evidenceForm, caption: e.target.value })} placeholder="What does this screenshot show?" /></label></div>{evidenceFile && <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"><img src={evidencePreviewUrl} alt="Selected chart preview" className="h-24 w-36 rounded-lg object-contain bg-black/5" /><div className="min-w-0 flex-1"><p className="text-sm font-bold">{evidenceFile.name}</p><p className="mt-1 text-xs text-[var(--foreground)]/75">Selected · {(evidenceFile.size / 1024).toFixed(0)} KB. It will be optimized automatically before upload where supported.</p></div><button type="button" onClick={() => { setEvidenceFile(null); setUploadNotice(""); }} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold">Remove</button></div>}<p className="mt-2 text-xs text-[var(--foreground)]/75">Images are resized and compressed in your browser before upload when possible. If optimization is unsupported, the original image is uploaded instead; this will not create a resize error.</p><button disabled={saving || !selectedTrade || !evidenceFile} onClick={() => void uploadEvidence()} className="mt-4 rounded-xl bg-[var(--brand-primary)] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Uploading…" : "Upload evidence"}</button>{uploadNotice && <p className="mt-3 text-sm text-[var(--foreground)]/75" role="status">{uploadNotice}</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{evidence.map((item) => <article key={item.id} className="overflow-hidden rounded-xl border border-[var(--border)]"><a href={evidenceUrls[item.file_path] || "#"} target="_blank" rel="noreferrer">{evidenceUrls[item.file_path] ? <img src={evidenceUrls[item.file_path]} alt={item.caption || "Research evidence"} loading="lazy" decoding="async" className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center text-sm text-[var(--foreground)]/75">Loading image…</div>}</a><div className="p-3"><p className="text-xs font-bold uppercase">{item.evidence_type}</p><p className="mt-1 text-sm text-[var(--foreground)]/75">{item.caption || "No caption"}</p></div></article>)}</div>
        </div>
        <div className={cardClass}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">Research trade history</h3><button onClick={() => { const header = ["symbol","direction","entry_time","exit_time","risk_percent","market_direction","market_structure","structure_timeframe","trade_vs_structure","trading_style","first_pullback_status","liquidity_status","liquidity_position","liquidity_swept","entry_trigger","timeframe_steps","htf","itf","etf","confirmation","confirmation_timeframe","setup_type","trading_session","outcome","r_multiple","pnl","rules_followed"]; const rows = filteredTrades.map((x) => header.map((k) => JSON.stringify((x as unknown as Record<string, unknown>)[k] ?? "")).join(",")); const csv = [header.join(","), ...rows].join("\n"); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "research-trades.csv"; a.click(); URL.revokeObjectURL(url); }} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold">Export CSV</button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><select className={inputClass} value={filterStrategy} onChange={(e) => setFilterStrategy(e.target.value)}><option value="all">All strategies</option>{strategies.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><select className={inputClass} value={filterType} onChange={(e) => setFilterType(e.target.value)}><option value="all">Backtest + forward</option><option value="backtest">Backtesting only</option><option value="forward_test">Forward testing only</option></select><select className={inputClass} value={filterSymbol} onChange={(e) => setFilterSymbol(e.target.value)}><option value="all">All symbols</option>{symbols.map((x) => <option key={x}>{x}</option>)}</select></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="text-xs text-[var(--foreground)]/75"><tr>{["Date","Symbol","Side","HTF / ITF / ETF","Confirmation","Setup","Outcome","R","Rules"].map((x) => <th key={x} className="border-b border-[var(--border)] px-3 py-3">{x}</th>)}</tr></thead><tbody>{filteredTrades.map((x) => <tr key={x.id}><td className="border-b border-[var(--border)] px-3 py-3">{new Date(x.entry_time).toLocaleDateString()}</td><td className="border-b border-[var(--border)] px-3 py-3 font-bold">{x.symbol}</td><td className="border-b border-[var(--border)] px-3 py-3 capitalize">{x.direction}</td><td className="border-b border-[var(--border)] px-3 py-3">{[x.htf,x.itf,x.etf].filter(Boolean).join(" / ") || "—"}</td><td className="border-b border-[var(--border)] px-3 py-3">{x.confirmation ? `${x.confirmation}${x.confirmation_timeframe ? ` (${x.confirmation_timeframe})` : ""}` : "—"}</td><td className="border-b border-[var(--border)] px-3 py-3">{x.setup_type || "—"}</td><td className="border-b border-[var(--border)] px-3 py-3 capitalize">{x.outcome || x.trade_status}</td><td className="border-b border-[var(--border)] px-3 py-3">{x.r_multiple === null ? "—" : `${Number(x.r_multiple).toFixed(2)}R`}</td><td className="border-b border-[var(--border)] px-3 py-3">{x.rules_followed === null ? "—" : x.rules_followed ? "Yes" : "No"}</td></tr>)}</tbody></table>{!filteredTrades.length && <p className="py-6 text-center text-sm text-[var(--foreground)]/75">No research trades match these filters.</p>}</div></div>
      </div>}
      {section === "analytics" && <div className="space-y-5"><div className={cardClass}><h3 className="text-lg font-bold">Research performance</h3><p className="mt-1 text-sm text-[var(--foreground)]/75">Calculated from closed research trades only. Live journal records are not included.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Closed trades",closedTrades.length],["Win rate",`${winRate.toFixed(1)}%`],["Profit factor",grossLoss ? profitFactor.toFixed(2) : grossWin ? "∞" : "—"],["Expectancy",`${expectancy.toFixed(2)}R`],["Net result",`${totalR.toFixed(2)}R`],["Wins / losses / BE",`${wins.length} / ${losses.length} / ${breakeven.length}`],["Rule adherence",ruleCount ? `${ruleRate.toFixed(1)}%` : "—"],["Open trades",filteredTrades.filter((x) => x.trade_status !== "closed").length]].map(([label,value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><p className="text-xs text-[var(--foreground)]/75">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div><p className="mt-4 text-xs text-[var(--foreground)]/75">Sample size: {closedTrades.length} closed trades. {closedTrades.length < 30 ? "This is a small sample; treat the results as preliminary, not proof of a durable edge." : "Continue collecting data and compare backtest results with forward-test results."}</p></div>
        <div className="grid gap-4 lg:grid-cols-2"><div className={cardClass}><h3 className="font-bold">Performance by strategy</h3><div className="mt-3 space-y-3">{strategies.map((strategy) => { const ids = sessions.filter((x) => x.strategy_id === strategy.id).map((x) => x.id); const rows = trades.filter((x) => x.session_id !== null && ids.includes(x.session_id) && x.trade_status === "closed" && x.r_multiple !== null); const w = rows.filter((x) => Number(x.r_multiple) > 0).length; const r = rows.reduce((sum,x) => sum + Number(x.r_multiple || 0),0); return <div key={strategy.id} className="rounded-xl bg-[var(--surface-2)] p-3"><div className="flex justify-between gap-3"><strong className="text-sm">{strategy.name}</strong><span className="text-sm font-bold">{r.toFixed(2)}R</span></div><p className="mt-1 text-xs text-[var(--foreground)]/75">{rows.length} closed trades · {rows.length ? (w / rows.length * 100).toFixed(1) : "0.0"}% win rate</p></div>; })}{!strategies.length && <p className="text-sm text-[var(--foreground)]/75">No strategies yet.</p>}</div></div>
          <div className={cardClass}><h3 className="font-bold">Performance by setup</h3><div className="mt-3 space-y-3">{Array.from(new Set(closedTrades.map((x) => x.setup_type || "Unspecified"))).map((setup) => { const rows = closedTrades.filter((x) => (x.setup_type || "Unspecified") === setup); const r = rows.reduce((sum,x) => sum + Number(x.r_multiple || 0),0); return <div key={setup} className="rounded-xl bg-[var(--surface-2)] p-3"><div className="flex justify-between gap-3"><strong className="text-sm">{setup}</strong><span className="text-sm font-bold">{r.toFixed(2)}R</span></div><p className="mt-1 text-xs text-[var(--foreground)]/75">{rows.length} trades · {rows.length ? (rows.filter((x) => Number(x.r_multiple) > 0).length / rows.length * 100).toFixed(1) : "0.0"}% win rate</p></div>; })}{!closedTrades.length && <p className="text-sm text-[var(--foreground)]/75">Log closed research trades to see setup statistics.</p>}</div></div></div>
        <div className={cardClass}><h3 className="font-bold">Backtesting vs forward testing</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{(["backtest","forward_test"] as const).map((type) => { const ids = sessions.filter((x) => x.research_type === type).map((x) => x.id); const rows = trades.filter((x) => x.session_id !== null && ids.includes(x.session_id) && x.trade_status === "closed" && x.r_multiple !== null); const sum = rows.reduce((acc,x) => acc + Number(x.r_multiple || 0),0); const win = rows.filter((x) => Number(x.r_multiple) > 0).length; return <div key={type} className="rounded-xl border border-[var(--border)] p-4"><p className="text-sm font-bold">{type === "backtest" ? "Historical backtesting" : "Forward testing"}</p><p className="mt-2 text-2xl font-black">{sum.toFixed(2)}R</p><p className="mt-1 text-xs text-[var(--foreground)]/75">{rows.length} closed trades · {rows.length ? (win / rows.length * 100).toFixed(1) : "0.0"}% win rate</p></div>; })}</div></div>
      </div>}
    </>}
  </section>;
}
