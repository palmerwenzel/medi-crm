-- Enable RLS on tables
ALTER TABLE medical_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for medical_conversations

-- Admin full access
CREATE POLICY "admins_all_conversations"
ON medical_conversations
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Staff access to assigned conversations
CREATE POLICY "staff_assigned_conversations"
ON medical_conversations
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'staff' AND
  assigned_staff_id = auth.uid()
);

-- Patients access own conversations
CREATE POLICY "patients_own_conversations"
ON medical_conversations
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'patient' AND
  patient_id = auth.uid()
);

-- Create policies for medical_messages

-- Admin full access to messages
CREATE POLICY "admins_all_messages"
ON medical_messages
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Staff access to messages in assigned conversations
CREATE POLICY "staff_conversation_messages"
ON medical_messages
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'staff' AND
  conversation_id IN (
    SELECT id FROM medical_conversations
    WHERE assigned_staff_id = auth.uid()
  )
);

-- Patients access to messages in own conversations
CREATE POLICY "patients_conversation_messages"
ON medical_messages
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'patient' AND
  conversation_id IN (
    SELECT id FROM medical_conversations
    WHERE patient_id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON TABLE medical_conversations IS 'Medical intake chatbot conversations with RLS policies for patient, staff, and admin access';
COMMENT ON TABLE medical_messages IS 'Messages within medical conversations with RLS policies matching conversation access'; 