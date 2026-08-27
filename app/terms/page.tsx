import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300"
        >
          ← Back to Fidelity Traders Hub
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Legal
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Terms & Conditions
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Fidelity Traders Hub
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-lg font-bold text-amber-300">
            Important Prop Firm Disclaimer
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            Fidelity Traders Hub is an independent third-party
            service provider and facilitator. We are not a
            proprietary trading firm and do not create, fund,
            manage, control, or own proprietary trading accounts
            unless expressly stated otherwise.
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            Where proprietary trading accounts or related services
            are made available through our platform, they may be
            supplied, transferred, processed, or facilitated through
            independent third parties. Users remain responsible for
            complying with the rules, agreements, requirements, and
            policies of the applicable proprietary trading firm.
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            Fidelity Traders Hub does not represent, control, or act
            on behalf of any proprietary trading firm unless an
            official relationship is expressly stated.
          </p>
        </div>

        <div className="mt-10 space-y-10 leading-7 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white">
              1. Acceptance of These Terms
            </h2>

            <p className="mt-3">
              By accessing, creating an account on, purchasing
              through, or otherwise using Fidelity Traders Hub, you
              agree to these Terms & Conditions and any additional
              policies applicable to specific services.
            </p>

            <p className="mt-3">
              If you do not agree with these terms, you should not
              use the platform or any Fidelity Traders Hub service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              2. About Fidelity Traders Hub
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub is an independent digital platform
              designed to provide traders with access to trading
              tools, digital services, proprietary trading-related
              products, subscription services, wallet functionality,
              savings tools, marketplace products, and trading
              journal features.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub is operated independently and is
              not affiliated with Fidelity Investments or any related
              entity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              3. Scope of Services
            </h2>

            <p className="mt-3">
              Our services may include, but are not limited to:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Proprietary trading firm-related products or account processing.</li>
              <li>TradingView-related services and subscriptions.</li>
              <li>Digital tools and software subscriptions.</li>
              <li>Marketplace products.</li>
              <li>Wallet deposits, withdrawals, and transaction records.</li>
              <li>Pay Small Small savings functionality.</li>
              <li>Trade Journal and trading analytics tools.</li>
              <li>Support and communication services.</li>
              <li>Promotional or bonus subscription access.</li>
            </ul>

            <p className="mt-3">
              We may add, remove, suspend, or modify services where
              reasonably necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              4. User Accounts
            </h2>

            <p className="mt-3">
              You are responsible for providing accurate information
              when creating an account and for keeping your login
              credentials confidential.
            </p>

            <p className="mt-3">
              You are responsible for activity carried out through
              your account. You must not attempt to access another
              user's account, data, wallet, journal, or administrative
              functions without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              5. Third-Party Services
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may provide access to or facilitate
              services associated with third-party companies,
              platforms, prop firms, software providers, and digital
              service providers.
            </p>

            <p className="mt-3">
              All trademarks, company names, product names, and
              intellectual property belonging to third parties remain
              the property of their respective owners.
            </p>

            <p className="mt-3">
              Unless expressly stated, Fidelity Traders Hub is not
              affiliated with, endorsed by, partnered with, or acting
              on behalf of those third-party providers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              6. Proprietary Trading Firm Services
            </h2>

            <p className="mt-3">
              Users acknowledge that proprietary trading firms operate
              under their own rules, contracts, restrictions,
              objectives, trading conditions, and enforcement
              procedures.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub has no authority to override,
              modify, interpret, or influence the decisions of an
              independent proprietary trading firm.
            </p>

            <p className="mt-3">
              We are not liable for account suspensions, failures,
              breaches, terminations, bans, rule violations, funding
              losses, or other consequences resulting from the actions
              of the trader or the decisions of the applicable prop
              firm.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              7. TradingView and Digital Subscription Services
            </h2>

            <p className="mt-3">
              TradingView and other digital subscription services made
              available through Fidelity Traders Hub remain subject to
              the policies and operating conditions of the underlying
              service provider.
            </p>

            <p className="mt-3">
              Service interruptions, password changes, regional
              limitations, account restrictions, policy changes,
              platform updates, bans, or modifications imposed by the
              original provider may be outside our control.
            </p>

            <p className="mt-3">
              Subscription periods, activation details, and expiry
              information may be displayed in your Fidelity Traders
              Hub dashboard where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              8. Marketplace Purchases
            </h2>

            <p className="mt-3">
              Marketplace products are subject to availability.
              Displaying a product as available does not guarantee that
              it will remain available until a transaction has been
              successfully completed.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub may cancel, reverse, or refuse a
              transaction where a product becomes unavailable or where
              fraud, abuse, technical error, pricing error, or another
              legitimate concern is identified.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              9. Wallet
            </h2>

            <p className="mt-3">
              The Fidelity Traders Hub wallet is an internal platform
              balance used for eligible transactions and services
              available through the platform.
            </p>

            <p className="mt-3">
              The wallet is not a bank account, investment account,
              savings bank product, or interest-bearing financial
              product.
            </p>

            <p className="mt-3">
              Wallet balances may reflect completed deposits,
              purchases, withdrawals, reservations, reversals, and
              other authorized platform transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              10. Deposits
            </h2>

            <p className="mt-3">
              Deposit requests may be subject to verification before
              wallet credit is applied.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub may request additional information
              where required to verify a payment, investigate a
              discrepancy, or prevent fraud.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              11. Withdrawals
            </h2>

            <p className="mt-3">
              Withdrawal requests may be subject to review and
              verification before payment is completed.
            </p>

            <p className="mt-3">
              Users are responsible for providing accurate bank or
              payout information.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub may delay, reject, or investigate a
              withdrawal where information is incomplete, suspicious,
              inconsistent, or where security or fraud concerns exist.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              12. Pay Small Small
            </h2>

            <p className="mt-3">
              Pay Small Small allows eligible users to save gradually
              toward selected Fidelity Traders Hub products or
              services.
            </p>

            <p className="mt-3">
              Savings progress does not by itself guarantee that a
              third-party product will remain available at the same
              price or under the same provider conditions until the
              goal is completed.
            </p>

            <p className="mt-3">
              Additional terms regarding cancellation, completion,
              refunds, conversion into a purchase, and price changes
              may apply under the Pay Small Small Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              13. Trade Journal
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may provide users with access to a
              Trade Journal for recording and reviewing trading
              activity, risk plans, trading accounts, screenshots,
              performance statistics, notes, psychology information,
              and other trading-related information voluntarily
              entered by the user.
            </p>

            <p className="mt-3">
              The Trade Journal is intended as a planning, record
              keeping, analysis, and self-review tool only.
            </p>

            <p className="mt-3">
              Trade Journal statistics, reports, analytics, and
              insights are based on the information recorded in the
              platform and should not be treated as investment advice,
              financial advice, trading signals, or guarantees of
              future performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              14. Trade Journal Free, Pro, and Promotional Access
            </h2>

            <p className="mt-3">
              Trade Journal functionality may be provided under free,
              paid, promotional, bonus, or subscription-based access.
            </p>

            <p className="mt-3">
              Certain purchases or promotions may include temporary
              Trade Journal access. Such access may expire at the end
              of the stated promotional or subscription period unless
              renewed or otherwise extended.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub may change the features included in
              free or paid plans, provided that existing paid access is
              handled reasonably and in accordance with applicable
              consumer obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              15. No Financial Advice
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub does not provide personalized
              investment advice, financial advice, trading signals,
              portfolio management, or profit guarantees.
            </p>

            <p className="mt-3">
              All trading and financial decisions remain the sole
              responsibility of the user.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              16. Trading Risk
            </h2>

            <p className="mt-3">
              Forex, CFD, cryptocurrency, proprietary trading, and
              other forms of leveraged or speculative trading involve
              significant risk.
            </p>

            <p className="mt-3">
              Past performance does not guarantee future results.
              Users should only trade with funds they can afford to
              lose and should understand the rules and risks of any
              trading environment they use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              17. Payments and Refunds
            </h2>

            <p className="mt-3">
              Payments for digital products and services may be final
              once a product has been delivered, activated, assigned,
              transferred, or otherwise substantially fulfilled.
            </p>

            <p className="mt-3">
              Refund eligibility, where applicable, will be determined
              according to our Refund Policy, the circumstances of the
              transaction, and any applicable consumer protection
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              18. Fraud, Abuse, and Prohibited Use
            </h2>

            <p className="mt-3">
              You must not use Fidelity Traders Hub for fraud,
              unauthorized transactions, stolen payment methods,
              impersonation, abusive conduct, account manipulation,
              attempts to bypass security controls, or unlawful
              activity.
            </p>

            <p className="mt-3">
              We reserve the right to investigate, restrict, suspend,
              or refuse transactions or accounts where fraudulent,
              suspicious, abusive, or unlawful activity is reasonably
              suspected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              19. Account Suspension or Termination
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may suspend or restrict access where
              necessary to protect users, investigate suspected fraud,
              enforce these Terms, comply with legal obligations, or
              address serious misuse of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              20. Service Availability
            </h2>

            <p className="mt-3">
              We aim to provide reliable access to Fidelity Traders
              Hub, but we do not guarantee uninterrupted availability.
            </p>

            <p className="mt-3">
              Maintenance, technical problems, internet outages,
              third-party provider failures, security incidents, or
              circumstances outside our control may occasionally
              affect access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              21. Limitation of Liability
            </h2>

            <p className="mt-3">
              To the fullest extent permitted by applicable law,
              Fidelity Traders Hub shall not be responsible for trading
              losses, missed trading opportunities, prop firm rule
              violations, third-party provider actions, user mistakes,
              unauthorized user conduct, or financial decisions made
              by users.
            </p>

            <p className="mt-3">
              Nothing in these Terms excludes liability that cannot
              legally be excluded under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              22. Indemnification
            </h2>

            <p className="mt-3">
              To the extent permitted by law, users agree to indemnify
              and hold Fidelity Traders Hub harmless from claims,
              losses, damages, disputes, or liabilities arising from
              unlawful use of the platform, fraud, misuse of third-party
              accounts, violation of provider rules, or breach of these
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              23. Intellectual Property
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub branding, design, software,
              platform functionality, and original content remain the
              property of Fidelity Traders Hub or its licensors.
            </p>

            <p className="mt-3">
              Users retain ownership of original trading notes,
              screenshots, and journal information they submit,
              subject to the permissions required for Fidelity Traders
              Hub to store, process, display, and operate those
              features on their behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              24. Privacy
            </h2>

            <p className="mt-3">
              Our collection and use of personal information is
              governed by our Privacy Policy.
            </p>

            <Link
              href="/privacy"
              className="mt-3 inline-block font-semibold text-blue-400 hover:text-blue-300"
            >
              View Privacy Policy →
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              25. Changes to These Terms
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may update these Terms from time to
              time to reflect changes to the platform, services,
              business operations, legal requirements, or security
              practices.
            </p>

            <p className="mt-3">
              The latest version will be made available through the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              26. Governing Law
            </h2>

            <p className="mt-3">
              These Terms shall be governed and interpreted in
              accordance with the laws of the Federal Republic of
              Nigeria, subject to any mandatory rights or protections
              that may apply under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              27. Contact and Support
            </h2>

            <p className="mt-3">
              Questions regarding these Terms may be submitted through
              Fidelity Traders Hub Support or through our official
              communication channels.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
              >
                Open Support
              </Link>

              <a
                href="https://wa.me/2348035823744"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-slate-200 hover:bg-slate-900"
              >
                WhatsApp Support
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Email: fidelitytradershub@gmail.com
            </p>
          </section>
        </div>

        <div className="mt-14 border-t border-slate-800 pt-8">
          <p className="text-sm text-slate-500">
            This page is a working platform Terms & Conditions draft
            and should receive final legal review before public launch.
          </p>
        </div>
      </div>
    </main>
  );
}