# Project Documentation Index

Welcome to the MediCRM Next.js project! This index document is designed to help anyone—from new contributors to AI assistants—navigate our codebase and documentation efficiently. Below is a high-level overview of the project and how all documents fit together.

---

## 1. Project Overview

We’re building a modern healthcare CRM application using:
- Next.js (App Router, TypeScript)
- React (with Server & Client Components)
- Tailwind CSS / Shadcn UI / Radix UI
- Supabase (Auth, Database, Realtime)

Our project is organized into multiple phases (setup, authentication, case management, dashboards, advanced features). Each phase has its own dedicated checklist to guide development.

---

## 2. Phase-Based Checklists

These files outline the sequential tasks needed to build MediCRM from the ground up:

1. @phase-0.md (Project Initialization & Environment Setup)  
   - Covers environment setup, Next.js configuration, Tailwind + Shadcn UI init, Supabase onboarding, and basic theming tokens.

2. @phase-1.md (Authentication & RBAC)  
   - Enables Supabase Auth, user roles (Patient, Staff, Admin), and checks for basic role-based permissions.

3. @phase-2.md (Database Schema & Case Management)  
   - Introduces core case or ticket functionality.  
   - Covers CRUD operations, patient self-service, staff queue management, etc.

4. @phase-3.md (Staff & Patient Dashboards)  
   - Builds advanced UI dashboards for different roles.  
   - May include partial or placeholder AI triage integration.

5. @phase-4.md (Administrator Tools & AI Integration)  
   - Adds system management features for Admins (routing rules, user management) and deeper AI-based triage or assistance.  
   - Ensures final polish, testing, and documentation.

---

## 3. Workflow Checklists & Templates

We use specialized workflows to manage each domain (UI, backend, tests, and git). These files help break tasks down and track progress:

1. @ui-workflow.md  
   - Step-by-step UI development process.  
   - References UI rules, ensures proper design, accessibility, and compliance.

2. @backend-workflow.md
   - Focuses on backend tasks, including route handlers, Supabase integration, and validations.  
   - Ensures real-time features and tests are implemented consistently.

3. [docs/workflow-templates/](./workflow-templates) (Backend/UI templates)  
   - Blank versions of the checklists that can be copied and customized for each new feature or development phase.

---

## 4. Rules & Guidelines

We have a variety of “rules” documents spanning code organization, theming, UI principles, and testing. They ensure consistency as the project grows:

1. @agent-rules.md
   - Defines the AI assistant’s operational rules, including how to classify tasks (new feature, bugfix, etc.) and update the master workflow.

2. @codebase-best-practices.md
   - Explains organization conventions, TDD structure, Next.js App Router usage.  
   - Provides an example directory layout and line limit guidelines.

3. @tech-stack-rules.md
   - Describes best practices for Next.js, Supabase, caching, state management, and more.

4. @test-rules.md
   - Outlines the testing strategy: unit, integration, E2E.  
   - Emphasizes TDD workflow, coverage, and mocking.

5. @theme-rules.md
   - Covers color system, dark mode, glassmorphic design elements, and CSS variables.  
   - Emphasizes performance-based theming.

6. @ui-rules.md
   - Details visual design, layout, accessibility, and responsive breakpoints using Tailwind, Shadcn UI, and Radix UI.

---

## 5. Project Info

These documents provide deeper context about our tech choices, planned user flows, and example tests:

1. @tech-stack.md
   - Breakdown of each major technology used, official references, and recommended best practices.

2. @test-examples.md
   - Contains sample tests (unit, component, E2E) for guidance.  
   - Shows integration with React Testing Library, Vitest/Jest, and Playwright.

3. @user-flow.md
   - Guides typical user journeys: logging in, creating/updating cases, dashboards for Patients/Staff/Admin, and AI triage flows.

---

## 6. How to Use This Index

• If you’re new to the project, begin with the “Phase Checklists” to see your next tasks.  
• Check “Rules & Guidelines” whenever you need clarity on coding style or workflow.  
• Reference “Project Info” for deeper context on the tech stack, user flows, and example tests.  
• Use “Workflow Checklists” for implementing features systematically (UI or Backend).

---

## 7. Contributing Flow in a Nutshell

1. Identify your task → Check the relevant “Phase” or “Workflow” checklist.  
2. Review any associated “Rules” or “Project Info” docs.  
3. Implement code → Ensure TDD and best practices.  
4. Update checklists to mark progress.  
5. Follow the Git Workflow for commits and pull requests.  
6. Celebrate your contribution!

---

## 8. Additional Notes

• We leverage Supabase for real-time data, authentication, file storage, and more advanced features.  
• The UI must remain accessible: see @ui-rules.md and @theme-rules.md for design consistency.  
• Keep an eye on @test-rules.md for coverage and testing rigor.  
• Always update the relevant workflow file (@ui-workflow.md, @backend-workflow.md, etc.) to reflect your progress.

Feel free to explore these documents in any order that works best for you. Enjoy building MediCRM, and thank you for helping us maintain a clean, organized, and efficient healthcare-focused application!
