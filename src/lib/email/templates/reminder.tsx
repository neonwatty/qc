import { Html, Head, Body, Container, Text, Button, Link } from '@react-email/components'

interface ReminderEmailProps {
  title?: string
  message?: string
  dashboardUrl?: string
}

export function ReminderEmail({
  title = 'Reminder',
  message = 'You have an upcoming reminder.',
  dashboardUrl = 'https://tryqc.co/reminders',
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Reminder: {title}</Text>
          <Text style={paragraph}>{message}</Text>
          <Button style={button} href={dashboardUrl}>
            View Reminders
          </Button>
          <Text style={footer}>You received this because you have email notifications enabled for this reminder.</Text>
          <Text style={footerLinks}>
            <Link href="https://tryqc.co/privacy" style={link}>
              Privacy Policy
            </Link>
            {' · '}
            <Link href="https://tryqc.co/terms" style={link}>
              Terms of Service
            </Link>
          </Text>
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
