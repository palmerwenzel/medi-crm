--
-- Name: 20250121134908_create_cases_table; Type: MIGRATION
-- Description: Sets up the case management system with status tracking and RLS
-- Dependencies: Requires users table and get_user_role function from previous migration
--

-- Create enum for case status
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'resolved');

-- Create additional enums
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE case_category AS ENUM ('general', 'followup', 'prescription', 'test_results', 'emergency');

-- Create cases table
-- This table stores medical cases/tickets created by patients
-- It will be used for:
-- 1. Patient case management
-- 2. Staff case handling
-- 3. Case status tracking
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'open',
  priority case_priority NOT NULL DEFAULT 'medium',
  category case_category NOT NULL DEFAULT 'general',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create RLS policies
-- 1. Patients can create their own cases
CREATE POLICY "Patients can create own cases"
  ON public.cases
  FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND get_user_role(auth.uid()) = 'patient'
  );

-- 2. Patients can view their own cases
CREATE POLICY "Patients can view own cases"
  ON public.cases
  FOR SELECT
  USING (
    auth.uid() = patient_id
    AND get_user_role(auth.uid()) = 'patient'
  );

-- 3. Staff and admins can view all cases
CREATE POLICY "Staff and admins can view all cases"
  ON public.cases
  FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- 4. Staff and admins can update any case
CREATE POLICY "Staff and admins can update cases"
  ON public.cases
  FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- Create function to validate staff assignment
CREATE OR REPLACE FUNCTION validate_case_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if assigned_to is NULL (allowing unassignment)
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check if assigned user is staff/admin
  IF EXISTS (
    SELECT 1 FROM users 
    WHERE id = NEW.assigned_to 
    AND role IN ('staff', 'admin')
  ) THEN
    RETURN NEW;
  END IF;
  
  RAISE EXCEPTION 'Cases can only be assigned to staff or admin users';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignment validation
CREATE TRIGGER validate_case_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION validate_case_assignment(); 