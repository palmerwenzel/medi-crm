./src/components/chat/chat-actions.tsx
32:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/components/chat/chat-panel.tsx
26:11  Error: 'user' is assigned a value but never used.  @typescript-eslint/no-unused-vars
106:39  Warning: The ref value 'typingTimeoutRef.current' will likely have changed by the time this effect cleanup function runs. If this ref points to a node rendered by React, copy 'typingTimeoutRef.current' to a variable inside the effect, and use that variable in the cleanup function.  react-hooks/exhaustive-deps

./src/components/dashboard/dashboard-nav.tsx
105:21  Error: 'signOut' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/cases/use-case-management.ts
30:10  Error: 'staffMembers' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/hooks/cases/use-case.ts
66:6  Warning: React Hook useEffect has missing dependencies: 'fetchCase' and 'supabase'. Either include them or remove the dependency array.  react-hooks/exhaustive-deps

./src/hooks/use-chat.ts
42:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
50:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
56:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/actions/ai.ts
15:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/actions/chat.ts
69:28  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/ai/openai.ts
57:71  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any

./src/lib/services/chat-service.ts
37:59  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
45:43  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
51:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
