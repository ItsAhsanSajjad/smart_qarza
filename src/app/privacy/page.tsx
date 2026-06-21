import type { Metadata } from 'next'
import { LegalLayout, Section } from '@/components/legal/legal-layout'

export const metadata: Metadata = {
  title: 'Privacy Policy — GEO Loan.pk',
  description: 'How GEO Loan.pk collects, uses, and protects your personal and identity information.',
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="20 June 2026"
      intro="Your privacy matters to us. This policy explains what information GEO Loan.pk collects, why we collect it, and how we keep it safe."
    >
      <Section title="1. Introduction">
        <p>
          GEO Loan.pk (&ldquo;GEO Loan&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates a digital lending
          platform that lets users register, complete identity verification (KYC), apply for loans, and manage repayments.
          This Privacy Policy describes how we handle your information when you use our website and application.
        </p>
        <p>By using GEO Loan.pk, you agree to the collection and use of information as described in this policy.</p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect only the information needed to provide our services:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Account information:</strong> your full name, mobile number, and a password you set.</li>
          <li>
            <strong>Identity / KYC information:</strong> your CNIC number, photos of your CNIC (front and back), a selfie,
            date of birth, and address — used solely to verify your identity.
          </li>
          <li>
            <strong>Financial information:</strong> the loan package you select, payment confirmation screenshots you upload,
            and the account details you provide for withdrawals.
          </li>
          <li><strong>Technical information:</strong> basic device and log data generated when you use the service.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To create and manage your account.</li>
          <li>To verify your identity and meet Know-Your-Customer obligations.</li>
          <li>To process loan applications, payments, and withdrawals.</li>
          <li>To detect, prevent, and investigate fraud or misuse.</li>
          <li>To provide customer support and send you service notifications.</li>
          <li>To comply with applicable laws and lawful requests from authorities.</li>
        </ul>
      </Section>

      <Section title="4. How We Share Information">
        <p>We do <strong>not</strong> sell your personal information. We may share it only:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>with trusted service providers who help us operate the platform, under confidentiality obligations;</li>
          <li>when required by law, regulation, court order, or a valid request from a government authority;</li>
          <li>to protect the rights, safety, and security of our users and our platform;</li>
          <li>with your consent, or at your direction.</li>
        </ul>
      </Section>

      <Section title="5. How We Protect Your Information">
        <p>
          We take the security of your data seriously. Passwords and security answers are stored as one-way encrypted
          hashes — never in plain text. Identity documents and payment screenshots are stored outside the public web area
          and are accessible only through authenticated, access-controlled requests. We restrict internal access to
          personal data to authorised personnel only.
        </p>
        <p>
          No method of transmission or storage is completely secure, so while we work hard to protect your information,
          we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We keep your information for as long as your account is active and as needed to provide our services. We may
          retain certain records for longer where required to comply with legal, regulatory, tax, or fraud-prevention
          obligations. When data is no longer needed, we delete or anonymise it.
        </p>
      </Section>

      <Section title="7. Your Rights and Choices">
        <p>Subject to applicable law, you may:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>access the personal information we hold about you;</li>
          <li>request correction of inaccurate or incomplete information;</li>
          <li>request deletion of your account and associated data;</li>
          <li>withdraw consent where processing is based on consent.</li>
        </ul>
        <p>To exercise any of these rights, contact us at <a href="mailto:info@geoloan.pk" className="text-primary font-medium hover:underline">info@geoloan.pk</a>.</p>
      </Section>

      <Section title="8. Cookies and Sessions">
        <p>
          We use a secure, signed session cookie to keep you logged in. This cookie is essential to the operation of the
          service and is not used for advertising or third-party tracking.
        </p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          GEO Loan.pk is intended only for individuals who are 18 years of age or older. We do not knowingly collect
          information from anyone under 18.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last updated&rdquo;
          date above. Significant changes will be communicated through the app or by other appropriate means.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>
          If you have questions about this Privacy Policy or how your data is handled, contact us at{' '}
          <a href="mailto:info@geoloan.pk" className="text-primary font-medium hover:underline">info@geoloan.pk</a>.
        </p>
      </Section>
    </LegalLayout>
  )
}
