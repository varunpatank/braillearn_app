/*
  # Create tutors table

  1. New Tables
    - `tutors`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `bio` (text)
      - `hourly_rate` (numeric)
      - `location` (text)
      - `specialties` (text array)
      - `experience_years` (integer)
      - `languages` (text array)
      - `availability` (text array)
      - `verified` (boolean, default false)
      - `rating` (numeric, default 0)
      - `review_count` (integer, default 0)
      - `total_students` (integer, default 0)
      - `response_time` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `tutors` table
    - Add policies for authenticated users
*/

-- Create tutors table
CREATE TABLE IF NOT EXISTS tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  bio text DEFAULT '',
  hourly_rate numeric DEFAULT 0,
  location text DEFAULT '',
  specialties text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  languages text[] DEFAULT '{}',
  availability text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  total_students integer DEFAULT 0,
  response_time text DEFAULT 'Within 24 hours',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read tutors"
  ON tutors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own tutor profile"
  ON tutors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tutor profile"
  ON tutors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER tutors_updated_at
  BEFORE UPDATE ON tutors
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();