import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { CheckInSummaryEmail } from './checkin-summary'
import { MilestoneEmail } from './milestone'
import { RequestNotificationEmail } from './request-notification'

describe('CheckInSummaryEmail', () => {
  it('renders with default props', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail />)
    expect(html).toContain('Check-In Complete')
  })

  it('renders mood values', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail yourMood="Happy" partnerMood="Calm" />)
    expect(html).toContain('You: Happy')
    expect(html).toContain('Partner: Calm')
  })

  it('renders categories when provided', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail categories={['Communication', 'Trust']} />)
    expect(html).toContain('Communication')
    expect(html).toContain('Trust')
  })

  it('hides categories section when empty', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail categories={[]} />)
    expect(html).not.toContain('Topics Discussed')
  })

  it('renders singular action item text', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail actionItemCount={1} />)
    expect(html).toContain('1 action item')
    expect(html).not.toContain('1 action items')
  })

  it('renders plural action items text', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail actionItemCount={3} />)
    expect(html).toContain('3 action items')
  })

  it('hides action items when count is zero', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail actionItemCount={0} />)
    expect(html).not.toContain('action item')
  })

  it('renders unsubscribe link when URL provided', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(html).toContain('Unsubscribe from email notifications')
    expect(html).toContain('https://example.com/unsub')
  })

  it('hides unsubscribe link when no URL', () => {
    const html = renderToStaticMarkup(<CheckInSummaryEmail />)
    expect(html).not.toContain('Unsubscribe from email notifications')
  })
})

describe('MilestoneEmail', () => {
  it('renders with default props', () => {
    const html = renderToStaticMarkup(<MilestoneEmail />)
    expect(html).toContain('Milestone Achieved!')
    expect(html).toContain('New Milestone')
  })

  it('renders custom title and description', () => {
    const html = renderToStaticMarkup(<MilestoneEmail title="First Check-in" description="You did it!" />)
    expect(html).toContain('First Check-in')
    expect(html).toContain('You did it!')
  })

  it('capitalizes rarity label', () => {
    const html = renderToStaticMarkup(<MilestoneEmail rarity="epic" />)
    expect(html).toContain('Epic Milestone')
  })

  it('maps rarity to correct emoji', () => {
    expect(renderToStaticMarkup(<MilestoneEmail rarity="common" />)).toContain('⭐')
    expect(renderToStaticMarkup(<MilestoneEmail rarity="rare" />)).toContain('✨')
    expect(renderToStaticMarkup(<MilestoneEmail rarity="epic" />)).toContain('🌟')
    expect(renderToStaticMarkup(<MilestoneEmail rarity="legendary" />)).toContain('💎')
  })

  it('falls back to star emoji for unknown rarity', () => {
    const html = renderToStaticMarkup(<MilestoneEmail rarity="mythic" />)
    expect(html).toContain('⭐')
  })

  it('hides unsubscribe link when no URL', () => {
    const html = renderToStaticMarkup(<MilestoneEmail />)
    expect(html).not.toContain('Unsubscribe from email notifications')
  })
})

describe('RequestNotificationEmail', () => {
  it('renders with default props', () => {
    const html = renderToStaticMarkup(<RequestNotificationEmail />)
    expect(html).toContain('New Request from Your partner')
  })

  it('renders custom partner name and title', () => {
    const html = renderToStaticMarkup(<RequestNotificationEmail partnerName="Alice" title="Plan date night" />)
    expect(html).toContain('New Request from Alice')
    expect(html).toContain('Plan date night')
  })

  it('capitalizes priority label', () => {
    const html = renderToStaticMarkup(<RequestNotificationEmail priority="urgent" />)
    expect(html).toContain('Urgent')
  })

  it('renders category', () => {
    const html = renderToStaticMarkup(<RequestNotificationEmail category="Quality Time" />)
    expect(html).toContain('Quality Time')
  })

  it('hides unsubscribe link when no URL', () => {
    const html = renderToStaticMarkup(<RequestNotificationEmail />)
    expect(html).not.toContain('Unsubscribe from email notifications')
  })

  it('renders unsubscribe link when URL provided', () => {
    const html = renderToStaticMarkup(<RequestNotificationEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(html).toContain('Unsubscribe from email notifications')
    expect(html).toContain('https://example.com/unsub')
  })
})
