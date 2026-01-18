
import React, { useState, useEffect } from 'react';
import { UserProfile, LogEntry, FastingLog, FastingState } from './types';
import { calculateBMR, isSameDay } from './utils/helpers';
import CaloriesTab from './components/CaloriesTab';
import FastingTab from './components/FastingTab';
import SettingsTab from './components/SettingsTab';

const DEFAULT_PROFILE: UserProfile = {
  name: 'New User',
  dob: '1990-01-01',
  height: 175,
  weight: 70,
  gender: 'male',
  address: '',
  manualLimit: null,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calories' | 'fasting' | 'settings'>('calories');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('wellflow_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem('wellflow_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>(() => {
    const saved = localStorage.getItem('wellflow_fasting_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [fastingState, setFastingState] = useState<FastingState>(() => {
    const saved = localStorage.getItem('wellflow_fasting_state');
    return saved ? JSON.parse(saved) : { isActive: false, startTime: null };
  });

  const [lastResetDate, setLastResetDate] = useState<number>(() => {
    const saved = localStorage.getItem('wellflow_last_reset');
    return saved ? parseInt(saved) : Date.now();
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem('wellflow_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('wellflow_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('wellflow_fasting_logs', JSON.stringify(fastingLogs));
  }, [fastingLogs]);

  useEffect(() => {
    localStorage.setItem('wellflow_fasting_state', JSON.stringify(fastingState));
  }, [fastingState]);

  useEffect(() => {
    localStorage.setItem('wellflow_last_reset', lastResetDate.toString());
  }, [lastResetDate]);

  // Midnight Reset Logic
  useEffect(() => {
    const checkReset = () => {
      const now = Date.now();
      if (!isSameDay(now, lastResetDate)) {
        setLastResetDate(now);
      }
    };
    const interval = setInterval(checkReset, 60000);
    checkReset();
    return () => clearInterval(interval);
  }, [lastResetDate]);

  const dailyLimit = profile.manualLimit || calculateBMR(profile);

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const startFast = (startTime: number) => {
    setFastingState({ isActive: true, startTime });
  };

  const endFast = () => {
    if (fastingState.isActive && fastingState.startTime) {
      const now = Date.now();
      const newFastingLog: FastingLog = {
        id: crypto.randomUUID(),
        startTime: fastingState.startTime,
        endTime: now,
        duration: now - fastingState.startTime,
      };
      setFastingLogs(prev => [newFastingLog, ...prev]);
    }
    setFastingState({ isActive: false, startTime: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-slate-200 overflow-hidden">
      {/* Header with Settings Access */}
      <header className="bg-white px-6 pt-6 pb-4 flex justify-between items-center border-b border-slate-50">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">#SelfLove</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">1 Corinthians 6:19-20</p>
        </div>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`p-2.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </header>

      {/* Massive 2-Tab Navigation */}
      <nav className="bg-white border-b border-slate-100 grid grid-cols-2 h-28">
        <button 
          onClick={() => setActiveTab('calories')}
          className={`relative flex flex-col items-center justify-center transition-all ${activeTab === 'calories' ? 'text-rose-600 bg-rose-50/20' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`${activeTab === 'calories' ? 'h-9 w-9' : 'h-8 w-8'} transition-all`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'calories' ? 2.5 : 2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className={`text-[12px] mt-1 font-black uppercase tracking-widest ${activeTab === 'calories' ? 'opacity-100' : 'opacity-60'}`}>Calories</span>
          {activeTab === 'calories' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-rose-500 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('fasting')}
          className={`relative flex flex-col items-center justify-center transition-all ${activeTab === 'fasting' ? 'text-indigo-600 bg-indigo-50/20' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className={`${activeTab === 'fasting' ? 'h-9 w-9' : 'h-8 w-8'} transition-all`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === 'fasting' ? 2.5 : 2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fastingState.isActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
              </span>
            )}
          </div>
          <span className={`text-[12px] mt-1 font-black uppercase tracking-widest ${activeTab === 'fasting' ? 'opacity-100' : 'opacity-60'}`}>Fasting</span>
          {activeTab === 'fasting' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-500 rounded-t-full" />}
        </button>
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {activeTab === 'calories' && (
          <CaloriesTab logs={logs} dailyLimit={dailyLimit} onAddLog={addLog} onDeleteLog={deleteLog} />
        )}
        {activeTab === 'fasting' && (
          <FastingTab 
            fastingState={fastingState} 
            fastingLogs={fastingLogs} 
            onStartFast={startFast} 
            onEndFast={endFast} 
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab profile={profile} onSaveProfile={setProfile} />
        )}
      </main>
    </div>
  );
};

export default App;
