"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "../../BrandLogo";
import { supabase } from "@/lib/supabaseClient";

type Tab = "add" | "levels" | "bias";
type Direction = "buy" | "sell";
type BiasValue = "buy" | "sell" | "neutral" | "failed";
type Level = {
  id: string;
  symbol: string;
  timeframe: string;
  level_type: string;
  price: number;
  direction: Direction;
  note: string;
  source: "manual";
  active: boolean;
  status: "active";
  created_at: string;
  expires_at: string | null;
  invalidation_price: number | null;
  session: string;
};
type PairBias = {
  enabled?: boolean;
  monthly?: BiasValue;
  weekly?: BiasValue;
  daily?: BiasValue;
  h4?: BiasValue;
  updated_at?: string;
  last_change?: Record<string, string>;
};
type BiasData = {
  pairs: Record<string, PairBias>;
  settings: Record<string, boolean>;
};

const COMMON_PAIRS = [
  "GBPUSD", "EURUSD", "AUDUSD", "NZDUSD", "USDCAD", "USDJPY", "USDCHF",
  "GBPJPY", "EURJPY", "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY", "GBPAUD",
  "GBPCAD", "GBPCHF", "GBPNZD", "EURGBP", "EURAUD", "EURCAD", "EURCHF",
  "EURNZD", "AUDCAD", "AUDCHF", "AUDNZD", "NZDCAD", "NZDCHF", "XAUUSD",
  "XAGUSD", "Volatility 75 Index", "Volatility 100 Index", "Volatility 50 Index",
  "Volatility 25 Index", "Volatility 10 Index", "Boom 500 Index", "Boom 1000 Index",
  "Crash 500 Index", "Crash 1000 Index", "Step Index", "US30", "NAS100", "UK100", "GER40",
];
const TIMEFRAMES: Array<{ key: "weekly" | "daily" | "h4"; label: string }> = [
  { key: "weekly", label: "Weekly" },
  { key: "daily", label: "Daily" },
  { key: "h4", label: "H4" },
];

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500";

export default function ScannerAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<Tab>("add");
  const [levels, setLevels] = useState<Level[]>([]);
  const [bias, setBias] = useState<BiasData>({ pairs: {}, settings: {} });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [biasDirty, setBiasDirty] = useState(false);
  const [pairChoice, setPairChoice] = useState("");
  const [customPair, setCustomPair] = useState("");
  const [form, setForm] = useState({
    symbol: "", price: "", timeframe: "D1", direction: "buy" as Direction,
    levelType: "crt", invalidation: "", expiry: "none", session: "any", note: "",
  });

  async function api(resource?: "levels" | "bias", data?: unknown) {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("Your session expired. Please sign in again.");
    const response = await fetch("/admin/scanner-data", {
      method: resource ? "PUT" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(resource ? { "Content-Type": "application/json" } : {}),
      },
      body: resource ? JSON.stringify({ resource, data }) : undefined,
      cache: "no-store",
    });
    const result = (await response.json()) as {
      error?: string;
      levels?: { levels?: Level[] };
      bias?: BiasData;
    };
    if (!response.ok) throw new Error(result.error || "Request failed.");
    return result;
  }

  useEffect(() => {
    let live = true;
    async function load() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) {
          router.replace("/logins");
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profile?.role !== "admin" && profile?.role !== "super_admin") {
          if (live) setLoading(false);
          return;
        }
        if (live) setAuthorized(true);
        const result = await api();
        if (!live) return;
        setLevels(result.levels?.levels || []);
        setBias(result.bias || { pairs: {}, settings: {} });
      } catch (caught) {
        if (live) setError(caught instanceof Error ? caught.message : "Could not load scanner.");
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => { live = false; };
  }, [router]);

  const enabledPairs = useMemo(
    () => Object.values(bias.pairs).filter((pair) => pair.enabled !== false).length,
    [bias],
  );
  const biasedPairs = useMemo(
    () => Object.values(bias.pairs).filter((pair) =>
      pair.enabled !== false &&
      [pair.monthly, pair.weekly, pair.daily, pair.h4].some((value) => value && value !== "neutral"),
    ).length,
    [bias],
  );

  function notify(text: string) {
    setError("");
    setMessage(text);
  }

  async function saveLevels(nextLevels: Level[], success: string) {
    setSaving(true);
    setError("");
    try {
      await api("levels", { levels: nextLevels });
      setLevels(nextLevels);
      notify(success);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save levels.");
    } finally {
      setSaving(false);
    }
  }

  async function addLevel(event: React.FormEvent) {
    event.preventDefault();
    const symbol = form.symbol.trim().toUpperCase();
    const price = Number(form.price);
    if (!symbol || !Number.isFinite(price) || price <= 0) {
      setError("Enter a valid pair and price.");
      return;
    }
    const now = new Date();
    const expiryDays = form.expiry === "none" ? null : Number(form.expiry);
    const next: Level = {
      id: `${symbol}-${form.timeframe}-${form.direction}-${form.price.replace(".", "_")}-${Date.now()}`,
      symbol, price, timeframe: form.timeframe, direction: form.direction,
      level_type: form.levelType, note: form.note.trim(), source: "manual",
      active: true, status: "active", created_at: now.toISOString(),
      expires_at: expiryDays ? new Date(now.getTime() + expiryDays * 86400000).toISOString() : null,
      invalidation_price: form.invalidation ? Number(form.invalidation) : null,
      session: form.session,
    };
    await saveLevels([...levels, next], `${symbol} level added and synced to the scanner.`);
    setForm((value) => ({ ...value, symbol: "", price: "", invalidation: "", note: "" }));
  }

  async function removeLevel(id: string) {
    if (!window.confirm("Delete this level from the live scanner?")) return;
    await saveLevels(levels.filter((level) => level.id !== id), "Level deleted and scanner synced.");
  }

  function updateBias(pairName: string, timeframe: "weekly" | "daily" | "h4", value: BiasValue) {
    setBias((current) => {
      const previous = current.pairs[pairName]?.[timeframe] || "neutral";
      const at = new Date().toISOString();
      return {
        ...current,
        pairs: {
          ...current.pairs,
          [pairName]: {
            ...current.pairs[pairName], [timeframe]: value, updated_at: at,
            last_change: { timeframe, from: previous, to: value, at },
          },
        },
      };
    });
    setBiasDirty(true);
  }

  function addPair() {
    const pairName = (customPair.trim() || pairChoice).trim();
    if (!pairName) return setError("Select or enter a pair first.");
    if (bias.pairs[pairName]) return setError(`${pairName} is already listed.`);
    setBias((current) => ({
      ...current,
      pairs: {
        ...current.pairs,
        [pairName]: { enabled: true, monthly: "neutral", weekly: "neutral", daily: "neutral", h4: "neutral", updated_at: new Date().toISOString() },
      },
    }));
    setPairChoice("");
    setCustomPair("");
    setBiasDirty(true);
    notify(`${pairName} added locally. Save bias changes to sync it.`);
  }

  function togglePair(pairName: string) {
    setBias((current) => ({
      ...current,
      pairs: {
        ...current.pairs,
        [pairName]: { ...current.pairs[pairName], enabled: current.pairs[pairName].enabled === false },
      },
    }));
    setBiasDirty(true);
  }

  function removePair(pairName: string) {
    if (!window.confirm(`Remove ${pairName} from the scanner bias list?`)) return;
    setBias((current) => {
      const pairs = { ...current.pairs };
      delete pairs[pairName];
      return { ...current, pairs };
    });
    setBiasDirty(true);
  }

  async function saveBias() {
    setSaving(true);
    setError("");
    try {
      await api("bias", bias);
      setBiasDirty(false);
      notify("Bias saved and synced to the scanner.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save bias.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="min-h-screen bg-[#071225] p-8 text-white">Loading scanner control…</main>;
  if (!authorized) return <main className="min-h-screen bg-[#071225] p-8 text-white">Admin access required.</main>;

  return (
    <main className="min-h-screen bg-[#071225] text-white">
      <header className="border-b border-slate-800 bg-[#0a1628] px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a href="/admin" className="flex max-w-[210px] items-center"><BrandLogo priority /></a>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[.18em] text-blue-400">Admin tool</p>
            <p className="mt-1 text-sm font-bold text-slate-300"><span className="mr-2 text-emerald-400">●</span>Scanner control</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><a href="/admin" className="text-sm font-bold text-blue-400">← Admin dashboard</a><h1 className="mt-2 text-3xl font-black">Fidelity Scanner</h1><p className="mt-1 text-sm text-slate-400">Manage live key levels and directional bias from one secure workspace.</p></div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[[levels.length, "Levels"], [enabledPairs, "Active pairs"], [biasedPairs, "Bias set"]].map(([value, label]) => <div key={String(label)} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-center"><p className="text-2xl font-black text-blue-400 sm:text-3xl">{value}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400 sm:text-xs">{label}</p></div>)}
        </div>

        {(message || error) && <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${error ? "border-red-500/40 bg-red-950/30 text-red-200" : "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"}`}>{error || message}</div>}

        <nav className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2">
          {([["add", "Add level"], ["levels", "My levels"], ["bias", "Bias"]] as const).map(([value, label]) => {
            return <button key={value} onClick={() => setTab(value)} className={`rounded-xl px-3 py-3 text-sm font-bold ${tab === value ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>{label}</button>;
          })}
        </nav>

        {tab === "add" && <form onSubmit={addLevel} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-xl font-black">Add a key level</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Pair<input className={fieldClass} value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="GBPUSD" /></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Price<input className={fieldClass} type="number" step="any" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1.34920" /></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Timeframe<select className={fieldClass} value={form.timeframe} onChange={(e) => setForm({ ...form, timeframe: e.target.value })}><option value="W1">Weekly</option><option value="D1">Daily</option><option value="H4">H4</option></select></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Direction<select className={fieldClass} value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as Direction })}><option value="buy">Buy — support</option><option value="sell">Sell — resistance</option></select></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Level type<select className={fieldClass} value={form.levelType} onChange={(e) => setForm({ ...form, levelType: e.target.value })}>{[["crt","CRT"],["v_shape","V-Shape"],["a_shape","A-Shape"],["qmr_level","QMR Level"],["sr_flip","S/R Flip"],["ocl","OCL"],["disrespected_ocl","Disrespected OCL"],["sbr","SBR"],["rbs","RBS"]].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Invalidation price (optional)<input className={fieldClass} type="number" step="any" value={form.invalidation} onChange={(e) => setForm({ ...form, invalidation: e.target.value })} /></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Expiry<select className={fieldClass} value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })}><option value="none">No expiry</option><option value="1">1 day</option><option value="3">3 days</option><option value="7">1 week</option></select></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Session<select className={fieldClass} value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })}><option value="any">Any session</option><option value="london">London</option><option value="new_york">New York</option></select></label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:col-span-2">Note (optional)<input className={fieldClass} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
          </div>
          <button disabled={saving} className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-black transition hover:bg-blue-500 disabled:opacity-50">{saving ? "Saving…" : "Add level and sync scanner"}</button>
        </form>}

        {tab === "levels" && <section className="space-y-3">
          {levels.length === 0 ? <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No levels yet. Add your first level from the Add level tab.</div> : levels.map((level) => <article key={level.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-black">{level.symbol} — {level.price}</h3><p className="mt-1 text-sm text-slate-400">{level.timeframe} · {level.direction.toUpperCase()} · {level.level_type.replaceAll("_", " ")} · {(level.status || "active").toUpperCase()}</p>{level.note && <p className="mt-2 text-sm text-slate-300">{level.note}</p>}</div><button disabled={saving} onClick={() => void removeLevel(level.id)} className="rounded-lg border border-red-500/50 px-3 py-2 text-xs font-black text-red-300">Delete</button></div></article>)}
        </section>}

        {tab === "bias" && <section>
          <div className="mb-5 rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-black">Add a pair</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><select className={fieldClass} value={pairChoice} onChange={(e) => setPairChoice(e.target.value)}><option value="">Select common pair</option>{COMMON_PAIRS.filter((pair) => !bias.pairs[pair]).map((pair) => <option key={pair}>{pair}</option>)}</select><input className={fieldClass} value={customPair} onChange={(e) => setCustomPair(e.target.value)} placeholder="Custom pair / synthetic index" /></div>
            <button onClick={addPair} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black">Add pair</button>
          </div>
          <div className="space-y-4">{Object.entries(bias.pairs).map(([pairName, pair]) => <article key={pairName} className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 ${pair.enabled === false ? "opacity-60" : ""}`}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-black">{pairName}</h3><div className="flex gap-2"><button onClick={() => togglePair(pairName)} className={`rounded-lg border px-3 py-2 text-xs font-black ${pair.enabled === false ? "border-amber-500/50 text-amber-300" : "border-emerald-500/50 text-emerald-300"}`}>{pair.enabled === false ? "Disabled" : "Enabled"}</button><button onClick={() => removePair(pairName)} className="rounded-lg border border-red-500/50 px-3 py-2 text-xs font-black text-red-300">Remove</button></div></div>{TIMEFRAMES.map(({ key, label }) => <div key={key} className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</span><div className="grid grid-cols-4 gap-1">{(["buy","sell","neutral","failed"] as BiasValue[]).map((value) => <button key={value} onClick={() => updateBias(pairName, key, value)} className={`rounded-lg border px-2 py-2 text-[10px] font-black uppercase sm:px-3 ${pair[key] === value ? value === "buy" ? "border-emerald-500 bg-emerald-600 text-white" : value === "sell" || value === "failed" ? "border-red-500 bg-red-700 text-white" : "border-blue-500 bg-blue-600 text-white" : "border-slate-700 text-slate-400"}`}>{value}</button>)}</div></div>)}</article>)}</div>
          <div className="sticky bottom-4 mt-5"><button disabled={saving || !biasDirty} onClick={() => void saveBias()} className="w-full rounded-xl bg-blue-600 px-5 py-4 font-black shadow-2xl disabled:opacity-50">{saving ? "Saving…" : biasDirty ? "Save bias changes and sync scanner" : "Bias is synced"}</button></div>
        </section>}
      </div>
    </main>
  );
}
