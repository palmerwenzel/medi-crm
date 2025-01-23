# Phase 3: Staff & Patient Dashboards

## MVP Requirements

- [ ] FRONTEND: Implement patient case listing UI (shows case status, basic details).
- [ ] BACKEND: Provide API endpoint to fetch patient cases with status info.
- [ ] FRONTEND: Add simple view/edit actions for patient cases (basic form).
- [ ] BACKEND: Provide API endpoint/mutation to update allowed patient case fields.
- [ ] FRONTEND: Ensure mobile responsiveness on patient case overview components.

- [ ] FRONTEND: Implement essential staff case queue UI (lists all cases).
- [ ] BACKEND: Provide API endpoint to fetch staff case list (all statuses).
- [ ] FRONTEND: Allow basic status updates from staff queue (e.g., open/closed).
- [ ] BACKEND: Provide API endpoint/mutation to update case status fields.
- [ ] FRONTEND: Create simple staff case details view (shows key patient/case info).

- [ ] FRONTEND: Provide basic error states and minimal inline validations (patient/staff).
- [ ] BACKEND: Implement simple error handling in data fetching and mutations.
- [ ] BACKEND: Optimize or index queries for efficient case listing.

## Enhancements (Post-MVP)

- [ ] FRONTEND: Enhanced patient dashboard - advanced sorting and filtering UI.
- [ ] BACKEND: Support query params or advanced filters for patient cases.
- [ ] FRONTEND: Provide file attachments UI for patients (upload button, file previews).
- [ ] BACKEND: Implement file attachment storage endpoint (handle uploads, store metadata).
- [ ] FRONTEND: Show a rich case history (timeline or activity log).
- [ ] BACKEND: Serve detailed change logs or events for each case.

- [ ] FRONTEND: Advanced staff features:
  - [ ] FRONTEND: Priority-based filter UI (e.g., highlight urgent cases).
  - [ ] BACKEND: Provide priority/specialty data in case objects/endpoints.
  - [ ] FRONTEND: Ability to tag/search by specialty.
  - [ ] BACKEND: Query or filter cases by specialty/tag.
  - [ ] FRONTEND: Bulk operations UI (multi-select cases, apply batch status change).
  - [ ] BACKEND: Endpoints to handle batch updates or operations.
  - [ ] FRONTEND: Display performance metrics (basic staff stats).
  - [ ] BACKEND: Generate or compile performance data (stats, logs).
  - [ ] FRONTEND: Show SLA indicators on staff dashboard.
  - [ ] BACKEND: Provide SLA calculation logic or stored data.

- [ ] FRONTEND: Staff collaboration tools:
  - [ ] FRONTEND: Internal notes system UI (add/edit staff notes on cases).
  - [ ] BACKEND: Endpoint to store and retrieve internal staff notes per case.
  - [ ] FRONTEND: Case assignment (drop-down or user search, assign staff).
  - [ ] BACKEND: Logic to update assigned staff, track changes.
  - [ ] FRONTEND: Team communication placeholders (chat or message board).
  - [ ] BACKEND: Basic endpoints or stubs for team messaging.

- [ ] FRONTEND: AI/Chat features:
  - [ ] FRONTEND: AI Triage widget UI in patient or staff flow.
  - [ ] BACKEND: Placeholder or final logic for AI triage (OpenAI or other).
  - [ ] FRONTEND: Live chat placeholder components.
  - [ ] BACKEND: Basic chat storage or pass-through endpoints.
  - [ ] FRONTEND: Smart suggestions UI (predict next steps, quick reply).
  - [ ] BACKEND: Generate suggestion data from a local or AI-based service.

- [ ] BACKEND: Advanced features (global):
  - [ ] BACKEND: Real-time updates (WebSockets or push notifications).
  - [ ] BACKEND: Webhook integrations (optional events for urgent cases).
  - [ ] BACKEND: Advanced metrics or performance tracking (logs, time to resolve).
  - [ ] BACKEND: Precompute or store staff performance stats (SLA compliance, etc.).

- [ ] FRONTEND: UX improvements:
  - [ ] FRONTEND: Smooth loading states (skeletons, spinners).
  - [ ] FRONTEND: Error boundaries and consistent inline error handling.
  - [ ] FRONTEND: Toast notifications for success/failure events.

- [ ] GENERAL: Advanced testing:
  - [ ] FRONTEND: E2E test suites for major workflows (patient, staff).
  - [ ] BACKEND: Performance and load testing against key APIs.
  - [ ] FRONTEND & BACKEND: Cross-browser or cross-platform testing.
