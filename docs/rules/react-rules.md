# React Rules

This file describes how to build React components for TonIQ using functional and declarative approaches.

---

## 1. Functional Components & Hooks

• Always use function components and React hooks (avoid class components).  
• Keep components small and composable.  
• For side effects, data fetching, or subscriptions, use useEffect or custom hooks.

---

## 2. State Management

• Store local state within components or custom hooks.  
• For global or cross-cutting state (user session, theme), consider React context.  
• Avoid heavy frameworks unless absolutely needed.

---

## 3. Performance

• Use memoization (React.memo, useMemo, useCallback) for expensive operations or frequent re-renders.  
• Keep side effects minimal in each component to avoid repeated triggers.

---

## 4. Testing Components

• Use React Testing Library (see test-rules.md).  
• Focus on behavior and user interactions.  
• Mock external dependencies or pass them in as props.

---

## 5. Common Pitfalls

• “Prop drilling” through multiple levels can become messy—use context or store data higher up.  
• Overly large components that do too many things—break them into separate modules.

---

## 6. Conclusion

Following these React rules ensures a modular, maintainable codebase, working in harmony with Next.js and TypeScript features.