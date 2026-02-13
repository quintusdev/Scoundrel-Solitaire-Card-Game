
import React from 'react';
import { GameState } from '../types';
import { getSuitIcon, DIFFICULTY_CONFIG } from '../constants';

interface HUDProps {
  state: GameState;
}

const HUD: React.FC<HUDProps> = ({ state }) => {
  const diff = DIFFICULTY_CONFIG[state.difficulty];
  const healthPercentage = (state.health / state.maxHealth) * 100;
  const isCritical = state.health <= 4;

  return (
    <div className="hud-glass p-4 rounded-3xl flex flex-col lg:flex-row gap-6 justify-between items-center mb-4 transition-all">
      
      {/* Badge Difficoltà */}
      <div className="flex flex-col gap-1 min-w-[120px]">
         <span className="text-[8px] uppercase text-slate-500 font-black tracking-widest">Modalità</span>
         <span className={`font-black uppercase text-xs ${diff.color}`}>{diff.label}</span>
      </div>

      <div className="flex flex-col gap-1 w-full lg:w-1/3">
        <div className="flex justify-between items-end">
          <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Salute</span>
          <span className={`font-black text-lg ${isCritical ? 'text-red-500 animate-pulse' : 'text-white'}`}>{state.health}/{state.maxHealth}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950/80 rounded-full border border-white/5 overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${healthPercentage}%` }} />
        </div>
      </div>

      <div className="flex gap-8">
        <div className="text-center">
          <span className="block text-[8px] uppercase text-slate-500 font-black mb-1">Arma</span>
          <div className="flex flex-col items-center">
             <span className="text-xl font-black text-blue-400 uppercase">
               {state.equippedWeapon ? `${getSuitIcon(state.equippedWeapon.suit)}${state.equippedWeapon.rank}` : "-"}
             </span>
             {state.difficulty === 'inferno' && state.equippedWeapon && (
               <div className="flex gap-1 mt-1">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (state.weaponDurability || 0) ? 'bg-blue-400' : 'bg-slate-800'}`} />
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="text-center">
          <span className="block text-[8px] uppercase text-slate-500 font-black mb-1">Piano</span>
          <span className="text-xl font-black text-amber-500">{state.roomIndex}</span>
        </div>

        <div className="text-center">
          <span className="block text-[8px] uppercase text-slate-500 font-black mb-1">Mazzo</span>
          <span className="text-xl font-black text-slate-400">{state.deck.length}</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;
