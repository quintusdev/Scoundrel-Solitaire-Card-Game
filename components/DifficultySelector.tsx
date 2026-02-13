
import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from '../constants';

interface Props {
  unlocks: { hard: boolean; inferno: boolean };
  onSelect: (diff: Difficulty) => void;
  onCancel: () => void;
}

const DifficultySelector: React.FC<Props> = ({ unlocks, onSelect, onCancel }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center p-6 bg-slate-950 z-50">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-4xl font-black text-white uppercase text-center mb-2 tracking-tighter">Seleziona Difficoltà</h2>
        <p className="text-slate-500 text-center text-xs font-bold uppercase tracking-widest mb-10">Sfida il dungeon alle tue condizioni</p>

        <div className="grid grid-cols-1 gap-4">
          <DifficultyCard 
            type="normal" 
            unlocked={true} 
            onSelect={() => onSelect('normal')} 
          />
          <DifficultyCard 
            type="hard" 
            unlocked={unlocks.hard} 
            onSelect={() => onSelect('hard')} 
            requirement="Vinci una partita Normale"
          />
          <DifficultyCard 
            type="inferno" 
            unlocked={unlocks.inferno} 
            onSelect={() => onSelect('inferno')} 
            requirement="Vinci una partita Hard"
          />
        </div>

        <button onClick={onCancel} className="w-full mt-8 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">Annulla</button>
      </div>
    </div>
  );
};

const DifficultyCard: React.FC<{ type: Difficulty, unlocked: boolean, onSelect: () => void, requirement?: string }> = ({ type, unlocked, onSelect, requirement }) => {
  const config = DIFFICULTY_CONFIG[type];
  return (
    <button 
      disabled={!unlocked}
      onClick={onSelect}
      className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${unlocked ? 'bg-slate-800/50 border-slate-800 hover:border-blue-500 hover:-translate-y-1' : 'bg-slate-950/50 border-slate-900 opacity-50 grayscale'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-900 border border-white/5 ${config.color}`}>
         {type === 'normal' ? '🛡️' : type === 'hard' ? '⚔️' : '🔥'}
      </div>
      <div className="flex-1">
        <h3 className={`font-black uppercase tracking-tight ${config.color}`}>{config.label}</h3>
        <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">{config.description}</p>
        {!unlocked && <p className="text-[9px] font-black text-red-500/80 uppercase mt-2 tracking-tighter">🔒 Bloccato: {requirement}</p>}
      </div>
      {unlocked && <div className="text-slate-600 group-hover:text-white transition-colors">➔</div>}
    </button>
  );
};

export default DifficultySelector;
