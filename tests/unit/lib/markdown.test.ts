import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '@/lib/markdown'

describe('renderMarkdown', () => {
  it('renders bold text', () => {
    const result = renderMarkdown('**bold**')
    expect(result).toContain('<strong>bold</strong>')
  })

  it('renders italic text', () => {
    const result = renderMarkdown('*italic*')
    expect(result).toContain('<em>italic</em>')
  })

  it('renders inline code', () => {
    const result = renderMarkdown('use `console.log` here')
    expect(result).toContain('<code')
    expect(result).toContain('console.log')
    expect(result).toContain('</code>')
  })

  it('renders code blocks', () => {
    const result = renderMarkdown('```\nconst x = 1\n```')
    expect(result).toContain('<pre')
    expect(result).toContain('<code>')
    expect(result).toContain('const x = 1')
    expect(result).toContain('</code></pre>')
  })

  it('renders links', () => {
    const result = renderMarkdown('[click here](https://example.com)')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('click here')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('renders h1 headings', () => {
    const result = renderMarkdown('# Heading One')
    expect(result).toContain('<h1')
    expect(result).toContain('Heading One')
    expect(result).toContain('</h1>')
  })

  it('renders h2 headings', () => {
    const result = renderMarkdown('## Heading Two')
    expect(result).toContain('<h2')
    expect(result).toContain('Heading Two')
    expect(result).toContain('</h2>')
  })

  it('renders h3 headings', () => {
    const result = renderMarkdown('### Heading Three')
    expect(result).toContain('<h3')
    expect(result).toContain('Heading Three')
    expect(result).toContain('</h3>')
  })

  it('escapes HTML entities to prevent XSS', () => {
    const result = renderMarkdown('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('escapes angle brackets in normal text', () => {
    const result = renderMarkdown('a < b > c')
    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
  })

  it('escapes ampersands', () => {
    const result = renderMarkdown('Tom & Jerry')
    expect(result).toContain('&amp;')
  })

  it('wraps output in paragraph tags', () => {
    const result = renderMarkdown('Hello world')
    expect(result).toMatch(/^<p>.*<\/p>$/)
  })

  it('renders bullet lists', () => {
    const result = renderMarkdown('- Item one\n- Item two')
    expect(result).toContain('<li')
    expect(result).toContain('Item one')
    expect(result).toContain('Item two')
  })

  it('handles empty string', () => {
    const result = renderMarkdown('')
    expect(result).toBe('<p></p>')
  })
})
