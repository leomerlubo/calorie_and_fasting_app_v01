
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { calculateBMR } from '../utils/helpers';

interface SettingsTabProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);

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
      manualLimit: enable ? (prev.manualLimit || Math.round(suggestedBMR)) : null,
    }));
  };

  return (
    <div className="p-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Your Profile</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-rose-600 font-bold text-sm"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50">
            <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Name</p>
            <p className="text-lg font-bold text-slate-800">{profile.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
              <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1">DOB</p>
              <p className="font-bold text-slate-800">{new Date(profile.dob).toLocaleDateString()}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
              <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1">Height</p>
              <p className="font-bold text-slate-800">{profile.height} cm</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
              <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1">Weight</p>
              <p className="font-bold text-slate-800">{profile.weight} kg</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
              <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1">BMR</p>
              <p className="font-bold text-slate-800">{calculateBMR(profile).toFixed(0)} kcal</p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Daily Limit</p>
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded-lg">
                {profile.manualLimit ? 'MANUAL' : 'AUTO'}
              </span>
            </div>
            <p className="text-4xl font-bold italic tracking-tighter">
              {(profile.manualLimit || calculateBMR(profile)).toFixed(0)}
              <span className="text-base font-normal ml-2 opacity-50 not-italic">kcal/day</span>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-4">
            <input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Full Name"
              className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/10"
            />
            <input 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange}
              className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold focus:bg-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height" className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold" />
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight" className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 font-bold" />
            </div>
            
            <div className="py-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-md accent-rose-600"
                  checked={formData.manualLimit !== null}
                  onChange={(e) => toggleManualLimit(e.target.checked)}
                />
                <span className="text-sm font-bold text-slate-700">Set Manual Limit</span>
              </label>

              {formData.manualLimit !== null && (
                <input 
                  type="number" 
                  value={formData.manualLimit} 
                  onChange={(e) => setFormData(p => ({ ...p, manualLimit: Number(e.target.value)}))}
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-white font-black text-rose-600 focus:outline-none"
                />
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="flex-1 py-4 rounded-xl font-bold bg-slate-100 text-slate-500"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 rounded-xl font-bold bg-rose-600 text-white shadow-lg shadow-rose-100"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SettingsTab;
