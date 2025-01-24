# Rule Routes

This file outlines the purpose of each ruleset in the "docs/rules" folder and when you should attach it to an AI context. Use it as a reference to determine which documents you need for any given task or discussion.

---

## 1. agent-rules.md
• Location: docs/rules/agent-rules.md  
• Purpose: Explains how the AI interacts with requests, triggers relevant workflows, and references other rules.  
• When To Attach: Always include when the AI must follow the TonIQ agent-specific guidelines. Particularly crucial if the AI is orchestrating or tracking feature progress through ui-workflow.md or backend-workflow.md.

---

## 2. auth-rules.md
• Location: docs/rules/auth-rules.md  
• Purpose: Covers authentication flows, usage of Supabase clients, role-based logic (RLS, JWT claims), and folder structure for login/signup.  
• When To Attach: Any time you're dealing with auth flows or server actions that handle user credentials or protected routes.

---

## 3. codebase-organization-rules.md
• Location: docs/rules/codebase-organization-rules.md  
• Purpose: Defines coding conventions, folder structure, file-naming, and line-count limits.  
• When To Attach: When reorganizing files, adding new features or modules, or ensuring that code remains maintainable and consistent.

---

## 4. nextjs-rules.md
• Location: docs/rules/nextjs-rules.md  
• Purpose: Outlines Next.js App Router best practices, including server/client components, route groups, SSR, and deployment.  
• When To Attach: When implementing new routes, optimizing SSR patterns, or configuring Next.js specifics.

---

## 5. react-rules.md
• Location: docs/rules/react-rules.md  
• Purpose: Captures React best practices (hooks, functional components, memoization, context usage).  
• When To Attach: Whenever working on complex React logic, layering in state management, or optimizing performance at the component level.

---

## 6. supabase-rules.md
• Location: docs/rules/supabase-rules.md  
• Purpose: Explains how to interact with Supabase for DB reads/writes, RLS, triggers, and environment variables.  
• When To Attach: On tasks involving database queries, realtime channels, or secure data storage using Supabase.

---

## 7. tailwind-shadcn-rules.md
• Location: docs/rules/tailwind-shadcn-rules.md  
• Purpose: Covers Tailwind utility classes, Shadcn UI components, and best practices for structuring responsive styles.  
• When To Attach: When styling UI elements or creating new components using the shadcn library and Tailwind classes.

---

## 8. theme-rules.md
• Location: docs/rules/theme-rules.md  
• Purpose: Describes the dark-mode–first design, color palettes, glassmorphic effects, and overall visual identity.  
• When To Attach: For any theming or aesthetic tasks (especially for consistent color usage, backgrounds, and transitions).

---

## 9. ui-rules.md
• Location: docs/rules/ui-rules.md  
• Purpose: Defines general UI guidelines, navigation structure, layout responsiveness, and accessibility standards.  
• When To Attach: Whenever working on broader UI patterns, user flows, or general design improvements beyond theming specifics.

---

## 10. type-system-rules.md
• Location: docs/rules/type-system-rules.md  
• Purpose: Defines the type system architecture, ensuring consistency and compatibility across database, API, and UI layers. Includes type sources, compatibility patterns, validation, and best practices.  
• When To Attach: For tasks involving type definitions, transformations between layers (DB → API → UI), or when adding new types to the system.

---

## 11. test-rules.md
• Location: docs/rules/test-rules.md  
• Purpose: Explains testing strategies: unit, component, E2E, using Jest, React Testing Library, and mocks for Supabase.  
• When To Attach: Whenever adding or updating tests, verifying coverage, or practicing TDD/BDD on critical functionalities.

---

## 12. migration-rules.md
• Location: docs/rules/migration-rules.md  
• Purpose: Details how to structure, name, and organize database migrations using Supabase CLI.  
• When To Attach: For any DB schema changes, especially to track incremental updates in production.

---

## Notes
• Attach only the relevant rule files to the AI's context to keep conversation concise.  
• When in doubt, attach multiple files if you suspect overlapping domains (e.g., auth + supabase).  
• Confirm you've followed best practices by cross-referencing codebase-organization-rules.md and test-rules.md for final checks.