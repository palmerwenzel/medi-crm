# Phase 4: Administrator Tools & AI Integration

- [ ] FRONTEND: Admin Panel (Shadcn UI)
  - [ ] FRONTEND: Manage user roles and specialties (UI forms, role filters).
  - [ ] BACKEND: Endpoints to create, update, and retrieve user roles/specialties.
  - [ ] FRONTEND: Configure routing rules (specialty-based assignment, urgent escalations) UI.
  - [ ] BACKEND: Logic to store and apply routing rules for new or updated cases.
  - [ ] FRONTEND: Basic team management UI (group staff by department/specialty).
  - [ ] BACKEND: Endpoints for team creation, grouping, manipulation.

- [ ] FRONTEND: Display performance and analytics metrics
  - [ ] FRONTEND: Analytics dashboard (charts or tables) with average response time, open vs. closed, staff workload distribution.
  - [ ] BACKEND: Aggregate and serve stats (response times, open vs. closed cases, staff load).

- [ ] FRONTEND: Deeper AI Triage integration
  - [ ] FRONTEND: Add UI controls or modals to trigger OpenAI-based triage suggestions.
  - [ ] BACKEND: Expand /api/ai/triage to handle case data, call OpenAI API, return triage info.

- [ ] FRONTEND: Admin charts or dashboards for case trends
  - [ ] FRONTEND: Integrate a chart library or custom chart components for deeper data.
  - [ ] BACKEND: Provide aggregated data endpoints for trending metrics.

- [ ] BACKEND: Supabase triggers or Next.js server actions
  - [ ] BACKEND: Log role changes, case edits, or sensitive data access.
  - [ ] BACKEND: Generate performance metrics or stats automatically.
  - [ ] BACKEND: (Optional) Setup webhooks for key events (urgent case creation).

- [ ] BACKEND: Finalize or refine /api/ai/triage
  - [ ] BACKEND: Connect to OpenAI Node.js library for robust triage suggestions.
  - [ ] BACKEND: Enhance request validation and rate-limiting for AI calls.

- [ ] BACKEND: Potential EHR scheduling/lab-result integrations
  - [ ] BACKEND: Create placeholders or actual integration logic for EHR scheduling.
  - [ ] BACKEND: Provide webhooks or API route for external labs/results if needed.

- [ ] ADMIN/SECURITY: Compliance checks
  - [ ] BACKEND: Verify row-level security (RLS) and encryption at rest for sensitive data.
  - [ ] BACKEND: Maintain audit logs and archival strategies for older cases.

- [ ] GENERAL: Integration checks
  - [ ] Ensure advanced features (AI triage, routing rules) do not violate RBAC or privacy.
  - [ ] Clean large files so no single file exceeds 250 lines (refactor as needed).

- [ ] GENERAL: Regression testing across all roles
  - [ ] FRONTEND & BACKEND: Final end-to-end test of patient, staff, admin flows.
  - [ ] FRONTEND & BACKEND: Validate performance, scalability, and compliance in production-like environment.
  - [ ] GENERAL: Update project documentation (README, project wiki) for final sign-off.
