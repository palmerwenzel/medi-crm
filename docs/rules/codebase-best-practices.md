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

Below is the recommended folder structure for Next.js (App Router) + Supabase + Shadcn UI applications, emphasizing clear separation of concerns and route organization:

```
my-app/
├── app/
│   ├── (auth)/                    # Auth route group (doesn't affect URL)
│   │   ├── login/
│   │   │   ├── page.tsx          # /login
│   │   │   ├── actions.ts        # Server actions
│   │   │   └── login-form.tsx    # Client component
│   │   └── signup/
│   │       ├── page.tsx          # /signup
│   │       └── components/       # Route-specific components
│   │
│   ├── main-feature/             # Direct route with layout (e.g., dashboard)
│   │   ├── layout.tsx           # Basic auth + shared UI shell
│   │   └── page.tsx             # /main-feature - Main view with role handling
│   │
│   └── (features)/              # Feature route group
│       └── (protected)/         # Protected routes group
│           ├── layout.tsx       # Role/permission validation
│           ├── feature-a/       # e.g., cases, patients
│           │   ├── page.tsx     # /feature-a
│           │   └── new/
│           │       └── page.tsx # /feature-a/new
│           └── feature-b/
│               ├── page.tsx     # /feature-b
│               └── [id]/
│                   └── page.tsx # /feature-b/[id]
│
├── components/                   # Shared components
│   ├── feature-a/               # Feature-specific components
│   ├── feature-b/
│   └── ui/                      # Shared UI components
│
├── lib/                         # Shared utilities
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   └── utils/
│
├── types/                       # TypeScript types
├── styles/                      # Global styles
└── docs/                        # Documentation
```

Key organizational principles:

1. **Route Groups & Layouts**
   - Use route groups (in parentheses) for logical organization without URL impact
   - Separate auth routes `(auth)` from main features
   - Place shared layouts at the appropriate level for inheritance
   - Use nested route groups for protected features

2. **Authentication Layers**
   - Main feature layout (`main-feature/layout.tsx`): Basic auth + UI shell
   - Protected routes layout (`(features)/(protected)/layout.tsx`): Role validation
   - Clear separation between authentication and authorization

3. **Component Organization**
   - Route-specific components live alongside their routes
   - Shared components go in the top-level `components` directory
   - Feature-specific shared components go in feature-named folders

4. **File Naming & Location**
   - Use `page.tsx` for route endpoints
   - Use `layout.tsx` for shared UI and auth boundaries
   - Use `actions.ts` for server actions
   - Group related components in descriptive folders

This structure provides:
- Clear authentication boundaries
- Logical feature organization
- Proper layout inheritance
- Clean URLs despite complex organization
- Scalability for new features

### Role-Based Routing Pattern

The application uses a shared-route pattern with role-based views for better maintainability and security:

1. **Authentication Boundaries**
   ```
   app/
   ├── dashboard/                 # First auth boundary
   │   ├── layout.tsx            # Basic auth + UI shell
   │   └── page.tsx              # Role-specific dashboard views
   └── (dashboard)/              # Feature organization (URL unaffected)
       └── (role-routes)/        # Second auth boundary
           ├── layout.tsx        # Role validation
           └── [feature]/        # Protected features
   ```

2. **Auth Layer Responsibilities**
   - `dashboard/layout.tsx`: Basic authentication, UI shell
   - `(role-routes)/layout.tsx`: Role validation, feature access

3. **Component Organization for Role-Based Features**
   ```
   components/
   ├── [feature]/
   │   ├── views/               # Role-specific views
   │   │   ├── patient-view.tsx
   │   │   ├── staff-view.tsx
   │   │   └── admin-view.tsx
   │   └── shared/             # Shared components
   └── ui/                     # Generic UI components
   ```

4. **Route Access Patterns**
   - Shared routes with role-based filtering
   - Role-aware components and actions
   - Centralized authorization
   - Clean URLs regardless of role

This pattern ensures:
- Secure authentication boundaries
- DRY (Don't Repeat Yourself) code
- Clear separation of concerns
- Maintainable role-based features
- Scalable architecture for new roles/features

---

## 3. Code Organization & Conventions

1. Per-Feature Foldering  
   • Group files by feature or domain within the app or components folder. For example, all "patient" pages and components under "app/(routes)/patient" or "components/patient".

2. Server Actions Pattern
   • Each page with form submissions or server-side operations should have an accompanying `actions.ts` file
   • The `actions.ts` file should contain all server actions, form handlers, and redirect logic
   • Keep UI components focused on presentation, delegating business logic to actions
   • Example structure:
     ```
     app/(auth)/login/
     ├── page.tsx           // UI and component composition
     ├── actions.ts         // Server actions, form handlers, redirects
     └── loading.tsx        // Loading state (optional)
     ```

3. Avoid Massive Files  
   • For complex functions or large utilities, break them into smaller modules. If a single function becomes too large, divide it into multiple internal helper functions.

4. Adherence to Tech-Stack Rules  
   • Follow [tech-stack-rules.md] for React, Next.js, Tailwind, Supabase, and Node.js best practices.  
   • Keep server-side and client-side logic separate, leveraging Next.js App Router features properly.

5. Code Comments & Documentation  
   • Place summary comments in your modules to clarify data flows (e.g., how supabase.ts integrates with the triage-llm.ts).  
   • For UI components, mention relevant references in [ui-rules.md] or [theme-rules.md] if you adopt special styling or accessibility design.

6. Testing & Integration Flow  
   • Tests for each module or feature reside alongside their code (e.g., patient-form.test.tsx or within a __tests__ subfolder).  
   • Rely on Jest for unit tests, React Testing Library for component tests, and (optionally) Cypress/Playwright for E2E.

7. Supabase Integration  
   • For authentication implementation, refer to [@auth-best-practices.md] for detailed patterns and best practices.
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
• [auth-best-practices.md] – Authentication implementation patterns and best practices

---

## Conclusion

Adhering to these codebase best practices ensures that MediCRM remains an AI-friendly, developer-centric project. By enforcing strict file size limits, thoughtful folder structures, and thorough in-code documentation, the platform will stay scalable, maintainable, and intuitive for the entire team—human or otherwise.