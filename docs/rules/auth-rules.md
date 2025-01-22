# Auth Rules

This document provides guidelines for implementing authentication in a Next.js App Router project using Supabase. It strictly separates server logic (server actions + Supabase server client) from client logic (React components + Supabase browser client).

---

## 1. Folder Structure

• Use route groups for auth flows:  
  app/  
  └── (auth)/  
      ├── login/  
      │   ├── page.tsx  
      │   ├── actions.ts  
      │   └── login-form.tsx  
      └── signup/  
          ├── page.tsx  
          ├── actions.ts  
          └── signup-form.tsx  

• Place server-specific logic in “server.ts” (using Next.js headers/cookies).  
• Client components go in client-friendly files, using the “browser” Supabase client.

---

## 2. Supabase Server Client

• The “server.ts” module creates the Supabase client for server usage only.  
• Must handle environment variables, cookies, or tokens that are not exposed in the client.

Example (simplified):
// lib/supabase/server.ts
```ts
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  // ...
  return supabase
}
```

---

## 3. Supabase Browser Client

• The “client.ts” module configures Supabase for browser usage (persisting sessions in local storage).  
• Import this only in ‘use client’ components.

---

## 4. Server Actions & Auth Logic

• Use server actions with the directive `'use server'`.  
• Import and use createServerClient() to authenticate, sign up, or query data.  
• Revalidate paths or redirect as needed.

Example:
```ts
'use server'
import { revalidatePath, redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

// Some server action:
export async function loginUser(formData: FormData) {
  // ...
  redirect('/')
}
```

---

## 5. Client-Side Form Components

• Keep UI logic (state, validation, user interactions) client-side.  
• Pass server actions as props to client components where possible.  
• For real-time or purely client-based data fetches, use the browser client.

---

## 6. Role-Based Access

• Assign roles in JWT claims or a user profile table.  
• Enforce row-level security (RLS) in Postgres for data-level constraints.  
• Restrict Next.js routes with middleware or layout-based checks.

---

## 7. Summary

• Always separate server logic from client logic to preserve security.  
• Rely on server actions for any sensitive tasks (login, sign up, queries).  
• Keep a consistent folder structure for clarity and maintainability.