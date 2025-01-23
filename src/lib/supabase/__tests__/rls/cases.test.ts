import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from '../setup'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Case = Database['public']['Tables']['cases']['Row']

describe('Case RLS Policies', () => {
  let testUsers: { email: string }[] = []
  let patientUser: User
  let staffUser: User
  let adminUser: User
  let testCase: Case
  let otherDepartmentCase: Case

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
      specialty: null,
      department: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Create staff user
    const staffAuth = await adminClient.auth.admin.createUser({
      email: generateTestEmail('staff'),
      password: process.env.TEST_USER_PASSWORD!,
      email_confirm: true
    })

    if (staffAuth.error) throw new Error(`Failed to create staff user: ${staffAuth.error.message}`)

    staffUser = {
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

    // Create admin user
    const adminAuth = await adminClient.auth.admin.createUser({
      email: generateTestEmail('admin'),
      password: process.env.TEST_USER_PASSWORD!,
      email_confirm: true
    })

    if (adminAuth.error) throw new Error(`Failed to create admin user: ${adminAuth.error.message}`)

    adminUser = {
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

    // Insert users
    const { error: insertError } = await adminClient
      .from('users')
      .insert([patientUser, staffUser, adminUser])

    if (insertError) {
      throw new Error(`Failed to insert test users: ${insertError.message}`)
    }

    // Create a test case in staff's department
    const { data: caseData, error: caseError } = await adminClient
      .from('cases')
      .insert({
        patient_id: patientUser.id,
        title: 'Test Case',
        description: 'Test Description',
        status: 'open',
        priority: 'medium',
        category: 'general',
        department: staffUser.department,
        metadata: { test: 'data' },
        internal_notes: 'Staff only notes',
        attachments: []
      })
      .select()
      .single()

    if (caseError || !caseData) {
      throw new Error(`Failed to create test case: ${caseError?.message}`)
    }

    testCase = caseData

    // Create a case in a different department
    const { data: otherCaseData, error: otherCaseError } = await adminClient
      .from('cases')
      .insert({
        patient_id: patientUser.id,
        title: 'Other Department Case',
        description: 'Test Description',
        status: 'open',
        priority: 'medium',
        category: 'general',
        department: 'specialty_care',
        metadata: { test: 'data' },
        internal_notes: 'Staff only notes',
        attachments: []
      })
      .select()
      .single()

    if (otherCaseError || !otherCaseData) {
      throw new Error(`Failed to create other department case: ${otherCaseError?.message}`)
    }

    otherDepartmentCase = otherCaseData

    // Track emails for cleanup
    testUsers = [patientUser, staffUser, adminUser].map(u => ({ email: u.email }))
  })

  afterAll(async () => {
    // Clean up cases
    await adminClient
      .from('cases')
      .delete()
      .in('id', [testCase.id, otherDepartmentCase.id])

    // Clean up users
    await cleanupTestUsers(testUsers.map(u => u.email))
  })

  describe('Patient Access Policy', () => {
    beforeEach(async () => {
      // Log in as patient
      const { error } = await supabase.auth.signInWithPassword({
        email: patientUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as patient: ${error.message}`)
    })

    it('allows patients to view their own cases', async () => {
      const { data, error } = await supabase
        .from('cases')
        .select()
        .eq('patient_id', patientUser.id)

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBe(2) // Should see both cases since they're the patient
    })

    it('prevents patients from viewing internal notes', async () => {
      const { data, error } = await supabase
        .from('cases')
        .select()
        .eq('id', testCase.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.internal_notes).toBeNull()
    })

    it('allows patients to create cases', async () => {
      const { data, error } = await supabase
        .from('cases')
        .insert({
          patient_id: patientUser.id,
          title: 'New Case',
          description: 'New Description',
          priority: 'low',
          category: 'general',
          department: 'primary_care' // Required field
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.patient_id).toBe(patientUser.id)

      // Clean up
      if (data) {
        await adminClient
          .from('cases')
          .delete()
          .eq('id', data.id)
      }
    })

    it('prevents patients from creating cases for others', async () => {
      const { error } = await supabase
        .from('cases')
        .insert({
          patient_id: staffUser.id,
          title: 'Invalid Case',
          description: 'Should Fail',
          priority: 'low',
          category: 'general',
          department: 'primary_care'
        })

      expect(error).toBeDefined()
    })

    it('prevents patients from updating case status', async () => {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'resolved' })
        .eq('id', testCase.id)

      expect(error).toBeDefined()
    })
  })

  describe('Staff Access Policy', () => {
    beforeEach(async () => {
      // Log in as staff
      const { error } = await supabase.auth.signInWithPassword({
        email: staffUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as staff: ${error.message}`)
    })

    it('allows staff to view cases in their department', async () => {
      const { data, error } = await supabase
        .from('cases')
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBe(1) // Should only see cases in primary_care
      expect(data?.[0].id).toBe(testCase.id)
    })

    it('prevents staff from viewing cases in other departments', async () => {
      const { data, error } = await supabase
        .from('cases')
        .select()
        .eq('id', otherDepartmentCase.id)
        .single()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('allows staff to view internal notes in their department', async () => {
      const { data, error } = await supabase
        .from('cases')
        .select()
        .eq('id', testCase.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.internal_notes).toBe('Staff only notes')
    })

    it('allows staff to update case status in their department', async () => {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'in_progress' })
        .eq('id', testCase.id)

      expect(error).toBeNull()

      // Reset status
      await adminClient
        .from('cases')
        .update({ status: 'open' })
        .eq('id', testCase.id)
    })

    it('prevents staff from updating cases in other departments', async () => {
      const { error } = await supabase
        .from('cases')
        .update({ status: 'in_progress' })
        .eq('id', otherDepartmentCase.id)

      expect(error).toBeDefined()
    })
  })

  describe('Admin Access Policy', () => {
    beforeEach(async () => {
      // Log in as admin
      const { error } = await supabase.auth.signInWithPassword({
        email: adminUser.email,
        password: process.env.TEST_USER_PASSWORD!
      })
      if (error) throw new Error(`Failed to log in as admin: ${error.message}`)
    })

    it('allows admins to view all cases', async () => {
      const { data, error } = await supabase
        .from('cases')
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBe(2) // Should see both test cases
    })

    it('allows admins to update any case field', async () => {
      const updates = {
        title: 'Admin Updated',
        status: 'resolved',
        priority: 'high',
        internal_notes: 'Admin notes',
        metadata: { admin: true }
      }

      const { error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', otherDepartmentCase.id) // Test with case from different department

      expect(error).toBeNull()

      // Verify updates
      const { data } = await adminClient
        .from('cases')
        .select()
        .eq('id', otherDepartmentCase.id)
        .single()

      expect(data?.title).toBe(updates.title)
      expect(data?.status).toBe(updates.status)
      expect(data?.priority).toBe(updates.priority)
      expect(data?.internal_notes).toBe(updates.internal_notes)
      expect(data?.metadata).toEqual(updates.metadata)
    })
  })
}) 