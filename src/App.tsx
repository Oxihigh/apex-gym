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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* 1. Sleek Minimalist Top Header (Branding & Profile) */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-slate-950/70 backdrop-blur-md border-b border-slate-900/80 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
            <Dumbbell className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight leading-none text-slate-100 font-heading uppercase">
              APEX <span className="text-green-500">GYM</span>
            </h1>
            <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase">Coach</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {showInstallBanner && (
            <button
              onClick={handleInstallApp}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-lg text-xs transition tap-active shadow-sm"
            >
              <Download className="w-3 h-3" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}
          
          {/* Active Profile Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800/80 pl-2 pr-1.5 py-1 rounded-xl">
            <div className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center font-black text-[9px] ${activeProfile.avatarColor}`}>
              {activeProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-350">{activeProfile.name}</span>
            <button
              onClick={handleLogout}
              className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              title="Switch Profile"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* PWA Mobile Install Banner */}
      {showInstallBanner && activeTab === 'dashboard' && (
        <div className="mx-4 mt-20 bg-slate-900 border border-green-500/20 p-4 rounded-2xl flex items-center justify-between shadow-xl sm:mx-6 md:mx-8">
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
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Content View Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-20 pb-28">
        {/* Page Container */}
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl w-full mx-auto flex-1">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab) => setActiveTab(tab as TabType)} />}
          {activeTab === 'workout' && <ActiveWorkout />}
          {activeTab === 'planner' && <WorkoutPlanner />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'metrics' && <BodyMetrics />}
        </div>
      </main>

      {/* 3. Floating Bottom Nav Dock (Desktop & Mobile) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-lg border border-slate-800/80 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 max-w-[95%] w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 py-2.5 px-4.5 rounded-xl transition duration-150 tap-active ${
                isActive 
                  ? 'bg-green-500 text-slate-950 font-black shadow-lg shadow-green-500/25' 
                  : 'text-slate-450 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline text-xs font-extrabold">{tab.name}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export default App;
