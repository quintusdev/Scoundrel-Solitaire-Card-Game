
import React from 'react';
import { UserProfile } from '../types';
import { ACHIEVEMENTS, SIGIL_REWARDS } from '../constants';

interface AchievementsPanelProps {
  profile: UserProfile;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ profile }) => {
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  
  const allAchievements = Object.values(ACHIEVEMENTS);
  const visibleAchievements = allAchievements.filter(ach => {
    const isUnlocked = profile.achievements[ach.id];
    if (ach.hidden && !isUnlocked) return false;
    if (activeCategory !== 'all' && ach.category !== activeCategory) return false;
    return true;
  });

  const categories = ['all', ...Array.from(new Set(allAchievements.map(a => a.category)))];
  
  const totalAchievements = allAchievements.length;
  const unlockedAchievements = Object.keys(profile.achievements).length;
  const progressPercent = (unlockedAchievements / totalAchievements) * 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso Globale</span>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Archivio Imprese</h3>
            </div>
            <span className="text-xl font-black text-cyan-400 tracking-tighter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              {unlockedAchievements} <span className="text-slate-600 text-sm">/ {totalAchievements}</span>
            </span>
          </div>
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-1">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-700 px-8 py-5 rounded-3xl flex flex-col items-center shadow-inner min-w-[160px]">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sigilli Accumulati</span>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
              {profile.abyssSigils || 0}
            </span>
            <span className="text-2xl animate-pulse-slow">🌀</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800/50">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
              activeCategory === cat 
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
                : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {visibleAchievements.map((ach) => {
          const isUnlocked = profile.achievements[ach.id];
          const reward = SIGIL_REWARDS[ach.rarity];
          
          return (
            <div 
              key={ach.id} 
              className={`relative p-6 rounded-[32px] border-2 transition-all duration-500 group ${
                isUnlocked 
                  ? 'bg-slate-800/40 border-slate-700 shadow-lg' 
                  : 'bg-slate-950/30 border-slate-900/50 opacity-40 grayscale hover:grayscale-0 hover:opacity-60'
              }`}
            >
              <div className="flex gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform duration-500 group-hover:scale-110 ${
                  isUnlocked 
                    ? 'bg-slate-900 border border-slate-700 text-white' 
                    : 'bg-slate-950 border border-slate-900 text-slate-700'
                }`}>
                  {isUnlocked ? ach.icon : '❓'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-black text-sm uppercase tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                      {isUnlocked ? ach.name : 'Obiettivo Segreto'}
                    </h4>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      ach.rarity === 'god' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                      ach.rarity === 'epic' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                      ach.rarity === 'rare' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                      'border-slate-700 text-slate-400 bg-slate-800/50'
                    }`}>
                      {ach.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-tight min-h-[2.5em]">
                    {isUnlocked ? ach.desc : 'Continua a esplorare per sbloccare questo segreto...'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Valore:</span>
                      <div className="flex items-center gap-1 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-black text-cyan-400">{reward}</span>
                        <span className="text-[8px]">🌀</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic opacity-50">
                      #{ach.category}
                    </span>
                  </div>
                </div>
              </div>
              {isUnlocked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                  <span className="text-[8px] text-black font-black">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;
