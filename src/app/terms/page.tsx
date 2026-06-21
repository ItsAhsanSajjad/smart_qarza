import type { Metadata } from 'next'
import { LegalLayout, Section } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Terms of Service — GEO Loan.pk',
  description: 'The terms and conditions for using the GEO Loan.pk digital lending platform.',
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      updated="20 June 2026"
      intro="These terms set out the rules for using GEO Loan.pk. Please read them carefully before creating an account or applying for a loan."
    >
      <Section title="1. Acceptance of Terms">
        <p>
          By creating an account or using GEO Loan.pk (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of
          Service and our Privacy Policy. If you do not agree, please do not use the Service.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>To use the Service, you must:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>be at least 18 years of age;</li>
          <li>be a resident of Pakistan with a valid CNIC;</li>
          <li>provide accurate, current, and complete information; and</li>
          <li>have the legal capacity to enter into a binding agreement.</li>
        </ul>
      </Section>

      <Section title="3. Your Account">
        <p>
          You are responsible for keeping your login credentials confidential and for all activity that occurs under your
          account. Set a strong password and choose a security answer only you would know. Notify us immediately if you
          suspect any unauthorised use of your account.
        </p>
      </Section>

      <Section title="4. Identity Verification (KYC)">
        <p>
          Before you can apply for a loan, you must complete identity verification by submitting accurate personal details
          and genuine identity documents. We may approve, decline, or request additional information at our discretion.
          Submitting false, altered, or someone else&rsquo;s documents is strictly prohibited and may result in account
          termination and referral to the authorities.
        </p>
      </Section>

      <Section title="5. Loans, Fees, and Repayment">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Loan approval is not guaranteed and is granted at our sole discretion based on your eligibility and verification.</li>
          <li>
            Each loan is subject to an agreed markup (service charge), a down payment, and an instalment schedule, all of
            which are shown to you before you confirm the loan.
          </li>
          <li>You agree to repay the loan in full according to the schedule presented at the time of approval.</li>
          <li>The applicable rates, fees, and packages are set out in the app and may be updated from time to time.</li>
        </ul>
      </Section>

      <Section title="6. Payments and Verification">
        <p>
          Where a payment is made by bank or mobile-wallet transfer, you must upload a clear, genuine screenshot or receipt
          as confirmation. Our team reviews each submission, and a payment is only considered complete once it has been
          verified. Submitting fake or edited payment proofs is prohibited.
        </p>
      </Section>

      <Section title="7. Withdrawals">
        <p>
          Withdrawal of approved funds becomes available after the required steps for your loan are completed and verified.
          You must provide accurate account details for any withdrawal. We are not responsible for delays or losses caused
          by incorrect details you provide.
        </p>
      </Section>

      <Section title="8. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>provide false, misleading, or fraudulent information;</li>
          <li>impersonate another person or use another person&rsquo;s identity documents;</li>
          <li>attempt to bypass, probe, or disrupt the security of the Service;</li>
          <li>use the Service for any unlawful purpose.</li>
        </ul>
      </Section>

      <Section title="9. Disclaimers">
        <p>
          The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee that
          loans will be approved, that the Service will be uninterrupted or error-free, or that any particular outcome will
          be achieved. Nothing in the app constitutes financial advice.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, GEO Loan.pk shall not be liable for any indirect, incidental, or
          consequential damages, or for any loss arising from inaccurate information you provide or from unauthorised use
          of your account.
        </p>
      </Section>

      <Section title="11. Suspension and Termination">
        <p>
          We may suspend or terminate your account if you breach these Terms, provide false information, or engage in
          fraudulent or unlawful activity. You may request closure of your account at any time, subject to settlement of
          any outstanding obligations.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These Terms are governed by the laws of the Islamic Republic of Pakistan, and any disputes shall be subject to
          the exclusive jurisdiction of the courts of Pakistan.
        </p>
      </Section>

      <Section title="13. Changes to These Terms">
        <p>
          We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date above reflects the latest
          version. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="14. Contact Us">
        <p>
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:info@geoloan.pk" className="text-primary font-medium hover:underline">info@geoloan.pk</a>.
        </p>
      </Section>
    </LegalLayout>
  )
}
