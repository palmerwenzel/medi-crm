import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from './setup'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']

describe('Supabase RLS Policies', () => {
  let testUsers: { email: string }[] = []
  let patientUser: User
  let staffUser: User
  let adminUser: User

  beforeAll(async () => {
    // Verify database connection
    await verifyDatabaseConnection()

    // Create test users with different roles
    const testEmail = generateTestEmail('patient')
    const { data: auth, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: process.env.TEST_USER_PASSWORD!
    })

    if (signupError || !auth.user) {
      throw new Error(`Failed to create test user: ${signupError?.message}`)
    }

    patientUser = {
      id: auth.user.id,
      email: testEmail,
      role: 'patient',
      first_name: 'Test',
      last_name: 'Patient',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert test user into users table using admin client
    const { error: insertError } = await adminClient.from('users').insert([patientUser])
    if (insertError) {
      throw new Error(`Failed to insert test user: ${insertError.message}`)
    }

    // Create additional test users
    const staffAuth = await adminClient.auth.admin.createUser({
      email: generateTestEmail('staff'),
      password: process.env.TEST_USER_PASSWORD!,
      email_confirm: true
    })

    const adminAuth = await adminClient.auth.admin.createUser({
      email: generateTestEmail('admin'),
      password: process.env.TEST_USER_PASSWORD!,
      email_confirm: true
    })

    if (staffAuth.error) throw new Error(`Failed to create staff user: ${staffAuth.error.message}`)
    if (adminAuth.error) throw new Error(`Failed to create admin user: ${adminAuth.error.message}`)

    staffUser = {
      id: staffAuth.data.user.id,
      email: staffAuth.data.user.email!,
      role: 'staff',
      first_name: 'Test',
      last_name: 'Staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    adminUser = {
      id: adminAuth.data.user.id,
      email: adminAuth.data.user.email!,
      role: 'admin',
      first_name: 'Test',
      last_name: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: bulkInsertError } = await adminClient
      .from('users')
      .insert([staffUser, adminUser])

    if (bulkInsertError) {
      throw new Error(`Failed to insert additional test users: ${bulkInsertError.message}`)
    }

    // Track emails for cleanup
    testUsers = [patientUser, staffUser, adminUser].map(u => ({ email: u.email }))
  })

  afterAll(async () => {
    await cleanupTestUsers(testUsers.map(u => u.email))
  })

  describe('User Self-View Policy', () => {
    it('allows users to view their own profile', async () => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', patientUser.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.id).toBe(patientUser.id)
    })

    it('prevents users from viewing other profiles', async () => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .neq('id', patientUser.id)
        .single()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })
  })

  describe('User Self-Edit Policy', () => {
    it('allows users to update their own profile', async () => {
      const newFirstName = 'Updated'
      const { error } = await supabase
        .from('users')
        .update({ first_name: newFirstName })
        .eq('id', patientUser.id)

      expect(error).toBeNull()

      // Verify update
      const { data } = await supabase
        .from('users')
        .select()
        .eq('id', patientUser.id)
        .single()

      expect(data?.first_name).toBe(newFirstName)
    })

    it('prevents users from updating their role', async () => {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', patientUser.id)

      expect(error).toBeDefined()
    })
  })

  describe('Staff View-All Policy', () => {
    beforeEach(async () => {
      // Log in as staff user
      const { error } = await supabase.auth.signInWithPassword({
        email: staffUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as staff: ${error.message}`)
    })

    it('allows staff to view all profiles', async () => {
      const { data, error } = await supabase
        .from('users')
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(0)
    })
  })

  describe('Admin Full-Access Policy', () => {
    beforeEach(async () => {
      // Log in as admin user
      const { error } = await supabase.auth.signInWithPassword({
        email: adminUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as admin: ${error.message}`)

      // Verify we're signed in as admin
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user?.id) {
        throw new Error('Admin session not established')
      }
    })

    it('allows admins to view all profiles', async () => {
      const { data, error } = await supabase
        .from('users')
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(0)
    })

    it('allows admins to update any profile', async () => {
      // First verify the current user is admin
      const { data: adminCheck } = await supabase.from('users')
        .select('role')
        .eq('id', adminUser.id)
        .single()
      
      if (adminCheck?.role !== 'admin') {
        throw new Error('Test not running as admin user')
      }

      // Get initial state
      const { data: initialState } = await adminClient
        .from('users')
        .select('first_name')
        .eq('id', patientUser.id)
        .single()

      const newFirstName = `Admin Updated ${Date.now()}`
      const { error: updateError } = await supabase
        .from('users')
        .update({ first_name: newFirstName })
        .eq('id', patientUser.id)

      expect(updateError).toBeNull()

      // Verify update using admin client to bypass RLS
      const { data: updatedState, error: verifyError } = await adminClient
        .from('users')
        .select('first_name')
        .eq('id', patientUser.id)
        .single()

      expect(verifyError).toBeNull()
      expect(updatedState?.first_name).toBe(newFirstName)
      expect(updatedState?.first_name).not.toBe(initialState?.first_name)
    })
  })
}) 