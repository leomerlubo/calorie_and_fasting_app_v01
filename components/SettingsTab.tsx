
import React, { useState, useRef } from 'react';
import { UserProfile, Gender } from '../types';
import { calculateBMR } from '../utils/helpers';

interface SettingsTabProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedBMR = calculateBMR(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'height' || name === 'weight' ? Number(value) : value,
    }));
  };

  const toggleManualLimit = (enable: boolean) => {
    setFormData(prev => ({
      ...prev,
      manualLimit: enable ? (prev.manualLimit || suggestedBMR) : null,
    }));
  };

  const handleExport = () => {
    const data = {
      profile: localStorage.getItem('wellflow_profile'),
      logs: localStorage.getItem('wellflow_logs'),
      fastingLogs: localStorage.getItem('wellflow_fasting_logs'),
      fastingState: localStorage.getItem('wellflow_fasting_state'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selflove_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.profile) localStorage.setItem('wellflow_profile', data.profile);
        if (data.logs) localStorage.setItem('wellflow_logs', data.logs);
        if (data.fastingLogs) localStorage.setItem('wellflow_fasting_logs', data.fastingLogs);
        if (data.fastingState) localStorage.setItem('wellflow_fasting_state', data.fastingState);
        
        alert('Data imported successfully! The app will reload.');
        window.location.reload();
      } catch (err) {
        alert('Failed to import data. Please ensure the file is a valid backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Your Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-colors ${
            isEditing ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl flex items-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm text-2xl">
              👤
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Name</p>
              <p className="text-lg font-bold text-slate-800">{profile.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">DOB</p>
              <p className="font-bold text-slate-800">{new Date(profile.dob).toLocaleDateString()}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Gender</p>
              <p className="font-bold text-slate-800 capitalize">{profile.gender}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Height</p>
              <p className="font-bold text-slate-800">{profile.height} cm</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Weight</p>
              <p className="font-bold text-slate-800">{profile.weight} kg</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-rose-800 font-black uppercase text-[10px] tracking-widest">Daily Calorie Goal</h3>
              <span className="bg-rose-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                {profile.manualLimit ? 'Manual' : 'BMR Auto'}
              </span>
            </div>
            <p className="text-3xl font-black text-rose-900">
              {(profile.manualLimit || calculateBMR(profile)).toFixed(0)} <span className="text-sm font-medium opacity-60">kcal</span>
            </p>
          </div>

          {profile.address && (
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Location / Address</p>
              <p className="font-bold text-slate-800 truncate">{profile.address}</p>
            </div>
          )}

          {/* Data Management Section */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Data Management</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <button 
                onClick={handleImportClick}
                className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json"
                onChange={handleImportFile}
              />
            </div>
            <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed">
              Export your data as a JSON file to keep a local backup or move your logs to another device.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">DOB</label>
                <input 
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all appearance-none font-bold text-slate-800"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Height (cm)</label>
                <input 
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weight (kg)</label>
                <input 
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Address / Location</label>
              <input 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="City or Full Address"
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.manualLimit !== null}
                    onChange={(e) => toggleManualLimit(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </div>
                <span className="text-sm font-black uppercase tracking-tight text-slate-700">Set Manual Calorie Limit</span>
              </label>

              {formData.manualLimit !== null ? (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Limit (kcal)</label>
                  <input 
                    type="number"
                    name="manualLimit"
                    value={formData.manualLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, manualLimit: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                  />
                </div>
              ) : (
                <div className="bg-rose-50/50 p-3 rounded-xl text-rose-600 text-xs font-bold border border-rose-100">
                  Using BMR calculation: <span className="font-black underline">{suggestedBMR.toFixed(0)} kcal</span>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 mt-4">
            Save Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default SettingsTab;
