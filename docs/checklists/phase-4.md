# Phase 5: Administrator Tools & AI Integration

Below is a flattened list of tasks for admin capabilities, deeper AI triage integration, performance metrics, and final cleanups.

---

## Phase 5: Flattened Checklist

[ ] FRONTEND: Build an “Admin Panel” page using Shadcn UI to manage user roles (patient, staff, admin).  
[ ] FRONTEND: Add UI for configuring routing rules (e.g., specialty-based auto-assignment, urgent escalations).  
[ ] FRONTEND: Integrate real AI triage in the patient or staff chat workflow with OpenAI API calls.  
[ ] FRONTEND: Display performance metrics (average response time, number of open cases) with simple charts.

[ ] BACKEND: Add triggers or functions in Supabase for logging or tracking changes (role changes, case edits).  
[ ] BACKEND: Create or refine Next.js API routes to store/fetch routing rules, user roles, and performance data.  
[ ] BACKEND: Use the OpenAI Node.js library for actual triage logic (parse patient queries, produce suggestions).  
[ ] BACKEND: Confirm compliance features (audit logs, restricted data access, RLS) remain stable.

[ ] GENERAL: Clean up or refactor any large files to ensure compliance with the 250-line limit.  
[ ] GENERAL: Finalize documentation (README, wiki pages) and verify references to codebase-best-practices.md.  
[ ] GENERAL: Run final integration tests and gather performance metrics (test environment) before going live.  
