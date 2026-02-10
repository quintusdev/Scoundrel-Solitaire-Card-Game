import React from 'react';
import { GameStats } from '../types';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 modal-backdrop" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl title-font font-black tracking-widest text-white uppercase">Archivio Eroe</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-8 scrollbar-hide">
          {/* Ultima Partita Section */}
          <section>
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4">Record: Ultima Incursione</h3>
            {stats.lastGame ? (
              <div className={`p-6 rounded-2xl border ${stats.lastGame.status === 'won' ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-red-950/20 border-red-500/50'} relative overflow-hidden`}>
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <span className={`text-4xl font-black uppercase title-font ${stats.lastGame.status === 'won' ? 'text-emerald-400' : 'text-red-500'}`}>
                      {stats.lastGame.status === 'won' ? 'Vittoria' : 'Sconfitta'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                      {new Date(stats.lastGame.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-white">{stats.lastGame.rooms}</span>
                    <span className="text-[10px] uppercase text-slate-500 font-black">Stanze Raggiunte</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="block text-[8px] uppercase text-slate-500 font-black">Durata</span>
                    <span className="text-sm font-bold text-slate-200">{formatTime(stats.lastGame.duration)}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="block text-[8px] uppercase text-slate-500 font-black">Nemici Abbattuti</span>
                    <span className="text-sm font-bold text-slate-200">{stats.lastGame.enemies}</span>
                  </div>
                </div>

                {/* Decorative Background Icon */}
                <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12 scale-150 pointer-events-none">
                  <span className="text-9xl">💀</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed italic text-slate-500 text-sm">
                Nessun record trovato... il dungeon attende il tuo primo passo.
              </div>
            )}
          </section>

          {/* Global Stats Grid */}
          <section>
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4">Statistiche Globali</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Partite", value: stats.totalGames, color: "text-white" },
                { label: "Vittorie", value: stats.wins, color: "text-emerald-400" },
                { label: "Sconfitte", value: stats.losses, color: "text-red-400" },
                { label: "Stanze Totali", value: stats.totalRoomsCleared, color: "text-blue-400" },
                { label: "Danno Subito", value: stats.totalDamageTaken, color: "text-orange-500" },
                { label: "Cura Totale", value: stats.totalHealingDone, color: "text-emerald-500" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                  <span className="block text-[8px] uppercase text-slate-500 font-black mb-1">{s.label}</span>
                  <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Best Run Section */}
          <section className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-2xl">
             <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🏆</span>
                <h3 className="text-xs font-black uppercase text-yellow-500 tracking-widest">Primato Personale</h3>
             </div>
             <div className="flex justify-between items-end">
                <div>
                   <span className="text-4xl font-black text-white">{stats.bestRun.rooms}</span>
                   <span className="text-slate-500 text-[10px] font-black uppercase ml-2">Stanze</span>
                </div>
                <div className="text-right">
                   <span className="text-2xl font-black text-white">{stats.bestRun.enemies}</span>
                   <span className="text-slate-500 text-[10px] font-black uppercase ml-2">Kill</span>
                </div>
             </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <button onClick={onClose} className="w-full py-4 bg-white text-slate-950 font-black rounded-xl hover:bg-slate-200 transition-all text-xs uppercase tracking-widest shadow-xl">Torna al Menu</button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
