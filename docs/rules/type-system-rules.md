# Type System Rules

This document outlines TonIQ's type system architecture, ensuring consistency and compatibility across database, API, and UI layers. It serves as the central reference for type definitions, transformations, and validation patterns.

---

## 1. Type Sources & Hierarchy

1. Database Types (`src/types/supabase.ts`)
   - Generated from Supabase schema
   - Defines base types for all database tables
   - Includes `Row`, `Insert`, and `Update` variants
   ```ts
   type Tables = Database['public']['Tables']
   type CaseRow = Tables['cases']['Row']
   type CaseInsert = Tables['cases']['Insert']
   ```

2. Validation Schemas (`src/lib/validations/`)
   - Zod schemas for runtime validation
   - Type inference for form inputs
   - Located in domain-specific files (e.g., `case.ts`, `user.ts`)
   ```ts
   // case.ts
   export const createCaseSchema = z.object({...})
   export type CreateCaseInput = z.infer<typeof createCaseSchema>
   ```

3. API Types (`src/app/api/**/route.ts`)
   - Request/Response types for API routes
   - Derived from validation schemas
   - Located alongside route handlers

4. Component Props (`src/components/**/`)
   - Interface definitions for component props
   - Derived from database or validation types
   - Located in component files or separate type files

---

## 2. Type Compatibility Patterns

1. Database → API Layer
   ```ts
   // 1. Start with database type
   type CaseRow = Tables['cases']['Row']
   
   // 2. Add API-specific fields
   interface CaseResponse extends CaseRow {
     patient?: { name: string }
     assigned_to?: { name: string }
   }
   
   // 3. Create validation schema
   const caseResponseSchema = z.object({...})
   ```

2. API → UI Layer
   ```ts
   // 1. Define component props
   interface CaseCardProps {
     case: CaseResponse
     onUpdate: (id: string) => Promise<void>
   }
   
   // 2. Use with validation
   export function CaseCard({ case, onUpdate }: CaseCardProps) {
     // Component logic
   }
   ```

3. Form → Database
   ```ts
   // 1. Define input schema
   const inputSchema = z.object({...})
   type FormInput = z.infer<typeof inputSchema>
   
   // 2. Transform to database type
   function toDatabase(input: FormInput): CaseInsert {
     // Transform logic
   }
   ```

---

## 3. Type Creation Guidelines

1. Adding New Types
   - Place in appropriate location based on domain
   - Follow naming convention: `[Domain][Purpose][Type]`
   - Document with TSDoc comments
   ```ts
   /**
    * Represents a medical case in the system
    * @see Database['public']['Tables']['cases']
    */
   export interface Case {
     // Type definition
   }
   ```

2. Type Transformations
   - Create utility functions for common transformations
   - Place in `src/lib/utils/transforms/`
   - Use type predicates for type narrowing
   ```ts
   export function isCaseResolved(
     case: Case
   ): case is Case & { status: 'resolved' } {
     return case.status === 'resolved'
   }
   ```

3. Shared Types
   - Common types in `src/types/shared.ts`
   - Enums as const arrays with type inference
   ```ts
   export const Priorities = ['low', 'medium', 'high'] as const
   export type Priority = (typeof Priorities)[number]
   ```

---

## 4. Type Validation

1. Runtime Validation
   - Use Zod schemas for all external data
   - Co-locate schemas with types when possible
   - Provide helpful error messages
   ```ts
   export const userSchema = z.object({
     email: z.string().email('Invalid email format'),
     role: z.enum(['admin', 'staff', 'patient'])
   })
   ```

2. Type Guards
   - Use for runtime type checking
   - Place in relevant domain utils
   ```ts
   export function isStaffMember(
     user: unknown
   ): user is StaffMember {
     return userSchema.safeParse(user).success
   }
   ```

---

## 5. Best Practices

1. Type Location Rules
   - Database types → `src/types/supabase.ts`
   - Validation schemas → `src/lib/validations/[domain].ts`
   - Component types → With component or in `types/` subfolder
   - Shared/utility types → `src/types/shared.ts`

2. Naming Conventions
   - Types/Interfaces: PascalCase
   - Type aliases: PascalCase
   - Validation schemas: camelCase
   - Enums: PascalCase

3. Documentation
   - Add TSDoc comments for complex types
   - Include examples for non-obvious usage
   - Reference related types or schemas

4. Type Safety
   - Enable strict TypeScript checks
   - Avoid type assertions (`as`) unless necessary
   - Use branded types for type-safe IDs
   ```ts
   type UserId = string & { readonly __brand: unique symbol }
   ```

---

## 6. Common Patterns

1. Discriminated Unions
   ```ts
   type CaseState =
     | { status: 'open'; assignedTo?: never }
     | { status: 'assigned'; assignedTo: string }
   ```

2. Mapped Types
   ```ts
   type CaseActions = {
     [K in CaseStatus]: (id: string) => Promise<void>
   }
   ```

3. Utility Types
   ```ts
   type OptionalCase = Partial<Case>
   type RequiredCase = Required<Case>
   type CasePreview = Pick<Case, 'id' | 'title' | 'status'>
   ```

---

## 7. Type Checklist

When adding new types:
1. ✓ Identify appropriate location based on domain
2. ✓ Create validation schema if handling external data
3. ✓ Add necessary type transformations
4. ✓ Document with TSDoc comments
5. ✓ Update relevant test files
6. ✓ Verify strict type checking passes
7. ✓ Consider impact on existing types

---

## References

- [Supabase Type Docs](https://supabase.com/docs/reference/typescript-support)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) 