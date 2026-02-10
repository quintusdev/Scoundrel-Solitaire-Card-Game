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
  const isCritical = state.health <= 4; // 20% di 20

  return (
    <div className={`bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-wrap gap-8 justify-between items-center mb-12 transition-all duration-300 ${effectClass && !effectClass.includes('animate-weapon-pop') ? effectClass : ''}`}>
      <div id="hud-health" className="flex flex-col gap-1">
        <span className="text-xs uppercase text-slate-500 font-bold tracking-widest">Salute</span>
        <div className="flex items-center gap-3">
          <div className="w-48 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div 
              className={`h-full bg-red-500 health-bar-transition ${isCritical ? 'animate-flash-red' : (state.health <= 6 ? 'animate-pulse' : '')}`} 
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          <span className={`font-bold text-xl ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {state.health}/{state.maxHealth}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 md:gap-10">
        <div id="hud-weapon" className={`text-center transition-all duration-300 ${effectClass?.includes('animate-weapon-pop') ? 'animate-weapon-pop' : ''}`}>
          <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Arma</span>
          <span className="text-lg font-black leading-none">
            {state.equippedWeapon ? (
              <span className="text-blue-400">
                {getSuitIcon(state.equippedWeapon.suit)}{state.equippedWeapon.rank} ({state.equippedWeapon.value})
              </span>
            ) : "Nuda"}
          </span>
        </div>

        <div className="text-center">
          <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Dungeon</span>
          <span className="text-xl font-black text-white leading-none">{state.roomIndex}</span>
        </div>

        <div className="text-center">
          <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Nemici</span>
          <span className="text-xl font-black text-red-500 leading-none">{state.enemiesDefeated}</span>
        </div>

        <div className="text-center">
          <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Pozioni</span>
          <span className="text-xl font-black text-emerald-500 leading-none">{state.sessionStats.potionsUsed}</span>
        </div>

        <div className="text-center hidden sm:block">
          <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Mazzo</span>
          <span className="text-xl font-black text-slate-400 leading-none">{state.deck.length}</span>
        </div>
      </div>

      <div id="hud-target" className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 min-w-[150px]">
        {selectedCard ? (
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Bersaglio</span>
            <span className="font-bold text-sm">
              {getSuitIcon(selectedCard.suit)} {selectedCard.rank} (Val: {selectedCard.value})
            </span>
          </div>
        ) : (
          <span className="text-slate-600 italic text-sm">Nessuna selezione</span>
        )}
      </div>
    </div>
  );
};

export default HUD;