
import React, { useState, useEffect } from 'react';

export interface TutorialStep {
  target: string; // CSS selector or logical key
  title: string;
  text: string;
  actionRequired?: string;
}

interface Props {
  step: number;
  onNext: () => void;
  onComplete: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "room",
    title: "Benvenuto Recluta!",
    text: "Scoundrel è un dungeon crawler solitario. Il tuo obiettivo è svuotare il mazzo di 44 carte restando in vita. Questa è la tua prima stanza.",
  },
  {
    target: "card-monster",
    title: "I Mostri (Fiori e Picche)",
    text: "Questi sono i tuoi nemici. Seleziona il mostro per decidere come affrontarlo.",
    actionRequired: "SELECT_CARD"
  },
  {
    target: "unarmed-btn",
    title: "Combattere a Mani Nude",
    text: "Senza armi, sconfiggi il mostro ma subisci danni pari al suo valore. Prova a cliccare 'MANI NUDE'.",
    actionRequired: "CLICK_UNARMED"
  },
  {
    target: "card-weapon",
    title: "Le Armi (Quadri)",
    text: "Le armi ti permettono di uccidere mostri senza subire danni. Seleziona la carta Quadri per equipaggiarla.",
    actionRequired: "SELECT_WEAPON"
  },
  {
    target: "weapon-btn",
    title: "Equipaggiamento",
    text: "Clicca 'USA/EQUIP ARMA'. Una volta equipaggiata, potrai sconfiggere mostri di valore pari o inferiore a quello dell'arma subendo 0 danni!",
    actionRequired: "EQUIP_WEAPON"
  },
  {
    target: "hud-health",
    title: "Salute e Carry-over",
    text: "La tua salute è preziosa. Ricorda: se lasci UNA sola carta nella stanza, questa resterà per la prossima (Carry-over). Se ne restano 2 o più, puoi usare la Ritirata.",
  },
  {
    target: "complete",
    title: "Sei Pronto!",
    text: "Hai imparato le basi. Ora entra nel vero dungeon e cerca di sopravvivere il più a lungo possibile. Buona fortuna!",
  }
];

const TutorialOverlay: React.FC<Props> = ({ step, onNext, onComplete }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const currentStep = TUTORIAL_STEPS[step];

  // Reset minimized state when moving to a new step
  useEffect(() => {
    setIsMinimized(false);
  }, [step]);

  if (!currentStep) return null;

  const isLast = step === TUTORIAL_STEPS.length - 1;

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-[600] pointer-events-auto">
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white/20 group"
        >
          <span className="text-xl">🎓</span>
          <div className="text-left">
            <div className="text-[8px] font-black uppercase tracking-tighter opacity-70">Tutorial Attivo</div>
            <div className="text-xs font-black uppercase">Mostra Istruzioni</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none">
      {/* Dimmer backdrop */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none transition-opacity duration-300" />
      
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-slate-900 border-2 border-blue-500 p-8 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)] max-w-sm w-full pointer-events-auto animate-in zoom-in duration-300 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start mb-4">
            <span className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded">TUTORIAL {step + 1}/{TUTORIAL_STEPS.length}</span>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setIsMinimized(true)} 
                className="text-blue-400 hover:text-blue-300 transition-colors text-[10px] font-black uppercase flex items-center gap-1"
                title="Nascondi per vedere il gioco"
              >
                👁️ Nascondi
              </button>
              {!currentStep.actionRequired && (
                 <button onClick={onComplete} className="text-slate-500 hover:text-white transition-colors text-[10px] uppercase font-black">Skip</button>
              )}
            </div>
          </div>
          
          <h3 className="text-xl font-black title-font mb-2 text-white uppercase tracking-tight">{currentStep.title}</h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">{currentStep.text}</p>
          
          {!currentStep.actionRequired ? (
            <button 
              onClick={isLast ? onComplete : onNext}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs shadow-lg shadow-blue-900/40"
            >
              {isLast ? "INIZIA A GIOCARE" : "AVANTI"}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-blue-950/40 rounded-xl border border-blue-800/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Azione richiesta per proseguire</span>
            </div>
          )}
        </div>
      </div>

      {/* Pulsing indicator - Simplified positioning for tutorial demo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
    </div>
  );
};

export default TutorialOverlay;
