
import React from 'react';
import { ETERNAL_VARIANTS } from '../constants';

interface Props {
  heroClass: string;
  unlockedVariants: string[];
  selectedVariantId: string | null | undefined;
  onSelect: (variantId: string | null) => void;
  onClose: () => void;
}

const VariantSelector: React.FC<Props> = ({ heroClass, unlockedVariants, selectedVariantId, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[32px] sm:rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic">Eternal Tier 3</h2>
            <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-bold tracking-widest">Varianti Estetiche: {heroClass}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-4 sm:p-8 flex-1 overflow-y-auto space-y-3 sm:space-y-4 scrollbar-hide">
          <button 
            onClick={() => onSelect(null)}
            className={`w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all text-left flex items-center gap-4 sm:gap-6 ${!selectedVariantId ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center text-xl sm:text-2xl border border-white/5">👤</div>
            <div>
               <h3 className="text-white font-black uppercase tracking-tight text-sm sm:text-base">Base</h3>
               <p className="text-[8px] sm:text-[10px] text-slate-400 font-medium">L'aspetto originale dell'eroe.</p>
            </div>
          </button>

          {Object.values(ETERNAL_VARIANTS).map(variant => {
            const isUnlocked = unlockedVariants.includes(variant.id);
            const isSelected = selectedVariantId === variant.id;

            return (
              <button 
                key={variant.id}
                disabled={!isUnlocked}
                onClick={() => onSelect(variant.id)}
                className={`w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 transition-all text-left flex items-center gap-4 sm:gap-6 relative overflow-hidden group ${isUnlocked ? (isSelected ? 'bg-yellow-600/10 border-yellow-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500') : 'bg-slate-950/50 border-slate-900 opacity-30 grayscale'}`}
              >
                {isUnlocked && <div className="absolute inset-0 god-shimmer pointer-events-none opacity-20" />}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center text-xl sm:text-2xl border border-white/5 z-10">{variant.icon}</div>
                <div className="z-10 flex-1">
                   <h3 className={`font-black uppercase tracking-tight text-sm sm:text-base ${variant.color}`}>{variant.name}</h3>
                   <p className="text-[8px] sm:text-[10px] text-slate-400 font-medium">{variant.description}</p>
                </div>
                {!isUnlocked && <div className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase z-10">Bloccato</div>}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-8 border-t border-slate-800 bg-slate-950/50 text-center">
          <p className="text-[8px] sm:text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-4">Queste varianti sono puramente estetiche e non influenzano il gameplay.</p>
          <button onClick={onClose} className="w-full sm:w-auto px-12 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] uppercase tracking-widest transition-all">Chiudi Archivio</button>
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
