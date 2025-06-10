-- =============================================
-- UNIVERSAL ADMIN SETUP - FIXED VERSION
-- Works with existing database setup and handles admin invitations
-- =============================================

-- 1. Create/Update profiles for ALL users with admin role in auth metadata
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
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', u.email),
    u.raw_user_meta_data->>'phone',
    'admin',
    0,
    true,
    u.created_at,
    NOW()
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'admin'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();

-- 2. Create universal helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        -- Check if user has admin role in profiles table
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- OR check if user has admin role in auth metadata
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR
        (auth.jwt() -> 'raw_user_meta_data' ->> 'role') = 'admin';
$$;

-- 3. CAREFULLY drop and recreate policies for PROFILES table
-- Get existing policies first, then drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on profiles table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.profiles';
    END LOOP;
END $$;

-- Create new policies for profiles
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- 4. Handle BONUS_ENTRIES policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing policies on bonus_entries table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'bonus_entries' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.bonus_entries';
    END LOOP;
END $$;

-- Create bonus entries policies
CREATE POLICY "Users can read own bonus entries"
ON public.bonus_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage bonus entries"
ON public.bonus_entries FOR ALL
USING (public.is_admin());

-- 5. Handle PRIZES policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing policies on prizes table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'prizes' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.prizes';
    END LOOP;
END $$;

-- Create prizes policies
CREATE POLICY "Users can read active prizes"
ON public.prizes FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage prizes"
ON public.prizes FOR ALL
USING (public.is_admin());

-- 6. Handle PRIZE_REDEMPTIONS policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing policies on prize_redemptions table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'prize_redemptions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.prize_redemptions';
    END LOOP;
END $$;

-- Create redemptions policies
CREATE POLICY "Users can read own redemptions"
ON public.prize_redemptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own redemptions"
ON public.prize_redemptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage redemptions"
ON public.prize_redemptions FOR ALL
USING (public.is_admin());

-- 7. Handle REGISTRATION_LINKS policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing policies on registration_links table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'registration_links' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.registration_links';
    END LOOP;
END $$;

-- Create registration links policies
CREATE POLICY "Admins can manage registration links"
ON public.registration_links FOR ALL
USING (public.is_admin());

-- 8. Handle CONTENT policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing policies on content table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'content' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.content';
    END LOOP;
END $$;

-- Create content policies
CREATE POLICY "Public can read content"
ON public.content FOR SELECT
USING (true);

CREATE POLICY "Admins can manage content"
ON public.content FOR ALL
USING (public.is_admin());

-- 9. Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- 10. CRITICAL: Update auth trigger to handle admin invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile for new user
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
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'), -- This will use 'admin' if set during invitation
    0,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Update the create_user_profile function to handle admin invitations
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
    user_role, -- This will preserve admin role from invitation
    initial_points, 
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = NOW()
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

-- 12. Create function to promote user to admin (for existing users)
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Only allow current admins to promote others
    IF NOT public.is_admin() THEN
        RETURN json_build_object('success', false, 'error', 'Unauthorized: Only admins can promote users');
    END IF;
    
    -- Find the user
    SELECT u.id INTO target_user_id
    FROM auth.users u
    WHERE u.email = user_email;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Update profile to admin
    UPDATE public.profiles 
    SET role = 'admin', updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Update auth metadata
    UPDATE auth.users
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE id = target_user_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'User ' || user_email || ' promoted to admin successfully'
    );
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 13. Verification queries
SELECT 
    'Universal Admin Setup Complete!' as status,
    'Total admin users: ' || COUNT(*) as admin_count
FROM public.profiles 
WHERE role = 'admin';

-- Show all admin users
SELECT 
    'Current Admin Users:' as info,
    u.email,
    p.role as profile_role,
    u.raw_user_meta_data->>'role' as auth_role,
    CASE WHEN p.id IS NOT NULL THEN 'Profile exists ✅' ELSE 'No profile ❌' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.raw_user_meta_data->>'role' = 'admin' OR p.role = 'admin'
ORDER BY u.email;

-- Test the is_admin function for current user
SELECT 
    'Current user admin status: ' || 
    CASE WHEN public.is_admin() THEN 'YES ✅' ELSE 'NO ❌' END as current_user_status; 