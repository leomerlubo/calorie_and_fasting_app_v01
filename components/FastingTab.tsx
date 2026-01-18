
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

const STAGES_METADATA = [
  { hours: 0, name: FastingStage.BLOOD_SUGAR_DROPPING, icon: '🩸', desc: 'Insulin levels drop' },
  { hours: 4, name: FastingStage.BLOOD_SUGAR_NORMAL, icon: '⚖️', desc: 'Blood sugar normalizes' },
  { hours: 12, name: FastingStage.FAT_BURNING, icon: '🔥', desc: 'Switching to fat fuel' },
  { hours: 18, name: FastingStage.KETOSIS, icon: '🧠', desc: 'Ketones fueling brain' },
  { hours: 24, name: FastingStage.AUTOPHAGY, icon: '♻️', desc: 'Cellular cleanup' },
  { hours: 48, name: FastingStage.DEEP_AUTOPHAGY, icon: '✨', desc: 'Max regeneration' },
];

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

  const fastingGoalHours = 16;
  const percentage = Math.min(100, (elapsedHours / fastingGoalHours) * 100);

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
    <div className="p-6">
      <div className="flex flex-col items-center mb-12">
        <CircularProgress 
          percentage={fastingState.isActive ? percentage : 0} 
          label={fastingState.isActive ? formatTime(elapsedMs) : "00:00:00"} 
          subLabel={fastingState.isActive ? "Time Fasted" : "Ready to start?"}
          color="text-indigo-600"
          size={290}
          strokeWidth={16}
        />
        
        <div className="mt-10 w-full max-w-[320px]">
          {fastingState.isActive ? (
            <button 
              onClick={() => setEndModalOpen(true)}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              End Fasting
            </button>
          ) : (
            <button 
              onClick={openStartModal}
              className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Fasting Session
            </button>
          )}
        </div>
      </div>

      {/* Metabolic Timeline */}
      <div className="mb-12">
        <h3 className="text-slate-800 text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Metabolic Milestones
        </h3>

        <div className="space-y-8 relative">
          <div className="absolute left-[23px] top-2 bottom-2 w-1 bg-slate-50" />
          {STAGES_METADATA.map((stage, idx) => {
            const isCompleted = elapsedHours >= STAGES_METADATA[idx + 1]?.hours || (idx === STAGES_METADATA.length - 1 && elapsedHours >= stage.hours);
            const isActive = elapsedHours >= stage.hours && (idx === STAGES_METADATA.length - 1 || elapsedHours < STAGES_METADATA[idx + 1].hours);
            const isLocked = elapsedHours < stage.hours;

            return (
              <div key={stage.name} className={`flex gap-5 items-start transition-all duration-500 ${isLocked && !fastingState.isActive ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-4 ${
                  isActive ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-200 animate-pulse' : 
                  isCompleted ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 
                  'bg-white border-slate-50 text-slate-300 shadow-sm'
                }`}>
                  {isCompleted && !isActive ? '✓' : stage.icon}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-indigo-600 scale-105 origin-left transition-transform' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {stage.name}
                    </h4>
                    {isActive && (
                      <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-widest">Active</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] font-bold tracking-wide">{stage.desc} • {stage.hours}h+</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-slate-800 text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Past Fasting Sessions
        </h3>
        
        {fastingLogs.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-10 text-center">
            <p className="text-slate-400 text-sm font-medium">Your fast history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fastingLogs.map(log => (
              <div key={log.id} className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 text-indigo-500 p-3 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-800 font-black text-base">{formatTime(log.duration)}</p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                      {new Date(log.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Ended At</p>
                  <p className="text-slate-600 text-sm font-bold">
                    {new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Fasting Modal */}
      <Modal isOpen={isStartModalOpen} onClose={() => setStartModalOpen(false)} title="Start Fasting">
        <form onSubmit={handleStart} className="space-y-6">
          <p className="text-slate-500 text-sm font-medium">When did you start your fast? The timer will calculate from this point.</p>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Start Date & Time</label>
            <input 
              type="datetime-local" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-black text-slate-800"
              value={customStartTime}
              onChange={(e) => setCustomStartTime(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
            Confirm Start Time
          </button>
        </form>
      </Modal>

      {/* End Fasting Modal */}
      <Modal isOpen={isEndModalOpen} onClose={() => setEndModalOpen(false)} title="Complete Fast">
        <div className="space-y-8 text-center p-2">
          <div className="bg-indigo-50 w-28 h-28 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Great Work!</h4>
            <p className="text-slate-500 text-sm font-medium px-4">
              You fasted for <span className="text-indigo-600 font-black">{formatTime(elapsedMs)}</span>. Ready to finish and log your progress?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setEndModalOpen(false)}
              className="px-4 py-5 rounded-2xl border border-slate-200 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
            >
              Back
            </button>
            <button 
              onClick={handleConfirmEndFast}
              className="px-4 py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
            >
              Complete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FastingTab;
