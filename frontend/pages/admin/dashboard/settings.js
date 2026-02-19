import { useState } from 'react';
import DashboardLayout from '@/component/DashboardLayout';
import withAuth from '@/middleware/withAuth';
import { useAuth } from '@/context/AuthContext';

const SettingsDashboard = () => {
  const { admin, changePassword } = useAuth();
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState({ type: '', text: '' });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (form.newPassword !== form.confirmPassword)
      return setMsg({ type: 'error', text: 'New passwords do not match.' });
    if (form.newPassword.length < 8)
      return setMsg({ type: 'error', text: 'New password must be at least 8 characters.' });

    setSaving(true);
    try {
      const data = await changePassword(form.currentPassword, form.newPassword);
      if (data.success) {
        setMsg({ type: 'success', text: 'Password changed successfully!' });
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-2xl mx-auto space-y-6 bg-[#0E1A1F] p-5 rounded-2xl">

        {/* Profile Card */}
        <div className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-2xl p-6">
          <h2 className="text-base font-bold text-[#FFFFFF] mb-5">Profile Information</h2>
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#6967FB]/20 border border-[#6967FB]/30 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-[#6967FB]">
                {admin?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-[#FFFFFF]">{admin?.username}</p>
              <p className="text-[#FFFFFF]/50 text-sm">{admin?.email}</p>
              <span className="inline-block mt-1 text-xs bg-[#C8F904]/10 text-[#C8F904] px-3 py-0.5 rounded-full border border-[#C8F904]/20">
                Admin
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0E1A1F] rounded-xl p-4 border border-[#FFFFFF]/5">
              <p className="text-xs text-[#FFFFFF]/40 mb-1">Username</p>
              <p className="text-[#FFFFFF] font-medium text-sm">{admin?.username}</p>
            </div>
            <div className="bg-[#0E1A1F] rounded-xl p-4 border border-[#FFFFFF]/5">
              <p className="text-xs text-[#FFFFFF]/40 mb-1">Email</p>
              <p className="text-[#FFFFFF] font-medium text-sm truncate">{admin?.email}</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handleSubmit} className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#FFFFFF]">Change Password</h2>
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="text-xs text-[#FFFFFF]/40 hover:text-[#FFFFFF]/70 transition-colors">
              {showPw ? 'Hide' : 'Show'} passwords
            </button>
          </div>

          {msg.text && (
            <div className={`px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-[#C8F904]/10 border border-[#C8F904]/20 text-[#C8F904]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
              {msg.text}
            </div>
          )}

          {[
            { name: 'currentPassword', label: 'Current Password',      placeholder: 'Enter current password' },
            { name: 'newPassword',     label: 'New Password',           placeholder: 'Min. 8 characters' },
            { name: 'confirmPassword', label: 'Confirm New Password',   placeholder: 'Repeat new password' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-[#FFFFFF]/60 mb-2">{label}</label>
              <input
                type={showPw ? 'text' : 'password'}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
                className="w-full bg-[#0E1A1F] border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/20 focus:outline-none focus:border-[#6967FB] transition-colors text-sm"
              />
            </div>
          ))}

          <button type="submit" disabled={saving}
            className="w-full bg-[#6967FB] text-[#FFFFFF] py-3.5 rounded-xl font-semibold hover:bg-[#6967FB]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />Saving...</>
              : 'Update Password'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default withAuth(SettingsDashboard);