import { Html, Head, Body, Container, Text, Button, Link } from '@react-email/components'

interface InviteEmailProps {
  inviterName?: string
  inviteUrl?: string
}

export function InviteEmail({
  inviterName = 'Your partner',
  inviteUrl = 'https://example.com/invite/token',
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>You have been invited to QC</Text>
          <Text style={paragraph}>
            {inviterName} has invited you to join them on QC, a relationship wellness app for couples.
          </Text>
          <Text style={paragraph}>
            Accept the invite to start your journey together. You will be connected as a couple and can begin check-ins,
            share notes, and grow your relationship.
          </Text>
          <Button style={button} href={inviteUrl}>
            Accept Invite
          </Button>
          <Text style={footer}>
            This invite will expire in 7 days. If you did not expect this invitation, you can safely ignore this email.
            Questions? Visit our{' '}
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
