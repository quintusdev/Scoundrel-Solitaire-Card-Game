
import React, { useState, useEffect } from 'react';

export interface TutorialStep {
  targetId: string;
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
    targetId: "room-container",
    title: "Benvenuto Recluta!",
    text: "L'obiettivo è svuotare il mazzo restando in vita. Questa è la tua prima stanza.",
  },
  {
    targetId: "card-Picche-5",
    title: "I Mostri (Fiori/Picche)",
    text: "Sono i tuoi nemici. Clicca sulla carta Picche per selezionarla.",
    actionRequired: "SELECT_CARD"
  },
  {
    targetId: "unarmed-btn",
    title: "Combattere a Mani Nude",
    text: "Senza armi subisci danni pari al valore del mostro. Clicca 'MANI NUDE'.",
    actionRequired: "CLICK_UNARMED"
  },
  {
    targetId: "card-Quadri-8",
    title: "Le Armi (Quadri)",
    text: "Le armi riducono i danni. Seleziona la carta Quadri (8).",
    actionRequired: "SELECT_WEAPON"
  },
  {
    targetId: "weapon-btn",
    title: "Equipaggiamento",
    text: "Clicca 'ATTACCA/EQUIP'. Ora batterai mostri fino a valore 8 subendo 0 danni!",
    actionRequired: "EQUIP_WEAPON"
  },
  {
    targetId: "card-Cuori-4",
    title: "Le Cure (Cuori)",
    text: "Seleziona la pozione per curarti prima di proseguire.",
    actionRequired: "SELECT_POTION"
  },
  {
    targetId: "potion-btn",
    title: "Bere la Pozione",
    text: "Clicca 'CURA (CUORI)' per recuperare salute (Max 20 HP).",
    actionRequired: "USE_POTION"
  },
  {
    targetId: "flee-btn",
    title: "Ritirata Strategica",
    text: "Puoi fuggire rimescolando la stanza, ma non puoi farlo due volte di fila!",
  },
  {
    targetId: "hud-health",
    title: "Pronto al Combattimento",
    text: "Basi apprese. Svuota il dungeon e sopravvivi, Scoundrel!",
  }
];

const TutorialOverlay: React.FC<Props> = ({ step, onNext, onComplete }) => {
  const [cutoutPos, setCutoutPos] = useState({ x: 50, y: 50, radius: 0 });
  const currentStep = TUTORIAL_STEPS[step];

  useEffect(() => {
    if (!currentStep) return;

    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId) || document.querySelector(`.${currentStep.targetId}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = Math.max(rect.width, rect.height) / 2 + 10;

        setCutoutPos({
          x: (centerX / window.innerWidth) * 100,
          y: (centerY / window.innerHeight) * 100,
          radius: radius
        });

        element.classList.add('highlight-target');
        return () => element.classList.remove('highlight-target');
      } else {
        setCutoutPos({ x: 50, y: 50, radius: 0 });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [step, currentStep]);

  if (!currentStep) return null;

  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[600] pointer-events-none">
      {/* Maschera cutout ultra-leggera */}
      <div 
        className="tutorial-cutout" 
        style={{ 
          '--x': `${cutoutPos.x}%`, 
          '--y': `${cutoutPos.y}%`, 
          '--radius': `${cutoutPos.radius}px`,
          background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), transparent var(--radius, 100px), rgba(2, 6, 23, 0.4) 150px)`
        } as React.CSSProperties} 
      />
      
      {/* Barra superiore compatta */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-2xl border-2 border-blue-500/40 p-4 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-6 overflow-hidden">
          
          <div className="flex flex-col flex-shrink-0">
            <span className="bg-blue-600/30 text-blue-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-500/30 mb-1">
              Addestramento {step + 1}/{TUTORIAL_STEPS.length}
            </span>
            <h3 className="text-sm font-black text-white uppercase tracking-tight whitespace-nowrap">{currentStep.title}</h3>
          </div>

          <div className="h-8 w-[1px] bg-white/10 flex-shrink-0" />

          <p className="text-slate-200 text-xs leading-tight font-medium flex-1">
            {currentStep.text}
          </p>
          
          <div className="flex items-center gap-3">
            {!currentStep.actionRequired ? (
              <button 
                onClick={isLast ? onComplete : onNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl transition-all uppercase tracking-widest text-[10px] shadow-lg active:scale-95 whitespace-nowrap"
              >
                {isLast ? "COMPLETA" : "AVANTI"}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 animate-pulse">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 whitespace-nowrap">Azione Richiesta</span>
              </div>
            )}
            {!currentStep.actionRequired && (
              <button onClick={onComplete} className="p-2 text-slate-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
