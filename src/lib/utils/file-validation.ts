/**
 * File validation utilities
 * Handles type checking, size limits, and content validation
 */

import { createHash } from 'crypto'

// Allowed file types and their magic numbers/signatures
const FILE_SIGNATURES = {
  // Images
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF],
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47],
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38],
  ],
  // Documents
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46],
  ],
  // Office documents
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    [0x50, 0x4B, 0x03, 0x04],
  ],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    [0x50, 0x4B, 0x03, 0x04],
  ],
} as const

export type AllowedMimeType = keyof typeof FILE_SIGNATURES

// Size limits in bytes
export const FILE_SIZE_LIMITS = {
  'image/jpeg': 5 * 1024 * 1024, // 5MB
  'image/png': 5 * 1024 * 1024,
  'image/gif': 5 * 1024 * 1024,
  'application/pdf': 10 * 1024 * 1024, // 10MB
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 10 * 1024 * 1024,
} as const

interface ValidationError {
  code: 'INVALID_TYPE' | 'INVALID_SIZE' | 'INVALID_CONTENT' | 'MALICIOUS_CONTENT'
  message: string
}

interface ValidationResult {
  isValid: boolean
  error?: ValidationError
  metadata?: {
    hash: string
    size: number
    mimeType: AllowedMimeType
  }
}

/**
 * Checks if a file's magic numbers match its claimed MIME type
 */
async function validateFileSignature(
  file: File,
  mimeType: AllowedMimeType
): Promise<boolean> {
  const signatures = FILE_SIGNATURES[mimeType]
  const buffer = await file.slice(0, 8).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  return signatures.some(signature =>
    signature.every((byte, i) => byte === bytes[i])
  )
}

/**
 * Calculates SHA-256 hash of file content
 */
async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hash = createHash('sha256')
  hash.update(Buffer.from(buffer))
  return hash.digest('hex')
}

/**
 * Validates a file's type, size, and content
 */
export async function validateFile(
  file: File,
  allowedTypes: AllowedMimeType[] = Object.keys(FILE_SIGNATURES) as AllowedMimeType[]
): Promise<ValidationResult> {
  // Check file type
  if (!allowedTypes.includes(file.type as AllowedMimeType)) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_TYPE',
        message: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      },
    }
  }

  // Check file size
  const sizeLimit = FILE_SIZE_LIMITS[file.type as AllowedMimeType]
  if (file.size > sizeLimit) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_SIZE',
        message: `File size ${file.size} bytes exceeds limit of ${sizeLimit} bytes`,
      },
    }
  }

  // Validate file signature
  const hasValidSignature = await validateFileSignature(
    file,
    file.type as AllowedMimeType
  )
  if (!hasValidSignature) {
    return {
      isValid: false,
      error: {
        code: 'INVALID_CONTENT',
        message: 'File content does not match its claimed type',
      },
    }
  }

  // Calculate file hash for tracking/deduplication
  const hash = await calculateFileHash(file)

  return {
    isValid: true,
    metadata: {
      hash,
      size: file.size,
      mimeType: file.type as AllowedMimeType,
    },
  }
}

/**
 * Validates multiple files in parallel
 */
export async function validateFiles(
  files: File[],
  allowedTypes?: AllowedMimeType[]
): Promise<ValidationResult[]> {
  return Promise.all(files.map(file => validateFile(file, allowedTypes)))
} 