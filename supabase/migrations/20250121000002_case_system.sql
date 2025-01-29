--
-- Name: 20250121000002_case_system; Type: MIGRATION
-- Description: Implements complete case management system with metadata and assignments
-- Dependencies: 20250121000001_user_system (for user references and enums)
--

-- Types/Enums first
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE case_category AS ENUM ('general', 'followup', 'prescription', 'test_results', 'emergency');
CREATE TYPE case_activity_type AS ENUM (
  'status_change',
  'priority_change',
  'category_change',
  'department_change',
  'assignment_change',
  'note_added',
  'file_added',
  'file_removed',
  'metadata_change',
  'assessment_added',
  'assessment_updated'
);

-- Functions
CREATE OR REPLACE FUNCTION validate_case_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip validation if assigned_to is NULL
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if assigned user is staff or admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE users.id = NEW.assigned_to
    AND users.role IN ('staff', 'admin')
  ) THEN
    RAISE EXCEPTION 'Cases can only be assigned to staff or admin users';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_case_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tables
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'open',
  priority case_priority NOT NULL DEFAULT 'medium',
  category case_category NOT NULL DEFAULT 'general',
  department department NOT NULL,
  -- metadata field retained for general case metadata
  -- structured medical assessments now stored in case_assessments table
  metadata JSONB NOT NULL DEFAULT '{}',
  internal_notes TEXT,
  attachments JSONB NOT NULL DEFAULT '[]',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_department_assignment CHECK (
    department IN (
      'primary_care', 'specialty_care', 'emergency', 
      'surgery', 'mental_health', 'admin'
    )
  )
);

-- Case Assessment System
-- Provides structured storage for medical assessments
-- Replaces the previous pattern of storing medical assessment data in cases.metadata
CREATE TYPE assessment_creator_type AS ENUM ('ai', 'staff', 'admin');
CREATE TYPE assessment_status AS ENUM ('active', 'superseded');

CREATE TABLE case_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  created_by_type assessment_creator_type NOT NULL,
  key_symptoms TEXT[] NOT NULL DEFAULT '{}',
  recommended_specialties TEXT[] NOT NULL DEFAULT '{}',
  urgency_indicators TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status assessment_status NOT NULL DEFAULT 'active',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessment update trigger function
CREATE OR REPLACE FUNCTION handle_assessment_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an update that would create a duplicate active assessment
  -- mark the old one as superseded
  IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') AND NEW.status = 'active' THEN
    UPDATE case_assessments
    SET status = 'superseded'
    WHERE case_id = NEW.case_id
    AND id != NEW.id
    AND status = 'active';
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Assessment triggers
CREATE TRIGGER on_assessment_update
  BEFORE UPDATE OR INSERT ON case_assessments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assessment_update();

-- Assessment policies
ALTER TABLE case_assessments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assessments for cases they can access
CREATE POLICY "Users can view assessments for accessible cases"
  ON case_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_assessments.case_id
      AND (
        -- Patient owns the case
        cases.patient_id = auth.uid()
        OR
        -- Staff/admin in same department
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('staff', 'admin')
          AND (
            users.department = cases.department
            OR users.role = 'admin'
          )
        )
      )
    )
  );

-- Only staff and admin can create/update assessments
CREATE POLICY "Staff and admin can manage assessments"
  ON case_assessments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
    )
  );

-- Assessment indexes
CREATE INDEX idx_case_assessments_case_id ON case_assessments(case_id);
CREATE INDEX idx_case_assessments_created_by ON case_assessments(created_by);
CREATE INDEX idx_case_assessments_status ON case_assessments(status);
CREATE INDEX idx_case_assessments_created_at ON case_assessments(created_at);
CREATE INDEX idx_case_assessments_updated_at ON case_assessments(updated_at);

-- Function to record assessment history
CREATE OR REPLACE FUNCTION record_assessment_history()
RETURNS TRIGGER AS $$
DECLARE
  _actor_id uuid;
  _activity_type case_activity_type;
  _old_value jsonb;
  _new_value jsonb;
BEGIN
  -- Get the current user ID
  _actor_id := COALESCE(auth.uid(), NEW.created_by);
  
  -- Determine if this is a new assessment or an update
  IF TG_OP = 'INSERT' THEN
    _activity_type := 'assessment_added';
    _new_value := jsonb_build_object(
      'key_symptoms', NEW.key_symptoms,
      'recommended_specialties', NEW.recommended_specialties,
      'urgency_indicators', NEW.urgency_indicators,
      'created_by_type', NEW.created_by_type
    );
  ELSE
    _activity_type := 'assessment_updated';
    _old_value := jsonb_build_object(
      'key_symptoms', OLD.key_symptoms,
      'recommended_specialties', OLD.recommended_specialties,
      'urgency_indicators', OLD.urgency_indicators,
      'status', OLD.status
    );
    _new_value := jsonb_build_object(
      'key_symptoms', NEW.key_symptoms,
      'recommended_specialties', NEW.recommended_specialties,
      'urgency_indicators', NEW.urgency_indicators,
      'status', NEW.status
    );
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
    NEW.case_id,
    _activity_type,
    _actor_id,
    _old_value,
    _new_value,
    jsonb_build_object(
      'assessment_id', NEW.id,
      'timestamp', now(),
      'client_info', current_setting('request.headers', true)::jsonb,
      'notes', NEW.notes
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assessment history trigger
CREATE TRIGGER record_assessment_history_trigger
  AFTER INSERT OR UPDATE ON case_assessments
  FOR EACH ROW
  EXECUTE FUNCTION record_assessment_history();

-- Case triggers
CREATE TRIGGER validate_case_assignment
  BEFORE INSERT OR UPDATE OF assigned_to ON cases
  FOR EACH ROW
  EXECUTE FUNCTION validate_case_assignment();

CREATE TRIGGER on_case_update
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION handle_case_update();

-- Policies
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Patients can view their own cases
CREATE POLICY "Patients can view own cases"
  ON cases
  FOR SELECT
  USING (
    auth.uid() = patient_id
  );

-- Staff and admins can view all cases in their department
CREATE POLICY "Staff and admins can view department cases"
  ON cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
      AND (
        users.department = cases.department
        OR users.role = 'admin'
      )
    )
  );

-- Patients can create cases
CREATE POLICY "Patients can create cases"
  ON cases
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'patient'
    )
  );

-- Staff can update cases in their department
CREATE POLICY "Staff can update department cases"
  ON cases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
      AND (
        users.department = cases.department
        OR users.role = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin')
      AND (
        users.department = cases.department
        OR users.role = 'admin'
      )
    )
  );

-- Create indexes
CREATE INDEX idx_cases_patient_id ON cases(patient_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_department ON cases(department);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_updated_at ON cases(updated_at); 