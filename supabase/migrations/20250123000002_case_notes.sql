--
-- Name: 20250123000002_case_notes; Type: MIGRATION
-- Description: Adds case notes table for internal staff communication
-- Dependencies: 20250121000002_case_system (for case references)
--

-- Create case notes table
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add trigger for updated_at
CREATE TRIGGER case_notes_updated_at
  BEFORE UPDATE ON case_notes
  FOR EACH ROW
  EXECUTE FUNCTION handle_case_update();

-- RLS Policies
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

-- Staff and admin can view all notes
CREATE POLICY "Staff and admin can view all notes"
  ON case_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Staff and admin can create notes
CREATE POLICY "Staff and admin can create notes"
  ON case_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Staff can only update their own notes
CREATE POLICY "Staff can update their own notes"
  ON case_notes
  FOR UPDATE
  TO authenticated
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

-- Staff can only delete their own notes, admin can delete any
CREATE POLICY "Staff can delete their own notes, admin can delete any"
  ON case_notes
  FOR DELETE
  TO authenticated
  USING (
    staff_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  ); 