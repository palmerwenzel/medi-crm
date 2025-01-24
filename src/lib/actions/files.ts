/**
 * Server actions for file management
 * Handles file uploads to Supabase Storage
 */
'use server'

import { createClient } from '@/utils/supabase/server'
import { validateFile, type AllowedMimeType } from '@/lib/utils/file-validation'
import { randomUUID } from 'crypto'

type UploadResponse = {
  success: boolean
  url?: string
  error?: string
}

/**
 * Uploads a file to Supabase Storage and returns the public URL
 * Files are stored in case-specific buckets with secure names
 */
export async function uploadFile(
  file: File,
  caseId: string,
  acceptedTypes: AllowedMimeType[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
): Promise<UploadResponse> {
  try {
    // Validate file
    const validation = await validateFile(file, acceptedTypes)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error?.message || 'Invalid file'
      }
    }

    const supabase = await createClient()

    // Generate a secure filename
    const fileExt = file.name.split('.').pop()
    const secureFileName = `${randomUUID()}.${fileExt}`

    // Upload to case-specific folder
    const { error } = await supabase.storage
      .from('case-attachments')
      .upload(`${caseId}/${secureFileName}`, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('case-attachments')
      .getPublicUrl(`${caseId}/${secureFileName}`)

    return {
      success: true,
      url: publicUrl
    }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    }
  }
}

/**
 * Removes a file from Supabase Storage
 */
export async function removeFile(path: string): Promise<{ success: boolean, error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.storage
      .from('case-attachments')
      .remove([path])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('File removal error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove file'
    }
  }
} 