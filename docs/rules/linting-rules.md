# Linting and Code Cleanup Guidelines

This document sets forth our internal rules and priorities for handling linting errors and code quality issues. It complements the existing guidelines in “type-system-rules.md” by clarifying how to systematically address and prevent lint errors and other code hygiene problems.

---

## 1. Introduction

Our goal is to maintain a stable, readable, and high-quality codebase. Linting errors often expose important issues, including potential bugs (unused variables indicating missing logic) or code smells (untidy structures that will grow problematic over time). By creating a clear hierarchy of priorities and definitive rules for resolving errors, we aim to keep our code robust, compliant with best practices, and aligned with the MediCRM architecture.

---

## 2. Hierarchy of Linting Priorities

Below are three main levels, from highest (must fix urgently) to lowest (still important, but less critical to ship a working product).

### Priority A (High Severity / Must-Fix Immediately)

1. React Hook Violations  
   • Hooks must be called unconditionally and in a consistent order. Violations can cause runtime crashes or unpredictable behavior.  
   • Example: “React Hook 'useEffect' is called conditionally…”  

2. TypeScript Errors That Break the Build  
   • Type definitions that block compilation (e.g., mismatched return types, unreachable code) must be fixed to ensure a successful build.  
   • Example: “Type 'undefined' is not assignable to type 'string'” in a critical function.

3. Potentially Dangerous Code Smells  
   • Anything that can cause major runtime exceptions or security holes—like referencing variables before they exist, or incorrectly typed data from external sources.  
   • Example: Using insecure or direct object references without validating user role.

### Priority B (Medium Severity / Important for Stability)

1. Missing Dependencies in Hooks  
   • Calls to useEffect/useCallback missing references to local variables can cause logic flow issues or infinite loops.  
   • Example: “React Hook has missing dependencies: 'applyFilters' and 'currentFilters'… must be included in the dependency array.”

2. Unused Variables or Imports  
   • Typically indicates incomplete or outdated logic. Unused code can become misleading and hamper maintainability.  
   • Example: `'varX' is assigned a value but never used.`

3. Best Practices / Code Style  
   • Adhering to consistent naming, indentation, and declarations for readability.  
   • Example: `'testUsers' is never reassigned, use 'const' instead of 'let' for clarity.`

4. Type System Gaps  
   • Blanket “any” usage or incomplete inference can hide future errors.  
   • See “type-system-rules.md” for how to properly define and maintain domain-driven types.

### Priority C (Low Severity / Cosmetic or Minor)

1. Entity Escaping & Minor Warnings  
   • e.g., `' can't be shown' -> user&apos;s data can&apos;t be shown.`  
   • Minor style adjustments that do not affect runtime stability.

2. Refactoring for Readability  
   • Example: Combining multiple “|| ''” fallback statements into a single util function if the code is too verbose or repeated.

3. Comment and Documentation Issues  
   • Missing TSDoc or function headers.  
   • While important for long-term maintainability, these typically don’t block immediate releases.

---

## 3. Source of Truth & Data Reliability

MediCRM code often references multiple layers: Database, API, UI, and validation schemas. Here’s how we reconcile them when lint or design decisions arise:

1. Database Schema (Supabase)  
   • The ultimate source of truth for stored fields.  
   • If code references a field not present in the DB, remove or adjust according to the schema.  
   • Keep the generated database types aligned with actual Supabase changes.

2. Validation Schemas (Zod)  
   • The next tier of truth for inputs & transformations.  
   • If the Zod schema differs from the DB schema, rectify them; the DB field set must match the validated fields.

3. API Contracts  
   • Describes how data is transmitted to/from the client.  
   • Must align with DB & validation logic. If lint indicates an unused or undefined property in an API response, check whether it should be removed or if the DB is missing an equivalent field.

4. UI Components  
   • Use strongly typed props that reflect the validated or API-defined types.  
   • If components define unreferenced props (lint flags them as unused), remove the props or implement them properly.

---

## 4. General Cleanup Checklist

1. Identify Lint Errors by Priority  
   • Start with the Priority A hooks and type errors that block builds or cause runtime risks.  
   • Then address Priority B (missing dependencies, unused vars, style).  
   • Finally, tackle Priority C (escapes, doc improvements).

2. Match Data Fields to DB & Schemas  
   • If a property is flagged unused, confirm if the DB requires it. If not, remove it.  
   • If the DB uses it but our code doesn’t, see if we missed a reference or removed a feature.

3. Maintain Consistency with Type Definitions  
   • Use “type-system-rules.md” to guide type creation and merging of DB, validation, and UI needs.  
   • If an interface is never used, remove it or mark the domain logic as deprecated.

4. Document Changes  
   • For major refactors (removing entire props, rewriting hooks), include TSDoc updates or comments.  
   • Keep commit messages descriptive (e.g. “Refactor: remove stale 'removed' variable in new-case-form.tsx”).

---

## 5. Sustaining Lint & Code Quality

1. Enable Strict TS & ESLint Checks in CI  
   • Ensure commits or PR merges fail if new lint errors appear.  
   • This keeps the codebase from regressing.

2. Regularly Update Dependencies  
   • Out-of-date lint plugins or TypeScript versions can introduce false positives.

3. Reference “@type-system-rules”  
   • Keep new code aligned with domain-driven type definitions.  
   • Validate each new data field with the DB schema and relevant Zod schema.

4. Perform Periodic Sweeps  
   • Schedule monthly or quarterly reviews of the codebase to remove leftover cruft, like old console.logs or partial code that might raise new lint entries.

---

## 6. Conclusion

By following this hierarchy of priorities and aligning all layers (DB schema, validation, API, UI) to the same type definitions, we drastically reduce the risk of lint errors and code smears. The codebase stays clean, robust, and easier for contributors to navigate.

If in doubt:  
• Fix code that can break the build or runtime first (Priority A).  
• Resolve intermediate issues (Priority B).  
• Finally, tackle minor items (Priority C).  

This structured approach ensures we meet MediCRM’s quality and reliability standards every step of the way.