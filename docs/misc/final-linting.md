# Linting Error Resolutions

Below is a checklist with recommended solutions for each remaining linting issue.  
Please review and implement the suggested fixes to clean up the codebase before deployment.

---

## 1. ./src/app/api/cases/__tests__/cases.test.ts

- "NextResponse is defined but never used."
  - Remove the unused import/definition for NextResponse if it isn't actually used.  
  - Example:
    ```diff
    - import { NextResponse } from 'next/server'
    ```
- "PostgrestError is defined but never used."
  - Remove the unused type or import for PostgrestError if it isn’t used.
  - Example:
    ```diff
    - import type { PostgrestError } from '@supabase/supabase-js'
    ```

---

## 2. ./src/components/cases/new-case-form.tsx

- "'_' is assigned a value but never used."
  - If the variable is not needed, remove it (including any destructured assignment).
  - Example:
    ```diff
    - const [_, setValue] = useState('')
    + const [, setValue] = useState('')
    ```
  - Or rename it to clarify usage, or remove completely if it’s truly not needed.

---

## 3. ./src/components/cases/shared/filter-bar.tsx

- "'savedFilters' is assigned a value but never used."
  - Remove the variable if you don’t need it, or use it properly if it’s supposed to be referenced.
  - Example:
    ```diff
    - const [savedFilters, setSavedFilters] = useState([])
    + // Remove or implement usage of 'savedFilters'
    ```

---

## 4. ./src/components/cases/shared/hooks/use-case-management.ts

- "useEffect is defined but never used."
  - Remove the import for useEffect if it’s not actually needed, or implement it if you intended to use it.

- "'isDashboard' is defined but never used."
  - Remove the variable if not in use, or wire it into relevant logic if needed.

- "'hasMore'/'setHasMore' is assigned but never used."
  - Remove or utilize these state values if pagination or infinite scroll is intended.

- "'offset'/'setOffset' is assigned but never used."
  - Same as above—remove if unneeded or implement usage if you plan to support offset-based pagination.

- "React Hook useCallback has missing dependencies: 'applyFilters' and 'currentFilters'. Either include them or remove the dependency array."
  - Update the dependency array of useCallback to include all variables used inside the callback.  
  - Example:
    ```diff
    - const memoizedFunc = useCallback(() => { applyFilters(currentFilters) }, [])
    + const memoizedFunc = useCallback(() => { applyFilters(currentFilters) }, [applyFilters, currentFilters])
    ```

- "'loadStaffMembers' is assigned a value but never used."
  - Remove the variable or use it if you intended to load staff member data.

---

## 5. ./src/components/patients/patient-details.tsx

- "Unescaped apostrophe (react/no-unescaped-entities)."
  - Escape the apostrophe or replace with the proper entity code.
  - Example:
    ```diff
    - <p>This user's data can't be shown.</p>
    + <p>This user&apos;s data can&apos;t be shown.</p>
    ```

- "PatientDetailsSkeleton is defined but never used."
  - Remove the unused component definition/import if not needed.

---

## 6. ./src/lib/actions/case-history.ts

- "'revalidatePath' is defined but never used."
  - Remove the unused import/definition unless you plan to implement it.

- "'CaseHistoryResponse' is defined but never used."
  - Remove the unused type or use it if you intended to export it.

---

## 7. ./src/lib/actions/cases.ts

- "'createCaseSchema' is defined but never used."
  - Remove the unused schema or implement it properly for validations if that was the intention.

---

## 8. ./src/lib/actions/files.ts

- "'sanitizeFileName' is defined but never used."
  - Remove it if you don’t need it, or use it wherever you handle file uploads.

- "'data' is assigned a value but never used."
  - Remove the variable assignment or actually use the data.

---

## 9. ./src/lib/supabase/__tests__/auth-flow.test.ts

- "'testUsers' is never reassigned. Use 'const' instead."
  - Change let/var to const since the variable isn’t reassigned.
  - Example:
    ```diff
    - let testUsers = []
    + const testUsers = []
    ```

---

## 10. ./src/lib/supabase/__tests__/rls/users.test.ts

- "'userError' is assigned a value but never used."
  - Remove the variable or log/use it if you need the error info.

---

## 11. ./src/lib/validations/case.ts

- "'Database' is defined but never used."
  - Remove the unused import or definition unless intended for future logic.

---

## Final Steps

1. Carefully remove or apply each fix described above.
2. Confirm that the application compiles and that all tests still pass.
3. Re-run the linter to ensure the errors are resolved.
4. Commit your changes and push for final review before deployment.
