import React, { useState, useEffect } from 'react';
import { Scale, Ruler, Calendar, Plus, Trash2, Check, ChevronUp } from 'lucide-react';
import { getBodyMetrics, addBodyMetric, getLocalDateString, saveBodyMetrics } from '../utils/db';
import type { BodyMetrics as BodyMetricsType } from '../types';


export const BodyMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<BodyMetricsType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form fields
  const [date, setDate] = useState(getLocalDateString(new Date()));
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    // getBodyMetrics returns sorted ascending, so we reverse for history listing
    const data = getBodyMetrics();
    setMetrics([...data].reverse());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || parseFloat(weight) <= 0) {
      showToast('Please enter a valid weight.');
      return;
    }

    const newMetric: BodyMetricsType = {
      date,
      weight: parseFloat(weight),
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      arms: arms ? parseFloat(arms) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined,
    };

    addBodyMetric(newMetric);
    loadMetrics();
    setIsFormOpen(false);
    showToast(`Metrics logged successfully for ${date}!`);

    // Reset inputs except date
    setWeight('');
    setChest('');
    setWaist('');
    setArms('');
    setThighs('');
  };

  const handleDelete = (dateToDelete: string) => {
    if (confirm(`Are you sure you want to delete the metrics for ${dateToDelete}?`)) {
      const currentMetrics = getBodyMetrics();
      const filtered = currentMetrics.filter(m => m.date !== dateToDelete);
      saveBodyMetrics(filtered);
      loadMetrics();
      showToast('Entry deleted successfully.');
    }
  };

  // Get most recent log to display as current stats
  const latestMetric = metrics[0];

  return (
    <div className="space-y-6 pb-24 fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-slate-800 border border-green-500/30 text-green-400 text-sm font-semibold rounded-xl shadow-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">Body Metrics</h2>
          <p className="text-xs text-slate-400">Track body weight and circumferences</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-sm transition tap-active shadow-lg shadow-green-500/10"
        >
          {isFormOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isFormOpen ? 'Close Form' : 'Log Metrics'}</span>
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase">Weight</span>
            <Scale className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {latestMetric ? `${latestMetric.weight} kg` : '--'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {latestMetric ? latestMetric.date : 'No logs yet'}
            </p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase">Waist</span>
            <Ruler className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {latestMetric?.waist ? `${latestMetric.waist} cm` : '--'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Waist width</p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase">Chest</span>
            <Ruler className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {latestMetric?.chest ? `${latestMetric.chest} cm` : '--'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Chest width</p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase">Arms</span>
            <Ruler className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {latestMetric?.arms ? `${latestMetric.arms} cm` : '--'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Bicep girth</p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/80 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase">Thighs</span>
            <Ruler className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100">
              {latestMetric?.thighs ? `${latestMetric.thighs} cm` : '--'}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Quad girth</p>
          </div>
        </div>
      </div>

      {/* Log Form Panel */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-5 rounded-2xl border border-slate-700/80 space-y-4 fade-in">
          <h3 className="font-bold text-slate-200 text-base">New Entry Detail</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-green-500" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-green-500 transition"
              />
            </div>

            {/* Weight Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-green-500" />
                <span>Body Weight (kg)*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="e.g. 78.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>
          </div>

          <div className="border-t border-slate-700/60 my-2 pt-3">
            <span className="text-xs text-slate-400 font-semibold mb-3 block">Measurements (Optional)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Waist */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Waist (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 84"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 transition"
                />
              </div>

              {/* Chest */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Chest (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 101"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 transition"
                />
              </div>

              {/* Arms */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Arms (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38"
                  value={arms}
                  onChange={(e) => setArms(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 transition"
                />
              </div>

              {/* Thighs */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Thighs (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 58"
                  value={thighs}
                  onChange={(e) => setThighs(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-green-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-sm transition tap-active"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-sm transition tap-active shadow-lg shadow-green-500/10"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* History Log List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/80 overflow-hidden">
        <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">Historical Log</h3>
          <span className="text-[11px] text-slate-500">{metrics.length} entries recorded</span>
        </div>

        {metrics.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No entries recorded yet. Click "Log Metrics" to add your first entry.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-700/60">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Weight</th>
                  <th className="px-4 py-3.5">Waist</th>
                  <th className="px-4 py-3.5">Chest</th>
                  <th className="px-4 py-3.5">Arms</th>
                  <th className="px-4 py-3.5">Thighs</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {metrics.map((item) => (
                  <tr key={item.date} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-200 whitespace-nowrap">
                      {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-green-400 whitespace-nowrap">
                      {item.weight} kg
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                      {item.waist ? `${item.waist} cm` : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                      {item.chest ? `${item.chest} cm` : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                      {item.arms ? `${item.arms} cm` : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                      {item.thighs ? `${item.thighs} cm` : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.date)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition tap-active"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
