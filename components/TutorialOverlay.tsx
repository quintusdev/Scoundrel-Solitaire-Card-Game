
import React from 'react';

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
  const currentStep = TUTORIAL_STEPS[step];
  if (!currentStep) return null;

  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[500] pointer-events-none">
      {/* Dimmer backdrop - In a real app we'd use clip-path to highlight specific elements */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-slate-900 border-2 border-blue-500 p-8 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)] max-w-sm w-full pointer-events-auto animate-in zoom-in duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded">TUTORIAL {step + 1}/{TUTORIAL_STEPS.length}</span>
            {!currentStep.actionRequired && (
               <button onClick={isLast ? onComplete : onNext} className="text-slate-500 hover:text-white transition-colors text-xs uppercase font-black">Skip Tutorial</button>
            )}
          </div>
          
          <h3 className="text-xl font-black title-font mb-2 text-white uppercase tracking-tight">{currentStep.title}</h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">{currentStep.text}</p>
          
          {!currentStep.actionRequired ? (
            <button 
              onClick={isLast ? onComplete : onNext}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs"
            >
              {isLast ? "INIZIA A GIOCARE" : "AVANTI"}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-blue-400 animate-pulse">
              <span className="text-lg">➔</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Azione richiesta per proseguire</span>
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
