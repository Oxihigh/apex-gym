export interface RoutineExercise {
  id: string;
  name: string;
  category: 'upper' | 'lower';
  defaultSets: number;
  targetReps: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  scheduleDays?: number[]; // Array of weekday index: 0=Sun, 1=Mon, ..., 6=Sat
}

export interface LoggedSet {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  name: string;
  category: 'upper' | 'lower';
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  routineId: string;
  routineName: string;
  date: string; // ISO string
  duration: number; // in seconds
  completed: boolean;
  exercises: LoggedExercise[];
}

export interface BodyMetrics {
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  chest?: number; // in cm
  waist?: number; // in cm
  arms?: number; // in cm
  thighs?: number; // in cm;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: string; // YYYY-MM-DD
  completedDates: string[]; // YYYY-MM-DD array
}

export interface ExerciseGuide {
  name: string;
  muscleGroup: string;
  instructions: string[];
  mistakes: string[];
  tips: string[];
  category: 'upper' | 'lower';
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
}

export interface WeekSchedule {
  weekStart: string; // YYYY-MM-DD Monday date
  days: Record<number, string | null>; // 1 = Mon, ..., 7 = Sun -> routineId or null (Rest Day)
}

