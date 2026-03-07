
import React from 'react';
import { UserProfile, AltarNode } from '../types';
import { ALTAR_NODES } from '../constants';

interface AltarOfAbyssProps {
  profile: UserProfile;
  onUnlock: (nodeId: string) => void;
}

const AltarOfAbyss: React.FC<AltarOfAbyssProps> = ({ profile, onUnlock }) => {
  const branches = ['blood', 'steel', 'shadow'] as const;
  const sigils = profile.abyssSigils || 0;
  const unlocks = profile.altarUnlocks || [];

  const canUnlock = (node: AltarNode) => {
    if (unlocks.includes(node.id)) return false;
    if (sigils < node.cost) return false;
    if (node.requires && !unlocks.includes(node.requires)) return false;
    return true;
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-[40px] flex items-center justify-between shadow-2xl">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Altare dell'Abisso</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Meta-progressione: Sacrifica i sigilli per sbloccare poteri oscuri.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 px-8 py-5 rounded-3xl flex flex-col items-center shadow-inner">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sigilli Disponibili</span>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
              {sigils}
            </span>
            <span className="text-2xl animate-pulse-slow">🌀</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {branches.map(branch => (
          <div key={branch} className="space-y-6">
            <div className="flex items-center gap-3 pl-4 border-l-4 border-slate-800">
              <span className="text-2xl">
                {branch === 'blood' ? '🩸' : branch === 'steel' ? '⚔️' : '🌑'}
              </span>
              <h4 className="text-lg font-black text-white uppercase tracking-widest italic">
                {branch === 'blood' ? 'Sangue' : branch === 'steel' ? 'Acciaio' : 'Ombra'}
              </h4>
            </div>

            <div className="space-y-4">
              {ALTAR_NODES.filter(n => n.branch === branch).sort((a, b) => a.tier - b.tier).map(node => {
                const isUnlocked = unlocks.includes(node.id);
                const isAvailable = canUnlock(node);
                const isLocked = !isUnlocked && !isAvailable;
                const hasPrereq = node.requires && !unlocks.includes(node.requires);

                return (
                  <div 
                    key={node.id}
                    className={`relative p-6 rounded-3xl border-2 transition-all duration-300 group ${
                      isUnlocked 
                        ? 'bg-slate-800/40 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                        : isAvailable 
                          ? 'bg-slate-900 border-slate-700 hover:border-cyan-400 cursor-pointer hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                          : 'bg-slate-950 border-slate-900 opacity-40 grayscale'
                    }`}
                    onClick={() => isAvailable && onUnlock(node.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isUnlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          Tier {node.tier}
                        </span>
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {node.type}
                        </span>
                      </div>
                      {!isUnlocked && (
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          <span className={`text-[10px] font-black ${sigils >= node.cost ? 'text-cyan-400' : 'text-red-500'}`}>
                            {node.cost}
                          </span>
                          <span className="text-[8px]">🌀</span>
                        </div>
                      )}
                    </div>

                    <h5 className={`font-black text-sm uppercase tracking-tight mb-1 ${isUnlocked ? 'text-cyan-400' : 'text-white'}`}>
                      {node.name}
                    </h5>
                    <p className="text-xs text-slate-400 leading-tight">
                      {node.description}
                    </p>

                    {hasPrereq && (
                      <div className="mt-3 pt-3 border-t border-slate-800/50">
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                          Richiede: {ALTAR_NODES.find(n => n.id === node.requires)?.name}
                        </p>
                      </div>
                    )}

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
        ))}
      </div>
    </div>
  );
};

export default AltarOfAbyss;
