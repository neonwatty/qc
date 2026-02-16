import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Link,
} from '@react-email/components'

interface WelcomeEmailProps {
  name?: string
  dashboardUrl?: string
}

export function WelcomeEmail({
  name = 'there',
  dashboardUrl = 'https://example.com/dashboard',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>Welcome to the Template</Text>
          <Text style={paragraph}>
            Hey {name}, thanks for signing up! We are excited to have you on board.
          </Text>
          <Text style={paragraph}>
            Get started by visiting your dashboard to set up your account.
          </Text>
          <Button style={button} href={dashboardUrl}>
            Go to Dashboard
          </Button>
          <Text style={footer}>
            If you have any questions, reply to this email or visit our{' '}
            <Link href="https://example.com/docs" style={link}>
              documentation
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

export default WelcomeEmail
