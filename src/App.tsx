import { useState, useEffect } from 'react';
import { 
  Home, PlayCircle, Calendar, LineChart, Scale, Download, X, Dumbbell, LogOut 
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { Analytics } from './components/Analytics';
import { BodyMetrics } from './components/BodyMetrics';
import { ProfileSelector } from './components/ProfileSelector';
import { getActiveProfileId, getProfiles, setActiveProfileId } from './utils/db';

type TabType = 'dashboard' | 'workout' | 'planner' | 'analytics' | 'metrics';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Load active profile from database
  useEffect(() => {
    setActiveProfileIdState(getActiveProfileId());
    
    // Deep linking for PWA Shortcuts (e.g. ?tab=workout)
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as TabType;
    if (tabParam && ['dashboard', 'workout', 'planner', 'analytics', 'metrics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Listen to PWA install event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleProfileSelected = (profileId: string) => {
    setActiveProfileId(profileId);
    setActiveProfileIdState(profileId);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    if (confirm('Switch to another athlete profile? Your progress will remain saved locally.')) {
      setActiveProfileId(null);
      setActiveProfileIdState(null);
    }
  };

  const profiles = getProfiles();
  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  // Render profile selection login page if no active user
  if (!activeProfileId || !activeProfile) {
    return <ProfileSelector onProfileSelected={handleProfileSelected} />;
  }

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: Home },
    { id: 'workout' as TabType, name: 'Workout', icon: PlayCircle },
    { id: 'planner' as TabType, name: 'Planner', icon: Calendar },
    { id: 'analytics' as TabType, name: 'Analytics', icon: LineChart },
    { id: 'metrics' as TabType, name: 'Metrics', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* 1. Desktop Sidebar Navigation */}
      <aside className="hidden md:flex md:w-64 bg-slate-950 border-r border-slate-800 flex-col justify-between p-5 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
              <Dumbbell className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight leading-none text-slate-100">
                APEX <span className="text-green-500">GYM</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Personal Coach</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition duration-150 tap-active ${
                    isActive
                      ? 'bg-green-500 text-slate-950 shadow-lg shadow-green-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="space-y-4">
          {showInstallBanner && (
            <button
              onClick={handleInstallApp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl text-xs transition tap-active shadow-lg shadow-green-500/10"
            >
              <Download className="w-4 h-4" />
              <span>Install Desktop App</span>
            </button>
          )}

          {/* Active Profile Info Card */}
          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${activeProfile.avatarColor}`}>
                {activeProfile.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate leading-snug">{activeProfile.name}</p>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Athlete</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition tap-active"
              title="Switch Profile"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-semibold text-center border-t border-slate-850 pt-3">
            Apex PWA v1.1.0
          </div>
        </div>
      </aside>

      {/* 2. Main Content View Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-green-500" />
            <h1 className="font-extrabold text-base tracking-tight text-slate-100">
              APEX <span className="text-green-500">GYM</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {showInstallBanner && (
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-lg text-xs transition tap-active shadow-sm"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
            )}
            
            {/* Mobile Switch Profile Avatar */}
            <button
              onClick={handleLogout}
              className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center font-black text-[10px] border border-slate-800 transition shadow-sm tap-active ${activeProfile.avatarColor}`}
              title="Switch Profile"
            >
              {activeProfile.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        {/* PWA Mobile Install Banner */}
        {showInstallBanner && activeTab === 'dashboard' && (
          <div className="mx-4 mt-4 bg-slate-800 border border-green-500/30 p-4 rounded-2xl flex items-center justify-between shadow-xl md:hidden">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Install Apex</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Add to home screen for offline workout logging.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleInstallApp}
                className="px-3.5 py-1.5 bg-green-500 text-slate-950 text-xs font-bold rounded-lg transition tap-active"
              >
                Install
              </button>
              <button 
                onClick={() => setShowInstallBanner(false)}
                className="p-1 hover:bg-slate-700 rounded-lg text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Container */}
        <div className="p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto flex-1">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab as TabType)} />}
          {activeTab === 'workout' && <ActiveWorkout />}
          {activeTab === 'planner' && <WorkoutPlanner />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'metrics' && <BodyMetrics />}
        </div>
      </main>

      {/* 3. Mobile Bottom Tab Bar Navigation */}
      <nav className="md:hidden bg-slate-950/95 backdrop-blur border-t border-slate-850 fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2.5 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1.5 py-1 px-3.5 rounded-xl transition tap-active ${
                isActive ? 'text-green-500' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2.25]" />
              <span className="text-[9px] font-bold tracking-wide">{tab.name}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export default App;
