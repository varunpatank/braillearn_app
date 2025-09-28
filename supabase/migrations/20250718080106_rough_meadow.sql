/*
  # Fix RLS policy for user signup

  1. Security Updates
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that allows authenticated users to create profiles
    - Ensure users can only create profiles with their own auth.uid()
    
  2. Changes
    - Allow INSERT operations for authenticated users
    - Maintain security by ensuring users can only insert their own data
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create a new INSERT policy that allows authenticated users to create their profile
CREATE POLICY "Users can create own profile"
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