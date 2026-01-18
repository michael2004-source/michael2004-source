
import React from 'react';
import { Stats } from '../types.ts';

interface StatsTrackerProps {
  stats: Stats;
}

const StatItem: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => (
  <div className={`flex items-center p-4 bg-slate-100 rounded-lg`}>
    <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${color}`}>
      <i className={`fas ${icon} text-white`}></i>
    </div>
    <div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
    </div>
  </div>
);

const StatsTracker: React.FC<StatsTrackerProps> = ({ stats }) => {
  const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) + '%' : 'N/A';
  
  return (
    <div className="w-full max-w-xl p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Your Progress</h2>
        <div className="grid grid-cols-2 gap-4">
            <StatItem icon="fa-bullseye" label="Accuracy" value={accuracy} color="bg-sky-500" />
            <StatItem icon="fa-fire" label="Streak" value={stats.streak} color="bg-amber-500" />
            <StatItem icon="fa-check" label="Correct" value={stats.correct} color="bg-emerald-500" />
            <StatItem icon="fa-times" label="Incorrect" value={stats.incorrect} color="bg-rose-500" />
        </div>
    </div>
  );
};

export default StatsTracker;
