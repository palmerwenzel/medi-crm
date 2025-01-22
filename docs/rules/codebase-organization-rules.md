# Codebase Organization Rules

This file describes how to structure MediCRM’s folder layout, file naming, and modular organization. By following these principles, we ensure a clean, scalable, and AI-friendly codebase.

---

## 1. Folder Structure & Naming

1. Directory Layout
   ```
   my-app/
   ├── app/
   │   ├── (auth)/
   │   │   └── login/
   │   │   └── signup/
   │   ├── (features)/
   │   │   └── ...
   ├── components/
   ├── lib/
   │   ├── supabase/
   │   └── utils/
   ├── types/
   ├── docs/
   └── ...
   ```
   • Group code by feature or domain (e.g., “(auth)” for authentication).  
   • Shared components in /components, common logic in /lib.

2. File Naming  
   • Use `page.tsx` for the entry point of a route.  
   • Use `actions.ts` for server actions.  
   • Keep file names under 30-40 chars and prefer lowerCamelCase or kebab-case.

---

## 2. File Size Limit

• Each file should remain ≤ 250 lines if possible.  
• Split large concerns into multiple modules (e.g., utility functions in separate .ts files).

---

## 3. Consistent Naming & Comments

• Start each file with a brief header describing its purpose (1–2 lines).  
• For each function, add TSDoc-style comments to document parameters and return types.

Example:
```ts
/**
 * Fetches a user by ID from the DB.
 * @param userId - The user’s UUID.
 */
export function getUserById(userId: string) {
  // ...
}
```

---

## 4. Organization Patterns

• Keep server actions in `actions.ts` near the route using them.  
• Avoid massive “utility” files; group related helpers by domain or purpose.  
• Confine route-specific components to that route’s folder for clarity.

---

## 5. Adherence to Tech Rules

• Check other *-rules.md files (e.g., nextjs-rules.md, supabase-rules.md) before implementing cross-cutting changes.  
• Ensure you do not override model or service logic in many scattered places—keep data flow consistent and maintainable.

---

## 6. Conclusion

Following these organization rules ensures a streamlined codebase. The final goal is clarity, modularity, and alignment with Next.js + Supabase best practices.