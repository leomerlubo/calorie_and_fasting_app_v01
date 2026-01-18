
import React, { useState } from 'react';
import { LogEntry, ActivityType } from '../types';
import CircularProgress from './CircularProgress';
import Modal from './Modal';
import { isSameDay } from '../utils/helpers';

interface CaloriesTabProps {
  logs: LogEntry[];
  dailyLimit: number;
  onAddLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  onDeleteLog: (id: string) => void;
}

const CaloriesTab: React.FC<CaloriesTabProps> = ({ logs, dailyLimit, onAddLog, onDeleteLog }) => {
  const [isFoodModalOpen, setFoodModalOpen] = useState(false);
  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<LogEntry | null>(null);
  
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Walking');
  const [activityCalories, setActivityCalories] = useState('');

  const todayLogs = logs.filter(log => isSameDay(log.timestamp, Date.now()));
  
  const consumed = todayLogs
    .filter(log => log.type === 'food')
    .reduce((sum, log) => sum + log.calories, 0);
  
  const burned = todayLogs
    .filter(log => log.type === 'activity')
    .reduce((sum, log) => sum + log.calories, 0);

  const netCalories = consumed - burned;
  const remaining = dailyLimit - netCalories;
  const percentage = (netCalories / dailyLimit) * 100;
  
  const isRedAlert = remaining <= (dailyLimit * 0.1) || remaining < 0;

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !foodCalories) return;
    onAddLog({ type: 'food', name: foodName, calories: Number(foodCalories) });
    setFoodName('');
    setFoodCalories('');
    setFoodModalOpen(false);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityCalories) return;
    onAddLog({ 
      type: 'activity', 
      name: activityType, 
      calories: Number(activityCalories),
      activityType 
    });
    setActivityCalories('');
    setActivityModalOpen(false);
  };

  const confirmDelete = () => {
    if (logToDelete) {
      onDeleteLog(logToDelete.id);
      setLogToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col items-center mb-6 pt-2">
        <CircularProgress 
          percentage={percentage} 
          label={remaining.toFixed(0)} 
          subLabel={remaining < 0 ? "Over Limit!" : "kcal left"}
          isRedAlert={isRedAlert}
          color="text-rose-600"
          size={230}
          strokeWidth={16}
        />
        <div className="flex gap-10 mt-6">
          <div className="text-center">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">In</p>
            <p className="text-xl font-black text-slate-800">{consumed}</p>
          </div>
          <div className="text-center border-x border-slate-100 px-8">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Goal</p>
            <p className="text-xl font-black text-slate-800">{dailyLimit.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Out</p>
            <p className="text-xl font-black text-slate-800">{burned}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <button 
          onClick={() => setFoodModalOpen(true)}
          className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-rose-50 text-rose-600 border border-rose-100 shadow-sm active:scale-95 transition-all"
        >
          <div className="bg-white p-3 rounded-2xl shadow-sm text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Eat</span>
        </button>
        <button 
          onClick={() => setActivityModalOpen(true)}
          className="flex flex-col items-center gap-3 p-6 rounded-[2rem] bg-orange-50 text-orange-600 border border-orange-100 shadow-sm active:scale-95 transition-all"
        >
          <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">Burn</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-800 text-xs font-black uppercase tracking-[0.2em]">History</h3>
          <span className="text-[10px] font-bold text-slate-300 uppercase">Today</span>
        </div>
        
        {todayLogs.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
            <p className="text-slate-400 text-sm font-medium">Your logs will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayLogs.map(log => (
              <div key={log.id} className="group bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${log.type === 'food' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                    {log.type === 'food' ? '🍽️' : '⚡'}
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-sm leading-tight">{log.name}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-sm ${log.type === 'food' ? 'text-slate-600' : 'text-orange-600'}`}>
                    {log.type === 'food' ? `-${log.calories}` : `+${log.calories}`}
                  </span>
                  <button onClick={() => setLogToDelete(log)} className="text-slate-200 hover:text-rose-500 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isFoodModalOpen} onClose={() => setFoodModalOpen(false)} title="Log Food">
        <form onSubmit={handleAddFood} className="space-y-4">
          <input 
            type="text" 
            placeholder="What did you eat?"
            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
          />
          <input 
            type="number" 
            placeholder="Calories"
            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
            value={foodCalories}
            onChange={(e) => setFoodCalories(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-200">
            Log Entry
          </button>
        </form>
      </Modal>

      <Modal isOpen={isActivityModalOpen} onClose={() => setActivityModalOpen(false)} title="Log Activity">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <select 
            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 appearance-none"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
          >
            <option value="Walking">Walking</option>
            <option value="Running">Running</option>
            <option value="Biking">Biking</option>
            <option value="HIIT">HIIT</option>
            <option value="Daily Chores">Daily Chores</option>
            <option value="Others">Others</option>
          </select>
          <input 
            type="number" 
            placeholder="Calories Burned"
            className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
            value={activityCalories}
            onChange={(e) => setActivityCalories(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200">
            Log Entry
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!logToDelete} onClose={() => setLogToDelete(null)} title="Delete?">
        <div className="space-y-6 text-center">
          <p className="text-slate-500 font-medium">Remove <span className="text-rose-600 font-bold">"{logToDelete?.name}"</span>?</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setLogToDelete(null)} className="py-4 bg-slate-100 rounded-xl font-bold uppercase text-[10px] tracking-widest">No</button>
            <button onClick={confirmDelete} className="py-4 bg-rose-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CaloriesTab;
