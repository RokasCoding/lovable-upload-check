-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_links' 
    AND policyname = 'Registration links are viewable by admins only'
  ) THEN
    DROP POLICY "Registration links are viewable by admins only" ON registration_links;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_links' 
    AND policyname = 'Registration links are insertable by admins only'
  ) THEN
    DROP POLICY "Registration links are insertable by admins only" ON registration_links;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registration_links' 
    AND policyname = 'Registration links are updatable by admins only'
  ) THEN
    DROP POLICY "Registration links are updatable by admins only" ON registration_links;
  END IF;
END
$$;

-- Create new policies with correct metadata access
CREATE POLICY "Registration links are viewable by admins only"
  ON registration_links FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

CREATE POLICY "Registration links are insertable by admins only"
  ON registration_links FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

CREATE POLICY "Registration links are updatable by admins only"
  ON registration_links FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin'
  );

-- Alternative approach using auth.uid() in case the above doesn't work
-- Uncomment these if needed
/*
CREATE POLICY "Registration links are viewable by anyone"
  ON registration_links FOR SELECT
  USING (true);

CREATE POLICY "Registration links are insertable by authenticated users"
  ON registration_links FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Registration links are updatable by owner"
  ON registration_links FOR UPDATE
  USING (auth.uid() = created_by);
*/ 