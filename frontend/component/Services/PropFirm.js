import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import WhatsAppButton from '../Whatsappbutton';

// ─────────────────────────────────────────────
// Prop Firm Account Card
// ─────────────────────────────────────────────
const PropAccountCard = ({ account }) => {
  const price = account.price;
  const priceString = price
    ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 0 })} USD`
    : 'Price on Request';

  return (
    <div className="relative flex flex-col rounded-3xl p-8 bg-white border-2 border-[#0E1A1F]/8 transition-all hover:scale-[1.025] hover:border-[#6967FB]/30 hover:shadow-xl hover:shadow-[#6967FB]/8 shadow-sm">

      {/* Availability badge */}
      {account.isAvailable ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#C8F904] text-[#0E1A1F] text-xs font-black px-5 py-1.5 rounded-full shadow-md shadow-[#C8F904]/30 tracking-wider">
            AVAILABLE NOW
          </span>
        </div>
      ) : (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-[#0E1A1F]/70 text-white text-xs font-black px-5 py-1.5 rounded-full tracking-wider">
            SOLD OUT
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 text-center pt-2">
        <h3 className="text-2xl font-black text-[#0E1A1F] mb-1">{account.company}</h3>
        <p className="text-[#6967FB] font-bold text-base">{account.accountType}</p>
      </div>

      {/* Price */}
      <div className="mb-6 text-center py-5 rounded-2xl bg-[#0E1A1F]/3 border border-[#0E1A1F]/6">
        {price ? (
          <div className="flex items-end justify-center gap-2">
            <span className="text-5xl font-black text-[#0E1A1F] leading-none">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
            <span className="text-lg text-[#0E1A1F]/35 mb-1">USD</span>
          </div>
        ) : (
          <p className="text-xl font-black text-[#0E1A1F]/50">Price on Request</p>
        )}
      </div>

      {/* Description */}
      <p className="text-[#0E1A1F]/60 text-center mb-7 leading-relaxed text-sm">{account.description}</p>

      {/* Features */}
      {account.features?.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-black text-[#6967FB] uppercase tracking-widest mb-3 text-center">Key Features</p>
          <ul className="space-y-2.5">
            {account.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#C8F904] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-[#0E1A1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-[#0E1A1F]/65 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {account.benefits?.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-black text-[#6967FB] uppercase tracking-widest mb-3 text-center">Benefits</p>
          <ul className="space-y-2.5">
            {account.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#6967FB] flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-[#0E1A1F]/65 leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto">
        <WhatsAppButton
          service={`${account.company} — Funded Account`}
          plan={account.accountType} price={priceString}
          label={account.isAvailable ? 'Get Funded Account' : 'Currently Unavailable'}
          highlight disabled={!account.isAvailable} />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Referral Card
// ─────────────────────────────────────────────
const ReferralCard = ({ referral }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referral.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col rounded-3xl p-8 bg-white border-2 border-[#0E1A1F]/8 hover:border-[#6967FB]/30 hover:shadow-xl hover:shadow-[#6967FB]/8 transition-all shadow-sm h-full">
      <div className="mb-6">
        <p className="text-xs font-black text-[#6967FB] uppercase tracking-widest mb-1">Referral Partner</p>
        <h3 className="text-2xl font-black text-[#0E1A1F]">{referral.company}</h3>
      </div>

      {referral.referralCode && (
        <div className="mb-6">
          <label className="block text-xs text-[#0E1A1F]/40 mb-2 font-bold uppercase tracking-wider">Your Referral Code</label>
          <div className="flex items-center gap-3 bg-[#0E1A1F]/4 rounded-2xl p-4 border border-[#0E1A1F]/8">
            <code className="text-lg font-black font-mono text-[#6967FB] flex-1 break-all">{referral.referralCode}</code>
            <button onClick={handleCopy}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-[#C8F904] text-[#0E1A1F]' : 'bg-[#6967FB] text-white hover:bg-[#6967FB]/90'}`}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {referral.referralLink && (
        <div className="mb-7">
          <label className="block text-xs text-[#0E1A1F]/40 mb-2 font-bold uppercase tracking-wider">Direct Link</label>
          <a href={referral.referralLink} target="_blank" rel="noopener noreferrer"
            className="text-[#6967FB] hover:text-[#6967FB]/70 transition-colors break-all text-sm font-semibold hover:underline underline-offset-2">
            {referral.referralLink}
          </a>
        </div>
      )}

      <div className="mb-8 flex-1 bg-[#6967FB]/5 rounded-2xl p-5 border border-[#6967FB]/12">
        <p className="text-xs font-black text-[#6967FB] uppercase tracking-widest mb-2">How to Use</p>
        <p className="text-[#0E1A1F]/65 leading-relaxed text-sm">{referral.instructions}</p>
      </div>

      <WhatsAppButton
        service={`${referral.company} — Referral`}
        plan={referral.referralCode ? `Code: ${referral.referralCode}` : 'Referral Link'}
        price="" label="Apply Referral" highlight
        disabled={!referral.referralLink && !referral.referralCode} />
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Prop Firm Page
// ─────────────────────────────────────────────
const PropFirm = () => {
  const [accounts, setAccounts] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true); setError(null);
        const accRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prop-firm/accounts`);
        if (!accRes.ok) throw new Error('Failed to load prop accounts');
        setAccounts((await accRes.json()).data || []);

        const refRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prop-firm/referrals`);
        if (!refRes.ok) throw new Error('Failed to load referrals');
        setReferrals((await refRes.json()).data || []);
      } catch (err) {
        setError(err.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <Layout>
      <div className="py-20 px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-10 bg-[#C8F904]" />
              <span className="text-[#6967FB] text-xs font-black tracking-widest uppercase px-4 py-2 bg-[#6967FB]/8 rounded-full border border-[#6967FB]/20">
                Pay in Naira • Instant Access
              </span>
              <div className="h-px w-10 bg-[#C8F904]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-[#0E1A1F] mb-5 tracking-tight leading-tight">
              Prop Firm <span className="text-[#6967FB]">Accounts</span>
            </h1>
            <p className="text-lg text-[#0E1A1F]/50 max-w-2xl mx-auto leading-relaxed">
              Get funded trading accounts from the best prop firms — local payments in Naira, no dollar card required.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-5">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-[#6967FB]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-[#6967FB] border-t-transparent animate-spin" />
              </div>
              <p className="text-[#0E1A1F]/40 font-semibold">Loading prop firm offers...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-32">
              <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-12 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#0E1A1F] font-black text-2xl mb-3">Something went wrong</p>
                <p className="text-[#0E1A1F]/50 mb-8">{error}</p>
                <button onClick={() => window.location.reload()}
                  className="bg-[#6967FB] text-white px-10 py-3.5 rounded-full font-black hover:bg-[#6967FB]/90 transition shadow-lg shadow-[#6967FB]/25">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Accounts Grid */}
          {!loading && !error && accounts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {accounts.map((account) => <PropAccountCard key={account._id} account={account} />)}
            </div>
          )}

          {!loading && !error && accounts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#0E1A1F]/40 text-xl font-semibold mb-3">No funded accounts available right now</p>
              <p className="text-[#0E1A1F]/30 text-sm">New challenges and accounts are added regularly.</p>
            </div>
          )}

          {/* Referrals Section */}
          {!loading && !error && referrals.length > 0 && (
            <div className="mt-16 pt-16 border-t-2 border-[#0E1A1F]/6">
              <div className="text-center mb-14">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px w-10 bg-[#C8F904]" />
                  <span className="text-[#6967FB] text-xs font-black tracking-widest uppercase px-4 py-2 bg-[#6967FB]/8 rounded-full border border-[#6967FB]/20">
                    Save Money
                  </span>
                  <div className="h-px w-10 bg-[#C8F904]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#0E1A1F] mb-5 tracking-tight">
                  Referral <span className="text-[#6967FB]">Discounts</span>
                </h2>
                <p className="text-[#0E1A1F]/50 max-w-2xl mx-auto text-base leading-relaxed">
                  Use our exclusive referral codes and links — get better pricing on evaluations and support the community.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {referrals.map((ref) => <ReferralCard key={ref._id} referral={ref} />)}
              </div>
            </div>
          )}

          {!loading && !error && referrals.length === 0 && accounts.length > 0 && (
            <div className="mt-20 text-center text-[#0E1A1F]/35 font-medium">
              No active referral offers at the moment — check back later!
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default PropFirm;