/**
 * Input sanitization utilities
 * Prevents XSS attacks and SQL injection
 */

import DOMPurify from 'isomorphic-dompurify'
import { escape as sqlEscape } from 'sqlstring'

/**
 * Configuration for DOMPurify
 * Allows only safe HTML elements and attributes
 */
const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'a',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre', 'hr'
]

const ALLOWED_ATTR = ['href', 'target', 'rel']

// Configure DOMPurify
const purifyConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ALLOW_SCRIPT_URLS: false,
  USE_PROFILES: { html: true },
}

/**
 * Sanitizes HTML content to prevent XSS
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, purifyConfig)
}

/**
 * Escapes special characters to prevent XSS in plain text
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes SQL input to prevent injection
 * Note: This is a backup; we primarily use Supabase's parameterized queries
 */
export function sanitizeSql(value: string): string {
  return sqlEscape(value)
}

/**
 * Sanitizes an object's string values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    htmlFields?: string[]  // Fields that should allow safe HTML
    sqlFields?: string[]   // Fields that need SQL escaping
  } = {}
): T {
  const { htmlFields = [], sqlFields = [] } = options
  const result = { ...obj }

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue
    } else if (typeof value === 'string') {
      if (htmlFields.includes(key)) {
        result[key as keyof T] = sanitizeHtml(value) as T[keyof T]
      } else if (sqlFields.includes(key)) {
        result[key as keyof T] = sanitizeSql(value) as T[keyof T]
      } else {
        result[key as keyof T] = sanitizeText(value) as T[keyof T]
      }
    } else if (typeof value === 'object') {
      result[key as keyof T] = sanitizeObject(value as Record<string, unknown>, options) as T[keyof T]
    }
  }

  return result
}

/**
 * Validates and sanitizes a URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitizes file names to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent path traversal
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
} 