# Replacement Guide for Old Validation References

Below is a list of files (outside of “@/validations”) still referencing older validation types and enums. Each section includes where to look, any relevant code excerpts, and recommended approaches for swapping them out with your new Supabase-based types or Zod schemas.

---

## 1. docs/rules/type-system-rules.md

• This doc still references older patterns for enumerations and partial examples of code that might mismatch the new single-source-of-truth approach.  

Excerpt (non-code snippet paraphrase):  
“Must match database column names (snake_case). […] If the property name differs from the DB, mark it as invalid.”

Recommended Fix:  
1. Adjust the examples to show the new usage of your Supabase-enum-based Zod schemas.  
2. Remove or revise any sample enumerations (“lastName” vs. “last_name”) that no longer match how your new “@/validations” files are structured.  
3. Ensure the final instructions point readers to “@supabase.ts” for exact type references.

---

## 2. src/lib/database.types.ts

• Contains older row/insert/update definitions for “cases” and “case_history.” These now exist in “src/types/supabase.ts” as part of Database["public"]["Tables"]["cases"] and Database["public"]["Tables"]["case_history"].  

Excerpt (non-code snippet paraphrase):  
“Update: […] status?: 'open' | 'in_progress' | 'resolved' […] priority?: 'low' | 'medium' | 'high' | 'urgent' …”

Recommended Fix:  
1. Remove or comment out these “Update,” “Row,” and “Insert” interfaces for “cases” and “case_history,” since they’re duplicated in “@supabase.ts.”  
2. If domain-specific fields like “CaseMetadata” or “CaseHistoryDetails” are needed, keep those but relocate them to an appropriate place (e.g., in a domain-based type file).  
3. Verify that references throughout the app now import from the new “@supabase.ts” or from the domain-level validations.

---

## 3. Possible Project-Level References

Search your codebase for any direct imports from older “validation” modules you removed. For instance, code that does something like:

import { caseStatusEnum } from '@/lib/validations/case'

…should now import an updated Zod schema or reference the new Database enums. Make sure you do the following wherever you find these occurrences:

1. Change the import path to the new “@/validations” file if you still need a Zod schema.  
2. If you only need the strings or an enum type from the DB, import from “@supabase.ts” (using Database["public"]["Enums"]["case_status"] or a typed transformation).

---

## 4. Miscellaneous Notes

• If you had references to renamed fields (like “lastName”), confirm the updated schemas enforce proper snake_case matching the DB.  
• If you see domain-specific logic that extends or transforms DB types (e.g., combining user and patient info into one object), keep it in a domain or route-based type file. Avoid duplicating any raw column definitions.  
• Finally, check test files or storybook stories that might rely on the old validations—they may need to import the new schemas or stub them differently.

---

## Summary

By removing duplicate validation files and unifying your references to “@/validations” and “@supabase.ts,” you ensure consistency and reduce maintenance overhead. The main replacements involve:

• Converting old enum references (caseStatusEnum, etc.) to the newly generated database enums.  
• Replacing or removing old Row/Insert/Update schemas in “database.types.ts.”  
• Ensuring all mention of older validation files or code references are updated to the new single source of truth.
