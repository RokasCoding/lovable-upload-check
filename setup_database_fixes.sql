-- Update prizes table to match the new schema
DO $$
BEGIN
  -- Check if point_cost column exists and rename it to points
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prizes' AND column_name = 'point_cost'
  ) THEN
    ALTER TABLE prizes RENAME COLUMN point_cost TO points;
  END IF;

  -- Check if active column exists and rename it to is_active
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prizes' AND column_name = 'active'
  ) THEN
    ALTER TABLE prizes RENAME COLUMN active TO is_active;
  END IF;
END
$$;

-- Create registration_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS registration_links (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  link_token uuid DEFAULT uuid_generate_v4() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  used_at timestamp with time zone,
  used_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on registration_links
ALTER TABLE registration_links ENABLE ROW LEVEL SECURITY;

-- Create policies for registration_links if they don't exist
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_links' 
    AND policyname = 'Registration links are viewable by admins only'
  ) THEN
    CREATE POLICY "Registration links are viewable by admins only"
      ON registration_links FOR SELECT
      USING (
        auth.uid() IN (
          SELECT id FROM auth.users
          WHERE raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;

  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_links' 
    AND policyname = 'Registration links are insertable by admins only'
  ) THEN
    CREATE POLICY "Registration links are insertable by admins only"
      ON registration_links FOR INSERT
      WITH CHECK (
        auth.uid() IN (
          SELECT id FROM auth.users
          WHERE raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;

  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_links' 
    AND policyname = 'Registration links are updatable by admins only'
  ) THEN
    CREATE POLICY "Registration links are updatable by admins only"
      ON registration_links FOR UPDATE
      USING (
        auth.uid() IN (
          SELECT id FROM auth.users
          WHERE raw_user_meta_data->>'role' = 'admin'
        )
      );
  END IF;
END
$$;

-- Create or replace function to validate registration link
CREATE OR REPLACE FUNCTION public.validate_registration_link(link_token uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM registration_links
    WHERE registration_links.link_token = validate_registration_link.link_token
    AND is_active = true
    AND used_at IS NULL
  );
END;
$$;

-- Rename redemptions table to prize_redemptions if needed
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'redemptions') THEN
    ALTER TABLE redemptions RENAME TO prize_redemptions;
  END IF;
END
$$; 