
import React, { useState, useEffect, useMemo } from 'react';

export interface TutorialStep {
  targetId: string; // ID dell'elemento nel DOM da evidenziare
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
    text: "Scoundrel è un dungeon crawler solitario. Il tuo obiettivo è svuotare il mazzo di carte restando in vita. Questa è la tua prima stanza.",
  },
  {
    targetId: "card-Picche-5", // ID dinamico generato in Card.tsx
    title: "I Mostri (Fiori e Picche)",
    text: "Questi sono i tuoi nemici. Per prima cosa, clicca sulla carta Picche per selezionarla.",
    actionRequired: "SELECT_CARD"
  },
  {
    targetId: "unarmed-btn",
    title: "Combattere a Mani Nude",
    text: "Senza armi, sconfiggi il mostro ma subisci danni pari al suo valore. Clicca 'MANI NUDE'.",
    actionRequired: "CLICK_UNARMED"
  },
  {
    targetId: "card-Quadri-8",
    title: "Le Armi (Quadri)",
    text: "Le armi riducono i danni subiti. Seleziona la carta Quadri (8) per prepararti ad equipaggiarla.",
    actionRequired: "SELECT_WEAPON"
  },
  {
    targetId: "weapon-btn",
    title: "Equipaggiamento",
    text: "Ora clicca 'ATTACCA/EQUIP'. Una volta equipaggiata, potrai sconfiggere mostri di valore pari o inferiore a 8 subendo 0 danni!",
    actionRequired: "EQUIP_WEAPON"
  },
  {
    targetId: "card-Cuori-4",
    title: "Le Cure (Cuori)",
    text: "La salute è preziosa. Seleziona la pozione per curarti prima di proseguire.",
    actionRequired: "SELECT_POTION"
  },
  {
    targetId: "potion-btn",
    title: "Bere la Pozione",
    text: "Clicca 'CURA (CUORI)' per recuperare salute. Attento: non puoi curarti oltre i 20 HP!",
    actionRequired: "USE_POTION"
  },
  {
    targetId: "flee-btn",
    title: "Ritirata Strategica",
    text: "Se la situazione scotta, puoi fuggire rimescolando la stanza in fondo al mazzo. Ma attenzione: non puoi fuggire due volte di fila!",
  },
  {
    targetId: "hud-health",
    title: "Pronto al Combattimento",
    text: "Hai imparato le basi. Sconfiggi gli ultimi mostri e svuota il dungeon. Buona fortuna, Scoundrel!",
  }
];

const TutorialOverlay: React.FC<Props> = ({ step, onNext, onComplete }) => {
  const [cutoutPos, setCutoutPos] = useState({ x: 50, y: 50, radius: 0 });
  const currentStep = TUTORIAL_STEPS[step];

  // Aggiorna la posizione del cut-out in base al target
  useEffect(() => {
    if (!currentStep) return;

    const updatePosition = () => {
      // Alcuni target potrebbero essere classi o ID
      const element = document.getElementById(currentStep.targetId) || document.querySelector(`.${currentStep.targetId}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = Math.max(rect.width, rect.height) / 1.5 + 20;

        setCutoutPos({
          x: (centerX / window.innerWidth) * 100,
          y: (centerY / window.innerHeight) * 100,
          radius: radius
        });

        // Aggiungi classe highlight temporanea
        element.classList.add('highlight-target');
        return () => element.classList.remove('highlight-target');
      } else {
        // Default se l'elemento non è trovato (es. durante transizioni)
        setCutoutPos({ x: 50, y: 50, radius: 0 });
      }
    };

    updatePosition();
    // Re-update on resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [step, currentStep]);

  if (!currentStep) return null;

  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[600] pointer-events-none">
      {/* Maschera con foro */}
      <div 
        className="tutorial-cutout" 
        style={{ 
          '--x': `${cutoutPos.x}%`, 
          '--y': `${cutoutPos.y}%`, 
          '--radius': `${cutoutPos.radius}px` 
        } as React.CSSProperties} 
      />
      
      {/* Box Messaggio */}
      <div className={`absolute left-1/2 -translate-x-1/2 p-6 w-full max-w-sm pointer-events-auto transition-all duration-500 ${cutoutPos.y > 50 ? 'top-10' : 'bottom-10'}`}>
        <div className="bg-slate-900 border-2 border-blue-500 p-8 rounded-[40px] shadow-[0_0_60px_rgba(59,130,246,0.4)] relative overflow-hidden group">
          {/* Animazione di sfondo */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all" />

          <div className="flex justify-between items-center mb-6">
            <span className="bg-blue-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
              Passo {step + 1}/{TUTORIAL_STEPS.length}
            </span>
            {!currentStep.actionRequired && (
              <button onClick={onComplete} className="text-slate-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-tighter">Salta</button>
            )}
          </div>
          
          <h3 className="text-2xl font-black title-font mb-3 text-white uppercase tracking-tight leading-none">{currentStep.title}</h3>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed font-medium">{currentStep.text}</p>
          
          {!currentStep.actionRequired ? (
            <button 
              onClick={isLast ? onComplete : onNext}
              className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl transition-all uppercase tracking-widest text-xs shadow-xl hover:scale-[1.02] active:scale-95"
            >
              {isLast ? "COMINCIA LA SFIDA" : "HO CAPITO"}
            </button>
          ) : (
            <div className="flex items-center gap-4 p-5 bg-blue-950/40 rounded-3xl border border-blue-800/50 animate-pulse">
              <div className="relative">
                 <div className="w-3 h-3 bg-blue-500 rounded-full" />
                 <div className="absolute inset-0 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Esegui l'azione indicata</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
