-- =============================================
-- Update create_user_profile function to handle phone numbers
-- =============================================

-- Drop existing function
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, TEXT, INTEGER);

-- Create updated function with phone parameter
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  user_role TEXT DEFAULT 'user',
  initial_points INTEGER DEFAULT 0,
  user_phone TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_profile RECORD;
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    phone,
    role, 
    total_points, 
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    user_id, 
    user_email, 
    user_name, 
    user_phone,
    user_role::text, 
    initial_points, 
    true,
    NOW(),
    NOW()
  )
  RETURNING * INTO new_profile;

  RETURN json_build_object(
    'success', true,
    'profile', row_to_json(new_profile)
  );
EXCEPTION
  WHEN others THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Update RPC function call in auth trigger (if exists)
-- This ensures phone numbers from auth metadata are saved to profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, total_points, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    0,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

SELECT 'Profile function updated successfully to handle phone numbers!' as message; 