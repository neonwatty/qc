import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

import { WelcomeEmail } from './welcome'
import { InviteEmail } from './invite'
import { ReminderEmail } from './reminder'

describe('WelcomeEmail', () => {
  it('renders with default props', () => {
    const html = renderToStaticMarkup(<WelcomeEmail />)
    expect(html).toContain('Welcome to QC, there!')
  })

  it('renders custom name', () => {
    const html = renderToStaticMarkup(<WelcomeEmail name="Alice" />)
    expect(html).toContain('Welcome to QC, Alice!')
  })

  it('renders dashboard link', () => {
    const html = renderToStaticMarkup(<WelcomeEmail dashboardUrl="https://example.com/dash" />)
    expect(html).toContain('https://example.com/dash')
    expect(html).toContain('Go to Dashboard')
  })

  it('shows unsubscribe link when URL provided', () => {
    const html = renderToStaticMarkup(<WelcomeEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(html).toContain('Unsubscribe from QC emails')
    expect(html).toContain('https://example.com/unsub')
  })

  it('hides unsubscribe link when no URL', () => {
    const html = renderToStaticMarkup(<WelcomeEmail />)
    expect(html).not.toContain('Unsubscribe from QC emails')
  })
})

describe('InviteEmail', () => {
  it('renders with default props', () => {
    const html = renderToStaticMarkup(<InviteEmail />)
    expect(html).toContain('You have been invited to QC')
    expect(html).toContain('Your partner has invited you')
  })

  it('renders custom inviter name', () => {
    const html = renderToStaticMarkup(<InviteEmail inviterName="Bob" />)
    expect(html).toContain('Bob has invited you')
  })

  it('renders invite URL', () => {
    const html = renderToStaticMarkup(<InviteEmail inviteUrl="https://example.com/join" />)
    expect(html).toContain('https://example.com/join')
    expect(html).toContain('Accept Invite')
  })

  it('shows unsubscribe link when URL provided', () => {
    const html = renderToStaticMarkup(<InviteEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(html).toContain('Unsubscribe from QC emails')
    expect(html).toContain('https://example.com/unsub')
  })

  it('hides unsubscribe link when no URL', () => {
    const html = renderToStaticMarkup(<InviteEmail />)
    expect(html).not.toContain('Unsubscribe from QC emails')
  })
})

describe('ReminderEmail', () => {
  it('renders with default props', () => {
    const html = renderToStaticMarkup(<ReminderEmail />)
    expect(html).toContain('Reminder: Reminder')
    expect(html).toContain('You have an upcoming reminder.')
  })

  it('renders custom title and message', () => {
    const html = renderToStaticMarkup(<ReminderEmail title="Date Night" message="Don&#x27;t forget!" />)
    expect(html).toContain('Reminder: Date Night')
  })

  it('renders custom message', () => {
    const html = renderToStaticMarkup(<ReminderEmail message="Time to check in!" />)
    expect(html).toContain('Time to check in!')
  })

  it('renders dashboard link', () => {
    const html = renderToStaticMarkup(<ReminderEmail dashboardUrl="https://example.com/reminders" />)
    expect(html).toContain('https://example.com/reminders')
    expect(html).toContain('View Reminders')
  })

  it('shows unsubscribe link when URL provided', () => {
    const html = renderToStaticMarkup(<ReminderEmail unsubscribeUrl="https://example.com/unsub" />)
    expect(html).toContain('Unsubscribe from email notifications')
    expect(html).toContain('https://example.com/unsub')
  })

  it('hides unsubscribe link when no URL', () => {
    const html = renderToStaticMarkup(<ReminderEmail />)
    expect(html).not.toContain('Unsubscribe from email notifications')
  })
})
