/**
 * Domain Types Index
 * 
 * This is the main entry point for all domain types in the application.
 * Types are organized in layers from low-level (database) to high-level (UI).
 */

// Database types - Foundation layer
export * from './db'

// Core domain types - Business logic layer
export * from './users'
export * from './cases'
export * from './chat'
export * from './notifications'

// AI and real-time types - Service layer
export * from './ai'
export * from './webhooks'

// UI component types - Presentation layer
export * from './ui'

/**
 * Type Organization
 * 
 * The types are organized in a layered architecture:
 * 
 * 1. Database Layer (db.ts):
 *    - Raw database types with Db prefix
 *    - Database enum types
 *    - Table row types
 * 
 * 2. Core Domain Layer:
 *    - users.ts: User, auth, and staff types
 *    - cases.ts: Case management and filtering
 *    - chat.ts: Chat sessions and messages
 *    - notifications.ts: Notifications and preferences
 * 
 * 3. Service Layer:
 *    - ai.ts: OpenAI types and type guards
 *    - webhooks.ts: Webhook event types
 * 
 * 4. UI Layer (ui.ts):
 *    - Component props
 *    - UI-specific state types
 *    - Real-time UI types
 * 
 * Each layer depends only on the layers below it, maintaining
 * a clean separation of concerns and preventing circular dependencies.
 */ 