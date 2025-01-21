# Phase 3: Database Schema & Case Management

Below is a flattened list of tasks. Any general Supabase setup is already covered in earlier phases. This phase focuses on creating/modifying the “Cases” table and building basic CRUD around patient case tickets.

---

## Phase 3: Flattened Checklist

[ ] BACKEND: Define the “Cases” table in Supabase (id, patient_id, status, priority, timestamps, etc.).  
[ ] BACKEND: Write or refine row-level security (RLS) policies so that:  
   - Patients can see/edit their own cases.  
   - Staff can manage cases for all patients.  
[ ] BACKEND: Create Next.js API routes (/api/cases) for creating, reading, updating, and deleting cases.

[ ] FRONTEND: Build a “New Case” page for patients, using Shadcn UI (title, description, attachments).  
[ ] FRONTEND: Implement a “Case Queue” page for staff, listing open cases (with sorting/filtering by status, priority).  
[ ] FRONTEND: Ensure dark-mode and glassmorphic styling from theme-rules.md.  
[ ] FRONTEND: Add basic validation and user feedback (e.g., toast or alert on success/failure).

[ ] GENERAL: Test role-based logic (patients restricted to their own cases, staff can update statuses).  
[ ] GENERAL: Verify that no single file exceeds 250 lines (codebase-best-practices.md).  
[ ] GENERAL: Commit, push, and review in GitHub for continuous integration checks.
