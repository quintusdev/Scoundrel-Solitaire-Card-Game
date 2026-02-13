
import React, { useState } from 'react';

const TABS = ["Setup", "Turno", "Armi", "Cure", "Fuga", "Esempi", "Casi Ambigui"];

const RulesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("Setup");
  const [exampleVisible, setExampleVisible] = useState<number | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case "Setup":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-red-500">Preparazione del Mazzo</h3>
            <p className="text-slate-300">Il mazzo è composto da 52 carte standard. Vengono rimosse tutte le figure rosse (J, Q, K, A di Cuori e Quadri).</p>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="block text-red-500 font-bold">♥️ Cuori</span>
                    <span className="text-xs text-slate-400">Pozioni (Cura)</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="block text-red-500 font-bold">♦️ Quadri</span>
                    <span className="text-xs text-slate-400">Armi (Attacco)</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="block text-slate-400 font-bold">♣️ Fiori</span>
                    <span className="text-xs text-slate-400">Mostri (Nemici)</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="block text-slate-400 font-bold">♠️ Picche</span>
                    <span className="text-xs text-slate-400">Mostri (Nemici)</span>
                </div>
            </div>
          </div>
        );
      case "Turno":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-orange-500">Ciclo della Stanza</h3>
            <p className="text-slate-300">Ogni stanza contiene 4 carte. Devi interagire con esse per svuotare la stanza e passare alla prossima.</p>
            <ul className="list-disc pl-5 text-slate-400 space-y-2 text-sm">
                <li>Seleziona una carta cliccandoci sopra e scegli un'azione.</li>
                <li className="text-red-400 font-bold underline">Divieto di Scarto: Non puoi MAI scartare una carta volontariamente.</li>
                <li className="text-orange-400 font-bold">La Regola del Carry-Over: Quando nella stanza rimane solo UNA carta, questa NON viene scartata. Essa resta sul tavolo e diventa la prima carta della stanza successiva.</li>
            </ul>
          </div>
        );
      case "Armi":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-blue-500">Combattimento</h3>
            <div className="space-y-3">
                <div className="p-4 bg-blue-950/20 border border-blue-900 rounded-xl">
                    <p className="font-bold text-blue-400 mb-1">Equipaggiamento (Quadri)</p>
                    <p className="text-xs text-slate-400">Seleziona Quadri e clicca "Usa/Equip Arma". Sostituisce l'arma corrente.</p>
                </div>
                <div className="p-4 bg-orange-950/20 border border-orange-900 rounded-xl">
                    <p className="font-bold text-orange-400 mb-1">Mani Nude (Letale)</p>
                    <p className="text-xs text-slate-400">Sconfiggi QUALSIASI mostro, ma subisci sempre danni pari al suo intero valore.</p>
                </div>
                <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <p className="font-bold text-slate-200 mb-1">Uso Arma</p>
                    <p className="text-xs text-slate-400">Se Valore Arma ≥ Valore Mostro, il mostro muore e tu NON subisci danni.</p>
                </div>
            </div>
          </div>
        );
      case "Cure":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-emerald-500">Pozioni</h3>
            <p className="text-slate-300">La salute massima è 20.</p>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center font-bold italic text-[10px]">Stanza</div>
                    <div className="text-sm text-slate-300">Carta Cuori: cura pari al suo valore.</div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold italic text-[10px]">Scorta</div>
                    <div className="text-sm text-slate-300">Bottone "Usa Pozione" (senza selezione): +7 HP, consuma 1 scorta.</div>
                </div>
            </div>
          </div>
        );
      case "Fuga":
        return (
          <div className="space-y-4 animate-in fade-in duration-300 overflow-y-auto scrollbar-hide max-h-[500px]">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tighter">Ritirata Strategica</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              La Fuga è l'unica manovra che ti permette di evitare un disastro imminente, ma è una scelta che influenzerà pesantemente il "late game".
            </p>
            
            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 space-y-3">
              <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest">Documentazione Tecnica: Gestione Coda</h4>
              <p className="text-xs text-slate-300">
                Quando attivi la Fuga, il gioco esegue le seguenti operazioni atomiche:
              </p>
              <ol className="list-decimal pl-5 text-xs text-slate-400 space-y-2">
                <li><span className="text-white">Identificazione:</span> Le 4 carte attualmente visibili vengono raggruppate come un blocco unico.</li>
                <li><span className="text-white">Preservazione Sequenziale:</span> Le carte <strong className="text-blue-300 underline">NON vengono rimescolate</strong>. Se in stanza hai [A, B, C, D], esse resteranno in quell'ordine esatto.</li>
                <li><span className="text-white">Accodamento:</span> L'intero blocco viene spostato fisicamente in fondo al mazzo del dungeon (Deck Bottom).</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs font-bold text-slate-200 mb-2 uppercase">Esempio di Coda:</p>
                <div className="flex items-center gap-2 justify-center mb-4">
                  <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[8px]">M 14</div>
                  <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[8px]">M 12</div>
                  <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[8px]">P 8</div>
                  <div className="w-8 h-12 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[8px]">A 9</div>
                  <div className="text-blue-500 font-black px-2">➔</div>
                  <div className="w-16 h-12 bg-blue-950/40 rounded border border-blue-800 flex items-center justify-center text-[8px] text-center px-1">FONDO MAZZO</div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  "Se fuggi ora, il Mostro 14 e il Mostro 12 saranno le ultimissime carte che pescherai prima di vincere o morire. Sarai pronto ad affrontarli allora?"
                </p>
              </div>
            </div>

            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
               <p className="text-xs text-red-400 font-bold uppercase mb-1">Restrizioni Critiche:</p>
               <ul className="list-disc pl-5 text-[11px] text-slate-400 space-y-1">
                 <li>Non puoi fuggire se la stanza precedente è stata essa stessa frutto di una fuga.</li>
                 <li>Devi interagire con almeno 3 carte della stanza attuale (o lasciarne 1 per il carry-over) per ripristinare la possibilità di fuggire.</li>
               </ul>
            </div>
          </div>
        );
      case "Esempi":
        return (
          <div className="space-y-6 animate-in fade-in duration-300 overflow-y-auto scrollbar-hide max-h-[500px]">
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-orange-500 uppercase">Esempio Visivo: Carry-Over</h3>
              <p className="text-sm text-slate-300">Il Carry-over permette di gestire mostri pericolosi o conservare risorse per la stanza successiva.</p>
              
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                {/* Visual Step 1 */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Passaggio 1: Fine Stanza Corrente</span>
                  <div className="flex gap-2 opacity-50 grayscale scale-90 origin-left">
                    <div className="w-12 h-16 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px]">X</div>
                    <div className="w-12 h-16 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px]">X</div>
                    <div className="w-12 h-16 bg-slate-800 rounded border border-slate-700 flex items-center justify-center text-[8px]">X</div>
                    <div className="w-12 h-16 bg-orange-900/40 rounded border-2 border-orange-500 flex flex-col items-center justify-center text-[8px] opacity-100 grayscale-0 scale-110">
                      <span className="font-bold">M 13</span>
                      <span className="text-[6px]">CARRY</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Hai sconfitto 3 carte. Rimane solo il Mostro 13.</p>
                </div>

                <div className="flex justify-center text-orange-500 animate-bounce">↓</div>

                {/* Visual Step 2 */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500">Passaggio 2: Nuova Stanza Generata</span>
                  <div className="flex gap-2">
                    <div className="w-12 h-16 bg-orange-900/40 rounded border-2 border-orange-500 flex flex-col items-center justify-center text-[8px]">
                      <span className="font-bold">M 13</span>
                    </div>
                    <div className="w-12 h-16 bg-blue-900/40 rounded border-2 border-blue-400 flex flex-col items-center justify-center text-[8px] animate-pulse">
                      <span className="font-bold">A 8</span>
                      <span className="text-[6px]">NEW</span>
                    </div>
                    <div className="w-12 h-16 bg-emerald-900/40 rounded border-2 border-emerald-400 flex flex-col items-center justify-center text-[8px] animate-pulse">
                      <span className="font-bold">P 5</span>
                      <span className="text-[6px]">NEW</span>
                    </div>
                    <div className="w-12 h-16 bg-slate-800 rounded border-2 border-slate-600 flex flex-col items-center justify-center text-[8px] animate-pulse">
                      <span className="font-bold">M 6</span>
                      <span className="text-[6px]">NEW</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Il Mostro 13 è rimasto. Peschi 3 nuove carte dal mazzo per completare la stanza.</p>
                </div>
              </div>
            </section>

            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="font-bold mb-2 text-slate-200">Perché usare il Carry-Over?</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ti permette di "aspettare" un'arma migliore. Se hai un Mostro 10 e non hai armi, lasciarlo come carry-over ti dà la possibilità di pescare un'arma nella prossima stanza per sconfiggerlo senza subire danni.
              </p>
            </div>
          </div>
        );
      case "Casi Ambigui":
        return (
          <div className="space-y-4 h-[400px] overflow-y-auto pr-2 animate-in fade-in duration-300 scrollbar-hide">
            {[
              { q: "Cosa succede se la quarta carta è una pozione?", a: "Resta sul tavolo come Carry-over. La prossima stanza inizierà con quella pozione più 3 carte nuove." },
              { q: "Come viene calcolato esattamente il danno quando uso un'arma contro un mostro?", a: "La formula è: [Valore Mostro] - [Valore Arma] = [Salute Persa]. Se il valore dell'arma è uguale o superiore a quello del mostro, il danno è zero. Esempio: Mostro 12 contro Spada 8 -> Subisci 4 danni (12 - 8 = 4)." },
              { q: "Posso scartare una carta se non ho armi?", a: "No. Devi decidere se affrontarla a mani nude o usare la Fuga (se disponibile)." },
              { q: "Perché la Fuga mette le carte in fondo e non le mescola?", a: "È una scelta di design: premia i giocatori che hanno memoria. Sapere esattamente cosa ti aspetta nelle ultime 4-8 carte del mazzo è fondamentale per vincere la partita." },
              { q: "Posso fuggire da una stanza di carry-over?", a: "Sì, se ci sono almeno 2 carte totali (la carta portata e le 3 nuove) e se il cooldown è terminato." },
              { q: "Cosa succede se fuggo quando mancano meno di 4 carte nel mazzo?", a: "Le carte della stanza vanno comunque in fondo e peschi quello che rimane. Se il mazzo è vuoto, fuggire rimetterà solo le carte attuali in coda e te le restituirà subito come nuova stanza." }
            ].map((item, i) => (
              <div key={i} className="border-b border-slate-700 pb-3">
                <p className="font-bold text-red-400 text-sm mb-1">Q: {item.q}</p>
                <p className="text-slate-300 text-sm italic">R: {item.a}</p>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 modal-backdrop" role="dialog" aria-modal="true">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-2xl title-font font-bold tracking-widest text-white uppercase">Manuale del Dungeon</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="flex border-b border-slate-800 overflow-x-auto bg-slate-950/30">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-4 text-[10px] uppercase font-black whitespace-nowrap tracking-widest transition-all ${activeTab === tab ? 'rules-tab-active bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
          ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 scrollbar-hide">{renderContent()}</div>

        <div className="p-6 border-t border-slate-800 text-right bg-slate-900/50">
          <button onClick={onClose} className="px-8 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs uppercase tracking-widest">Capito</button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
