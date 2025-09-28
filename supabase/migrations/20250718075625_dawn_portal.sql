/*
  # Create classes table

  1. New Tables
    - `classes`
      - `id` (uuid, primary key)
      - `tutor_id` (uuid, references tutors)
      - `title` (text)
      - `description` (text)
      - `date` (text)
      - `time` (text)
      - `duration` (integer)
      - `price` (numeric)
      - `level` (text)
      - `max_students` (integer)
      - `current_students` (integer, default 0)
      - `type` (text)
      - `location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `classes` table
    - Add policies for authenticated users
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES tutors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date text NOT NULL,
  time text NOT NULL,
  duration integer DEFAULT 60,
  price numeric DEFAULT 0,
  level text DEFAULT 'Beginner',
  max_students integer DEFAULT 10,
  current_students integer DEFAULT 0,
  type text DEFAULT 'online',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tutors can insert own classes"
  ON classes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutors 
      WHERE tutors.id = classes.tutor_id 
      AND tutors.user_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can update own classes"
  ON classes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tutors 
      WHERE tutors.id = classes.tutor_id 
      AND tutors.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tutors 
      WHERE tutors.id = classes.tutor_id 
      AND tutors.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();