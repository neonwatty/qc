import { describe, it, expect } from 'vitest'

import { applyFormat, removeFormat } from '@/lib/text-formatting'

describe('applyFormat', () => {
  it('wraps selection with bold markers', () => {
    const result = applyFormat('hello world', 0, 5, { bold: true })
    expect(result.text).toBe('**hello** world')
    expect(result.markdown).toBe('**hello**')
  })

  it('wraps selection with italic markers', () => {
    const result = applyFormat('hello world', 6, 11, { italic: true })
    expect(result.text).toBe('hello *world*')
    expect(result.markdown).toBe('*world*')
  })

  it('prepends heading hashes to selection', () => {
    const result = applyFormat('Title', 0, 5, { heading: 2 })
    expect(result.markdown).toBe('## Title')
  })

  it('prefixes each line with bullet marker', () => {
    const result = applyFormat('a\nb', 0, 3, { list: 'bullet' })
    expect(result.markdown).toBe('- a\n- b')
  })

  it('wraps selection as a markdown link', () => {
    const result = applyFormat('click here', 0, 10, { link: 'https://example.com' })
    expect(result.markdown).toBe('[click here](https://example.com)')
  })

  it('prefixes each line with blockquote marker', () => {
    const result = applyFormat('quote', 0, 5, { blockquote: true })
    expect(result.markdown).toBe('> quote')
  })

  it('combines bold and italic into triple asterisks', () => {
    const result = applyFormat('text', 0, 4, { bold: true, italic: true })
    expect(result.markdown).toBe('***text***')
  })
})

describe('removeFormat', () => {
  it('strips bold markers from the selection', () => {
    const result = removeFormat('**bold** text', 0, 8)
    expect(result).toBe('bold text')
  })

  it('strips mixed formatting from the selection', () => {
    const input = '**bold** *italic* ~~strike~~ [link](http://x.com)'
    const result = removeFormat(input, 0, input.length)
    expect(result).toBe('bold italic strike link')
  })
})
