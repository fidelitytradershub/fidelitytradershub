import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      const data = await register(form.name, form.username, form.email, form.password);
      if (data.success) {
        setSuccess('Registration successful! Please check your email to verify your account.');
        setForm({ name: '', username: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1A1F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
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

        {/* Card */}
        <div className="bg-[#FFFFFF]/5 rounded-3xl p-8 border border-[#FFFFFF]/10">
          <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Create account</h2>
          <p className="text-[#FFFFFF]/50 text-sm mb-8">Register a new admin account</p>

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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF]/70 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/30 focus:outline-none focus:border-[#6967FB] transition-colors"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF]/70 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe_admin"
                required
                className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/30 focus:outline-none focus:border-[#6967FB] transition-colors"
              />
              <p className="text-xs text-[#FFFFFF]/30 mt-1">Letters, numbers, and underscores only</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF]/70 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/30 focus:outline-none focus:border-[#6967FB] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF]/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 pr-12 text-[#FFFFFF] placeholder-[#FFFFFF]/30 focus:outline-none focus:border-[#6967FB] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFFFFF]/40 hover:text-[#FFFFFF]/70 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF]/70 mb-2">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                className="w-full bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 rounded-xl px-4 py-3 text-[#FFFFFF] placeholder-[#FFFFFF]/30 focus:outline-none focus:border-[#6967FB] transition-colors"
              />
            </div>

            {/* Submit */}
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
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-[#FFFFFF]/40 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#C8F904] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}