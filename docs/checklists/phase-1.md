# Phase 1: Authentication & RBAC

In this phase, we'll set up user roles (patient, staff, admin), secure access to resources, and ensure we have the appropriate row-level security (RLS) or equivalent in place to protect patient data. This reflects the need for a centralized "Users" table and verifies each role's capabilities as described in our project overview and user-flow documents.

---

[✓] BACKEND: Enable Supabase Auth in your existing Supabase project.  
[✓] BACKEND: Create or update a "Users" table with columns for:  
   - role (patient, staff, admin)  
   - relevant user info (name, email, specialty if staff, etc.)  

[✓] BACKEND: Ensure row-level security (RLS) or equivalent is configured for user-related data.  
[ ] BACKEND: (Optional) Configure more granular access policies if needed for compliance or future expansions (e.g., specialized permissions for "Doctor," "Nurse," etc.).  

[✓] FRONTEND: Install and configure the Supabase client in the Next.js project (if not done in Phase 0).  
[✓] FRONTEND: Build a registration page (Shadcn UI form) for new user sign-up, hooking into Supabase Auth.  
[✓] FRONTEND: Build a login page (Shadcn UI form) to handle user sign-in with Supabase Auth.  
[✓] FRONTEND: Use Tailwind classes for responsive design per our guidelines.

[✓] FRONTEND: Conditionally render UI based on role (patient vs. staff vs. admin) to ensure correct access to future pages (dashboards, admin panel, etc.).  
[✓] BACKEND: Validate user identities in Next.js middleware.  

[✓] GENERAL: Test end-to-end (login, registration, role-specific UIs) and confirm that only authorized roles can see restricted pages or actions.  
[✓] GENERAL: Check for adherence to healthcare privacy considerations (e.g., storing minimal user info publicly, enabling encryption in Supabase).

---

## Implementation Notes
- Using client-first pattern with minimal server gating:
  - Middleware checks for valid session token
  - Client AuthProvider handles role-based UI and navigation
  - RLS policies enforce data-level permissions
- Server components rely on middleware for basic auth
- API routes use RLS for access control
- Client components use `useAuth()` hook for role checks