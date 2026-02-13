
import React, { useState, useMemo, useEffect } from 'react';
import { ChronicleEntry } from '../types';
import { ChronicleManager } from '../ChronicleManager';
import { ETERNAL_VARIANTS, DIFFICULTY_CONFIG } from '../constants';

interface HallOfEternalProps {
  chronicles: ChronicleEntry[];
  isParadox: boolean;
  paradoxSeen: boolean;
  onMarkSeen: () => void;
  onClose: () => void;
  onImport: (code: string) => void;
}

const HallOfEternal: React.FC<HallOfEternalProps> = ({ chronicles, isParadox, paradoxSeen, onMarkSeen, onClose, onImport }) => {
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'glory' | 'sorrow'>('glory');
  const [importCode, setImportCode] = useState('');
  const [paradoxPhase, setParadoxPhase] = useState<number>(0);

  useEffect(() => {
    if (isParadox && !paradoxSeen) {
      const timers = [
        setTimeout(() => setParadoxPhase(1), 1000),
        setTimeout(() => setParadoxPhase(2), 3000),
        setTimeout(() => setParadoxPhase(3), 5500),
        setTimeout(() => {
          onMarkSeen();
          setParadoxPhase(0);
        }, 8500)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isParadox, paradoxSeen, onMarkSeen]);

  const filteredChronicles = useMemo(() => {
    const list = chronicles.filter(c => c.status === (activeTab === 'glory' ? 'won' : 'lost'));
    if (filter === 'all') return list;
    return list.filter(c => c.variants.includes(filter));
  }, [chronicles, filter, activeTab]);

  const handleShare = async (entry: ChronicleEntry) => {
    const code = await ChronicleManager.signChronicle(entry);
    navigator.clipboard.writeText(code);
    alert("Codice Cronaca copiato negli appunti!");
  };

  const isParadoxActive = isParadox && paradoxSeen;

  return (
    <div className={`fixed inset-0 z-[450] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-500 ${isParadoxActive ? 'bg-slate-950/95' : 'bg-black/95'}`}>
      
      {/* Paradox Narrative Sequence */}
      {isParadox && !paradoxSeen && paradoxPhase > 0 && (
        <div className="absolute inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center text-center p-12 overflow-hidden">
          <div className="stars-container absolute inset-0 opacity-40" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className={`text-9xl font-black text-white transition-all duration-1000 transform ${paradoxPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>42</h2>
            <div className={`space-y-4 transition-all duration-1000 delay-500 ${paradoxPhase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
               <p className="text-xl font-bold text-cyan-400 uppercase tracking-[0.4em]">La risposta a tutte le domande dell'universo.</p>
            </div>
            <div className={`transition-all duration-1000 delay-1000 ${paradoxPhase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
               <p className="text-sm font-black text-slate-500 uppercase tracking-widest italic">Ma qual era la domanda?</p>
            </div>
          </div>
          <div className="absolute bottom-10 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20 animate-pulse" />
        </div>
      )}

      <div className={`w-full max-w-4xl rounded-[48px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all duration-700 border-2 ${isParadoxActive ? 'bg-slate-900/40 border-cyan-500/50 shadow-cyan-500/20' : activeTab === 'glory' ? 'bg-slate-900 border-purple-500/30' : 'bg-slate-900 border-red-950'}`}>
        
        <div className={`p-8 border-b flex justify-between items-center ${isParadoxActive ? 'bg-cyan-950/20 border-cyan-500/20' : 'bg-slate-950/50 border-slate-800'}`}>
          <div>
            <h2 className={`text-4xl font-black tracking-tighter uppercase italic transition-colors duration-500 ${isParadoxActive ? 'text-cyan-400' : activeTab === 'glory' ? 'text-white' : 'text-red-600'}`}>
              {isParadoxActive ? 'Paradox Terminal 42' : 'Hall of Eternal'}
            </h2>
            <p className={`text-[10px] uppercase font-black tracking-[0.3em] transition-colors duration-500 ${isParadoxActive ? 'text-cyan-600' : activeTab === 'glory' ? 'text-purple-400' : 'text-red-950'}`}>
              {isParadoxActive ? 'Database di Sistema Stabilizzato' : activeTab === 'glory' ? 'Cronache della Gloria' : 'Cronache del Dolore'}
            </p>
          </div>
          <button onClick={onClose} className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isParadoxActive ? 'hover:bg-cyan-900/20 text-cyan-600 hover:text-cyan-400' : 'hover:bg-slate-800 text-slate-500 hover:text-white'}`}>✕</button>
        </div>

        <div className={`grid grid-cols-2 border-b transition-colors duration-500 ${isParadoxActive ? 'border-cyan-500/20' : 'border-slate-800'}`}>
           <button 
             onClick={() => setActiveTab('glory')}
             className={`py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'glory' ? (isParadoxActive ? 'bg-cyan-600/10 text-cyan-400 border-b-2 border-cyan-500' : 'bg-purple-600/10 text-white border-b-2 border-purple-500') : 'bg-slate-950/20 text-slate-600 hover:text-slate-400'}`}
           >
             Vittorie Eterne
           </button>
           <button 
             onClick={() => setActiveTab('sorrow')}
             className={`py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'sorrow' ? 'bg-red-950/10 text-red-600 border-b-2 border-red-600' : 'bg-slate-950/20 text-slate-600 hover:text-slate-400'}`}
           >
             Cadute Memorabili
           </button>
        </div>

        <div className={`flex border-b transition-colors duration-500 bg-slate-950/30 overflow-x-auto scrollbar-hide ${isParadoxActive ? 'border-cyan-500/20' : 'border-slate-800'}`}>
          {['all', 'flawless', 'no_potion', 'no_retreat'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-4 text-[9px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${filter === f ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f === 'all' ? 'Tutte' : ETERNAL_VARIANTS[f].name}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-4 scrollbar-hide">
          {filteredChronicles.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
               <span className={`text-6xl mb-4 transition-transform duration-500 ${isParadoxActive ? 'animate-pulse' : ''}`}>
                 {isParadoxActive ? '🌀' : activeTab === 'glory' ? '📜' : '🪦'}
               </span>
               <p className={`text-sm font-bold uppercase tracking-widest ${isParadoxActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                 {activeTab === 'glory' ? 'Nessuna gloria registrata.' : 'Nessun fallimento degno di nota.'}
               </p>
            </div>
          ) : (
            filteredChronicles.map((entry) => (
              <div key={entry.id} className={`group bg-slate-800/20 border rounded-3xl p-6 transition-all flex flex-col md:flex-row justify-between items-center gap-6 ${isParadoxActive ? 'border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-900/10' : activeTab === 'glory' ? 'border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/40' : 'border-red-950 hover:border-red-800 hover:bg-red-950/10'}`}>
                <div className="flex items-center gap-6 flex-1">
                   <div className={`w-16 h-16 rounded-2xl bg-slate-900 border flex items-center justify-center text-3xl shadow-lg transition-colors ${isParadoxActive ? 'border-cyan-500/20' : activeTab === 'glory' ? 'border-purple-500/20' : 'border-red-950 opacity-60'}`}>
                      {entry.p42 ? '✨' : entry.heroClass === 'Guerriero' ? '⚔️' : entry.heroClass === 'Ladro' ? '🗡️' : entry.heroClass === 'Mago' ? '🔮' : '🛡️'}
                   </div>
                   <div>
                      <h3 className={`text-xl font-black uppercase tracking-tight transition-colors ${isParadoxActive ? 'text-cyan-300' : activeTab === 'glory' ? 'text-white' : 'text-red-700/80'}`}>{entry.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{entry.heroName} • {entry.heroClass}</p>
                      <div className="flex gap-2 mt-2">
                         <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${DIFFICULTY_CONFIG[entry.difficulty].color} border-current opacity-40`}>
                           {DIFFICULTY_CONFIG[entry.difficulty].label}
                         </span>
                         {entry.variants.map(v => (
                           <span key={v} className="text-[7px] font-black uppercase bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                             {ETERNAL_VARIANTS[v].icon} {ETERNAL_VARIANTS[v].name}
                           </span>
                         ))}
                         {entry.p42 && <span className="text-[7px] font-black uppercase bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-full text-cyan-400">P42</span>}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                   <div>
                      <span className="block text-[8px] uppercase font-black text-slate-600">Area</span>
                      <span className={`text-lg font-black transition-colors ${isParadoxActive ? 'text-cyan-300' : activeTab === 'glory' ? 'text-white' : 'text-red-950'}`}>{entry.rooms}</span>
                   </div>
                   <div>
                      <span className="block text-[8px] uppercase font-black text-slate-600">Kills</span>
                      <span className={`text-lg font-black transition-colors ${isParadoxActive ? 'text-cyan-300' : activeTab === 'glory' ? 'text-white' : 'text-red-950'}`}>{entry.stats.enemiesDefeated}</span>
                   </div>
                </div>

                <button 
                  onClick={() => handleShare(entry)}
                  className={`px-6 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isParadoxActive ? 'bg-cyan-900/20 text-cyan-400 border-cyan-500/20 hover:bg-cyan-600 hover:text-white' : activeTab === 'glory' ? 'bg-purple-900/20 text-purple-400 border-purple-500/20 hover:bg-purple-800' : 'bg-red-950/20 text-red-900 border-red-950/40 hover:bg-red-900 hover:text-white'}`}
                >
                  Condividi
                </button>
              </div>
            ))
          )}
        </div>

        <div className={`p-8 border-t transition-colors duration-500 bg-slate-950/50 space-y-4 ${isParadoxActive ? 'border-cyan-500/20' : 'border-slate-800'}`}>
          <div className="flex gap-4">
             <input 
               type="text" 
               placeholder="INCOLLA CODICE PER IMPORTARE..." 
               className={`flex-1 bg-slate-900 border rounded-xl px-4 py-3 text-[10px] font-bold text-white uppercase outline-none transition-colors ${isParadoxActive ? 'border-cyan-500/30 focus:border-cyan-400' : 'border-slate-700 focus:border-purple-500'}`}
               value={importCode}
               onChange={(e) => setImportCode(e.target.value)}
             />
             <button 
               onClick={() => { onImport(importCode); setImportCode(''); }}
               className={`px-8 py-3 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all ${isParadoxActive ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-white text-slate-950 hover:bg-slate-200'}`}
             >
               Importa
             </button>
          </div>
          <p className={`text-[8px] font-bold uppercase tracking-widest text-center italic transition-colors ${isParadoxActive ? 'text-cyan-700' : 'text-slate-600'}`}>
            {isParadoxActive ? '"Il paradosso non è un errore, è la chiave."' : '"Le memorie sono l\'unico tesoro che il dungeon non può reclamare."'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HallOfEternal;
