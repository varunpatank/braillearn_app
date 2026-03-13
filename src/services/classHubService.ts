import { SupabaseClient } from '@supabase/supabase-js'

export interface MeetingRoom {
  id: string
  course_id: string
  host_id: string
  title: string
  description: string | null
  room_code: string
  jitsi_room_name: string | null
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  max_participants: number
  settings: Record<string, unknown>
  created_at: string
}

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  role: 'host' | 'co-host' | 'attendee'
  joined_at: string
  left_at: string | null
  duration_seconds: number
}

export interface BrailleDiagram {
  id: string
  creator_id: string
  course_id: string | null
  title: string
  description: string | null
  diagram_type: string
  cells: Array<{ dots: number[]; char: string; label?: string }>
  layout: Record<string, unknown>
  tags: string[]
  is_public: boolean
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface CustomLesson {
  id: string
  creator_id: string
  course_id: string | null
  title: string
  description: string | null
  level: number
  category: string
  duration: number
  exercises: unknown[]
  ai_generated: boolean
  ai_prompt: string | null
  source_diagram_id: string | null
  is_published: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  course_id: string
  creator_id: string
  title: string
  instructions: string | null
  assignment_type: string
  linked_lesson_id: string | null
  linked_diagram_id: string | null
  max_score: number
  due_date: string | null
  allow_late: boolean
  resources: unknown[]
  settings: Record<string, unknown>
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  content: unknown
  file_url: string | null
  score: number | null
  feedback: string | null
  graded_by: string | null
  graded_at: string | null
  status: string
  submitted_at: string
}

export interface Announcement {
  id: string
  course_id: string
  author_id: string
  title: string
  content: string
  priority: string
  pinned: boolean
  attachments: unknown[]
  created_at: string
  updated_at: string
}

export interface TutorProfile {
  id: string
  user_id: string
  specialties: string[]
  bio: string | null
  experience_years: number
  certifications: string[]
  availability: unknown[]
  hourly_rate: number
  is_volunteer: boolean
  rating: number
  total_reviews: number
  total_students: number
  total_sessions: number
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: { display_name: string; avatar_url: string; email: string }
}

export interface ClassAttendance {
  id: string
  course_id: string
  user_id: string
  session_date: string
  status: string
  check_in_time: string
  check_out_time: string | null
}

export interface StudentCourseProgress {
  id: string
  course_id: string
  user_id: string
  lessons_completed: number
  assignments_completed: number
  total_score: number
  avg_score: number
  time_spent_seconds: number
  current_streak: number
  skills: Record<string, number>
  last_activity_at: string
  profile?: { display_name: string; avatar_url: string }
}

export interface ClassAnalytics {
  id: string
  course_id: string
  snapshot_date: string
  total_enrolled: number
  active_students: number
  avg_score: number
  avg_progress: number
  completion_rate: number
  attendance_rate: number
  lessons_completed: number
  assignments_submitted: number
  meeting_minutes: number
}

export interface ClassMilestone {
  id: string
  course_id: string
  creator_id: string
  title: string
  description: string | null
  milestone_type: string
  target_date: string
  completed: boolean
  completed_at: string | null
  created_at: string
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'BRL-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function createMeetingRoom(
  sb: SupabaseClient,
  room: { course_id: string; host_id: string; title: string; description?: string; scheduled_at?: string }
): Promise<MeetingRoom | null> {
  const code = generateRoomCode()
  const jitsiName = `braillearn-${code}-${Date.now()}`.toLowerCase()
  const { data, error } = await sb.from('meeting_rooms').insert({
    ...room,
    room_code: code,
    jitsi_room_name: jitsiName,
    status: room.scheduled_at ? 'scheduled' : 'live',
    started_at: room.scheduled_at ? null : new Date().toISOString(),
  }).select().single()
  if (error) { console.error('[hub] createMeetingRoom:', error); return null }
  return data
}

export async function getMeetingRooms(sb: SupabaseClient, courseId: string): Promise<MeetingRoom[]> {
  const { data, error } = await sb.from('meeting_rooms').select('*').eq('course_id', courseId).order('created_at', { ascending: false })
  if (error) { console.error('[hub] getMeetingRooms:', error); return [] }
  return data || []
}

export async function getLiveMeetings(sb: SupabaseClient, courseId?: string): Promise<MeetingRoom[]> {
  let q = sb.from('meeting_rooms').select('*').eq('status', 'live')
  if (courseId) q = q.eq('course_id', courseId)
  const { data, error } = await q.order('started_at', { ascending: false })
  if (error) { console.error('[hub] getLiveMeetings:', error); return [] }
  return data || []
}

export async function startMeeting(sb: SupabaseClient, roomId: string): Promise<MeetingRoom | null> {
  const { data, error } = await sb.from('meeting_rooms').update({ status: 'live', started_at: new Date().toISOString() }).eq('id', roomId).select().single()
  if (error) { console.error('[hub] startMeeting:', error); return null }
  return data
}

export async function endMeeting(sb: SupabaseClient, roomId: string): Promise<boolean> {
  const { error } = await sb.from('meeting_rooms').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', roomId)
  if (error) { console.error('[hub] endMeeting:', error); return false }
  return true
}

export async function joinMeeting(sb: SupabaseClient, meetingId: string, userId: string, role: 'host' | 'co-host' | 'attendee' = 'attendee'): Promise<boolean> {
  const { error } = await sb.from('meeting_participants').upsert({ meeting_id: meetingId, user_id: userId, role }, { onConflict: 'meeting_id,user_id' })
  if (error) { console.error('[hub] joinMeeting:', error); return false }
  return true
}

export async function leaveMeeting(sb: SupabaseClient, meetingId: string, userId: string): Promise<boolean> {
  const { error } = await sb.from('meeting_participants').update({ left_at: new Date().toISOString() }).eq('meeting_id', meetingId).eq('user_id', userId)
  if (error) { console.error('[hub] leaveMeeting:', error); return false }
  return true
}

export async function createDiagram(
  sb: SupabaseClient,
  diagram: Omit<BrailleDiagram, 'id' | 'created_at' | 'updated_at'>
): Promise<BrailleDiagram | null> {
  const { data, error } = await sb.from('braille_diagrams').insert(diagram).select().single()
  if (error) { console.error('[hub] createDiagram:', error); return null }
  return data
}

export async function getMyDiagrams(sb: SupabaseClient, userId: string): Promise<BrailleDiagram[]> {
  const { data, error } = await sb.from('braille_diagrams').select('*').eq('creator_id', userId).order('created_at', { ascending: false })
  if (error) { console.error('[hub] getMyDiagrams:', error); return [] }
  return data || []
}

export async function getCourseDiagrams(sb: SupabaseClient, courseId: string): Promise<BrailleDiagram[]> {
  const { data, error } = await sb.from('braille_diagrams').select('*').eq('course_id', courseId).order('created_at', { ascending: false })
  if (error) { console.error('[hub] getCourseDiagrams:', error); return [] }
  return data || []
}

export async function updateDiagram(sb: SupabaseClient, id: string, updates: Partial<BrailleDiagram>): Promise<BrailleDiagram | null> {
  const { data, error } = await sb.from('braille_diagrams').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) { console.error('[hub] updateDiagram:', error); return null }
  return data
}

export async function deleteDiagram(sb: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await sb.from('braille_diagrams').delete().eq('id', id)
  if (error) { console.error('[hub] deleteDiagram:', error); return false }
  return true
}

export async function createCustomLesson(
  sb: SupabaseClient,
  lesson: Omit<CustomLesson, 'id' | 'created_at' | 'updated_at'>
): Promise<CustomLesson | null> {
  const { data, error } = await sb.from('custom_lessons').insert(lesson).select().single()
  if (error) { console.error('[hub] createCustomLesson:', error); return null }
  return data
}

export async function getMyCustomLessons(sb: SupabaseClient, userId: string): Promise<CustomLesson[]> {
  const { data, error } = await sb.from('custom_lessons').select('*').eq('creator_id', userId).order('created_at', { ascending: false })
  if (error) { console.error('[hub] getMyCustomLessons:', error); return [] }
  return data || []
}

export async function updateCustomLesson(sb: SupabaseClient, id: string, updates: Partial<CustomLesson>): Promise<CustomLesson | null> {
  const { data, error } = await sb.from('custom_lessons').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) { console.error('[hub] updateCustomLesson:', error); return null }
  return data
}

export async function deleteCustomLesson(sb: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await sb.from('custom_lessons').delete().eq('id', id)
  if (error) { console.error('[hub] deleteCustomLesson:', error); return false }
  return true
}

export async function assignLessonToCourse(sb: SupabaseClient, courseId: string, lessonId: string, order: number, dueDate?: string): Promise<boolean> {
  const { error } = await sb.from('course_custom_lessons').upsert({ course_id: courseId, lesson_id: lessonId, order_index: order, due_date: dueDate }, { onConflict: 'course_id,lesson_id' })
  if (error) { console.error('[hub] assignLessonToCourse:', error); return false }
  return true
}

export async function createAssignment(
  sb: SupabaseClient,
  assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
): Promise<Assignment | null> {
  const { data, error } = await sb.from('assignments').insert(assignment).select().single()
  if (error) { console.error('[hub] createAssignment:', error); return null }
  return data
}

export async function getCourseAssignments(sb: SupabaseClient, courseId: string): Promise<Assignment[]> {
  const { data, error } = await sb.from('assignments').select('*').eq('course_id', courseId).order('created_at', { ascending: false })
  if (error) { console.error('[hub] getCourseAssignments:', error); return [] }
  return data || []
}

export async function submitAssignment(sb: SupabaseClient, submission: { assignment_id: string; student_id: string; content: unknown; file_url?: string }): Promise<boolean> {
  const { error } = await sb.from('assignment_submissions').upsert({ ...submission, status: 'submitted' }, { onConflict: 'assignment_id,student_id' })
  if (error) { console.error('[hub] submitAssignment:', error); return false }
  return true
}

export async function gradeSubmission(sb: SupabaseClient, submissionId: string, score: number, feedback: string, gradedBy: string): Promise<boolean> {
  const { error } = await sb.from('assignment_submissions').update({ score, feedback, graded_by: gradedBy, graded_at: new Date().toISOString(), status: 'graded' }).eq('id', submissionId)
  if (error) { console.error('[hub] gradeSubmission:', error); return false }
  return true
}

export async function getSubmissions(sb: SupabaseClient, assignmentId: string): Promise<AssignmentSubmission[]> {
  const { data, error } = await sb.from('assignment_submissions').select('*').eq('assignment_id', assignmentId)
  if (error) { console.error('[hub] getSubmissions:', error); return [] }
  return data || []
}

export async function createAnnouncement(
  sb: SupabaseClient,
  ann: { course_id: string; author_id: string; title: string; content: string; priority?: string; pinned?: boolean }
): Promise<Announcement | null> {
  const { data, error } = await sb.from('announcements').insert(ann).select().single()
  if (error) { console.error('[hub] createAnnouncement:', error); return null }
  return data
}

export async function getCourseAnnouncements(sb: SupabaseClient, courseId: string): Promise<Announcement[]> {
  const { data, error } = await sb.from('announcements').select('*').eq('course_id', courseId).order('pinned', { ascending: false }).order('created_at', { ascending: false })
  if (error) { console.error('[hub] getCourseAnnouncements:', error); return [] }
  return data || []
}

export async function deleteAnnouncement(sb: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await sb.from('announcements').delete().eq('id', id)
  if (error) { console.error('[hub] deleteAnnouncement:', error); return false }
  return true
}

export async function becomeTutor(
  sb: SupabaseClient,
  userId: string,
  data: { specialties?: string[]; bio?: string; certifications?: string[] }
): Promise<TutorProfile | null> {
  await sb.from('profiles').update({ role: 'teacher' }).eq('id', userId)
  const { data: tp, error } = await sb.from('tutor_profiles').upsert({
    user_id: userId,
    specialties: data.specialties || [],
    bio: data.bio || '',
    certifications: data.certifications || [],
    is_volunteer: true,
    is_active: true,
  }, { onConflict: 'user_id' }).select().single()
  if (error) { console.error('[hub] becomeTutor:', error); return null }
  return tp
}

export async function getTutors(sb: SupabaseClient): Promise<TutorProfile[]> {
  const { data, error } = await sb.from('tutor_profiles').select('*, profile:profiles(display_name, avatar_url, email)').eq('is_active', true).order('rating', { ascending: false })
  if (error) { console.error('[hub] getTutors:', error); return [] }
  return data || []
}

export async function getMyTutorProfile(sb: SupabaseClient, userId: string): Promise<TutorProfile | null> {
  const { data, error } = await sb.from('tutor_profiles').select('*, profile:profiles(display_name, avatar_url, email)').eq('user_id', userId).maybeSingle()
  if (error) { console.error('[hub] getMyTutorProfile:', error); return null }
  return data
}

export async function updateTutorProfile(sb: SupabaseClient, userId: string, updates: Partial<TutorProfile>): Promise<TutorProfile | null> {
  const { data, error } = await sb.from('tutor_profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single()
  if (error) { console.error('[hub] updateTutorProfile:', error); return null }
  return data
}

export async function checkIn(sb: SupabaseClient, courseId: string, userId: string, meetingId?: string): Promise<boolean> {
  const { error } = await sb.from('class_attendance').upsert({
    course_id: courseId,
    user_id: userId,
    session_date: new Date().toISOString().split('T')[0],
    status: 'present',
    meeting_id: meetingId || null,
  }, { onConflict: 'course_id,user_id,session_date' })
  if (error) { console.error('[hub] checkIn:', error); return false }
  return true
}

export async function getCourseAttendance(sb: SupabaseClient, courseId: string): Promise<ClassAttendance[]> {
  const { data, error } = await sb.from('class_attendance').select('*').eq('course_id', courseId).order('session_date', { ascending: false })
  if (error) { console.error('[hub] getCourseAttendance:', error); return [] }
  return data || []
}

export async function getStudentProgress(sb: SupabaseClient, courseId: string): Promise<StudentCourseProgress[]> {
  const { data, error } = await sb.from('student_course_progress').select('*, profile:profiles(display_name, avatar_url)').eq('course_id', courseId).order('avg_score', { ascending: false })
  if (error) { console.error('[hub] getStudentProgress:', error); return [] }
  return data || []
}

export async function updateStudentProgress(sb: SupabaseClient, courseId: string, userId: string, updates: Partial<StudentCourseProgress>): Promise<boolean> {
  const { error } = await sb.from('student_course_progress').upsert({
    course_id: courseId,
    user_id: userId,
    ...updates,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'course_id,user_id' })
  if (error) { console.error('[hub] updateStudentProgress:', error); return false }
  return true
}

export async function getCourseAnalytics(sb: SupabaseClient, courseId: string, days = 30): Promise<ClassAnalytics[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await sb.from('class_analytics').select('*').eq('course_id', courseId).gte('snapshot_date', since.toISOString().split('T')[0]).order('snapshot_date')
  if (error) { console.error('[hub] getCourseAnalytics:', error); return [] }
  return data || []
}

export async function createMilestone(
  sb: SupabaseClient,
  ms: { course_id: string; creator_id: string; title: string; description?: string; milestone_type?: string; target_date: string }
): Promise<ClassMilestone | null> {
  const { data, error } = await sb.from('class_milestones').insert(ms).select().single()
  if (error) { console.error('[hub] createMilestone:', error); return null }
  return data
}

export async function getCourseMilestones(sb: SupabaseClient, courseId: string): Promise<ClassMilestone[]> {
  const { data, error } = await sb.from('class_milestones').select('*').eq('course_id', courseId).order('target_date')
  if (error) { console.error('[hub] getCourseMilestones:', error); return [] }
  return data || []
}

export async function completeMilestone(sb: SupabaseClient, id: string): Promise<boolean> {
  const { error } = await sb.from('class_milestones').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', id)
  if (error) { console.error('[hub] completeMilestone:', error); return false }
  return true
}