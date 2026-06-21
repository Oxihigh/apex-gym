import React, { useState, useEffect } from 'react';
import { Flame, Scale, Trophy, Calendar, Sparkles, ChevronRight, Settings, X, Download, Upload } from 'lucide-react';
import { 
  getStreakData, getWorkoutLogs, getBodyMetrics, 
  getWorkoutsCompletedThisWeek, getWeeklyGoalWorkouts, saveWeeklyGoalWorkouts,
  getRoutines, getActiveProfileId, getProfiles, exportProfileBackup, importProfileBackup,
  getLocalDateString, getMondayOfDate, getWeekScheduleForDate
} from '../utils/db';
import type { WorkoutLog, BodyMetrics, Routine } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [metrics, setMetrics] = useState<BodyMetrics[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState(4);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState('4');

  // Profile resolution
  const [profileName, setProfileName] = useState('Athlete');
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLogs(getWorkoutLogs());
    setMetrics(getBodyMetrics());
    setRoutines(getRoutines());
    setWeeklyCompleted(getWorkoutsCompletedThisWeek());
    setWeeklyGoal(getWeeklyGoalWorkouts());
    
    const streaks = getStreakData();
    setStreak({
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak
    });

    const activeId = getActiveProfileId();
    setActiveProfileId(activeId);
    if (activeId) {
      const profiles = getProfiles();
      const current = profiles.find(p => p.id === activeId);
      if (current) {
        setProfileName(current.name);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(tempGoal, 10);
    if (parsed > 0 && parsed <= 7) {
      setWeeklyGoal(parsed);
      saveWeeklyGoalWorkouts(parsed);
      setShowGoalModal(false);
    }
  };

  // 1. Detect Weekday and suggest plan
  const getWeekdaySuggestion = () => {
    const todayIdx = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdays[todayIdx];
    
    // Check Weekly Calendar Schedules first
    const todayMonday = getMondayOfDate(new Date());
    const thisWeekSched = getWeekScheduleForDate(todayMonday);
    
    if (thisWeekSched && thisWeekSched[todayIdx] !== undefined) {
      const scheduledRoutineId = thisWeekSched[todayIdx];
      if (scheduledRoutineId) {
        const foundRoutine = routines.find(r => r.id === scheduledRoutineId);
        if (foundRoutine) {
          return {
            isRest: false,
            message: `Today is ${todayName}. Coach suggests scheduled workout: ${foundRoutine.name}!`,
            routineId: foundRoutine.id,
            routineName: foundRoutine.name
          };
        }
      } else {
        // null means Rest Day
        // For fallback routeId when starting a workout from dashboard button on rest day, find next ordered or routines[0]
        const defaultOrder = ['push-day', 'pull-day', 'leg-day'];
        let nextInRotation = routines[0] || { id: 'push-day', name: 'Push Day' };
        const completedLogs = [...logs]
          .filter(l => l.completed)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (completedLogs.length > 0) {
          const lastRoutineId = completedLogs[0].routineId;
          const lastIdx = defaultOrder.indexOf(lastRoutineId);
          if (lastIdx !== -1 && lastIdx < defaultOrder.length - 1) {
            const nextId = defaultOrder[lastIdx + 1];
            const actualNext = routines.find(r => r.id === nextId);
            if (actualNext) nextInRotation = actualNext;
          }
        }
        return {
          isRest: true,
          message: `Today is ${todayName}. Coach notes: Scheduled Rest Day!`,
          routineId: nextInRotation.id,
          routineName: nextInRotation.name
        };
      }
    }
    
    // Fallback: Find routines scheduled for today in static default config
    const scheduledRoutines = routines.filter(r => r.scheduleDays?.includes(todayIdx));
    
    if (scheduledRoutines.length > 0) {
      const names = scheduledRoutines.map(r => r.name).join(' & ');
      return {
        isRest: false,
        message: `Today is ${todayName}. Coach suggests: ${names}!`,
        routineId: scheduledRoutines[0].id,
        routineName: scheduledRoutines[0].name
      };
    }

    // Fallback if no routine is scheduled for today: suggest the next one in rotation
    const defaultOrder = ['push-day', 'pull-day', 'leg-day'];
    let nextInRotation = { id: 'push-day', name: 'Push Day' };
    
    const completedLogs = [...logs]
      .filter(l => l.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    if (completedLogs.length > 0) {
      const lastRoutineId = completedLogs[0].routineId;
      const lastIdx = defaultOrder.indexOf(lastRoutineId);
      if (lastIdx !== -1 && lastIdx < defaultOrder.length - 1) {
        const nextId = defaultOrder[lastIdx + 1];
        const names: Record<string, string> = { 'push-day': 'Push Day', 'pull-day': 'Pull Day', 'leg-day': 'Leg Day' };
        nextInRotation = { id: nextId, name: names[nextId] || 'Push Day' };
      }
    }

    // Try to find the routine template in the database, otherwise fallback
    const actualNext = routines.find(r => r.id === nextInRotation.id) || routines[0] || nextInRotation;

    return {
      isRest: true,
      message: `Today is ${todayName}. No workouts scheduled. Coach suggests resting or starting ${actualNext.name}.`,
      routineId: actualNext.id,
      routineName: actualNext.name
    };
  };

  const suggestion = getWeekdaySuggestion();

  // Get current body weight stats
  const getCurrentWeightStats = () => {
    if (metrics.length === 0) return { current: '--', diff: null, text: 'No logs yet' };
    const current = metrics[metrics.length - 1].weight;
    if (metrics.length < 2) {
      return { current: `${current} kg`, diff: null, text: 'First weight log recorded' };
    }
    const prev = metrics[metrics.length - 2].weight;
    const difference = parseFloat((current - prev).toFixed(1));
    
    let text = '';
    if (difference < 0) {
      text = `${Math.abs(difference)}kg lost since last entry`;
    } else if (difference > 0) {
      text = `+${difference}kg gained since last entry`;
    } else {
      text = 'Maintain weight since last entry';
    }
    
    return {
      current: `${current} kg`,
      diff: difference,
      text
    };
  };

  const weightStats = getCurrentWeightStats();

  // Extract recent personal records
  const getRecentPRs = () => {
    const prs: { name: string; weight: number; date: string }[] = [];
    const bestWeights: Record<string, { weight: number; date: string }> = {};

    logs.forEach(log => {
      const logDate = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) {
            const currentBest = bestWeights[ex.name]?.weight || 0;
            if (s.weight > currentBest) {
              bestWeights[ex.name] = { weight: s.weight, date: logDate };
            }
          }
        });
      });
    });

    const keyLifts = ['Bench Press', 'Squat', 'Romanian Deadlift (RDL)', 'Lat Pulldown', 'Shoulder Press'];
    keyLifts.forEach(lift => {
      if (bestWeights[lift]) {
        prs.push({
          name: lift,
          weight: bestWeights[lift].weight,
          date: bestWeights[lift].date
        });
      }
    });

    return prs.slice(0, 3);
  };

  const recentPRs = getRecentPRs();

  // Progress ring calculations
  const completionRate = Math.min(Math.round((weeklyCompleted / weeklyGoal) * 100), 100);
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (completionRate / 100) * ringCircumference;

  // Backup Export trigger
  const handleExportBackup = () => {
    if (!activeProfileId) return;
    const jsonStr = exportProfileBackup(activeProfileId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex_backup_${profileName.toLowerCase()}_${getLocalDateString(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully!');
  };

  // Backup Import file trigger
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProfileId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProfileBackup(activeProfileId, content);
      if (success) {
        showToast('Profile synced successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('Sync Error! The selected file is not a valid Apex backup.');
      }
    };
    reader.readAsText(file);
  };

  // Coach Motivational greeting
  const getCoachGreeting = () => {
    if (streak.currentStreak > 0) {
      return `Welcome back, ${profileName}! 🔥 You are on a ${streak.currentStreak}-day workout streak. Consistency beats talent every single day. Let's get it!`;
    }
    if (weeklyCompleted >= weeklyGoal) {
      return `Phenomenal job, ${profileName}! 🏆 You hit your target of ${weeklyGoal} workouts this week. Focus on good nutrition and recovery.`;
    }
    return `Coach's order, ${profileName}! 💪 Let's check in for today's session. Read suggestion below to start logging.`;
  };

  return (
    <div className="space-y-6 pb-24 fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-800 border border-green-500/30 text-green-400 text-sm font-semibold rounded-xl shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Coach Banner */}
      <div className="relative overflow-hidden bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-500/10 rounded-full blur-xl" />
        
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl mt-0.5 border border-green-500/20">
            <Sparkles className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">Apex Coach</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{getCoachGreeting()}</p>
          </div>
        </div>
      </div>

      {/* Goal Ring & Streak Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Weekly Goal Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-sm md:col-span-7">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Target</span>
              <button 
                onClick={() => {
                  setTempGoal(String(weeklyGoal));
                  setShowGoalModal(true);
                }} 
                className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-green-500 transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xl font-bold text-slate-200">
              {weeklyCompleted} / {weeklyGoal} workouts
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              {completionRate === 100 
                ? '🏆 Weekly Target Fully Cleared!' 
                : `${completionRate}% completed. Keep it going!`}
            </p>
          </div>

          {/* SVG Progress Circle */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="transparent"
                stroke="var(--color-slate-700)"
                strokeWidth="7"
              />
              <circle
                cx="48"
                cy="48"
                r={ringRadius}
                fill="transparent"
                stroke="var(--color-green-500)"
                strokeWidth="7"
                strokeDasharray={ringCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out filter drop-shadow-[0_0_4px_rgba(255,255,255,0.15)]"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-base font-black text-slate-200">{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Streak Details Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-sm md:col-span-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consistency Streak</span>
            <div className="text-3xl font-black text-slate-100 flex items-baseline gap-1 mt-1">
              <span>{streak.currentStreak}</span>
              <span className="text-xs font-medium text-slate-400">days</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Record Longest: <b>{streak.longestStreak} days</b></span>
            </p>
          </div>

          <div className="p-4 bg-orange-500/10 rounded-full border border-orange-500/20 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.15)]">
            <Flame className="w-10 h-10 text-orange-500 fill-current" />
          </div>
        </div>

      </div>

      {/* Weekday Suggestion Card */}
      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider font-semibold">Today's Schedule</span>
          <h3 className="font-bold text-slate-100 text-lg">{suggestion.message}</h3>
          <p className="text-xs text-slate-400 leading-normal">
            {suggestion.isRest 
              ? 'Enjoy your rest! Or load this rotation if you are feeling energized.' 
              : 'Maximize your performance today. Focus on consistency!'}
          </p>
        </div>
        
        <button
          onClick={() => onNavigate('workout')}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-3 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-sm transition tap-active shadow-lg shadow-green-500/10"
        >
          <span>Start Log</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Weight Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scale Weight</span>
            <div className="text-2xl font-black text-slate-100 mt-1">
              {weightStats.current}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {weightStats.text}
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl">
            <Scale className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Workouts Completed Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workout Volume</span>
            <div className="text-2xl font-black text-slate-100 mt-1">
              {logs.length} logged
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Total sessions tracked successfully
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl">
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>

      </div>

      {/* Recent PR Milestones & Backup Settings Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* PR Milestones */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-500" />
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Lifting Milestones</h3>
          </div>

          {recentPRs.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              Log some completed sets in today's workout to display your PR milestones!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentPRs.map((pr, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition"
                >
                  <div className="p-2 bg-green-500/10 rounded-full border border-green-500/20 text-green-500">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[10px] text-slate-450 uppercase tracking-wide truncate">{pr.name}</h4>
                    <p className="text-sm font-extrabold text-slate-100 mt-0.5">{pr.weight} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sync, Backup & Restore Card */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-green-500" />
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Backup & Sync</h3>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            Transfer your workouts, logs, and body weight metrics to other devices by downloading a backup file.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-1">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-slate-750 text-green-500 font-bold border border-slate-750 rounded-xl text-xs transition tap-active shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-900 hover:bg-slate-750 text-green-500 font-bold border border-slate-750 rounded-xl text-xs transition tap-active shadow-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Edit Weekly Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleUpdateGoal} className="w-full max-w-sm bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-2xl space-y-4 fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-700/60">
              <h3 className="font-bold text-slate-100 text-base">Weekly Goal Target</h3>
              <button 
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">How many workouts per week?</label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-green-500 transition text-center font-bold"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition tap-active"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-xs transition tap-active shadow-lg shadow-green-500/10"
              >
                Save Target
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
