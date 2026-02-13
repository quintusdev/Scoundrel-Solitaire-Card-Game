
import React from 'react';
import { Difficulty, UserProfile } from '../types';
import { DIFFICULTY_CONFIG, GAME_RULES } from '../constants';

interface Props {
  activeProfile: UserProfile;
  onSelect: (diff: Difficulty) => void;
  onCancel: () => void;
}

const DifficultySelector: React.FC<Props> = ({ activeProfile, onSelect, onCancel }) => {
  const { unlocks, stats, progression } = activeProfile;
  const infernoWins = stats.inferno.wins;
  const godRequirement = `Vinci ${GAME_RULES.INFERNO_WINS_FOR_GOD} volte in Inferno (Attuali: ${infernoWins})`;

  return (
    <div className="h-screen w-full flex items-center justify-center p-6 bg-slate-950 z-50 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-[48px] shadow-2xl animate-in zoom-in duration-300">
        <h2 className="text-5xl font-black text-white uppercase text-center mb-2 tracking-tighter italic">Scegli il tuo Destino</h2>
        <p className="text-slate-500 text-center text-xs font-bold uppercase tracking-widest mb-10">L'abisso osserva i tuoi progressi</p>

        <div className="grid grid-cols-1 gap-4">
          <DifficultyCard type="normal" unlocked={true} onSelect={() => onSelect('normal')} />
          <DifficultyCard type="hard" unlocked={unlocks.hard} onSelect={() => onSelect('hard')} requirement="Vinci 1 partita in Normale" />
          <DifficultyCard type="inferno" unlocked={unlocks.inferno} onSelect={() => onSelect('inferno')} requirement="Vinci 1 partita in Hard" />
          <DifficultyCard type="god" unlocked={unlocks.god} onSelect={() => onSelect('god')} requirement={godRequirement} />
          {progression.paradoxUnlocked && (
            <DifficultyCard type="question" unlocked={true} onSelect={() => onSelect('question')} />
          )}
        </div>

        <button onClick={onCancel} className="w-full mt-8 py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all">Annulla</button>
      </div>
    </div>
  );
};

const DifficultyCard: React.FC<{ type: Difficulty, unlocked: boolean, onSelect: () => void, requirement?: string }> = ({ type, unlocked, onSelect, requirement }) => {
  const config = DIFFICULTY_CONFIG[type];
  const isGod = type === 'god';
  const isQuestion = type === 'question';
  
  return (
    <button 
      disabled={!unlocked}
      onClick={onSelect}
      className={`relative flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left overflow-hidden group ${unlocked ? config.bgClass + ' hover:-translate-y-1' : 'bg-slate-950 border-slate-900 opacity-40 grayscale'}`}
    >
      {(isGod || isQuestion) && unlocked && <div className={`absolute inset-0 god-shimmer pointer-events-none ${isQuestion ? 'opacity-40 animate-pulse' : ''}`} />}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-slate-900/50 border border-white/5 ${config.color} z-10`}>
         {type === 'normal' ? '🛡️' : type === 'hard' ? '⚔️' : type === 'inferno' ? '🔥' : isQuestion ? '?' : '👑'}
      </div>
      <div className="flex-1 z-10">
        <h3 className={`font-black uppercase tracking-tight text-lg ${config.color}`}>{config.label}</h3>
        <p className="text-[10px] text-slate-400 font-medium leading-tight mt-1">{config.description}</p>
        {!unlocked && <p className="text-[10px] font-black text-red-500/80 uppercase mt-2 tracking-tighter">🔒 {requirement}</p>}
      </div>
    </button>
  );
};

export default DifficultySelector;
