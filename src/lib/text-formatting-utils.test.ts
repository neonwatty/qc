import { describe, it, expect } from 'vitest'

import {
  toPlainText,
  toHTML,
  countCharacters,
  countWords,
  countLines,
  validateLength,
  sanitizeText,
} from '@/lib/text-formatting'

describe('toPlainText', () => {
  it('strips markdown formatting', () => {
    expect(toPlainText('**bold** *italic* ~~strike~~')).toBe('bold italic strike')
  })

  it('strips HTML tags', () => {
    expect(toPlainText('<u>underlined</u>')).toBe('underlined')
  })
})

describe('toHTML', () => {
  it('converts bold and italic to HTML tags', () => {
    const html = toHTML('**bold** and *italic*')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('converts heading markdown to heading tags', () => {
    expect(toHTML('## Heading')).toContain('<h2>Heading</h2>')
  })
})

describe('countCharacters', () => {
  it('counts all characters including spaces', () => {
    expect(countCharacters('hello world')).toBe(11)
  })

  it('excludes whitespace when excludeSpaces is true', () => {
    expect(countCharacters('hello world', true)).toBe(10)
  })
})

describe('countWords', () => {
  it('counts words separated by whitespace', () => {
    expect(countWords('hello beautiful world')).toBe(3)
  })

  it('returns 0 for an empty string', () => {
    expect(countWords('')).toBe(0)
  })
})

describe('countLines', () => {
  it('counts lines split by newlines', () => {
    expect(countLines('a\nb\nc')).toBe(3)
  })

  it('returns 0 for an empty string', () => {
    expect(countLines('')).toBe(0)
  })
})

describe('validateLength', () => {
  it('returns valid when text is within bounds', () => {
    expect(validateLength('hello', 1, 10)).toEqual({ valid: true })
  })

  it('returns invalid when text is below minimum', () => {
    const result = validateLength('hi', 5)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('at least 5')
  })

  it('returns invalid when text exceeds maximum', () => {
    const result = validateLength('hello world', undefined, 5)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('no more than 5')
  })
})

describe('sanitizeText', () => {
  it('removes script tags and their content', () => {
    expect(sanitizeText('hi<script>alert("xss")</script>there')).toBe('hithere')
  })
})
