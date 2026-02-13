
import React from 'react';
import { UserProfile, GameState, SignedSave, Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from '../constants';

interface SaveModalProps {
  activeProfile: UserProfile;
  gameState: GameState;
  onClose: () => void;
  onSave: (slotIdx: number) => void;
  onLoad: (save: SignedSave) => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ activeProfile, gameState, onClose, onSave, onLoad }) => {
  const isPlaying = gameState.status === 'playing';
  const isGod = gameState.difficulty === 'god';
  const combatLock = gameState.selectedCardId !== null;

  const DIFFICULTIES: Difficulty[] = ["normal", "hard", "inferno", "god"];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Scoundrel Vault</h2>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Protocollo Persistenza Eroe: {activeProfile.nickname}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-10 scrollbar-hide">
          {isPlaying && (
             <div className="bg-blue-900/20 border-2 border-blue-500/20 p-6 rounded-3xl flex items-center justify-between">
                <div>
                   <span className="text-xs font-black text-blue-400 uppercase tracking-widest block mb-1">Sessione Corrente</span>
                   <p className="text-sm font-medium text-slate-300">Salva i progressi della tua spedizione attuale.</p>
                   {isGod && <p className="text-[10px] text-red-500 font-bold uppercase mt-2">⚠️ Salvataggio disabilitato in GOD MODE.</p>}
                   {combatLock && !isGod && <p className="text-[10px] text-yellow-500 font-bold uppercase mt-2">⚠️ Impossibile salvare durante un'azione.</p>}
                </div>
                <div className="flex gap-2">
                   {[0, 1].map(i => (
                     <button 
                       key={i}
                       disabled={isGod || combatLock}
                       onClick={() => onSave(i)}
                       className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:opacity-50 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95"
                     >
                       Slot {i + 1}
                     </button>
                   ))}
                </div>
             </div>
          )}

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] pl-2 border-l-2 border-slate-700">Archivio Spedizioni</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {DIFFICULTIES.map(diff => (
                 activeProfile.saves[diff].map((save, idx) => (
                   <SaveSlotCard 
                     key={`${diff}-${idx}`} 
                     save={save} 
                     difficulty={diff} 
                     slotIdx={idx} 
                     onLoad={onLoad} 
                   />
                 ))
               ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 text-center bg-slate-950/50">
          <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest mb-4">I salvataggi sono protetti da firma digitale crittografica SHA-256</p>
          <button onClick={onClose} className="px-12 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all">Chiudi Vault</button>
        </div>
      </div>
    </div>
  );
};

const SaveSlotCard: React.FC<{ save: SignedSave | null, difficulty: Difficulty, slotIdx: number, onLoad: (s: SignedSave) => void }> = ({ save, difficulty, slotIdx, onLoad }) => {
  const config = DIFFICULTY_CONFIG[difficulty];
  
  if (!save) {
    return (
      <div className="p-6 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center opacity-40">
         <span className="text-[8px] font-black text-slate-600 uppercase mb-1">{config.label} - Slot {slotIdx + 1}</span>
         <span className="text-[10px] font-bold text-slate-700 italic">Slot Vuoto</span>
      </div>
    );
  }

  const { metadata } = save;

  return (
    <div className="group relative bg-slate-800/50 border border-slate-700 rounded-3xl p-5 hover:border-blue-500 transition-all flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-[8px] font-black uppercase tracking-widest ${config.color}`}>{config.label} - Slot {slotIdx + 1}</span>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-xl font-black text-white">{metadata.health} HP</span>
             <span className="text-slate-500 text-[10px] font-bold">Stanza {metadata.rooms}</span>
          </div>
        </div>
        <div className="text-right">
           <span className="block text-[8px] text-slate-500 font-bold uppercase">{new Date(metadata.timestamp).toLocaleDateString()}</span>
           <span className="block text-[8px] text-slate-600 font-bold uppercase">{new Date(metadata.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      <button 
        onClick={() => onLoad(save)}
        className="w-full py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
      >
        Carica Spedizione
      </button>
    </div>
  );
};

export default SaveModal;
