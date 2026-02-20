import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the QC relationship wellness app.',
}

export default function TermsPage(): React.ReactNode {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By creating an account or using QC, you agree to these terms of service. If you do not agree, please do
              not use the service. QC is a relationship wellness tool designed for couples to check in, track growth,
              and strengthen their connection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must provide a valid email address to create an account. You are responsible for maintaining the
              security of your account credentials. Each person should have their own individual account — do not share
              login credentials with your partner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              QC is intended for consensual use by both partners in a relationship. You agree not to use the service to
              harass, monitor, or control another person without their knowledge and consent. Both partners must
              voluntarily participate in the couple relationship within the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of all content you create in QC, including check-in responses, notes, milestones, and
              other data. By using the service, you grant QC a limited license to store and display your content as
              necessary to provide the service. Shared content is visible to your partner within the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              QC is provided on an &quot;as is&quot; basis. We strive to maintain high availability but do not guarantee
              uninterrupted access. We may perform maintenance, updates, or modifications to the service at any time. We
              will make reasonable efforts to notify users of planned downtime.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              QC is a communication and wellness tool, not a substitute for professional relationship counseling or
              therapy. We are not responsible for relationship outcomes resulting from use of the service. To the
              maximum extent permitted by law, QC shall not be liable for any indirect, incidental, or consequential
              damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time through your account settings. We reserve the right to suspend or
              terminate accounts that violate these terms. Upon termination, your personal data will be deleted in
              accordance with our privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms from time to time. We will notify you of significant changes via email or an
              in-app notification. Continued use of QC after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these terms, please reach out via our GitHub repository or the contact
              information provided in the app.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
