
import React, { useEffect, useState } from 'react';
import { LANGUAGES, PLAYBACK_SPEEDS } from '../constants.ts';
import { Language, PlaybackSpeed } from '../types.ts';
import { getSystemVoices, waitForVoices } from '../services/ttsService.ts';

interface SettingsPanelProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  min: number;
  onMinChange: (val: number) => void;
  max: number;
  onMaxChange: (val: number) => void;
  speed: PlaybackSpeed;
  onSpeedChange: (val: PlaybackSpeed) => void;
  selectedVoiceName: string;
  onVoiceChange: (val: string) => void;
  isGenerating: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  language,
  onLanguageChange,
  min,
  onMinChange,
  max,
  onMaxChange,
  speed,
  onSpeedChange,
  selectedVoiceName,
  onVoiceChange,
  isGenerating,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const syncVoices = (voices: SpeechSynthesisVoice[]) => {
      // Filter voices by selected language prefix
      const langPrefix = language.code.split('-')[0].toLowerCase();
      
      // Some browsers have different naming conventions, we try to find a good match
      let filtered = voices.filter(v => 
        v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
      );

      // Preferred: Google high quality voices
      const googleVoices = filtered.filter(v => v.name.toLowerCase().includes('google'));
      if (googleVoices.length > 0) {
        filtered = googleVoices;
      }

      setAvailableVoices(filtered);
      
      // Auto-select a voice if none is selected for the current language
      if (filtered.length > 0) {
        const currentVoiceExists = filtered.find(v => v.name === selectedVoiceName);
        if (!selectedVoiceName || !currentVoiceExists) {
          onVoiceChange(filtered[0].name);
        }
      }
    };

    // Try immediate load
    const currentVoices = getSystemVoices();
    if (currentVoices.length > 0) {
      syncVoices(currentVoices);
    } else {
      waitForVoices().then(syncVoices);
    }

    // Some browsers need this event listener kept alive
    const voicesChangedHandler = () => syncVoices(getSystemVoices());
    window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
    };
  }, [language, onVoiceChange, selectedVoiceName]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-earth-americas text-indigo-500"></i> Target Language
        </h3>
        <select
          value={language.code}
          onChange={(e) => {
            const selected = LANGUAGES.find((l) => l.code === e.target.value);
            if (selected) onLanguageChange(selected);
          }}
          disabled={isGenerating}
          className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeName} ({l.name})
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-arrows-left-right text-indigo-500"></i> Difficulty Range
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-tighter">Min</label>
            <input
              type="number"
              value={min}
              onChange={(e) => onMinChange(parseInt(e.target.value) || 0)}
              disabled={isGenerating}
              className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-tighter">Max</label>
            <input
              type="number"
              value={max}
              onChange={(e) => onMaxChange(parseInt(e.target.value) || 0)}
              disabled={isGenerating}
              className="w-full p-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-gauge-high text-indigo-500"></i> Speed
        </h3>
        <div className="flex flex-wrap gap-2">
          {PLAYBACK_SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                speed === s
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100'
                  : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-microphone-lines text-indigo-500"></i> Voice Selection
        </h3>
        <select
          value={selectedVoiceName}
          onChange={(e) => onVoiceChange(e.target.value)}
          disabled={isGenerating || availableVoices.length === 0}
          className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236366f1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22/%3E%3C/svg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
        >
          {availableVoices.length === 0 ? (
            <option>Loading system voices...</option>
          ) : (
            availableVoices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))
          )}
        </select>
        <p className="mt-2 text-[10px] text-slate-400 leading-tight">
          Only high-quality system voices for {language.name} are shown.
        </p>
      </div>
    </div>
  );
};

export default SettingsPanel;
