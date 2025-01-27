import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from '../setup'
import type { DbUser, DbUserInsert, DbUserUpdate } from '@/types/domain/db'

describe('User RLS Policies', () => {
  let testUsers: string[] = []
  let patientUser: DbUser
  let staffUser: DbUser
  let adminUser: DbUser

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

    const patientUserData: DbUserInsert = {
      id: auth.user.id,
      email: testEmail,
      role: 'patient',
      first_name: 'Test',
      last_name: 'Patient',
      specialty: null,
      department: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert patient user
    const { data: patient, error: insertError } = await adminClient
      .from('users')
      .insert(patientUserData)
      .select()
      .single()

    if (insertError || !patient) {
      throw new Error(`Failed to insert patient user: ${insertError?.message}`)
    }
    patientUser = patient

    // Create staff user
    const staffAuth = await adminClient.auth.admin.createUser({
      email: generateTestEmail('staff'),
      password: process.env.TEST_USER_PASSWORD!,
      email_confirm: true
    })

    if (staffAuth.error) throw new Error(`Failed to create staff user: ${staffAuth.error.message}`)

    const staffUserData: DbUserInsert = {
      id: staffAuth.data.user.id,
      email: staffAuth.data.user.email!,
      role: 'staff',
      first_name: 'Test',
      last_name: 'Staff',
      specialty: 'general_practice',
      department: 'primary_care',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert staff user
    const { data: staff, error: staffError } = await adminClient
      .from('users')
      .insert(staffUserData)
      .select()
      .single()

    if (staffError || !staff) {
      throw new Error(`Failed to insert staff user: ${staffError?.message}`)
    }
    staffUser = staff

    // Create admin user
    const adminAuth = await adminClient.auth.admin.createUser({
      email: generateTestEmail('admin'),
      password: process.env.TEST_USER_PASSWORD!,
      email_confirm: true
    })

    if (adminAuth.error) throw new Error(`Failed to create admin user: ${adminAuth.error.message}`)

    const adminUserData: DbUserInsert = {
      id: adminAuth.data.user.id,
      email: adminAuth.data.user.email!,
      role: 'admin',
      first_name: 'Test',
      last_name: 'Admin',
      specialty: null,
      department: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert admin user
    const { data: admin, error: adminError } = await adminClient
      .from('users')
      .insert(adminUserData)
      .select()
      .single()

    if (adminError || !admin) {
      throw new Error(`Failed to insert admin user: ${adminError?.message}`)
    }
    adminUser = admin

    // Track emails for cleanup
    testUsers = [patientUser.email, staffUser.email, adminUser.email]
  })

  afterAll(async () => {
    await cleanupTestUsers(testUsers)
  })

  describe('Patient access', () => {
    beforeEach(async () => {
      // Log in as patient
      const { error } = await supabase.auth.signInWithPassword({
        email: patientUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as patient: ${error.message}`)
    })

    it('can view their own profile', async () => {
      const { data: profile, error } = await supabase
        .from('users')
        .select<'users', DbUser>()
        .eq('id', patientUser.id)
        .single()

      expect(error).toBeNull()
      expect(profile?.id).toBe(patientUser.id)
      expect(profile?.role).toBe('patient')
    })

    it('cannot view other user profiles', async () => {
      const { data: profiles, error } = await supabase
        .from('users')
        .select<'users', DbUser>()
        .neq('id', patientUser.id)

      expect(error).toBeNull()
      expect(profiles).toHaveLength(0)
    })

    it('can update their own profile', async () => {
      const update: DbUserUpdate = {
        first_name: 'Updated',
        last_name: 'Patient'
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(update)
        .eq('id', patientUser.id)

      expect(updateError).toBeNull()

      // Verify update
      const { data: updated, error: fetchError } = await supabase
        .from('users')
        .select<'users', DbUser>()
        .eq('id', patientUser.id)
        .single()

      expect(fetchError).toBeNull()
      expect(updated?.first_name).toBe(update.first_name)
      expect(updated?.last_name).toBe(update.last_name)
    })

    it('cannot update role or department', async () => {
      const { error } = await supabase
        .from('users')
        .update<DbUserUpdate>({
          role: 'admin',
          department: 'admin'
        })
        .eq('id', patientUser.id)

      expect(error).not.toBeNull()
    })
  })

  describe('Staff access', () => {
    beforeEach(async () => {
      // Log in as staff
      const { error } = await supabase.auth.signInWithPassword({
        email: staffUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as staff: ${error.message}`)
    })

    it('can view users in their department', async () => {
      // Skip test if staff has no department
      if (!staffUser.department) {
        console.warn('Staff user has no department, skipping test')
        return
      }

      const { data: users, error } = await supabase
        .from('users')
        .select<'users', DbUser>()
        .eq('department', staffUser.department)

      expect(error).toBeNull()
      expect(users?.length).toBeGreaterThan(0)
      expect(users?.some(u => u.id === staffUser.id)).toBe(true)
    })

    it('cannot view users in other departments', async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select<'users', DbUser>()
        .eq('department', 'specialty_care')

      expect(error).toBeNull()
      expect(users).toHaveLength(0)
    })
  })

  describe('Admin access', () => {
    beforeEach(async () => {
      // Log in as admin
      const { error } = await supabase.auth.signInWithPassword({
        email: adminUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as admin: ${error.message}`)
    })

    it('can view all users', async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select<'users', DbUser>()

      expect(error).toBeNull()
      expect(users).toBeDefined()
      expect(users?.length).toBeGreaterThanOrEqual(3)
      expect(users?.some(u => u.id === patientUser.id)).toBe(true)
      expect(users?.some(u => u.id === staffUser.id)).toBe(true)
      expect(users?.some(u => u.id === adminUser.id)).toBe(true)
    })

    it('can update any user', async () => {
      const update: DbUserUpdate = {
        first_name: 'Updated By Admin',
        department: 'specialty_care'
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(update)
        .eq('id', staffUser.id)

      expect(updateError).toBeNull()

      // Verify update
      const { data: updated, error: fetchError } = await supabase
        .from('users')
        .select<'users', DbUser>()
        .eq('id', staffUser.id)
        .single()

      expect(fetchError).toBeNull()
      expect(updated?.first_name).toBe(update.first_name)
      expect(updated?.department).toBe(update.department)

      // Reset department
      await adminClient
        .from('users')
        .update<DbUserUpdate>({ department: 'primary_care' })
        .eq('id', staffUser.id)
    })
  })
}) 