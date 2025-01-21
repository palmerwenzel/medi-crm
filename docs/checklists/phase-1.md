# Phase 2: Authentication & RBAC

Below is a flattened list of tasks for user login, registration, and basic role-based access control. Overlaps with Supabase setup (project creation) were handled in Phase 0, so we focus on enabling Auth and handling roles.

---

## Phase 2: Flattened Checklist

[ ] BACKEND: Enable Supabase Auth in your existing Supabase project.  
[ ] BACKEND: Create a “Users” table with columns for role (patient, staff, admin) and relevant user info.  
[ ] BACKEND: (Optional) Configure row-level security (RLS) policies or access policies if you require fine-grained data control at this stage.

[ ] FRONTEND: Install and configure the Supabase client in the Next.js project (if not done in Phase 0).  
[ ] FRONTEND: Build a registration page (Shadcn UI form) for new user sign-up, hooking into Supabase Auth.  
[ ] FRONTEND: Build a login page (Shadcn UI form) to handle user sign-in with Supabase Auth.  
[ ] FRONTEND: Use Tailwind classes for responsive design per ui-rules.md.

[ ] FRONTEND: Display dynamic UI elements based on role (e.g., hide certain nav links for non-admins).  
[ ] BACKEND: Add minimal checks for role-based access in Next.js server components or middleware (tech-stack-rules.md reference).  
[ ] GENERAL: Test end-to-end (login, registration, role validation) to ensure all flows function correctly.
