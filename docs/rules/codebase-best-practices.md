# Codebase Best Practices

This document describes how to structure and maintain the MediCRM codebase for clarity, scalability, and AI-friendliness. It references guidelines from [tech-stack.md], [tech-stack-rules.md], [ui-rules.md], and [theme-rules.md].

By following these practices, we ensure that all contributors (including AI-based tools) can navigate, understand, and extend the code effectively.

---

## 1. General Principles

1. Modularity & Separation of Concerns  
   • Keep code highly modular: separate UI, domain logic, utilities, and data access.  
   • Each file or module should contain a cohesive set of functionalities.

2. File Size Limit  
   • Limit each file to ≤ 250 lines to maintain readability for code review, collaboration, and AI assistance.  
   • If a file grows beyond 250 lines, split it into logical submodules or utilities.

3. Consistent Naming  
   • Use descriptive, kebab-case folder names (e.g., "patient-forms", "admin-tools").  
   • Adopt lowerCamelCase or PascalCase for TypeScript interfaces, functions, and variable names.

4. File Header Comments  
   • Start each file with a brief explanation (1–2 lines) describing its purpose and scope.  
   • Include any relevant references, like "@ui-rules.md" or "@theme-rules.md" if the file implements specific guidelines from those documents.

5. Function Comments (JSDoc/TSDoc)  
   • Before each function or module, describe its purpose, parameters, and return types.  
   • Example (TSDoc):
     /**
      * Fetches a user by ID from the database.
      * @param userId - The unique identifier for the user.
      * @returns An object representing the user's data, or null if none exists.
      */
   • This aids both human readers and automated tooling.

---

## 2. Project Folder Structure

Below is the folder structure for Next.js (App Router) + Supabase + Shadcn UI. It reflects our actual organization for maximum clarity and maintainability.
```
my-crm  
├── app  
│   ├── (routes)  
│   │   ├── layout.tsx            // Layout component for default page structure  
│   │   ├── page.tsx              // Root page for the application  
│   │   ├── api                   // API route handlers: e.g., /api/cases  
│   │   │   └── cases  
│   │   │       └── route.ts      // "POST/GET/PUT/DELETE" methods for case handling  
│   │   └── ...other routes       // Additional routes (patients, admin, etc.)  
│   └── (components)             // Shared UI elements (navbars, footers, etc.)  
│       ├── header.tsx            // Example: header component  
│       ├── sidebar.tsx           // Example: sidebar navigation component  
│       └── ...  
├── components  
│   ├── forms  
│   │   ├── patient-form.tsx      // Patient data form with Shadcn UI  
│   │   └── staff-form.tsx        // Staff creation/edit form  
│   ├── ui                        // Core Shadcn UI wrappers, custom Radix components  
│   └── ...                       // Additional shared or feature-specific components  
├── lib  
│   ├── supabase                  // Supabase client and utilities  
│   │   ├── client.ts             // Browser client using @supabase/ssr  
│   │   ├── server.ts             // Server client using @supabase/ssr  
│   │   ├── api.ts               // API helpers using @supabase/ssr  
│   │   └── realtime.ts          // Realtime subscriptions using @supabase/supabase-js  
│   ├── hooks                     // Custom React hooks (e.g., real-time DB updates)  
│   │   └── use-something.ts      // Example: useRealtime, useAuth  
│   ├── store                     // State management (if needed)  
│   ├── utils                     // Utility functions and helpers  
│   └── ai                        // AI utility folder (OpenAI integration, LLM logic)  
│       └── triage-llm.ts         // Triage logic via OpenAI API  
├── middleware                    // Next.js middleware (auth, routing)  
│   └── auth.ts                   // Authentication and route protection  
├── types  
│   ├── supabase.ts              // Generated Supabase types  
│   └── index.d.ts               // Global type declarations  
├── styles  
│   ├── globals.css              // Tailwind base, global style overrides  
│   └── theme.css                // Additional CSS tokens for glassmorphic styling  
├── docs  
│   ├── project-info  
│   │   └── tech-stack.md        // Already defined tech stack details  
│   ├── rules  
│   │   ├── tech-stack-rules.md  // Stack usage guidelines  
│   │   ├── ui-rules.md          // UI building guidelines  
│   │   ├── theme-rules.md       // Theme styles & color palette  
│   │   └── codebase-best-practices.md // This file  
│   └── ...                      // Additional docs & references  
├── .eslintrc.js                 // ESLint config  
├── tailwind.config.js           // Tailwind config + Shadcn theme tokens  
├── tsconfig.json                // TypeScript config with strict settings  
├── package.json                 // Dependencies + scripts  
└── README.md                    // Overview of the project
```
---

## 3. Code Organization & Conventions

1. Per-Feature Foldering  
   • Group files by feature or domain within the app or components folder. For example, all "patient" pages and components under "app/(routes)/patient" or "components/patient".

2. Avoid Massive Files  
   • For complex functions or large utilities, break them into smaller modules. If a single function becomes too large, divide it into multiple internal helper functions.

3. Adherence to Tech-Stack Rules  
   • Follow [tech-stack-rules.md] for React, Next.js, Tailwind, Supabase, and Node.js best practices.  
   • Keep server-side and client-side logic separate, leveraging Next.js App Router features properly.

4. Code Comments & Documentation  
   • Place summary comments in your modules to clarify data flows (e.g., how supabase.ts integrates with the triage-llm.ts).  
   • For UI components, mention relevant references in [ui-rules.md] or [theme-rules.md] if you adopt special styling or accessibility design.

5. Testing & Integration Flow  
   • Tests for each module or feature reside alongside their code (e.g., patient-form.test.tsx or within a __tests__ subfolder).  
   • Rely on Jest for unit tests, React Testing Library for component tests, and (optionally) Cypress/Playwright for E2E.

6. Supabase Integration  
   • Use @supabase/ssr for all Next.js App Router integrations (server components, API routes, middleware).  
   • Use @supabase/supabase-js for testing and client-side realtime features.  
   • NEVER use @supabase/auth-helpers-nextjs (deprecated).  
   • Keep Supabase client initialization consistent across the app using the helpers in lib/supabase/.

---

## 4. Creating New Files

When adding a new file, follow these steps:

1. Choose the Correct Folder  
   • UI Components → /components  
   • Routes → /app/(routes)  
   • Custom Hooks → /lib/hooks  
   • Utilities → /lib/utils  
   • Types → /types  
   • Middleware → /middleware

2. Add a Brief Header Comment  
   • Summarize the file's purpose. Mention any direct usage of theming or special guidelines from [theme-rules.md].

3. Write Functions with TSDoc  
   • Parameter descriptions, return types, potential error cases.  
   • Example:
     /**
      * Posts a new case to the database.
      * @param caseData - Object containing the case details (title, patientId, etc.).
      * @returns The newly created case record.
      */

4. Limit the File to 250 Lines  
   • If you approach this limit, refactor or separate out logic into additional files.

---

## 5. Ensuring Readability & Maintenance

1. Strict Type Checking  
   • Keep TypeScript strict mode active, verifying that all function signatures and component props are well-defined.  
   • Combine strict typing with JSDoc/TSDoc for the best editor and AI tooling experience.

2. Linting & Formatting  
   • Integrate ESLint and Prettier to consistently style the code and maintain approachable structure.  
   • Enable formatting on save in your IDE to reduce friction for the entire team.

3. Periodic Refactoring  
   • Regularly audit the code for large files, repeated logic, or unclear naming.  
   • Keep the codebase "AI-friendly" by using descriptive variable names and minimal churn.

4. Collaboration & CI/CD  
   • Use GitHub Actions for continuous integration, including test runs and lint checks on every pull request.  
   • Keep branch merges small and frequent to avoid massive changes that are difficult to review or revert.

---

## 6. References

• [tech-stack.md] – Technology choices and rationale  
• [tech-stack-rules.md] – Stack-specific best practices  
• [ui-rules.md] – UI building principles (desktop-first, animations, accessibility)  
• [theme-rules.md] – Theming (dark-mode, glassmorphism, accent colors)  

---

## Conclusion

Adhering to these codebase best practices ensures that MediCRM remains an AI-friendly, developer-centric project. By enforcing strict file size limits, thoughtful folder structures, and thorough in-code documentation, the platform will stay scalable, maintainable, and intuitive for the entire team—human or otherwise.