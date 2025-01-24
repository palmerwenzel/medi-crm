import { z } from 'zod'

// Message role and conversation status enums
export const messageRoleEnum = z.enum(['user', 'assistant'])
export const conversationStatusEnum = z.enum(['active', 'archived'])

// Base metadata schema (can be extended for specific needs)
const metadataSchema = z.record(z.unknown()).default({})

// Message validation schemas
export const messageSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new messages
  conversation_id: z.string().uuid(),
  content: z.string().min(1, 'Message cannot be empty'),
  role: messageRoleEnum,
  created_at: z.string().datetime().optional(),
  metadata: metadataSchema
})

export const messageInsertSchema = messageSchema.omit({ 
  id: true, 
  created_at: true 
})

// Conversation validation schemas
export const conversationSchema = z.object({
  id: z.string().uuid().optional(), // Optional for new conversations
  patient_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  status: conversationStatusEnum.default('active'),
  topic: z.string().optional(),
  metadata: metadataSchema
})

export const conversationInsertSchema = conversationSchema.omit({ 
  id: true, 
  created_at: true,
  updated_at: true 
})

// Query parameter schemas
export const messageQuerySchema = z.object({
  conversation_id: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20)
})

export const conversationQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
  status: conversationStatusEnum.optional()
})

// Types inferred from schemas
export type Message = z.infer<typeof messageSchema>
export type MessageInsert = z.infer<typeof messageInsertSchema>
export type Conversation = z.infer<typeof conversationSchema>
export type ConversationInsert = z.infer<typeof conversationInsertSchema>
export type MessageQuery = z.infer<typeof messageQuerySchema>
export type ConversationQuery = z.infer<typeof conversationQuerySchema> 