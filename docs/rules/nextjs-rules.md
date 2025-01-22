# Next.js Rules

This document outlines how to use Next.js App Router features effectively in MediCRM.

---

## 1. File-Based Routing

• Organize routes in the `app/` directory with descriptive folder names.  
• Use route groups (e.g., `(auth)`) to house login/signup without changing URL structure.  
• Keep route-specific files together (page.tsx, actions.ts, loading.tsx, etc.).

---

## 2. Server & Client Components

• Use server components whenever possible to reduce bundle size.  
• Move interactive UI logic or stateful hooks to `use client` components.  
• Do not combine server-only code with client code in the same component.

---

## 3. Data Fetching

• Fetch data in server components or server actions for improved performance.  
• Rely on official Next.js caching + revalidation strategies (e.g., revalidatePath).  
• Keep heavy logic on the server side.

---

## 4. API Routes (If Needed)

• For microservices or custom endpoints, group them under `app/api/`.  
• Keep them small and purpose-driven, returning JSON or relevant data structures.  
• For server-based auth flows, prefer server actions over a separate API route unless necessary.

---

## 5. Authentication & Authorization

• See auth-rules.md for complete details on server actions, Supabase integration, and role-based gating.  
• Use Next.js middleware or layout-based checks for route guarding.

---

## 6. Deployment & Hosting

• Make sure your hosting platform (e.g., Vercel) supports Next.js 14 features.  
• Keep environment variables in a `.env` file, never exposing them to the browser.  
• Validate SSR configurations (.env) in local, staging, and production.

---

## 7. Summary

By leveraging server components, route groups, and server actions, MediCRM remains efficient and secure. Keep references to official Next.js docs (and our other internal rules) for consistent style and performance.