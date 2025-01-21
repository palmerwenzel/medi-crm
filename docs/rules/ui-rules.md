# UI Rules

These guidelines define how we build MediCRM’s user interface, incorporating desktop-first responsive design, engaging animations, and robust accessibility. They reference the flows described in [user-flow.md], the technologies in [tech-stack.md], and the best practices in [tech-stack-rules.md].

---

## 1. Responsive Design & Layout

1. Desktop-First, Mobile-Minded  
   - Develop primarily for desktop breakpoints.  
   - Use Tailwind CSS responsive classes (sm:, md:, lg:) to scale down effectively.  
   - Ensure essential workflows (like viewing/updating cases) are still accessible on smaller screens.

2. Clear Information Hierarchy  
   - Use layouts that make it easy for users to see urgent vs. routine content, especially in staff dashboards.  
   - Consider grid-based or split-panel layouts (e.g., case queue on one side, case details on the other).

3. Consistent Spacing & Alignment  
   - Maintain a consistent spacing scale for margins, paddings, and line heights.  
   - Align text, icons, and interactive elements in a predictable manner.

---

## 2. Navigation & Information Architecture

1. Multi-Level Navigation  
   - Keep global navigation streamlined: “Home,” “Cases,” “Patients” (for staff), “Admin” (for administrators).  
   - Sub-navigation or tabs can segment more specialized sections (e.g., “Analytics,” “Case History”).

2. Role-Based Views  
   - Show or hide navigation items depending on the user’s role (e.g., staff vs. admin).  
   - Ensure no confidential routes or components are visible to unauthorized roles, as enforced by RBAC.

3. User Flow Integration  
   - Follow the patient, staff, and administrator journeys from [user-flow.md].  
   - Provide clear progression indicators (e.g., case status banners, step trackers).

---

## 3. Component Construction with Shadcn UI & Tailwind

1. Use Shadcn Components as Building Blocks  
   - Start with Shadcn UI’s accessible, Radix-based elements.  
   - Extend or customize these components via Tailwind for MediCRM’s specific needs (e.g., case queue cards, triage badges).

2. Encapsulate Common Patterns  
   - Extract repeating UI blocks (e.g., case summary, patient info card) into reusable components.  
   - Keep components in logically grouped folders (“components/patient”, “components/staff”).

3. Accessibility by Design  
   - Comply with WAI-ARIA attributes (role, aria-label, etc.) on interactive elements.  
   - Provide keyboard navigation across modals, menus, and key interactions (closing a dialog, submitting a form).

---

## 4. Interactivity & Animations

1. Subtle Transitions  
   - Use Tailwind’s built-in transition utilities for hover/focus states and small UI changes (e.g., button hover, dropdown open).  
   - Favor smooth, quick animations that don’t block user actions.

2. Page/Route Transitions  
   - Leverage Next.js’s app router to ensure minimal flicker when navigating.  
   - If you implement page transitions, keep them short (<300ms) to maintain responsiveness.

3. Micro-Interactions  
   - Provide visual feedback (glow, highlight) when a user performs critical actions (case submission, form validation).  
   - Keep staff dashboards feeling dynamic—e.g., a subtle pulse effect when a new case arrives.

---

## 5. Ties to Backend & Data

1. Real-Time Updates (Supabase)  
   - Reflect changes from Supabase in near-real-time for staff dashboards or patient portals (e.g., case status updates).  
   - Use reactive models or onSnapshot subscriptions where supported.

2. Error Handling & Status Indicators  
   - Show clear error or success states when database or API calls fail/succeed (e.g., toast notifications).  
   - Gracefully handle partial content loads.

3. Data-Driven UI States  
   - Display loading spinners or skeleton placeholders while fetching data.  
   - Provide confidence-building messaging (e.g., “Saving case notes…”) to avoid user confusion during data writes.

---

## 6. Accessibility & Compliance

1. Color Contrast  
   - Ensure dark-mode backgrounds meet WCAG contrast guidelines.  
   - Use the accent color (e.g., purple) in a way that maintains readability against darker surfaces.

2. Keyboard Navigability  
   - All interactive elements (buttons, form fields, links) must be reachable via Tab/Shift+Tab.  
   - Provide focus outlines or highlights for clarity on which element is currently active.

3. Screen Reader Support  
   - Use descriptive aria-labels or aria-describedby for icons, form controls, or dynamic content.  
   - Test with a screen reader to confirm correct reading order and announcements.

---

## 7. Testing & Validation

## All UI testing should be conducted by the user in the browser.

---

## Conclusion

Following these UI rules ensures a consistent, accessible, and engaging user experience across MediCRM. By combining desktop-first layouts with careful responsiveness, leveraging Shadcn UI and Tailwind for styling, and applying well-thought-out animations, MediCRM’s interface will remain intuitive for both patients and providers.