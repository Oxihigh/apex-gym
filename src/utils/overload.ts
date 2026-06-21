import { getWorkoutLogs } from './db';

export interface OverloadRecommendation {
  weight: number;
  status: 'increase' | 'maintain' | 'none';
  difference: number;
  message: string;
  reason: string;
}

/**
 * Calculates the suggested weight and overload recommendation for an exercise
 * based on its historical performance.
 */
export function getProgressiveOverload(
  exerciseId: string,
  category: 'upper' | 'lower',
  defaultSets: number,
  targetReps: number
): OverloadRecommendation {
  const logs = getWorkoutLogs();
  
  // Sort logs by date descending to inspect the most recent sessions
  const sortedLogs = [...logs]
    .filter(log => log.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  // Find the last completed session containing this exercise
  let lastExerciseRecord = null;
  let lastSessionDateStr = '';
  
  for (const log of sortedLogs) {
    const ex = log.exercises.find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) {
      lastExerciseRecord = ex;
      const d = new Date(log.date);
      lastSessionDateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      break;
    }
  }
  
  // Default fallback if there's no history for the exercise
  if (!lastExerciseRecord) {
    const defaultStart = category === 'lower' ? 40 : 15;
    return {
      weight: defaultStart,
      status: 'none',
      difference: 0,
      message: `Coach suggests: Try ${defaultStart}kg`,
      reason: `First time tracking this lift. Start at ${defaultStart}kg and focus on form.`
    };
  }
  
  const sets = lastExerciseRecord.sets;
  const increment = category === 'lower' ? 5.0 : 2.5;
  
  // Filter for completed/saved sets
  const completedSets = sets.filter(s => s.completed && s.reps > 0 && s.weight > 0);
  
  if (completedSets.length === 0) {
    // If they logged sets but didn't save/complete any properly
    const baseWeight = sets[0]?.weight || (category === 'lower' ? 40 : 15);
    return {
      weight: baseWeight,
      status: 'maintain',
      difference: 0,
      message: `Recommended next session: ${baseWeight}kg`,
      reason: 'No completed sets saved in the previous session.'
    };
  }
  
  // We use the maximum weight completed as our baseline
  const baseWeight = Math.max(...completedSets.map(s => s.weight));
  
  // Check if they hit the target sets and target reps
  const metSetsCount = completedSets.length >= defaultSets;
  const metAllReps = completedSets.every(s => s.reps >= targetReps);
  
  if (metSetsCount && metAllReps) {
    const nextWeight = baseWeight + increment;
    return {
      weight: nextWeight,
      status: 'increase',
      difference: increment,
      message: `Recommended next session: ${nextWeight}kg (+${increment}kg)`,
      reason: `🔥 Target reached! You did ${completedSets.length} sets of ${targetReps}+ reps at ${baseWeight}kg on ${lastSessionDateStr}. Up we go!`
    };
  } else {
    // Didn't hit target (e.g. achieved fewer sets than default, or some reps were below target)
    const repsListStr = completedSets.map(s => s.reps).join('/');
    
    return {
      weight: baseWeight,
      status: 'maintain',
      difference: 0,
      message: `Recommended next session: ${baseWeight}kg`,
      reason: `💪 Reps logged: [${repsListStr}] on ${lastSessionDateStr}. Keep pushing at ${baseWeight}kg until you can hit ${defaultSets} sets of ${targetReps} reps.`
    };
  }
}
