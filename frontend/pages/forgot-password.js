// ─── pages/forgot-password.jsx ───────────────────────────────
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      if (data.success) {
        setSuccess('Password reset email sent! Please check your inbox.');
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1A1F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-10">
          <Link href="/" className="flex items-center space-x-3">
              <Image
                src="https://res.cloudinary.com/dllfdzyji/image/upload/v1770914488/L4_bnpq15.png"
                alt="FidelityTradersHub Logo"
                height={80}
                width={270}
                className="object-contain relative"
                priority // Good for header logo (loads faster)
              />
           
          </Link>
        </div>

        <div className="bg-[#FFFFFF]/5 rounded-3xl p-8 border border-[#FFFFFF]/10">
          <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Forgot password?</h2>
          <p className="text-[#FFFFFF]/50 text-sm mb-8">
            Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-[#C8F904]/10 border border-[#C8F904]/20 rounded-xl px-4 py-3 mb-6 text-[#C8F904] text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF]/70 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/30 focus:outline-none focus:border-[#6967FB] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6967FB] text-[#FFFFFF] py-3.5 rounded-xl font-semibold hover:bg-[#6967FB]/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending...
                </span>
              ) : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-[#FFFFFF]/40 text-sm mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-[#C8F904] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}