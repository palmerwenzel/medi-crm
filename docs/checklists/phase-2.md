# Phase 2: Database Schema & Case Management

This phase implements the core case/ticket functionality. Items are marked as either MVP (required for initial release) or Enhancement (can be deferred).

For all authentication and authorization implementations, refer to [@auth-rules.md] for detailed patterns and best practices.

---

## MVP Requirements

[x] BACKEND: Define the "Cases" table in Supabase with essential fields:  
   - id (primary key)  
   - patient_id (references Users table)  
   - title (string)
   - description (text)
   - status (e.g., "Open," "In Progress," "Resolved")  
   - created_at, updated_at timestamps

[x] BACKEND: Implement essential RLS policies (following @auth-rules.md):  
   - Patients can create cases and view their own
   - Staff can view all cases
   - Use JWT claims for role-based access

[x] BACKEND: Create basic Next.js API routes (/api/cases):  
   - Create new case
   - List cases (filtered by role)
   - Get single case
   - Update case status

[x] FRONTEND: Build minimal "New Case" page:  
   - Title and description fields
   - Basic form validation
   - Success/error feedback

[x] FRONTEND: Implement basic case listing:  
   - Simple table/card view of cases
   - Basic status indicators
   - Link to case details

[x] GENERAL: Test core case functionality:
   - Case creation flow
   - Role-based access (patients see only their cases)
   - Basic error handling

---

## Enhancements (Post-MVP)

[x] BACKEND: Add advanced case fields:  
   - priority ("Low," "Medium," "High," "Urgent")  
   - metadata (JSON for custom fields/tags)  
   - internal_notes (staff collaboration)
   - attachments

[x] BACKEND: Implement advanced RLS policies:  
   - Staff specialties and assignments
   - Department-based access
   - Admin override capabilities

[x] BACKEND: Create webhook endpoints:  
   - Notifications on case updates
   - Integration points for future features

[x] FRONTEND: Add advanced case features:  
   - File attachments
   - Rich text editor for descriptions
   - Advanced filtering/sorting
   - Bulk operations

[x] FRONTEND: Implement staff tools:  
   - Case assignment interface
   - Internal notes system
   - Priority management

[x] GENERAL: Add advanced validation:
   - File type/size checks
   - Rate limiting
   - Input sanitization