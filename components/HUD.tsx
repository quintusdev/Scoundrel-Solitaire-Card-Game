
import React from 'react';
import { GameState } from '../types';
import { getSuitIcon, DIFFICULTY_CONFIG, EternalVariant } from '../constants';

const HUD: React.FC<{ state: GameState, eternalVariant?: EternalVariant | null }> = ({ state, eternalVariant }) => {
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
    <div className={`hud-glass p-6 rounded-[32px] flex flex-col lg:flex-row gap-8 justify-between items-center mb-6 border-2 ${isQuestion ? 'border-cyan-500/40 animate-pulse' : isGod ? 'border-yellow-500/30' : 'border-white/10'}`}>
      
      <div className="flex flex-col gap-1 min-w-[140px]">
         <span className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Difficoltà</span>
         <div className={`px-3 py-1 rounded-full text-center text-xs font-black uppercase flex items-center justify-center gap-2 ${isQuestion ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-500/30' : isGod ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-slate-800 text-slate-300'}`}>
            {isQuestion ? '?' : eternalVariant && <span>{eternalVariant.icon}</span>}
            {diff.label}
         </div>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-1/3">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Vitalità</span>
          <span className={`font-black text-2xl transition-all ${state.health <= 5 ? 'text-red-500 animate-pulse' : isQuestion ? 'text-cyan-400' : 'text-white'}`}>
            {renderHealthValue()}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden">
          <div className={`h-full transition-all duration-700 ${state.health <= 5 ? 'bg-red-600' : isQuestion ? 'bg-cyan-500 blur-[1px]' : 'bg-emerald-500'}`} style={{ width: `${healthPercentage}%` }} />
        </div>
      </div>

      <div className="flex gap-10">
        <StatItem label="Arma" value={state.equippedWeapon ? `${getSuitIcon(state.equippedWeapon.suit)}${isQuestion ? '?' : state.equippedWeapon.rank}` : "-"} color={isQuestion ? "text-cyan-400" : "text-blue-400"} extra={
          isQuestion && state.equippedWeapon ? (
            <div className="text-[7px] text-cyan-700 uppercase font-black tracking-widest mt-1 text-center">Instabile</div>
          ) : state.weaponDurability !== null && !isQuestion && (
            <div className="flex gap-1 mt-1 justify-center">
              {[...Array(state.difficulty === 'god' ? 2 : 3)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full border border-white/10 ${i < (state.weaponDurability || 0) ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'bg-slate-800'}`} />
              ))}
            </div>
          )
        } />
        <StatItem label="Area" value={state.roomIndex} color="text-amber-500" />
        <StatItem label="Deck" value={state.deck.length} color="text-slate-400" />
      </div>
    </div>
  );
};

const StatItem: React.FC<{ label: string, value: string | number, color: string, extra?: React.ReactNode }> = ({ label, value, color, extra }) => (
  <div className="text-center min-w-[60px]">
    <span className="block text-[9px] uppercase text-slate-500 font-black mb-1">{label}</span>
    <span className={`text-2xl font-black ${color}`}>{value}</span>
    {extra}
  </div>
);

export default HUD;
