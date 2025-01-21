--
-- Name: 20250121134908_create_cases_table; Type: MIGRATION
-- Description: Sets up the case management system with status tracking and RLS
-- Dependencies: Requires users table and get_user_role function from previous migration
--

-- Create enum for case status
CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'resolved');

-- Create cases table
-- This table stores medical cases/tickets created by patients
-- It will be used for:
-- 1. Patient case management
-- 2. Staff case handling
-- 3. Case status tracking
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'open',
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