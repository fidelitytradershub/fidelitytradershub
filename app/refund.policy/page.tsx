import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-12 text-[var(--foreground)]">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-semibold text-[var(--brand-primary)]"
        >
          ← Back to Fidelity Traders Hub
        </Link>

        <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-black sm:text-4xl">
            Refund Policy
          </h1>

          <p className="mt-3 text-sm text-[var(--muted)]">
            Fidelity Nasir Innovation Limited · CAC RC 8581474
          </p>

          <div className="mt-8 space-y-6 leading-7 text-[var(--muted)]">
            <p>
              Refund requests are reviewed according to the product purchased,
              its delivery status, and any third-party costs already incurred.
            </p>

            <p>
              A refund may not be available after a digital product, account,
              subscription, login detail, or other service has been successfully
              delivered or activated.
            </p>

            <p>
              If Fidelity Traders Hub cannot fulfil an approved order, the
              customer may receive a replacement, wallet credit, or refund,
              depending on the circumstances.
            </p>

            <p>
              Customers should contact support with their payment reference and
              order details. Approved refunds will be returned through an
              appropriate payment method after verification.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}