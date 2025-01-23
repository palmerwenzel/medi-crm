# Supabase Rules

MediCRM integrates with Supabase for database, authentication, and real-time features. This document lays out how to use Supabase properly with Next.js App Router.

---

## 1. Server vs. Client

• Use a “server” client (`utils/supabase/server.ts`) for server actions and SSR.  
• Use a “browser” client (`utils/supabase/client.ts`) for client components needing real-time or read-only data.  
• Never expose secrets or admin keys in the client.

---

## 2. Row-Level Security (RLS)

• Enable RLS on all production tables.  
• Create policies to ensure staff and patients only access their own data.  
• Test RLS in integration tests by attempting unauthorized writes/reads.

---

## 3. Roles & Permissions

• Maintain roles (Admin, Staff, Patient) in JWT tokens or a user profile table.  
• For complicated app logic, store role references in the DB and use Postgres policies.  
• Reference role-based gating in Next.js layouts or server actions.

---

## 4. Triggers & Functions

• Store advanced logic in Postgres functions (e.g., auditing changes).  
• Keep triggers well-named and limited to essential actions (like update timestamps).  
• Document each function/trigger with rationale and usage notes.

---

## 5. Realtime Features

• The browser client can subscribe to changes if real-time updates are needed.  
• Use channels and presence features for dynamic dashboards (e.g., a staff queue).  
• Always handle ephemeral data or concurrency carefully.

---

## 6. Environment Variables

• Provide SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc., in `.env` files (never commit them directly).  
• For local dev, use `.env.local`.  
• For production, configure environment variables in the hosting platform.

---

## 7. Summary

Keep a clear boundary between server and client Supabase usage. Enforce RLS for security, define triggers and functions for advanced logic, and adopt real-time features responsibly.