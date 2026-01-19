
import React from 'react';
import { Settings } from '../types.ts';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, settings, onSettingsChange, onClose }) => {
  if (!isOpen) return null;

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onSettingsChange({ ...settings, [name]: Math.max(0, parseInt(value, 10)) });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Number Range
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                name="min"
                value={settings.min}
                onChange={handleRangeChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Min"
              />
              <span className="text-slate-500">to</span>
              <input
                type="number"
                name="max"
                value={settings.max}
                onChange={handleRangeChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;