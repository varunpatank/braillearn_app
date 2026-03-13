
export interface UserData {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string;
  xp: number;
  streak: number;
  missionsCompleted: string[];
  totalFinds: number;
  citiesMapped: number;
  rank: number;
  lessonsCompleted: string[];
  lessonScores: Record<string, number>;
  classesManaged: string[];
  classesCreated: string[];
  classesJoined: string[];
  badges: string[];
  achievementsUnlocked: string[];
  rewardsOwned: string[];
  lastActive: string;
  joinedDate: string;
}

const STORAGE_KEY = 'braillearn_user_data';

function getAllUsers(): Record<string, UserData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllUsers(users: Record<string, UserData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function getUserData(clerkId: string): UserData | null {
  const users = getAllUsers();
  return users[clerkId] || null;
}

export function createOrUpdateUser(clerkId: string, partial: Partial<UserData>): UserData {
  const users = getAllUsers();
  const existing = users[clerkId];
  const now = new Date().toISOString();

  const updated: UserData = {
    clerkId,
    email: partial.email || existing?.email || '',
    name: partial.name || existing?.name || '',
    avatarUrl: partial.avatarUrl || existing?.avatarUrl || '',
    xp: partial.xp ?? existing?.xp ?? 0,
    streak: partial.streak ?? existing?.streak ?? 0,
    missionsCompleted: partial.missionsCompleted || existing?.missionsCompleted || [],
    totalFinds: partial.totalFinds ?? existing?.totalFinds ?? 0,
    citiesMapped: partial.citiesMapped ?? existing?.citiesMapped ?? 0,
    rank: partial.rank ?? existing?.rank ?? 99,
    lessonsCompleted: partial.lessonsCompleted || existing?.lessonsCompleted || [],
    lessonScores: partial.lessonScores || existing?.lessonScores || {},
    classesManaged: partial.classesManaged || existing?.classesManaged || [],
    classesCreated: partial.classesCreated || existing?.classesCreated || [],
    classesJoined: partial.classesJoined || existing?.classesJoined || [],
    badges: partial.badges || existing?.badges || [],
    achievementsUnlocked: partial.achievementsUnlocked || existing?.achievementsUnlocked || [],
    rewardsOwned: partial.rewardsOwned || existing?.rewardsOwned || [],
    lastActive: now,
    joinedDate: existing?.joinedDate || now,
  };

  users[clerkId] = updated;
  saveAllUsers(users);
  return updated;
}

export function addMissionCompletion(clerkId: string, missionId: string, xpReward: number): UserData {
  const user = getUserData(clerkId);
  if (!user) return createOrUpdateUser(clerkId, { missionsCompleted: [missionId], xp: xpReward, totalFinds: 1 });

  const missions = user.missionsCompleted.includes(missionId)
    ? user.missionsCompleted
    : [...user.missionsCompleted, missionId];

  return createOrUpdateUser(clerkId, {
    missionsCompleted: missions,
    xp: user.xp + xpReward,
    totalFinds: user.totalFinds + 1,
  });
}

export function addLessonCompletion(clerkId: string, lessonId: string, score: number): UserData {
  const user = getUserData(clerkId);
  if (!user) return createOrUpdateUser(clerkId, { lessonsCompleted: [lessonId], lessonScores: { [lessonId]: score } });

  const lessons = user.lessonsCompleted.includes(lessonId)
    ? user.lessonsCompleted
    : [...user.lessonsCompleted, lessonId];

  return createOrUpdateUser(clerkId, {
    lessonsCompleted: lessons,
    lessonScores: { ...user.lessonScores, [lessonId]: score },
  });
}

export function addClassCreated(clerkId: string, classId: string): UserData {
  const user = getUserData(clerkId);
  if (!user) return createOrUpdateUser(clerkId, { classesCreated: [classId] });

  const classes = user.classesCreated.includes(classId)
    ? user.classesCreated
    : [...user.classesCreated, classId];

  return createOrUpdateUser(clerkId, { classesCreated: classes });
}

export function addClassJoined(clerkId: string, classId: string): UserData {
  const user = getUserData(clerkId);
  if (!user) return createOrUpdateUser(clerkId, { classesJoined: [classId] });

  const classes = user.classesJoined.includes(classId)
    ? user.classesJoined
    : [...user.classesJoined, classId];

  return createOrUpdateUser(clerkId, { classesJoined: classes });
}

export function getLeaderboard(): { clerkId: string; name: string; xp: number; missions: number; streak: number; avatar: string }[] {
  const users = getAllUsers();
  return Object.values(users)
    .map(u => ({
      clerkId: u.clerkId,
      name: u.name || 'Explorer',
      xp: u.xp,
      missions: u.missionsCompleted.length,
      streak: u.streak,
      avatar: u.avatarUrl,
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 50);
}