import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from '../setup'
import type { DbUser, DbCase, DbUserInsert, DbCaseInsert, DbCaseUpdate } from '@/types/domain/db'

describe('Case RLS Policies', () => {
  let testUsers: string[] = []
  let patientUser: DbUser
  let staffUser: DbUser
  let adminUser: DbUser
  let testCase: DbCase
  let otherDepartmentCase: DbCase

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
    const { error: insertErrorUsers } = await adminClient
      .from('users')
      .insert([patientUser, staffUser, adminUser])

    if (insertErrorUsers) {
      throw new Error(`Failed to insert test users: ${insertErrorUsers.message}`)
    }

    // Create test case
    const testCaseData: DbCaseInsert = {
      title: 'Test Case',
      description: 'Test case description',
      patient_id: patientUser.id,
      status: 'open',
      priority: 'medium',
      category: 'general',
      department: 'primary_care',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: caseData, error: caseError } = await adminClient
      .from('cases')
      .insert(testCaseData)
      .select()
      .single()

    if (caseError || !caseData) {
      throw new Error(`Failed to create test case: ${caseError?.message}`)
    }
    testCase = caseData

    // Create case in different department
    const otherCaseData: DbCaseInsert = {
      title: 'Other Department Case',
      description: 'Case in different department',
      patient_id: patientUser.id,
      status: 'open',
      priority: 'medium',
      category: 'general',
      department: 'specialty_care',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: otherCase, error: otherError } = await adminClient
      .from('cases')
      .insert(otherCaseData)
      .select()
      .single()

    if (otherError || !otherCase) {
      throw new Error(`Failed to create other department case: ${otherError?.message}`)
    }
    otherDepartmentCase = otherCase

    // Track emails for cleanup
    testUsers = [patientUser.email, staffUser.email, adminUser.email]
  })

  afterAll(async () => {
    // Clean up test data
    await adminClient.from('cases').delete().eq('patient_id', patientUser.id)
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

    it('can view their own cases', async () => {
      const { data: cases, error } = await supabase
        .from('cases')
        .select<'cases', DbCase>()
        .eq('patient_id', patientUser.id)

      expect(error).toBeNull()
      expect(cases).toHaveLength(2)
      expect(cases?.map(c => c.id)).toContain(testCase.id)
    })

    it('cannot view other patients cases', async () => {
      const { error: createError } = await adminClient
        .from('cases')
        .insert<DbCaseInsert>({
          title: 'Other Patient Case',
          description: 'Case for another patient',
          patient_id: staffUser.id, // Using staff as a patient for this test
          status: 'open',
          priority: 'medium',
          category: 'general',
          department: 'primary_care',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      expect(createError).toBeNull()

      const { data: cases, error } = await supabase
        .from('cases')
        .select<'cases', DbCase>()
        .eq('patient_id', staffUser.id)

      expect(error).toBeNull()
      expect(cases).toHaveLength(0)
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

    it('can view cases in their department', async () => {
      // Skip test if staff has no department
      if (!staffUser.department) {
        console.warn('Staff user has no department, skipping test')
        return
      }

      const { data: cases, error } = await supabase
        .from('cases')
        .select<'cases', DbCase>()
        .eq('department', staffUser.department)

      expect(error).toBeNull()
      expect(cases?.some(c => c.id === testCase.id)).toBe(true)
    })

    it('cannot view cases in other departments', async () => {
      const { data: cases, error } = await supabase
        .from('cases')
        .select<'cases', DbCase>()
        .eq('department', 'specialty_care')

      expect(error).toBeNull()
      expect(cases?.some(c => c.id === otherDepartmentCase.id)).toBe(false)
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

    it('can view all cases', async () => {
      const { data: cases, error } = await supabase
        .from('cases')
        .select<'cases', DbCase>()

      expect(error).toBeNull()
      expect(cases).toBeDefined()
      expect(cases?.length).toBeGreaterThanOrEqual(2)
      expect(cases?.map(c => c.id)).toContain(testCase.id)
      expect(cases?.map(c => c.id)).toContain(otherDepartmentCase.id)
    })

    it('can update any case', async () => {
      // Update test case
      const { error: updateError } = await supabase
        .from('cases')
        .update<DbCaseUpdate>({
          status: 'in_progress',
          internal_notes: 'Updated by admin'
        })
        .eq('id', testCase.id)

      expect(updateError).toBeNull()

      // Verify update
      const { data: updated, error: fetchError } = await supabase
        .from('cases')
        .select<'cases', DbCase>()
        .eq('id', testCase.id)
        .single()

      expect(fetchError).toBeNull()
      expect(updated?.status).toBe('in_progress')
      expect(updated?.internal_notes).toBe('Updated by admin')

      // Reset status
      await adminClient
        .from('cases')
        .update<DbCaseUpdate>({
          status: 'open',
          internal_notes: null
        })
        .eq('id', testCase.id)
    })
  })
}) 