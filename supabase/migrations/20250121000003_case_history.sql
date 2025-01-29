--
-- Name: 20250121000003_case_history; Type: MIGRATION
-- Description: Adds case history tracking with timeline and activity log
-- Dependencies: 20250121000002_case_system (for case references)
--

-- Case History Table
CREATE TABLE case_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  activity_type case_activity_type NOT NULL,
  actor_id uuid NOT NULL REFERENCES users(id),
  old_value jsonb,
  new_value jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Indexes for efficient querying
  CONSTRAINT fk_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX idx_case_history_case_id ON case_history(case_id);
CREATE INDEX idx_case_history_created_at ON case_history(created_at);
CREATE INDEX idx_case_history_activity_type ON case_history(activity_type);

-- Function to record case history
CREATE OR REPLACE FUNCTION record_case_history()
RETURNS TRIGGER AS $$
DECLARE
  _actor_id uuid;
  _old_value jsonb;
  _new_value jsonb;
  _activity_type case_activity_type;
BEGIN
  -- Get the current user ID from the session
  _actor_id := auth.uid();
  
  -- Determine what changed and set activity type
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    _activity_type := 'status_change';
    _old_value := jsonb_build_object('status', OLD.status);
    _new_value := jsonb_build_object('status', NEW.status);
  ELSIF OLD.priority IS DISTINCT FROM NEW.priority THEN
    _activity_type := 'priority_change';
    _old_value := jsonb_build_object('priority', OLD.priority);
    _new_value := jsonb_build_object('priority', NEW.priority);
  ELSIF OLD.category IS DISTINCT FROM NEW.category THEN
    _activity_type := 'category_change';
    _old_value := jsonb_build_object('category', OLD.category);
    _new_value := jsonb_build_object('category', NEW.category);
  ELSIF OLD.department IS DISTINCT FROM NEW.department THEN
    _activity_type := 'department_change';
    _old_value := jsonb_build_object('department', OLD.department);
    _new_value := jsonb_build_object('department', NEW.department);
  ELSIF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    _activity_type := 'assignment_change';
    _old_value := jsonb_build_object('assigned_to', OLD.assigned_to);
    _new_value := jsonb_build_object('assigned_to', NEW.assigned_to);
  ELSIF OLD.internal_notes IS DISTINCT FROM NEW.internal_notes THEN
    _activity_type := 'note_added';
    _new_value := jsonb_build_object('note', NEW.internal_notes);
  ELSIF OLD.attachments IS DISTINCT FROM NEW.attachments THEN
    -- Determine if files were added or removed
    IF array_length(NEW.attachments, 1) > array_length(OLD.attachments, 1) THEN
      _activity_type := 'file_added';
    ELSE
      _activity_type := 'file_removed';
    END IF;
    _old_value := jsonb_build_object('attachments', OLD.attachments);
    _new_value := jsonb_build_object('attachments', NEW.attachments);
  ELSIF OLD.metadata IS DISTINCT FROM NEW.metadata THEN
    _activity_type := 'metadata_change';
    _old_value := OLD.metadata;
    _new_value := NEW.metadata;
  ELSE
    -- No tracked changes
    RETURN NEW;
  END IF;

  -- Insert history record
  INSERT INTO case_history (
    case_id,
    activity_type,
    actor_id,
    old_value,
    new_value,
    metadata
  ) VALUES (
    NEW.id,
    _activity_type,
    _actor_id,
    _old_value,
    _new_value,
    jsonb_build_object(
      'timestamp', now(),
      'client_info', current_setting('request.headers', true)::jsonb
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to record case history
CREATE TRIGGER record_case_history_trigger
  AFTER UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION record_case_history();

-- RLS Policies
ALTER TABLE case_history ENABLE ROW LEVEL SECURITY;

-- Policies for case history
-- Staff and admin can view history for cases they have access to
CREATE POLICY "Staff and admin can view case history"
  ON case_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_history.case_id
      AND (
        -- Admin can view all
        auth.jwt()->>'role' = 'admin'
        -- Staff can view cases in their department
        OR (
          auth.jwt()->>'role' = 'staff'
          AND c.department = (
            SELECT department 
            FROM users 
            WHERE id = auth.uid()
          )
        )
        -- Patients can view their own cases
        OR (
          auth.jwt()->>'role' = 'patient'
          AND c.patient_id = auth.uid()
        )
      )
    )
  ); 