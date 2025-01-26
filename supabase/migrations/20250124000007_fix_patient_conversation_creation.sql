-- Drop the existing all-in-one policy
DROP POLICY IF EXISTS "patients_own_conversations" ON medical_conversations;

-- Create separate policies for different operations

-- Patients can create conversations for themselves
CREATE POLICY "patients_create_conversations"
ON medical_conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'patient' AND
  patient_id = auth.uid()
);

-- Patients can view their own conversations
CREATE POLICY "patients_view_conversations"
ON medical_conversations
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'patient' AND
  patient_id = auth.uid()
);

-- Patients can update their own conversations
CREATE POLICY "patients_update_conversations"
ON medical_conversations
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'patient' AND
  patient_id = auth.uid()
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'patient' AND
  patient_id = auth.uid()
);

-- Add comment for documentation
COMMENT ON TABLE medical_conversations IS 'Medical intake chatbot conversations with granular RLS policies for patient access'; 