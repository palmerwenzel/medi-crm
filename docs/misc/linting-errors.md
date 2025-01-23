./components/cases/shared/bulk-action-bar.tsx
9:10  Error: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars

./src/app/(auth)/login/login-form.tsx
22:10  Error: 'useAuth' is defined but never used.  @typescript-eslint/no-unused-vars
43:9  Error: 'router' is assigned a value but never used.  @typescript-eslint/no-unused-vars
184:58  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/app/(auth)/signup/signup-form.tsx
58:9  Error: 'router' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/(protected)/cases/new/page.tsx
18:35  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/app/(protected)/dashboard/page.tsx
12:9  Error: 'headersList' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/(protected)/layout.tsx
15:9  Error: 'headersList' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/api/cases/[id]/route.ts
2:28  Error: 'updateCaseInternalNotesSchema' is defined but never used.  @typescript-eslint/no-unused-vars
2:59  Error: 'updateCaseMetadataSchema' is defined but never used.  @typescript-eslint/no-unused-vars
46:23  Error: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/app/api/cases/__tests__/cases.test.ts
1:10  Error: 'NextResponse' is defined but never used.  @typescript-eslint/no-unused-vars
13:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
56:21  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/app/api/cases/route.ts
25:48  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
26:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/cases/case-grid-view.tsx
68:11  Error: 'userRole' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/new-case-form.tsx
35:16  Error: React Hook "useForm" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
77:27  Error: 'removed' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/bulk-operations/index.tsx
127:88  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
127:105  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./src/components/cases/shared/case-list-item/index.tsx
3:10  Error: 'useState' is defined but never used.  @typescript-eslint/no-unused-vars
5:10  Error: 'Card' is defined but never used.  @typescript-eslint/no-unused-vars
8:10  Error: 'CaseStatusBadge' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Error: 'CasePriorityBadge' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Error: 'CaseMetadata' is defined but never used.  @typescript-eslint/no-unused-vars
32:3  Error: 'isStaffOrAdmin' is assigned a value but never used.  @typescript-eslint/no-unused-vars
36:9  Error: 'handleKeyDown' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/case-list.tsx
3:10  Error: 'useState' is defined but never used.  @typescript-eslint/no-unused-vars
31:3  Error: 'className' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/case-management-view.tsx
11:10  Error: 'StaffToolbar' is defined but never used.  @typescript-eslint/no-unused-vars
13:10  Error: 'ScrollArea' is defined but never used.  @typescript-eslint/no-unused-vars
15:8  Error: 'Link' is defined but never used.  @typescript-eslint/no-unused-vars
19:18  Error: 'AnimatePresence' is defined but never used.  @typescript-eslint/no-unused-vars
25:15  Error: 'CaseResponse' is defined but never used.  @typescript-eslint/no-unused-vars
36:10  Error: 'CaseItemSkeleton' is defined but never used.  @typescript-eslint/no-unused-vars
80:5  Error: 'cases' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/file-viewer.tsx
31:10  Error: 'formatFileSize' is defined but never used.  @typescript-eslint/no-unused-vars
67:21  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
100:11  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

./src/components/cases/shared/filter-bar.tsx
8:10  Error: 'useState' is defined but never used.  @typescript-eslint/no-unused-vars
8:20  Error: 'useCallback' is defined but never used.  @typescript-eslint/no-unused-vars
8:33  Error: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
9:10  Error: 'Search' is defined but never used.  @typescript-eslint/no-unused-vars
9:18  Error: 'Calendar' is defined but never used.  @typescript-eslint/no-unused-vars
9:45  Error: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
9:52  Error: 'Loader2' is defined but never used.  @typescript-eslint/no-unused-vars
10:10  Error: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
13:3  Error: 'Select' is defined but never used.  @typescript-eslint/no-unused-vars
14:3  Error: 'SelectContent' is defined but never used.  @typescript-eslint/no-unused-vars
15:3  Error: 'SelectItem' is defined but never used.  @typescript-eslint/no-unused-vars
16:3  Error: 'SelectTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
17:3  Error: 'SelectValue' is defined but never used.  @typescript-eslint/no-unused-vars
20:3  Error: 'Popover' is defined but never used.  @typescript-eslint/no-unused-vars
21:3  Error: 'PopoverContent' is defined but never used.  @typescript-eslint/no-unused-vars
22:3  Error: 'PopoverTrigger' is defined but never used.  @typescript-eslint/no-unused-vars
24:22  Error: 'CalendarComponent' is defined but never used.  @typescript-eslint/no-unused-vars
25:10  Error: 'Badge' is defined but never used.  @typescript-eslint/no-unused-vars
27:3  Error: 'Command' is defined but never used.  @typescript-eslint/no-unused-vars
28:3  Error: 'CommandEmpty' is defined but never used.  @typescript-eslint/no-unused-vars
29:3  Error: 'CommandGroup' is defined but never used.  @typescript-eslint/no-unused-vars
30:3  Error: 'CommandInput' is defined but never used.  @typescript-eslint/no-unused-vars
31:3  Error: 'CommandItem' is defined but never used.  @typescript-eslint/no-unused-vars
33:10  Error: 'ScrollArea' is defined but never used.  @typescript-eslint/no-unused-vars
34:10  Error: 'format' is defined but never used.  @typescript-eslint/no-unused-vars
36:3  Error: 'CaseStatus' is defined but never used.  @typescript-eslint/no-unused-vars
37:3  Error: 'CasePriority' is defined but never used.  @typescript-eslint/no-unused-vars
38:3  Error: 'CaseCategory' is defined but never used.  @typescript-eslint/no-unused-vars
39:3  Error: 'Department' is defined but never used.  @typescript-eslint/no-unused-vars
40:3  Error: 'StaffSpecialty' is defined but never used.  @typescript-eslint/no-unused-vars
41:3  Error: 'CaseQueryParams' is defined but never used.  @typescript-eslint/no-unused-vars
50:15  Error: 'CaseFilters' is defined but never used.  @typescript-eslint/no-unused-vars
65:14  Error: 'savedFilters' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/filters/multi-select-filter.tsx
17:3  Error: 'placeholder' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/hooks/use-case-history.ts
14:3  Error: 'CaseActivityType' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/shared/hooks/use-case-management.ts
4:33  Error: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
42:49  Error: 'isDashboard' is defined but never used.  @typescript-eslint/no-unused-vars
49:10  Error: 'hasMore' is assigned a value but never used.  @typescript-eslint/no-unused-vars
49:19  Error: 'setHasMore' is assigned a value but never used.  @typescript-eslint/no-unused-vars
50:10  Error: 'offset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
50:18  Error: 'setOffset' is assigned a value but never used.  @typescript-eslint/no-unused-vars
93:6  Warning: React Hook useCallback has missing dependencies: 'applyFilters' and 'currentFilters'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps
195:9  Error: 'loadStaffMembers' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/staff/case-assignment-dialog.tsx
68:9  Error: 'supabase' is assigned a value but never used.  @typescript-eslint/no-unused-vars
76:16  Error: React Hook "useForm" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks

./src/components/cases/staff/internal-notes-editor.tsx
22:3  Error: 'CardFooter' is defined but never used.  @typescript-eslint/no-unused-vars
77:16  Error: React Hook "useForm" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
85:3  Error: React Hook "React.useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
104:3  Error: React Hook "React.useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks

./src/components/cases/staff/performance-metrics.tsx
21:10  Error: 'Progress' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/staff/priority-manager.tsx
11:10  Error: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/cases/staff/staff-toolbar.tsx
36:10  Error: 'isLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
47:3  Error: React Hook "React.useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
75:6  Warning: React Hook React.useEffect has missing dependencies: 'supabase' and 'toast'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/components/dashboard/views/staff-dashboard.tsx
52:6  Warning: React Hook useEffect has a missing dependency: 'loadStats'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
68:15  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/patients/patient-details.tsx
38:21  Error: 'setIsLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
111:39  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities

./src/components/ui/date-range-picker.tsx
9:10  Error: 'addDays' is defined but never used.  @typescript-eslint/no-unused-vars

./src/components/ui/toaster.tsx
19:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/hooks/cases/use-case-management.ts
28:3  Error: 'isDashboard' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/case-history.ts
7:10  Error: 'revalidatePath' is defined but never used.  @typescript-eslint/no-unused-vars
11:3  Error: 'CaseHistoryResponse' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/cases.ts
11:3  Error: 'createCaseSchema' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/actions/files.ts
9:10  Error: 'sanitizeFileName' is defined but never used.  @typescript-eslint/no-unused-vars
44:13  Error: 'data' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/supabase/__tests__/auth-flow.test.ts
7:7  Error: 'testUsers' is never reassigned. Use 'const' instead.  prefer-const

./src/lib/supabase/__tests__/rls/users.test.ts
205:38  Error: 'userError' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/lib/utils/__tests__/file-validation.test.ts
2:39  Error: 'AllowedMimeType' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/utils/__tests__/webhook.test.ts
9:3  Error: 'getCurrentTimestamp' is defined but never used.  @typescript-eslint/no-unused-vars

./src/lib/utils/sanitize.ts
62:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/validations/case.ts
7:15  Error: 'Database' is defined but never used.  @typescript-eslint/no-unused-vars

./src/providers/auth-provider.tsx
35:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
56:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
75:39  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
75:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
115:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
135:18  Error: 'prev' is defined but never used.  @typescript-eslint/no-unused-vars
146:18  Error: 'prev' is defined but never used.  @typescript-eslint/no-unused-vars
173:16  Error: 'prev' is defined but never used.  @typescript-eslint/no-unused-vars
200:20  Error: 'prev' is defined but never used.  @typescript-eslint/no-unused-vars
208:18  Error: 'prev' is defined but never used.  @typescript-eslint/no-unused-vars
229:20  Error: 'prev' is defined but never used.  @typescript-eslint/no-unused-vars

./src/utils/supabase/api.ts
3:10  Error: 'cookies' is defined but never used.  @typescript-eslint/no-unused-vars

./src/utils/supabase/middleware.ts
5:7  Error: 'publicRoutes' is assigned a value but never used.  @typescript-eslint/no-unused-vars
7:10  Error: 'logRedirect' is defined but never used.  @typescript-eslint/no-unused-vars

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules