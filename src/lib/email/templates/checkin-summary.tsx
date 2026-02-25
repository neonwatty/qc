import { Html, Head, Body, Container, Text, Button, Link } from '@react-email/components'

interface CheckInSummaryEmailProps {
  yourMood?: string
  partnerMood?: string
  categories?: string[]
  actionItemCount?: number
  notesUrl?: string
  unsubscribeUrl?: string
}

export function CheckInSummaryEmail({
  yourMood = 'Great',
  partnerMood = 'Great',
  categories = [],
  actionItemCount = 0,
  notesUrl = 'https://tryqc.co/notes',
  unsubscribeUrl,
}: CheckInSummaryEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Check-In Complete</Text>
          <Text style={paragraph}>
            Great job connecting with your partner! Here's a summary of your check-in session.
          </Text>
          <Container style={summaryBox}>
            <Text style={summaryHeading}>Mood Check-In</Text>
            <Text style={summaryItem}>You: {yourMood}</Text>
            <Text style={summaryItem}>Partner: {partnerMood}</Text>
          </Container>
          {categories.length > 0 && (
            <Container style={summaryBox}>
              <Text style={summaryHeading}>Topics Discussed</Text>
              {categories.map((category, i) => (
                <Text key={i} style={summaryItem}>
                  • {category}
                </Text>
              ))}
            </Container>
          )}
          {actionItemCount > 0 && (
            <Text style={paragraph}>
              You created {actionItemCount} action {actionItemCount === 1 ? 'item' : 'items'} during this check-in.
            </Text>
          )}
          <Button style={button} href={notesUrl}>
            View Notes & Action Items
          </Button>
          <Text style={footer}>
            Keep up the great work strengthening your relationship! Your next check-in is always available when you're
            ready.
          </Text>
          <Text style={footerLinks}>
            <Link href="https://tryqc.co/privacy" style={link}>
              Privacy Policy
            </Link>
            {' · '}
            <Link href="https://tryqc.co/terms" style={link}>
              Terms of Service
            </Link>
          </Text>
          {unsubscribeUrl && (
            <Text style={footer}>
              <Link href={unsubscribeUrl} style={link}>
                Unsubscribe from email notifications
              </Link>
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  maxWidth: '560px',
  margin: '40px auto',
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
}

const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#111827',
  marginBottom: '16px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
}

const summaryBox = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '6px',
  marginBottom: '16px',
}

const summaryHeading = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#111827',
  marginBottom: '8px',
}

const summaryItem = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
  marginBottom: '4px',
}

const button = {
  display: 'inline-block',
  backgroundColor: '#e11d48',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  marginBottom: '24px',
}

const footer = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
}

const footerLinks = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  marginTop: '16px',
}

const link = {
  color: '#6b7280',
  textDecoration: 'underline',
}
