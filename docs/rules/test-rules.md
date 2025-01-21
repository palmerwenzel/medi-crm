# Testing Rules & Guidelines

This document outlines our testing strategy and recommended frameworks for a test-driven development (TDD) approach, leveraging our Next.js 14 + TypeScript + React + Supabase + Tailwind + shadcn/UI stack.

---

## 1. Overall Strategy

1. Test Early and Often  
   - Write and update tests as you implement each feature.  
   - Strive for TDD: define specs before coding the implementation.

2. Layered Testing  
   - We use different frameworks and approaches for different test “layers”:  
     • Unit tests for pure logic and small utility functions.  
     • Component tests for UI components and React-specific rendering.  
     • Integration tests for multi-component or end-to-end flows in the app.  
     • E2E tests for real browser interactions, performance, and full user flows.

3. Keep Server Logic Secure  
   - Test server actions, route handlers, and Supabase integration on the server side.  
   - Use mocking/stubbing for external services when possible to keep tests independent and fast.

4. Accessibility & Performance  
   - Prioritize accessibility (screen readers, keyboard navigation) in all UI tests.  
   - Measure performance (Core Web Vitals) in integration/E2E tests.

---

## 2. Test Types & Recommended Frameworks

1. **Unit Tests**  
   • Framework: Jest
   • Use Cases: Pure functions, data transformers, small logic blocks.  
   • Example: Testing a function that formats a date or message content.  
   • Key Tools:   
     – @testing-library/jest-dom (for DOM assertions if needed)  
     – ts-jest for TypeScript compatibility  

2. **Component Tests**  
   • Framework: React Testing Library (with Jest)  
   • Use Cases: Testing React components in isolation (rendering, props, events).  
   • Key Tools:  
     – @testing-library/react for rendering components  
     – @testing-library/user-event for user interactions  
     – Mock dependencies like next/router or next/navigation if needed  

3. **E2E Tests**  
   • User-Driven! Have the user do the actions you want to test.

---

## 3. Testing Workflow

1. **TDD Cycle**  
   1. Write a failing test (based on feature requirements).  
   2. Implement minimal code to pass the test.  
   3. Refactor code for clarity or performance.  
   4. Re-run tests to ensure continued success and coverage.

2. **Dev Environment**  
   - Keep tests co-located with code or in `__tests__` folders, depending on preference.  
   - Run tests automatically in CI/CD pipeline.  
   - Integrate coverage reports (e.g., Istanbul/nyc) to measure coverage.

---

## 4. Special Supabase & Realtime Testing Notes

1. **Server Actions**  
   - Test these using either direct function calls in a Node test environment (Jest) or integration/E2E flows that trigger them.  
   - Avoid exposing secrets in test code—use environment variables via a safe .env.test approach.

2. **Realtime Features**  
   - Use mocking libraries or an actual test instance of Supabase to simulate broadcast/presence changes.  
   - For E2E-level checks, run a local server with a known seed so you can rely on reproducible states.

3. **Security**  
   - Test RLS (Row-Level Security) by attempting unauthorized reads/writes in integration tests.  
   - Confirm that tokens or API keys are never exposed in client-side logs or test console outputs.

---

## 5. Best Practices

1. Write short, focused tests.  
2. Use descriptive test names—clearly note the scenario and expected outcome.  
3. Mock third-party dependencies but test realistic scenarios.  
4. Keep snapshot tests minimal and purposeful.  
5. Document any complex test setups in code comments or a short README.