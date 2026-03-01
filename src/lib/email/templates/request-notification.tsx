import { Html, Head, Body, Container, Text, Button, Link } from '@react-email/components'

interface RequestNotificationEmailProps {
  partnerName?: string
  title?: string
  category?: string
  priority?: string
  requestsUrl?: string
  unsubscribeUrl?: string
}

export function RequestNotificationEmail({
  partnerName = 'Your partner',
  title = 'New Request',
  category = 'General',
  priority = 'normal',
  requestsUrl = 'https://tryqc.co/requests',
  unsubscribeUrl,
}: RequestNotificationEmailProps) {
  const priorityColor =
    {
      low: '#6b7280',
      normal: '#3b82f6',
      high: '#f59e0b',
      urgent: '#e11d48',
    }[priority] || '#3b82f6'

  const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1)

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={heading}>New Request from {partnerName}</Text>
          <Text style={paragraph}>{partnerName} has sent you a new request.</Text>
          <Container style={requestBox}>
            <Text style={requestTitle}>{title}</Text>
            <Container style={metadata}>
              <Text style={metadataItem}>
                <span style={{ fontWeight: '600' }}>Category:</span> {category}
              </Text>
              <Text style={metadataItem}>
                <span style={{ fontWeight: '600', color: priorityColor }}>Priority:</span>{' '}
                <span style={{ color: priorityColor }}>{priorityLabel}</span>
              </Text>
            </Container>
          </Container>
          <Text style={paragraph}>
            Review this request and respond to let your partner know you've seen it. Great communication strengthens
            your connection!
          </Text>
          <Button style={button} href={requestsUrl}>
            View Request
          </Button>
          <Text style={footer}>You received this because {partnerName} created a new request for you.</Text>
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

const requestBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '16px',
}

const requestTitle = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#111827',
  marginBottom: '12px',
}

const metadata = {
  display: 'flex',
  gap: '16px',
}

const metadataItem = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
  marginRight: '16px',
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
