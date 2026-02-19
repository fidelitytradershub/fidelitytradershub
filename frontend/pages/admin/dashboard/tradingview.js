import { useState, useEffect } from 'react';
import DashboardLayout from '@/component/DashboardLayout';
import withAuth from '@/middleware/withAuth';

const API = process.env.NEXT_PUBLIC_API_URL;

const getStoredToken = () => {
  if (typeof window !== 'undefined') return localStorage.getItem('fth_token');
  return null;
};
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {}),
});
const PLAN_TYPES = ['essential', 'plus', 'premium'];
const DURATIONS = ['monthly', 'yearly'];
const PURCHASE_TYPES = ['individual', 'partnership'];

const emptyPricing = () =>
  DURATIONS.flatMap((duration) =>
    PURCHASE_TYPES.map((purchaseType) => ({ duration, purchaseType, price: '', discount: 0 }))
  );

// ── Slide Panel ───────────────────────────────────────────────────────────────
const SlidePanel = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-[#0E1A1F] border-l border-[#FFFFFF]/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#FFFFFF]/10 shrink-0">
          <h2 className="text-base font-bold text-[#FFFFFF]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 text-[#FFFFFF]/50 hover:text-[#FFFFFF] transition-all text-sm"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {children}
        </div>
      </div>
    </>
  );
};

const TradingViewDashboard = () => {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ type: 'essential', features: '', pricing: emptyPricing() });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/tradingview`, { credentials: 'include' });
      const json = await res.json();
      setPlans(Array.isArray(json) ? json : []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const loadPlan = (plan) => {
    const merged = emptyPricing().map((def) => {
      const match = (plan.pricing || []).find(
        (p) => p.duration === def.duration && p.purchaseType === def.purchaseType
      );
      return match
        ? { duration: match.duration, purchaseType: match.purchaseType, price: match.price, discount: match.discount ?? 0 }
        : def;
    });
    setForm({ type: plan.type, features: (plan.features || []).join('\n'), pricing: merged });
    setMsg({ type: '', text: '' });
  };

  const openPanel = (type = 'essential') => {
    const existing = plans.find((p) => p.type === type);
    if (existing) loadPlan(existing);
    else setForm({ type, features: '', pricing: emptyPricing() });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const switchType = (type) => {
    const existing = plans.find((p) => p.type === type);
    if (existing) loadPlan(existing);
    else setForm({ type, features: '', pricing: emptyPricing() });
  };

  const updatePricing = (duration, purchaseType, field, val) => {
    setForm((prev) => ({
      ...prev,
      pricing: prev.pricing.map((p) =>
        p.duration === duration && p.purchaseType === purchaseType ? { ...p, [field]: val } : p
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const pricing = form.pricing
      .filter((p) => p.price !== '' && Number(p.price) >= 0)
      .map((p) => ({ ...p, price: Number(p.price), discount: Number(p.discount || 0) }));
    if (!pricing.length) return setMsg({ type: 'error', text: 'Enter at least one price.' });
    setSaving(true);
    try {
      const res = await fetch(`${API}/tradingview`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          type: form.type,
          features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
          pricing,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: `${form.type} plan saved!` });
        fetchPlans();
        setTimeout(() => setPanelOpen(false), 900);
      } else {
        setMsg({ type: 'error', text: json.message || 'Failed to save.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="TradingView Plans">
      <div className="max-w-4xl mx-auto space-y-8 bg-[#0E1A1F] p-5 rounded-2xl">

        {/* ── Section header ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">Manage Essential, Plus and Premium TradingView pricing</p>
          
        </div>

        {/* ── Current Plans ── */}
        <section>
          <h2 className="text-base font-bold text-[#FFFFFF] mb-4">Current Plans</h2>
          {loading ? (
            <div className="flex items-center gap-2 text-[#FFFFFF]/40 text-sm">
              <div className="w-4 h-4 border-2 border-[#6967FB] border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-[#FFFFFF]/5 border border-dashed border-[#FFFFFF]/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <p className="text-[#FFFFFF]/30 text-sm mb-4">No plans yet — create one using the buttons above</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div key={plan._id} className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="capitalize font-bold text-[#FFFFFF] text-lg">{plan.type}</span>
                    <span className="text-xs bg-[#6967FB]/20 text-[#6967FB] px-2 py-1 rounded-full">
                      {plan.pricing?.length || 0} price(s)
                    </span>
                  </div>
                  <div className="border-t border-[#FFFFFF]/8 pt-3 mb-3 space-y-1.5">
                    {(plan.pricing || []).slice(0, 3).map((p, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="capitalize text-[#FFFFFF]/50">{p.duration} / {p.purchaseType}</span>
                        <span className="text-[#C8F904] font-semibold">₦{Number(p.price).toLocaleString()}</span>
                      </div>
                    ))}
                    {(plan.pricing?.length || 0) > 3 && (
                      <p className="text-xs text-[#FFFFFF]/30">+{plan.pricing.length - 3} more</p>
                    )}
                  </div>
                  <p className="text-xs text-[#FFFFFF]/30 mb-4">{plan.features?.length || 0} features listed</p>
                  <button
                    onClick={() => openPanel(plan.type)}
                    className="w-full bg-[#6967FB]/10 border border-[#6967FB]/30 text-[#6967FB] py-2 rounded-xl text-sm font-semibold hover:bg-[#6967FB]/20 transition-all"
                  >
                    Edit Plan
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Slide Panel ── */}
      <SlidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={`${plans.find((p) => p.type === form.type) ? 'Edit' : 'Create'} ${form.type} Plan`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">

          {msg.text && (
            <div className={`px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-[#C8F904]/10 border border-[#C8F904]/20 text-[#C8F904]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {msg.text}
            </div>
          )}

          {/* Plan Type Tabs */}
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">Plan Type</label>
            <div className="flex gap-3">
              {PLAN_TYPES.map((type) => (
                <button type="button" key={type} onClick={() => switchType(type)}
                  className={`flex-1 py-2.5 rounded-xl capitalize font-semibold text-sm transition-all ${form.type === type ? 'bg-[#6967FB] text-[#FFFFFF]' : 'bg-[#FFFFFF]/5 text-[#FFFFFF]/50 border border-[#FFFFFF]/10 hover:border-[#6967FB]/40'}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">Features <span className="text-[#FFFFFF]/30 font-normal">(one per line)</span></label>
            <textarea rows={5} value={form.features}
              onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
              placeholder={"Advanced charting\nMultiple indicators\nPrice alerts\nCustom scripts"}
              className="w-full bg-[#0E1A1F] border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] transition-colors resize-none text-sm"
            />
          </div>

          {/* Pricing Grid */}
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-4">Pricing <span className="text-[#FFFFFF]/30 font-normal">(leave blank to skip)</span></label>
            <div className="space-y-5">
              {DURATIONS.map((duration) => (
                <div key={duration}>
                  <p className="text-xs font-bold text-[#C8F904] uppercase tracking-wider mb-3">{duration}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {PURCHASE_TYPES.map((pt) => {
                      const entry = form.pricing.find((p) => p.duration === duration && p.purchaseType === pt);
                      return (
                        <div key={pt} className="bg-[#0E1A1F] rounded-xl p-4 border border-[#FFFFFF]/10">
                          <p className="text-xs text-[#FFFFFF]/40 capitalize mb-3">{pt}</p>
                          <input type="number" min="0" placeholder="Price (₦)"
                            value={entry?.price ?? ''}
                            onChange={(e) => updatePricing(duration, pt, 'price', e.target.value)}
                            className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-lg px-3 py-2 text-[#FFFFFF] placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] text-sm mb-2"
                          />
                          <input type="number" min="0" max="100" placeholder="Discount %"
                            value={entry?.discount ?? 0}
                            onChange={(e) => updatePricing(duration, pt, 'discount', e.target.value)}
                            className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-lg px-3 py-2 text-[#FFFFFF] placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-[#6967FB] text-[#FFFFFF] py-3.5 rounded-xl font-semibold hover:bg-[#6967FB]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Plan'}
          </button>
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

export default withAuth(TradingViewDashboard);