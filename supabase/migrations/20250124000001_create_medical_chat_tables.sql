-- Create enums
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE conversation_status AS ENUM ('active', 'archived');

-- Create tables
CREATE TABLE medical_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status conversation_status DEFAULT 'active',
    topic TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

CREATE TABLE medical_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES medical_conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    role message_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Create indexes
CREATE INDEX idx_conversations_patient ON medical_conversations(patient_id, updated_at DESC);
CREATE INDEX idx_conversations_staff ON medical_conversations(assigned_staff_id, updated_at DESC);
CREATE INDEX idx_messages_conversation ON medical_messages(conversation_id, created_at ASC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_medical_conversations_updated_at
    BEFORE UPDATE ON medical_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE medical_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_messages ENABLE ROW LEVEL SECURITY;

-- Patients can only access their own conversations
CREATE POLICY "Users can view own conversations"
    ON medical_conversations
    FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own conversations"
    ON medical_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own conversations"
    ON medical_conversations
    FOR UPDATE
    USING (auth.uid() = patient_id);

-- Message policies
CREATE POLICY "Users can view messages from own conversations"
    ON medical_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM medical_conversations
            WHERE id = medical_messages.conversation_id
            AND patient_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to own conversations"
    ON medical_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM medical_conversations
            WHERE id = medical_messages.conversation_id
            AND patient_id = auth.uid()
        )
    );

-- Staff policies (to be implemented in Phase 2)
-- Will add policies for staff to access assigned conversations 