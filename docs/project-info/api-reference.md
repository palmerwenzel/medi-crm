# API Reference

This document provides a comprehensive reference for all API endpoints in MediCRM. Each endpoint includes its purpose, required permissions, request/response formats, and example usage.

## Authentication Endpoints

### Sign Up
- **Purpose**: Create a new user account
- **Endpoint**: `POST /auth/v1/signup` (Supabase Auth)
- **Access**: Public
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response**:
  ```typescript
  {
    user: User | null;
    session: Session | null;
    error: ApiError | null;
  }
  ```
- **Notes**: 
  - Creates user in auth.users
  - Automatically creates profile in public.users with 'patient' role
  - Sends confirmation email

### Log in
- **Purpose**: Authenticate existing user
- **Endpoint**: `POST /auth/v1/token?grant_type=password` (Supabase Auth)
- **Access**: Public
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response**:
  ```typescript
  {
    user: User | null;
    session: Session | null;
    error: ApiError | null;
  }
  ```
- **Notes**: 
  - Returns JWT token for authenticated requests
  - Includes user role in session

### Sign Out
- **Purpose**: End user session
- **Endpoint**: `POST /auth/v1/logout` (Supabase Auth)
- **Access**: Authenticated
- **Request**: No body required
- **Response**: `{ error: ApiError | null }`
- **Notes**: Invalidates current session

## User Profile Endpoints

### Get Profile
- **Purpose**: Retrieve user profile
- **Table**: `public.users`
- **Access**: 
  - Users can view their own profile
  - Staff can view all profiles
  - Admins can view all profiles
- **Response**:
  ```typescript
  {
    id: string;
    email: string;
    role: 'patient' | 'staff' | 'admin';
    created_at: string;
    updated_at: string;
  }
  ```
- **RLS Policies**: 
  - Self-view policy
  - Staff view-all policy
  - Admin full-access policy

### Update Profile
- **Purpose**: Modify user profile
- **Table**: `public.users`
- **Access**:
  - Users can update their own profile (except role)
  - Admins can update any profile
- **Request Body**:
  ```typescript
  {
    email?: string;
    // other profile fields as needed
  }
  ```
- **RLS Policies**:
  - Self-edit policy (excludes role)
  - Admin full-access policy

## Role Verification

### Get User Role
- **Purpose**: Verify user's role
- **Function**: `get_user_role(user_id UUID)`
- **Access**: Internal/Protected
- **Response**: `'patient' | 'staff' | 'admin'`
- **Notes**: Used by RLS policies to safely check roles

## Cases API

### List Cases
```http
GET /api/cases
```

Returns a list of cases based on user role:
- Patients see only their own cases
- Staff and admins see all cases

#### Response
```typescript
{
  id: string
  patient_id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}[]
```

### Create Case
```http
POST /api/cases
```

Creates a new case. Only patients can create cases.

#### Request Body
```typescript
{
  title: string      // Required, max 100 chars
  description: string // Required, max 1000 chars
}
```

#### Response
```typescript
{
  id: string
  patient_id: string
  title: string
  description: string
  status: 'open'     // Always starts as 'open'
  created_at: string
  updated_at: string
}
```

### Get Single Case
```http
GET /api/cases/:id
```

Returns a single case by ID. Access controlled by RLS policies.

#### Response
```typescript
{
  id: string
  patient_id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}
```

### Update Case Status
```http
PATCH /api/cases/:id
```

Updates a case's status. Only staff and admins can update cases.

#### Request Body
```typescript
{
  status: 'open' | 'in_progress' | 'resolved'
}
```

#### Response
```typescript
{
  id: string
  patient_id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}
```

## Real-time Subscriptions

### Cases Channel
Subscribe to real-time case updates using the Supabase client:

```typescript
import { subscribeToCases } from '@/lib/supabase/realtime'

// In your React component
const cleanup = subscribeToCases(
  (updatedCase) => {
    // Handle case update
  },
  (newCase) => {
    // Handle new case
  }
)

// Cleanup on unmount
return () => cleanup()
```

Or use the React hook:

```typescript
import { useCasesSubscription } from '@/lib/hooks/use-cases-subscription'

// In your React component
useCasesSubscription({
  onUpdate: (updatedCase) => {
    // Handle case update
  },
  onNew: (newCase) => {
    // Handle new case
  }
})
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Only patients can create cases"
}
```
or
```json
{
  "error": "Only staff and admins can update cases"
}
```

### 404 Not Found
```json
{
  "error": "Case not found"
}
```

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch/create/update case"
}
```

---

## Using the API

### Authentication Flow
1. User signs up → Creates account + profile
2. User signs in → Gets session token
3. Include session token in subsequent requests
4. Protected routes/data governed by RLS policies

### Error Handling
- All endpoints return standardized error format
- Common error codes:
  - 401: Unauthorized
  - 403: Forbidden (insufficient role)
  - 404: Resource not found
  - 409: Conflict (e.g., email exists)
  - 422: Validation error
  - 500: Server error

### Best Practices
1. Always handle errors gracefully
2. Use type definitions from `@/types/supabase`
3. Leverage RLS policies instead of manual checks
4. Keep sessions fresh using refresh tokens 