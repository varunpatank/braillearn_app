/*
  # Fix users table RLS policy for signup

  1. Security
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that allows authenticated users to create their own profile
    - Ensure users can only insert with their own auth.uid()
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Create a new INSERT policy that allows authenticated users to create profiles
CREATE POLICY "Allow authenticated users to create profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the SELECT and UPDATE policies are correct
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);