import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Info, RefreshCw } from 'lucide-react';
import { 
  getWeekSchedules, 
  saveWeekSchedule, 
  getRoutines, 
  getMondayOfDate, 
  getLocalDateString,
  getWeekScheduleForDate
} from '../utils/db';
import type { Routine } from '../types';

export const WeeklyPlanner: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [weekSchedules, setWeekSchedules] = useState<Record<string, Record<number, string | null>>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    setRoutines(getRoutines());
    setWeekSchedules(getWeekSchedules());
    // Get Monday of today
    setCurrentWeekStart(getMondayOfDate(new Date()));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Nav handlers
  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(getLocalDateString(d));
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(getLocalDateString(d));
  };

  const handleTodayWeek = () => {
    setCurrentWeekStart(getMondayOfDate(new Date()));
  };

  // Date formatting helpers
  const getWeekRangeLabel = () => {
    if (!currentWeekStart) return '';
    const start = new Date(currentWeekStart + 'T00:00:00');
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString(undefined, options);
    const endStr = end.toLocaleDateString(undefined, options);
    const yearStr = start.getFullYear();

    return `${startStr} – ${endStr}, ${yearStr}`;
  };

  // Days list: Monday (1) to Sunday (0)
  const weekdays = [
    { label: 'Monday', dayIdx: 1 },
    { label: 'Tuesday', dayIdx: 2 },
    { label: 'Wednesday', dayIdx: 3 },
    { label: 'Thursday', dayIdx: 4 },
    { label: 'Friday', dayIdx: 5 },
    { label: 'Saturday', dayIdx: 6 },
    { label: 'Sunday', dayIdx: 0 }
  ];

  // Resolve what routine is selected for a given day (saves or default)
  const getSelectedRoutineId = (dayIdx: number): string => {
    const sched = getWeekScheduleForDate(currentWeekStart);
    return sched[dayIdx] || ''; // '' represents Rest Day
  };

  const handleRoutineChange = (dayIdx: number, value: string) => {
    const currentSched = getWeekScheduleForDate(currentWeekStart);
    const updatedWeekSched = { ...currentSched };
    
    // If selecting rest day, set as null, otherwise the routine ID
    updatedWeekSched[dayIdx] = value === '' ? null : value;

    // Check if the schedules object has changed (to avoid writing unchanged logs)
    const newSchedules = {
      ...weekSchedules,
      [currentWeekStart]: updatedWeekSched
    };

    setWeekSchedules(newSchedules);
    saveWeekSchedule(currentWeekStart, updatedWeekSched);
    showToast('Weekly schedule updated!');
  };

  const getDayDateLabel = (dayIdx: number) => {
    if (!currentWeekStart) return '';
    const start = new Date(currentWeekStart + 'T00:00:00');
    // Monday is index 0 in weekdays array, Sunday is index 6.
    // If dayIdx is 1 (Mon), offset is 0. If dayIdx is 0 (Sun), offset is 6.
    const offset = dayIdx === 0 ? 6 : dayIdx - 1;
    const currentDay = new Date(start.getTime());
    currentDay.setDate(start.getDate() + offset);
    return currentDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleClearWeekCustomization = () => {
    if (confirm('Reset custom schedules for this week and use default routines?')) {
      const newSchedules = { ...weekSchedules };
      delete newSchedules[currentWeekStart];
      setWeekSchedules(newSchedules);
      
      // Save empty object to delete the key from database
      const key = `apex_profile_${localStorage.getItem('apex_active_profile_id')}_week_schedules`;
      const schedulesStr = localStorage.getItem(key);
      if (schedulesStr) {
        const parsed = JSON.parse(schedulesStr);
        delete parsed[currentWeekStart];
        localStorage.setItem(key, JSON.stringify(parsed));
      }
      
      showToast('Week schedule reset to defaults.');
    }
  };

  if (!currentWeekStart) return null;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/80 p-5 shadow-lg space-y-4">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 border border-green-500/30 text-green-400 text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2 fade-in">
          <Calendar className="w-3.5 h-3.5" />
          {toastMessage}
        </div>
      )}

      {/* Title / Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
            <Calendar className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-sm">Weekly Routine Planner</h3>
            <p className="text-[10px] text-slate-400">Schedule workouts for specific calendar weeks</p>
          </div>
        </div>
        
        {/* Navigation controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleClearWeekCustomization}
            title="Reset to defaults"
            className="p-1.5 bg-slate-900 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border border-slate-750 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleTodayWeek}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-750 text-green-500 hover:text-green-400 border border-slate-750 font-bold rounded-lg text-xs transition"
          >
            This Week
          </button>
          <div className="flex items-center bg-slate-900 rounded-lg border border-slate-750">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 text-slate-450 hover:text-slate-100 transition border-r border-slate-750"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 text-slate-450 hover:text-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Week slider label */}
      <div className="text-center bg-slate-900/60 py-2 px-3 rounded-xl border border-slate-700/30 text-xs font-bold text-slate-250">
        {getWeekRangeLabel()}
      </div>

      {/* Grid listing days */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekdays.map(day => {
          const selectedId = getSelectedRoutineId(day.dayIdx);
          const isCustomized = weekSchedules[currentWeekStart] && weekSchedules[currentWeekStart][day.dayIdx] !== undefined;

          return (
            <div 
              key={day.dayIdx} 
              className={`p-3 bg-slate-900/40 rounded-xl border transition-all flex flex-row md:flex-col items-center justify-between md:justify-center md:text-center gap-2 ${
                isCustomized 
                  ? 'border-green-500/20 bg-green-500/[0.01]' 
                  : 'border-slate-800/80 hover:border-slate-750'
              }`}
            >
              {/* Day details */}
              <div className="flex flex-col md:items-center">
                <span className="text-xs font-bold text-slate-200">{day.label}</span>
                <span className="text-[10px] text-slate-500 font-semibold">{getDayDateLabel(day.dayIdx)}</span>
              </div>

              {/* Selector */}
              <select
                value={selectedId}
                onChange={(e) => handleRoutineChange(day.dayIdx, e.target.value)}
                className={`w-32 md:w-full bg-slate-900 border text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-green-500 transition text-center cursor-pointer ${
                  selectedId === '' 
                    ? 'border-slate-750 text-slate-500' 
                    : 'border-green-500/30 text-green-400 font-extrabold bg-green-500/5'
                }`}
              >
                <option value="">Rest Day</option>
                {routines.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 leading-normal">
        <Info className="w-3 h-3 text-slate-450 flex-shrink-0" />
        <span>Customized days are marked with a green border. Suggestions on the dashboard update to reflect this calendar planning.</span>
      </div>
    </div>
  );
};
