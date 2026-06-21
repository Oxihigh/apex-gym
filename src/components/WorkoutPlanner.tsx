import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { getRoutines, saveRoutines } from '../utils/db';
import type { Routine, RoutineExercise } from '../types';
import { EXERCISE_CATALOG } from '../utils/exerciseCatalog';
import { WeeklyPlanner } from './WeeklyPlanner';

export const WorkoutPlanner: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  
  // Exercise catalog options
  const [exerciseToAdd, setExerciseToAdd] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseCategory, setCustomExerciseCategory] = useState<'upper' | 'lower'>('upper');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setRoutines(getRoutines());
  }, []);

  useEffect(() => {
    if (routines.length > 0 && !selectedRoutineId) {
      setSelectedRoutineId(routines[0].id);
    }
  }, [routines, selectedRoutineId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveRoutines = (updated: Routine[]) => {
    setRoutines(updated);
    saveRoutines(updated);
  };

  // Add exercise to selected routine
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoutineId) return;

    let newEx: RoutineExercise;

    if (showCustomInput) {
      if (!customExerciseName.trim()) return;
      const exId = 'custom-' + customExerciseName.toLowerCase().replace(/\s+/g, '-');
      newEx = {
        id: exId,
        name: customExerciseName,
        category: customExerciseCategory,
        defaultSets: 3,
        targetReps: 8
      };
    } else {
      if (!exerciseToAdd) return;
      const catalogEx = EXERCISE_CATALOG[exerciseToAdd];
      if (!catalogEx) return;
      newEx = {
        id: exerciseToAdd,
        name: catalogEx.name,
        category: catalogEx.category,
        defaultSets: 3,
        targetReps: 8
      };
    }

    const updated = routines.map(r => {
      if (r.id === selectedRoutineId) {
        // Prevent duplicate exercises in same routine
        if (r.exercises.some(ex => ex.id === newEx.id)) {
          showToast('This exercise is already in the routine.');
          return r;
        }
        return {
          ...r,
          exercises: [...r.exercises, newEx]
        };
      }
      return r;
    });

    handleSaveRoutines(updated);
    setExerciseToAdd('');
    setCustomExerciseName('');
    setShowCustomInput(false);
    showToast(`Added "${newEx.name}" to routine.`);
  };

  // Remove exercise from routine
  const handleRemoveExercise = (exId: string) => {
    if (!selectedRoutineId) return;

    const updated = routines.map(r => {
      if (r.id === selectedRoutineId) {
        return {
          ...r,
          exercises: r.exercises.filter(ex => ex.id !== exId)
        };
      }
      return r;
    });

    handleSaveRoutines(updated);
    showToast('Exercise removed.');
  };

  // Move exercise up or down in order
  const handleMoveExercise = (idx: number, direction: 'up' | 'down') => {
    if (!selectedRoutineId) return;

    const updated = routines.map(r => {
      if (r.id === selectedRoutineId) {
        const list = [...r.exercises];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        
        if (swapIdx < 0 || swapIdx >= list.length) return r; // boundary check
        
        // Swap elements
        const temp = list[idx];
        list[idx] = list[swapIdx];
        list[swapIdx] = temp;
        
        return {
          ...r,
          exercises: list
        };
      }
      return r;
    });

    handleSaveRoutines(updated);
  };

  // Edit sets and reps directly on the exercise card
  const handleUpdateSetsReps = (exId: string, field: 'defaultSets' | 'targetReps', value: number) => {
    if (!selectedRoutineId || value <= 0) return;

    const updated = routines.map(r => {
      if (r.id === selectedRoutineId) {
        return {
          ...r,
          exercises: r.exercises.map(ex => {
            if (ex.id === exId) {
              return {
                ...ex,
                [field]: value
              };
            }
            return ex;
          })
        };
      }
      return r;
    });

    handleSaveRoutines(updated);
  };

  const selectedRoutine = routines.find(r => r.id === selectedRoutineId);

  // Filter out exercises already in the selected routine from catalog suggestions
  const catalogOptions = Object.keys(EXERCISE_CATALOG).filter(id => {
    if (!selectedRoutine) return true;
    return !selectedRoutine.exercises.some(ex => ex.id === id);
  });

  return (
    <div className="space-y-6 pb-24 fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-800 border border-green-500/30 text-green-400 text-sm font-semibold rounded-xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Workout Planner</h2>
          <p className="text-xs text-slate-400">Design your weekday training routines</p>
        </div>
      </div>

      {/* Weekly Calendar planner component */}
      <WeeklyPlanner />

      {/* Tabs list for routines */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
        {routines.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRoutineId(r.id)}
            className={`px-4 py-2.5 font-bold rounded-xl text-sm whitespace-nowrap transition tap-active ${
              selectedRoutineId === r.id
                ? 'bg-green-500 text-slate-950 shadow-md shadow-green-500/5'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Routine Detail Card */}
      {selectedRoutine && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700/80">
            <div>
              <h3 className="font-bold text-slate-100 text-lg">{selectedRoutine.name} Workout Plan</h3>
              <p className="text-xs text-slate-400">{selectedRoutine.exercises.length} exercises configured</p>
            </div>
          </div>

          {/* Add Exercise Panel */}
          <form onSubmit={handleAddExercise} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <h4 className="font-semibold text-slate-200 text-sm">Add Exercise</h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {showCustomInput ? (
                /* Custom exercise fields */
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Custom exercise name"
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-green-500 transition"
                  />
                  <select
                    value={customExerciseCategory}
                    onChange={(e) => setCustomExerciseCategory(e.target.value as 'upper' | 'lower')}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-green-500 transition"
                  >
                    <option value="upper">Upper Body</option>
                    <option value="lower">Lower Body</option>
                  </select>
                </div>
              ) : (
                /* Catalog drop down selection */
                <select
                  value={exerciseToAdd}
                  onChange={(e) => setExerciseToAdd(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-green-500 transition"
                >
                  <option value="">Select from exercise catalog...</option>
                  {catalogOptions.map(id => (
                    <option key={id} value={id}>
                      {EXERCISE_CATALOG[id].name} ({EXERCISE_CATALOG[id].category})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="submit"
                disabled={!showCustomInput && !exerciseToAdd || showCustomInput && !customExerciseName.trim()}
                className="px-4 py-2.5 bg-green-500 disabled:opacity-50 hover:bg-green-600 disabled:hover:bg-green-500 text-slate-950 font-bold rounded-xl text-xs transition tap-active flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lift</span>
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(!showCustomInput);
                  setExerciseToAdd('');
                  setCustomExerciseName('');
                }}
                className="text-green-500 hover:underline font-semibold"
              >
                {showCustomInput ? 'Choose from Catalog' : 'Create Custom Exercise'}
              </button>
              <span className="text-slate-500">Configured exercises won't show in catalog drop-down</span>
            </div>
          </form>

          {/* Exercises List */}
          {selectedRoutine.exercises.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm">
              This routine has no exercises. Add your first lift above!
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedRoutine.exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3.5 group hover:border-slate-600 transition"
                >
                  {/* Left: Move & Name */}
                  <div className="flex items-center gap-3">
                    {/* Reordering Controls */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveExercise(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-700/50 disabled:opacity-20 text-slate-400 hover:text-green-400 rounded-md transition tap-active"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveExercise(idx, 'down')}
                        disabled={idx === selectedRoutine.exercises.length - 1}
                        className="p-1 hover:bg-slate-700/50 disabled:opacity-20 text-slate-400 hover:text-green-400 rounded-md transition tap-active"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{ex.name}</h4>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {ex.category} Body
                      </span>
                    </div>
                  </div>

                  {/* Middle/Right: Sets, Reps and Actions */}
                  <div className="flex items-center gap-4">
                    {/* Sets Config */}
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Sets</span>
                        <input
                          type="number"
                          value={ex.defaultSets}
                          onChange={(e) => handleUpdateSetsReps(ex.id, 'defaultSets', parseInt(e.target.value, 10) || 3)}
                          className="w-7 text-center bg-transparent font-bold text-slate-100 focus:outline-none text-xs"
                        />
                      </div>
                      <span className="text-slate-600 text-xs font-semibold px-0.5">x</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">Reps</span>
                        <input
                          type="number"
                          value={ex.targetReps}
                          onChange={(e) => handleUpdateSetsReps(ex.id, 'targetReps', parseInt(e.target.value, 10) || 8)}
                          className="w-7 text-center bg-transparent font-bold text-slate-100 focus:outline-none text-xs"
                        />
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition tap-active"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
