import { Html, Head, Body, Container, Text, Button, Link } from '@react-email/components'

interface MilestoneEmailProps {
  title?: string
  description?: string
  rarity?: string
  growthUrl?: string
  unsubscribeUrl?: string
}

export function MilestoneEmail({
  title = 'New Milestone',
  description = 'You achieved a new milestone!',
  rarity = 'common',
  growthUrl = 'https://tryqc.co/growth',
  unsubscribeUrl,
}: MilestoneEmailProps) {
  // eslint-disable-next-line security/detect-object-injection
  const rarityEmoji =
    {
      common: '⭐',
      rare: '✨',
      epic: '🌟',
      legendary: '💎',
    }[rarity] || '⭐'

  const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1)

  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Text style={celebrationEmoji}>{rarityEmoji}</Text>
          <Text style={heading}>Milestone Achieved!</Text>
          <Container style={milestoneBox}>
            <Text style={milestoneTitle}>{title}</Text>
            <Text style={rarityBadge}>{rarityLabel} Milestone</Text>
            <Text style={milestoneDescription}>{description}</Text>
          </Container>
          <Text style={paragraph}>
            Congratulations on reaching this milestone! Every step forward is worth celebrating as you grow together.
          </Text>
          <Button style={button} href={growthUrl}>
            View Growth Timeline
          </Button>
          <Text style={footer}>Keep up the amazing work. Your relationship journey is unique and special.</Text>
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

const celebrationEmoji = {
  fontSize: '48px',
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const heading = {
  fontSize: '24px',
  fontWeight: '600' as const,
  color: '#111827',
  marginBottom: '16px',
  textAlign: 'center' as const,
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  marginBottom: '16px',
}

const milestoneBox = {
  backgroundColor: '#fef2f2',
  border: '2px solid #e11d48',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '16px',
  textAlign: 'center' as const,
}

const milestoneTitle = {
  fontSize: '20px',
  fontWeight: '600' as const,
  color: '#111827',
  marginBottom: '8px',
}

const rarityBadge = {
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#e11d48',
  backgroundColor: '#ffffff',
  padding: '4px 12px',
  borderRadius: '12px',
  marginBottom: '12px',
}

const milestoneDescription = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#374151',
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
