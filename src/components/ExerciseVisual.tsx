import React from 'react';

interface ExerciseVisualProps {
  exerciseId: string;
  muscleGroup: string;
}

export const ExerciseVisual: React.FC<ExerciseVisualProps> = ({ exerciseId, muscleGroup }) => {
  // Determine which muscle groups are highlighted based on the exercise ID
  const lowerExId = exerciseId.toLowerCase();
  
  const active = {
    chest: lowerExId.includes('bench') || lowerExId.includes('chest') || lowerExId.includes('press') && !lowerExId.includes('shoulder') && !lowerExId.includes('leg'),
    back: lowerExId.includes('lat') || lowerExId.includes('row') || lowerExId.includes('pull') && !lowerExId.includes('push') && !lowerExId.includes('shoulder'),
    shoulders: lowerExId.includes('shoulder') || lowerExId.includes('lateral') || lowerExId.includes('face-pull') || lowerExId.includes('press'),
    triceps: lowerExId.includes('tricep') || lowerExId.includes('bench') || lowerExId.includes('press'),
    biceps: lowerExId.includes('curl'),
    quads: lowerExId.includes('squat') || lowerExId.includes('leg-press'),
    hamstrings: lowerExId.includes('deadlift') || lowerExId.includes('rdl') || lowerExId.includes('leg-curl') || lowerExId.includes('squat'),
    calves: lowerExId.includes('calf'),
  };

  // Helper to color active vs inactive muscle paths
  const getColor = (isActive: boolean) => isActive ? '#22C55E' : '#334155';
  const getGlow = (isActive: boolean) => isActive ? 'url(#neonGlow)' : 'none';
  const getOpacity = (isActive: boolean) => isActive ? '1' : '0.4';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800">
      <div className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">
        Muscle Activation Blueprint
      </div>
      
      <div className="flex gap-8 justify-center items-center w-full max-w-[280px]">
        {/* SVG Container */}
        <svg viewBox="0 0 240 240" className="w-full h-auto max-h-[200px]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* FRONT VIEW (Anterior) */}
          <g transform="translate(10, 10)">
            <text x="50" y="15" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="bold">ANTERIOR</text>
            
            {/* Outline Figure */}
            {/* Head */}
            <circle cx="50" cy="35" r="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            
            {/* Neck */}
            <rect x="47" y="45" width="6" height="6" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            
            {/* Shoulders (Delts) - Front */}
            <circle cx="33" cy="56" r="6" fill={getColor(active.shoulders)} filter={getGlow(active.shoulders)} stroke="#1E293B" strokeWidth="1" />
            <circle cx="67" cy="56" r="6" fill={getColor(active.shoulders)} filter={getGlow(active.shoulders)} stroke="#1E293B" strokeWidth="1" />
            
            {/* Chest */}
            <path d="M 38 53 Q 50 56 62 53 L 62 68 Q 50 72 38 68 Z" fill={getColor(active.chest)} filter={getGlow(active.chest)} stroke="#1E293B" strokeWidth="1" />
            
            {/* Core / Abs */}
            <rect x="40" y="70" width="20" height="25" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            
            {/* Arms - Front (Biceps / Forearms) */}
            {/* Left Arm Bicep */}
            <path d="M 31 60 L 25 78 C 24 81 22 84 21 86" fill="none" stroke={getColor(active.biceps)} strokeWidth="7" strokeLinecap="round" filter={getGlow(active.biceps)} />
            {/* Right Arm Bicep */}
            <path d="M 69 60 L 75 78 C 76 81 78 84 79 86" fill="none" stroke={getColor(active.biceps)} strokeWidth="7" strokeLinecap="round" filter={getGlow(active.biceps)} />
            
            {/* Left Forearm */}
            <path d="M 21 86 L 18 104" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            {/* Right Forearm */}
            <path d="M 79 86 L 82 104" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            {/* Hips */}
            <path d="M 38 95 L 62 95 L 59 110 L 41 110 Z" fill="#1E293B" stroke="#475569" strokeWidth="1" />

            {/* Legs - Front (Quads) */}
            {/* Left Thigh (Quad) */}
            <path d="M 43 110 L 40 150" fill="none" stroke={getColor(active.quads)} strokeWidth="9" strokeLinecap="round" filter={getGlow(active.quads)} />
            {/* Right Thigh (Quad) */}
            <path d="M 57 110 L 60 150" fill="none" stroke={getColor(active.quads)} strokeWidth="9" strokeLinecap="round" filter={getGlow(active.quads)} />

            {/* Left Lower Leg (Calf Front) */}
            <path d="M 40 150 L 40 190" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            {/* Right Lower Leg (Calf Front) */}
            <path d="M 60 150 L 60 190" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            
            {/* Feet */}
            <ellipse cx="38" cy="193" rx="5" ry="3" fill="#475569" />
            <ellipse cx="62" cy="193" rx="5" ry="3" fill="#475569" />
          </g>

          {/* BACK VIEW (Posterior) */}
          <g transform="translate(130, 10)">
            <text x="50" y="15" fill="#64748B" fontSize="10" textAnchor="middle" fontWeight="bold">POSTERIOR</text>
            
            {/* Outline Figure */}
            {/* Head */}
            <circle cx="50" cy="35" r="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            
            {/* Neck */}
            <rect x="47" y="45" width="6" height="6" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            
            {/* Shoulders (Delts) - Back */}
            <circle cx="33" cy="56" r="6" fill={getColor(active.shoulders)} filter={getGlow(active.shoulders)} stroke="#1E293B" strokeWidth="1" />
            <circle cx="67" cy="56" r="6" fill={getColor(active.shoulders)} filter={getGlow(active.shoulders)} stroke="#1E293B" strokeWidth="1" />
            
            {/* Upper Back & Lats */}
            <path d="M 37 53 L 63 53 L 58 85 L 42 85 Z" fill={getColor(active.back)} filter={getGlow(active.back)} stroke="#1E293B" strokeWidth="1.5" />
            <path d="M 38 58 Q 50 64 62 58 L 56 82 Q 50 85 44 82 Z" fill={getColor(active.back)} filter={getGlow(active.back)} opacity={getOpacity(active.back)} />

            {/* Lower Back / Glutes */}
            <rect x="40" y="85" width="20" height="10" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <path d="M 38 95 Q 50 102 62 95 L 59 110 Q 50 115 41 110 Z" fill={getColor(active.hamstrings)} filter={getGlow(active.hamstrings)} opacity={getOpacity(active.hamstrings)} />

            {/* Arms - Back (Triceps) */}
            {/* Left Arm Tricep */}
            <path d="M 31 60 L 25 78 C 24 81 22 84 21 86" fill="none" stroke={getColor(active.triceps)} strokeWidth="7" strokeLinecap="round" filter={getGlow(active.triceps)} />
            {/* Right Arm Tricep */}
            <path d="M 69 60 L 75 78 C 76 81 78 84 79 86" fill="none" stroke={getColor(active.triceps)} strokeWidth="7" strokeLinecap="round" filter={getGlow(active.triceps)} />
            
            {/* Left Forearm */}
            <path d="M 21 86 L 18 104" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            {/* Right Forearm */}
            <path d="M 79 86 L 82 104" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

            {/* Legs - Back (Hamstrings) */}
            {/* Left Thigh (Hamstring) */}
            <path d="M 43 110 L 40 150" fill="none" stroke={getColor(active.hamstrings)} strokeWidth="9" strokeLinecap="round" filter={getGlow(active.hamstrings)} />
            {/* Right Thigh (Hamstring) */}
            <path d="M 57 110 L 60 150" fill="none" stroke={getColor(active.hamstrings)} strokeWidth="9" strokeLinecap="round" filter={getGlow(active.hamstrings)} />

            {/* Left Calf */}
            <path d="M 40 150 L 40 190" fill="none" stroke={getColor(active.calves)} strokeWidth="6" strokeLinecap="round" filter={getGlow(active.calves)} />
            {/* Right Calf */}
            <path d="M 60 150 L 60 190" fill="none" stroke={getColor(active.calves)} strokeWidth="6" strokeLinecap="round" filter={getGlow(active.calves)} />
            
            {/* Feet */}
            <ellipse cx="38" cy="193" rx="5" ry="3" fill="#475569" />
            <ellipse cx="62" cy="193" rx="5" ry="3" fill="#475569" />
          </g>
        </svg>
      </div>

      <div className="text-center text-xs font-medium text-green-400 mt-2 px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
        Targets: {muscleGroup}
      </div>
    </div>
  );
};
