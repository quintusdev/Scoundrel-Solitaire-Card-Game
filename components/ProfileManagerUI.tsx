
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AVATARS, HERO_CLASSES } from '../constants';

interface ProfileManagerUIProps {
  profiles: Record<string, UserProfile>;
  onSelect: (id: string) => void;
  onCreate: (name: string, nickname: string, heroClass: string, avatar: string) => void;
  onDelete: (id: string) => void;
  onImport: (json: string) => void;
  onExport: (id: string) => void;
}

const ProfileManagerUI: React.FC<ProfileManagerUIProps> = ({ 
  profiles, onSelect, onCreate, onDelete, onImport, onExport 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', nickname: '', heroClass: HERO_CLASSES[0], avatar: AVATARS[0] });

  const profileList = Object.values(profiles);
  const slots = [0, 1, 2]; // Max 3 profili

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => onImport(re.target?.result as string);
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isCreating) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-slate-950 font-sans text-slate-50">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
          <h2 className="text-3xl font-black uppercase text-white mb-6 text-center tracking-tighter">Crea Eroe</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Avatar</label>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {AVATARS.map(av => (
                  <button 
                    key={av} 
                    onClick={() => setFormData({...formData, avatar: av})}
                    className={`w-full aspect-square rounded-lg border-2 transition-all p-1 ${formData.avatar === av ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 grayscale hover:grayscale-0'}`}
                  >
                    <img src={av} alt="Avatar" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" placeholder="NOME REALE" 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-bold focus:border-blue-500 outline-none uppercase"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <input 
                type="text" placeholder="SOPRANNOME (PUBBLICO)" 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-bold focus:border-blue-500 outline-none uppercase"
                value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})}
              />
              <select 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-bold focus:border-blue-500 outline-none uppercase text-slate-400"
                value={formData.heroClass} onChange={e => setFormData({...formData, heroClass: e.target.value})}
              >
                {HERO_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex gap-2 mt-8">
              <button 
                onClick={() => setIsCreating(false)} 
                className="flex-1 py-4 bg-slate-800 text-slate-400 font-black rounded-xl uppercase text-[10px] tracking-widest"
              >
                Annulla
              </button>
              <button 
                onClick={() => onCreate(formData.name, formData.nickname, formData.heroClass, formData.avatar)}
                disabled={!formData.name || !formData.nickname}
                className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crea Profilo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 font-sans text-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
      
      <div className="z-10 w-full max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-black text-white text-center uppercase tracking-tighter mb-2">Selezione Profilo</h1>
        <p className="text-slate-500 text-center font-bold uppercase text-[10px] tracking-[0.3em] mb-12">Scegli il tuo destino, Scoundrel</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {slots.map(index => {
            const p = profileList[index];
            if (p) {
              return (
                <div key={p.id} className="group relative flex flex-col bg-slate-900 border border-slate-800 p-6 rounded-3xl transition-all hover:border-blue-500 hover:-translate-y-2 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={p.avatar} alt="Av" className="w-12 h-12 rounded-full border-2 border-slate-800" />
                    <div>
                      <h3 className="font-black text-white uppercase tracking-tight truncate w-32">{p.nickname}</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">{p.heroClass}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-end text-[9px] uppercase font-black text-slate-600">
                      <span>Stanze Max</span>
                      {/* Fixed access: accessing bestRun from general stats category */}
                      <span className="text-white text-xs">{p.stats.general.bestRun.rooms}</span>
                    </div>
                    <div className="flex justify-between items-end text-[9px] uppercase font-black text-slate-600">
                      <span>Attività</span>
                      <span className="text-white">{p.lastActivity}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onSelect(p.id)}
                    className="w-full py-3 bg-blue-600 text-white font-black rounded-xl uppercase text-[10px] tracking-widest mb-2"
                  >
                    Seleziona
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onExport(p.id)} className="py-2 bg-slate-800 text-[8px] uppercase font-black text-slate-400 rounded-lg hover:text-white">Export</button>
                    <button 
                      onClick={() => { if(window.confirm("Eliminare definitivamente questo profilo e i suoi progressi?")) onDelete(p.id); }}
                      className="py-2 bg-red-950/20 text-[8px] uppercase font-black text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white"
                    >
                      Elimina
                    </button>
                  </div>
                  
                  {p.currentGame?.status === 'playing' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 px-2 py-0.5 rounded-full">
                       <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                       <span className="text-[7px] font-black text-white uppercase">Active</span>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button 
                key={`empty-${index}`}
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center bg-slate-900/40 border-2 border-dashed border-slate-800 p-8 rounded-3xl hover:border-slate-500 hover:bg-slate-900/60 transition-all group"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-white group-hover:border-white transition-all mb-4 text-2xl font-light">+</div>
                <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest group-hover:text-white">Nuovo Profilo</span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:border-slate-500 transition-all"
          >
            <span>📥</span> Importa Profilo (.json)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagerUI;
