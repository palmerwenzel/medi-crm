# Tech Stack Rules

This document outlines best practices, limitations, and conventions for each major technology selected for MediCRM. By following these guidelines, you ensure consistent coding patterns, maintainable modules, and straightforward scalability.

---

## 1. TypeScript
### Best Practices
1. Use Strict Mode  
   - Always enable strict mode in tsconfig.json (strict, noImplicitAny, strictNullChecks).  
   - Encourages accurate type definitions and reduces bugs.
2. Prefer Interfaces for Object Shapes  
   - For data contracts, use interfaces over type aliases unless you need advanced type manipulation.  
   - Example: interface Case { id: string; status: string; }
3. Leverage Generics  
   - Use generic interfaces/classes to avoid repetitive code and keep functions or data structures flexible.
4. Enable ESLint + Prettier  
   - Automate code formatting and linting for a consistent code style.
5. Avoid Implicit Any  
   - Explicitly define return types and parameter types whenever possible.

### Limitations & Pitfalls
1. Compilation Overhead  
   - TypeScript adds a compilation step, which can slow down very large codebases if not optimized.  
2. Overly Strict Types  
   - Overuse of complex types can make code hard to read. Always strike a balance between strictness and simplicity.

---

## 2. React
### Best Practices
1. Functional Components  
   - Use React function components with hooks rather than class components.  
   - Encourages a more straightforward, declarative style and pairs well with TypeScript's functional approach.
2. Keep Components Small and Reusable  
   - Prefer modular, composable pieces over monolithic components.  
   - This improves maintainability and reusability.
3. State Management  
   - Use React context or a dedicated state management library (if necessary) for global state.  
   - Keep local states as local as possible to maintain predictable data flow.
4. Handle Side Effects with Hooks  
   - Manage side effects (e.g., data fetching, subscriptions) in useEffect or custom hooks.
5. Testing with React Testing Library  
   - Focus on behavior tests (instead of implementation details) for better test resilience.

### Limitations & Pitfalls
1. Prop Drilling  
   - Passing props through multiple levels can become cumbersome. Consider context or custom hooks to avoid this.  
2. Performance Overheads  
   - Too many renders can hurt performance. Utilize memoization (React.memo, useMemo, useCallback) where beneficial.

---

## 3. Next.js App Router
### Best Practices
1. File-Based Routing  
   - Keep your folder structure organized: collocate related files in the same directory.  
   - Name routes and directories descriptively for clarity.
2. Server & Client Components  
   - Leverage Next.js app router features, such as server components for data fetching or computations, minimizing client bundle size.
3. Data Fetching  
   - Use built-in async server components or React Server Components to fetch data closer to the server layer for performance benefits.
4. API Routes for Microservices  
   - Keep small, focused API routes that align with your application's domain (e.g., /api/cases, /api/auth).  
   - This helps maintain a clear boundary between frontend pages and backend logic.
5. Authentication & Authorization  
   - Follow the patterns defined in [@auth-best-practices.md] for implementing auth flows
   - Use server actions for auth operations
   - Keep auth-related components in the (auth) directory
   - Leverage middleware for route protection and session management

### Limitations & Pitfalls
1. Learning Curve  
   - The new app router approach can be different from the pages router—adjusting to server vs. client components requires mindful planning.  
2. Deployment Nuance  
   - Ensure your hosting platform (e.g., Vercel) supports Next.js features like edge functions or serverless modes properly.

---

## 4. Shadcn UI & Tailwind CSS
### Best Practices
1. Utility-First Styling with Tailwind  
   - Embrace Tailwind classes to keep styling consistent and avoid inline styles.  
   - Extract repetitive configurations into @apply statements or reusable components.
2. Use shadcn UI Components  
   - Leverage pre-built components (buttons, modals, popovers, etc.) for speed and accessibility.  
   - Customize theme tokens to align with MediCRM's branding.
3. Organize Components  
   - Group UI elements logically (e.g., inputs, modals, form elements) in a shared directory.  
   - Follow consistent naming patterns to quickly locate and reuse components.
4. Mobile-Minded Responsiveness  
   - Start styling from a small screen perspective, then layer on desktop breakpoints.  
   - Use Tailwind's responsive utility classes (md:, lg:, xl:) for layout changes.

### Limitations & Pitfalls
1. Class Name Bloat  
   - Overusing Tailwind classes can lead to unwieldy HTML. Use composition patterns (e.g., applying utility classes in a consistent manner) to manage complexity.  
2. Shadcn UI Changes  
   - Keep components updated if the library evolves or introduces breaking changes. (Sometimes shadcn UI evolves quickly.)

---

## 5. Supabase (Database & Auth)
### Best Practices
1. Authentication Implementation
   - Follow the detailed patterns in [@auth-best-practices.md] for auth implementation
   - Use server-side auth operations via server actions
   - Keep auth UI components separate from business logic
   - Leverage the Supabase SSR package (@supabase/ssr) for Next.js App Router
   - Store role attributes in JWT claims for middleware checks

2. Schema-Driven Approach  
   - Model your data with Postgres tables for clarity and performance.  
   - Use foreign keys judiciously to maintain relational integrity (e.g., user_id referencing Users table).

3. Database Migrations  
   - Keep migrations atomic and feature-focused (e.g., one migration for complete user system).
   - Include all related objects in a single migration (enums, tables, functions, triggers, policies).
   - Document dependencies and purpose in migration headers.
   - Order objects within migrations:
     1. Types/Enums
     2. Tables
     3. Functions
     4. Triggers
     5. Policies
   - Never split related objects across migrations to avoid dependency issues.

4. Role-Based Access with Supabase Policies  
   - Enforce row-level security (RLS) to ensure each user only sees data relevant to their role or ownership.  
   - Keep a clean mapping of "Staff," "Patient," and "Admin" roles.
5. Functions & Triggers  
   - Use Supabase's Postgres functions or triggers for advanced logic (e.g., auditing changes, anonymizing data).

### Migration Workflow
1. Local Development  
   - Use `npx supabase db reset` for clean slate testing
   - This runs all migrations in order and resets data
   - Perfect for development but not for production

2. Production Deployment  
   - Use `npx supabase db push` to apply new migrations
   - Migrations must be forward-only and never modified after push
   - Test migrations locally first with `db reset`

3. Migration Structure  
   ```sql
   --
   -- Name: [timestamp]_[feature_name]; Type: MIGRATION
   -- Description: Brief explanation of what this migration does
   -- Dependencies: List any dependencies on other migrations
   --

   -- Types/Enums first
   CREATE TYPE status AS ENUM (...);

   -- Then tables
   CREATE TABLE my_table (...);

   -- Functions next
   CREATE OR REPLACE FUNCTION my_function() ...

   -- Triggers after that
   CREATE TRIGGER my_trigger ...

   -- Finally, policies
   CREATE POLICY "My policy" ON my_table ...
   ```

### Limitations & Pitfalls
1. Permission Complexity  
   - Overly complex RLS policies or custom triggers can cause confusion and unexpected access behaviors—test thoroughly.  
2. Lock-In Risk  
   - Supabase is hosted Postgres but with custom features; if you later migrate to bare PostgreSQL or another solution, you may need to rewrite some logic.

---

## 6. Node.js (Runtime)
### Best Practices
1. Keep Dependencies Updated  
   - Frequent Node.js releases fix security and performance issues. Maintain a consistent update cadence.  
2. Use Process Managers  
   - Tools like PM2 or Docker for production environments ensure graceful handles on restarts, logging, and load balancing.
3. Handle Async Flows Responsibly  
   - Use async/await or Promises, ensuring errors are correctly caught.  
   - Avoid callback-based patterns to reduce error-prone code.

### Limitations & Pitfalls
1. Single-Threaded  
   - Node.js is single-threaded by default. Use worker threads or cluster mode if you need CPU-bound operations.  
2. Potential Memory Leaks  
   - Long-lived processes can accumulate memory if not managed. Employ profiling and monitoring tools (e.g., clinic.js) to detect issues.

---

## 7. Common Security & Compliance
1. Encryption in Transit (HTTPS)  
   - Always ensure TLS for data in transit—particularly crucial for healthcare data.  
2. Data Storage Compliance  
   - If dealing with PHI (Protected Health Information), HIPAA compliance may require secure encryption, auditing, and monthly logs.  
3. Logging & Auditing  
   - Track all user actions in a tamper-evident manner. Ensure staff members only see data aligned with their permissions.
4. Secrets Management  
   - Use environment variables or vault solutions (e.g., HashiCorp Vault) for any sensitive keys or credentials.

---

## 8. Testing & Quality Assurance
1. Unit & Integration Tests  
   - Rely on Jest, along with React Testing Library for frontend components.  
2. End-to-End Tests  
   - Use Cypress or Playwright to test complex user flows (patient sign-in, case creation, staff resolution).
3. Continuous Integration  
   - Leverage GitHub Actions or another CI platform to run automated test suites on every pull request.

---

## Summary
By adhering to these guidelines, MediCRM developers maintain a robust, secure, and high-performing architecture. Each technology has recommended usage patterns, potential pitfalls, and best practices to ensure it integrates cleanly with the rest of the stack. Reviewing this reference regularly will help keep the codebase consistent, understandable, and scalable as the project grows.