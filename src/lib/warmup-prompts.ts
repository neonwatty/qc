export type PromptTone = 'light' | 'medium' | 'deep'

export interface WarmUpPrompt {
  id: string
  text: string
  tone: PromptTone
}

export const WARMUP_PROMPTS: WarmUpPrompt[] = [
  // Light
  { id: 'l1', text: 'What made you smile this week?', tone: 'light' },
  { id: 'l2', text: 'Best meal you had recently?', tone: 'light' },
  { id: 'l3', text: 'What song has been stuck in your head?', tone: 'light' },
  { id: 'l4', text: "What's one thing you're looking forward to?", tone: 'light' },
  { id: 'l5', text: 'Describe your week in three words.', tone: 'light' },
  { id: 'l6', text: 'What was the highlight of your day?', tone: 'light' },
  { id: 'l7', text: "What's something small that made you happy recently?", tone: 'light' },

  // Medium
  { id: 'm1', text: "What's something I did this week that you appreciated?", tone: 'medium' },
  { id: 'm2', text: 'Is there anything you have been wanting to tell me?', tone: 'medium' },
  { id: 'm3', text: 'What is one thing we could do together this weekend?', tone: 'medium' },
  { id: 'm4', text: 'How are you feeling about us right now?', tone: 'medium' },
  { id: 'm5', text: 'When did you feel most connected to me recently?', tone: 'medium' },
  { id: 'm6', text: "What's something you wish we did more of?", tone: 'medium' },
  { id: 'm7', text: 'Is there something on your mind you have not shared yet?', tone: 'medium' },

  // Deep
  { id: 'd1', text: 'What is one way I can better support you right now?', tone: 'deep' },
  { id: 'd2', text: 'What does our relationship mean to you today?', tone: 'deep' },
  { id: 'd3', text: "What's a dream you have that we haven't talked about?", tone: 'deep' },
  { id: 'd4', text: 'How have we grown as a couple in the last few months?', tone: 'deep' },
  { id: 'd5', text: 'What is one fear you have about our future together?', tone: 'deep' },
  { id: 'd6', text: "What's something you admire about me that you don't say enough?", tone: 'deep' },
]

/** Pick one random prompt from each tone. */
export function pickThreePrompts(seed?: number): WarmUpPrompt[] {
  const byTone: Record<PromptTone, WarmUpPrompt[]> = { light: [], medium: [], deep: [] }
  for (const p of WARMUP_PROMPTS) {
    byTone[p.tone].push(p)
  }

  function pick(arr: WarmUpPrompt[]): WarmUpPrompt {
    const index = seed != null ? Math.abs(seed) % arr.length : Math.floor(Math.random() * arr.length)
    // eslint-disable-next-line security/detect-object-injection -- index is computed from arr.length
    return arr[index]
  }

  return [pick(byTone.light), pick(byTone.medium), pick(byTone.deep)]
}
