/*
  Migration: Add case relationship to medical conversations
  
  Changes:
  - Adds case_id column to link conversations with cases
  - Adds can_create_case flag for UI control
  - Updates RLS policies for staff access
  - Ensures proper updated_at handling
*/

-- Name: 20250124000002_add_case_to_conversations
-- Description: Adds case relationship to medical conversations and updates access control
-- Dependencies: 20250124000001_create_medical_chat_tables, 20250121000002_case_system
--
-- Rollback Plan:
-- 1. DROP TRIGGER IF EXISTS update_conversations_case_timestamp ON medical_conversations;
-- 2. DROP FUNCTION IF EXISTS verify_update_updated_at();
-- 3. DROP INDEX IF EXISTS idx_medical_conversations_case_id;
-- 4. ALTER TABLE medical_conversations DROP COLUMN case_id, DROP COLUMN can_create_case;

-- Create or replace timestamp update function
CREATE OR REPLACE FUNCTION verify_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.case_id IS DISTINCT FROM OLD.case_id THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add columns to medical_conversations
ALTER TABLE medical_conversations
    ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES cases(id),
    ADD COLUMN IF NOT EXISTS can_create_case boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_medical_conversations_case_id 
    ON medical_conversations(case_id);

-- Create trigger for case_id changes
CREATE TRIGGER update_conversations_case_timestamp
    BEFORE UPDATE OF case_id ON medical_conversations
    FOR EACH ROW
    EXECUTE FUNCTION verify_update_updated_at();

-- Add RLS policies for case-based access
CREATE POLICY "Staff can view conversations for their cases"
    ON medical_conversations
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT assigned_to
            FROM cases
            WHERE id = medical_conversations.case_id
        )
        OR
        auth.uid() IN (
            SELECT id
            FROM users
            WHERE role = 'admin'
        )
    );

-- Update existing policies to handle case relationship
ALTER POLICY "Users can view own conversations"
    ON medical_conversations
    USING (
        patient_id = auth.uid()
        OR
        auth.uid() IN (
            SELECT assigned_to
            FROM cases
            WHERE id = medical_conversations.case_id
        )
        OR
        auth.uid() IN (
            SELECT id
            FROM users
            WHERE role = 'admin'
        )
    ); 