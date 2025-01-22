--
-- Name: 20250121000001_user_system; Type: MIGRATION
-- Description: Implements complete user system with roles, departments, and specialties
-- Dependencies: None
--

-- Types/Enums first
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'patient');
CREATE TYPE department AS ENUM ('primary_care', 'specialty_care', 'emergency', 'surgery', 'mental_health', 'admin');
CREATE TYPE staff_specialty AS ENUM (
  'general_practice',
  'pediatrics', 
  'cardiology',
  'neurology',
  'orthopedics',
  'dermatology',
  'psychiatry',
  'oncology'
);

-- Tables
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'patient',
  first_name TEXT,
  last_name TEXT,
  specialty staff_specialty,
  department department,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_specialty CHECK (
    (role = 'staff' AND specialty IS NOT NULL) OR
    (role != 'staff' AND specialty IS NULL)
  ),
  CONSTRAINT valid_department CHECK (
    (role IN ('staff', 'admin') AND department IS NOT NULL) OR
    (role = 'patient' AND department IS NULL)
  )
);

-- Functions
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER on_user_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_update();

-- Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Everyone can read basic user info
CREATE POLICY "Public profiles are viewable by everyone"
  ON users
  FOR SELECT
  USING (true);

-- Allow server to create new user profiles during signup
CREATE POLICY "Server can create user profiles"
  ON users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- Users can update their own profiles
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can change roles
CREATE POLICY "Only admins can change roles"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_specialty ON users(specialty); 