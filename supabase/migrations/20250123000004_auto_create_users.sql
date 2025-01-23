--
-- Name: 20250123000004_auto_create_users; Type: MIGRATION
-- Description: Adds trigger to auto-create user records on auth.users insert
-- Dependencies: 20250121000001_user_system
--

-- First drop the policy if it exists and create a new one
DROP POLICY IF EXISTS "Server can create user profiles" ON users;
CREATE POLICY "Server can create user profiles"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  OR auth.role() = 'service_role'
);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the attempt
  RAISE LOG 'Creating new user record for auth.id: %, email: %', NEW.id, NEW.email;
  
  BEGIN
    INSERT INTO public.users (id, email, role, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.email,
      'patient'::user_role,  -- Default role is patient
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),  -- Get first_name directly
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')    -- Get last_name directly
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
    
    -- Log success
    RAISE LOG 'Successfully created/updated user record for %', NEW.email;
    
    RETURN NEW;  -- Always return NEW to allow the auth.users insert
  EXCEPTION WHEN OTHERS THEN
    -- Log the error details but don't prevent auth user creation
    RAISE LOG 'Error in user record creation: % %', SQLERRM, SQLSTATE;
    RETURN NEW;  -- Still return NEW to allow the auth.users insert
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search_path explicitly for security
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC;
ALTER FUNCTION handle_new_user() SET search_path = public;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to sync existing users
CREATE OR REPLACE FUNCTION sync_missing_users()
RETURNS void AS $$
BEGIN
  INSERT INTO public.users (id, email, role, first_name, last_name)
  SELECT 
    au.id,
    au.email,
    'patient'::user_role as role,
    COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.id = au.id
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set search_path for sync function too
REVOKE ALL ON FUNCTION sync_missing_users() FROM PUBLIC;
ALTER FUNCTION sync_missing_users() SET search_path = public;

-- Run initial sync
SELECT sync_missing_users(); 