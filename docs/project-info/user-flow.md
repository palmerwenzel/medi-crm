# MediCRM User Flow

This document defines the user journey through MediCRM, showing how distinct user types (Patients, Staff, and Administrators) navigate the system. The application relies on role-based access control (RBAC) to tailor functionality, with a shared “Users” table storing common fields and role assignments.

---

## 1. User Roles
1. **Patient** – Access to patient-centric features: creating/viewing cases, AI-based triage, personal health records, and feedback forms.  
2. **Staff** – Includes medical professionals (doctors, nurses) and support reps. They manage case queues, collaborate on resolutions, and provide real-time patient assistance.  
3. **Administrator** – System-wide management: configuring routing rules, auditing logs, managing user roles, and overseeing performance metrics.

---

## 2. Authentication & Onboarding
1. A new user (patient or staff) arrives at the MediCRM landing page.  
2. User selects “Create Account” or “Sign In.”  
3. On successful registration, the system creates a record in the “Users” table and assigns a role (e.g., “Patient,” “Staff,” or “Admin”).  
4. If needed, additional data specific to each role is stored in role-specific tables (e.g., “Patients,” “Staff”).

---

## 3. Patient Journey
### 3.1 Home (Patient Portal)
1. Patient logs in and sees a personalized dashboard with open cases, past interactions, and notifications.  
2. Patients can browse the knowledge base or self-service tools for common health questions before opening a new case.

### 3.2 AI-Powered Triage (Self-Service)
1. Patient engages an AI chatbot that attempts to address routine queries.  
2. If the AI cannot resolve the issue, the patient can escalate to a live staff interaction or open a new case.

### 3.3 Case Creation & Tracking
1. Patient fills out a case form (symptoms, urgency, specialty) and optionally attaches relevant documents.  
2. Once submitted, the case system updates the status to “Open” and notifies appropriate staff.  
3. The patient can track case progress in “My Cases,” upload files, or send follow-up messages.

### 3.4 Case Closure & Feedback
1. When resolved, staff closes the case. The patient receives a prompt for feedback or a short survey.  
2. Patient can view archived cases anytime, maintaining a full personal medical inquiry history.

---

## 4. Staff Journey
### 4.1 Staff Dashboard & Queues
1. Staff logs in to a dedicated dashboard showing assigned or unassigned cases in a queue.  
2. Staff can apply filters (urgency, specialty) to prioritize work. Automated routing distributes new cases if configured.

### 4.2 Case Handling & Collaboration
1. Staff opens a case to view patient details, past messages, uploaded documents, and internal notes from colleagues.  
2. Internal notes let staff collaborate privately without exposing sensitive communication to the patient.  
3. Staff provides updates or corrective actions, attaching additional documents or AI-powered suggestions where appropriate.

### 4.3 Resolution & Metrics
1. Staff sets the case status based on workflow stages (e.g., “Awaiting Lab Results,” “Doctor Follow-Up,” “Closed”).  
2. Once the issue is resolved, staff can finalize the case, sending a closure message to the patient.  
3. Staff monitors personal performance metrics (e.g., average resolution times) via a dedicated stats panel.

---

## 5. Administrator Journey
### 5.1 System-Level Dashboard
1. Admin logs in to an expanded dashboard with global statistics: total open cases, staff workloads, response times, etc.  
2. Admin can view high-level summaries, spot trends, and drill down into specifics if needed (e.g., staff performance).

### 5.2 Role & User Management
1. Admin reviews and manages user roles in the “Users” table.  
2. For staff, the admin can update specialty metadata (e.g., “Cardiology,” “Pediatrics”), which helps power automated routing.  
3. Admin can set up subgroup permissions if further distinction is needed between different types of staff (e.g., “Doctor,” “Nurse,” “Support”).

### 5.3 Configuration & Compliance
1. Admin configures routing rules: how new cases are assigned to staff teams, triggers for urgent escalations, etc.  
2. Admin oversees audit logs (role changes, case edits, sensitive data updates) and ensures compliance with healthcare regulations.  
3. Admin sets up and maintains integration with EHR systems, scheduling platforms, and other tools.

---

## 6. Integrations & Notification Channels
1. Optional integrations with third-party EHR systems for medical records and lab results.  
2. Automated notifications (email, SMS, or in-app) for both patients (e.g., “Lab results available”) and staff (e.g., “New urgent case assigned”).  
3. Admin configures advanced integrations (webhooks, Slack channels) for real-time updates and performance monitoring.

---

## 7. Conclusion
By adopting a unified `Users` table for core fields and separating specific data by role (Patient, Staff, Admin), MediCRM can provide distinct flows for each user type while preserving a central authority for authentication and shared user info. Role-based access ensures that staff- or admin-only sections remain segregated, keeping patient data secure and making workflows efficient.