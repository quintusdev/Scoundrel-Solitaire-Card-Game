
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
  const isCritical = state.health <= 4;

  // Calcolo del Piano (ogni 5 stanze un nuovo piano)
  // Stanza 1-5 -> Piano 1, Stanza 6-10 -> Piano 2, etc.
  const currentFloor = Math.floor((state.roomIndex - 1) / 5) + 1;

  return (
    <div className={`hud-glass p-3 sm:p-4 rounded-2xl flex flex-col lg:flex-row gap-3 lg:gap-6 justify-between items-center mb-2 sm:mb-4 transition-all duration-300 ${effectClass && !effectClass.includes('animate-weapon-pop') ? effectClass : ''}`}>
      
      {/* Sezione Salute */}
      <div id="hud-health" className="flex flex-col gap-1 w-full lg:w-auto min-w-[180px] sm:min-w-[220px]">
        <div className="flex justify-between items-end">
          <span className="text-[8px] sm:text-[9px] uppercase text-slate-400 font-black tracking-widest">Salute</span>
          <span className={`font-black text-base sm:text-lg leading-none ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {state.health}/{state.maxHealth}
          </span>
        </div>
        
        <div className="w-full h-2 sm:h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
          <div 
            className={`h-full bg-red-600 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] ${isCritical ? 'animate-flash-red' : ''}`} 
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
      </div>

      {/* Statistiche - Espandiamo a 5 colonne per includere il Piano */}
      <div className="grid grid-cols-5 sm:flex gap-2 sm:gap-6 w-full lg:w-auto justify-between lg:justify-center">
        
        {/* NEW: Piano Indicator */}
        <div className="text-center group">
          <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-black mb-0.5 group-hover:text-amber-500 transition-colors">Piano</span>
          <span className="text-xs sm:text-base font-black text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            {currentFloor}
          </span>
        </div>

        <div className="text-center">
          <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-black mb-0.5">Arma</span>
          <span className="text-xs sm:text-base font-black uppercase text-blue-400">
            {state.equippedWeapon ? `${getSuitIcon(state.equippedWeapon.suit)}${state.equippedWeapon.rank}` : "-"}
          </span>
        </div>

        <div className="text-center">
          <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-black mb-0.5">Stanza</span>
          <span className="text-xs sm:text-base font-black text-white">{state.roomIndex}</span>
        </div>

        <div className="text-center">
          <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-black mb-0.5">Mazzo</span>
          <span className="text-xs sm:text-base font-black text-slate-400">{state.deck.length}</span>
        </div>

        <div className="text-center">
          <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-black mb-0.5">Kills</span>
          <span className="text-xs sm:text-base font-black text-red-500">{state.enemiesDefeated}</span>
        </div>
      </div>

      {/* Target Info */}
      <div id="hud-target" className="bg-slate-950/40 px-3 py-1.5 rounded-lg border border-white/5 w-full lg:min-w-[150px] lg:w-auto">
        {selectedCard ? (
          <div className="flex justify-between items-center">
            <span className="text-[7px] sm:text-[8px] uppercase text-slate-500 font-black tracking-tight">Focus</span>
            <span className="font-black text-[10px] sm:text-xs text-white uppercase flex items-center gap-1">
              <span>{getSuitIcon(selectedCard.suit)}{selectedCard.rank}</span>
              <span className="text-slate-500 opacity-60">({selectedCard.value})</span>
            </span>
          </div>
        ) : (
          <span className="text-slate-600 italic text-[9px] block text-center">In attesa...</span>
        )}
      </div>
    </div>
  );
};

export default HUD;
