# Type System Rules

## Type Foundation

The type system is built on top of Supabase's generated types:

### Supabase Schema (`supabase.ts`)
- **Purpose**: Foundation of all database types
- **Generation**: Run whenever database schema changes:
  ```bash
  npx supabase gen types --local > src/types/supabase.ts
  ```
- **Contains**:
  - Complete database schema
  - All table definitions
  - All enum types
  - Function signatures
- **Rules**:
  - Never edit this file manually
  - Always generate from Supabase schema
  - Commit changes with related migrations

### Validation Layer (`/lib/validations/*.ts`)
- **Purpose**: Runtime type validation and schema definitions
- **Location**: `lib/validations/*.ts` files
- **Contains**:
  - Zod schemas for each domain entity
  - Shared enum validations
  - Input/Output type definitions
- **Rules**:
  - One schema per file, matching domain structure
  - Export both schema and inferred types
  - Keep in sync with database types
  - Use shared enums from `shared-enums.ts`

#### Validation Files:
- `shared-enums.ts`: Common enum validations
- `users.ts`: User schema and types
- `cases.ts`: Case schema and types
- `medical-messages.ts`: Message schema and types
- `medical-conversations.ts`: Conversation schema and types
- `notifications.ts`: Notification schema and types
- `notification-preferences.ts`: Preferences schema and types
- `webhooks.ts`: Webhook event schemas

## Type Hierarchy

Our type system is organized in layers, building up from the Supabase foundation:

### 1. Database Layer (`db.ts`)
- **Purpose**: Single source of truth for database types
- **Naming**: All types prefixed with `Db` (e.g., `DbUser`, `DbCaseStatus`)
- **Contains**:
  - Raw table types (`DbCase`, `DbUser`, etc.)
  - Enum types (`DbUserRole`, `DbCaseStatus`, etc.)
  - Insert/Update types (`DbCaseInsert`, `DbUserUpdate`, etc.)
- **Rules**:
  - Never use `Database['public']` directly; always go through `db.ts`
  - Keep database type definitions close to Supabase schema
  - No business logic or transformations at this layer
  - Update when `supabase.ts` changes

### 2. Core Domain Layer
- **Purpose**: Business logic and domain models
- **Location**: `domain/*.ts` files
- **Contains**:
  - Domain entities (`User`, `Case`, etc.)
  - Type guards and validations
  - Business rules and constraints
- **Rules**:
  - One domain concept per file
  - Use branded types for IDs (`UserId`, `ConversationId`)
  - Transform dates from strings to `Date` objects
  - Define clear boundaries between domains

#### Domain Files:
- `users.ts`: User, auth, and staff types
- `cases.ts`: Case management and filtering
- `chat.ts`: Chat sessions and messages
- `notifications.ts`: Notifications and preferences
- `ai.ts`: AI-specific types and guards
- `webhooks.ts`: Webhook event types

### 3. UI Layer (`ui.ts`)
- **Purpose**: Component props and UI-specific types
- **Contains**:
  - Base prop types
  - Component props
  - UI state types
  - Real-time types
- **Rules**:
  - All component props extend `BaseProps`
  - Group related props together
  - Keep UI state separate from domain state
  - Document prop types with JSDoc

## Type Export Rules

### 1. Root Index (`/types/index.ts`)
- **Purpose**: Main entry point for type imports
- **Rules**:
  - Export everything from domain via `export * from './domain'`
  - Provide selective exports for commonly used types
  - Group exports by domain and layer
  - Document usage patterns

### 2. Domain Index (`/types/domain/index.ts`)
- **Purpose**: Organize domain type exports
- **Rules**:
  - Export types in dependency order
  - Group related domains together
  - Document layer boundaries
  - Maintain clean separation of concerns

## Naming Conventions

1. **Type Names**:
   - PascalCase for types and interfaces
   - Prefix database types with `Db`
   - Suffix props with `Props`
   - Suffix UI components with descriptive names

2. **File Names**:
   - Kebab-case for files
   - Domain-specific names
   - Clear and descriptive

## Best Practices

1. **Type Safety**:
   - Use branded types for IDs
   - Prefer union types over enums
   - Use type guards for runtime checks
   - Leverage TypeScript's type system

2. **Documentation**:
   - JSDoc for complex types
   - Clear section headers
   - Usage examples
   - Dependency documentation

3. **Organization**:
   - Keep related types together
   - Clear layer separation
   - Minimal dependencies
   - No circular imports

4. **Imports**:
   ```typescript
   // Comprehensive imports
   import type * as Types from '@/types'
   
   // Selective imports
   import type { User, AuthUser } from '@/types'
   
   // UI component imports
   import type { BaseProps, ChatMessageProps } from '@/types'
   ```

## Adding New Types

1. **Database Types**:
   - Add to `db.ts`
   - Follow `Db` prefix convention
   - Update from Supabase schema

2. **Domain Types**:
   - Choose appropriate domain file
   - Add type definition
   - Update domain index
   - Add to selective exports if commonly used

3. **UI Types**:
   - Add to `ui.ts`
   - Group with related components
   - Extend `BaseProps`
   - Document with JSDoc

## Type Dependencies

```
UI Layer (ui.ts)
    ↑
Service Layer (ai.ts, webhooks.ts)
    ↑
Domain Layer (users.ts, cases.ts, etc.)
    ↑
Database Layer (db.ts)
    ↑
Supabase Schema (supabase.ts)
```

Each layer should only depend on the layers below it to maintain a clean architecture.