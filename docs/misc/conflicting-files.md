# Duplicate & Conflicting Components Report

This document identifies and explains areas in the codebase where component duplication or potential naming conflicts have arisen. The focus is on case-related functionality (the “Cases” domain) and dashboards (patient and staff). For each identified conflict, we note which file should be considered the source of truth, and provide suggestions for how to unify or remove the duplicate.

---

## 1. Case Management Components

### A. “CaseManagementView”
• Location: src/components/cases/shared/case-management-view.tsx  
• Used In:  
  – src/components/dashboard/views/patient-dashboard.tsx (for recent cases)  
• Potential Duplication: Staff dashboards currently do not leverage CaseManagementView, despite using similar listing and filtering needs. Instead, staff dashboards replicate some features (e.g. listing cases, Quick Actions) without the filtering/pagination logic from CaseManagementView.

#### Overview of Conflict
Staff case queues and patient case overviews share a lot of filtering, pagination, and status-update requirements. The Staff Dashboard includes a “Recent Activity” section that partially overlaps with what patient-dashboard does when it calls CaseManagementView. By keeping staff logic separate, we risk diverging features or having to maintain two code paths for listing/filtering.

#### Recommendation / Source of Truth
• Treat “case-management-view.tsx” as the canonical (source-of-truth) component for listing, filtering, and rendering dynamic sets of cases.  
• Where staff dashboards need different controls (e.g., bulk updates, staff assignment), pass a prop like showActions or showStaffTools to the same “CaseManagementView.”  
• The file in “shared/” correctly centralizes the logic for infinite scrolling, selection, filters, etc. Any new dashboard (staff or patient) should import and reconfigure this same shared component.

---

### B. “CaseMetadata”
• Location: src/components/cases/case-metadata.tsx  
• Used In: Various places (e.g., listing details, full case detail pages)  
• Potential Duplication: Some smaller “info” blocks or inline references to patient name and timestamps appear in “CaseListItem” or the Dashboard screens, duplicating metadata display logic.

#### Overview of Conflict
For partial displays of patient name, creation date, or attachments, the code is sometimes inline (e.g., in a staff-only card) rather than calling CaseMetadata. This could lead to inconsistent formatting (e.g., different date or name display in staff vs. patient views).

#### Recommendation / Source of Truth
• “CaseMetadata” should be the single source of truth for displaying key fields like patient name, date, attachments, and optional expansions (internal notes, custom properties, etc.).  
• Any minor variations (e.g., staff-specific tooltip) should be optional props to CaseMetadata.  
• Remove or refactor inline references in staff/patient dashboards to use the shared “CaseMetadata” component where possible.

---

## 2. Dashboard Components

### A. Patient vs. Staff Dashboards
• Location:  
  – src/components/dashboard/views/patient-dashboard.tsx  
  – src/components/dashboard/views/staff-dashboard.tsx  
• Potential Duplication: Each dashboard has duplicated logic for “Recent Cases,” quick navigation, and in some cases a list or summary of open items. The patient dashboard uses CaseManagementView for the listing portion. Meanwhile, staff-dashboard does not; it has its own “Recent Activity” block that could be replaced with (or extended by) the shared component logic.

#### Overview of Conflict
The staff dashboard’s “Recent Activity” is effectively a subset of case-listing. If staff require advanced sorts and filters, or if we want to unify the approach to how these items are displayed, we should reuse the same underlying logic as the patient view. Otherwise, we risk diverging feature sets or repeated debugging efforts.

#### Recommendation / Source of Truth
• “patient-dashboard.tsx” is currently demonstrating the correct path by embedding the “CaseManagementView.”  
• Instead of replicating “Recent Activity” logic, “staff-dashboard.tsx” could import and render “CaseManagementView” or a staff-specific wrapper around it.  
• The staff dashboard can pass staff-centric configurations (bulk operations, default filters, navigation to staff’s “All Cases,” etc.) to the same “CaseManagementView” if appropriate.

---

## 3. Nav & Quick-Action Components

### A. Navigation Overlaps
• Location:  
  – src/components/dashboard/dashboard-nav.tsx (contains navigation for all roles)  
  – Staff/patient dashboards have their own quick actions or calls to router.push to different pages.  
• Potential Duplication: Some “quick link” references to /cases/new, /patients, /schedule, etc. appear in both the nav component and inside the staff-dashboard or patient-dashboard. This can create confusion if the same path is updated in one place but forgotten in the other.

#### Overview of Conflict
Having role-based nav items in “dashboard-nav.tsx” is good, but the same links or buttons are also repeated in “staff-dashboard.tsx” (e.g., a “Create New Case” button). This might be intended, but it could also cause inconsistent labeling or path references across the app.

#### Recommendation / Source of Truth
• Keep the universal approach to role-based navigation in “dashboard-nav.tsx.” This is the top-level source of truth for system-wide navigation.  
• If the staff dashboard truly needs big “shortcut” buttons for usability, ensure any path or naming changes are updated in both places. Alternatively, unify them into a shared “QuickActionsBar” that is loaded only for staff roles.

---

## 4. General Guidelines for Resolving Duplicates

1. **Identify One Shared File Per Functional Area**  
   For example, “CaseManagementView” should be the single place for listing/filtering cases. Resist the urge to create another similar file unless the functionality truly differs.

2. **Use Props for Variation**  
   Where staff versus patient usage needs small tweaks, add a prop (e.g. `role="staff"` or `showActions={true}`) instead of duplicating the entire component in a new file.

3. **Refactor or Deprecate Duplicate Components**  
   If you discover older files that do nearly the same thing, decide which is best and systematically remove/rework the unneeded copies. Update references in the codebase to the chosen “source of truth” file.

4. **Keep Routing & Quick Links in One Place**  
   Whenever possible, define all URLs or route definitions in a single nav or config (like “dashboard-nav.tsx” or a “routes” object) so changes are made consistently.

5. **Leverage “shared/” Folders**  
   Our “cases/shared/” pattern is good: it signals that one file is used by multiple roles. Extend that approach wherever you see duplication that can be avoided.

---

## Conclusion

By centralizing the listing, filtering, and metadata logic in “shared” components (particularly “CaseManagementView” and “CaseMetadata”), and ensuring that dashboards (patient vs. staff) use a common code path, we avoid diverging code paths that create duplication and maintenance overhead. Where specialized features are needed (bulk staff tools, staff-only quick actions), we should layer them in as additional props or nested components without duplicating the entire listing framework.

These changes will reduce confusion, keep file sizes manageable, and simplify future updates to the core “Cases” domain logic.
