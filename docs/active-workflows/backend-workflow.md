# Backend Workflow Template

## Project State
Project Phase: Phase 2
Current Task: Implement webhook endpoints for case notifications

## Task Breakdown
1. [x] Identify task from phase checklist
   - From phase-2.md: Create webhook endpoints for case updates and integration points
2. [x] Break down into components
3. [x] Document primary feature below

## Primary Feature
Name: Webhook System
Description: Implement secure webhook delivery system for case events with proper validation, rate limiting, and error handling

Components:
- [x] Webhook Registration & Management
  - Database table
  - CRUD endpoints
  - Security policies
- [x] Webhook Delivery System
  - Event triggers
  - Payload signing
  - Rate limiting
  - Retry logic

---

## Implementation Workflow

### 1. Understanding Phase
1. [x] Review Documentation
    - [x] Tech stack & guidelines (Next.js App Router + Supabase)
    - [x] Existing services & utils (createApiClient, handleApiError)
    - [x] Data models & types (cases table, user roles)
    - [x] Integration points (case API endpoints)
2. [x] Document Findings
    ```
    Guidelines: 
    - Use createApiClient for API routes
    - Follow RLS policy patterns
    - Implement proper error handling

    Related Files:
    - @/lib/supabase/api.ts
    - @/lib/supabase/server.ts
    - src/app/api/cases/route.ts

    Integration Points:
    - Case CRUD operations
    - Role-based access control
    ```
3. [x] CHECKPOINT: Share Understanding

### 2. Planning Phase
1. [x] Design Architecture
    - [x] Data flow (webhook triggers on case events)
    - [x] API structure (registration, testing, delivery)
    - [x] Types & validation (Zod schemas)
    - [x] Test strategy (validation, delivery, security)
2. [x] Document Plan
    ```
    Data Flow:
    - Case event -> Webhook service -> Filtered delivery
    
    API Design:
    - POST /api/webhooks (register)
    - GET /api/webhooks (list)
    - DELETE /api/webhooks (remove)
    - POST /api/webhooks/test (test delivery)
    
    Types:
    - WebhookEventType
    - WebhookRegistration
    - WebhookPayload
    - WebhookDeliveryResponse
    
    Tests:
    - Registration validation
    - Signature verification
    - Rate limiting
    - Retry mechanism
    ```
3. [x] CHECKPOINT: Review Plan

### 3. Implementation Phase
1. [x] Setup & Verification
    ```
    Types: Created webhook.ts for types/schemas
    Structure: Following App Router patterns
    Integration: Connected with case events
    ```
2. [x] CHECKPOINT: Verify Setup

3. [x] Development
    - [x] Route handlers/actions
    - [x] Database integration
    - [x] Business logic
    - [x] Validation
    - [x] Tests
    Document each step:
    ```
    Database:
    Location: migrations/20250123000001_create_webhooks_table.sql
    Implementation: Table creation with RLS policies

    Types:
    Location: lib/validations/webhook.ts
    Implementation: Zod schemas and TypeScript types

    Utils:
    Location: lib/utils/webhook.ts
    Implementation: Signature, delivery, rate limiting

    API Routes:
    Location: app/api/webhooks/route.ts
    Implementation: CRUD operations with auth
    ```
4. [x] CHECKPOINT: Review Progress

5. [x] Integration
    - [x] Connect components
    - [x] Document endpoints
    - [x] Configure state
    ```
    Endpoints: All webhook routes documented
    Components: Webhook service integrated
    State: Using Supabase for persistence
    ```
6. [x] CHECKPOINT: Verify Integration

### 4. Verification
1. [x] Quality Checks
    ```
    Features:
    - Webhook registration -> /api/webhooks POST
    - Event delivery -> webhook-service.ts
    - Security validation -> HMAC signatures
    - Rate limiting -> In-memory store

    Security:
    - RLS policies -> webhooks table
    - Role checks -> API routes
    - Payload signing -> HMAC SHA-256

    Types:
    - WebhookEventType -> webhook.ts
    - Zod schemas -> webhook.ts

    Tests:
    - Registration -> Input validation
    - Delivery -> Retry mechanism
    - Security -> Signature verification
    ```
2. [x] CHECKPOINT: Final Review

### 5. Completion
1. [x] Get sign-off
2. [x] Update checklists
3. [ ] Reset workflow

## Checkpoint Log
- [x] 1.3 Understanding
- [x] 2.3 Planning
- [x] 3.2 Setup
- [x] 3.4 Progress
- [x] 3.6 Integration
- [x] 4.2 Final

## Key Decisions
1. [x] Use HMAC SHA-256 for webhook signatures
2. [x] Implement in-memory rate limiting (consider Redis for production)
3. [x] Auto-deactivate webhooks after 10 failures