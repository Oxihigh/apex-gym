import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Dumbbell, AlertTriangle } from 'lucide-react';
import { getProfiles, createProfile, deleteProfile } from '../utils/db';
import type { UserProfile } from '../types';

interface ProfileSelectorProps {
  onProfileSelected: (profileId: string) => void;
}

const AVATAR_COLORS = [
  'bg-green-500 text-slate-950 shadow-green-500/20',
  'bg-blue-500 text-slate-950 shadow-blue-500/20',
  'bg-indigo-500 text-slate-100 shadow-indigo-500/20',
  'bg-purple-500 text-slate-100 shadow-purple-500/20',
  'bg-rose-500 text-slate-100 shadow-rose-500/20',
  'bg-amber-500 text-slate-950 shadow-amber-500/20',
];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelected }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    if (profiles.some(p => p.name.toLowerCase() === newProfileName.trim().toLowerCase())) {
      alert('A profile with this name already exists.');
      return;
    }

    const created = createProfile(newProfileName, AVATAR_COLORS[selectedColorIdx]);
    onProfileSelected(created.id);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Avoid triggering selection
    if (confirm(`⚠️ Warning! Deleting profile "${name}" will erase all its routines, metrics, and workout logs forever. This action CANNOT be undone.\n\nType OK to confirm delete.`)) {
      deleteProfile(id);
      setProfiles(getProfiles());
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-12 select-none fade-in">
      <div className="w-full max-w-md space-y-8">
        
        {/* Branding header */}
        <div className="text-center space-y-2.5">
          <div className="mx-auto w-14 h-14 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(34,197,94,0.15)] animate-pulse">
            <Dumbbell className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase">
              APEX <span className="text-green-500">GYM</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
              Elevate Your Physical Potential
            </p>
          </div>
        </div>

        {/* Dynamic Card Area */}
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
          {showCreateForm ? (
            /* Create Profile Panel */
            <form onSubmit={handleCreate} className="space-y-5 fade-in">
              <h2 className="text-lg font-bold text-slate-200">New Athlete Profile</h2>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Profile Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Alex, Jordan"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-green-500 transition"
                />
              </div>

              {/* Color Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-400 font-semibold">Avatar Theme Color</span>
                <div className="flex gap-2.5">
                  {AVATAR_COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`w-9 h-9 rounded-full ${color.split(' ')[0]} transition flex items-center justify-center relative tap-active`}
                    >
                      {selectedColorIdx === idx && (
                        <div className="absolute inset-0.5 rounded-full border-2 border-slate-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition tap-active"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-xs transition tap-active shadow-lg shadow-green-500/10"
                >
                  Create & Login
                </button>
              </div>
            </form>
          ) : (
            /* Select Profile Panel */
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-200">Who is training today?</h2>
                <button
                  onClick={() => {
                    setNewProfileName('');
                    setSelectedColorIdx(0);
                    setShowCreateForm(true);
                  }}
                  className="p-1.5 hover:bg-slate-700 rounded-xl text-green-500 hover:text-green-400 transition flex items-center gap-1 text-xs font-semibold tap-active"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Profile</span>
                </button>
              </div>

              {profiles.length === 0 ? (
                /* Empty state */
                <div className="py-8 text-center text-slate-500 text-xs leading-relaxed space-y-4">
                  <p>Welcome to Apex! Create your athlete profile to start logging workouts and tracking progressive overload.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="mx-auto px-5 py-3 bg-green-500 hover:bg-green-600 text-slate-950 font-extrabold rounded-2xl text-xs transition tap-active flex items-center gap-1.5 shadow-lg shadow-green-500/10"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>Create Profile</span>
                  </button>
                </div>
              ) : (
                /* Profile Grid */
                <div className="grid grid-cols-1 gap-2.5 max-h-[280px] overflow-y-auto no-scrollbar pr-0.5">
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onProfileSelected(p.id)}
                      className="w-full p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between transition group tap-active"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md ${p.avatarColor}`}>
                          {getInitials(p.name)}
                        </div>
                        <span className="font-extrabold text-sm text-slate-200 group-hover:text-slate-100">{p.name}</span>
                      </div>
                      
                      <button
                        onClick={(e) => handleDelete(e, p.id, p.name)}
                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition tap-active"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Small security assurance footer */}
        <div className="text-center text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1 bg-slate-900/40 py-2.5 rounded-xl px-4 border border-slate-800/40">
          <AlertTriangle className="w-3 h-3 text-slate-500" />
          <span>Local storage active. Back up your profile in settings when syncing devices.</span>
        </div>

      </div>
    </div>
  );
};
