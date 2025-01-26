-- Add access column to medical_conversations
ALTER TABLE medical_conversations
ADD COLUMN IF NOT EXISTS access jsonb DEFAULT jsonb_build_object('canAccess', 'both');

-- Add comment for documentation
COMMENT ON COLUMN medical_conversations.access IS 'Access control configuration for the conversation. Controls AI vs provider access.';

-- Verify column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medical_conversations' 
    AND column_name = 'access'
  ) THEN
    RAISE EXCEPTION 'access column was not created successfully';
  END IF;
END $$; 