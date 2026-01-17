
import React from 'react';
import { Stats } from '../types';

interface StatsTrackerProps {
  stats: Stats;
}

const StatsTracker: React.FC<StatsTrackerProps> = ({ stats }) => {
  const accuracy = stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Attempts</p>
        <p className="text-2xl font-bold text-slate-700">{stats.attempts}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Correct</p>
        <p className="text-2xl font-bold text-emerald-600">{stats.correct}</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Accuracy</p>
        <p className="text-2xl font-bold text-indigo-600">{accuracy.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default StatsTracker;
