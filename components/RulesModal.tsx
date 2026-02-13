
import React, { useState } from 'react';

type Language = 'IT' | 'EN';

const TABS = {
  IT: [
    { id: "intro", label: "Manuale" },
    { id: "combat", label: "Combattimento" },
    { id: "modes", label: "Difficoltà" },
    { id: "vault", label: "Vault" },
    { id: "progression", label: "Evoluzione" },
    { id: "universe", label: "Universo" }
  ],
  EN: [
    { id: "intro", label: "Manual" },
    { id: "combat", label: "Combat" },
    { id: "modes", label: "Difficulty" },
    { id: "vault", label: "Vault" },
    { id: "progression", label: "Evolution" },
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
          <div className="space-y-6 animate-in fade-in duration-300">
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">1. Obiettivo del Gioco</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scoundrel è un dungeon crawler solitario basato sull'uso strategico di un mazzo di 52 carte. Il tuo compito è navigare attraverso le stanze del dungeon, sconfiggere le minacce e consumare l'intero mazzo restando in vita. 
                La vittoria viene dichiarata solo quando l'ultima carta del mazzo e della stanza viene risolta.
              </p>
            </section>
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">2. Anatomia del Dungeon</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-1">♥️ Cuori</span>
                  <p className="text-xs text-slate-300 font-bold">Pozioni di Cura</p>
                  <p className="text-[10px] text-slate-500 mt-1">Ripristinano vitalità basata sul valore della carta.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-1">♦️ Quadri</span>
                  <p className="text-xs text-slate-300 font-bold">Armi e Scudi</p>
                  <p className="text-[10px] text-slate-500 mt-1">Necessarie per abbattere i mostri senza soccombere.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 col-span-2">
                  <span className="block text-slate-400 font-black text-[10px] uppercase mb-1">♣️ ♠️ Fiori e Picche</span>
                  <p className="text-xs text-slate-300 font-bold">Mostri e Aberrazioni</p>
                  <p className="text-[10px] text-slate-500 mt-1">I nemici del dungeon. Ogni carta rappresenta una minaccia con forza pari al suo valore.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "combat":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section>
              <h3 className="text-xl font-black text-blue-500 uppercase tracking-tighter italic mb-2">Scontro Diretto</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Il combattimento è matematico e spietato. Quando affronti un mostro, l'esito dipende dal tuo equipaggiamento:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-2xl">
                  <p className="text-xs font-black text-blue-400 uppercase mb-1">Con Arma (♦️)</p>
                  <p className="text-xs text-slate-300">Se Valore Arma ≥ Valore Mostro, il nemico viene eliminato senza subire danni. Se inferiore, subisci la differenza in punti vita (regola variabile in base alla difficoltà).</p>
                </div>
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
                  <p className="text-xs font-black text-red-400 uppercase mb-1">A Mani Nude</p>
                  <p className="text-xs text-slate-300">Puoi sempre scegliere di affrontare un mostro senza arma, ma subirai l'intero valore del mostro come danno diretto.</p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xl font-black text-orange-500 uppercase tracking-tighter italic mb-2">Durabilità e Limiti</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nelle modalità avanzate, le armi non sono eterne. Possiedono una durabilità limitata che si consuma ad ogni attacco. Una volta esaurita, l'arma si spezza e l'eroe torna a combattere a mani nude.
              </p>
            </section>
          </div>
        );
      case "modes":
        return (
          <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto scrollbar-hide max-h-[500px]">
            <h3 className="text-xl font-black text-yellow-500 uppercase tracking-tighter italic">Protocolli di Sfida</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">Normale</p>
                <p className="text-[11px] text-slate-400">Regole classiche. Danno calcolato per differenza. Massima flessibilità strategica.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">Hardcore</p>
                <p className="text-[11px] text-slate-400">Il dungeon non perdona. Se la tua arma è più debole del mostro, non ricevi alcuna protezione: subisci il danno pieno del nemico.</p>
              </div>
              <div className="border-l-4 border-red-600 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">Inferno</p>
                <p className="text-[11px] text-slate-400">Risorse scarse e nemici letali. Le armi durano solo 3 colpi. Le pozioni sono meno efficaci. Non puoi attaccare se l'arma è troppo debole.</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">GOD MODE</p>
                <p className="text-[11px] text-slate-400">La prova finale. Ironman Run: nessun salvataggio. Cure ridotte drasticamente. Durabilità minima. Solo i veri maestri del dungeon possono sopravvivere.</p>
              </div>
            </div>
          </div>
        );
      case "vault":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Vault e Persistenza</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Il Vault è il sistema di sicurezza che preserva i tuoi progressi. Ogni profilo dispone di 2 slot di salvataggio per ogni livello di difficoltà.
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 space-y-2">
              <li><strong className="text-slate-300">Autosave:</strong> Il gioco salva automaticamente ogni 10 stanze completate.</li>
              <li><strong className="text-slate-300">Combat Lock:</strong> Non è possibile salvare se è stata selezionata una carta ma l'azione non è ancora stata risolta.</li>
              <li><strong className="text-slate-300">Integrità:</strong> Ogni salvataggio è protetto da una firma digitale che ne garantisce l'autenticità.</li>
              <li><strong className="text-slate-300">Restrizioni:</strong> GOD MODE e modalità avanzate disabilitano permanentemente la possibilità di salvare.</li>
            </ul>
          </div>
        );
      case "progression":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section>
              <h3 className="text-xl font-black text-purple-500 uppercase tracking-tighter italic mb-2">Ascensione dell'Eroe</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ogni azione nel dungeon contribuisce alla tua leggenda. Il sistema di progressione si basa su tre pilastri:
              </p>
            </section>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-xs font-black text-white uppercase mb-1">Tier Evolutivi</p>
                <p className="text-[10px] text-slate-400">Rappresentati da forzieri nel menu principale, i Tier mostrano il tuo grado di maestria complessiva.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-xs font-black text-white uppercase mb-1">Varianti Eterne</p>
                <p className="text-[10px] text-slate-400">Skin e aspetti evolutivi sbloccabili tramite imprese specifiche nelle modalità più difficili.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-xs font-black text-white uppercase mb-1">Hall of Eternal</p>
                <p className="text-[10px] text-slate-400">Un archivio persistente che conserva le tue vittorie gloriose e le tue cadute più memorabili.</p>
              </div>
            </div>
          </div>
        );
      case "universe":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-cyan-400 uppercase tracking-tighter italic">Universo Evolutivo</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Alcune incursioni nel dungeon possono avere conseguenze che trascendono la singola partita. L'Universo di Scoundrel è suscettibile a "contaminazioni" dimensionali.
            </p>
            <div className="p-5 bg-cyan-950/20 border border-cyan-500/30 rounded-3xl">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "In modalità avanzate, le regole della realtà possono piegarsi. Anomalie persistenti possono influenzare il mondo di gioco, offrendo vantaggi inaspettati o pericoli letali. Questi cambiamenti sono rari, limitati e legati alle tue scoperte più profonde."
              </p>
            </div>
            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest text-center mt-4">
              Nessun sistema è immutabile. Il dungeon impara da te.
            </p>
          </div>
        );
      default: return null;
    }
  };

  const renderEN = () => {
    switch (activeTab) {
      case "intro":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">1. Game Objective</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scoundrel is a solitary dungeon crawler based on the strategic use of a 52-card deck. Your task is to navigate through dungeon rooms, defeat threats, and consume the entire deck while staying alive. 
                Victory is declared only when the last card of both the deck and the room has been resolved.
              </p>
            </section>
            <section>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">2. Dungeon Anatomy</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-1">♥️ Hearts</span>
                  <p className="text-xs text-slate-300 font-bold">Healing Potions</p>
                  <p className="text-[10px] text-slate-500 mt-1">Restore vitality based on the card's value.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                  <span className="block text-red-500 font-black text-[10px] uppercase mb-1">♦️ Diamonds</span>
                  <p className="text-xs text-slate-300 font-bold">Weapons and Shields</p>
                  <p className="text-[10px] text-slate-500 mt-1">Necessary to strike down monsters without perishing.</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 col-span-2">
                  <span className="block text-slate-400 font-black text-[10px] uppercase mb-1">♣️ ♠️ Clubs and Spades</span>
                  <p className="text-xs text-slate-300 font-bold">Monsters and Aberrations</p>
                  <p className="text-[10px] text-slate-500 mt-1">Dungeon enemies. Each card represents a threat with power equal to its value.</p>
                </div>
              </div>
            </section>
          </div>
        );
      case "combat":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section>
              <h3 className="text-xl font-black text-blue-500 uppercase tracking-tighter italic mb-2">Direct Combat</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Combat is mathematical and merciless. When facing a monster, the outcome depends on your equipment:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded-2xl">
                  <p className="text-xs font-black text-blue-400 uppercase mb-1">Armed (♦️)</p>
                  <p className="text-xs text-slate-300">If Weapon Value ≥ Monster Value, the enemy is eliminated without taking damage. If lower, you suffer the difference in health points (rules vary by difficulty).</p>
                </div>
                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
                  <p className="text-xs font-black text-red-400 uppercase mb-1">Unarmed</p>
                  <p className="text-xs text-slate-300">You can always choose to face a monster without a weapon, but you will suffer the monster's full value as direct damage.</p>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xl font-black text-orange-500 uppercase tracking-tighter italic mb-2">Durability and Limits</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                In advanced modes, weapons are not eternal. They possess limited durability that is consumed with each attack. Once exhausted, the weapon shatters, and the hero returns to fighting unarmed.
              </p>
            </section>
          </div>
        );
      case "modes":
        return (
          <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto scrollbar-hide max-h-[500px]">
            <h3 className="text-xl font-black text-yellow-500 uppercase tracking-tighter italic">Challenge Protocols</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">Normal</p>
                <p className="text-[11px] text-slate-400">Classic rules. Damage calculated by difference. Maximum strategic flexibility.</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">Hardcore</p>
                <p className="text-[11px] text-slate-400">The dungeon does not forgive. If your weapon is weaker than the monster, you receive no protection: you suffer the enemy's full damage.</p>
              </div>
              <div className="border-l-4 border-red-600 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">Inferno</p>
                <p className="text-[11px] text-slate-400">Scarce resources and lethal enemies. Weapons last only 3 hits. Potions are less effective. You cannot attack if your weapon is too weak.</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="font-black text-white text-xs uppercase tracking-widest">GOD MODE</p>
                <p className="text-[11px] text-slate-400">The ultimate test. Ironman Run: no saving. Healing drastically reduced. Minimum durability. Only true dungeon masters can survive.</p>
              </div>
            </div>
          </div>
        );
      case "vault":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Vault and Persistence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Vault is the security system that preserves your progress. Each profile has 2 save slots for each difficulty level.
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-500 space-y-2">
              <li><strong className="text-slate-300">Autosave:</strong> The game automatically saves every 10 completed rooms.</li>
              <li><strong className="text-slate-300">Combat Lock:</strong> It is not possible to save if a card is selected but the action has not yet been resolved.</li>
              <li><strong className="text-slate-300">Integrity:</strong> Every save is protected by a digital signature to guarantee its authenticity.</li>
              <li><strong className="text-slate-300">Restrictions:</strong> GOD MODE and advanced modes permanently disable the ability to save.</li>
            </ul>
          </div>
        );
      case "progression":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section>
              <h3 className="text-xl font-black text-purple-500 uppercase tracking-tighter italic mb-2">Hero Ascension</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every action in the dungeon contributes to your legend. The progression system is based on three pillars:
              </p>
            </section>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-xs font-black text-white uppercase mb-1">Evolutionary Tiers</p>
                <p className="text-[10px] text-slate-400">Represented by chests in the main menu, Tiers show your overall degree of mastery.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-xs font-black text-white uppercase mb-1">Eternal Variants</p>
                <p className="text-[10px] text-slate-400">Skins and evolutionary aspects unlockable through specific feats in the most difficult modes.</p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700">
                <p className="text-xs font-black text-white uppercase mb-1">Hall of Eternal</p>
                <p className="text-[10px] text-slate-400">A persistent archive that preserves your glorious victories and your most memorable falls.</p>
              </div>
            </div>
          </div>
        );
      case "universe":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-black text-cyan-400 uppercase tracking-tighter italic">Evolving Universe</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Some dungeon incursions can have consequences that transcend a single game. The Scoundrel Universe is susceptible to dimensional "contaminations."
            </p>
            <div className="p-5 bg-cyan-950/20 border border-cyan-500/30 rounded-3xl">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "In advanced modes, the rules of reality can bend. Persistent anomalies can influence the game world, offering unexpected advantages or lethal dangers. These changes are rare, limited, and linked to your deepest discoveries."
              </p>
            </div>
            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest text-center mt-4">
              No system is immutable. The dungeon learns from you.
            </p>
          </div>
        );
      default: return null;
    }
  };

  const currentTabs = TABS[lang];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[48px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
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
        
        <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/30 no-scrollbar">
          {currentTabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-6 py-5 text-[10px] uppercase font-black whitespace-nowrap tracking-widest transition-all ${activeTab === tab.id ? 'text-white border-b-2 border-white bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-10 flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 scrollbar-hide">
          {lang === 'IT' ? renderIT() : renderEN()}
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
