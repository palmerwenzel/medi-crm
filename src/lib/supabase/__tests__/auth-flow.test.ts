import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from './setup'
import type { DbUser, DbUserInsert } from '@/types/domain/db'

describe('Auth Flow', () => {
  const testUsers: string[] = []

  beforeAll(async () => {
    // Verify database connection
    await verifyDatabaseConnection()
  })

  afterAll(async () => {
    await cleanupTestUsers(testUsers)
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

      if (!auth.user?.id) {
        throw new Error('User ID not found after signup')
      }

      // Track for cleanup
      testUsers.push(testEmail)

      // Verify user profile was created
      const { data: profile, error: profileError } = await adminClient
        .from('users')
        .select<'users', DbUser>()
        .eq('id', auth.user.id)
        .single()

      expect(profileError).toBeNull()
      expect(profile).toBeDefined()
      expect(profile?.role).toBe('patient')
    })

    it('should create auth user and profile with staff role', async () => {
      const testEmail = generateTestEmail('staff')
      const testPassword = process.env.TEST_USER_PASSWORD!

      // Create staff user with admin client
      const { data: auth, error: createError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      })

      expect(createError).toBeNull()
      expect(auth.user).toBeDefined()

      if (!auth.user) {
        throw new Error('Failed to create staff user')
      }

      // Create staff profile
      const staffData: DbUserInsert = {
        id: auth.user.id,
        email: testEmail,
        role: 'staff',
        first_name: 'Test',
        last_name: 'Staff',
        specialty: 'general_practice',
        department: 'primary_care',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: profile, error: insertError } = await adminClient
        .from('users')
        .insert(staffData)
        .select()
        .single()

      expect(insertError).toBeNull()
      expect(profile).toBeDefined()
      expect(profile?.role).toBe('staff')

      // Track for cleanup
      testUsers.push(testEmail)

      // Verify login works
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      expect(loginError).toBeNull()
    })

    it('should handle duplicate email signup', async () => {
      const testEmail = generateTestEmail('duplicate')
      const testPassword = process.env.TEST_USER_PASSWORD!

      // First signup
      const { error: firstSignup } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      expect(firstSignup).toBeNull()
      testUsers.push(testEmail)

      // Attempt duplicate signup
      const { error: duplicateSignup } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      expect(duplicateSignup).not.toBeNull()
      expect(duplicateSignup?.message).toContain('User already registered')
    })
  })

  describe('Login Flow', () => {
    it('should allow login with valid credentials', async () => {
      const testEmail = generateTestEmail('login')
      const testPassword = process.env.TEST_USER_PASSWORD!

      // Create test user
      const { data: auth } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })

      expect(auth.user).toBeDefined()
      testUsers.push(testEmail)

      // Attempt login
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })

      expect(loginError).toBeNull()
    })

    it('should reject login with invalid credentials', async () => {
      const testEmail = generateTestEmail('invalid')

      // Attempt login with non-existent user
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: 'wrong-password'
      })

      expect(loginError).not.toBeNull()
      expect(loginError?.message).toContain('Invalid login credentials')
    })
  })
}) 