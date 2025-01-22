import '@testing-library/jest-dom'
import { validateFile, validateFiles, AllowedMimeType } from '../file-validation'

// Helper to create a mock file with specific content
function createMockFile(
  name: string,
  type: string,
  size: number,
  content: number[] = []
): File {
  const buffer = new Uint8Array(content)
  return new File([buffer], name, { type })
}

describe('file validation utilities', () => {
  describe('validateFile', () => {
    it('validates JPEG files', async () => {
      const file = createMockFile(
        'test.jpg',
        'image/jpeg',
        1024,
        [0xFF, 0xD8, 0xFF]
      )

      const result = await validateFile(file, ['image/jpeg'])
      expect(result.isValid).toBe(true)
      expect(result.metadata?.mimeType).toBe('image/jpeg')
    })

    it('validates PNG files', async () => {
      const file = createMockFile(
        'test.png',
        'image/png',
        1024,
        [0x89, 0x50, 0x4E, 0x47]
      )

      const result = await validateFile(file, ['image/png'])
      expect(result.isValid).toBe(true)
      expect(result.metadata?.mimeType).toBe('image/png')
    })

    it('validates PDF files', async () => {
      const file = createMockFile(
        'test.pdf',
        'application/pdf',
        1024,
        [0x25, 0x50, 0x44, 0x46]
      )

      const result = await validateFile(file, ['application/pdf'])
      expect(result.isValid).toBe(true)
      expect(result.metadata?.mimeType).toBe('application/pdf')
    })

    it('rejects files with invalid signatures', async () => {
      const file = createMockFile(
        'fake.jpg',
        'image/jpeg',
        1024,
        [0x00, 0x00, 0x00] // Invalid signature
      )

      const result = await validateFile(file, ['image/jpeg'])
      expect(result.isValid).toBe(false)
      expect(result.error?.code).toBe('INVALID_CONTENT')
    })

    it('rejects files that exceed size limit', async () => {
      const file = createMockFile(
        'large.jpg',
        'image/jpeg',
        10 * 1024 * 1024, // 10MB
        [0xFF, 0xD8, 0xFF]
      )

      const result = await validateFile(file, ['image/jpeg'])
      expect(result.isValid).toBe(false)
      expect(result.error?.code).toBe('INVALID_SIZE')
    })

    it('rejects files with disallowed types', async () => {
      const file = createMockFile(
        'script.js',
        'text/javascript',
        1024
      )

      const result = await validateFile(file, ['image/jpeg'])
      expect(result.isValid).toBe(false)
      expect(result.error?.code).toBe('INVALID_TYPE')
    })
  })

  describe('validateFiles', () => {
    it('validates multiple files in parallel', async () => {
      const files = [
        createMockFile('test1.jpg', 'image/jpeg', 1024, [0xFF, 0xD8, 0xFF]),
        createMockFile('test2.png', 'image/png', 1024, [0x89, 0x50, 0x4E, 0x47])
      ]

      const results = await validateFiles(files, ['image/jpeg', 'image/png'])
      expect(results).toHaveLength(2)
      expect(results.every(r => r.isValid)).toBe(true)
    })

    it('returns validation errors for invalid files', async () => {
      const files = [
        createMockFile('valid.jpg', 'image/jpeg', 1024, [0xFF, 0xD8, 0xFF]),
        createMockFile('invalid.exe', 'application/x-msdownload', 1024)
      ]

      const results = await validateFiles(files, ['image/jpeg'])
      expect(results[0].isValid).toBe(true)
      expect(results[1].isValid).toBe(false)
    })
  })
}) 