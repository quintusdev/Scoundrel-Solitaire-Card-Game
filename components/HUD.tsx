
import React from 'react';
import { GameState } from '../types';
import { getSuitIcon } from '../constants';

interface HUDProps {
  state: GameState;
  effectClass?: string;
}

const HUD: React.FC<HUDProps> = ({ state, effectClass }) => {
  const selectedCard = state.room.find(c => c.id === state.selectedCardId);
  const healthPercentage = (state.health / state.maxHealth) * 100;
  
  // Il 20% di 20 HP è esattamente 4 HP.
  const isCritical = state.health <= 4;

  return (
    <div className={`bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-wrap gap-8 justify-between items-center mb-12 transition-all duration-300 ${effectClass && !effectClass.includes('animate-weapon-pop') ? effectClass : ''}`}>
      <div id="hud-health" className="flex flex-col gap-1">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] uppercase text-slate-500 font-black tracking-[0.2em]">Salute</span>
          <span className={`font-black text-xl leading-none transition-colors duration-300 ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {state.health}/{state.maxHealth}
          </span>
        </div>
        
        <div className="w-64 h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
          <div 
            className={`h-full bg-red-600 health-bar-transition shadow-[0_0_10px_rgba(239,68,68,0.3)] ${isCritical ? 'animate-flash-red' : (state.health <= 6 ? 'animate-pulse' : '')}`} 
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 md:gap-10">
        <div id="hud-weapon" className={`text-center transition-all duration-300 ${effectClass?.includes('animate-weapon-pop') ? 'animate-weapon-pop' : ''}`}>
          <span className="block text-[9px] uppercase text-slate-500 font-black mb-1 tracking-widest">Arma</span>
          <span className="text-lg font-black leading-none uppercase">
            {state.equippedWeapon ? (
              <span className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                {getSuitIcon(state.equippedWeapon.suit)}{state.equippedWeapon.rank} <span className="text-xs">({state.equippedWeapon.value})</span>
              </span>
            ) : <span className="text-slate-600">Nuda</span>}
          </span>
        </div>

        <div className="text-center">
          <span className="block text-[9px] uppercase text-slate-500 font-black mb-1 tracking-widest">Dungeon</span>
          <span className="text-xl font-black text-white leading-none">{state.roomIndex}</span>
        </div>

        <div className="text-center">
          <span className="block text-[9px] uppercase text-slate-500 font-black mb-1 tracking-widest">Nemici</span>
          <span className="text-xl font-black text-red-500 leading-none drop-shadow-[0_0_5px_rgba(239,68,68,0.2)]">{state.enemiesDefeated}</span>
        </div>

        <div className="text-center">
          <span className="block text-[9px] uppercase text-slate-500 font-black mb-1 tracking-widest">Pozioni</span>
          <span className="text-xl font-black text-emerald-500 leading-none">{state.sessionStats.potionsUsed}</span>
        </div>

        <div className="text-center hidden sm:block">
          <span className="block text-[9px] uppercase text-slate-500 font-black mb-1 tracking-widest">Mazzo</span>
          <span className="text-xl font-black text-slate-400 leading-none">{state.deck.length}</span>
        </div>
      </div>

      <div id="hud-target" className="bg-slate-950/80 px-5 py-3 rounded-2xl border border-white/5 min-w-[180px] shadow-2xl">
        {selectedCard ? (
          <div>
            <span className="text-[9px] uppercase text-slate-500 font-black block mb-1 tracking-tighter opacity-60">Bersaglio Selezionato</span>
            <span className="font-black text-sm text-white uppercase flex items-center gap-2">
              <span className="text-lg">{getSuitIcon(selectedCard.suit)}</span> 
              <span>{selectedCard.rank}</span>
              <span className="text-slate-500 text-xs ml-auto">VAL: {selectedCard.value}</span>
            </span>
          </div>
        ) : (
          <span className="text-slate-600 italic text-xs font-medium">Nessuna selezione</span>
        )}
      </div>
    </div>
  );
};

export default HUD;
