
import React from 'react';
import { LANGUAGES, PLAYBACK_SPEEDS, VOICES } from '../constants.ts';
import { Language, PlaybackSpeed } from '../types.ts';

interface SettingsPanelProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  min: number;
  onMinChange: (val: number) => void;
  max: number;
  onMaxChange: (val: number) => void;
  speed: PlaybackSpeed;
  onSpeedChange: (val: PlaybackSpeed) => void;
  voice: string;
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
  voice,
  onVoiceChange,
  isGenerating,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-earth-americas"></i> Language
        </h3>
        <select
          value={language.code}
          onChange={(e) => {
            const selected = LANGUAGES.find((l) => l.code === e.target.value);
            if (selected) onLanguageChange(selected);
          }}
          disabled={isGenerating}
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name} ({l.nativeName})
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-arrows-left-right"></i> Number Range
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Min</label>
            <input
              type="number"
              value={min}
              onChange={(e) => onMinChange(parseInt(e.target.value) || 0)}
              disabled={isGenerating}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Max</label>
            <input
              type="number"
              value={max}
              onChange={(e) => onMaxChange(parseInt(e.target.value) || 0)}
              disabled={isGenerating}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-gauge-high"></i> Speed
        </h3>
        <div className="flex flex-wrap gap-2">
          {PLAYBACK_SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                speed === s
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fa-solid fa-microphone-lines"></i> Voice Style
        </h3>
        <select
          value={voice}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          {VOICES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SettingsPanel;
