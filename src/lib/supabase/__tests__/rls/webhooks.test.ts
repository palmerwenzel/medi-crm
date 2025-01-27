import { supabase, adminClient, generateTestEmail, cleanupTestUsers, verifyDatabaseConnection } from '../setup'
import type { DbUser, DbWebhook, DbUserInsert, DbWebhookInsert, DbWebhookUpdate } from '@/types/domain/db'

describe('Webhook RLS Policies', () => {
  let testUsers: string[] = []
  let patientUser: DbUser
  let staffUser: DbUser
  let adminUser: DbUser
  let testWebhook: DbWebhook

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

    // Create test webhook
    const webhookData: DbWebhookInsert = {
      url: 'https://example.com/webhook',
      events: ['case.created', 'case.updated'],
      is_active: true,
      created_by: staffUser.id,
      secret: 'test-secret-key-32-chars-exactly!!',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: webhook, error: webhookError } = await adminClient
      .from('webhooks')
      .insert(webhookData)
      .select()
      .single()

    if (webhookError || !webhook) {
      throw new Error(`Failed to create test webhook: ${webhookError?.message}`)
    }
    testWebhook = webhook

    // Track emails for cleanup
    testUsers = [patientUser.email, staffUser.email, adminUser.email]
  })

  afterAll(async () => {
    // Clean up test data
    await adminClient.from('webhooks').delete().eq('id', testWebhook.id)
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

    it('cannot view webhooks', async () => {
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select<'webhooks', DbWebhook>()

      expect(error).toBeNull()
      expect(webhooks).toHaveLength(0)
    })

    it('cannot create webhooks', async () => {
      const { error } = await supabase
        .from('webhooks')
        .insert<DbWebhookInsert>({
          url: 'https://example.com/webhook',
          events: ['case.created'],
          is_active: true,
          created_by: patientUser.id,
          secret: 'test-secret-key-32-chars-exactly!!',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

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

    it('can view webhooks they created', async () => {
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select<'webhooks', DbWebhook>()
        .eq('created_by', staffUser.id)

      expect(error).toBeNull()
      expect(webhooks).toHaveLength(1)
      expect(webhooks?.[0].id).toBe(testWebhook.id)
    })

    it('can create webhooks', async () => {
      const webhookData: DbWebhookInsert = {
        url: 'https://example.com/new-webhook',
        events: ['case.created'],
        is_active: true,
        created_by: staffUser.id,
        secret: 'test-secret-key-32-chars-exactly!!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert(webhookData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(webhook?.url).toBe(webhookData.url)

      // Clean up
      if (webhook) {
        await adminClient.from('webhooks').delete().eq('id', webhook.id)
      }
    })

    it('can update their own webhooks', async () => {
      const update: DbWebhookUpdate = {
        is_active: false,
        events: ['case.created', 'case.closed']
      }

      const { error: updateError } = await supabase
        .from('webhooks')
        .update(update)
        .eq('id', testWebhook.id)

      expect(updateError).toBeNull()

      // Verify update
      const { data: updated, error: fetchError } = await supabase
        .from('webhooks')
        .select<'webhooks', DbWebhook>()
        .eq('id', testWebhook.id)
        .single()

      expect(fetchError).toBeNull()
      expect(updated?.is_active).toBe(update.is_active)
      expect(updated?.events).toEqual(update.events)
    })

    it('cannot update webhooks created by others', async () => {
      // Create a webhook as admin
      const adminWebhookData: DbWebhookInsert = {
        url: 'https://example.com/admin-webhook',
        events: ['case.created'],
        is_active: true,
        created_by: adminUser.id,
        secret: 'test-secret-key-32-chars-exactly!!',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: adminWebhook, error: createError } = await adminClient
        .from('webhooks')
        .insert(adminWebhookData)
        .select()
        .single()

      expect(createError).toBeNull()
      expect(adminWebhook).not.toBeNull()

      if (adminWebhook) {
        // Try to update as staff
        const { error } = await supabase
          .from('webhooks')
          .update<DbWebhookUpdate>({ is_active: false })
          .eq('id', adminWebhook.id)

        expect(error).not.toBeNull()

        // Clean up
        await adminClient.from('webhooks').delete().eq('id', adminWebhook.id)
      }
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

    it('can view all webhooks', async () => {
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select<'webhooks', DbWebhook>()

      expect(error).toBeNull()
      expect(webhooks?.length).toBeGreaterThanOrEqual(1)
      expect(webhooks?.some(w => w.id === testWebhook.id)).toBe(true)
    })

    it('can update any webhook', async () => {
      const update: DbWebhookUpdate = {
        is_active: false,
        url: 'https://example.com/updated-by-admin'
      }

      const { error: updateError } = await supabase
        .from('webhooks')
        .update(update)
        .eq('id', testWebhook.id)

      expect(updateError).toBeNull()

      // Verify update
      const { data: updated, error: fetchError } = await supabase
        .from('webhooks')
        .select<'webhooks', DbWebhook>()
        .eq('id', testWebhook.id)
        .single()

      expect(fetchError).toBeNull()
      expect(updated?.is_active).toBe(update.is_active)
      expect(updated?.url).toBe(update.url)
    })
  })
}) 