
import React, { useState, useEffect } from 'react';
import { FastingState, FastingLog, FastingStage } from '../types';
import CircularProgress from './CircularProgress';
import Modal from './Modal';
import { formatTime, getFastingStage } from '../utils/helpers';

interface FastingTabProps {
  fastingState: FastingState;
  fastingLogs: FastingLog[];
  onStartFast: (startTime: number) => void;
  onEndFast: () => void;
}

const FastingTab: React.FC<FastingTabProps> = ({ fastingState, fastingLogs, onStartFast, onEndFast }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isStartModalOpen, setStartModalOpen] = useState(false);
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (fastingState.isActive) {
      interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fastingState.isActive]);

  const elapsedMs = fastingState.isActive && fastingState.startTime ? currentTime - fastingState.startTime : 0;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // Default goal of 16 hours for the progress bar
  const fastingGoalHours = 16;
  const percentage = Math.min(100, (elapsedHours / fastingGoalHours) * 100);
  const stageInfo = getFastingStage(elapsedHours);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = customStartTime ? new Date(customStartTime).getTime() : Date.now();
    onStartFast(startTime);
    setStartModalOpen(false);
  };

  const openStartModal = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
    setCustomStartTime(localISOTime);
    setStartModalOpen(true);
  };

  const handleConfirmEndFast = () => {
    onEndFast();
    setEndModalOpen(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-6 bg-white rounded-3xl shadow-sm">
        <CircularProgress 
          percentage={fastingState.isActive ? percentage : 0} 
          label={fastingState.isActive ? formatTime(elapsedMs) : "00:00:00"} 
          subLabel={fastingState.isActive ? "Elapsed" : "Tap to start"}
          color="text-indigo-600"
          size={240}
          strokeWidth={14}
        />
        
        {fastingState.isActive && (
          <div className="mt-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className={`font-bold ${stageInfo.color}`}>{stageInfo.name}</p>
            <p className="text-slate-500 text-sm">{stageInfo.description}</p>
          </div>
        )}

        <div className="mt-8 w-full px-8">
          {fastingState.isActive ? (
            <button 
              onClick={() => setEndModalOpen(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
            >
              End Fast
            </button>
          ) : (
            <button 
              onClick={openStartModal}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              Start Fasting
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-slate-800 font-bold px-2">Recent Fasts</h3>
        {fastingLogs.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No fasting sessions logged yet.</p>
        ) : (
          fastingLogs.slice(0, 5).map(log => (
            <div key={log.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 text-indigo-500 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-800 font-semibold">{formatTime(log.duration)}</p>
                  <p className="text-slate-400 text-xs">{new Date(log.startTime).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">Ended at</p>
                <p className="text-slate-600 font-medium text-sm">{new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Start Fasting Modal */}
      <Modal isOpen={isStartModalOpen} onClose={() => setStartModalOpen(false)} title="When did you start?">
        <form onSubmit={handleStart} className="space-y-4">
          <p className="text-slate-500 text-sm">Pick the time you had your last meal.</p>
          <input 
            type="datetime-local" 
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={customStartTime}
            onChange={(e) => setCustomStartTime(e.target.value)}
          />
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Confirm and Start
          </button>
        </form>
      </Modal>

      {/* End Fasting Modal */}
      <Modal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} title="Finish Fast">
        <div className="space-y-4">
          <p className="text-slate-600">Great job! You fasted for <span className="font-bold">{formatTime(elapsedMs)}</span>. Ready to log it?</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setEndModalOpen(false)}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleConfirmEndFast}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Log Fast
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FastingTab;
