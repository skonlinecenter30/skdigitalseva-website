/*
# Ensure Profile Access for Self-Registration

## Changes
1. Drop and recreate INSERT policy to be clearer
2. The existing UPDATE policy already allows users to update their own profile
3. Users can now insert their own profile via the trigger OR manually
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- Create clear insert policy
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the trigger exists for auto-profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN LOWER(NEW.email) = 'admin@skdigitalseva.in' THEN 'admin'
      ELSE 'customer'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure admin profile has correct role
UPDATE profiles 
SET role = 'admin' 
WHERE LOWER(email) = 'admin@skdigitalseva.in';
