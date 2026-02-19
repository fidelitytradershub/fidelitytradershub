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

// ── Shared UI helpers ────────────────────────────────────────────────────────

const Msg = ({ msg }) =>
  msg.text ? (
    <div className={`px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-[#C8F904]/10 border border-[#C8F904]/20 text-[#C8F904]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
      {msg.text}
    </div>
  ) : null;

const Field = ({ label, hint, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">
      {label} {hint && <span className="text-[#FFFFFF]/30 font-normal">{hint}</span>}
    </label>
    <input {...props}
      className="w-full bg-[#0E1A1F] border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] transition-colors text-sm"
    />
  </div>
);

const FeaturesArea = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">
      Features <span className="text-[#FFFFFF]/30 font-normal">(one per line)</span>
    </label>
    <textarea rows={5} value={value} onChange={onChange}
      placeholder={"Feature 1\nFeature 2\nFeature 3"}
      className="w-full bg-[#0E1A1F] border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] transition-colors resize-none text-sm"
    />
  </div>
);

const SaveBtn = ({ saving, label = 'Save Plan' }) => (
  <button type="submit" disabled={saving}
    className="w-full bg-[#6967FB] text-[#FFFFFF] py-3.5 rounded-xl font-semibold hover:bg-[#6967FB]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
    {saving ? <><div className="w-4 h-4 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />Saving...</> : label}
  </button>
);

const TabToggle = ({ options, value, onChange }) => (
  <div className="flex gap-3">
    {options.map((opt) => (
      <button type="button" key={opt} onClick={() => onChange(opt)}
        className={`flex-1 py-2.5 rounded-xl capitalize font-semibold text-sm transition-all ${value === opt ? 'bg-[#6967FB] text-[#FFFFFF]' : 'bg-[#FFFFFF]/5 text-[#FFFFFF]/50 border border-[#FFFFFF]/10 hover:border-[#6967FB]/40'}`}>
        {opt}
      </button>
    ))}
  </div>
);

const Spinner = () => (
  <div className="flex items-center gap-2 text-[#FFFFFF]/40 text-sm">
    <div className="w-4 h-4 border-2 border-[#6967FB] border-t-transparent rounded-full animate-spin" />
    Loading...
  </div>
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
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-[#0E1A1F] border-l border-[#FFFFFF]/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#FFFFFF]/10 shrink-0">
          <h2 className="text-base font-bold text-[#FFFFFF]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 text-[#FFFFFF]/50 hover:text-[#FFFFFF] transition-all text-sm"
          >
            ✕
          </button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {children}
        </div>
      </div>
    </>
  );
};

// ── Enhanced Plan Card ────────────────────────────────────────────────────────
const PlanCard = ({ title, badge, price, priceSuffix, features, meta, onEdit }) => (
  <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="font-bold text-[#FFFFFF]">{title}</p>
      {badge && <span className="text-xs bg-[#C8F904]/10 text-[#C8F904] px-3 py-1 rounded-full border border-[#C8F904]/20">{badge}</span>}
    </div>
    <p className="text-[#C8F904] font-bold text-2xl mb-1">
      ₦{Number(price).toLocaleString()}
      {priceSuffix && <span className="text-xs text-[#FFFFFF]/40 font-normal">{priceSuffix}</span>}
    </p>
    {meta && <p className="text-xs text-[#FFFFFF]/30 mb-3">{meta}</p>}
    <div className="border-t border-[#FFFFFF]/8 pt-3 mb-3">
      <p className="text-xs text-[#FFFFFF]/30 mb-2 font-medium">{(features || []).length} features included</p>
      <ul className="space-y-1.5">
        {(features || []).slice(0, 5).map((f, i) => (
          <li key={i} className="text-xs text-[#FFFFFF]/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6967FB] shrink-0" />{f}
          </li>
        ))}
        {(features || []).length > 5 && (
          <li className="text-xs text-[#FFFFFF]/30 pl-3.5">+{features.length - 5} more</li>
        )}
      </ul>
    </div>
    <button onClick={onEdit} className="w-full bg-[#6967FB]/10 border border-[#6967FB]/30 text-[#6967FB] py-2 rounded-xl text-sm font-semibold hover:bg-[#6967FB]/20 transition-all">
      Edit Plan
    </button>
  </div>
);

// ── No Plan State ─────────────────────────────────────────────────────────────
const NoPlan = ({ label, onAdd }) => (
  <div className="bg-[#FFFFFF]/5 border border-dashed border-[#FFFFFF]/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
    <p className="text-[#FFFFFF]/30 text-sm mb-4">No {label} yet</p>
    <button
      onClick={onAdd}
      className="px-5 py-2.5 bg-[#6967FB]/10 border border-[#6967FB]/30 text-[#6967FB] rounded-xl text-sm font-semibold hover:bg-[#6967FB]/20 transition-all"
    >
      + Create Plan
    </button>
  </div>
);

// ── NETFLIX ───────────────────────────────────────────────────────────────────
export const NetflixDashboard = () => {
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ price: '', features: '' });

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/netflix`, { credentials: 'include' });
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : [];
      const individual = data.find((p) => p.purchaseOption === 'individual') || null;
      setPlan(individual);
      if (individual) setForm({ price: individual.price, features: (individual.features || []).join('\n') });
    } catch { setPlan(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlan(); }, []);

  const openPanel = (reset = false) => {
    if (reset || !plan) setForm({ price: '', features: '' });
    else setForm({ price: plan.price, features: (plan.features || []).join('\n') });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await fetch(`${API}/netflix`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          purchaseOption: 'individual',
          price: Number(form.price),
          features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Netflix plan saved!' });
        fetchPlan();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Netflix Plans">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#FFFFFF]/30 mt-0.5">Individual Netflix Premium subscription pricing</p>
          </div>
          
        </div>

        {loading ? <Spinner /> : plan ? (
          <PlanCard
            title="Netflix Premium — Individual"
            badge="Active"
            price={plan.price}
            priceSuffix="/mo"
            meta="Individual purchase option · Monthly billing"
            features={plan.features}
            onEdit={() => openPanel()}
          />
        ) : (
          <NoPlan label="Netflix plan" onAdd={() => openPanel(true)} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={plan ? 'Edit Netflix Plan' : 'Add Netflix Plan'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3">
            <p className="text-xs text-[#FFFFFF]/40">Plan: <span className="text-[#FFFFFF]/70 font-medium">Netflix Premium — Individual</span></p>
          </div>
          <Msg msg={msg} />
          <Field label="Price (₦ / month)" type="number" min="0" placeholder="e.g. 5000" value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <FeaturesArea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
          <SaveBtn saving={saving} label={plan ? 'Update Plan' : 'Create Plan'} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

// ── CANVA ─────────────────────────────────────────────────────────────────────
export const CanvaDashboard = () => {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ duration: 'monthly', price: '', features: '' });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/canva`, { credentials: 'include' });
      const json = await res.json();
      setPlans(Array.isArray(json.data) ? json.data : []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const loadPlan = (plan) => {
    setForm({ duration: plan.duration, price: plan.price, features: (plan.features || []).join('\n') });
    setMsg({ type: '', text: '' });
  };

  const openPanel = (plan = null) => {
    if (plan) loadPlan(plan);
    else setForm({ duration: 'monthly', price: '', features: '' });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await fetch(`${API}/canva`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ duration: form.duration, price: Number(form.price), features: form.features.split('\n').map((f) => f.trim()).filter(Boolean) }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Canva plan saved!' });
        fetchPlans();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Canva Plans">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">Monthly and yearly Canva Pro pricing</p>
         
        </div>

        {loading ? <Spinner /> : plans.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 ">
            {plans.map((plan) => (
              <PlanCard key={plan._id}
                title={`Canva Pro — ${plan.duration}`}
                price={plan.price}
                priceSuffix={plan.duration === 'yearly' ? '/yr' : '/mo'}
                meta={`Duration: ${plan.duration}`}
                features={plan.features}
                onEdit={() => openPanel(plan)}
              />
            ))}
          </div>
        ) : (
          <NoPlan label="Canva plans" onAdd={() => openPanel()} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Canva Pro Plan">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Msg msg={msg} />
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">Duration</label>
            <TabToggle options={['monthly', 'yearly']} value={form.duration}
              onChange={(d) => { const ex = plans.find((p) => p.duration === d); ex ? loadPlan(ex) : setForm((p) => ({ ...p, duration: d })); }}
            />
          </div>
          <Field label="Price (₦)" type="number" min="0" placeholder="e.g. 8000" value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <FeaturesArea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
          <SaveBtn saving={saving} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

// ── CAPCUT ────────────────────────────────────────────────────────────────────
export const CapCutDashboard = () => {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ duration: 'monthly', price: '', features: '' });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/capcut`, { credentials: 'include' });
      const json = await res.json();
      const all = Array.isArray(json.data) ? json.data : [];
      setPlans(all.filter((p) => p.purchaseType === 'individual'));
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const loadPlan = (plan) => {
    setForm({ duration: plan.duration, price: plan.price, features: (plan.features || []).join('\n') });
    setMsg({ type: '', text: '' });
  };

  const openPanel = (plan = null) => {
    if (plan) loadPlan(plan);
    else setForm({ duration: 'monthly', price: '', features: '' });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await fetch(`${API}/capcut`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          duration: form.duration,
          purchaseType: 'individual',
          price: Number(form.price),
          features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'CapCut plan saved!' });
        fetchPlans();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="CapCut Plans">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">Individual CapCut Pro subscriptions</p>
          
        </div>

        {loading ? <Spinner /> : plans.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan._id}
                title={`CapCut Pro — ${plan.duration}`}
                price={plan.price}
                priceSuffix={plan.duration === 'yearly' ? '/yr' : '/mo'}
                meta={`Purchase type: individual · ${plan.duration}`}
                features={plan.features}
                onEdit={() => openPanel(plan)}
              />
            ))}
          </div>
        ) : (
          <NoPlan label="CapCut plans" onAdd={() => openPanel()} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="CapCut Pro — Individual">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Msg msg={msg} />
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">Duration</label>
            <TabToggle options={['monthly', 'yearly']} value={form.duration}
              onChange={(d) => { const ex = plans.find((p) => p.duration === d); ex ? loadPlan(ex) : setForm((p) => ({ ...p, duration: d })); }}
            />
          </div>
          <Field label="Price (₦)" type="number" min="0" placeholder="e.g. 4500" value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <FeaturesArea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
          <SaveBtn saving={saving} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

// ── SCRIBD ────────────────────────────────────────────────────────────────────
export const ScribdDashboard = () => {
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ price: '', features: '' });

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/scribd`, { credentials: 'include' });
      const json = await res.json();
      if (json.data) {
        setPlan(json.data);
        setForm({ price: json.data.price, features: (json.data.features || []).join('\n') });
      }
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlan(); }, []);

  const openPanel = () => {
    if (plan) setForm({ price: plan.price, features: (plan.features || []).join('\n') });
    else setForm({ price: '', features: '' });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await fetch(`${API}/scribd`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ price: Number(form.price), features: form.features.split('\n').map((f) => f.trim()).filter(Boolean) }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Scribd plan saved!' });
        fetchPlan();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Scribd Plans">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">Scribd Plus monthly subscription pricing</p>
         
        </div>

        {loading ? <Spinner /> : plan ? (
          <PlanCard title="Scribd Plus — Monthly" badge="Active" price={plan.price} priceSuffix="/mo"
            meta="Monthly subscription · All-access reading plan"
            features={plan.features} onEdit={openPanel}
          />
        ) : (
          <NoPlan label="Scribd plan" onAdd={openPanel} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={plan ? 'Edit Scribd Plan' : 'Add Scribd Plan'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3">
            <p className="text-xs text-[#FFFFFF]/40">Plan: <span className="text-[#FFFFFF]/70 font-medium">Scribd Plus — Monthly</span></p>
          </div>
          <Msg msg={msg} />
          <Field label="Price (₦ / month)" type="number" min="0" placeholder="e.g. 3500" value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <FeaturesArea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
          <SaveBtn saving={saving} label={plan ? 'Update Plan' : 'Create Plan'} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

// ── ZOOM ──────────────────────────────────────────────────────────────────────
export const ZoomDashboard = () => {
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ price: '', features: '' });

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/zoom`, { credentials: 'include' });
      const json = await res.json();
      if (json.data) {
        setPlan(json.data);
        setForm({ price: json.data.price, features: (json.data.features || []).join('\n') });
      }
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlan(); }, []);

  const openPanel = () => {
    if (plan) setForm({ price: plan.price, features: (plan.features || []).join('\n') });
    else setForm({ price: '', features: '' });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/zoom`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          price:    Number(form.price),
          currency: 'NGN',             // ← must match model enum
          features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
          isActive: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Zoom plan saved!' });
        fetchPlan();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Zoom Plans">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">Zoom Pro monthly subscription pricing</p>
        </div>

        {loading ? <Spinner /> : plan ? (
          <PlanCard title="Zoom Pro — Monthly" badge="Active" price={plan.price} priceSuffix="/mo"
            meta="Monthly subscription · Pro tier"
            features={plan.features} onEdit={openPanel}
          />
        ) : (
          <NoPlan label="Zoom plan" onAdd={openPanel} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title={plan ? 'Edit Zoom Plan' : 'Add Zoom Plan'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3">
            <p className="text-xs text-[#FFFFFF]/40">
              Plan: <span className="text-[#FFFFFF]/70 font-medium">Zoom Pro — Monthly</span>
            </p>
          </div>
          <Msg msg={msg} />
          <Field label="Price (₦ / month)" type="number" min="0" placeholder="e.g. 6000"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <FeaturesArea value={form.features}
            onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
          <SaveBtn saving={saving} label={plan ? 'Update Plan' : 'Create Plan'} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

// ── FXREPLAY ──────────────────────────────────────────────────────────────────
export const FxReplayDashboard = () => {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({
    name: 'basic-5-days',
    description: '',
    price: '',
    features: '',
  });

  // Maps plan name → durationDays (mirrors your backend model comment)
  const durationMap = {
    'basic-5-days':  5,
    'basic-monthly': 30,
    'intermediate':  30,
    'pro':           30,
  };

  const planOptions = ['basic-5-days', 'basic-monthly', 'intermediate', 'pro'];

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/fxreplay`, { credentials: 'include' });
      const json = await res.json();
      if (Array.isArray(json.data))               setPlans(json.data);
      else if (json.data && typeof json.data === 'object') setPlans([json.data]);
      else                                         setPlans([]);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const loadPlan = (plan) => {
    setForm({
      name:        plan.name || 'basic-5-days',
      description: plan.description || '',
      price:       plan.price,
      features:    (plan.features || []).join('\n'),
    });
    setMsg({ type: '', text: '' });
  };

  const openPanel = (plan = null) => {
    if (plan) loadPlan(plan);
    else setForm({ name: 'basic-5-days', description: '', price: '', features: '' });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API}/fxreplay`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name:         form.name,
          description:  form.description,
          price:        Number(form.price),
          durationDays: durationMap[form.name],   // ← derived from name
          features:     form.features.split('\n').map((f) => f.trim()).filter(Boolean),
          currency:     'NGN',
          isActive:     true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'FxReplay plan saved!' });
        fetchPlans();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  // Label helpers
  const planLabel = (name) => ({
    'basic-5-days':  'Basic — 5 Days',
    'basic-monthly': 'Basic — Monthly',
    'intermediate':  'Intermediate',
    'pro':           'Pro',
  }[name] || name);

  const priceSuffix = (name) =>
    name === 'basic-5-days' ? '/5 days' : '/mo';

  return (
    <DashboardLayout title="FxReplay Plans">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">FxReplay trading platform subscription plans</p>
          <button onClick={() => openPanel()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6967FB] text-[#FFFFFF] rounded-xl text-sm font-semibold hover:bg-[#6967FB]/90 transition-all">
            + Add Plan
          </button>
        </div>

        {loading ? <Spinner /> : plans.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {plans.map((plan, i) => (
              <PlanCard key={plan._id || i}
                title={`FxReplay — ${planLabel(plan.name)}`}
                badge="Active"
                price={plan.price}
                priceSuffix={priceSuffix(plan.name)}
                meta={`${plan.durationDays} day${plan.durationDays > 1 ? 's' : ''} · NGN`}
                features={plan.features}
                onEdit={() => openPanel(plan)}
              />
            ))}
          </div>
        ) : (
          <NoPlan label="FxReplay plans" onAdd={() => openPanel()} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="FxReplay Plan">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Msg msg={msg} />

          {/* Plan name selector — maps to backend enum */}
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">Plan Tier</label>
            <div className="grid grid-cols-2 gap-2">
              {planOptions.map((opt) => (
                <button type="button" key={opt} onClick={() => {
                  const existing = plans.find((p) => p.name === opt);
                  if (existing) loadPlan(existing);
                  else setForm((p) => ({ ...p, name: opt }));
                }}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    form.name === opt
                      ? 'bg-[#6967FB] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF]/5 text-[#FFFFFF]/50 border border-[#FFFFFF]/10 hover:border-[#6967FB]/40'
                  }`}>
                  {planLabel(opt)}
                  <span className="block text-xs font-normal opacity-60 mt-0.5">
                    {durationMap[opt]} {durationMap[opt] === 5 ? 'days' : 'days/mo'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Field label="Description" hint="(optional)" type="text"
            placeholder="e.g. Best for beginners" value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

          <Field label="Price (₦)" type="number" min="0" placeholder="e.g. 12000"
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />

          <FeaturesArea value={form.features}
            onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />

          <SaveBtn saving={saving} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

// ── PROP FIRM ─────────────────────────────────────────────────────────────────
export const PropFirmDashboard = () => {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [msg, setMsg]             = useState({ type: '', text: '' });
  const [form, setForm]           = useState({ name: '', accountSize: '', price: '', features: '' });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/propfirm`, { credentials: 'include' });
      const json = await res.json();
      if (Array.isArray(json.data)) {
        setPlans(json.data);
      } else if (json.data && typeof json.data === 'object') {
        setPlans([json.data]);
      } else if (Array.isArray(json)) {
        setPlans(json);
      } else {
        setPlans([]);
      }
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const loadPlan = (plan) => {
    setForm({
      name: plan.name || plan.type || '',
      accountSize: plan.accountSize || '',
      price: plan.price,
      features: (plan.features || []).join('\n'),
    });
    setMsg({ type: '', text: '' });
  };

  const openPanel = (plan = null) => {
    if (plan) loadPlan(plan);
    else setForm({ name: '', accountSize: '', price: '', features: '' });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await fetch(`${API}/propfirm`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          accountSize: form.accountSize,
          price: Number(form.price),
          features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Prop Firm plan saved!' });
        fetchPlans();
        setTimeout(() => setPanelOpen(false), 900);
      } else setMsg({ type: 'error', text: json.message || 'Failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Prop Firm Plans">
      <div className="max-w-3xl mx-auto space-y-8 bg-[#0E1A1F] p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#FFFFFF]/30">Funded account and challenge packages</p>
          <button onClick={() => openPanel()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6967FB] text-[#FFFFFF] rounded-xl text-sm font-semibold hover:bg-[#6967FB]/90 transition-all">
            + Add Plan
          </button>
        </div>

        {loading ? <Spinner /> : plans.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 bg-[#0E1A1F] p-5 rounded-2xl">
            {plans.map((plan, i) => (
              <div key={plan._id || i} className="bg-[#0E1A1F] border border-[#FFFFFF]/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-[#FFFFFF] capitalize">{plan.name || plan.type || 'Plan'}</p>
                  {plan.accountSize && (
                    <span className="text-xs bg-[#0E1A1F] border border-[#6967FB]/30 text-[#6967FB] px-2 py-1 rounded-full">{plan.accountSize}</span>
                  )}
                </div>
                <p className="text-[#C8F904] font-bold text-2xl mb-1">₦{Number(plan.price).toLocaleString()}</p>
                {plan.accountSize && (
                  <p className="text-xs text-[#FFFFFF]/30 mb-3">Account size: {plan.accountSize}</p>
                )}
                <div className="border-t border-[#FFFFFF]/8 pt-3 mb-3">
                  <p className="text-xs text-[#FFFFFF]/30 mb-2 font-medium">{(plan.features || []).length} features included</p>
                  <ul className="space-y-1.5">
                    {(plan.features || []).slice(0, 4).map((f, j) => (
                      <li key={j} className="text-xs text-[#FFFFFF]/50 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6967FB] shrink-0" />{f}
                      </li>
                    ))}
                    {(plan.features || []).length > 4 && (
                      <li className="text-xs text-[#FFFFFF]/30 pl-3.5">+{plan.features.length - 4} more</li>
                    )}
                  </ul>
                </div>
                <button onClick={() => openPanel(plan)}
                  className="w-full bg-[#6967FB]/10 border border-[#6967FB]/30 text-[#6967FB] py-2 rounded-xl text-sm font-semibold hover:bg-[#6967FB]/20 transition-all">
                  Edit Plan
                </button>
              </div>
            ))}
          </div>
        ) : (
          <NoPlan label="Prop Firm plans" onAdd={() => openPanel()} />
        )}
      </div>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Prop Firm Plan">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Msg msg={msg} />
          <Field label="Plan Name / Firm" type="text" placeholder="e.g. FTMO, MyForexFunds" value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Field label="Account Size" hint="(optional)" type="text" placeholder="e.g. $10,000" value={form.accountSize}
            onChange={(e) => setForm((p) => ({ ...p, accountSize: e.target.value }))} />
          <Field label="Price (₦)" type="number" min="0" placeholder="e.g. 50000" value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
          <FeaturesArea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />
          <SaveBtn saving={saving} />
        </form>
      </SlidePanel>
    </DashboardLayout>
  );
};

export { NetflixDashboard, CanvaDashboard, CapCutDashboard, ScribdDashboard, ZoomDashboard, FxReplayDashboard, PropFirmDashboard };