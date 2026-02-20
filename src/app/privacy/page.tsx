import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How QC handles and protects your personal data.',
}

export default function PrivacyPage(): React.ReactNode {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              QC collects the minimum information needed to provide our relationship wellness service. This includes
              your email address, display name, and any content you create within the app such as check-in responses,
              notes, reminders, and relationship milestones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information is used solely to provide and improve the QC service. We use your email for
              authentication, partner invitations, and optional reminder notifications. Your relationship data is used
              to power features like check-in history, growth tracking, and shared notes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using Supabase, which provides enterprise-grade encryption at rest and in
              transit. All data access is scoped to your couple — only you and your partner can see your shared content.
              Private notes and love language profiles remain visible only to their author.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or share your personal data with third parties. We do not use your data for
              advertising. The only third-party services that process your data are our infrastructure providers
              (Supabase for database, Vercel for hosting, Resend for email delivery), and only as necessary to operate
              the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can access, update, or delete your personal data at any time through your account settings. If you
              leave a couple, your shared data remains accessible to your former partner. You can request complete
              deletion of your account and all associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              QC uses essential cookies only — for authentication and session management. We do not use tracking
              cookies, analytics cookies, or any third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any significant changes via
              email or an in-app notification. Continued use of QC after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy or your data, please reach out via our GitHub repository
              or the contact information provided in the app.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
