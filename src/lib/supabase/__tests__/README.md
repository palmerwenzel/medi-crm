# Supabase Integration Tests

This directory contains integration tests for Supabase functionality, focusing on Row Level Security (RLS) policies and user authentication.

## Prerequisites

1. Local Supabase instance running (`npx supabase start`)
2. `.env.test` file with proper configuration
3. Migrations applied (`npx supabase db reset`)

## Test Structure

- `setup.ts`: Test environment configuration
- `rls-policies.test.ts`: Tests for Row Level Security policies
  - User self-view/edit
  - Staff view-all
  - Admin full-access

## Running Tests

```bash
# Run all Supabase tests
npm test src/lib/supabase/__tests__

# Run specific test file
npm test src/lib/supabase/__tests__/rls-policies.test.ts
```

## Test Data

Tests create temporary users with different roles:
- Patient user (default role)
- Staff user
- Admin user

All test data is cleaned up after tests complete.

## Common Issues

1. If tests fail with connection errors:
   - Ensure local Supabase is running
   - Check if migrations are applied
   - Verify `.env.test` configuration

2. If cleanup fails:
   - Manually clean up test users
   - Reset database with `npx supabase db reset` 