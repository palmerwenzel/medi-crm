# Phase 4: Staff & Patient Dashboards

This phase focuses on building more robust dashboards for patients and staff. Partial AI triage stubbing appears here but full AI integration is in a later phase.

---

## Phase 4: Flattened Checklist

[ ] FRONTEND: Implement “My Cases” overview for patients, including quick actions (view or update case).  
[ ] FRONTEND: Add filtering options (e.g., by status) and a mobile-friendly layout (ui-rules.md).  
[ ] FRONTEND: Create an AI Triage widget (embedded chat UI) to handle basic or placeholder triage queries.  
[ ] FRONTEND: Enhance staff dashboard with a “Case Details” page (status changes, internal notes, attachments).

[ ] BACKEND: Allow staff to store internal notes in Supabase separate from patient-facing chat.  
[ ] BACKEND: Create or extend an API endpoint for saving internal notes or attachments.  
[ ] BACKEND: Prototype an /api/ai/triage route that simply logs or stubs AI requests (full integration in Phase 5).  
[ ] GENERAL: Confirm real-time updates to dashboards (staff sees new cases, patient sees updated statuses).

[ ] FRONTEND: Animate transitions (opening/closing detail panels) using Tailwind transitions.  
[ ] GENERAL: Test these new dashboard flows from both staff and patient perspectives.  
[ ] GENERAL: Commit, push, and verify CI passes with no errors.
