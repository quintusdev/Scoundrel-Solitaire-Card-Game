
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
            <p className="text-slate-300">Il mazzo è composto da 52 carte standard, ma vengono rimosse tutte le figure rosse (J, Q, K, A di Cuori e Quadri).</p>
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
                <li className="text-red-400 font-bold underline">Divieto di Scarto: Non puoi MAI scartare volontariamente una carta per "saltarla" o ignorarla.</li>
                <li>Le carte vengono rimosse solo se sconfitte, equipaggiate o usate.</li>
                <li className="text-orange-400 font-bold">La Regola del Quarto Scarto: Quando nella stanza rimane solo UNA carta, questa viene scartata automaticamente senza alcun effetto (positivo o negativo) e si passa alla stanza successiva.</li>
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
                    <p className="text-xs text-slate-400">Sconfiggi QUALSIASI mostro. Tuttavia, subisci danni pari al valore intero del mostro.</p>
                </div>
                <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl">
                    <p className="font-bold text-slate-200 mb-1">Uso Arma</p>
                    <p className="text-xs text-slate-400">Se Valore Arma ≥ Valore Mostro, il mostro muore e tu NON subisci danni. L'arma NON si rompe.</p>
                </div>
            </div>
          </div>
        );
      case "Cure":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-emerald-500">Pozioni</h3>
            <p className="text-slate-300">La salute massima è 20. Non puoi superarla.</p>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-600 rounded flex items-center justify-center font-bold italic text-[10px]">Stanza</div>
                    <div className="text-sm text-slate-300">Carta Cuori selezionata: cura pari al valore della carta.</div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold italic text-[10px]">Scorta</div>
                    <div className="text-sm text-slate-300">Nessuna selezione: consuma 1 scorta per +7 HP.</div>
                </div>
            </div>
          </div>
        );
      case "Fuga":
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-400">La Ritirata</h3>
            <p className="text-slate-300">Puoi fuggire da una stanza se la situazione è critica, ma con un costo strategico.</p>
            <ul className="list-disc pl-5 text-slate-400 space-y-2 text-sm">
                <li>Tutte le carte rimanenti vengono rimescolate nel mazzo.</li>
                <li>Si passa immediatamente alla stanza successiva.</li>
                <li><strong>Cooldown:</strong> Una volta utilizzata la fuga, essa sarà disattivata per l'intera stanza successiva.</li>
            </ul>
          </div>
        );
      case "Esempi":
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="font-bold mb-2 text-slate-200">Mostro Val 8 vs Arma Val 10</p>
              <button onClick={() => setExampleVisible(1)} className="text-blue-400 text-sm hover:underline">Vedi esito →</button>
              {exampleVisible === 1 && <p className="mt-2 text-emerald-400 text-sm font-bold">Mostro eliminato, 0 danni subiti. Arma resta equipaggiata.</p>}
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="font-bold mb-2 text-slate-200">Mostro Val 7 vs Mani Nude</p>
              <button onClick={() => setExampleVisible(2)} className="text-blue-400 text-sm hover:underline">Vedi esito →</button>
              {exampleVisible === 2 && <p className="mt-2 text-orange-400 text-sm font-bold">Mostro eliminato, ma perdi 7 HP.</p>}
            </div>
          </div>
        );
      case "Casi Ambigui":
        return (
          <div className="space-y-4 h-[400px] overflow-y-auto pr-2 animate-in fade-in duration-300">
            {[
              { q: "Posso scartare una carta che non mi serve?", a: "Assolutamente no. Devi affrontarla (combattere o curarti) oppure fuggire dalla stanza intera rimescolando tutto." },
              { q: "Perché non posso giocare l'ultima carta?", a: "È la regola dello 'Scarto della Quarta': in ogni stanza devi scegliere quali 3 carte affrontare. L'ultima viene sempre persa per bilanciare il mazzo." },
              { q: "Cosa succede se provo a forzare la prossima stanza?", a: "Il gioco non lo permette. Solo svuotando la stanza (tranne l'ultima carta) o usando la Fuga puoi procedere." },
              { q: "L'arma si rompe dopo un attacco?", a: "No. L'arma rimane equipaggiata finché non decidi di sostituirla con un'altra carta Quadri." },
              { q: "Mani nude contro Valore 13?", a: "Sì, lo sconfiggi, ma perdi 13 HP. È un'azione spesso necessaria ma brutale." },
              { q: "Ritirata disattivata?", a: "Succede se l'hai usata nella stanza precedente. Non puoi fuggire da due stanze consecutive." }
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
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 text-[10px] uppercase font-black whitespace-nowrap tracking-widest transition-all ${activeTab === tab ? 'rules-tab-active bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950">
          {renderContent()}
        </div>

        <div className="p-6 border-t border-slate-800 text-right bg-slate-900/50">
          <button onClick={onClose} className="px-8 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all text-xs uppercase tracking-widest">Capito</button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
