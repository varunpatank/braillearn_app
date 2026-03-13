-- ══════════════════════════════════════════════════════════
-- Clerk + Supabase Integration Migration
-- Adds profiles table keyed by Clerk user IDs,
-- enrollments, course permissions, and updated RLS policies
-- ══════════════════════════════════════════════════════════

-- ═══ PROFILES (keyed by Clerk user ID) ═══
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,                -- Clerk user ID (e.g. user_2x...)
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  total_finds INTEGER DEFAULT 0,
  cities_mapped INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  preferences JSONB DEFAULT '{"theme":"light","audio":true,"fontSize":"medium"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ COURSES (user-created courses with full metadata) ═══
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 50,
  tags TEXT[] DEFAULT '{}',
  curriculum JSONB DEFAULT '[]'::jsonb,  -- array of {title, description, resources[]}
  meeting_link TEXT,
  schedule JSONB,                        -- {days[], time, duration, timezone}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ ENROLLMENTS (who is in which course, with role) ═══
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'assistant', 'auditor')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  progress_pct REAL DEFAULT 0,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  last_active TIMESTAMPTZ,
  UNIQUE(course_id, user_id)
);

-- ═══ COURSE PERMISSIONS (granular access control) ═══
CREATE TABLE IF NOT EXISTS course_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_edit BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  can_view_stats BOOLEAN DEFAULT false,
  can_grade BOOLEAN DEFAULT false,
  granted_by TEXT REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- ═══ USER LESSON PROGRESS (per-lesson tracking) ═══
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  score REAL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ═══ MISSION COMPLETIONS (BrailleQuest) ═══
CREATE TABLE IF NOT EXISTS mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  verified BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- ═══ USER BADGES ═══
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ═══ USER ACHIEVEMENTS ═══
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 1,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  UNIQUE(user_id, achievement_id)
);

-- ═══ COURSE STATISTICS (aggregated view for course creators) ═══
CREATE TABLE IF NOT EXISTS course_stats (
  course_id UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
  total_enrolled INTEGER DEFAULT 0,
  avg_progress REAL DEFAULT 0,
  avg_score REAL DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  active_this_week INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ INDEXES ═══
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_creator ON courses(creator_id);
CREATE INDEX IF NOT EXISTS idx_mission_completions_user ON mission_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_stats ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_read" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- courses
DROP POLICY IF EXISTS "courses_read" ON courses;
DROP POLICY IF EXISTS "courses_insert" ON courses;
DROP POLICY IF EXISTS "courses_update" ON courses;
DROP POLICY IF EXISTS "courses_delete" ON courses;
CREATE POLICY "courses_read" ON courses FOR SELECT USING (
  is_public = true OR creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "courses_delete" ON courses FOR DELETE USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- enrollments
DROP POLICY IF EXISTS "enrollments_read" ON enrollments;
DROP POLICY IF EXISTS "enrollments_insert" ON enrollments;
DROP POLICY IF EXISTS "enrollments_delete" ON enrollments;
DROP POLICY IF EXISTS "enrollments_update" ON enrollments;
CREATE POLICY "enrollments_read" ON enrollments FOR SELECT USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
CREATE POLICY "enrollments_insert" ON enrollments FOR INSERT WITH CHECK (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "enrollments_delete" ON enrollments FOR DELETE USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
CREATE POLICY "enrollments_update" ON enrollments FOR UPDATE USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);

-- course permissions
DROP POLICY IF EXISTS "perms_read" ON course_permissions;
DROP POLICY IF EXISTS "perms_manage" ON course_permissions;
CREATE POLICY "perms_read" ON course_permissions FOR SELECT USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
CREATE POLICY "perms_manage" ON course_permissions FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);

-- progress / completions
DROP POLICY IF EXISTS "lesson_progress_own" ON user_lesson_progress;
DROP POLICY IF EXISTS "missions_own" ON mission_completions;
DROP POLICY IF EXISTS "badges_own" ON user_badges;
DROP POLICY IF EXISTS "achievements_own" ON user_achievements;
CREATE POLICY "lesson_progress_own" ON user_lesson_progress FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "missions_own" ON mission_completions FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "badges_own" ON user_badges FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
CREATE POLICY "achievements_own" ON user_achievements FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- course stats
DROP POLICY IF EXISTS "stats_read" ON course_stats;
CREATE POLICY "stats_read" ON course_stats FOR SELECT USING (
  course_id IN (
    SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    UNION
    SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  )
);

-- ═══ UPDATED_AT TRIGGER ═══
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS courses_updated_at ON courses;
DROP TRIGGER IF EXISTS course_stats_updated_at ON course_stats;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER course_stats_updated_at BEFORE UPDATE ON course_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
