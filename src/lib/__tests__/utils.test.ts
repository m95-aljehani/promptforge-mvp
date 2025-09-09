import { describe, it, expect } from 'vitest'
import { truncateText, parseSlashCommand, extractMarkdownContent, formatDate } from '../utils'

describe('utils', () => {
  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const text = 'This is a very long text that should be truncated'
      const result = truncateText(text, 20)
      expect(result).toBe('This is a very long ...')
    })

    it('should return original text if shorter than maxLength', () => {
      const text = 'Short text'
      const result = truncateText(text, 20)
      expect(result).toBe('Short text')
    })
  })

  describe('parseSlashCommand', () => {
    it('should parse enhance command', () => {
      const result = parseSlashCommand('/enhance')
      expect(result).toEqual({ command: 'enhance', args: [] })
    })

    it('should parse shorten command with argument', () => {
      const result = parseSlashCommand('/shorten 100')
      expect(result).toEqual({ command: 'shorten', args: ['100'] })
    })

    it('should return null for invalid command', () => {
      const result = parseSlashCommand('not a command')
      expect(result).toBeNull()
    })
  })

  describe('extractMarkdownContent', () => {
    it('should remove markdown formatting', () => {
      const markdown = '# Header\n**Bold text** and *italic text*\n- List item'
      const result = extractMarkdownContent(markdown)
      expect(result).toBe('Header\nBold text and italic text\nList item')
    })
  })

  describe('formatDate', () => {
    it('should format date string', () => {
      const date = '2024-01-15T10:30:00Z'
      const result = formatDate(date)
      expect(result).toMatch(/Jan 15, 2024/)
    })
  })
})