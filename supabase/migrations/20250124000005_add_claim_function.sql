-- Create function to safely claim cases
create or replace function claim_case(case_id uuid, staff_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  is_staff boolean;
  current_assigned_to uuid;
begin
  -- Check if user is staff
  select auth.jwt() ->> 'role' = 'staff' into is_staff;
  if not is_staff then
    raise exception 'Only staff members can claim cases';
  end if;

  -- Check if case exists and get current assignment
  select assigned_to into current_assigned_to
  from cases
  where id = case_id;

  if not found then
    raise exception 'Case not found';
  end if;

  -- Check if case is already assigned
  if current_assigned_to is not null then
    raise exception 'Case is already assigned';
  end if;

  -- Update case assignment and metadata
  update cases
  set 
    assigned_to = staff_id,
    metadata = jsonb_set(
      coalesce(metadata, '{}'::jsonb),
      '{chat_status}',
      '"active"',
      true
    )
  where id = case_id;

  -- Update conversation to disable AI
  update medical_conversations
  set can_create_case = false
  where case_id = case_id;
end;
$$; 