# Type System Rules

## Type Hierarchy and Dependencies

1. Database Types (`@/types/supabase` and `@/types/domain/db.ts`)
   - Generated types from Supabase live in `@/types/supabase`
   - Database table and enum types are re-exported from `db.ts`
   - `db.ts` is the single source of truth for database types
   - Never import Database types directly from `@/types/supabase` except in `db.ts`

2. Domain Types (`@/types/domain/*.ts`)
   - Domain types extend or reference database types from `db.ts`
   - Define business logic constraints and domain-specific fields
   - Act as the source of truth for the application's type system
   - Should not import from validation layer
   - Example: `Case extends DbCase` with additional domain-specific fields

3. Validation Schemas (`@/lib/validations/*.ts`)
   - Import and validate against domain types
   - Use Zod for runtime validation
   - Export inferred types from schemas
   - Example: `casesRowSchema satisfies z.ZodType<Case>`

4. UI Types (`@/types/domain/ui.ts`)
   - Import only from domain types
   - Define component props and UI-specific state
   - Can transform domain types for UI needs
   - Example: `UIMessage extends Omit<Message, 'metadata'>`

## Dependency Flow

```
Database Types (Supabase)
       ↓
    db.ts
       ↓
Domain Types (domain/*.ts)
    ↙         ↘
Validation    UI Types
Schemas
```

❌ INCORRECT patterns to avoid:
```typescript
// DON'T: Import Database types directly from Supabase
import type { Database } from '@/types/supabase'  // Only allowed in db.ts

// DON'T: Import validation types in domain
import type { CasesRow } from '@/lib/validations/cases'

// DON'T: Define database types outside db.ts
export type DbCase = Database['public']['Tables']['cases']['Row']
```

✅ CORRECT patterns:
```typescript
// DO: Import database types from db.ts
import type { DbCase } from '@/types/domain/db'

// DO: Extend database types in domain
export interface Case extends DbCase {
  metadata: CaseMetadata
}

// DO: Import domain types in validation
import type { Case } from '@/types/domain/cases'
export const schema = z.object({...}) satisfies z.ZodType<Case>
```

## Type Transformations

1. Database to Domain
```typescript
// In db.ts
export type DbUser = Database['public']['Tables']['users']['Row']

// In domain/users.ts
export interface User extends Omit<DbUser, 'created_at'> {
  createdAt: Date  // Transform string to Date
}
```

2. Domain to Validation
```typescript
// In domain/cases.ts
export interface Case extends DbCase {
  metadata: CaseMetadata
}

// In validations/cases.ts
export const schema = z.object({...}) satisfies z.ZodType<Case>
```

3. Domain to UI
```typescript
// In domain/chat.ts
export interface Message extends DbMessage {
  metadata: MessageMetadata
}

// In domain/ui.ts
export interface UIMessage extends Omit<Message, 'metadata'> {
  state: MessageState
  metadata: MessageMetadata & { status: MessageStatus }
}
```

## Naming Conventions

1. Database Types
   - Prefix with `Db`: `DbCase`, `DbUser`
   - Use for raw database types
   - Only defined in `db.ts`

2. Domain Types
   - No prefix: `Case`, `User`
   - Use for business logic types
   - Define in appropriate domain file

3. Validation Types
   - Suffix with purpose: `CasesRow`, `CasesInsert`
   - Infer from Zod schemas
   - Must validate against domain types

4. UI Types
   - Prefix with `UI`: `UIMessage`, `UIChatSession`
   - Or suffix with `Props`: `ChatMessageProps`
   - Define in `ui.ts`

## Type Safety Rules

1. Always use TypeScript's strict mode
2. Avoid `any` - use `unknown` when type is uncertain
3. Use `satisfies` for schema validation
4. Make impossible states unrepresentable
5. Use union types for finite sets of values
6. Use branded types for type safety (e.g., `UserId`)

## Best Practices

1. Keep type definitions close to their use
2. Use type inference where possible
3. Document complex types
4. Use discriminated unions for state management
5. Avoid type assertions (`as`)
6. Use proper type transformations between layers

## File Organization

1. Group related types in domain files
2. Keep validation schemas separate from types
3. Use index files for public exports
4. Organize by feature, not by type
5. Keep UI types in `ui.ts`

## Common Patterns

1. State Management Types
```typescript
interface State {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: Data | null
  error: Error | null
}
```

2. Form Types
```typescript
interface FormData extends Pick<Domain, 'field1' | 'field2'> {
  extraField: string
}
```

3. API Response Types
```typescript
interface ApiResponse<T> {
  data: T
  meta: ResponseMetadata
}
```