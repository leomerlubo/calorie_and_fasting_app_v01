
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPES ---
type Gender = 'male' | 'female';
interface UserProfile {
  name: string;
  dob: string;
  height: number;
  weight: number;
  gender: Gender;
  address: string;
  manualLimit: number | null;
}
type ActivityType = 'Walking' | 'Running' | 'Biking' | 'HIIT' | 'Daily Chores' | 'Others';
interface LogEntry {
  id: string;
  type: 'food' | 'activity';
  name: string;
  calories: number;
  timestamp: number;
  activityType?: ActivityType;
}
interface FastingLog {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
}
interface FastingState {
  isActive: boolean;
  startTime: number | null;
}

// --- HELPERS ---
const calculateAge = (dob: string): number => {
  const birthday = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
  return age;
};

const calculateBMR = (profile: UserProfile): number => {
  const age = calculateAge(profile.dob);
  if (profile.gender === 'male') {
    return (10 * profile.weight) + (6.25 * profile.height) - (5 * age) + 5;
  } else {
    return (10 * profile.weight) + (6.25 * profile.height) - (5 * age) - 161;
  }
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const isSameDay = (d1: number, d2: number): boolean => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// --- COMPONENTS ---
interface CircularProgressProps {
  percentage: number;
  label: string;
  subLabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  isRedAlert?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, label, subLabel, size = 200, strokeWidth = 12, color = 'text-blue-500', isRedAlert = false 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
  const displayColor = isRedAlert ? 'text-red-500' : color;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-100" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`${displayColor} transition-all duration-500 ease-out`} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-bold ${displayColor}`}>{label}</span>
        {subLabel && <span className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">{subLabel}</span>}
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 p-2 hover:text-slate-600 transition-colors">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- TABS ---
const CaloriesTab: React.FC<{ logs: LogEntry[], dailyLimit: number, onAddLog: any, onDeleteLog: any }> = ({ logs, dailyLimit, onAddLog, onDeleteLog }) => {
  const [isFoodModalOpen, setFoodModalOpen] = useState(false);
  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<LogEntry | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Walking');
  const [activityCalories, setActivityCalories] = useState('');

  const todayLogs = useMemo(() => logs.filter(log => isSameDay(log.timestamp, Date.now())), [logs]);
  const consumed = todayLogs.filter(log => log.type === 'food').reduce((sum, log) => sum + log.calories, 0);
  const burned = todayLogs.filter(log => log.type === 'activity').reduce((sum, log) => sum + log.calories, 0);
  const netCalories = consumed - burned;
  const remaining = dailyLimit - netCalories;
  const percentage = (netCalories / dailyLimit) * 100;
  const isRedAlert = remaining <= (dailyLimit * 0.1) || remaining < 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center py-4">
        <CircularProgress percentage={percentage} label={remaining.toFixed(0)} subLabel={remaining < 0 ? "Over Limit!" : "kcal left"} isRedAlert={isRedAlert} color="text-rose-600" size={210} strokeWidth={14} />
        <div className="flex gap-8 mt-6">
          <div className="text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Consumed</p>
            <p className="text-xl font-black text-slate-800">{consumed}</p>
          </div>
          <div className="text-center border-x border-slate-100 px-8">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Daily Goal</p>
            <p className="text-xl font-black text-slate-800">{dailyLimit.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Burned</p>
            <p className="text-xl font-black text-slate-800">{burned}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setFoodModalOpen(true)} className="flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-rose-50 text-rose-600 border border-rose-100 shadow-sm active:scale-95 transition-all">
          <div className="bg-white p-3 rounded-2xl shadow-sm"><span className="text-lg">🍎</span></div>
          <span className="font-black text-[10px] uppercase tracking-widest">Eat</span>
        </button>
        <button onClick={() => setActivityModalOpen(true)} className="flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-orange-50 text-orange-600 border border-orange-100 shadow-sm active:scale-95 transition-all">
          <div className="bg-white p-3 rounded-2xl shadow-sm"><span className="text-lg">🔥</span></div>
          <span className="font-black text-[10px] uppercase tracking-widest">Burn</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-slate-800 text-xs font-black uppercase tracking-[0.2em] mb-4 px-1">Today's History</h3>
        {todayLogs.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-widest">No entries today</div>
        ) : (
          todayLogs.map(log => (
            <div key={log.id} className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">{log.type === 'food' ? '🥗' : '🏃'}</span>
                <div>
                  <p className="text-slate-800 font-bold text-sm">{log.name}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-black text-sm ${log.type === 'food' ? 'text-slate-600' : 'text-orange-600'}`}>
                  {log.type === 'food' ? `-${log.calories}` : `+${log.calories}`}
                </span>
                <button onClick={() => setLogToDelete(log)} className="text-slate-200 hover:text-rose-500 p-2 transition-colors">✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isFoodModalOpen} onClose={() => setFoodModalOpen(false)} title="Log Food">
        <form onSubmit={(e) => { e.preventDefault(); onAddLog({ type: 'food', name: foodName, calories: Number(foodCalories) }); setFoodName(''); setFoodCalories(''); setFoodModalOpen(false); }} className="space-y-4">
          <input type="text" placeholder="What did you eat?" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-slate-800" value={foodName} onChange={(e) => setFoodName(e.target.value)} required />
          <input type="number" placeholder="Calories (kcal)" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-slate-800" value={foodCalories} onChange={(e) => setFoodCalories(e.target.value)} required />
          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-100">Log Food</button>
        </form>
      </Modal>

      <Modal isOpen={isActivityModalOpen} onClose={() => setActivityModalOpen(false)} title="Log Activity">
        <form onSubmit={(e) => { e.preventDefault(); onAddLog({ type: 'activity', name: activityType, calories: Number(activityCalories), activityType }); setActivityCalories(''); setActivityModalOpen(false); }} className="space-y-4">
          <select className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-slate-800 appearance-none" value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)}>
            <option value="Walking">Walking</option>
            <option value="Running">Running</option>
            <option value="Biking">Biking</option>
            <option value="HIIT">HIIT</option>
            <option value="Others">Others</option>
          </select>
          <input type="number" placeholder="Calories Burned" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-slate-800" value={activityCalories} onChange={(e) => setActivityCalories(e.target.value)} required />
          <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-100">Log Activity</button>
        </form>
      </Modal>

      <Modal isOpen={!!logToDelete} onClose={() => setLogToDelete(null)} title="Confirm Delete">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setLogToDelete(null)} className="py-4 bg-slate-100 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
          <button onClick={() => { if (logToDelete) onDeleteLog(logToDelete.id); setLogToDelete(null); }} className="py-4 bg-rose-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

const FastingTab: React.FC<{ fastingState: FastingState, fastingLogs: FastingLog[], onStartFast: any, onEndFast: any }> = ({ fastingState, fastingLogs, onStartFast, onEndFast }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isStartModalOpen, setStartModalOpen] = useState(false);
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('');

  useEffect(() => {
    let interval: any;
    if (fastingState.isActive) interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [fastingState.isActive]);

  const elapsedMs = fastingState.isActive && fastingState.startTime ? currentTime - fastingState.startTime : 0;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const percentage = Math.min(100, (elapsedHours / 16) * 100);

  const STAGES = [
    { hours: 0, name: "Sugar Dropping", icon: '🩸' },
    { hours: 12, name: "Fat Burning", icon: '🔥' },
    { hours: 18, name: "Ketosis", icon: '🧠' },
    { hours: 24, name: "Autophagy", icon: '♻️' }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col items-center">
        <CircularProgress percentage={fastingState.isActive ? percentage : 0} label={fastingState.isActive ? formatTime(elapsedMs) : "00:00:00"} subLabel={fastingState.isActive ? "Elapsed" : "Tap to Start"} color="text-indigo-600" size={230} strokeWidth={14} />
        <button onClick={() => fastingState.isActive ? setEndModalOpen(true) : setStartModalOpen(true)} className={`mt-10 w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl active:scale-95 ${fastingState.isActive ? 'bg-slate-900 text-white shadow-slate-100' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
          {fastingState.isActive ? 'End Fasting' : 'Start Fasting session'}
        </button>
      </div>

      <div className="space-y-6">
        <h3 className="text-slate-800 text-xs font-black uppercase tracking-widest px-1">Milestones</h3>
        <div className="grid grid-cols-1 gap-4">
          {STAGES.map((stage) => {
            const isActive = elapsedHours >= stage.hours;
            return (
              <div key={stage.name} className={`flex gap-4 items-center p-4 rounded-3xl border border-slate-100 transition-all ${isActive ? 'bg-indigo-50/30 opacity-100' : 'opacity-40'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100'}`}>{stage.icon}</div>
                <div>
                  <p className={`text-sm font-black uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{stage.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{stage.hours}h+</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isStartModalOpen} onClose={() => setStartModalOpen(false)} title="Start Time">
        <div className="space-y-4">
          <input type="datetime-local" className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold" value={customStartTime} onChange={(e) => setCustomStartTime(e.target.value)} />
          <button onClick={() => { onStartFast(customStartTime ? new Date(customStartTime).getTime() : Date.now()); setStartModalOpen(false); }} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">Confirm & Start</button>
        </div>
      </Modal>

      <Modal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} title="Finish Fast">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setEndModalOpen(false)} className="py-4 bg-slate-100 rounded-xl font-bold uppercase text-[10px] tracking-widest">Back</button>
          <button onClick={() => { onEndFast(); setEndModalOpen(false); }} className="py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Log Fast</button>
        </div>
      </Modal>
    </div>
  );
};

const SettingsTab: React.FC<{ profile: UserProfile, onSaveProfile: any }> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800">Profile Settings</h2>
        {!isEditing && <button onClick={() => setIsEditing(true)} className="text-rose-600 font-black text-xs uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-lg">Edit</button>}
      </div>

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); onSaveProfile(formData); setIsEditing(false); }} className="space-y-4">
          <input className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
          <input type="date" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} placeholder="Height (cm)" />
            <input type="number" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 font-bold" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} placeholder="Weight (kg)" />
          </div>
          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-100">Save Profile</button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Your Daily Allowance</p>
            <p className="text-6xl font-black italic tracking-tighter">{(profile.manualLimit || calculateBMR(profile)).toFixed(0)}<span className="text-base font-normal not-italic opacity-40 ml-2">kcal</span></p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Height</p>
              <p className="text-xl font-black text-slate-800">{profile.height} <span className="text-xs text-slate-400">cm</span></p>
            </div>
            <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Weight</p>
              <p className="text-xl font-black text-slate-800">{profile.weight} <span className="text-xs text-slate-400">kg</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calories' | 'fasting' | 'settings'>('calories');
  const [profile, setProfile] = useState<UserProfile>(() => JSON.parse(localStorage.getItem('selflove_profile_v2') || 'null') || { name: 'User', dob: '1995-01-01', height: 175, weight: 70, gender: 'male', manualLimit: null, address: '' });
  const [logs, setLogs] = useState<LogEntry[]>(() => JSON.parse(localStorage.getItem('selflove_logs_v2') || '[]'));
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>(() => JSON.parse(localStorage.getItem('selflove_fasting_logs_v2') || '[]'));
  const [fastingState, setFastingState] = useState<FastingState>(() => JSON.parse(localStorage.getItem('selflove_fasting_state_v2') || 'null') || { isActive: false, startTime: null });

  useEffect(() => { localStorage.setItem('selflove_profile_v2', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('selflove_logs_v2', JSON.stringify(logs)); }, [logs]);
  useEffect(() => { localStorage.setItem('selflove_fasting_logs_v2', JSON.stringify(fastingLogs)); }, [fastingLogs]);
  useEffect(() => { localStorage.setItem('selflove_fasting_state_v2', JSON.stringify(fastingState)); }, [fastingState]);

  const dailyLimit = profile.manualLimit || calculateBMR(profile);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl border-x border-slate-200 overflow-hidden">
      <header className="bg-white px-8 pt-8 pb-6 flex justify-between items-center border-b border-slate-50">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">#SelfLove</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-0.5">1 Corinthians 6:19-20</p>
        </div>
        <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>⚙️</button>
      </header>

      <nav className="bg-white border-b border-slate-100 grid grid-cols-2 h-24">
        <button onClick={() => setActiveTab('calories')} className={`relative flex flex-col items-center justify-center transition-all ${activeTab === 'calories' ? 'text-rose-600 bg-rose-50/20' : 'text-slate-300 hover:text-slate-400'}`}>
          <span className={`text-2xl mb-1 ${activeTab === 'calories' ? 'scale-110' : ''} transition-transform`}>🥗</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Calories</span>
          {activeTab === 'calories' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-rose-500 rounded-t-full mx-4" />}
        </button>
        <button onClick={() => setActiveTab('fasting')} className={`relative flex flex-col items-center justify-center transition-all ${activeTab === 'fasting' ? 'text-indigo-600 bg-indigo-50/20' : 'text-slate-300 hover:text-slate-400'}`}>
          <span className={`text-2xl mb-1 ${activeTab === 'fasting' ? 'scale-110' : ''} transition-transform`}>⏰</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Fasting</span>
          {activeTab === 'fasting' && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-500 rounded-t-full mx-4" />}
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto bg-white custom-scrollbar pb-10">
        {activeTab === 'calories' && <CaloriesTab logs={logs} dailyLimit={dailyLimit} onAddLog={(e: any) => setLogs([{...e, id: Math.random().toString(), timestamp: Date.now()}, ...logs])} onDeleteLog={(id: string) => setLogs(logs.filter(l => l.id !== id))} />}
        {activeTab === 'fasting' && <FastingTab fastingState={fastingState} fastingLogs={fastingLogs} onStartFast={(t: number) => setFastingState({isActive: true, startTime: t})} onEndFast={() => { if (fastingState.startTime) setFastingLogs([{id: Math.random().toString(), startTime: fastingState.startTime, endTime: Date.now(), duration: Date.now() - fastingState.startTime}, ...fastingLogs]); setFastingState({isActive: false, startTime: null}); }} />}
        {activeTab === 'settings' && <SettingsTab profile={profile} onSaveProfile={setProfile} />}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
