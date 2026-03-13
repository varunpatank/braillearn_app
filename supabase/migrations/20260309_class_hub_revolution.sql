-- ══════════════════════════════════════════════════════════════════════
-- CLASS HUB REVOLUTION — Full-featured classroom platform
-- Meeting rooms, custom braille diagrams, Gemini-powered lessons,
-- assignments, grading, announcements, attendance, analytics
-- ══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- 1. MEETING ROOMS  (teachers create, students join)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS meeting_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  host_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  room_code TEXT UNIQUE NOT NULL,            -- short join code (e.g. "BRAILLE-4X7K")
  jitsi_room_name TEXT,                      -- Jitsi Meet room identifier
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 30,
  settings JSONB DEFAULT '{
    "muteOnJoin": true,
    "allowScreenShare": true,
    "allowChat": true,
    "recordSession": false,
    "waitingRoom": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meeting_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'attendee' CHECK (role IN ('host', 'co-host', 'attendee')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  UNIQUE(meeting_id, user_id)
);

-- ═══════════════════════════════════════
-- 2. CUSTOM BRAILLE DIAGRAMS  (teacher-created visual aids)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS braille_diagrams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  diagram_type TEXT DEFAULT 'custom' CHECK (diagram_type IN (
    'letter', 'number', 'punctuation', 'contraction', 'word', 'sentence', 'custom'
  )),
  cells JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of {dots: number[], char: string, label?: string}
  layout JSONB DEFAULT '{
    "columns": 1,
    "cellSize": "large",
    "showDotNumbers": true,
    "showLabels": true,
    "backgroundColor": "#ffffff"
  }'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 3. CUSTOM LESSONS  (teacher + Gemini AI authored)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS custom_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 30),
  category TEXT DEFAULT 'custom',
  duration INTEGER DEFAULT 15,               -- minutes
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of Exercise objects
  ai_generated BOOLEAN DEFAULT false,        -- true if Gemini created it
  ai_prompt TEXT,                             -- the prompt used to generate
  source_diagram_id UUID REFERENCES braille_diagrams(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which custom lessons are assigned to a course
CREATE TABLE IF NOT EXISTS course_custom_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES custom_lessons(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  due_date TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, lesson_id)
);

-- ═══════════════════════════════════════
-- 4. ASSIGNMENTS & GRADING
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  assignment_type TEXT DEFAULT 'exercise' CHECK (assignment_type IN (
    'exercise', 'quiz', 'reading', 'project', 'diagram', 'peer-review'
  )),
  linked_lesson_id UUID REFERENCES custom_lessons(id) ON DELETE SET NULL,
  linked_diagram_id UUID REFERENCES braille_diagrams(id) ON DELETE SET NULL,
  max_score INTEGER DEFAULT 100,
  due_date TIMESTAMPTZ,
  allow_late BOOLEAN DEFAULT true,
  resources JSONB DEFAULT '[]'::jsonb,       -- attached files / links
  settings JSONB DEFAULT '{
    "attempts": 1,
    "timeLimit": null,
    "shuffleQuestions": false,
    "showResults": true
  }'::jsonb,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content JSONB,                             -- answers, uploaded work
  file_url TEXT,                             -- uploaded file
  score REAL,
  feedback TEXT,
  graded_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'draft', 'submitted', 'graded', 'returned', 'resubmitted'
  )),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- ═══════════════════════════════════════
-- 5. CLASS ANNOUNCEMENTS & CHAT
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  pinned BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,     -- [{name, url, type}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- ═══════════════════════════════════════
-- 6. ATTENDANCE TRACKING
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  meeting_id UUID REFERENCES meeting_rooms(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(course_id, user_id, session_date)
);

-- ═══════════════════════════════════════
-- 7. STUDENT PROGRESS SNAPSHOTS (per-course tracking)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS student_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lessons_completed INTEGER DEFAULT 0,
  assignments_completed INTEGER DEFAULT 0,
  total_score REAL DEFAULT 0,
  avg_score REAL DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  skills JSONB DEFAULT '{
    "letterRecognition": 0,
    "wordReading": 0,
    "sentenceReading": 0,
    "contractions": 0,
    "speed": 0,
    "writing": 0
  }'::jsonb,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- ═══════════════════════════════════════
-- 8. CLASS ANALYTICS (aggregated daily snapshots for charts)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS class_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_enrolled INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  avg_score REAL DEFAULT 0,
  avg_progress REAL DEFAULT 0,
  completion_rate REAL DEFAULT 0,
  attendance_rate REAL DEFAULT 0,
  lessons_started INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  assignments_submitted INTEGER DEFAULT 0,
  meeting_minutes INTEGER DEFAULT 0,
  UNIQUE(course_id, snapshot_date)
);

-- ═══════════════════════════════════════
-- 9. CLASS MILESTONES & EVENTS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS class_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT DEFAULT 'milestone' CHECK (milestone_type IN (
    'milestone', 'deadline', 'exam', 'event', 'guest-speaker', 'field-trip'
  )),
  target_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 10. TUTOR PROFILES  (extended teaching profiles)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS tutor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialties TEXT[] DEFAULT '{}',           -- ['Grade 2 Braille', 'Music Notation']
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '[]'::jsonb,    -- [{day, startTime, endTime}]
  hourly_rate REAL DEFAULT 0,                -- 0 = volunteer
  is_volunteer BOOLEAN DEFAULT true,
  rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS tutor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, reviewer_id)
);

-- ═══════════════════════════════════════
-- 11. BRAILLE CENTERS  (learning locations)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS braille_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  website TEXT,
  services TEXT[] DEFAULT '{}',              -- ['classes', 'tutoring', 'equipment']
  hours JSONB DEFAULT '[]'::jsonb,           -- [{day, open, close}]
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 12. LEARNING RESOURCES  (shared course materials)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT DEFAULT 'link' CHECK (resource_type IN (
    'video', 'document', 'link', 'exercise', 'audio', 'diagram', 'pdf'
  )),
  url TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- 13. STORAGE BUCKET for class files
-- ═══════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) 
VALUES ('class-files', 'class-files', true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════
-- INDEXES  (performance)
-- ═══════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_meeting_rooms_course ON meeting_rooms(course_id);
CREATE INDEX IF NOT EXISTS idx_meeting_rooms_host ON meeting_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_meeting_rooms_status ON meeting_rooms(status);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_braille_diagrams_creator ON braille_diagrams(creator_id);
CREATE INDEX IF NOT EXISTS idx_braille_diagrams_course ON braille_diagrams(course_id);
CREATE INDEX IF NOT EXISTS idx_custom_lessons_creator ON custom_lessons(creator_id);
CREATE INDEX IF NOT EXISTS idx_custom_lessons_course ON custom_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_announcements_course ON announcements(course_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_course ON class_attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_user ON class_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_date ON class_attendance(session_date);
CREATE INDEX IF NOT EXISTS idx_student_course_progress_course ON student_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_student_course_progress_user ON student_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_class_analytics_course ON class_analytics(course_id);
CREATE INDEX IF NOT EXISTS idx_class_analytics_date ON class_analytics(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_class_milestones_course ON class_milestones(course_id);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_user ON tutor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_tutor ON tutor_reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_course ON learning_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_learning_resources_creator ON learning_resources(creator_id);

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE meeting_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE braille_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_custom_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE braille_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

-- ─── Meeting Rooms: enrolled users can see, host can manage ───
DROP POLICY IF EXISTS "meeting_rooms_read" ON meeting_rooms;
CREATE POLICY "meeting_rooms_read" ON meeting_rooms FOR SELECT USING (
  course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  OR host_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
DROP POLICY IF EXISTS "meeting_rooms_manage" ON meeting_rooms;
CREATE POLICY "meeting_rooms_manage" ON meeting_rooms FOR ALL USING (
  host_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Meeting Participants: enrolled users can see, own records manageable ───
DROP POLICY IF EXISTS "meeting_participants_read" ON meeting_participants;
CREATE POLICY "meeting_participants_read" ON meeting_participants FOR SELECT USING (
  meeting_id IN (
    SELECT id FROM meeting_rooms WHERE course_id IN (
      SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
    )
  )
);
DROP POLICY IF EXISTS "meeting_participants_own" ON meeting_participants;
CREATE POLICY "meeting_participants_own" ON meeting_participants FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Braille Diagrams: public readable, creator manages ───
DROP POLICY IF EXISTS "diagrams_read" ON braille_diagrams;
CREATE POLICY "diagrams_read" ON braille_diagrams FOR SELECT USING (
  is_public = true
  OR creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "diagrams_manage" ON braille_diagrams;
CREATE POLICY "diagrams_manage" ON braille_diagrams FOR ALL USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Custom Lessons: published ones visible to enrolled, creator manages ───
DROP POLICY IF EXISTS "custom_lessons_read" ON custom_lessons;
CREATE POLICY "custom_lessons_read" ON custom_lessons FOR SELECT USING (
  is_published = true
  OR creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "custom_lessons_manage" ON custom_lessons;
CREATE POLICY "custom_lessons_manage" ON custom_lessons FOR ALL USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Course Custom Lessons: course members can see ───
DROP POLICY IF EXISTS "course_custom_lessons_read" ON course_custom_lessons;
CREATE POLICY "course_custom_lessons_read" ON course_custom_lessons FOR SELECT USING (
  course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "course_custom_lessons_manage" ON course_custom_lessons;
CREATE POLICY "course_custom_lessons_manage" ON course_custom_lessons FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);

-- ─── Assignments: enrolled can see, course creator manages ───
DROP POLICY IF EXISTS "assignments_read" ON assignments;
CREATE POLICY "assignments_read" ON assignments FOR SELECT USING (
  course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  OR creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
DROP POLICY IF EXISTS "assignments_manage" ON assignments;
CREATE POLICY "assignments_manage" ON assignments FOR ALL USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Submissions: students see own, teachers see all for their assignments ───
DROP POLICY IF EXISTS "submissions_read" ON assignment_submissions;
CREATE POLICY "submissions_read" ON assignment_submissions FOR SELECT USING (
  student_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR assignment_id IN (SELECT id FROM assignments WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "submissions_own" ON assignment_submissions;
CREATE POLICY "submissions_own" ON assignment_submissions FOR INSERT WITH CHECK (
  student_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
DROP POLICY IF EXISTS "submissions_grade" ON assignment_submissions;
CREATE POLICY "submissions_grade" ON assignment_submissions FOR UPDATE USING (
  student_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR assignment_id IN (SELECT id FROM assignments WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);

-- ─── Announcements: enrolled members see, creator manages ───
DROP POLICY IF EXISTS "announcements_read" ON announcements;
CREATE POLICY "announcements_read" ON announcements FOR SELECT USING (
  course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  OR author_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);
DROP POLICY IF EXISTS "announcements_manage" ON announcements;
CREATE POLICY "announcements_manage" ON announcements FOR ALL USING (
  author_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Announcement Reads: own records ───
DROP POLICY IF EXISTS "announcement_reads_own" ON announcement_reads;
CREATE POLICY "announcement_reads_own" ON announcement_reads FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Attendance: enrolled can see own, teachers see all ───
DROP POLICY IF EXISTS "attendance_read" ON class_attendance;
CREATE POLICY "attendance_read" ON class_attendance FOR SELECT USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "attendance_manage" ON class_attendance;
CREATE POLICY "attendance_manage" ON class_attendance FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
  OR user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Student Progress: own + teacher of course ───
DROP POLICY IF EXISTS "progress_read" ON student_course_progress;
CREATE POLICY "progress_read" ON student_course_progress FOR SELECT USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "progress_own" ON student_course_progress;
CREATE POLICY "progress_own" ON student_course_progress FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Analytics: course creator only ───
DROP POLICY IF EXISTS "analytics_read" ON class_analytics;
CREATE POLICY "analytics_read" ON class_analytics FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "analytics_manage" ON class_analytics;
CREATE POLICY "analytics_manage" ON class_analytics FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);

-- ─── Milestones: enrolled see, creator manages ───
DROP POLICY IF EXISTS "milestones_read" ON class_milestones;
CREATE POLICY "milestones_read" ON class_milestones FOR SELECT USING (
  course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "milestones_manage" ON class_milestones;
CREATE POLICY "milestones_manage" ON class_milestones FOR ALL USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Tutor Profiles: public read, own manage ───
DROP POLICY IF EXISTS "tutors_read" ON tutor_profiles;
CREATE POLICY "tutors_read" ON tutor_profiles FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "tutors_own" ON tutor_profiles;
CREATE POLICY "tutors_own" ON tutor_profiles FOR ALL USING (
  user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Tutor Reviews: public read, reviewer manages own ───
DROP POLICY IF EXISTS "reviews_read" ON tutor_reviews;
CREATE POLICY "reviews_read" ON tutor_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews_own" ON tutor_reviews;
CREATE POLICY "reviews_own" ON tutor_reviews FOR ALL USING (
  reviewer_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ─── Braille Centers: public read, admin manage ───
DROP POLICY IF EXISTS "centers_read" ON braille_centers;
CREATE POLICY "centers_read" ON braille_centers FOR SELECT USING (is_active = true);

-- ─── Learning Resources: public readable, creator manages ───
DROP POLICY IF EXISTS "resources_read" ON learning_resources;
CREATE POLICY "resources_read" ON learning_resources FOR SELECT USING (
  is_public = true
  OR creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  OR course_id IN (SELECT course_id FROM enrollments WHERE user_id = current_setting('request.jwt.claims', true)::jsonb->>'sub')
);
DROP POLICY IF EXISTS "resources_manage" ON learning_resources;
CREATE POLICY "resources_manage" ON learning_resources FOR ALL USING (
  creator_id = current_setting('request.jwt.claims', true)::jsonb->>'sub'
);

-- ═══════════════════════════════════════
-- STORAGE POLICIES  (class-files bucket)
-- ═══════════════════════════════════════

DROP POLICY IF EXISTS "class_files_read" ON storage.objects;
CREATE POLICY "class_files_read" ON storage.objects FOR SELECT 
  USING (bucket_id = 'class-files');

DROP POLICY IF EXISTS "class_files_upload" ON storage.objects;
CREATE POLICY "class_files_upload" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'class-files');

DROP POLICY IF EXISTS "class_files_delete" ON storage.objects;
CREATE POLICY "class_files_delete" ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'class-files' 
    AND (storage.foldername(name))[1] = current_setting('request.jwt.claims', true)::jsonb->>'sub'
  );

-- ═══════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════

-- Auto-update course stats when enrollment changes
CREATE OR REPLACE FUNCTION update_course_stats_on_enrollment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO course_stats (course_id, total_enrolled, updated_at)
  VALUES (
    COALESCE(NEW.course_id, OLD.course_id),
    (SELECT COUNT(*) FROM enrollments WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)),
    NOW()
  )
  ON CONFLICT (course_id) DO UPDATE SET
    total_enrolled = (SELECT COUNT(*) FROM enrollments WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)),
    updated_at = NOW();
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enrollment_stats ON enrollments;
CREATE TRIGGER trg_enrollment_stats
  AFTER INSERT OR DELETE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_stats_on_enrollment();

-- Auto-update tutor rating when review is added
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE tutor_profiles SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM tutor_reviews WHERE tutor_id = NEW.tutor_id),
    total_reviews = (SELECT COUNT(*) FROM tutor_reviews WHERE tutor_id = NEW.tutor_id),
    updated_at = NOW()
  WHERE id = NEW.tutor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tutor_rating ON tutor_reviews;
CREATE TRIGGER trg_tutor_rating
  AFTER INSERT OR UPDATE OR DELETE ON tutor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_rating();

-- Generate daily analytics snapshot
CREATE OR REPLACE FUNCTION snapshot_class_analytics(p_course_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO class_analytics (
    course_id, snapshot_date, total_enrolled, active_students,
    avg_score, avg_progress, completion_rate, attendance_rate,
    lessons_completed, assignments_submitted
  )
  SELECT
    p_course_id,
    CURRENT_DATE,
    (SELECT COUNT(*) FROM enrollments WHERE course_id = p_course_id),
    (SELECT COUNT(*) FROM enrollments WHERE course_id = p_course_id AND last_active > NOW() - INTERVAL '7 days'),
    (SELECT COALESCE(AVG(avg_score), 0) FROM student_course_progress WHERE course_id = p_course_id),
    (SELECT COALESCE(AVG(progress_pct), 0) FROM enrollments WHERE course_id = p_course_id),
    (SELECT CASE WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE progress_pct >= 100)::REAL / COUNT(*)::REAL * 100 ELSE 0 END FROM enrollments WHERE course_id = p_course_id),
    (SELECT CASE WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE status = 'present')::REAL / COUNT(*)::REAL * 100 ELSE 0 END FROM class_attendance WHERE course_id = p_course_id AND session_date = CURRENT_DATE),
    (SELECT COALESCE(SUM(lessons_completed), 0) FROM student_course_progress WHERE course_id = p_course_id),
    (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = p_course_id) AND submitted_at::DATE = CURRENT_DATE)
  ON CONFLICT (course_id, snapshot_date) DO UPDATE SET
    total_enrolled = EXCLUDED.total_enrolled,
    active_students = EXCLUDED.active_students,
    avg_score = EXCLUDED.avg_score,
    avg_progress = EXCLUDED.avg_progress,
    completion_rate = EXCLUDED.completion_rate,
    attendance_rate = EXCLUDED.attendance_rate,
    lessons_completed = EXCLUDED.lessons_completed,
    assignments_submitted = EXCLUDED.assignments_submitted;
END;
$$ LANGUAGE plpgsql;
