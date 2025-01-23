import '@testing-library/jest-dom'
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeSql,
  sanitizeObject,
  sanitizeUrl,
  sanitizeFileName,
} from '../sanitize'

describe('sanitization utilities', () => {
  describe('sanitizeHtml', () => {
    it('allows safe HTML elements and attributes', () => {
      const input = '<p><strong>Hello</strong> <a href="https://example.com">Link</a></p>'
      expect(sanitizeHtml(input)).toBe(input)
    })

    it('removes unsafe HTML elements and attributes', () => {
      const input = '<p onclick="alert()">Hello <script>alert()</script></p>'
      expect(sanitizeHtml(input)).toBe('<p>Hello </p>')
    })

    it('removes unsafe URLs', () => {
      const input = '<a href="javascript:alert()">Link</a>'
      expect(sanitizeHtml(input)).not.toContain('javascript:')
    })
  })

  describe('sanitizeText', () => {
    it('escapes HTML special characters', () => {
      const input = '<script>alert("&")</script>'
      const output = sanitizeText(input)
      expect(output).toBe('&lt;script&gt;alert(&quot;&amp;&quot;)&lt;/script&gt;')
    })
  })

  describe('sanitizeSql', () => {
    it('escapes SQL injection attempts', () => {
      const input = "'; DROP TABLE users; --"
      const output = sanitizeSql(input)
      expect(output).toContain('\\')
      expect(output).not.toBe(input)
    })
  })

  describe('sanitizeObject', () => {
    it('sanitizes string values in an object', () => {
      const input = {
        name: '<script>alert()</script>',
        description: 'Normal text',
        nested: {
          html: '<p>Safe HTML</p>',
        },
      }

      const output = sanitizeObject(input, {
        htmlFields: ['nested.html'],
      })

      expect(output.name).not.toContain('<script>')
      expect(output.description).toBe('Normal text')
      expect(output.nested.html).toBe('<p>Safe HTML</p>')
    })

    it('handles null and undefined values', () => {
      const input = {
        name: null,
        description: undefined,
        value: 'text',
      }

      const output = sanitizeObject(input)
      expect(output.name).toBeNull()
      expect(output.description).toBeUndefined()
      expect(output.value).toBe('text')
    })
  })

  describe('sanitizeUrl', () => {
    it('allows valid HTTP/HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
    })

    it('rejects invalid or dangerous URLs', () => {
      expect(sanitizeUrl('javascript:alert()')).toBeNull()
      expect(sanitizeUrl('file:///etc/passwd')).toBeNull()
      expect(sanitizeUrl('not a url')).toBeNull()
    })
  })

  describe('sanitizeFileName', () => {
    it('removes unsafe characters from filenames', () => {
      expect(sanitizeFileName('../etc/passwd')).toBe('etc_passwd')
      expect(sanitizeFileName('file<>:"/\\|?*')).toBe('file')
    })

    it('preserves safe characters', () => {
      expect(sanitizeFileName('my-file.pdf')).toBe('my-file.pdf')
      expect(sanitizeFileName('document.2023.txt')).toBe('document.2023.txt')
    })

    it('handles path traversal attempts', () => {
      expect(sanitizeFileName('../../etc/passwd')).toBe('etc_passwd')
      expect(sanitizeFileName('..\\windows\\system32')).toBe('windows_system32')
    })
  })
}) 