
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, Card, GameMode, ActionResponse } from './types';
import { createDeck } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import Toast from './components/Toast';

const INITIAL_HEALTH = 20;
const POTION_HEAL = 7;

interface FloatingText {
  id: number;
  text: string;
  type: 'damage' | 'heal' | 'action' | 'equip';
  x: number;
  y: number;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  color: string;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    status: "start",
    mode: "normal",
    health: INITIAL_HEALTH,
    maxHealth: INITIAL_HEALTH,
    potions: 3,
    equippedWeapon: null,
    deck: [],
    room: [],
    selectedCardId: null,
    fugaDisponibile: true,
    fugaUsataUltimaStanza: false,
    roomIndex: 0,
    enemiesDefeated: 0,
  });

  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [visualEffect, setVisualEffect] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  const addToast = (message: string, kind: string = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addFloatingText = (text: string, type: 'damage' | 'heal' | 'action' | 'equip') => {
    const id = Date.now() + Math.random();
    const x = 40 + Math.random() * 20; 
    const y = 40 + Math.random() * 20; 
    setFloatingTexts(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1200);
  };

  const triggerExplosion = (color: string = "#ef4444") => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, x: 50, y: 50, color }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== id));
    }, 800);
  };

  const triggerEffect = (effect: string) => {
    setVisualEffect(effect);
    setTimeout(() => setVisualEffect(null), 700);
  };

  const startNewGame = (mode: GameMode) => {
    const newDeck = createDeck();
    const firstRoom = newDeck.splice(0, 4);
    setGameState({
      status: "playing",
      mode,
      health: INITIAL_HEALTH,
      maxHealth: INITIAL_HEALTH,
      potions: 3,
      equippedWeapon: null,
      deck: newDeck,
      room: firstRoom,
      selectedCardId: null,
      fugaDisponibile: true,
      fugaUsataUltimaStanza: false,
      roomIndex: 1,
      enemiesDefeated: 0,
    });
    addToast(`Partita iniziata: ${mode.toUpperCase()}`, "success");
  };

  const startNextRoom = useCallback(() => {
    setGameState(prev => {
      if (prev.deck.length === 0 && prev.room.length < 2) {
        return { ...prev, room: [], status: "won" };
      }
      
      const newDeck = [...prev.deck];
      if (newDeck.length === 0 && prev.room.length >= 2) return prev;

      const numToDraw = Math.min(newDeck.length, 4);
      const newRoom = newDeck.splice(0, numToDraw);
      
      if (newRoom.length === 0) {
          return { ...prev, room: [], status: "won" };
      }

      const canFleeNow = !prev.fugaUsataUltimaStanza;

      return {
        ...prev,
        deck: newDeck,
        room: newRoom,
        roomIndex: prev.roomIndex + 1,
        fugaDisponibile: canFleeNow,
        fugaUsataUltimaStanza: false, 
        selectedCardId: null
      };
    });
  }, []);

  const selectCard = (id: string) => {
    setGameState(prev => ({ ...prev, selectedCardId: id === prev.selectedCardId ? null : id }));
  };

  const validateAction = (actionType: string): ActionResponse => {
    const { selectedCardId, room, equippedWeapon, potions, health, fugaDisponibile, mode } = gameState;
    const selectedCard = room.find(c => c.id === selectedCardId);

    if (room.length < 2 && actionType !== "FUGA" && actionType !== "POTION_STOCK") {
        return { ok: false, severity: "block", message: "La quarta carta viene scartata automaticamente!" };
    }

    if (actionType === "FUGA") {
      if (!fugaDisponibile) return { ok: false, severity: "block", message: "Ritirata non disponibile (Cooldown)!" };
      return { ok: true, severity: "success", message: "Ti stai ritirando..." };
    }

    if (actionType === "POTION_STOCK") {
      if (potions <= 0) return { ok: false, severity: "block", message: "Non hai più pozioni scorta!" };
      if (health >= 20) return { ok: false, severity: "warn", message: "Vita già al massimo!" };
      return { ok: true, severity: "success", message: "Pozione usata!" };
    }

    if (!selectedCardId) return { ok: false, severity: "block", message: "Seleziona prima una carta!" };
    if (!selectedCard) return { ok: false, severity: "block", message: "Errore selezione carta." };

    switch (actionType) {
      case "UNARMED":
        if (selectedCard.suit !== "Fiori" && selectedCard.suit !== "Picche") 
          return { ok: false, severity: "block", message: "Puoi combattere solo contro i mostri!" };
        return { ok: true, severity: "success", message: "Mostro sconfitto a mani nude! Subirai danni." };

      case "WEAPON":
        if (selectedCard.suit === "Quadri") {
          return { ok: true, severity: "success", message: "Arma equipaggiata!" };
        }
        if (selectedCard.suit === "Fiori" || selectedCard.suit === "Picche") {
          if (!equippedWeapon) return { ok: false, severity: "block", message: "Equipaggia un'arma prima!" };
          if (equippedWeapon.value >= selectedCard.value) return { ok: true, severity: "success", message: "Mostro sconfitto con arma!" };
          if (mode === "easy") return { ok: true, severity: "warn", message: "L'arma è debole! Subirai -2 HP (Easy Mode)." };
          return { ok: false, severity: "block", message: "L'arma è troppo debole!" };
        }
        return { ok: false, severity: "block", message: "Azione non valida." };

      case "POTION_ROOM":
        if (selectedCard.suit !== "Cuori") return { ok: false, severity: "block", message: "Questa non è una pozione!" };
        return { ok: true, severity: "success", message: "Cura dalla stanza applicata!" };

      default:
        return { ok: false, severity: "block", message: "Azione sconosciuta." };
    }
  };

  const applyAction = (actionType: string) => {
    const validation = validateAction(actionType);
    
    if (!validation.ok) {
      addToast(validation.message, validation.severity === "block" ? "error" : "warning");
      return;
    }

    setGameState(prev => {
      let nextState = { ...prev };
      const selectedCard = prev.room.find(c => c.id === prev.selectedCardId);

      if (actionType === "FUGA") {
        const remainingCards = [...prev.room];
        const newDeck = [...prev.deck, ...remainingCards];
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        nextState.deck = newDeck;
        nextState.room = [];
        nextState.fugaDisponibile = false;
        nextState.fugaUsataUltimaStanza = true; 
        addFloatingText("RITIRATA!", "action");
        triggerEffect("flash-blue");
        return nextState;
      }

      if (actionType === "POTION_STOCK") {
        nextState.health = Math.min(prev.maxHealth, prev.health + POTION_HEAL);
        nextState.potions = prev.potions - 1;
        addFloatingText(`+${POTION_HEAL} HP`, "heal");
        addFloatingText("GLUB!", "action");
        triggerEffect("animate-heal");
        return nextState;
      }

      if (!selectedCard) return nextState;

      switch (actionType) {
        case "UNARMED":
          nextState.health -= selectedCard.value;
          nextState.room = prev.room.filter(c => c.id !== prev.selectedCardId);
          nextState.enemiesDefeated += 1;
          addFloatingText(`-${selectedCard.value} HP`, "damage");
          addFloatingText("CRUNCH!", "action");
          triggerExplosion("#991b1b");
          triggerEffect("animate-shake-heavy flash-red-heavy blood-vignette");
          break;

        case "WEAPON":
          if (selectedCard.suit === "Quadri") {
            nextState.equippedWeapon = selectedCard;
            nextState.room = prev.room.filter(c => c.id !== prev.selectedCardId);
            addFloatingText("EQUIP!", "equip");
            triggerEffect("flash-blue animate-weapon-pop");
          } else {
            if (prev.equippedWeapon && prev.equippedWeapon.value >= selectedCard.value) {
              nextState.room = prev.room.filter(c => c.id !== prev.selectedCardId);
              nextState.enemiesDefeated += 1;
              addFloatingText("SLASH!", "action");
              addFloatingText("CRITICAL!", "action");
              triggerExplosion("#3b82f6");
              triggerEffect("impact-effect flash-blue");
            } else if (prev.mode === "easy") {
              nextState.health -= 2;
              addFloatingText("-2 HP", "damage");
              addFloatingText("FAIL!", "action");
              triggerEffect("animate-shake flash-red");
            }
          }
          break;

        case "POTION_ROOM":
          nextState.health = Math.min(prev.maxHealth, prev.health + selectedCard.value);
          nextState.room = prev.room.filter(c => c.id !== prev.selectedCardId);
          addFloatingText(`+${selectedCard.value} HP`, "heal");
          addFloatingText("SLURP!", "action");
          triggerEffect("animate-heal");
          break;
      }

      nextState.selectedCardId = null;
      if (nextState.health <= 0) nextState.status = "lost";
      return nextState;
    });
  };

  useEffect(() => {
    if (gameState.status === "playing") {
        if (gameState.room.length === 1) {
            addToast("Quarta carta scartata... prossima stanza.", "info");
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, room: [] }));
                startNextRoom();
            }, 1000);
            return () => clearTimeout(timer);
        } else if (gameState.room.length === 0) {
            startNextRoom();
        }
    }
  }, [gameState.room.length, gameState.status, startNextRoom]);

  if (gameState.status === "start") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
        <h1 className="text-7xl title-font font-bold mb-8 text-red-600 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Scoundrel</h1>
        <p className="text-slate-400 mb-12 text-center max-w-md italic">Sopravvivi al dungeon. Gestisci le tue risorse. Non voltarti indietro.</p>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-sm">
          <button onClick={() => startNewGame("normal")} className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-500 transition-all font-bold rounded-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1">NORMAL</button>
          <button onClick={() => startNewGame("easy")} className="flex-1 px-8 py-4 bg-slate-700 hover:bg-slate-600 transition-all font-bold rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1">EASY</button>
        </div>
        <button onClick={() => setShowRules(true)} className="mt-12 text-slate-500 hover:text-white transition-colors underline underline-offset-4">📖 Regole del Gioco</button>
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </div>
    );
  }

  if (gameState.status === "won" || gameState.status === "lost") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className={`p-10 rounded-3xl border-2 flex flex-col items-center ${gameState.status === "won" ? 'border-emerald-500 bg-emerald-950/20' : 'border-red-900 bg-red-950/20'}`}>
            <h1 className={`text-6xl title-font font-bold mb-6 uppercase ${gameState.status === "won" ? 'text-emerald-400' : 'text-red-600'}`}>
                {gameState.status === "won" ? "VITTORIA" : "SCONFITTA"}
            </h1>
            <p className="text-slate-300 mb-8 text-center italic">
                {gameState.status === "won" ? "Hai ripulito il dungeon!" : "Il dungeon ha avuto la meglio."}
            </p>
            <div className="grid grid-cols-2 gap-8 mb-10 text-center">
                <div>
                    <span className="block text-slate-500 uppercase text-xs font-bold">Mostri</span>
                    <span className="text-3xl font-black text-white">{gameState.enemiesDefeated}</span>
                </div>
                <div>
                    <span className="block text-slate-500 uppercase text-xs font-bold">Stanze</span>
                    <span className="text-3xl font-black text-white">{gameState.roomIndex}</span>
                </div>
            </div>
            <button onClick={() => setGameState(prev => ({ ...prev, status: "start" }))} className="w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:scale-105 transition-transform">MENU PRINCIPALE</button>
        </div>
      </div>
    );
  }

  const currentEffectClass = visualEffect ? (
    visualEffect.includes('animate-heal') ? 'animate-heal' : 
    visualEffect.includes('animate-weapon-pop') ? 'animate-weapon-pop' : 
    visualEffect.includes('animate-shake-heavy') ? 'animate-shake-heavy' :
    visualEffect.includes('animate-shake') ? 'animate-shake' :
    undefined
  ) : undefined;

  return (
    <div className={`min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 transition-colors duration-300 relative overflow-hidden ${visualEffect?.includes('blood-vignette') ? 'blood-vignette' : ''}`}>
      <div className={`fixed inset-0 pointer-events-none z-[400] transition-colors duration-300 ${visualEffect?.includes('flash-red-heavy') ? 'flash-red-heavy' : visualEffect?.includes('flash-red') ? 'flash-red' : ''} ${visualEffect?.includes('flash-blue') ? 'flash-blue' : ''}`} />
      
      {explosions.map(exp => (
        <div key={exp.id} className="fixed inset-0 pointer-events-none z-[450]" style={{ left: `${exp.x}%`, top: `${exp.y}%` }}>
          <div className="shockwave" style={{ borderColor: exp.color }} />
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 100 + Math.random() * 150;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            return (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  backgroundColor: exp.color,
                  '--tw-translate-x': `${tx}px`,
                  '--tw-translate-y': `${ty}px`
                } as any}
              />
            );
          })}
        </div>
      ))}

      {floatingTexts.map(ft => (
        <div 
          key={ft.id} 
          className={`floating-text ${
            ft.type === 'damage' ? 'text-red-500' : 
            ft.type === 'heal' ? 'text-emerald-400' : 
            ft.type === 'equip' ? 'text-blue-400 font-black' : 
            'text-yellow-400 font-serif italic'
          }`}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {visualEffect?.includes('impact-effect') && <div className="slash-effect" />}

      <div className={`flex-1 flex flex-col max-w-6xl mx-auto w-full transition-transform duration-300 ${currentEffectClass || ''}`}>
        <HUD state={gameState} effectClass={currentEffectClass} />
        
        <Room 
          cards={gameState.room} 
          selectedId={gameState.selectedCardId} 
          onSelect={selectCard} 
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 sticky bottom-8 bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-700 shadow-2xl z-40">
          <button onClick={() => applyAction("UNARMED")} className="py-4 bg-orange-600 hover:bg-orange-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-orange-900 active:border-b-0 active:translate-y-1">Mani Nude</button>
          <button onClick={() => applyAction("WEAPON")} className="py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-blue-900 active:border-b-0 active:translate-y-1">Usa/Equip Arma</button>
          <button onClick={() => {
              const selectedCard = gameState.room.find(c => c.id === gameState.selectedCardId);
              if (selectedCard?.suit === "Cuori") applyAction("POTION_ROOM");
              else applyAction("POTION_STOCK");
            }} className="py-4 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1">Usa Pozione</button>
          <button onClick={() => applyAction("FUGA")} className={`py-4 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 active:border-b-0 active:translate-y-1 ${gameState.fugaDisponibile ? 'bg-slate-700 border-slate-900 hover:bg-slate-600' : 'bg-slate-900 text-slate-600 border-black cursor-not-allowed opacity-50'}`} disabled={!gameState.fugaDisponibile}>{gameState.fugaDisponibile ? "Ritirata" : "In Cooldown"}</button>
        </div>
      </div>

      <button onClick={() => setShowRules(true)} className="fixed bottom-6 right-6 bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg border-2 border-red-400 hover:scale-110 transition-transform z-50">
        <span className="text-2xl">📖</span>
      </button>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-[100] pointer-events-none">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} kind={t.kind} />
        ))}
      </div>
    </div>
  );
};

export default App;
