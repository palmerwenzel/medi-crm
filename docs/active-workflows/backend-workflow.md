# Backend Workflow Template

## Project State
Project Phase: Phase 3
Current Task: Implementing basic data fetching for cases

## Task Breakdown
1. [x] Identify task from phase checklist
2. [x] Break down into components
3. [ ] Document primary feature below

## Primary Feature
Name: Basic Case Data Fetching
Description: Implement efficient server-side data fetching for cases with status updates and error handling
Components:
- [ ] Case listing query optimization
- [ ] Status update endpoints
- [ ] Error handling middleware
- [ ] Type validation

---

## Implementation Workflow

### 1. Understanding Phase
1. [x] Review Documentation
    - [x] Tech stack & guidelines
    - [x] Existing services & utils
    - [x] Data models & types
    - [x] Integration points
2. [x] Document Findings
    ```
    Guidelines: 
    - Use server actions for data fetching
    - Leverage RLS for access control
    - Validate inputs with Zod schemas
    - Handle errors consistently

    Related Files:
    - src/lib/actions/cases.ts (server actions)
    - src/app/api/cases/ (API routes)
    - supabase/migrations/20250121000002_case_system.sql (schema)
    - src/lib/validations/case.ts (types & validation)

    Integration Points:
    - Supabase for data storage & RLS
    - Next.js server actions for API
    - Client components via hooks
    ```
3. [x] CHECKPOINT: Share Understanding

### 2. Planning Phase
1. [x] Design Architecture
    - [x] Data flow
    - [x] API structure
    - [x] Types & validation
    - [x] Test strategy
2. [x] Document Plan
    ```
    Data Flow:
    1. Client requests cases → Server action/API route
    2. Server validates request → Supabase query
    3. RLS filters data → Response transformation
    4. Error handling → Client response

    API Design:
    1. Optimize getCases:
       - Add pagination (limit/offset)
       - Add sorting options
       - Efficient joins for patient/staff data
       
    2. Enhance updateCaseStatus:
       - Validate status transitions
       - Add audit logging
       - Proper error messages
       
    3. Error Handling:
       - Specific error types
       - Consistent format
       - Proper logging

    Types:
    - Extend CaseResponse for pagination
    - Add status transition validation
    - Enhance error types

    Tests:
    - Unit tests for validation
    - Integration tests for queries
    - Error handling coverage
    ```
3. [x] CHECKPOINT: Review Plan

### 3. Implementation Phase
1. [x] Setup & Verification
    ```
    Types:
    - Added CaseQueryParams for filtering
    - Added PaginatedCaseResponse for results
    - Extended validation schemas

    Structure:
    - Updated server actions
    - Updated API routes
    - Maintained RLS policies

    Integration:
    - Server actions → Supabase
    - API routes → Server actions
    - Client hooks → API
    ```
2. [x] CHECKPOINT: Verify Setup

3. [x] Development
    - [x] Case listing query optimization
    - [x] Pagination implementation
    - [x] Filter/sort support
    - [x] Error handling
    Document each step:
    ```
    Case Listing:
    Location: src/lib/actions/cases.ts, src/app/api/cases/route.ts
    Implementation: Added pagination, filtering, and efficient joins

    Error Handling:
    Location: src/lib/actions/cases.ts
    Implementation: Consistent error format, validation
    ```
4. [x] CHECKPOINT: Review Progress

5. [ ] Integration
    - [ ] Connect components
    - [ ] Hook up actions
    - [ ] Polish transitions
    ```
    Data: [Connections]
    Actions: [Event handlers]
    Polish: [Animations/transitions]
    ```
6. [ ] CHECKPOINT: Verify Integration

### 4. Verification
1. [ ] Quality Checks
    ```
    Features:
    - [Requirement] Efficient case listing → [Implementation] Paginated queries with filters
    - [Requirement] Status updates → [Implementation] Validated status transitions
    - [Requirement] Error handling → [Implementation] Consistent error responses

    Security:
    - [Policy] RLS for data access → [Implementation] Supabase policies
    - [Policy] Role-based actions → [Implementation] Server-side validation

    Types:
    - [Schema] Add CaseError type for better error handling
    - [Schema] Add test types for validation schemas
    - [Schema] Document all public types with TSDoc

    Tests:
    - [Test] Unit tests for case query validation
    - [Test] Integration tests for pagination
    - [Test] Error handling coverage
    ```
2. [ ] CHECKPOINT: Final Review

### 5. Completion
1. [ ] Get sign-off
2. [ ] Update checklists
3. [ ] Reset workflow

## Checkpoint Log
- [ ] 1.3 Understanding
- [ ] 2.3 Planning
- [ ] 3.2 Setup
- [ ] 3.4 Progress
- [ ] 3.6 Integration
- [ ] 4.2 Final

## Key Decisions
1. [x] Use offset-based pagination for simplicity and RLS compatibility
2. [x] Implement consistent error handling pattern across server actions and API routes
3. [ ] Add comprehensive test suite for new functionality