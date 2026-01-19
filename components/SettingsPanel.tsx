
import React from 'react';
import { Settings, Language } from '../types.ts';
import { SUPPORTED_LANGUAGES } from '../constants.ts';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, settings, onSettingsChange, onClose }) => {
  if (!isOpen) return null;

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    let newMin = settings.min;
    let newMax = settings.max;
    const intValue = parseInt(value, 10) || 0;

    if (name === 'min') {
        newMin = Math.max(0, intValue);
        if (newMin > newMax) {
            newMax = newMin;
        }
    } else if (name === 'max') {
        newMax = Math.max(0, intValue);
        if (newMax < newMin) {
            newMin = newMax;
        }
    }
    onSettingsChange({ ...settings, min: newMin, max: newMax });
  };
  
  const handleLanguageChange = (newLanguage: Language) => {
    onSettingsChange({ ...settings, language: newLanguage });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times fa-lg"></i>
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">
                Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`text-center p-3 rounded-lg font-semibold transition-all duration-200 ${
                            settings.language.code === lang.code
                                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-offset-2 ring-indigo-500'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'
                        }`}
                    >
                        {lang.name}
                    </button>
                ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-3">
              Number Range
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                name="min"
                value={settings.min}
                onChange={handleRangeChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                placeholder="Min"
              />
              <span className="text-slate-500 font-semibold">to</span>
              <input
                type="number"
                name="max"
                value={settings.max}
                onChange={handleRangeChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
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