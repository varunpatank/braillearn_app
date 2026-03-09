-- ═══ User Study Plans (keyed by Clerk user ID) ═══
-- Stores the full study plan + weekly schedule per user.
-- Replaces the old localStorage-only approach.

CREATE TABLE IF NOT EXISTS user_study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  study_plan JSONB NOT NULL,            -- full StudyPlan object
  weekly_schedule JSONB,                -- full WeeklySchedule object
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)                       -- one active plan per user
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_study_plans_user ON user_study_plans(user_id);

-- RLS
ALTER TABLE user_study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_plans_own" ON user_study_plans FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
