-- Create a function to create registration links that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_registration_link(creator_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
DECLARE
  link_record jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = creator_id
    AND (
      raw_user_meta_data->>'role' = 'admin' OR
      raw_user_meta_data->'role' = '"admin"'
    )
  ) THEN
    RAISE EXCEPTION 'Only admins can create registration links';
  END IF;

  -- Insert the new registration link
  WITH inserted AS (
    INSERT INTO registration_links (created_by)
    VALUES (creator_id)
    RETURNING *
  )
  SELECT row_to_json(inserted)::jsonb INTO link_record FROM inserted;
  
  RETURN link_record;
END;
$$; 