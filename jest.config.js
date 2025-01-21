/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: [
    '<rootDir>/src/lib/supabase/__tests__/jest.setup.ts',
    '<rootDir>/src/lib/supabase/__tests__/setup.ts'
  ],
} 