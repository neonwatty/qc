import { describe, it, expect } from 'vitest'

import {
  applyFormat,
  removeFormat,
  toPlainText,
  toHTML,
  countCharacters,
  countWords,
  countLines,
  validateLength,
  sanitizeText,
} from '@/lib/text-formatting'

describe('applyFormat', () => {
  it('applies bold formatting', () => {
    const result = applyFormat('hello world', 0, 5, { bold: true })
    expect(result.text).toBe('**hello** world')
    expect(result.markdown).toBe('**hello**')
  })

  it('applies italic formatting', () => {
    const result = applyFormat('hello world', 0, 5, { italic: true })
    expect(result.text).toBe('*hello* world')
    expect(result.markdown).toBe('*hello*')
  })

  it('applies combined bold and italic formatting', () => {
    const result = applyFormat('hello world', 0, 5, { bold: true, italic: true })
    expect(result.text).toBe('***hello*** world')
    expect(result.markdown).toBe('***hello***')
  })

  it('applies heading formatting', () => {
    const result = applyFormat('Title text', 0, 5, { heading: 1 })
    expect(result.text).toBe('# Title text')
    expect(result.markdown).toBe('# Title')

    const h2 = applyFormat('Subtitle', 0, 8, { heading: 2 })
    expect(h2.markdown).toBe('## Subtitle')

    const h3 = applyFormat('Section', 0, 7, { heading: 3 })
    expect(h3.markdown).toBe('### Section')
  })

  it('applies bullet list formatting', () => {
    const result = applyFormat('item one\nitem two', 0, 17, { list: 'bullet' })
    expect(result.markdown).toBe('- item one\n- item two')
  })

  it('applies ordered list formatting', () => {
    const result = applyFormat('first\nsecond', 0, 12, { list: 'ordered' })
    expect(result.markdown).toBe('1. first\n2. second')
  })

  it('applies link formatting', () => {
    const result = applyFormat('click here for info', 0, 10, { link: 'https://example.com' })
    expect(result.text).toBe('[click here](https://example.com) for info')
    expect(result.markdown).toBe('[click here](https://example.com)')
  })

  it('applies formatting to a mid-string selection', () => {
    const result = applyFormat('hello world today', 6, 11, { bold: true })
    expect(result.text).toBe('hello **world** today')
  })
})

describe('removeFormat', () => {
  it('strips bold markers', () => {
    expect(removeFormat('**hello** world', 0, 9)).toBe('hello world')
  })

  it('strips italic markers', () => {
    expect(removeFormat('*hello* world', 0, 7)).toBe('hello world')
  })

  it('strips heading markers', () => {
    expect(removeFormat('# Heading text', 0, 14)).toBe('Heading text')
  })

  it('strips bullet list markers', () => {
    expect(removeFormat('- item one\n- item two', 0, 21)).toBe('item one\nitem two')
  })

  it('strips ordered list markers', () => {
    expect(removeFormat('1. first\n2. second', 0, 18)).toBe('first\nsecond')
  })

  it('strips link syntax preserving link text', () => {
    expect(removeFormat('[click](https://example.com)', 0, 28)).toBe('click')
  })

  it('strips blockquote markers', () => {
    expect(removeFormat('> quoted text', 0, 13)).toBe('quoted text')
  })

  it('strips underline tags', () => {
    expect(removeFormat('<u>underlined</u>', 0, 17)).toBe('underlined')
  })

  it('only affects the selected range', () => {
    const text = 'before **bold** after'
    expect(removeFormat(text, 7, 15)).toBe('before bold after')
  })
})

describe('toPlainText', () => {
  it('strips all markdown formatting from a string', () => {
    expect(toPlainText('**bold** and *italic*')).toBe('bold and italic')
  })

  it('strips heading markers', () => {
    expect(toPlainText('## Heading')).toBe('Heading')
  })

  it('strips HTML tags', () => {
    expect(toPlainText('<strong>bold</strong> and <em>italic</em>')).toBe('bold and italic')
  })

  it('strips links preserving text', () => {
    expect(toPlainText('[link text](https://example.com)')).toBe('link text')
  })

  it('strips blockquote markers', () => {
    expect(toPlainText('> a quote')).toBe('a quote')
  })

  it('strips strikethrough markers', () => {
    expect(toPlainText('~~removed~~')).toBe('removed')
  })

  it('strips underline markers', () => {
    expect(toPlainText('__underlined__')).toBe('underlined')
  })

  it('returns empty string unchanged', () => {
    expect(toPlainText('')).toBe('')
  })
})

describe('toHTML', () => {
  it('converts bold markdown to strong tags', () => {
    expect(toHTML('**bold**')).toBe('<strong>bold</strong>')
  })

  it('converts italic markdown to em tags', () => {
    expect(toHTML('*italic*')).toBe('<em>italic</em>')
  })

  it('converts heading markdown to h tags', () => {
    expect(toHTML('# Title')).toBe('<h1>Title</h1>')
    expect(toHTML('## Subtitle')).toBe('<h2>Subtitle</h2>')
    expect(toHTML('### Section')).toBe('<h3>Section</h3>')
  })

  it('converts link markdown to anchor tags', () => {
    expect(toHTML('[text](https://example.com)')).toBe('<a href="https://example.com">text</a>')
  })

  it('converts newlines to br tags', () => {
    expect(toHTML('line one\nline two')).toBe('line one<br/>line two')
  })

  it('converts strikethrough to del tags', () => {
    expect(toHTML('~~removed~~')).toBe('<del>removed</del>')
  })

  it('converts underline to u tags', () => {
    expect(toHTML('__underlined__')).toBe('<u>underlined</u>')
  })
})

describe('countCharacters', () => {
  it('counts all characters including spaces by default', () => {
    expect(countCharacters('hello world')).toBe(11)
  })

  it('excludes spaces when excludeSpaces is true', () => {
    expect(countCharacters('hello world', true)).toBe(10)
  })

  it('returns 0 for empty string', () => {
    expect(countCharacters('')).toBe(0)
    expect(countCharacters('', true)).toBe(0)
  })

  it('excludes tabs and newlines when excludeSpaces is true', () => {
    expect(countCharacters('a\tb\nc', true)).toBe(3)
  })
})

describe('countWords', () => {
  it('counts words in normal text', () => {
    expect(countWords('hello world')).toBe(2)
  })

  it('handles multiple spaces between words', () => {
    expect(countWords('hello   world')).toBe(2)
  })

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
  })

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0)
  })

  it('counts single word correctly', () => {
    expect(countWords('hello')).toBe(1)
  })
})

describe('countLines', () => {
  it('returns 1 for a single line', () => {
    expect(countLines('hello')).toBe(1)
  })

  it('counts multiple lines', () => {
    expect(countLines('line one\nline two\nline three')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countLines('')).toBe(0)
  })

  it('counts trailing newline as an extra line', () => {
    expect(countLines('line one\n')).toBe(2)
  })
})

describe('validateLength', () => {
  it('returns valid when within bounds', () => {
    expect(validateLength('hello', 1, 10)).toEqual({ valid: true })
  })

  it('returns invalid when text is too short', () => {
    const result = validateLength('hi', 5)
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Text must be at least 5 characters long')
  })

  it('returns invalid when text is too long', () => {
    const result = validateLength('hello world', undefined, 5)
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Text must be no more than 5 characters long')
  })

  it('returns valid when no bounds are specified', () => {
    expect(validateLength('anything goes')).toEqual({ valid: true })
  })

  it('returns valid at exact boundary lengths', () => {
    expect(validateLength('abc', 3, 3)).toEqual({ valid: true })
  })
})

describe('sanitizeText', () => {
  it('removes script tags and their content', () => {
    expect(sanitizeText('hello<script>alert("xss")</script>world')).toBe('helloworld')
  })

  it('removes iframe tags and their content', () => {
    expect(sanitizeText('before<iframe src="evil.com"></iframe>after')).toBe('beforeafter')
  })

  it('removes inline event handlers with double quotes', () => {
    expect(sanitizeText('<div onclick="alert(1)">text</div>')).toBe('<div >text</div>')
  })

  it('removes inline event handlers with single quotes', () => {
    expect(sanitizeText("<div onmouseover='steal()'>text</div>")).toBe('<div >text</div>')
  })

  it('removes javascript: protocol', () => {
    expect(sanitizeText('<a href="javascript:alert(1)">click</a>')).toBe('<a href="alert(1)">click</a>')
  })

  it('removes data:text/html payloads', () => {
    expect(sanitizeText('data:text/html,payload')).toBe(',payload')
    expect(sanitizeText('<a href="data:text/html,safe">click</a>')).toBe('<a href=",safe">click</a>')
  })

  it('handles text without any malicious content', () => {
    expect(sanitizeText('perfectly normal text')).toBe('perfectly normal text')
  })

  it('removes script tags case-insensitively', () => {
    expect(sanitizeText('<SCRIPT>bad()</SCRIPT>')).toBe('')
  })
})
