import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from './setup'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']

describe('Auth Flow', () => {
  let testUsers: { email: string }[] = []

  beforeAll(async () => {
    // Verify database connection
    await verifyDatabaseConnection()
  })

  afterAll(async () => {
    await cleanupTestUsers(testUsers.map(u => u.email))
  })

  describe('Signup Flow', () => {
    it('should create auth user and profile with patient role', async () => {
      const testEmail = generateTestEmail('patient')
      const testPassword = process.env.TEST_USER_PASSWORD!

      // Attempt signup
      const { data: auth, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            role: 'patient'
          }
        }
      })

      expect(signupError).toBeNull()
      expect(auth.user).toBeDefined()
      expect(auth.user?.email).toBe(testEmail)

      // Track for cleanup
      testUsers.push({ email: testEmail })

      // Verify user profile was created
      const { data: profile, error: profileError } = await adminClient
        .from('users')
        .select('*')
        .eq('id', auth.user?.id)
        .single()

      expect(profileError).toBeNull()
      expect(profile).toBeDefined()
      expect(profile?.role).toBe('patient')
      expect(profile?.email).toBe(testEmail)
    })

    it('should handle duplicate email signup gracefully', async () => {
      const testEmail = generateTestEmail('patient')
      const testPassword = process.env.TEST_USER_PASSWORD!

      // Create first user
      const { error: firstSignup } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })
      expect(firstSignup).toBeNull()
      testUsers.push({ email: testEmail })

      // Attempt duplicate signup
      const { error: duplicateSignup } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      expect(duplicateSignup).toBeDefined()
      expect(duplicateSignup?.message).toContain('User already registered')
    })

    it('should enforce password requirements', async () => {
      const testEmail = generateTestEmail('patient')
      const weakPassword = 'weak'

      const { error: weakPasswordError } = await supabase.auth.signUp({
        email: testEmail,
        password: weakPassword
      })

      expect(weakPasswordError).toBeDefined()
      expect(weakPasswordError?.message).toContain('Password')
    })
  })

  describe('Login Flow', () => {
    let testUser: User

    beforeAll(async () => {
      // Create a test user for login tests
      const testEmail = generateTestEmail('login-test')
      const testPassword = process.env.TEST_USER_PASSWORD!

      const { data: auth } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            role: 'patient'
          }
        }
      })

      if (!auth.user) throw new Error('Failed to create test user')

      testUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'patient',
        first_name: null,
        last_name: null,
        specialty: null,
        department: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      testUsers.push({ email: testEmail })
    })

    beforeEach(async () => {
      await supabase.auth.signOut()
    })

    it('should allow login with correct credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })

      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.user?.email).toBe(testUser.email)
    })

    it('should reject login with incorrect password', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: 'wrong-password'
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('Invalid login credentials')
    })

    it('should reject login for non-existent user', async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: process.env.TEST_USER_PASSWORD!
      })

      expect(error).toBeDefined()
      expect(error?.message).toContain('Invalid login credentials')
    })
  })
}) 