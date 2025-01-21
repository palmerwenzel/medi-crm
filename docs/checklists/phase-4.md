# Phase 4: Administrator Tools & AI Integration

Now we layer on admin capabilities, more advanced AI triage, routing logic, and performance metrics. This includes lead-in tasks for integrating external EHR systems or scheduling platforms (if desired), advanced routing intelligence, and analytics. We’ll also ensure compliance logging and the possibility of webhooks.

---

[ ] FRONTEND: Admin Panel (Shadcn UI):  
   - Manage user roles and specialties  
   - Configure routing rules (specialty-based assignment, urgent escalations)  
   - Team Management (group staff by department/specialty)

[ ] FRONTEND: Display performance and analytics metrics (e.g., average response time, open vs. closed cases, staff workload distribution).  
[ ] FRONTEND: Add deeper AI Triage integration (OpenAI API calls) in patient or staff workflows.  
[ ] FRONTEND: Provide charts or simple dashboards for admin to drill down on case trends (could integrate a chart library or minimal custom components).

[ ] BACKEND: Add Supabase triggers or Next.js server actions for:  
   - Logging role changes, case edits, or sensitive data access  
   - Generating performance metrics or stats  
   - Sending webhooks for key events (e.g., new urgent case) (optional in this phase)  

[ ] BACKEND: Implement or refine an /api/ai/triage endpoint that leverages OpenAI Node.js library for real triage suggestions.  
[ ] BACKEND: Incorporate EHR scheduling or lab-result integrations if desired (webhook or direct API approach).

[ ] ADMIN/SECURITY: Ensure compliance with RLS, encryption at rest, audit logs, and archival strategies for older cases.  
[ ] GENERAL: Check that advanced features (AI triage, routing) do not conflict with role-based restrictions or patient data privacy.  
[ ] GENERAL: Clean up large files to ensure no single file exceeds 250 lines.  
[ ] GENERAL: Final regression test of all flows (patient, staff, admin), focusing on performance, scalability, and compliance.  
[ ] GENERAL: Prepare documentation (README, project wiki) for final submission.