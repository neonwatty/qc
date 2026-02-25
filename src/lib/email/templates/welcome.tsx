import { Html, Head, Body, Container, Text, Button, Link } from '@react-email/components'

interface WelcomeEmailProps {
  name?: string
  dashboardUrl?: string
  unsubscribeUrl?: string
}

export function WelcomeEmail({
  name = 'there',
  dashboardUrl = 'https://tryqc.co/dashboard',
  unsubscribeUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Welcome to QC, {name}!</Text>
          <Text style={paragraph}>
            We're excited to have you here. QC is designed to help you and your partner strengthen your connection
            through regular check-ins, shared notes, and celebrating milestones together.
          </Text>
          <Text style={paragraph}>Here are some tips to get started:</Text>
          <Text style={listItem}>
            <strong>Start your first check-in</strong> - Set aside 10-15 minutes to connect with your partner
          </Text>
          <Text style={listItem}>
            <strong>Share notes</strong> - Capture thoughts, dreams, and memories together
          </Text>
          <Text style={listItem}>
            <strong>Track your growth</strong> - Celebrate milestones as you build your relationship
          </Text>
          <Button style={button} href={dashboardUrl}>
            Go to Dashboard
          </Button>
          <Text style={footer}>
            Questions? Visit our{' '}
            <Link href="https://tryqc.co/terms" style={link}>
              terms of service
            </Link>
            .
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
                Unsubscribe from QC emails
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

const listItem = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '12px',
  paddingLeft: '8px',
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

const link = {
  color: '#111827',
  textDecoration: 'underline',
}

const footerLinks = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  marginTop: '16px',
}
