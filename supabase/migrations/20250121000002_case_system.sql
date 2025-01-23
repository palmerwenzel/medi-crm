--
-- Name: 20250121000002_case_system; Type: MIGRATION
-- Description: Implements complete case management system with metadata and assignments
-- Dependencies: 20250121000001_user_system (for user references and enums)
--

-- Types/Enums first
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE case_category AS ENUM ('general', 'followup', 'prescription', 'test_results', 'emergency');

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

-- Triggers
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