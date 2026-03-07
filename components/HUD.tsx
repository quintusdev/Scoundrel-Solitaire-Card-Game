
import React from 'react';
import { GameState, WorldShift } from '../types';
import { getSuitIcon, DIFFICULTY_CONFIG, EternalVariant } from '../constants';

const HUD: React.FC<{ state: GameState, eternalVariant?: EternalVariant | null, worldShifts?: WorldShift[] }> = ({ state, eternalVariant, worldShifts = [] }) => {
  const diff = DIFFICULTY_CONFIG[state.difficulty];
  const healthPercentage = (state.health / state.maxHealth) * 100;
  const isGod = state.difficulty === 'god';
  const isQuestion = state.difficulty === 'question';

  const renderHealthValue = () => {
    if (isQuestion) {
      return `${Math.max(0, state.health - 1)}-${state.health + 1}`;
    }
    return state.health;
  };

  return (
    <div className={`hud-glass p-3 sm:p-6 rounded-[24px] sm:rounded-[32px] flex flex-col gap-2 sm:gap-6 mb-2 sm:mb-6 border-2 transition-all duration-500 ${isQuestion ? 'border-cyan-500/40' : isGod ? 'border-yellow-500/30' : 'border-white/10'}`}>
      
      <div className="flex flex-row gap-2 sm:gap-8 justify-between items-center">
        <div className="flex flex-col gap-0.5 min-w-[80px] sm:min-w-[140px]">
           <span className="text-[8px] sm:text-[10px] uppercase text-slate-500 font-black tracking-widest">Difficoltà</span>
           <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-center text-[10px] sm:text-xs font-black uppercase flex items-center justify-center gap-1 sm:gap-2 ${isQuestion ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30' : isGod ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-800 text-slate-300'}`}>
              {isQuestion ? '?' : eternalVariant && <span>{eternalVariant.icon}</span>}
              {diff.label}
           </div>
        </div>

        <div className="flex flex-col gap-0.5 flex-1 max-w-[200px] sm:max-w-none sm:w-1/3">
          <div className="flex justify-between items-end mb-0.5">
            <span className="text-[8px] sm:text-[10px] uppercase text-slate-400 font-black tracking-widest">Vitalità</span>
            <span className={`font-black text-sm sm:text-2xl transition-all ${state.health <= 5 ? 'text-red-500 animate-pulse' : isQuestion ? 'text-cyan-400' : 'text-white'}`}>
              {renderHealthValue()}
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-3 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden">
            <div className={`h-full transition-all duration-700 ${state.health <= 5 ? 'bg-red-600' : isQuestion ? 'bg-cyan-500' : 'bg-emerald-500'}`} style={{ width: `${healthPercentage}%` }} />
          </div>
        </div>

        <div className="flex gap-3 sm:gap-10">
          <StatItem label="Arma" value={state.equippedWeapon ? `${getSuitIcon(state.equippedWeapon.suit)}${isQuestion ? '?' : state.equippedWeapon.rank}` : "-"} color={isQuestion ? "text-cyan-400" : "text-blue-400"} extra={
            isQuestion && state.equippedWeapon ? (
              <div className="text-[6px] sm:text-[7px] text-cyan-700 uppercase font-black tracking-widest mt-0.5 sm:mt-1 text-center">Instabile</div>
            ) : state.weaponDurability !== null && !isQuestion && (
              <div className="flex gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 justify-center">
                {[...Array(state.difficulty === 'god' ? 2 : 3)].map((_, i) => (
                  <div key={i} className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full border border-white/10 ${i < (state.weaponDurability || 0) ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-slate-800'}`} />
                ))}
              </div>
            )
          } />
          <StatItem label="Area" value={state.roomIndex} color="text-amber-500" />
          <StatItem label="Deck" value={state.deck.length} color="text-slate-400" />
        </div>
      </div>

      {isQuestion && worldShifts.length > 0 && (
        <div className="border-t border-cyan-500/20 pt-2 sm:pt-4">
          <span className="text-[7px] sm:text-[8px] uppercase font-black text-cyan-600 tracking-widest mb-1 sm:mb-2 block">Anomalie Attive</span>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {worldShifts.map(s => (
              <div key={s.id} className={`px-1.5 py-0.5 rounded-md text-[6px] sm:text-[8px] font-black uppercase tracking-tighter border ${s.category === 'hostile' ? 'bg-red-950/20 text-red-500 border-red-900/40' : s.category === 'beneficial' ? 'bg-emerald-950/20 text-emerald-500 border-emerald-900/40' : 'bg-cyan-950/20 text-cyan-500 border-cyan-900/40'}`}>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string | number, color: string, extra?: React.ReactNode }> = ({ label, value, color, extra }) => (
  <div className="text-center min-w-[40px] sm:min-w-[60px]">
    <span className="block text-[8px] sm:text-[10px] uppercase text-slate-500 font-black mb-0.5 sm:mb-1">{label}</span>
    <span className={`text-sm sm:text-2xl font-black ${color}`}>{value}</span>
    {extra}
  </div>
);

export default HUD;
