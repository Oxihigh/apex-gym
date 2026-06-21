import type { Routine, WorkoutLog, BodyMetrics, StreakData, UserProfile } from '../types';

// Helper to get local YYYY-MM-DD date string
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get local YYYY-MM-DD date string of Monday for a given Date
export function getMondayOfDate(d: Date): string {
  const temp = new Date(d.getTime());
  const day = temp.getDay();
  // Monday is day 1. If Sunday (0), offset is -6. Otherwise, offset is 1 - day.
  const diff = temp.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(temp.setDate(diff));
  return getLocalDateString(monday);
}

// Helper to get relative date offset from today
export function getRelativeDate(daysOffset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d;
}

const GLOBAL_KEYS = {
  PROFILES_LIST: 'apex_profiles_list',
  ACTIVE_PROFILE_ID: 'apex_active_profile_id',
};

// Initial default routines template
const DEFAULT_ROUTINES: Routine[] = [
  { id: 'monday', name: 'Monday', exercises: [], scheduleDays: [1] },
  { id: 'tuesday', name: 'Tuesday', exercises: [], scheduleDays: [2] },
  { id: 'wednesday', name: 'Wednesday', exercises: [], scheduleDays: [3] },
  { id: 'thursday', name: 'Thursday', exercises: [], scheduleDays: [4] },
  { id: 'friday', name: 'Friday', exercises: [], scheduleDays: [5] },
  { id: 'saturday', name: 'Saturday', exercises: [], scheduleDays: [6] },
  { id: 'sunday', name: 'Sunday', exercises: [], scheduleDays: [0] }
];

// Profile Manager
export function getProfiles(): UserProfile[] {
  const data = localStorage.getItem(GLOBAL_KEYS.PROFILES_LIST);
  return data ? JSON.parse(data) : [];
}

export function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(GLOBAL_KEYS.PROFILES_LIST, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(GLOBAL_KEYS.ACTIVE_PROFILE_ID);
}

export function setActiveProfileId(id: string | null): void {
  if (id) {
    localStorage.setItem(GLOBAL_KEYS.ACTIVE_PROFILE_ID, id);
    // Initialize profile scoped keys if first time
    initProfileDB(id);
  } else {
    localStorage.removeItem(GLOBAL_KEYS.ACTIVE_PROFILE_ID);
  }
}

export function createProfile(name: string, avatarColor: string): UserProfile {
  const profiles = getProfiles();
  const newProfile: UserProfile = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    avatarColor
  };
  
  profiles.push(newProfile);
  saveProfiles(profiles);
  setActiveProfileId(newProfile.id);
  return newProfile;
}

export function deleteProfile(profileId: string): void {
  // Remove from profiles list
  const profiles = getProfiles();
  const updated = profiles.filter(p => p.id !== profileId);
  saveProfiles(updated);

  // Clean local storage keys for this profile
  const keysToDelete = [
    `apex_profile_${profileId}_routines`,
    `apex_profile_${profileId}_logs`,
    `apex_profile_${profileId}_metrics`,
    `apex_profile_${profileId}_streaks`,
    `apex_profile_${profileId}_goal_weekly`,
    `apex_profile_${profileId}_week_schedules`
  ];
  keysToDelete.forEach(k => localStorage.removeItem(k));

  // If deleted profile was active, reset active profile
  const activeId = getActiveProfileId();
  if (activeId === profileId) {
    setActiveProfileId(updated.length > 0 ? updated[0].id : null);
  }
}

// Scoped Key Helper
function getScopedKey(subKey: string): string {
  const profileId = getActiveProfileId();
  if (!profileId) {
    return `apex_default_${subKey}`;
  }
  return `apex_profile_${profileId}_${subKey}`;
}

// Initialize specific user profile database
export function initProfileDB(profileId: string): void {
  const routinesKey = `apex_profile_${profileId}_routines`;
  const isInitialized = localStorage.getItem(routinesKey);
  
  if (!isInitialized) {
    localStorage.setItem(routinesKey, JSON.stringify(DEFAULT_ROUTINES));
    localStorage.setItem(`apex_profile_${profileId}_logs`, JSON.stringify([]));
    localStorage.setItem(`apex_profile_${profileId}_metrics`, JSON.stringify([]));
    localStorage.setItem(`apex_profile_${profileId}_streaks`, JSON.stringify({
      currentStreak: 0,
      longestStreak: 0,
      completedDates: []
    }));
    localStorage.setItem(`apex_profile_${profileId}_goal_weekly`, '4');
    localStorage.setItem(`apex_profile_${profileId}_week_schedules`, JSON.stringify({}));
  }
}

// Scoped Routines CRUD
export function getRoutines(): Routine[] {
  const key = getScopedKey('routines');
  const routinesStr = localStorage.getItem(key);
  let routines: Routine[] = routinesStr ? JSON.parse(routinesStr) : [];
  
  // Ensure we have exactly the 7 weekday routines (Monday to Sunday)
  const weekdayIds = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hasWeekdayRoutines = routines.some(r => weekdayIds.includes(r.id));
  
  if (routines.length === 0 || !hasWeekdayRoutines) {
    routines = DEFAULT_ROUTINES;
    localStorage.setItem(key, JSON.stringify(routines));
  }
  
  return routines;
}

export function saveRoutines(routines: Routine[]): void {
  const key = getScopedKey('routines');
  localStorage.setItem(key, JSON.stringify(routines));
}

// Scoped Logs CRUD
export function getWorkoutLogs(): WorkoutLog[] {
  const key = getScopedKey('logs');
  const logsStr = localStorage.getItem(key);
  return logsStr ? JSON.parse(logsStr) : [];
}

export function saveWorkoutLogs(logs: WorkoutLog[]): void {
  const key = getScopedKey('logs');
  localStorage.setItem(key, JSON.stringify(logs));
}

export function addWorkoutLog(newLog: WorkoutLog): void {
  const logs = getWorkoutLogs();
  logs.push(newLog);
  saveWorkoutLogs(logs);

  const dateStr = getLocalDateString(new Date(newLog.date));
  const streaks = getStreakData();
  
  if (!streaks.completedDates.includes(dateStr)) {
    streaks.completedDates.push(dateStr);
  }
  
  const updatedStreaks = calculateStreaks(streaks.completedDates);
  saveStreakData({
    ...updatedStreaks,
    completedDates: streaks.completedDates
  });
}

// Scoped Metrics CRUD
export function getBodyMetrics(): BodyMetrics[] {
  const key = getScopedKey('metrics');
  const metricsStr = localStorage.getItem(key);
  const data: BodyMetrics[] = metricsStr ? JSON.parse(metricsStr) : [];
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function saveBodyMetrics(metrics: BodyMetrics[]): void {
  const key = getScopedKey('metrics');
  localStorage.setItem(key, JSON.stringify(metrics));
}

export function addBodyMetric(metric: BodyMetrics): void {
  const metrics = getBodyMetrics();
  const existingIdx = metrics.findIndex(m => m.date === metric.date);
  if (existingIdx !== -1) {
    metrics[existingIdx] = metric;
  } else {
    metrics.push(metric);
  }
  saveBodyMetrics(metrics);
}

// Scoped Streak CRUD
export function getStreakData(): StreakData {
  const key = getScopedKey('streaks');
  const streakStr = localStorage.getItem(key);
  if (streakStr) {
    const parsed = JSON.parse(streakStr);
    const updated = calculateStreaks(parsed.completedDates || []);
    return {
      ...parsed,
      currentStreak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      completedDates: parsed.completedDates || []
    };
  }
  return {
    currentStreak: 0,
    longestStreak: 0,
    completedDates: []
  };
}

export function saveStreakData(data: StreakData): void {
  const key = getScopedKey('streaks');
  localStorage.setItem(key, JSON.stringify(data));
}

// Scoped Weekly Goal
export function getWeeklyGoalWorkouts(): number {
  const key = getScopedKey('goal_weekly');
  const goal = localStorage.getItem(key);
  return goal ? parseInt(goal, 10) : 4;
}

export function saveWeeklyGoalWorkouts(goal: number): void {
  const key = getScopedKey('goal_weekly');
  localStorage.setItem(key, String(goal));
}

// Backup Export & Import JSON
export function exportProfileBackup(profileId: string): string {
  const backupObject = {
    routines: JSON.parse(localStorage.getItem(`apex_profile_${profileId}_routines`) || '[]'),
    logs: JSON.parse(localStorage.getItem(`apex_profile_${profileId}_logs`) || '[]'),
    metrics: JSON.parse(localStorage.getItem(`apex_profile_${profileId}_metrics`) || '[]'),
    streaks: JSON.parse(localStorage.getItem(`apex_profile_${profileId}_streaks`) || '{"currentStreak":0,"longestStreak":0,"completedDates":[]}'),
    goalWeekly: parseInt(localStorage.getItem(`apex_profile_${profileId}_goal_weekly`) || '4', 10),
    weekSchedules: JSON.parse(localStorage.getItem(`apex_profile_${profileId}_week_schedules`) || '{}')
  };
  return JSON.stringify(backupObject, null, 2);
}

export function importProfileBackup(profileId: string, jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return false;
    
    // Validate structural requirements
    if (!Array.isArray(parsed.routines) || !Array.isArray(parsed.logs) || !Array.isArray(parsed.metrics)) {
      return false;
    }

    localStorage.setItem(`apex_profile_${profileId}_routines`, JSON.stringify(parsed.routines));
    localStorage.setItem(`apex_profile_${profileId}_logs`, JSON.stringify(parsed.logs));
    localStorage.setItem(`apex_profile_${profileId}_metrics`, JSON.stringify(parsed.metrics));
    localStorage.setItem(`apex_profile_${profileId}_streaks`, JSON.stringify(parsed.streaks || {
      currentStreak: 0,
      longestStreak: 0,
      completedDates: []
    }));
    localStorage.setItem(`apex_profile_${profileId}_goal_weekly`, String(parsed.goalWeekly || 4));
    localStorage.setItem(`apex_profile_${profileId}_week_schedules`, JSON.stringify(parsed.weekSchedules || {}));
    
    return true;
  } catch (e) {
    console.error('Backup import parsing failed:', e);
    return false;
  }
}

// Scoped Week Schedules CRUD
export function getWeekSchedules(): Record<string, Record<number, string | null>> {
  const key = getScopedKey('week_schedules');
  const schedulesStr = localStorage.getItem(key);
  return schedulesStr ? JSON.parse(schedulesStr) : {};
}

export function saveWeekSchedules(schedules: Record<string, Record<number, string | null>>): void {
  const key = getScopedKey('week_schedules');
  localStorage.setItem(key, JSON.stringify(schedules));
}

export function saveWeekSchedule(weekStart: string, days: Record<number, string | null>): void {
  const schedules = getWeekSchedules();
  schedules[weekStart] = days;
  saveWeekSchedules(schedules);
}

export function getWeekScheduleForDate(weekStart: string): Record<number, string | null> {
  const schedules = getWeekSchedules();
  if (schedules[weekStart]) {
    return schedules[weekStart];
  }
  const dates = Object.keys(schedules).sort();
  const pastDates = dates.filter(d => d <= weekStart);
  if (pastDates.length > 0) {
    const latestPastDate = pastDates[pastDates.length - 1];
    return schedules[latestPastDate];
  }
  return {
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
    0: 'sunday'
  };
}

// Core algorithm to calculate streaks based on array of completed dates
export function calculateStreaks(completedDates: string[]): { currentStreak: number; longestStreak: number } {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // De-duplicate and sort ascending
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  
  let longest = 0;
  let tempStreak = 0;
  
  if (uniqueDates.length > 0) {
    tempStreak = 1;
    longest = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1] + 'T00:00:00');
      const curr = new Date(uniqueDates[i] + 'T00:00:00');
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
      if (tempStreak > longest) {
        longest = tempStreak;
      }
    }
  }

  let current = 0;
  const todayStr = getLocalDateString(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  const hasToday = uniqueDates.includes(todayStr);
  const hasYesterday = uniqueDates.includes(yesterdayStr);
  
  if (hasToday || hasYesterday) {
    let activeDateStr = hasToday ? todayStr : yesterdayStr;
    current = 1;
    
    let activeDate = new Date(activeDateStr + 'T00:00:00');
    
    while (true) {
      activeDate.setDate(activeDate.getDate() - 1);
      const prevExpectedStr = getLocalDateString(activeDate);
      if (uniqueDates.includes(prevExpectedStr)) {
        current++;
      } else {
        break;
      }
    }
  } else {
    current = 0;
  }
  
  return {
    currentStreak: current,
    longestStreak: Math.max(longest, current)
  };
}

export function getWorkoutsCompletedThisWeek(): number {
  const logs = getWorkoutLogs();
  const now = new Date();
  
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  const startOfWeekTime = monday.getTime();
  
  return logs.filter(log => {
    if (!log.completed) return false;
    const logDate = new Date(log.date).getTime();
    return logDate >= startOfWeekTime;
  }).length;
}
