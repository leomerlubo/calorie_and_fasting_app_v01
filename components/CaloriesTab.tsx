
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
  
  // Show red if remaining is low or negative
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
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-6 bg-white rounded-3xl shadow-sm">
        <CircularProgress 
          percentage={percentage} 
          label={remaining.toFixed(0)} 
          subLabel={remaining < 0 ? "Over Limit!" : "kcal left"}
          isRedAlert={isRedAlert}
          color="text-rose-600"
          size={240}
          strokeWidth={14}
        />
        <div className="flex gap-8 mt-6">
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase font-semibold">Consumed</p>
            <p className="text-xl font-bold text-slate-800">{consumed}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs uppercase font-semibold">Burned</p>
            <p className="text-xl font-bold text-slate-800">{burned}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setFoodModalOpen(true)}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-bold text-sm">Log Food</span>
        </button>
        <button 
          onClick={() => setActivityModalOpen(true)}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-bold text-sm">Log Activity</span>
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-slate-800 font-bold px-2">Daily Logs</h3>
        {todayLogs.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No logs for today yet.</p>
        ) : (
          todayLogs.map(log => (
            <div key={log.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${log.type === 'food' ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-500'}`}>
                  {log.type === 'food' ? '🍽️' : '🏃'}
                </div>
                <div>
                  <p className="text-slate-800 font-semibold">{log.name}</p>
                  <p className="text-slate-400 text-xs">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold ${log.type === 'food' ? 'text-slate-700' : 'text-orange-600'}`}>
                  {log.type === 'food' ? `-${log.calories}` : `+${log.calories}`} kcal
                </span>
                <button 
                  onClick={() => setLogToDelete(log)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Food Modal */}
      <Modal isOpen={isFoodModalOpen} onClose={() => setFoodModalOpen(false)} title="Log Food">
        <form onSubmit={handleAddFood} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Food Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              placeholder="e.g. Chicken Salad"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Calories (kcal)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              placeholder="0"
              value={foodCalories}
              onChange={(e) => setFoodCalories(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100">
            Log Food
          </button>
        </form>
      </Modal>

      {/* Log Activity Modal */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setActivityModalOpen(false)} title="Log Activity">
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Activity</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Calories Burned (kcal)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              placeholder="0"
              value={activityCalories}
              onChange={(e) => setActivityCalories(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100">
            Log Activity
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!logToDelete} 
        onClose={() => setLogToDelete(null)} 
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete <span className="font-bold">"{logToDelete?.name}"</span>?</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setLogToDelete(null)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CaloriesTab;
