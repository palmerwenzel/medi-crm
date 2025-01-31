-- Name: 20250124000009_fix_rls_role_check
-- Description: Implements simplified and more secure RLS policies for the medical chat system
-- This migration supersedes and replaces 20250124000004_add_chat_rls.sql with improved policies
-- Dependencies: 20250124000002_add_case_to_conversations, 20250121000001_user_system
--
-- Rollback Plan:
-- 1. DROP all policies created in this migration
-- 2. Re-enable RLS on affected tables
-- 3. Recreate previous policies if needed

-- Enable RLS on all chat-related tables
ALTER TABLE medical_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_messages ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "patients_create_conversations" ON medical_conversations;
DROP POLICY IF EXISTS "patients_view_conversations" ON medical_conversations;
DROP POLICY IF EXISTS "patients_update_conversations" ON medical_conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON medical_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON medical_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON medical_conversations;
DROP POLICY IF EXISTS "Staff can select assigned conversations" ON medical_conversations;
DROP POLICY IF EXISTS "Admins have full access" ON medical_conversations;
DROP POLICY IF EXISTS "admins_all_conversations" ON medical_conversations;
DROP POLICY IF EXISTS "staff_assigned_conversations" ON medical_conversations;
DROP POLICY IF EXISTS "patients_own_conversations" ON medical_conversations;

-- Drop message policies
DROP POLICY IF EXISTS "admins_all_messages" ON medical_messages;
DROP POLICY IF EXISTS "staff_conversation_messages" ON medical_messages;
DROP POLICY IF EXISTS "patients_conversation_messages" ON medical_messages;
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON medical_messages;
DROP POLICY IF EXISTS "Users can insert messages to own conversations" ON medical_messages;

-- Create simplified conversation policies with improved security

-- Patient policies
CREATE POLICY "Users can select own conversations"
ON medical_conversations
FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert new conversations"
ON medical_conversations
FOR INSERT
WITH CHECK (
  auth.uid() = patient_id 
  AND (case_id IS NULL OR EXISTS (
    SELECT 1 FROM cases 
    WHERE id = case_id 
    AND patient_id = auth.uid()
  ))
);

CREATE POLICY "Users can update own conversations"
ON medical_conversations
FOR UPDATE
USING (auth.uid() = patient_id)
WITH CHECK (
  auth.uid() = patient_id 
  AND (case_id IS NULL OR EXISTS (
    SELECT 1 FROM cases 
    WHERE id = case_id 
    AND patient_id = auth.uid()
  ))
);

CREATE POLICY "Users can delete own conversations"
ON medical_conversations
FOR DELETE
USING (auth.uid() = patient_id);

-- Staff policies
CREATE POLICY "Staff can select assigned conversations"
ON medical_conversations
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'staff'
  AND (
    assigned_staff_id = auth.uid()
    OR (
      case_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM cases
        WHERE id = medical_conversations.case_id
        AND assigned_to = auth.uid()
      )
    )
  )
);

CREATE POLICY "Staff can update assigned conversations"
ON medical_conversations
FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'staff'
  AND (
    assigned_staff_id = auth.uid()
    OR (
      case_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM cases
        WHERE id = medical_conversations.case_id
        AND assigned_to = auth.uid()
      )
    )
  )
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'staff'
  AND (
    assigned_staff_id = auth.uid()
    OR (
      case_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM cases
        WHERE id = medical_conversations.case_id
        AND assigned_to = auth.uid()
      )
    )
  )
);

CREATE POLICY "Staff can delete assigned conversations"
ON medical_conversations
FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'staff'
  AND (
    assigned_staff_id = auth.uid()
    OR (
      case_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM cases
        WHERE id = medical_conversations.case_id
        AND assigned_to = auth.uid()
      )
    )
  )
);

-- Admin policies for conversations
CREATE POLICY "Admins have full access to conversations"
ON medical_conversations
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Create message policies that align with conversation access

-- Patient message policies
CREATE POLICY "Users can view own conversation messages"
ON medical_messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM medical_conversations
    WHERE patient_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to own conversations"
ON medical_messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM medical_conversations
    WHERE patient_id = auth.uid()
  )
);

-- Staff message policies
CREATE POLICY "Staff can access assigned conversation messages"
ON medical_messages
FOR ALL
USING (
  auth.jwt() ->> 'role' = 'staff'
  AND conversation_id IN (
    SELECT id FROM medical_conversations
    WHERE assigned_staff_id = auth.uid()
    OR (
      case_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM cases
        WHERE id = medical_conversations.case_id
        AND assigned_to = auth.uid()
      )
    )
  )
);

-- Admin message policies
CREATE POLICY "Admins have full access to messages"
ON medical_messages
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');

-- Verify RLS is enabled and policies exist
DO $$
BEGIN
  -- Verify RLS is enabled on both tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'medical_conversations' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on medical_conversations';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'medical_messages' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on medical_messages';
  END IF;

  -- Verify conversation policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medical_conversations' 
    AND policyname IN (
      'Users can select own conversations',
      'Users can insert new conversations',
      'Users can update own conversations',
      'Staff can select assigned conversations',
      'Staff can update assigned conversations',
      'Admins have full access to conversations'
    )
  ) THEN
    RAISE EXCEPTION 'Missing required policies on medical_conversations';
  END IF;

  -- Verify message policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medical_messages' 
    AND policyname IN (
      'Users can view own conversation messages',
      'Users can send messages to own conversations',
      'Staff can access assigned conversation messages',
      'Admins have full access to messages'
    )
  ) THEN
    RAISE EXCEPTION 'Missing required policies on medical_messages';
  END IF;
END $$;

-- Add documentation comments
COMMENT ON TABLE medical_conversations IS 'Medical intake chatbot conversations with simplified RLS policies for patient, staff, and admin access';
COMMENT ON TABLE medical_messages IS 'Messages within medical conversations with RLS policies aligned with conversation access permissions'; 