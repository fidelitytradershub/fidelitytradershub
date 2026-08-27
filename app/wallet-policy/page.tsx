import Link from "next/link";

export default function WalletPolicyPage() {
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
            Wallet & Payments Policy
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Fidelity Traders Hub
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-lg font-bold text-amber-300">
            Important
          </h2>

          <p className="mt-3 leading-7 text-slate-300">
            The Fidelity Traders Hub wallet is an internal platform
            balance designed to help users pay for eligible products
            and services available through Fidelity Traders Hub.
          </p>

          <p className="mt-3 leading-7 text-slate-300">
            It is not a bank account, savings account, investment
            account, interest-bearing account, or independent payment
            service.
          </p>
        </div>

        <div className="mt-10 space-y-10 leading-7 text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-white">
              1. Purpose of the Wallet
            </h2>

            <p className="mt-3">
              The Fidelity Traders Hub wallet allows eligible users to
              maintain an internal balance for transactions available
              through the platform.
            </p>

            <p className="mt-3">
              Wallet balances may be used for supported products,
              services, subscriptions, marketplace purchases, or other
              eligible Fidelity Traders Hub transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              2. Wallet Balance
            </h2>

            <p className="mt-3">
              Your displayed wallet balance may reflect completed
              credits and debits, pending withdrawals, purchases,
              reversals, adjustments, and other authorized platform
              transactions.
            </p>

            <p className="mt-3">
              A displayed balance does not represent interest-bearing
              funds or an investment return.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              3. Deposits
            </h2>

            <p className="mt-3">
              Users may be permitted to submit deposit requests through
              Fidelity Traders Hub.
            </p>

            <p className="mt-3">
              A submitted deposit request does not become available for
              use until the payment has been verified and approved.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub may request supporting information,
              payment references, receipts, or other reasonable evidence
              required to confirm a payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              4. Deposit Verification
            </h2>

            <p className="mt-3">
              Deposits may remain pending while payment confirmation is
              being reviewed.
            </p>

            <p className="mt-3">
              A deposit may be rejected where:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>The payment cannot be verified.</li>
              <li>The amount or reference does not match the request.</li>
              <li>Payment information appears inaccurate or incomplete.</li>
              <li>Fraudulent or suspicious activity is reasonably suspected.</li>
              <li>The payment has been reversed, cancelled, or disputed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              5. Using Wallet Funds
            </h2>

            <p className="mt-3">
              Available wallet funds may be used only for transactions
              supported by Fidelity Traders Hub.
            </p>

            <p className="mt-3">
              A purchase may be rejected if your available balance is
              insufficient or if the requested product is no longer
              available.
            </p>

            <p className="mt-3">
              Where a purchase is successfully completed, the
              corresponding amount may be recorded as a debit against
              your wallet balance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              6. Withdrawals
            </h2>

            <p className="mt-3">
              Eligible users may request withdrawal of eligible wallet
              funds using the withdrawal functionality provided through
              the platform.
            </p>

            <p className="mt-3">
              Withdrawal requests are subject to review before payout.
            </p>

            <p className="mt-3">
              Submitting a withdrawal request does not mean payment has
              already been sent to your bank account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              7. Pending Withdrawal Reservations
            </h2>

            <p className="mt-3">
              When a withdrawal request is submitted, the requested
              amount may be reserved or removed from the amount shown as
              available for new transactions while the withdrawal is
              being reviewed.
            </p>

            <p className="mt-3">
              This helps prevent the same funds from being used for
              another purchase or withdrawal while the request remains
              open.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              8. Withdrawal Status
            </h2>

            <p className="mt-3">
              A withdrawal may pass through statuses such as:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Pending.</li>
              <li>Approved.</li>
              <li>Processing.</li>
              <li>Completed.</li>
              <li>Rejected.</li>
            </ul>

            <p className="mt-3">
              A withdrawal should only be considered paid once it has
              been marked completed following actual payout processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              9. Bank Account Details
            </h2>

            <p className="mt-3">
              Users are responsible for providing accurate withdrawal
              bank-account information.
            </p>

            <p className="mt-3">
              This may include the account holder name, bank name,
              account number, and any additional information reasonably
              required for payout verification.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub is not responsible for delays or
              failed payments caused by incorrect bank information
              supplied by the user, except where applicable law provides
              otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              10. Withdrawal Review and Rejection
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may reject, delay, or investigate a
              withdrawal where:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Available funds are insufficient.</li>
              <li>Bank information is missing or inconsistent.</li>
              <li>The request appears duplicated.</li>
              <li>A transaction or deposit is disputed.</li>
              <li>Fraud or unauthorized activity is reasonably suspected.</li>
              <li>Additional account verification is required.</li>
              <li>A technical or payment-processing problem affects payout.</li>
            </ul>

            <p className="mt-3">
              Where a withdrawal is rejected, the platform may display a
              reason for the decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              11. Failed, Reversed, or Incorrect Transactions
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may correct wallet records where a
              transaction was duplicated, reversed, incorrectly posted,
              fraudulently obtained, or affected by a verified technical
              error.
            </p>

            <p className="mt-3">
              Where an adjustment is required, reasonable transaction
              records should be maintained showing the change.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              12. Transaction Records
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may maintain transaction records
              including deposits, purchases, withdrawals, adjustments,
              refunds, reversals, references, dates, and status
              information.
            </p>

            <p className="mt-3">
              These records may be used for support, reconciliation,
              dispute resolution, fraud prevention, accounting, and
              compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              13. Processing Times
            </h2>

            <p className="mt-3">
              Processing times may vary depending on verification,
              banking systems, payment providers, weekends, public
              holidays, technical conditions, fraud review, and other
              circumstances.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub should not represent a transaction as
              completed until the relevant verification or payout process
              has actually been completed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              14. Fees
            </h2>

            <p className="mt-3">
              Where transaction, withdrawal, processing, or service fees
              apply, users should be informed before or as part of the
              relevant transaction where reasonably practicable.
            </p>

            <p className="mt-3">
              Applicable fees may be reflected in transaction records,
              including the amount requested, processing fee, and net
              payout amount.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              15. Fraud and Unauthorized Activity
            </h2>

            <p className="mt-3">
              You must not use the wallet in connection with stolen
              payment methods, unauthorized transactions, impersonation,
              chargeback abuse, money laundering, fraud, or other
              unlawful activity.
            </p>

            <p className="mt-3">
              Fidelity Traders Hub may restrict wallet functions,
              suspend transactions, request verification, or suspend an
              account where suspicious activity is reasonably detected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              16. Wallet Security
            </h2>

            <p className="mt-3">
              Users are responsible for protecting their Fidelity
              Traders Hub account credentials.
            </p>

            <p className="mt-3">
              If you believe your account or wallet has been accessed
              without authorization, contact Fidelity Traders Hub
              Support as soon as reasonably possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              17. Refunds
            </h2>

            <p className="mt-3">
              Refunds are governed by the Fidelity Traders Hub Refund
              Policy and any rights available under applicable law.
            </p>

            <p className="mt-3">
              A wallet credit, transaction reversal, or refund should
              not be treated as final until it has been successfully
              processed and reflected in the relevant records.
            </p>

            <Link
              href="/refund-policy"
              className="mt-3 inline-block font-semibold text-blue-400 hover:text-blue-300"
            >
              View Refund Policy →
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              18. Pay Small Small
            </h2>

            <p className="mt-3">
              Amounts committed to Pay Small Small may be subject to
              separate rules governing savings goals, cancellation,
              product completion, price changes, refunds, and conversion
              into a purchase.
            </p>

            <Link
              href="/pay-small-small-terms"
              className="mt-3 inline-block font-semibold text-blue-400 hover:text-blue-300"
            >
              View Pay Small Small Terms →
            </Link>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              19. No Interest or Investment Return
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub does not promise interest,
              investment returns, yield, profit, or appreciation merely
              because money is represented in a wallet balance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              20. Account Restrictions
            </h2>

            <p className="mt-3">
              Wallet access may be limited, suspended, or restricted
              where required to investigate fraud, unauthorized access,
              disputes, technical errors, suspicious transactions, or
              serious violations of the Fidelity Traders Hub Terms &
              Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              21. Privacy
            </h2>

            <p className="mt-3">
              Information relating to wallet transactions, deposits,
              withdrawals, bank details, and payment verification is
              handled in accordance with the Fidelity Traders Hub
              Privacy Policy.
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
              22. Changes to This Policy
            </h2>

            <p className="mt-3">
              Fidelity Traders Hub may update this Wallet & Payments
              Policy where necessary to reflect operational, payment,
              security, legal, or platform changes.
            </p>

            <p className="mt-3">
              The current version will be made available through the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              23. Contact and Transaction Disputes
            </h2>

            <p className="mt-3">
              If you believe a deposit, wallet transaction, purchase, or
              withdrawal has been recorded incorrectly, contact Fidelity
              Traders Hub Support and provide the relevant transaction
              reference and supporting information.
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
            This Wallet & Payments Policy is a working platform draft
            and should receive final Nigerian legal/regulatory review
            before public launch.
          </p>
        </div>
      </div>
    </main>
  );
}