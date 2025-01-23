import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from '../setup'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Webhook = Database['public']['Tables']['webhooks']['Row']

describe('Webhook RLS Policies', () => {
  let testUsers: { email: string }[] = []
  let patientUser: User
  let staffUser: User
  let adminUser: User
  let testWebhook: Webhook

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

    // Create a test webhook using admin client
    const { data: webhook, error: webhookError } = await adminClient
      .from('webhooks')
      .insert({
        url: 'https://example.com/webhook',
        secret: 'test-secret',
        description: 'Test Webhook',
        events: ['case.created', 'case.updated'],
        created_by: staffUser.id,
        is_active: true
      })
      .select()
      .single()

    if (webhookError || !webhook) {
      throw new Error(`Failed to create test webhook: ${webhookError?.message}`)
    }

    testWebhook = webhook

    // Track emails for cleanup
    testUsers = [patientUser, staffUser, adminUser].map(u => ({ email: u.email }))
  })

  afterAll(async () => {
    // Clean up webhooks
    await adminClient
      .from('webhooks')
      .delete()
      .eq('id', testWebhook.id)

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

    it('prevents patients from viewing webhooks', async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select()

      expect(error).toBeDefined()
      expect(data).toBeNull()
    })

    it('prevents patients from creating webhooks', async () => {
      const { error } = await supabase
        .from('webhooks')
        .insert({
          url: 'https://example.com/webhook2',
          secret: 'test-secret',
          events: ['case.created'],
          created_by: patientUser.id
        })

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

    it('allows staff to view all webhooks', async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(0)
    })

    it('allows staff to create webhooks', async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          url: 'https://example.com/webhook2',
          secret: 'test-secret',
          description: 'Another Test Webhook',
          events: ['case.created'],
          created_by: staffUser.id
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.created_by).toBe(staffUser.id)

      // Clean up
      if (data) {
        await adminClient
          .from('webhooks')
          .delete()
          .eq('id', data.id)
      }
    })

    it('allows staff to update their own webhooks', async () => {
      const { error } = await supabase
        .from('webhooks')
        .update({ description: 'Updated Description' })
        .eq('id', testWebhook.id)

      expect(error).toBeNull()
    })

    it('prevents staff from updating others webhooks', async () => {
      // Create a webhook owned by admin
      const { data: adminWebhook } = await adminClient
        .from('webhooks')
        .insert({
          url: 'https://example.com/admin-webhook',
          secret: 'admin-secret',
          events: ['case.created'],
          created_by: adminUser.id
        })
        .select()
        .single()

      const { error } = await supabase
        .from('webhooks')
        .update({ description: 'Try to update' })
        .eq('id', adminWebhook!.id)

      expect(error).toBeDefined()

      // Clean up
      await adminClient
        .from('webhooks')
        .delete()
        .eq('id', adminWebhook!.id)
    })

    it('allows staff to delete their own webhooks', async () => {
      // Create a new webhook for deletion
      const { data: webhook } = await supabase
        .from('webhooks')
        .insert({
          url: 'https://example.com/delete-test',
          secret: 'delete-secret',
          events: ['case.created'],
          created_by: staffUser.id
        })
        .select()
        .single()

      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhook!.id)

      expect(error).toBeNull()
    })

    it('prevents staff from deleting others webhooks', async () => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('created_by', adminUser.id)

      expect(error).toBeDefined()
    })
  })
}) 