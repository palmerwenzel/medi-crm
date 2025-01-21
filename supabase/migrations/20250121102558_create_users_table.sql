--
-- Name: 20250121102558_create_users_table; Type: MIGRATION
-- Description: Sets up the complete user management system including roles, tables, and RLS
--

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'patient');

-- Create users table
-- This table extends Supabase's auth.users to store additional user information
-- It will be used for:
-- 1. Role-based access control (RBAC)
-- 2. User profile management
-- 3. Linking patients to their medical cases
-- 4. Staff management and assignments
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'patient',
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Utility function for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if a role update is allowed
CREATE OR REPLACE FUNCTION check_role_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role <> NEW.role THEN
    RETURN NULL; -- Prevents role updates
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user role safely (used by RLS policies)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = user_id
$$ LANGUAGE sql SECURITY DEFINER;

-- Create trigger for role protection
CREATE TRIGGER protect_role_updates
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION check_role_update();

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create RLS policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. Staff and admins can view all profiles
CREATE POLICY "Staff and admins can view all profiles"
  ON public.users
  FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('staff', 'admin')
  );

-- 4. Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.users
  FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'admin'
  );

-- 5. Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile during signup"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id); 