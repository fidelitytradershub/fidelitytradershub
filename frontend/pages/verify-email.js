import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { verifyEmail } from '../services/authService';
import Image from 'next/image';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyEmail(token);
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [router.isReady, token]);

  return (
    <div className="min-h-screen bg-[#0E1A1F] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

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

        <div className="bg-[#FFFFFF]/5 rounded-3xl p-10 border border-[#FFFFFF]/10">

          {/* Loading */}
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-[#6967FB] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-[#FFFFFF] mb-2">Verifying your email</h2>
              <p className="text-[#FFFFFF]/50 text-sm">Please wait a moment...</p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-[#C8F904]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#C8F904]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#FFFFFF] mb-3">Email Verified!</h2>
              <p className="text-[#FFFFFF]/60 text-sm mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-block bg-[#6967FB] text-[#FFFFFF] px-8 py-3.5 rounded-xl font-semibold hover:bg-[#6967FB]/90 transition-all hover:scale-[1.02]"
              >
                Sign In Now
              </Link>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#FFFFFF] mb-3">Verification Failed</h2>
              <p className="text-[#FFFFFF]/60 text-sm mb-8">{message}</p>
              <Link
                href="/login"
                className="inline-block bg-[#6967FB] text-[#FFFFFF] px-8 py-3.5 rounded-xl font-semibold hover:bg-[#6967FB]/90 transition-all hover:scale-[1.02]"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}