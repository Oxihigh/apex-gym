import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from 'recharts';
import { Award, Zap, Flame, BarChart3, TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { getWorkoutLogs, getBodyMetrics, getStreakData } from '../utils/db';
import type { WorkoutLog, BodyMetrics } from '../types';


export const Analytics: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [metrics, setMetrics] = useState<BodyMetrics[]>([]);
  const [streaks, setStreaks] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    setLogs(getWorkoutLogs());
    setMetrics(getBodyMetrics());
    const streakData = getStreakData();
    setStreaks({
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak
    });
  }, []);

  // 1. Process Body Weight Trend
  const weightData = metrics.map(m => ({
    date: new Date(m.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: m.weight,
    unit: 'kg'
  }));

  // Helper to extract maximum weight for an exercise across history
  const getExerciseProgressData = (exerciseId: string) => {
    const data: { date: string; weight: number; unit: string }[] = [];
    
    // Sort logs ascending chronologically for progress charting
    const sortedLogs = [...logs]
      .filter(l => l.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    sortedLogs.forEach(log => {
      const ex = log.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        const completedSets = ex.sets.filter(s => s.completed);
        if (completedSets.length > 0) {
          const maxWeight = Math.max(...completedSets.map(s => s.weight));
          data.push({
            date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            weight: maxWeight,
            unit: 'kg'
          });
        }
      }
    });
    
    return data;
  };

  // 2. Process Exercise Specific Progress Data
  const benchData = getExerciseProgressData('bench-press');
  const squatData = getExerciseProgressData('squat');
  const deadliftData = getExerciseProgressData('romanian-deadlift'); // Using RDL as deadlift proxy

  // 3. Process Weekly Consistency
  // Group workouts by calendar week offset
  const getWeeklyConsistencyData = () => {
    const data = [
      { week: '3 Wks Ago', count: 0 },
      { week: '2 Wks Ago', count: 0 },
      { week: 'Last Week', count: 0 },
      { week: 'This Week', count: 0 }
    ];
    
    const now = new Date();
    // Monday of current week
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfCurrentWeek = new Date(now.setDate(diff));
    startOfCurrentWeek.setHours(0,0,0,0);
    
    const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;
    
    logs.forEach(log => {
      if (!log.completed) return;
      const logTime = new Date(log.date).getTime();
      const diffTime = startOfCurrentWeek.getTime() - logTime;
      
      if (diffTime < 0) {
        data[3].count++; // This week
      } else if (diffTime < MS_IN_WEEK) {
        data[2].count++; // Last week
      } else if (diffTime < 2 * MS_IN_WEEK) {
        data[1].count++; // 2 weeks ago
      } else if (diffTime < 3 * MS_IN_WEEK) {
        data[0].count++; // 3 weeks ago
      }
    });
    
    return data;
  };

  const consistencyData = getWeeklyConsistencyData();

  // 4. Process Volume Progression
  const volumeData = [...logs]
    .filter(l => l.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => {
      let vol = 0;
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) vol += s.weight * s.reps;
        });
      });
      return {
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        volume: vol,
        unit: 'kg volume',
        name: log.routineName
      };
    });

  // 5. Calculate Personal Records (PRs)
  const calculatePRs = () => {
    let highestWeight = 0;
    let highestVolume = 0;
    let bestBench = 0;
    let bestSquat = 0;
    let bestDeadlift = 0;

    logs.forEach(log => {
      let logVol = 0;
      log.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) {
            logVol += s.weight * s.reps;
            if (s.weight > highestWeight) highestWeight = s.weight;
            
            if (ex.exerciseId === 'bench-press' && s.weight > bestBench) bestBench = s.weight;
            if (ex.exerciseId === 'squat' && s.weight > bestSquat) bestSquat = s.weight;
            if (ex.exerciseId === 'romanian-deadlift' && s.weight > bestDeadlift) bestDeadlift = s.weight;
          }
        });
      });
      if (logVol > highestVolume) highestVolume = logVol;
    });

    return { highestWeight, highestVolume, bestBench, bestSquat, bestDeadlift };
  };

  const prs = calculatePRs();

  // 6. Achievement Badges List
  const achievements = [
    {
      id: 'initiate',
      title: 'Iron Initiate',
      desc: 'Log your first completed workout.',
      unlocked: logs.length > 0,
      icon: Award,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/5'
    },
    {
      id: 'beast',
      title: 'Consistent Beast',
      desc: 'Achieve a 5-day active workout streak.',
      unlocked: streaks.longestStreak >= 5,
      icon: Flame,
      color: 'text-orange-500 border-orange-500/30 bg-orange-500/5'
    },
    {
      id: 'titan',
      title: 'Century Bench',
      desc: 'Bench press 100kg or more.',
      unlocked: prs.bestBench >= 100,
      icon: Trophy,
      color: 'text-green-400 border-green-500/30 bg-green-500/5'
    },
    {
      id: 'squat-master',
      title: 'Heavy Squat',
      desc: 'Squat 100kg or more.',
      unlocked: prs.bestSquat >= 100,
      icon: Trophy,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
    },
    {
      id: 'colossus',
      title: 'Heavy Metal',
      desc: 'Lift over 5,000kg of volume in a single session.',
      unlocked: prs.highestVolume >= 5000,
      icon: Zap,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5'
    }
  ];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700/80 p-3 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-extrabold text-green-400 mt-1">
            {payload[0].value.toLocaleString()} {payload[0].payload.unit || 'kg'}
          </p>
          {payload[0].payload.name && (
            <p className="text-[10px] text-slate-500 mt-0.5">{payload[0].payload.name}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-24 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Coach Analytics</h2>
        <p className="text-xs text-slate-400">Review your strength progression and body changes</p>
      </div>

      {/* PR Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Strongest Lift</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{prs.highestWeight > 0 ? `${prs.highestWeight} kg` : '--'}</p>
          <p className="text-[9px] text-slate-400 mt-1.5">Maximum weight logged in a set</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Max Session Volume</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{prs.highestVolume > 0 ? `${prs.highestVolume.toLocaleString()} kg` : '--'}</p>
          <p className="text-[9px] text-slate-400 mt-1.5">Total tonnage completed in one session</p>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lifting PRs (Bench/Squat/RDL)</span>
          <div className="flex gap-4 mt-2.5 text-xs text-slate-200">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Bench</span>
              <span className="font-bold text-green-400">{prs.bestBench || '--'}kg</span>
            </div>
            <div className="flex flex-col border-l border-slate-700/60 pl-3">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Squat</span>
              <span className="font-bold text-green-400">{prs.bestSquat || '--'}kg</span>
            </div>
            <div className="flex flex-col border-l border-slate-700/60 pl-3">
              <span className="text-[9px] text-slate-400 uppercase font-semibold">RDL</span>
              <span className="font-bold text-green-400">{prs.bestDeadlift || '--'}kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Body Weight Trend */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between h-[250px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-green-500" />
            Body Weight Trend
          </h4>
          <div className="flex-1 w-full h-[180px] text-xs">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" domain={['auto', 'auto']} fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No body weight logs yet.</div>
            )}
          </div>
        </div>

        {/* 2. Total Volume Lifted */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between h-[250px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-green-500" />
            Total Volume Progression
          </h4>
          <div className="flex-1 w-full h-[180px] text-xs">
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="volume" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No workout volume records.</div>
            )}
          </div>
        </div>

        {/* 3. Bench Press Progress */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between h-[250px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            Bench Press Progress
          </h4>
          <div className="flex-1 w-full h-[180px] text-xs">
            {benchData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Bench Press hasn't been logged yet.</div>
            )}
          </div>
        </div>

        {/* 4. Squat Progress */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between h-[250px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            Squat Progress
          </h4>
          <div className="flex-1 w-full h-[180px] text-xs">
            {squatData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={squatData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Squats haven't been logged yet.</div>
            )}
          </div>
        </div>

        {/* 5. Romanian Deadlift Progress */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between h-[250px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            Romanian Deadlift Progress
          </h4>
          <div className="flex-1 w-full h-[180px] text-xs">
            {deadliftData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deadliftData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                  <YAxis stroke="#64748B" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="weight" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: '#22C55E' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">RDL hasn't been logged yet.</div>
            )}
          </div>
        </div>

        {/* 6. Weekly Workout Consistency */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between h-[250px]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-green-500" />
            Weekly Workout Consistency
          </h4>
          <div className="flex-1 w-full h-[180px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" allowDecimals={false} fontSize={10} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#22C55E" radius={[4, 4, 0, 0]} unit=" workouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Achievement Badges section */}
      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-green-500" />
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Unlocked Coach Badges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {achievements.map((ach) => {
            const Icon = ach.icon;
            return (
              <div 
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                  ach.unlocked 
                    ? `${ach.color} opacity-100` 
                    : 'border-slate-800 bg-slate-900/40 text-slate-600 opacity-50'
                }`}
              >
                <div className={`p-3.5 rounded-full ${
                  ach.unlocked ? 'bg-slate-900' : 'bg-slate-950'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100">{ach.title}</h4>
                    {ach.unlocked && (
                      <span className="text-[8px] bg-green-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
