
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Card, GameMode, ActionResponse, GameStats, SessionStats } from './types';
import { createDeck } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import Toast from './components/Toast';
import TutorialOverlay from './components/TutorialOverlay';

const INITIAL_HEALTH = 20;
const POTION_HEAL = 7;
const STATS_KEY = "scoundrel_react_stats_v1";

const INITIAL_SESSION_STATS: SessionStats = {
  roomsReached: 1,
  enemiesDefeated: 0,
  damageTaken: 0,
  healingDone: 0,
  potionsUsed: 0,
  runsUsed: 0,
  weaponsEquipped: 0,
};

const INITIAL_GLOBAL_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  totalRoomsCleared: 0,
  totalEnemiesDefeated: 0,
  totalDamageTaken: 0,
  totalHealingDone: 0,
  totalPotionsUsed: 0,
  totalRunsUsed: 0,
  totalWeaponsEquipped: 0,
  bestRun: { rooms: 0, enemies: 0 },
};

interface FloatingText {
  id: number;
  text: string;
  type: 'damage' | 'heal' | 'action' | 'equip';
  x: number;
  y: number;
  isUnarmed?: boolean;
}

interface Explosion {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface Slash {
  id: number;
  x: number;
  y: number;
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
    sessionStats: { ...INITIAL_SESSION_STATS },
  });

  const [globalStats, setGlobalStats] = useState<GameStats>(INITIAL_GLOBAL_STATS);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [visualEffect, setVisualEffect] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [slashes, setSlashes] = useState<Slash[]>([]);
  const [isFleeing, setIsFleeing] = useState(false);
  const [dyingCardId, setDyingCardId] = useState<string | null>(null);
  
  // Tutorial State
  const [isTutorial, setIsTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Load global stats
  useEffect(() => {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      setGlobalStats(JSON.parse(saved));
    }
  }, []);

  // Save global stats
  useEffect(() => {
    if (globalStats.totalGames > 0) {
      localStorage.setItem(STATS_KEY, JSON.stringify(globalStats));
    }
  }, [globalStats]);

  const addToast = (message: string, kind: string = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addFloatingText = (text: string, type: 'damage' | 'heal' | 'action' | 'equip', isUnarmed: boolean = false) => {
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40; 
    const y = 30 + Math.random() * 40; 
    setFloatingTexts(prev => [...prev, { id, text, type, x, y, isUnarmed }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1200);
  };

  const triggerExplosion = (x: number = 50, y: number = 50, color: string = "#ef4444") => {
    const id = Date.now() + Math.random();
    setExplosions(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== id));
    }, 800);
  };

  const triggerSlash = (x: number = 50, y: number = 50) => {
    const id = Date.now() + Math.random();
    setSlashes(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setSlashes(prev => prev.filter(s => s.id !== id));
    }, 300);
  };

  const triggerEffect = (effect: string) => {
    setVisualEffect(effect);
    setTimeout(() => setVisualEffect(null), 800);
  };

  const updateGlobalStats = (result: "won" | "lost", session: SessionStats) => {
    if (isTutorial) return; // Don't record tutorial games
    setGlobalStats(prev => {
      const next = { ...prev };
      next.totalGames += 1;
      if (result === "won") next.wins += 1;
      else next.losses += 1;

      next.totalRoomsCleared += session.roomsReached;
      next.totalEnemiesDefeated += session.enemiesDefeated;
      next.totalDamageTaken += session.damageTaken;
      next.totalHealingDone += session.healingDone;
      next.totalPotionsUsed += session.potionsUsed;
      next.totalRunsUsed += session.runsUsed;
      next.totalWeaponsEquipped += session.weaponsEquipped;

      if (session.roomsReached > next.bestRun.rooms) next.bestRun.rooms = session.roomsReached;
      if (session.enemiesDefeated > next.bestRun.enemies) next.bestRun.enemies = session.enemiesDefeated;

      return next;
    });
  };

  const checkRoomTransition = (currentState: GameState): GameState => {
    let next = { ...currentState };
    
    if (next.room.length === 1) {
      const carryCard = next.room[0];
      const newCards = next.deck.splice(0, 3);
      
      if (newCards.length > 0) {
        next.room = [carryCard, ...newCards];
        next.roomIndex += 1;
        next.sessionStats.roomsReached += 1;
        next.fugaDisponibile = true;
        next.selectedCardId = null;
        addToast("Carry-over: 1 vecchia carta + 3 nuove.", "success");
      }
    } else if (next.room.length === 0) {
      const newCards = next.deck.splice(0, 4);
      if (newCards.length === 0) {
        next.status = "won";
        updateGlobalStats("won", next.sessionStats);
      } else {
        next.room = newCards;
        next.roomIndex += 1;
        next.sessionStats.roomsReached += 1;
        next.fugaDisponibile = true;
      }
    }

    return next;
  };

  const startNewGame = (mode: GameMode, forceTutorial: boolean = false) => {
    setIsTutorial(forceTutorial);
    setTutorialStep(0);

    let newDeck: Card[];
    let firstRoom: Card[];

    if (forceTutorial) {
      // Scripted Tutorial Deck
      newDeck = createDeck(); 
      firstRoom = [
        { id: 'tut-m1', suit: 'Fiori', rank: '5', value: 5 },
        { id: 'tut-w1', suit: 'Quadri', rank: '8', value: 8 },
        { id: 'tut-p1', suit: 'Cuori', rank: '4', value: 4 },
        { id: 'tut-m2', suit: 'Picche', rank: '7', value: 7 },
      ];
    } else {
      newDeck = createDeck();
      firstRoom = newDeck.splice(0, 4);
    }

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
      sessionStats: { ...INITIAL_SESSION_STATS },
    });
    addToast(forceTutorial ? "Modalità Addestramento" : `Dungeon generato (${mode.toUpperCase()})`, "success");
  };

  const validateAction = (actionType: string): ActionResponse => {
    const { selectedCardId, room, equippedWeapon, potions, health, fugaDisponibile } = gameState;
    const selectedCard = room.find(c => c.id === selectedCardId);

    // Tutorial locks
    if (isTutorial) {
       if (tutorialStep === 1 && actionType !== "SELECT_CARD") return { ok: false, severity: "block", message: "Seleziona il mostro prima!" };
       if (tutorialStep === 2 && actionType !== "UNARMED") return { ok: false, severity: "block", message: "Usa Mani Nude per ora." };
       if (tutorialStep === 4 && actionType !== "WEAPON") return { ok: false, severity: "block", message: "Equipaggia l'arma ora." };
    }

    if (actionType === "FUGA") {
      if (!fugaDisponibile) return { ok: false, severity: "block", message: "Non puoi fuggire da due stanze consecutive!" };
      return { ok: true, severity: "success", message: "Ti stai ritirando..." };
    }

    if (actionType === "POTION_STOCK") {
      if (potions <= 0) return { ok: false, severity: "block", message: "Scorte esaurite!" };
      if (health >= 20) return { ok: false, severity: "warn", message: "Salute massima!" };
      return { ok: true, severity: "success", message: "Pozione usata!" };
    }

    if (!selectedCardId) return { ok: false, severity: "block", message: "Seleziona una carta!" };

    switch (actionType) {
      case "UNARMED":
        if (selectedCard?.suit !== "Fiori" && selectedCard?.suit !== "Picche") 
          return { ok: false, severity: "block", message: "Bersaglio non valido per attacco." };
        return { ok: true, severity: "success", message: "Combattimento a mani nude!" };

      case "WEAPON":
        if (selectedCard?.suit === "Quadri") return { ok: true, severity: "success", message: "Equipaggio arma." };
        if (selectedCard?.suit === "Fiori" || selectedCard?.suit === "Picche") {
          if (!equippedWeapon) return { ok: false, severity: "block", message: "Nessuna arma!" };
          if (equippedWeapon.value < selectedCard.value && gameState.mode === "normal")
            return { ok: false, severity: "block", message: "Arma troppo debole!" };
          return { ok: true, severity: "success", message: "Attacco con arma!" };
        }
        return { ok: false, severity: "block", message: "Azione non valida." };

      case "POTION_ROOM":
        if (selectedCard?.suit !== "Cuori") return { ok: false, severity: "block", message: "Non è una pozione." };
        return { ok: true, severity: "success", message: "Bevuta rapida!" };

      default:
        return { ok: false, severity: "block", message: "Azione ignota." };
    }
  };

  const applyAction = (actionType: string) => {
    const validation = validateAction(actionType);
    if (!validation.ok) {
      addToast(validation.message, validation.severity === "block" ? "error" : "warning");
      return;
    }

    if (actionType === "FUGA") {
      setIsFleeing(true);
      triggerEffect("flash-blue");
      addToast("Fuga! Carte rimesse in fondo al mazzo.", "warning");
      
      setTimeout(() => {
        setGameState(prev => {
          let next = { ...prev };
          const fleeingCards = [...prev.room];
          next.deck = [...prev.deck, ...fleeingCards];
          next.room = next.deck.splice(0, 4);
          next.roomIndex += 1;
          next.sessionStats.runsUsed += 1;
          next.fugaDisponibile = false;
          next.selectedCardId = null;
          return next;
        });
        setIsFleeing(false);
      }, 700);
      return;
    }

    // Advance Tutorial
    if (isTutorial) {
      if (tutorialStep === 2 && actionType === "UNARMED") setTutorialStep(3);
      if (tutorialStep === 4 && actionType === "WEAPON") setTutorialStep(5);
    }

    const selectedCardId = gameState.selectedCardId;
    const selectedCard = gameState.room.find(c => c.id === selectedCardId);

    if (actionType === "POTION_STOCK") {
      setGameState(prev => {
        let next = { ...prev };
        const actualHeal = Math.min(prev.maxHealth - prev.health, POTION_HEAL);
        next.health += actualHeal;
        next.potions -= 1;
        next.sessionStats.healingDone += actualHeal;
        next.sessionStats.potionsUsed += 1;
        addFloatingText(`+${actualHeal} HP`, "heal");
        triggerEffect("animate-heal");
        return next;
      });
      return;
    }

    if (!selectedCard) return;

    // Trigger Visuals First for Combat
    if (actionType === "UNARMED" || (actionType === "WEAPON" && selectedCard.suit !== "Quadri")) {
      const isWeaponAttack = actionType === "WEAPON";
      const cardIdx = gameState.room.findIndex(c => c.id === selectedCardId);
      const xPos = 20 + cardIdx * 20; 
      
      if (isWeaponAttack) {
        triggerSlash(xPos, 50);
        triggerExplosion(xPos, 50, "#3b82f6");
        triggerEffect("impact-effect flash-blue animate-shake");
      } else {
        triggerExplosion(xPos, 50, "#ef4444");
        triggerEffect("animate-shake-heavy flash-red-heavy blood-vignette");
      }
    } else if (actionType === "POTION_ROOM") {
      triggerEffect("animate-heal");
    } else if (actionType === "WEAPON" && selectedCard.suit === "Quadri") {
      triggerExplosion(50, 50, "#3b82f6");
      triggerEffect("flash-blue animate-weapon-pop");
    }

    // Handle Card Removal with Animation
    setDyingCardId(selectedCard.id);
    
    setTimeout(() => {
      setGameState(prev => {
        let next = { ...prev };
        const card = prev.room.find(c => c.id === selectedCardId);
        if (!card) return next;

        switch (actionType) {
          case "UNARMED":
            next.health -= card.value;
            next.sessionStats.damageTaken += card.value;
            next.room = prev.room.filter(c => c.id !== selectedCardId);
            next.enemiesDefeated += 1;
            next.sessionStats.enemiesDefeated += 1;
            addFloatingText(`-${card.value} HP`, "damage", true);
            break;

          case "WEAPON":
            if (card.suit === "Quadri") {
              next.equippedWeapon = card;
              next.sessionStats.weaponsEquipped += 1;
              next.room = prev.room.filter(c => c.id !== selectedCardId);
              addFloatingText("EQUIP!", "equip");
            } else {
              next.room = prev.room.filter(c => c.id !== selectedCardId);
              next.enemiesDefeated += 1;
              next.sessionStats.enemiesDefeated += 1;
              addFloatingText("SLAIN!", "action");
            }
            break;

          case "POTION_ROOM":
            const roomHeal = Math.min(prev.maxHealth - prev.health, card.value);
            next.health += roomHeal;
            next.sessionStats.healingDone += roomHeal;
            next.room = prev.room.filter(c => c.id !== selectedCardId);
            addFloatingText(`+${roomHeal} HP`, "heal");
            break;
        }

        next.selectedCardId = null;
        setDyingCardId(null);

        if (next.health <= 0) {
          next.status = "lost";
          updateGlobalStats("lost", next.sessionStats);
          return next;
        }

        return checkRoomTransition(next);
      });
    }, 400); // Wait for card defeat animation
  };

  const handleTutorialStepAction = (id: string) => {
    const selectedCard = gameState.room.find(c => c.id === id);
    if (isTutorial) {
      if (tutorialStep === 1 && (selectedCard?.suit === 'Fiori' || selectedCard?.suit === 'Picche')) {
        setTutorialStep(2);
      } else if (tutorialStep === 3 && selectedCard?.suit === 'Quadri') {
        setTutorialStep(4);
      }
    }
    setGameState(prev => ({ ...prev, selectedCardId: id === prev.selectedCardId ? null : id }));
  };

  if (gameState.status === "start") {
    const winRate = globalStats.totalGames > 0 ? Math.round((globalStats.wins/globalStats.totalGames)*100) : 0;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white font-inter overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-700" />

        <div className="z-10 text-center flex flex-col items-center">
          <h1 className="text-8xl md:text-9xl title-font font-bold mb-4 text-red-600 tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(220,38,38,0.6)]">Scoundrel</h1>
          <p className="text-slate-400 italic mb-12 text-center max-w-md tracking-wide px-4">Sopravvivi al mazzo. Ogni carta è una scelta tra vita e morte.</p>
          
          <div className="flex flex-col gap-4 w-full max-w-sm px-4">
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => startNewGame("normal")} className="group relative overflow-hidden px-8 py-5 bg-red-600 hover:bg-red-500 transition-all font-black rounded-2xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 text-sm tracking-widest shadow-xl">
                 <span className="relative z-10">NORMAL</span>
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               </button>
               <button onClick={() => startNewGame("easy")} className="px-8 py-5 bg-slate-800 hover:bg-slate-700 transition-all font-black rounded-2xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 text-sm tracking-widest">EASY</button>
            </div>
            
            <button 
              onClick={() => startNewGame("normal", true)} 
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 transition-all font-black rounded-2xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            >
              🎓 Tutorial Interattivo
            </button>

            <div className="flex flex-col gap-2 mt-4">
              <button onClick={() => setShowStats(true)} className="w-full py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl font-bold transition-all text-xs tracking-widest uppercase">📊 Statistiche Globali</button>
              <button onClick={() => setShowRules(true)} className="w-full py-4 text-slate-500 hover:text-white transition-colors underline underline-offset-4 text-xs font-bold uppercase tracking-widest">📖 Manuale Completo</button>
            </div>
          </div>
        </div>

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
        {showStats && (
          <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-[40px] w-full max-w-2xl shadow-2xl relative overflow-hidden modal-animate-in">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setShowStats(false)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
              <h2 className="text-4xl font-black mb-10 title-font tracking-widest text-red-500 uppercase flex items-center gap-4">
                <span>Sala dei Record</span>
                <div className="h-1 flex-1 bg-slate-800 rounded-full relative overflow-hidden">
                   <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
                </div>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                <div className="stat-card p-6 rounded-3xl">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Partite Totali</span>
                  <span className="text-3xl font-bold">{globalStats.totalGames}</span>
                </div>
                <div className="stat-card p-6 rounded-3xl">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Vittorie</span>
                  <span className="text-3xl font-bold text-emerald-500">{globalStats.wins}</span>
                </div>
                <div className="stat-card p-6 rounded-3xl relative overflow-hidden">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Win Rate</span>
                  <div className="relative z-10">
                    <span className="text-3xl font-bold">{winRate}%</span>
                    <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 progress-bar-fill" 
                        style={{ width: `${winRate}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => {
                  if(confirm("Azzerare tutto? Questa azione è irreversibile.")) {
                    setGlobalStats(INITIAL_GLOBAL_STATS);
                    localStorage.removeItem(STATS_KEY);
                  }
                }} className="px-8 py-4 bg-red-950/20 text-red-500 font-bold rounded-2xl border border-red-900/30 hover:bg-red-900/40 transition-all text-xs uppercase tracking-widest">Azzera Dati</button>
                <button onClick={() => setShowStats(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-2xl transition-all text-xs uppercase tracking-widest shadow-lg shadow-black/20">Chiudi Archivio</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState.status === "won" || gameState.status === "lost") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white animate-in fade-in duration-500">
        <div className={`p-12 rounded-[50px] border-2 flex flex-col items-center w-full max-w-xl shadow-2xl relative overflow-hidden ${gameState.status === "won" ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-red-900/50 bg-red-950/10'}`}>
            <h1 className={`text-8xl title-font font-black mb-4 uppercase tracking-tighter text-center ${gameState.status === "won" ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]' : 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]'}`}>
                {gameState.status === "won" ? "VITTORIA" : "SCONFITTA"}
            </h1>
            <p className="text-slate-400 mb-12 text-center italic text-lg max-w-xs">{gameState.status === "won" ? "Hai ripulito il dungeon. Il tuo nome vivrà per sempre." : "Le ombre ti hanno avvolto. Un'altra vita sacrificata."}</p>
            
            <div className="grid grid-cols-2 gap-6 w-full mb-12">
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Nemici Sconfitti</span>
                <span className="text-4xl font-bold">{gameState.sessionStats.enemiesDefeated}</span>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Stanze Esplorate</span>
                <span className="text-4xl font-bold">{gameState.sessionStats.roomsReached}</span>
              </div>
            </div>

            <button onClick={() => setGameState(prev => ({ ...prev, status: "start" }))} className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all text-lg tracking-widest uppercase shadow-xl">RITORNA AL VILLAGGIO</button>
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
    <div className={`min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 transition-all duration-300 relative overflow-hidden ${visualEffect?.includes('blood-vignette') ? 'blood-vignette' : ''}`}>
      {/* VFX Layers */}
      <div className={`fixed inset-0 pointer-events-none z-[400] transition-opacity duration-300 ${visualEffect?.includes('flash-red-heavy') ? 'flash-red-heavy' : visualEffect?.includes('flash-red') ? 'flash-red' : ''} ${visualEffect?.includes('flash-blue') ? 'flash-blue' : ''}`} />
      
      {explosions.map(exp => (
        <div key={exp.id} className="fixed inset-0 pointer-events-none z-[450]" style={{ left: `${exp.x}%`, top: `${exp.y}%` }}>
          <div className="shockwave" style={{ borderColor: exp.color }} />
        </div>
      ))}

      {slashes.map(s => (
        <div key={s.id} className="fixed inset-0 pointer-events-none z-[450]" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
          <div className="slash-effect" />
        </div>
      ))}

      {floatingTexts.map(ft => (
        <div 
          key={ft.id} 
          className={`floating-text ${ft.type === 'damage' ? 'text-red-500' : ft.type === 'heal' ? 'text-emerald-400' : 'text-blue-400'} ${ft.isUnarmed ? 'text-5xl scale-125' : 'text-3xl'}`} 
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
        >
          {ft.text}
        </div>
      ))}

      {isTutorial && (
        <TutorialOverlay 
          step={tutorialStep} 
          onNext={() => setTutorialStep(s => s + 1)} 
          onComplete={() => setIsTutorial(false)} 
        />
      )}

      <div className={`flex-1 flex flex-col max-w-6xl mx-auto w-full transition-transform duration-300 ${currentEffectClass || ''}`}>
        <HUD state={gameState} effectClass={currentEffectClass} />
        <Room 
          cards={gameState.room} 
          selectedId={gameState.selectedCardId} 
          onSelect={handleTutorialStepAction} 
          isExiting={isFleeing}
          dyingCardId={dyingCardId}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 sticky bottom-8 bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[40px] border border-slate-700/50 shadow-2xl z-40">
          <button 
            id="unarmed-btn"
            onClick={() => applyAction("UNARMED")} 
            className="py-5 bg-orange-600 hover:bg-orange-500 transition-all rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-b-4 border-orange-900 active:border-b-0 active:translate-y-1"
          >
            MANI NUDE
          </button>
          <button 
            id="weapon-btn"
            onClick={() => applyAction("WEAPON")} 
            className="py-5 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-b-4 border-blue-900 active:border-b-0 active:translate-y-1"
          >
            USA/EQUIP ARMA
          </button>
          <button 
            onClick={() => {
                const selectedCard = gameState.room.find(c => c.id === gameState.selectedCardId);
                if (selectedCard?.suit === "Cuori") applyAction("POTION_ROOM");
                else applyAction("POTION_STOCK");
              }} 
            className="py-5 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1"
          >
            USA POZIONE
          </button>
          <button 
            onClick={() => applyAction("FUGA")} 
            className={`py-5 transition-all rounded-2xl font-black uppercase text-xs tracking-[0.2em] border-b-4 active:border-b-0 active:translate-y-1 ${gameState.fugaDisponibile && gameState.room.length > 1 ? 'bg-slate-700 border-slate-900 hover:bg-slate-600' : 'bg-slate-900 text-slate-600 border-black cursor-not-allowed opacity-50'}`} 
            disabled={!gameState.fugaDisponibile || gameState.room.length < 2 || isFleeing}
          >
            {gameState.fugaDisponibile ? "RITIRATA" : "COOLDOWN"}
          </button>
        </div>
      </div>

      <button onClick={() => setShowRules(true)} className="fixed bottom-6 right-6 bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg border-2 border-red-400 hover:scale-110 active:scale-95 transition-all z-50 text-xl font-black">📖</button>
      
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-[100] pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} kind={t.kind} />)}
      </div>
    </div>
  );
};

export default App;
