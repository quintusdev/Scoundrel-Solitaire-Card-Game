
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
                <li className="text-orange-400 font-bold">La Regola del Carry-Over: Quando nella stanza rimane solo UNA carta, questa NON viene scartata. Essa resta sul tavolo e diventa la prima carta della stanza successiva, a cui vengono aggiunte 3 nuove carte dal mazzo.</li>
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
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-400">Ritirata (Flee / Avoid)</h3>
            <p className="text-slate-300">Puoi fuggire da una stanza intera se le carte presenti sono troppo pericolose per il tuo equipaggiamento attuale.</p>
            
            <div className="bg-slate-800/50 p-5 rounded-2xl border border-blue-500/30 space-y-4 shadow-lg shadow-blue-900/10">
              <p className="text-sm text-blue-400 font-black uppercase tracking-widest">Meccanica di Spostamento delle Carte:</p>
              <ul className="list-disc pl-5 text-slate-300 space-y-3 text-sm">
                  <li>Tutte le 4 carte attualmente presenti nella stanza vengono rimosse dal tavolo e rimesse <span className="text-blue-400 font-bold">IN FONDO</span> al mazzo del dungeon.</li>
                  <li><strong className="text-white">Conservazione dell'Ordine:</strong> Le carte non vengono rimescolate tra loro. Mantengono l'ordine esatto in cui apparivano nella stanza, da <span className="text-orange-400 font-bold">sinistra a destra</span>.</li>
                  <li>Questo significa che se nel mazzo sono rimaste 10 carte, le 4 carte della fuga diventeranno le carte dalla 11ª alla 14ª.</li>
                  <li><strong className="text-white">Memoria del Dungeon:</strong> Incontrerai di nuovo queste esatte carte alla fine della partita, nello stesso ordine sequenziale in cui le hai viste oggi.</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
               <p className="text-sm text-slate-400 italic">"Fuggire non elimina il pericolo, lo rimanda soltanto. Preparati a riaffrontare quel mostro 14 quando il mazzo sarà quasi esaurito."</p>
            </div>

            <ul className="list-disc pl-5 text-slate-400 space-y-2 text-sm">
                <li>Si pesca immediatamente una nuova stanza completa da 4 carte.</li>
                <li><strong>Cooldown:</strong> La Fuga ha un tempo di ricarica. Non puoi fuggire da due stanze consecutive. Devi svuotare la stanza successiva quasi completamente (lasciando 0 o 1 carta per il carry-over) per riattivare l'abilità.</li>
            </ul>
          </div>
        );
      case "Esempi":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="font-bold mb-2 text-slate-200">Carry-Over</p>
              <button onClick={() => setExampleVisible(1)} className="text-blue-400 text-sm hover:underline">Vedi esito →</button>
              {exampleVisible === 1 && <p className="mt-2 text-emerald-400 text-sm font-bold">Hai affrontato 3 carte. L'ultima (un Mostro 13) resta lì. Peschi 3 nuove carte. Ora la stanza ha il Mostro 13 e 3 carte nuove.</p>}
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="font-bold mb-2 text-slate-200">Ordine Fuga</p>
              <button onClick={() => setExampleVisible(2)} className="text-blue-400 text-sm hover:underline">Vedi esito →</button>
              {exampleVisible === 2 && <p className="mt-2 text-blue-400 text-sm font-bold">In stanza hai: Mostro 10, Pozione 4, Arma 8, Mostro 12. Se fuggi, queste carte andranno in fondo al mazzo esattamente in questo ordine. Le pescherai di nuovo alla fine della partita così come sono.</p>}
            </div>
          </div>
        );
      case "Casi Ambigui":
        return (
          <div className="space-y-4 h-[400px] overflow-y-auto pr-2 animate-in fade-in duration-300 scrollbar-hide">
            {[
              { q: "Cosa succede se la quarta carta è una pozione?", a: "Resta sul tavolo come Carry-over. La prossima stanza inizierà con quella pozione più 3 carte nuove." },
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
