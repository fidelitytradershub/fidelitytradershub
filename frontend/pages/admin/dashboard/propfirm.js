import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/component/DashboardLayout';
import withAuth from '@/middleware/withAuth';

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/prop-firm`;

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

// ── Shared UI ────────────────────────────────────────────────────────────────

const Msg = ({ msg }) =>
  msg.text ? (
    <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
      msg.type === 'success'
        ? 'bg-[#C8F904]/10 border border-[#C8F904]/20 text-[#C8F904]'
        : 'bg-red-500/10 border border-red-500/20 text-red-400'
    }`}>
      {msg.type === 'success' ? '✓ ' : '✕ '}{msg.text}
    </div>
  ) : null;

const Field = ({ label, hint, textarea, rows = 4, ...props }) => (
  <div>
    <label className="block text-xs font-semibold tracking-wide text-[#FFFFFF]/50 uppercase mb-2">
      {label}{hint && <span className="normal-case text-[#FFFFFF]/25 font-normal ml-1">{hint}</span>}
    </label>
    {textarea ? (
      <textarea rows={rows} {...props}
        className="w-full bg-[#0A1720] border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-white placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] focus:ring-1 focus:ring-[#6967FB]/20 transition-all resize-none text-sm"
      />
    ) : (
      <input {...props}
        className="w-full bg-[#0A1720] border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-white placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] focus:ring-1 focus:ring-[#6967FB]/20 transition-all text-sm"
      />
    )}
  </div>
);

const Spinner = () => (
  <div className="flex items-center gap-3 text-[#FFFFFF]/30 text-sm py-12 justify-center">
    <div className="w-5 h-5 border-2 border-[#6967FB] border-t-transparent rounded-full animate-spin" />
    Loading...
  </div>
);

const SaveBtn = ({ saving, label = 'Save' }) => (
  <button type="submit" disabled={saving}
    className="flex-1 bg-[#6967FB] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#5856e0] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#6967FB]/20">
    {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : label}
  </button>
);

const CancelBtn = ({ onClick }) => (
  <button type="button" onClick={onClick}
    className="flex-1 bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 text-[#FFFFFF]/60 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#FFFFFF]/10 transition-all">
    Cancel
  </button>
);

const Badge = ({ children, color = 'purple' }) => {
  const colors = {
    purple: 'bg-[#6967FB]/15 text-[#6967FB] border-[#6967FB]/25',
    green:  'bg-[#C8F904]/10 text-[#C8F904] border-[#C8F904]/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold shrink-0 ${colors[color]}`}>{children}</span>;
};

const Toggle = ({ value, onChange, label, hint }) => (
  <div className="flex items-center justify-between bg-[#0A1720] border border-[#FFFFFF]/10 rounded-xl px-4 py-3.5">
    <div>
      <p className="text-sm font-semibold text-[#FFFFFF]/80">{label}</p>
      {hint && <p className="text-xs text-[#FFFFFF]/35 mt-0.5">{hint}</p>}
    </div>
    <button type="button" onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${value ? 'bg-[#C8F904]' : 'bg-[#FFFFFF]/15'}`}>
      <div className={`w-5 h-5 bg-[#0D1A22] rounded-full absolute top-0.5 transition-all shadow-md ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  </div>
);

// ── Slide Panel ───────────────────────────────────────────────────────────────
const SlidePanel = ({ open, onClose, title, subtitle, children }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#0D1A22] border-l border-[#FFFFFF]/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-start justify-between p-6 border-b border-[#FFFFFF]/8 shrink-0">
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#6967FB] uppercase mb-1">{subtitle}</p>
            <h2 className="text-lg font-black text-white">{title}</h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 text-[#FFFFFF]/50 hover:text-white transition-all flex items-center justify-center text-lg mt-0.5">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {children}
        </div>
      </div>
    </>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ item, label, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-[#0D1A22] border border-[#FFFFFF]/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-xl">⚠️</div>
      <h3 className="font-black text-white mb-2">Delete {label}?</h3>
      <p className="text-[#FFFFFF]/50 text-sm mb-6">
        <span className="text-white font-semibold">"{item}"</span> will be permanently removed and cannot be recovered.
      </p>
      <div className="flex gap-3">
        <CancelBtn onClick={onCancel} />
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</> : '🗑 Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, label, onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/8 flex items-center justify-center mb-4 text-2xl">{icon}</div>
    <p className="text-[#FFFFFF]/40 text-sm mb-4">No {label} yet</p>
    <button onClick={onAdd} className="px-5 py-2.5 bg-[#6967FB]/15 border border-[#6967FB]/30 text-[#6967FB] rounded-xl text-sm font-bold hover:bg-[#6967FB]/25 transition-all">
      + Add First {label.replace(/s$/, '')}
    </button>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNTS TAB
// ════════════════════════════════════════════════════════════════════════════
const emptyAccountForm = () => ({
  company: '', accountType: '', description: '', features: '', benefits: '', isAvailable: true,
});

const AccountsTab = () => {
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(emptyAccountForm());
  const [msg, setMsg]               = useState({ type: '', text: '' });

  const fetch_ = async () => {
    try {
      setLoading(true);
      const res  = await authFetch(`${BASE}/accounts`);
      const json = await res.json();
      setAccounts(Array.isArray(json.data) ? json.data : []);
    } catch { setAccounts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyAccountForm());
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const openEdit = (acc) => {
    setEditId(acc._id);
    setForm({
      company:     acc.company,
      accountType: acc.accountType,
      description: acc.description,
      features:    (acc.features || []).join('\n'),
      benefits:    (acc.benefits  || []).join('\n'),
      isAvailable: acc.isAvailable !== false,
    });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setEditId(null); setForm(emptyAccountForm()); };

  const splitLines = (str) => str.split('\n').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.accountType || !form.description)
      return setMsg({ type: 'error', text: 'Company, account type, and description are required.' });
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await authFetch(`${BASE}/accounts`, {
        method: 'PUT',
        body: JSON.stringify({
          company:     form.company.trim(),
          accountType: form.accountType.trim(),
          description: form.description.trim(),
          features:    splitLines(form.features),
          benefits:    splitLines(form.benefits),
          isAvailable: form.isAvailable,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Account saved!' });
        await fetch_();
        setTimeout(() => closePanel(), 800);
      } else setMsg({ type: 'error', text: json.message || 'Failed to save.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!confirmDel) return;
    setDeleting(confirmDel._id);
    try {
      const res  = await authFetch(`${BASE}/accounts/${confirmDel._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { setConfirmDel(null); fetch_(); }
      else setMsg({ type: 'error', text: json.message || 'Delete failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      {confirmDel && (
        <DeleteModal item={`${confirmDel.company} — ${confirmDel.accountType}`} label="Account"
          onConfirm={confirmDelete} onCancel={() => setConfirmDel(null)} deleting={!!deleting} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#FFFFFF]/40">Prop firm funded account types and challenge options</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#FFFFFF]/30 bg-[#FFFFFF]/5 border border-[#FFFFFF]/8 px-3 py-1.5 rounded-lg">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </span>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6967FB] hover:bg-[#5856e0] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#6967FB]/25">
            + Add Account
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : accounts.length === 0 ? (
        <EmptyState icon="💼" label="accounts" onAdd={openAdd} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc._id} className={`bg-[#FFFFFF]/4 border rounded-2xl p-5 transition-all ${acc.isAvailable ? 'border-[#FFFFFF]/8' : 'border-red-500/15 opacity-60'}`}>
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-black text-white text-base">{acc.company}</p>
                  <p className="text-xs font-semibold text-[#6967FB] mt-0.5">{acc.accountType}</p>
                </div>
                <Badge color={acc.isAvailable ? 'green' : 'red'}>
                  {acc.isAvailable ? 'Available' : 'Hidden'}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-[#FFFFFF]/45 mb-4 line-clamp-2 leading-relaxed">{acc.description}</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-[#0A1720] rounded-xl p-3 border border-[#FFFFFF]/8 text-center">
                  <p className="text-xs text-[#FFFFFF]/30 mb-0.5">Features</p>
                  <p className="text-xl font-black text-white">{acc.features?.length || 0}</p>
                </div>
                <div className="bg-[#0A1720] rounded-xl p-3 border border-[#FFFFFF]/8 text-center">
                  <p className="text-xs text-[#FFFFFF]/30 mb-0.5">Benefits</p>
                  <p className="text-xl font-black text-white">{acc.benefits?.length || 0}</p>
                </div>
              </div>

              {/* Feature pills preview */}
              {(acc.features || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(acc.features || []).slice(0, 3).map((f, i) => (
                    <span key={i} className="text-xs bg-[#FFFFFF]/5 border border-[#FFFFFF]/8 text-[#FFFFFF]/45 px-2.5 py-1 rounded-lg">{f}</span>
                  ))}
                  {(acc.features || []).length > 3 && (
                    <span className="text-xs bg-[#FFFFFF]/5 border border-[#FFFFFF]/8 text-[#FFFFFF]/25 px-2.5 py-1 rounded-lg">+{acc.features.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#FFFFFF]/8">
                <button onClick={() => openEdit(acc)}
                  className="flex-1 bg-[#6967FB]/10 border border-[#6967FB]/25 text-[#6967FB] py-2.5 rounded-xl text-sm font-bold hover:bg-[#6967FB]/20 transition-all">
                  ✎ Edit
                </button>
                <button onClick={() => setConfirmDel(acc)} disabled={deleting === acc._id}
                  className="bg-red-500/8 border border-red-500/15 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-500/15 transition-all disabled:opacity-50">
                  {deleting === acc._id ? '…' : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      <SlidePanel open={panelOpen} onClose={closePanel}
        title={editId ? 'Edit Account' : 'Add Account'}
        subtitle="Prop Firm · Accounts">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Msg msg={msg} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Company" type="text" placeholder="e.g. FTMO"
              value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} required />
            <Field label="Account Type" type="text" placeholder="e.g. Challenge, Funded"
              value={form.accountType} onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))} required />
          </div>

          <Field label="Description" textarea rows={3}
            placeholder="Brief description of this account type..."
            value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />

          <Field label="Features" hint="(one per line)" textarea rows={4}
            placeholder={"2-step evaluation\nReal capital access\n14-day challenge period"}
            value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} />

          <Field label="Benefits" hint="(one per line)" textarea rows={4}
            placeholder={"Up to 80% profit split\nRefundable fee\nScalable account"}
            value={form.benefits} onChange={(e) => setForm((p) => ({ ...p, benefits: e.target.value }))} />

          <Toggle
            value={form.isAvailable}
            onChange={() => setForm((p) => ({ ...p, isAvailable: !p.isAvailable }))}
            label="Available to users"
            hint="Toggle to hide this account from the public listing"
          />

          <div className="flex gap-3 pt-1">
            <CancelBtn onClick={closePanel} />
            <SaveBtn saving={saving} label={editId ? 'Update Account' : 'Add Account'} />
          </div>
        </form>
      </SlidePanel>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// REFERRALS TAB
// ════════════════════════════════════════════════════════════════════════════
const emptyRefForm = () => ({
  company: '', referralCode: '', referralLink: '', instructions: '', isActive: true,
});

const ReferralsTab = () => {
  const [referrals, setReferrals]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [panelOpen, setPanelOpen]   = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(emptyRefForm());
  const [msg, setMsg]               = useState({ type: '', text: '' });

  const fetch_ = async () => {
    try {
      setLoading(true);
      const res  = await authFetch(`${BASE}/referrals`);
      const json = await res.json();
      setReferrals(Array.isArray(json.data) ? json.data : []);
    } catch { setReferrals([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyRefForm());
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const openEdit = (ref) => {
    setEditId(ref._id);
    setForm({
      company:      ref.company,
      referralCode: ref.referralCode || '',
      referralLink: ref.referralLink || '',
      instructions: ref.instructions,
      isActive:     ref.isActive !== false,
    });
    setMsg({ type: '', text: '' });
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setEditId(null); setForm(emptyRefForm()); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.instructions)
      return setMsg({ type: 'error', text: 'Company and instructions are required.' });
    setSaving(true); setMsg({ type: '', text: '' });
    try {
      const res  = await authFetch(`${BASE}/referrals`, {
        method: 'PUT',
        body: JSON.stringify({
          company:      form.company.trim(),
          referralCode: form.referralCode.trim() || undefined,
          referralLink: form.referralLink.trim() || undefined,
          instructions: form.instructions.trim(),
          isActive:     form.isActive,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Referral saved!' });
        await fetch_();
        setTimeout(() => closePanel(), 800);
      } else setMsg({ type: 'error', text: json.message || 'Failed to save.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!confirmDel) return;
    setDeleting(confirmDel._id);
    try {
      const res  = await authFetch(`${BASE}/referrals/${confirmDel._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { setConfirmDel(null); fetch_(); }
      else setMsg({ type: 'error', text: json.message || 'Delete failed.' });
    } catch (err) { setMsg({ type: 'error', text: err.message }); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      {confirmDel && (
        <DeleteModal item={confirmDel.company} label="Referral"
          onConfirm={confirmDelete} onCancel={() => setConfirmDel(null)} deleting={!!deleting} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#FFFFFF]/40">Prop firm referral codes and tracking links</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#FFFFFF]/30 bg-[#FFFFFF]/5 border border-[#FFFFFF]/8 px-3 py-1.5 rounded-lg">
            {referrals.length} referral{referrals.length !== 1 ? 's' : ''}
          </span>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6967FB] hover:bg-[#5856e0] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#6967FB]/25">
            + Add Referral
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : referrals.length === 0 ? (
        <EmptyState icon="🔗" label="referrals" onAdd={openAdd} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {referrals.map((ref) => (
            <div key={ref._id} className={`bg-[#FFFFFF]/4 border rounded-2xl p-5 ${ref.isActive ? 'border-[#FFFFFF]/8' : 'border-red-500/15 opacity-60'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="font-black text-white">{ref.company}</p>
                <Badge color={ref.isActive ? 'green' : 'red'}>
                  {ref.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Referral code spotlight */}
              {ref.referralCode && (
                <div className="bg-[#6967FB]/10 border border-[#6967FB]/20 rounded-xl px-4 py-3 mb-3">
                  <p className="text-xs text-[#FFFFFF]/35 mb-1">Referral Code</p>
                  <p className="text-base font-mono font-black text-[#6967FB] tracking-widest">{ref.referralCode}</p>
                </div>
              )}

              {/* Link */}
              {ref.referralLink && (
                <div className="bg-[#0A1720] border border-[#FFFFFF]/8 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-xs text-[#FFFFFF]/30 mb-0.5">Referral Link</p>
                  <p className="text-xs text-[#FFFFFF]/55 truncate font-mono">{ref.referralLink}</p>
                </div>
              )}

              {/* Instructions preview */}
              <div className="mb-4">
                <p className="text-xs text-[#FFFFFF]/30 mb-1">Instructions</p>
                <p className="text-xs text-[#FFFFFF]/50 line-clamp-2 leading-relaxed">{ref.instructions}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#FFFFFF]/8">
                <button onClick={() => openEdit(ref)}
                  className="flex-1 bg-[#6967FB]/10 border border-[#6967FB]/25 text-[#6967FB] py-2.5 rounded-xl text-sm font-bold hover:bg-[#6967FB]/20 transition-all">
                  ✎ Edit
                </button>
                <button onClick={() => setConfirmDel(ref)} disabled={deleting === ref._id}
                  className="bg-red-500/8 border border-red-500/15 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-500/15 transition-all disabled:opacity-50">
                  {deleting === ref._id ? '…' : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Panel */}
      <SlidePanel open={panelOpen} onClose={closePanel}
        title={editId ? 'Edit Referral' : 'Add Referral'}
        subtitle="Prop Firm · Referrals">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Msg msg={msg} />

          <Field label="Company" type="text" placeholder="e.g. FTMO"
            value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Referral Code" hint="(optional)" type="text" placeholder="e.g. FTH2025"
              value={form.referralCode} onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value }))} />
            <Field label="Referral Link" hint="(optional)" type="url" placeholder="https://..."
              value={form.referralLink} onChange={(e) => setForm((p) => ({ ...p, referralLink: e.target.value }))} />
          </div>

          <Field label="Instructions" textarea rows={5}
            placeholder={"Step-by-step instructions for users:\n1. Click the referral link\n2. Sign up with your email\n3. Enter the code at checkout"}
            value={form.instructions} onChange={(e) => setForm((p) => ({ ...p, instructions: e.target.value }))} required />

          <Toggle
            value={form.isActive}
            onChange={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            label="Active"
            hint="Toggle to show or hide this referral from users"
          />

          <div className="flex gap-3 pt-1">
            <CancelBtn onClick={closePanel} />
            <SaveBtn saving={saving} label={editId ? 'Update Referral' : 'Add Referral'} />
          </div>
        </form>
      </SlidePanel>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const PropFirmDashboard = () => {
  const [tab, setTab] = useState('accounts');

  const tabs = [
    { key: 'accounts',  icon: '💼', label: 'Accounts'  },
    { key: 'referrals', icon: '🔗', label: 'Referrals' },
  ];

  return (
    <DashboardLayout title="Prop Firm">
      <div className="max-w-4xl">
        {/* Tab bar */}
        <div className="flex gap-1 bg-[#FFFFFF]/4 border border-[#FFFFFF]/8 rounded-xl p-1 mb-8 w-fit">
          {tabs.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                tab === key
                  ? 'bg-[#6967FB] text-white shadow-lg shadow-[#6967FB]/25'
                  : 'text-[#FFFFFF]/40 hover:text-white'
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {tab === 'accounts'  && <AccountsTab  />}
        {tab === 'referrals' && <ReferralsTab />}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(PropFirmDashboard);