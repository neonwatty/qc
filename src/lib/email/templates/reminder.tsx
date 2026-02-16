import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Link,
} from '@react-email/components'

interface ReminderEmailProps {
  title: string
  message?: string | null
  frequency: string
  dashboardUrl?: string
}

export function ReminderEmail({
  title = 'Reminder',
  message,
  frequency = 'once',
  dashboardUrl = 'https://example.com/reminders',
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Reminder: {title}</Text>
          {message && <Text style={paragraph}>{message}</Text>}
          <Text style={paragraph}>
            This is a {frequency} reminder from your relationship wellness app.
          </Text>
          <Button style={button} href={dashboardUrl}>
            View Reminders
          </Button>
          <Text style={footer}>
            You can manage your notification preferences in your{' '}
            <Link href={dashboardUrl} style={link}>
              reminders settings
            </Link>
            .
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
  backgroundColor: '#111827',
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

export default ReminderEmail
