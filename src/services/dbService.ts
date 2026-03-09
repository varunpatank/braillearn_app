import { SupabaseClient } from '@supabase/supabase-js'

// ═══ Types ═══

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  xp: number
  streak: number
  rank: number
  total_finds: number
  cities_mapped: number
  lessons_completed: number
  role: 'student' | 'teacher' | 'admin'
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  creator_id: string
  title: string
  description: string | null
  image_url: string | null
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string | null
  is_public: boolean
  max_students: number
  tags: string[]
  curriculum: unknown[]
  meeting_link: string | null
  schedule: Record<string, unknown> | null
  created_at: string
  updated_at: string
  // joined fields
  creator?: Profile
  enrollment_count?: number
}

export interface Enrollment {
  id: string
  course_id: string
  user_id: string
  role: 'student' | 'teacher' | 'assistant' | 'auditor'
  enrolled_at: string
  progress_pct: number
  completed_lessons: string[]
  last_active: string | null
  // joined
  course?: Course
  profile?: Profile
}

export interface CourseStats {
  course_id: string
  total_enrolled: number
  avg_progress: number
  avg_score: number
  completion_rate: number
  active_this_week: number
  updated_at: string
}

export interface MissionCompletion {
  id: string
  user_id: string
  mission_id: string
  xp_earned: number
  image_url: string | null
  latitude: number | null
  longitude: number | null
  verified: boolean
  completed_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string | null
  score: number
  completed: boolean
  time_spent_seconds: number
  attempts: number
  completed_at: string | null
  created_at: string
}

// ═══ Profile Operations ═══

export async function upsertProfile(
  supabase: SupabaseClient,
  profile: { id: string; email?: string | null; display_name?: string | null; avatar_url?: string | null }
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      email: profile.email,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
    }, { onConflict: 'id' })
    .select()
    .single()

  if (error) { console.error('[db] upsertProfile error:', error); return null }
  return data
}

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) { console.error('[db] getProfile error:', error); return null }
  return data
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'xp' | 'streak' | 'rank' | 'total_finds' | 'cities_mapped' | 'lessons_completed' | 'role' | 'preferences'>>
): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) { console.error('[db] updateProfile error:', error); return null }
  return data
}

export async function addXP(supabase: SupabaseClient, userId: string, amount: number): Promise<void> {
  const profile = await getProfile(supabase, userId)
  if (!profile) return
  await supabase.from('profiles').update({ xp: profile.xp + amount }).eq('id', userId)
}

// ═══ Leaderboard ═══

export async function getLeaderboard(supabase: SupabaseClient, limit = 20): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(limit)
  if (error) { console.error('[db] getLeaderboard error:', error); return [] }
  return data || []
}

// ═══ Course Operations ═══

export async function createCourse(
  supabase: SupabaseClient,
  course: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'creator' | 'enrollment_count'>
): Promise<Course | null> {
  const { data, error } = await supabase.from('courses').insert(course).select().single()
  if (error) { console.error('[db] createCourse error:', error); return null }
  return data
}

export async function getCourse(supabase: SupabaseClient, courseId: string): Promise<Course | null> {
  const { data, error } = await supabase.from('courses').select('*, creator:profiles(*)').eq('id', courseId).single()
  if (error) { console.error('[db] getCourse error:', error); return null }
  return data
}

export async function getMyCourses(supabase: SupabaseClient, userId: string): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select('*').eq('creator_id', userId).order('created_at', { ascending: false })
  if (error) { console.error('[db] getMyCourses error:', error); return [] }
  return data || []
}

export async function getPublicCourses(supabase: SupabaseClient, limit = 50): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select('*').eq('is_public', true).order('created_at', { ascending: false }).limit(limit)
  if (error) { console.error('[db] getPublicCourses error:', error); return [] }
  return data || []
}

export async function updateCourse(
  supabase: SupabaseClient,
  courseId: string,
  updates: Partial<Pick<Course, 'title' | 'description' | 'image_url' | 'level' | 'category' | 'is_public' | 'max_students' | 'tags' | 'curriculum' | 'meeting_link' | 'schedule'>>
): Promise<Course | null> {
  const { data, error } = await supabase.from('courses').update(updates).eq('id', courseId).select().single()
  if (error) { console.error('[db] updateCourse error:', error); return null }
  return data
}

export async function deleteCourse(supabase: SupabaseClient, courseId: string): Promise<boolean> {
  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  if (error) { console.error('[db] deleteCourse error:', error); return false }
  return true
}

// ═══ Enrollment Operations ═══

export async function enrollInCourse(
  supabase: SupabaseClient,
  courseId: string,
  userId: string,
  role: Enrollment['role'] = 'student'
): Promise<Enrollment | null> {
  const { data, error } = await supabase.from('enrollments').upsert({
    course_id: courseId,
    user_id: userId,
    role,
  }, { onConflict: 'course_id,user_id' }).select().single()
  if (error) { console.error('[db] enrollInCourse error:', error); return null }
  return data
}

export async function unenrollFromCourse(supabase: SupabaseClient, courseId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from('enrollments').delete().eq('course_id', courseId).eq('user_id', userId)
  if (error) { console.error('[db] unenrollFromCourse error:', error); return false }
  return true
}

export async function getCourseEnrollments(supabase: SupabaseClient, courseId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase.from('enrollments').select('*, profile:profiles(*)').eq('course_id', courseId).order('enrolled_at', { ascending: false })
  if (error) { console.error('[db] getCourseEnrollments error:', error); return [] }
  return data || []
}

export async function getMyEnrollments(supabase: SupabaseClient, userId: string): Promise<Enrollment[]> {
  const { data, error } = await supabase.from('enrollments').select('*, course:courses(*)').eq('user_id', userId).order('enrolled_at', { ascending: false })
  if (error) { console.error('[db] getMyEnrollments error:', error); return [] }
  return data || []
}

export async function updateEnrollmentProgress(
  supabase: SupabaseClient,
  courseId: string,
  userId: string,
  progressPct: number,
  completedLessons: string[]
): Promise<void> {
  await supabase.from('enrollments').update({
    progress_pct: progressPct,
    completed_lessons: completedLessons,
    last_active: new Date().toISOString(),
  }).eq('course_id', courseId).eq('user_id', userId)
}

// ═══ Course Permissions ═══

export async function grantPermission(
  supabase: SupabaseClient,
  courseId: string,
  userId: string,
  permissions: { can_edit?: boolean; can_manage_students?: boolean; can_view_stats?: boolean; can_grade?: boolean },
  grantedBy: string
): Promise<boolean> {
  const { error } = await supabase.from('course_permissions').upsert({
    course_id: courseId,
    user_id: userId,
    ...permissions,
    granted_by: grantedBy,
  }, { onConflict: 'course_id,user_id' })
  if (error) { console.error('[db] grantPermission error:', error); return false }
  return true
}

export async function getUserPermissions(supabase: SupabaseClient, courseId: string, userId: string) {
  const { data, error } = await supabase.from('course_permissions').select('*').eq('course_id', courseId).eq('user_id', userId).single()
  if (error) return null
  return data
}

// ═══ Course Stats ═══

export async function getCourseStats(supabase: SupabaseClient, courseId: string): Promise<CourseStats | null> {
  const { data, error } = await supabase.from('course_stats').select('*').eq('course_id', courseId).single()
  if (error) return null
  return data
}

// ═══ Mission Completions ═══

export async function completeMission(
  supabase: SupabaseClient,
  userId: string,
  missionId: string,
  xpEarned: number,
  imageUrl?: string,
  coords?: { latitude: number; longitude: number }
): Promise<MissionCompletion | null> {
  const { data, error } = await supabase.from('mission_completions').upsert({
    user_id: userId,
    mission_id: missionId,
    xp_earned: xpEarned,
    image_url: imageUrl || null,
    latitude: coords?.latitude || null,
    longitude: coords?.longitude || null,
    verified: true,
  }, { onConflict: 'user_id,mission_id' }).select().single()

  if (error) { console.error('[db] completeMission error:', error); return null }

  // Also add XP to profile
  await addXP(supabase, userId, xpEarned)

  return data
}

export async function getUserMissions(supabase: SupabaseClient, userId: string): Promise<MissionCompletion[]> {
  const { data, error } = await supabase.from('mission_completions').select('*').eq('user_id', userId).order('completed_at', { ascending: false })
  if (error) { console.error('[db] getUserMissions error:', error); return [] }
  return data || []
}

// ═══ Lesson Progress ═══

export async function upsertLessonProgress(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string,
  updates: { score?: number; completed?: boolean; time_spent_seconds?: number; course_id?: string }
): Promise<LessonProgress | null> {
  const { data, error } = await supabase.from('user_lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    ...updates,
    completed_at: updates.completed ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,lesson_id' }).select().single()

  if (error) { console.error('[db] upsertLessonProgress error:', error); return null }
  return data
}

export async function getUserLessonProgress(supabase: SupabaseClient, userId: string): Promise<LessonProgress[]> {
  const { data, error } = await supabase.from('user_lesson_progress').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) { console.error('[db] getUserLessonProgress error:', error); return [] }
  return data || []
}

// ═══ Badges & Achievements ═══

export async function awardBadge(supabase: SupabaseClient, userId: string, badgeId: string): Promise<boolean> {
  const { error } = await supabase.from('user_badges').upsert({ user_id: userId, badge_id: badgeId }, { onConflict: 'user_id,badge_id' })
  if (error) { console.error('[db] awardBadge error:', error); return false }
  return true
}

export async function getUserBadges(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('user_badges').select('badge_id').eq('user_id', userId)
  if (error) return []
  return (data || []).map(b => b.badge_id)
}

export async function updateAchievementProgress(
  supabase: SupabaseClient,
  userId: string,
  achievementId: string,
  progress: number,
  maxProgress: number
): Promise<void> {
  await supabase.from('user_achievements').upsert({
    user_id: userId,
    achievement_id: achievementId,
    progress,
    max_progress: maxProgress,
    unlocked: progress >= maxProgress,
    unlocked_at: progress >= maxProgress ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,achievement_id' })
}

export async function getUserAchievements(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.from('user_achievements').select('*').eq('user_id', userId)
  if (error) return []
  return data || []
}

// ═══ User Study Plans ═══

export interface UserStudyPlanRow {
  id: string
  user_id: string
  study_plan: Record<string, unknown>
  weekly_schedule: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function saveStudyPlan(
  supabase: SupabaseClient,
  userId: string,
  studyPlan: unknown,
  weeklySchedule: unknown | null
): Promise<UserStudyPlanRow | null> {
  const { data, error } = await supabase
    .from('user_study_plans')
    .upsert({
      user_id: userId,
      study_plan: studyPlan,
      weekly_schedule: weeklySchedule,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) { console.error('[db] saveStudyPlan error:', error); return null }
  return data
}

export async function getStudyPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<UserStudyPlanRow | null> {
  const { data, error } = await supabase
    .from('user_study_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') console.error('[db] getStudyPlan error:', error) // PGRST116 = no rows
    return null
  }
  return data
}

export async function deleteStudyPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_study_plans')
    .delete()
    .eq('user_id', userId)

  if (error) { console.error('[db] deleteStudyPlan error:', error); return false }
  return true
}
