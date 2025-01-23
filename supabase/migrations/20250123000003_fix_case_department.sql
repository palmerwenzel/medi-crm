--
-- Name: 20250123000003_fix_case_department; Type: MIGRATION
-- Description: Makes department nullable and adds auto-assignment logic
-- Dependencies: 20250121000002_case_system
--
-- Rollback Plan:
-- 1. Remove auto-assignment trigger
-- 2. Make department NOT NULL again after ensuring all records have a value
-- 3. Remove auto-assignment function
-- SQL:
--   DROP TRIGGER IF EXISTS auto_assign_case_department ON cases;
--   ALTER TABLE cases ALTER COLUMN department SET NOT NULL;
--   DROP FUNCTION IF EXISTS auto_assign_department();
--

-- First make department nullable
ALTER TABLE cases ALTER COLUMN department DROP NOT NULL;

-- Create function to auto-assign department based on category
CREATE OR REPLACE FUNCTION auto_assign_department()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if department is NULL
  IF NEW.department IS NULL THEN
    -- Map case categories to appropriate departments
    -- Emergency cases -> Emergency department
    -- Prescriptions and general cases -> Primary Care
    -- Test results -> Specialty Care
    NEW.department = (CASE NEW.category
      WHEN 'emergency' THEN 'emergency'::department
      WHEN 'prescription' THEN 'primary_care'::department
      WHEN 'test_results' THEN 'specialty_care'::department
      ELSE 'primary_care'::department -- Default to primary care
    END);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign department
CREATE TRIGGER auto_assign_case_department
  BEFORE INSERT ON cases
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_department();

-- Update existing cases to have a department if NULL
UPDATE cases 
SET department = (CASE category
  WHEN 'emergency' THEN 'emergency'::department
  WHEN 'prescription' THEN 'primary_care'::department
  WHEN 'test_results' THEN 'specialty_care'::department
  ELSE 'primary_care'::department
END)
WHERE department IS NULL; 