
import React, { useState } from 'react';

type Language = 'IT' | 'EN';

const TABS = {
  IT: [
    { id: "intro", label: "Manuale" },
    { id: "combat", label: "Combattimento" },
    { id: "modes", label: "Difficoltà" },
    { id: "vault", label: "Vault" },
    { id: "progression", label: "Evoluzione" },
    { id: "altar", label: "Altare" },
    { id: "universe", label: "Universo" }
  ],
  EN: [
    { id: "intro", label: "Manual" },
    { id: "combat", label: "Combat" },
    { id: "modes", label: "Difficulty" },
    { id: "vault", label: "Vault" },
    { id: "progression", label: "Evolution" },
    { id: "altar", label: "Altar" },
    { id: "universe", label: "Universe" }
  ]
};

const RulesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("intro");
  const [lang, setLang] = useState<Language>('IT');

  const renderIT = () => {
    switch (activeTab) {
      case "intro":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">1. Obiettivo del Gioco</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scoundrel è un dungeon crawler solitario basato sull'uso strategico di un mazzo di 52 carte. Il tuo compito è navigare attraverso le stanze del dungeon, sconfiggere le minacce e consumare l'intero mazzo restando in vita. 
                La vittoria viene dichiarata solo quando l'ultima carta del mazzo e della stanza viene risolta.
              </p>
            </section>
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-slate-500 rounded-full" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">2. Anatomia del Dungeon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-2 tracking-widest">♥️ Cuori</span>
                  <p className="text-sm text-slate-200 font-bold mb-1">Pozioni di Cura</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Ripristinano vitalità basata sul valore della carta.</p>
                </div>
                <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-2 tracking-widest">♦️ Quadri</span>
                  <p className="text-sm text-slate-200 font-bold mb-1">Armi e Scudi</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Necessarie per abbattere i mostri senza soccombere.</p>
                </div>
                <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors sm:col-span-2">
                  <span className="block text-slate-400 font-black text-[10px] uppercase mb-2 tracking-widest">♣️ ♠️ Fiori e Picche</span>
                  <p className="text-sm text-slate-200 font-bold mb-1">Mostri e Aberrazioni</p>
                  <p className="text-[11px] text-slate-500 leading-tight">I nemici del dungeon. Ogni carta rappresenta una minaccia con forza pari al suo valore.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "combat":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-blue-500 rounded-full" />
              <h3 className="text-2xl font-black text-blue-500 uppercase tracking-tighter italic mb-4">Scontro Diretto</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Il combattimento è matematico e spietato. Quando affronti un mostro, l'esito dipende dal tuo equipaggiamento:
              </p>
              <div className="space-y-4">
                <div className="p-5 bg-blue-950/20 border border-blue-900/30 rounded-3xl">
                  <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Con Arma (♦️)</p>
                  <p className="text-xs text-slate-300 leading-relaxed">Se Valore Arma ≥ Valore Mostro, il nemico viene eliminato senza subire danni. Se inferiore, subisci la differenza in punti vita (regola variabile in base alla difficoltà).</p>
                </div>
                <div className="p-5 bg-red-950/20 border border-red-900/30 rounded-3xl">
                  <p className="text-xs font-black text-red-400 uppercase mb-2 tracking-widest">A Mani Nude</p>
                  <p className="text-xs text-slate-300 leading-relaxed">Puoi sempre scegliere di affrontare un mostro senza arma, ma subirai l'intero valore del mostro come danno diretto.</p>
                </div>
              </div>
            </section>
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-orange-500 rounded-full" />
              <h3 className="text-2xl font-black text-orange-500 uppercase tracking-tighter italic mb-4">Durabilità e Limiti</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nelle modalità avanzate, le armi non sono eterne. Possiedono una durabilità limitata che si consuma ad ogni attacco. Una volta esaurita, l'arma si spezza e l'eroe torna a combattere a mani nude.
              </p>
            </section>
          </div>
        );
      case "modes":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-yellow-500 rounded-full" />
              <h3 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter italic mb-6">Protocolli di Sfida</h3>
              <div className="space-y-6">
                <div className="group p-5 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-blue-500/50 transition-all">
                  <p className="font-black text-blue-400 text-xs uppercase tracking-widest mb-1">Normale</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Regole classiche. Danno calcolato per differenza. Massima flessibilità strategica.</p>
                </div>
                <div className="group p-5 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-orange-500/50 transition-all">
                  <p className="font-black text-orange-400 text-xs uppercase tracking-widest mb-1">Hardcore</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Il dungeon non perdona. Se la tua arma è più debole del mostro, non ricevi alcuna protezione: subisci il danno pieno del nemico.</p>
                </div>
                <div className="group p-5 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-red-500/50 transition-all">
                  <p className="font-black text-red-500 text-xs uppercase tracking-widest mb-1">Inferno</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Risorse scarse e nemici letali. Le armi durano solo 3 colpi. Le pozioni sono meno efficaci. Non puoi attaccare se l'arma è troppo debole.</p>
                </div>
                <div className="group p-5 bg-yellow-400/5 border border-yellow-400/20 rounded-3xl hover:border-yellow-400/50 transition-all">
                  <p className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-1">GOD MODE</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">La prova finale. Ironman Run: nessun salvataggio. Cure ridotte drasticamente. Durabilità minima. Solo i veri maestri del dungeon possono sopravvivere.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "vault":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-slate-400 rounded-full" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Vault e Persistenza</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Il Vault è il sistema di sicurezza che preserva i tuoi progressi. Ogni profilo dispone di 2 slot di salvataggio per ogni livello di difficoltà.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Autosave", desc: "Il gioco salva automaticamente ogni 10 stanze completate." },
                  { title: "Combat Lock", desc: "Non è possibile salvare se è stata selezionata una carta ma l'azione non è ancora stata risolta." },
                  { title: "Integrità", desc: "Ogni salvataggio è protetto da una firma digitale che ne garantisce l'autenticità." },
                  { title: "Restrizioni", desc: "GOD MODE e modalità avanzate disabilitano permanentemente la possibilità di salvare." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/20 border border-slate-800/50 rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-200 uppercase tracking-widest mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "progression":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-purple-500 rounded-full" />
              <h3 className="text-2xl font-black text-purple-500 uppercase tracking-tighter italic mb-4">Ascensione dell'Eroe</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Ogni azione nel dungeon contribuisce alla tua leggenda. Il sistema di progressione si basa su tre pilastri:
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group">
                  <p className="text-xs font-black text-purple-400 uppercase mb-2 tracking-widest">Tier Evolutivi</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Rappresentati da forzieri nel menu principale, i Tier mostrano il tuo grado di maestria complessiva.</p>
                </div>
                <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group">
                  <p className="text-xs font-black text-yellow-500 uppercase mb-2 tracking-widest">Sigilli dell'Abisso</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Ottenuti sbloccando Obiettivi. Sono la valuta necessaria per l'Altare dell'Abisso.</p>
                </div>
                <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group">
                  <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Hall of Eternal</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Un archivio persistente che conserva le tue vittorie gloriose e le tue cadute più memorabili.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "altar":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-cyan-400 rounded-full" />
              <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-tighter italic mb-4">Altare dell'Abisso</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                L'Altare permette di sbloccare potenziamenti permanenti per il tuo profilo sacrificando i Sigilli dell'Abisso.
              </p>
              <div className="space-y-4">
                <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-3xl hover:bg-red-950/20 transition-all">
                  <p className="text-xs font-black text-red-400 uppercase mb-2 tracking-widest">Ramo del Sangue</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Focalizzato sulla sopravvivenza, la cura e l'incremento dei punti vita massimi.</p>
                </div>
                <div className="p-6 bg-blue-950/10 border border-blue-900/30 rounded-3xl hover:bg-blue-950/20 transition-all">
                  <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Ramo dell'Acciaio</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Migliora l'efficacia delle armi, il danno e la loro durabilità nel dungeon.</p>
                </div>
                <div className="p-6 bg-slate-800/20 border border-slate-700 rounded-3xl hover:bg-slate-800/40 transition-all">
                  <p className="text-xs font-black text-slate-300 uppercase mb-2 tracking-widest">Ramo dell'Ombra</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Specializzato nell'evasione, la manipolazione del mazzo e la conoscenza occulta.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "universe":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-cyan-500 rounded-full" />
              <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-tighter italic mb-4">Universo Evolutivo</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Alcune incursioni nel dungeon possono avere conseguenze che trascendono la singola partita. L'Universo di Scoundrel è suscettibile a "contaminazioni" dimensionali.
              </p>
              <div className="p-8 bg-cyan-950/10 border border-cyan-500/20 rounded-[32px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />
                <p className="text-xs text-slate-300 italic leading-relaxed relative z-10">
                  "In modalità avanzate, le regole della realtà possono piegarsi. Anomalie persistenti possono influenzare il mondo di gioco, offrendo vantaggi inaspettati o pericoli letali. Questi cambiamenti sono rari, limitati e legati alle tue scoperte più profonde."
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-800/50 text-center">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em]">
                  Nessun sistema è immutabile. Il dungeon impara da te.
                </p>
              </div>
            </section>
          </div>
        );
      default: return null;
    }
  };

  const renderEN = () => {
    switch (activeTab) {
      case "intro":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">1. Game Objective</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scoundrel is a solitary dungeon crawler based on the strategic use of a 52-card deck. Your task is to navigate through dungeon rooms, defeat threats, and consume the entire deck while staying alive. 
                Victory is declared only when the last card of both the deck and the room has been resolved.
              </p>
            </section>
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-slate-500 rounded-full" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">2. Dungeon Anatomy</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-2 tracking-widest">♥️ Hearts</span>
                  <p className="text-sm text-slate-200 font-bold mb-1">Healing Potions</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Restore vitality based on the card's value.</p>
                </div>
                <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-2 tracking-widest">♦️ Diamonds</span>
                  <p className="text-sm text-slate-200 font-bold mb-1">Weapons and Shields</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Necessary to strike down monsters without perishing.</p>
                </div>
                <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors sm:col-span-2">
                  <span className="block text-slate-400 font-black text-[10px] uppercase mb-2 tracking-widest">♣️ ♠️ Clubs and Spades</span>
                  <p className="text-sm text-slate-200 font-bold mb-1">Monsters and Aberrations</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Dungeon enemies. Each card represents a threat with power equal to its value.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "combat":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-blue-500 rounded-full" />
              <h3 className="text-2xl font-black text-blue-500 uppercase tracking-tighter italic mb-4">Direct Combat</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Combat is mathematical and merciless. When facing a monster, the outcome depends on your equipment:
              </p>
              <div className="space-y-4">
                <div className="p-5 bg-blue-950/20 border border-blue-900/30 rounded-3xl">
                  <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Armed (♦️)</p>
                  <p className="text-xs text-slate-300 leading-relaxed">If Weapon Value ≥ Monster Value, the enemy is eliminated without taking damage. If lower, you suffer the difference in health points (rules vary by difficulty).</p>
                </div>
                <div className="p-5 bg-red-950/20 border border-red-900/30 rounded-3xl">
                  <p className="text-xs font-black text-red-400 uppercase mb-2 tracking-widest">Unarmed</p>
                  <p className="text-xs text-slate-300 leading-relaxed">You can always choose to face a monster without a weapon, but you will suffer the monster's full value as direct damage.</p>
                </div>
              </div>
            </section>
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-orange-500 rounded-full" />
              <h3 className="text-2xl font-black text-orange-500 uppercase tracking-tighter italic mb-4">Durability and Limits</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                In advanced modes, weapons are not eternal. They possess limited durability that is consumed with each attack. Once exhausted, the weapon shatters, and the hero returns to fighting unarmed.
              </p>
            </section>
          </div>
        );
      case "modes":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-yellow-500 rounded-full" />
              <h3 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter italic mb-6">Challenge Protocols</h3>
              <div className="space-y-6">
                <div className="group p-5 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-blue-500/50 transition-all">
                  <p className="font-black text-blue-400 text-xs uppercase tracking-widest mb-1">Normal</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Classic rules. Damage calculated by difference. Maximum strategic flexibility.</p>
                </div>
                <div className="group p-5 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-orange-500/50 transition-all">
                  <p className="font-black text-orange-400 text-xs uppercase tracking-widest mb-1">Hardcore</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">The dungeon does not forgive. If your weapon is weaker than the monster, you receive no protection: you suffer the enemy's full damage.</p>
                </div>
                <div className="group p-5 bg-slate-800/20 border border-slate-800 rounded-3xl hover:border-red-500/50 transition-all">
                  <p className="font-black text-red-500 text-xs uppercase tracking-widest mb-1">Inferno</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Scarce resources and lethal enemies. Weapons last only 3 hits. Potions are less effective. You cannot attack if your weapon is too weak.</p>
                </div>
                <div className="group p-5 bg-yellow-400/5 border border-yellow-400/20 rounded-3xl hover:border-yellow-400/50 transition-all">
                  <p className="font-black text-yellow-400 text-xs uppercase tracking-widest mb-1">GOD MODE</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">The ultimate test. Ironman Run: no saving. Healing drastically reduced. Minimum durability. Only true dungeon masters can survive.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "vault":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-slate-400 rounded-full" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-4">Vault and Persistence</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                The Vault is the security system that preserves your progress. Each profile has 2 save slots for each difficulty level.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Autosave", desc: "The game automatically saves every 10 completed rooms." },
                  { title: "Combat Lock", desc: "It is not possible to save if a card is selected but the action has not yet been resolved." },
                  { title: "Integrity", desc: "Every save is protected by a digital signature to guarantee its authenticity." },
                  { title: "Restrictions", desc: "GOD MODE and advanced modes permanently disable the ability to save." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-800/20 border border-slate-800/50 rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-200 uppercase tracking-widest mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case "progression":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-purple-500 rounded-full" />
              <h3 className="text-2xl font-black text-purple-500 uppercase tracking-tighter italic mb-4">Hero Ascension</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Every action in the dungeon contributes to your legend. The progression system is based on three pillars:
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group">
                  <p className="text-xs font-black text-purple-400 uppercase mb-2 tracking-widest">Evolutionary Tiers</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Represented by chests in the main menu, Tiers show your overall degree of mastery.</p>
                </div>
                <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group">
                  <p className="text-xs font-black text-yellow-500 uppercase mb-2 tracking-widest">Abyss Sigils</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Earned by unlocking Achievements. They are the currency required for the Altar of the Abyss.</p>
                </div>
                <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:bg-slate-800/50 transition-all group">
                  <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Hall of Eternal</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">A persistent archive that preserves your glorious victories and your most memorable falls.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "altar":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-cyan-400 rounded-full" />
              <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-tighter italic mb-4">Altar of the Abyss</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                The Altar allows you to unlock permanent upgrades for your profile by sacrificing Abyss Sigils.
              </p>
              <div className="space-y-4">
                <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-3xl hover:bg-red-950/20 transition-all">
                  <p className="text-xs font-black text-red-400 uppercase mb-2 tracking-widest">Blood Branch</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Focused on survival, healing, and increasing maximum health points.</p>
                </div>
                <div className="p-6 bg-blue-950/10 border border-blue-900/30 rounded-3xl hover:bg-blue-950/20 transition-all">
                  <p className="text-xs font-black text-blue-400 uppercase mb-2 tracking-widest">Steel Branch</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Improves weapon effectiveness, damage, and their durability in the dungeon.</p>
                </div>
                <div className="p-6 bg-slate-800/20 border border-slate-700 rounded-3xl hover:bg-slate-800/40 transition-all">
                  <p className="text-xs font-black text-slate-300 uppercase mb-2 tracking-widest">Shadow Branch</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Specialized in evasion, deck manipulation, and occult knowledge.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "universe":
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="relative pl-6 border-l border-slate-800/50">
              <div className="absolute -left-[1.5px] top-0 w-[3px] h-8 bg-cyan-500 rounded-full" />
              <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-tighter italic mb-4">Evolving Universe</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Some dungeon incursions can have consequences that transcend a single game. The Scoundrel Universe is susceptible to dimensional "contaminations."
              </p>
              <div className="p-8 bg-cyan-950/10 border border-cyan-500/20 rounded-[32px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />
                <p className="text-xs text-slate-300 italic leading-relaxed relative z-10">
                  "In advanced modes, the rules of reality can bend. Persistent anomalies can influence the game world, offering unexpected advantages or lethal dangers. These changes are rare, limited, and linked to your deepest discoveries."
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-800/50 text-center">
                <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em]">
                  No system is immutable. The dungeon learns from you.
                </p>
              </div>
            </section>
          </div>
        );
      default: return null;
    }
  };

  const currentTabs = TABS[lang];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-[48px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              {lang === 'IT' ? 'Release Manifesto' : 'Release Manifesto'}
            </h2>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em]">
              {lang === 'IT' ? 'Documentazione Ufficiale v1.0' : 'Official Documentation v1.0'}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setLang(lang === 'IT' ? 'EN' : 'IT')} 
              className="px-3 py-1 bg-slate-800 rounded-lg text-[8px] font-black text-slate-400 hover:text-white transition-all border border-white/5"
            >
              {lang === 'IT' ? 'EN' : 'IT'}
            </button>
            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">✕</button>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950/20">
          {/* Side Index / Navigation Rail */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 overflow-x-auto md:overflow-y-auto scrollbar-hide">
            <div className="flex md:flex-col min-w-max md:min-w-0 gap-1 md:gap-2 px-4 py-4 md:p-6">
              {currentTabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`shrink-0 md:w-full rounded-xl md:rounded-2xl px-5 md:px-6 py-3 text-[9px] md:text-[10px] uppercase font-black whitespace-nowrap tracking-widest transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] text-left relative group ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-slate-950 rounded-r-full hidden md:block" />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 scrollbar-hide p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
              {lang === 'IT' ? renderIT() : renderEN()}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-slate-800 text-right bg-slate-900/50 flex justify-between items-center">
          <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">© 2025 Dungeon Architects • Null Reality Protocol</span>
          <button onClick={onClose} className="px-10 py-3 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all text-[10px] uppercase tracking-widest shadow-xl">
            {lang === 'IT' ? 'Compreso' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
