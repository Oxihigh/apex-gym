import React, { useState, useEffect } from 'react';
import { Play, Check, BookOpen, AlertCircle, Trash2, Trophy, Clock } from 'lucide-react';
import { getRoutines, addWorkoutLog, getMondayOfDate, getWorkoutLogs, getWeekScheduleForDate } from '../utils/db';
import { getProgressiveOverload } from '../utils/overload';
import type { OverloadRecommendation } from '../utils/overload';
import type { Routine, WorkoutLog, LoggedExercise, LoggedSet } from '../types';
import { ExerciseGuideModal } from './ExerciseGuideModal';

const ACTIVE_WORKOUT_STORAGE_KEY = 'iron_ledger_active_workout';

interface ActiveSet {
  weight: number | '';
  reps: number | '';
  completed: boolean;
}

interface ActiveExercise {
  exerciseId: string;
  name: string;
  category: 'upper' | 'lower';
  defaultSets: number;
  targetReps: number;
  sets: ActiveSet[];
  overload: OverloadRecommendation;
  completed: boolean;
}

interface ActiveSession {
  routineId: string;
  routineName: string;
  startTime: number; // timestamp
  exercises: ActiveExercise[];
}

export const ActiveWorkout: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  
  // Timer State disabled

  // Guide Modal State
  const [guideExerciseId, setGuideExerciseId] = useState<string | null>(null);

  // Summary Overlay State
  const [summaryData, setSummaryData] = useState<{
    duration: number;
    volume: number;
    completedSets: number;
    streak: number;
  } | null>(null);

  // Find today's recommended routine
  const getTodayRoutineSuggestion = () => {
    const todayIdx = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdays[todayIdx];
    const todayDateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
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
            title: `Today's Scheduled Workout`,
            message: `Today is ${todayName}, ${todayDateStr}. Your scheduled plan:`,
            routine: foundRoutine
          };
        }
      } else {
        // null means Rest Day
        // Find next in rotation
        const defaultOrder = ['push-day', 'pull-day', 'leg-day'];
        let nextInRotation = routines[0] || null;
        const logs = getWorkoutLogs();
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
          title: `Scheduled Rest Day`,
          message: `Today is ${todayName}, ${todayDateStr}. Coach suggests resting or starting:`,
          routine: nextInRotation
        };
      }
    }
    
    // Fallback: Check default static schedule
    const scheduledRoutines = routines.filter(r => r.scheduleDays?.includes(todayIdx));
    if (scheduledRoutines.length > 0) {
      return {
        isRest: false,
        title: `Today's Workout`,
        message: `Today is ${todayName}, ${todayDateStr}. Default routine for today:`,
        routine: scheduledRoutines[0]
      };
    }
    
    // Fallback if no routine is scheduled: suggest rotation next
    const defaultOrder = ['push-day', 'pull-day', 'leg-day'];
    let nextInRotation = routines[0] || null;
    const logs = getWorkoutLogs();
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
      title: `No Scheduled Workout`,
      message: `Today is ${todayName}, ${todayDateStr}. Coach suggests resting or starting:`,
      routine: nextInRotation
    };
  };

  useEffect(() => {
    setRoutines(getRoutines());
    
    // Check if there is an active session in local storage
    const saved = localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    if (saved) {
      const parsed: ActiveSession = JSON.parse(saved);
      setActiveSession(parsed);
    }
  }, []);

  // Timer runner disabled

  // Sync active session state to localStorage on modification
  const updateSession = (updated: ActiveSession | null) => {
    setActiveSession(updated);
    if (updated) {
      localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, JSON.stringify(updated));
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
    }
  };

  // Start a new workout
  const handleStartWorkout = (routine: Routine) => {
    const activeExercises: ActiveExercise[] = routine.exercises.map(ex => {
      // Calculate progressive overload recommendations
      const overload = getProgressiveOverload(ex.id, ex.category, ex.defaultSets, ex.targetReps);
      
      // Initialize sets with recommended weight and empty reps/ticks
      const sets: ActiveSet[] = Array.from({ length: ex.defaultSets }).map(() => ({
        weight: overload.weight,
        reps: ex.targetReps,
        completed: false
      }));

      return {
        exerciseId: ex.id,
        name: ex.name,
        category: ex.category,
        defaultSets: ex.defaultSets,
        targetReps: ex.targetReps,
        sets,
        overload,
        completed: false
      };
    });

    const newSession: ActiveSession = {
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises: activeExercises
    };

    updateSession(newSession);
  };

  // Log weight or reps input changes
  const handleSetChange = (
    exIdx: number,
    setIdx: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    if (!activeSession) return;
    
    const parsedVal = value === '' ? '' : parseFloat(value);
    if (parsedVal !== '' && isNaN(parsedVal)) return;

    const updatedExercises = [...activeSession.exercises];
    updatedExercises[exIdx].sets[setIdx] = {
      ...updatedExercises[exIdx].sets[setIdx],
      [field]: parsedVal
    };

    // If they changed the values, mark completed as false so they re-check it
    updatedExercises[exIdx].sets[setIdx].completed = false;

    updateSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  // Toggle set checkbox
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    if (!activeSession) return;

    const updatedExercises = [...activeSession.exercises];
    const set = updatedExercises[exIdx].sets[setIdx];

    // Validation before ticking
    if (set.weight === '' || set.weight <= 0 || set.reps === '' || set.reps <= 0) {
      alert('Please fill in valid weight and reps before marking a set complete.');
      return;
    }

    set.completed = !set.completed;

    // Auto-complete the exercise card if all sets are ticked
    const allTicked = updatedExercises[exIdx].sets.every(s => s.completed);
    updatedExercises[exIdx].completed = allTicked;

    updateSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  // Add an extra set to an exercise during workout
  const handleAddSet = (exIdx: number) => {
    if (!activeSession) return;

    const updatedExercises = [...activeSession.exercises];
    const ex = updatedExercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];

    ex.sets.push({
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 8,
      completed: false
    });

    updateSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  // Delete a set from an exercise during workout
  const handleDeleteSet = (exIdx: number, setIdx: number) => {
    if (!activeSession) return;

    const updatedExercises = [...activeSession.exercises];
    const ex = updatedExercises[exIdx];
    
    if (ex.sets.length <= 1) return; // Keep at least one set
    
    ex.sets.splice(setIdx, 1);
    
    // Recalculate exercise completion status
    ex.completed = ex.sets.every(s => s.completed);

    updateSession({
      ...activeSession,
      exercises: updatedExercises
    });
  };

  // Cancel workout
  const handleCancelWorkout = () => {
    if (confirm('Cancel this workout? Your progress in this session will be lost.')) {
      updateSession(null);
    }
  };

  // Complete workout
  const handleCompleteWorkout = () => {
    if (!activeSession) return;

    // Filter out exercises that have at least one completed set
    const loggedExercises: LoggedExercise[] = activeSession.exercises
      .map(ex => {
        const completedSets: LoggedSet[] = ex.sets
          .filter(s => s.completed && typeof s.weight === 'number' && typeof s.reps === 'number')
          .map(s => ({
            weight: s.weight as number,
            reps: s.reps as number,
            completed: true
          }));

        return {
          exerciseId: ex.exerciseId,
          name: ex.name,
          category: ex.category,
          sets: completedSets
        };
      })
      .filter(ex => ex.sets.length > 0);

    if (loggedExercises.length === 0) {
      alert('Cannot log an empty workout. Complete at least one set!');
      return;
    }

    const duration = 0;
    const dateStr = new Date().toISOString();

    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      routineId: activeSession.routineId,
      routineName: activeSession.routineName,
      date: dateStr,
      duration,
      completed: true,
      exercises: loggedExercises
    };

    // Save to local storage DB
    addWorkoutLog(newLog);

    // Calculate metrics for summary
    let volume = 0;
    let totalSets = 0;
    loggedExercises.forEach(ex => {
      ex.sets.forEach(s => {
        volume += s.weight * s.reps;
        totalSets++;
      });
    });

    // Clear active session
    updateSession(null);

    // Display summary modal
    setSummaryData({
      duration,
      volume,
      completedSets: totalSets,
      streak: 1 // DB recalculation happens dynamically
    });
  };

  // formatTime helper removed

  return (
    <div className="space-y-6 pb-24 fade-in">
      {/* Active Session View */}
      {activeSession ? (
        <div className="space-y-5">
          {/* Active Workout Header Sticky Bar */}
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between shadow-xl sticky top-4 z-20">
            <div>
              <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-wider mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Session Active</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100">{activeSession.routineName}</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCompleteWorkout}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-sm transition tap-active shadow-lg shadow-green-500/20"
              >
                Finish
              </button>
            </div>
          </div>

          {/* Exercises Cards */}
          <div className="space-y-4">
            {activeSession.exercises.map((ex, exIdx) => (
              <div
                key={ex.exerciseId}
                className={`bg-slate-800 rounded-2xl border transition-all ${
                  ex.completed ? 'border-green-500/30 bg-slate-800/80' : 'border-slate-700/80'
                }`}
              >
                {/* Exercise Header */}
                <div className="p-4 border-b border-slate-700/60 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{ex.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {ex.category} Body • Target: {ex.defaultSets} sets of {ex.targetReps} reps
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setGuideExerciseId(ex.exerciseId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-750 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs border border-slate-700 transition tap-active"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-green-500" />
                    <span>Guide</span>
                  </button>
                </div>

                {/* Overload Recommendation Banner */}
                <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-start gap-2">
                  <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    ex.overload.status === 'increase' ? 'text-green-500' : 'text-slate-400'
                  }`} />
                  <div>
                    <p className="text-xs font-bold text-slate-200">{ex.overload.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{ex.overload.reason}</p>
                  </div>
                </div>

                {/* Sets Table */}
                <div className="p-4 space-y-2">
                  {/* Table Headers */}
                  <div className="grid grid-cols-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span className="col-span-2 text-left pl-1">Set</span>
                    <span className="col-span-4">Weight (kg)</span>
                    <span className="col-span-4">Reps</span>
                    <span className="col-span-2">Log</span>
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-12 items-center gap-2 p-1 rounded-xl transition ${
                        set.completed ? 'bg-green-500/5' : ''
                      }`}
                    >
                      {/* Set Number */}
                      <span className="col-span-2 text-xs font-bold text-slate-400 pl-2">
                        {setIdx + 1}
                      </span>

                      {/* Weight Input */}
                      <div className="col-span-4 flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={set.weight}
                          onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                          className="w-full text-center bg-transparent py-2 text-sm font-semibold text-slate-100 focus:outline-none placeholder-slate-700"
                        />
                      </div>

                      {/* Reps Input */}
                      <div className="col-span-4 flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={set.reps}
                          onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                          className="w-full text-center bg-transparent py-2 text-sm font-semibold text-slate-100 focus:outline-none placeholder-slate-700"
                        />
                      </div>

                      {/* Check Box Action */}
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                          className={`p-2 rounded-xl border transition tap-active ${
                            set.completed
                              ? 'bg-green-500 border-green-500 text-slate-950'
                              : 'bg-slate-900 border-slate-700 text-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Actions */}
                <div className="px-4 pb-4 pt-1 flex justify-between gap-3 text-xs">
                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="px-3 py-2 text-green-500 font-semibold bg-green-500/5 hover:bg-green-500/10 rounded-xl transition tap-active"
                  >
                    + Add Set
                  </button>
                  {ex.sets.length > 1 && (
                    <button
                      onClick={() => handleDeleteSet(exIdx, ex.sets.length - 1)}
                      className="px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition tap-active flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Set</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* Cancel Workout Button */}
          <div className="pt-4">
            <button
              onClick={handleCancelWorkout}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-red-400 font-semibold border border-red-950/40 rounded-2xl text-sm transition tap-active shadow-sm"
            >
              Cancel Workout Session
            </button>
          </div>
        </div>
      ) : (
        /* Empty/Selection View */
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Start Workout</h2>
            <p className="text-xs text-slate-400">Select a training routine and begin</p>
          </div>

          {routines.length === 0 ? (
            <div className="p-8 text-center bg-slate-800 rounded-2xl border border-slate-700/80 text-slate-500 text-sm">
              You haven't configured any routines yet! Head to the "Workout Planner" tab to build your plans.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Today's Workout Recommendation */}
              {(() => {
                const suggestion = getTodayRoutineSuggestion();
                if (!suggestion.routine) return null;
                
                return (
                  <div className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between transition-all ${
                    suggestion.isRest 
                      ? 'bg-slate-850/60 border-slate-700/70 hover:border-slate-600' 
                      : 'bg-slate-800 border-green-500/30 filter drop-shadow-[0_0_8px_rgba(34,197,94,0.03)]'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          suggestion.isRest 
                            ? 'bg-slate-700/80 text-slate-350' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {suggestion.title}
                        </span>
                        {!suggestion.isRest && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-400 mt-1">{suggestion.message}</p>
                      
                      <div className="flex justify-between items-start mt-3.5 mb-3.5">
                        <div>
                          <h3 className="font-extrabold text-slate-100 text-xl leading-snug">{suggestion.routine.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{suggestion.routine.exercises.length} exercises configured</p>
                        </div>
                        
                        <button
                          onClick={() => handleStartWorkout(suggestion.routine!)}
                          className="flex items-center gap-1.5 px-5 py-3 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-sm transition tap-active shadow-lg shadow-green-500/10"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start Today's Workout</span>
                        </button>
                      </div>

                      {/* Summary list of exercises */}
                      {suggestion.routine.exercises.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60">
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                            {suggestion.routine.exercises.map((ex) => (
                              <span
                                key={ex.id}
                                className="bg-slate-850 px-2 py-1 rounded border border-slate-700/40"
                              >
                                {ex.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* All Routines List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider pl-1">All Routines ({routines.length})</h3>
                <div className="grid grid-cols-1 gap-4">
                  {routines.map((routine) => (
                    <div
                      key={routine.id}
                      className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-100 text-lg leading-snug">{routine.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{routine.exercises.length} exercises</p>
                        </div>
                        
                        <button
                          onClick={() => handleStartWorkout(routine)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-750 text-green-500 font-bold border border-slate-750 rounded-xl text-xs transition tap-active"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Routine</span>
                        </button>
                      </div>

                      {/* Tiny summary list of exercises */}
                      {routine.exercises.length > 0 && (
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60 mt-1">
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                            {routine.exercises.map((ex) => (
                              <span
                                key={ex.id}
                                className="bg-slate-800 px-2 py-1 rounded border border-slate-700/50"
                              >
                                {ex.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exercise Guide Modal Overlay */}
      {guideExerciseId && (
        <ExerciseGuideModal
          exerciseId={guideExerciseId}
          onClose={() => setGuideExerciseId(null)}
        />
      )}

      {/* Workout Success Summary Modal Overlay */}
      {summaryData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6 fade-in">
            {/* Trophy Icon Accent */}
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(34,197,94,0.15)]">
              <Trophy className="w-8 h-8 text-green-500 animate-bounce" />
            </div>

            <div>
              <h3 className="font-extrabold text-2xl text-slate-100">Workout Logged!</h3>
              <p className="text-xs text-green-400 font-semibold tracking-wide uppercase mt-1">
                You're tracking your gains!
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Total Volume</span>
                <span className="text-xl font-bold text-slate-200 mt-1 font-mono">
                  {summaryData.volume.toLocaleString()} kg
                </span>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Sets Logged</span>
                <span className="text-xl font-bold text-slate-200 mt-1 font-mono">
                  {summaryData.completedSets} sets completed
                </span>
              </div>
            </div>

            {/* Motivation Quote from Coach */}
            <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10 text-xs text-green-300 italic leading-relaxed">
              "Great work today. Consistency is the secret sauce. Recover well, fuel your muscles, and get ready for progressive overload next session!"
            </div>

            {/* Action to dismiss */}
            <button
              onClick={() => setSummaryData(null)}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-2xl text-sm transition tap-active shadow-lg shadow-green-500/10"
            >
              Done, Coach
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
