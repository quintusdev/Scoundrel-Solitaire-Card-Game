
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Card, GameMode, ActionResponse, GameStats, SessionStats } from './types';
import { createDeck } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import Toast from './components/Toast';

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
    const x = 40 + Math.random() * 20; 
    const y = 40 + Math.random() * 20; 
    setFloatingTexts(prev => [...prev, { id, text, type, x, y, isUnarmed }]);
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
    setTimeout(() => setVisualEffect(null), 800);
  };

  const updateGlobalStats = (result: "won" | "lost", session: SessionStats) => {
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
      sessionStats: { ...INITIAL_SESSION_STATS },
    });
    addToast(`Dungeon generato (${mode.toUpperCase()})`, "success");
  };

  const validateAction = (actionType: string): ActionResponse => {
    const { selectedCardId, room, equippedWeapon, potions, health, fugaDisponibile } = gameState;
    const selectedCard = room.find(c => c.id === selectedCardId);

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

    setGameState(prev => {
      let next = { ...prev };
      const selectedCard = prev.room.find(c => c.id === prev.selectedCardId);

      if (actionType === "FUGA") {
        const fleeingCards = [...prev.room];
        next.deck = [...prev.deck, ...fleeingCards];
        next.room = next.deck.splice(0, 4);
        next.roomIndex += 1;
        next.sessionStats.roomsReached += 1;
        next.sessionStats.runsUsed += 1;
        next.fugaDisponibile = false;
        next.selectedCardId = null;
        addToast("Fuga! Carte rimesse in fondo al mazzo.", "warning");
        triggerEffect("flash-blue");
        return next;
      }

      if (actionType === "POTION_STOCK") {
        const actualHeal = Math.min(prev.maxHealth - prev.health, POTION_HEAL);
        next.health += actualHeal;
        next.potions -= 1;
        next.sessionStats.healingDone += actualHeal;
        next.sessionStats.potionsUsed += 1;
        addFloatingText(`+${actualHeal} HP`, "heal");
        triggerEffect("animate-heal");
        return next;
      }

      if (!selectedCard) return next;

      switch (actionType) {
        case "UNARMED":
          next.health -= selectedCard.value;
          next.sessionStats.damageTaken += selectedCard.value;
          next.room = prev.room.filter(c => c.id !== prev.selectedCardId);
          next.enemiesDefeated += 1;
          next.sessionStats.enemiesDefeated += 1;
          addFloatingText(`-${selectedCard.value} HP`, "damage", true);
          triggerExplosion("#b91c1c");
          triggerEffect("animate-shake-heavy flash-red-heavy blood-vignette");
          addToast(`Mani Nude: Hai sconfitto il mostro ma subito ${selectedCard.value} danni!`, "warning");
          break;

        case "WEAPON":
          if (selectedCard.suit === "Quadri") {
            next.equippedWeapon = selectedCard;
            next.sessionStats.weaponsEquipped += 1;
            next.room = prev.room.filter(c => c.id !== prev.selectedCardId);
            addFloatingText("EQUIP!", "equip");
            triggerExplosion("#3b82f6"); // Blue explosion for successful equip
            triggerEffect("flash-blue animate-weapon-pop");
          } else {
            if (prev.equippedWeapon && prev.equippedWeapon.value >= selectedCard.value) {
              next.room = prev.room.filter(c => c.id !== prev.selectedCardId);
              next.enemiesDefeated += 1;
              next.sessionStats.enemiesDefeated += 1;
              addFloatingText("SLASH!", "action");
              triggerExplosion("#3b82f6");
              triggerEffect("impact-effect flash-blue");
            } else if (prev.mode === "easy") {
              next.health -= 2;
              next.sessionStats.damageTaken += 2;
              next.room = prev.room.filter(c => c.id !== prev.selectedCardId);
              next.enemiesDefeated += 1;
              next.sessionStats.enemiesDefeated += 1;
              addFloatingText("-2 HP", "damage");
              triggerEffect("animate-shake flash-red");
            }
          }
          break;

        case "POTION_ROOM":
          const roomHeal = Math.min(prev.maxHealth - prev.health, selectedCard.value);
          next.health += roomHeal;
          next.sessionStats.healingDone += roomHeal;
          next.room = prev.room.filter(c => c.id !== prev.selectedCardId);
          addFloatingText(`+${roomHeal} HP`, "heal");
          triggerEffect("animate-heal");
          break;
      }

      next.selectedCardId = null;
      if (next.health <= 0) {
        next.status = "lost";
        updateGlobalStats("lost", next.sessionStats);
        return next;
      }

      return checkRoomTransition(next);
    });
  };

  if (gameState.status === "start") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white font-inter">
        <h1 className="text-8xl title-font font-bold mb-8 text-red-600 tracking-tighter uppercase drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">Scoundrel</h1>
        <p className="text-slate-400 italic mb-12 text-center max-w-md">Un mazzo di carte. Un eroe. Un dungeon senza uscita. Solo la tua astuzia può salvarti.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
             <button onClick={() => startNewGame("normal")} className="px-8 py-5 bg-red-600 hover:bg-red-500 transition-all font-black rounded-2xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 text-sm tracking-widest">NORMAL</button>
             <button onClick={() => startNewGame("easy")} className="px-8 py-5 bg-slate-800 hover:bg-slate-700 transition-all font-black rounded-2xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 text-sm tracking-widest">EASY</button>
          </div>
          
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowStats(true)} className="w-full py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl font-bold transition-all text-xs tracking-widest uppercase">📊 Statistiche Globali</button>
            <button onClick={() => setShowRules(true)} className="w-full py-4 text-slate-500 hover:text-white transition-colors underline underline-offset-4 text-xs font-bold uppercase tracking-widest">📖 Regole</button>
          </div>
        </div>

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
        {showStats && (
          <div className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl shadow-2xl">
              <h2 className="text-3xl font-black mb-8 title-font tracking-widest text-red-500">RECORD DEL DUNGEON</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Partite Totali</span>
                  <span className="text-2xl font-bold">{globalStats.totalGames}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Vittorie</span>
                  <span className="text-2xl font-bold text-emerald-500">{globalStats.wins}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Win Rate</span>
                  <span className="text-2xl font-bold">{globalStats.totalGames > 0 ? Math.round((globalStats.wins/globalStats.totalGames)*100) : 0}%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Max Stanze</span>
                  <span className="text-2xl font-bold">{globalStats.bestRun.rooms}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Max Nemici</span>
                  <span className="text-2xl font-bold">{globalStats.bestRun.enemies}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Danni Totali</span>
                  <span className="text-2xl font-bold text-red-400">{globalStats.totalDamageTaken}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => {
                  if(confirm("Azzerare tutto?")) {
                    setGlobalStats(INITIAL_GLOBAL_STATS);
                    localStorage.removeItem(STATS_KEY);
                  }
                }} className="flex-1 py-4 bg-red-950/30 text-red-500 font-bold rounded-xl border border-red-900/50 hover:bg-red-900/40 transition-all text-xs uppercase">Resetta</button>
                <button onClick={() => setShowStats(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl transition-all text-xs uppercase tracking-widest">Chiudi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState.status === "won" || gameState.status === "lost") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white">
        <div className={`p-12 rounded-[40px] border-2 flex flex-col items-center w-full max-w-lg shadow-2xl ${gameState.status === "won" ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-red-900/50 bg-red-950/10'}`}>
            <h1 className={`text-7xl title-font font-black mb-4 uppercase tracking-tighter ${gameState.status === "won" ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}>
                {gameState.status === "won" ? "VITTORIA" : "SCONFITTA"}
            </h1>
            <p className="text-slate-400 mb-10 text-center italic">{gameState.status === "won" ? "Hai ripulito il dungeon e ne sei uscito con onore." : "Il dungeon ha reclamato la tua anima. Ritenta ancora."}</p>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Mostri Sconfitti</span>
                <span className="text-2xl font-bold">{gameState.sessionStats.enemiesDefeated}</span>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Stanze Esplorate</span>
                <span className="text-2xl font-bold">{gameState.sessionStats.roomsReached}</span>
              </div>
            </div>

            <button onClick={() => setGameState(prev => ({ ...prev, status: "start" }))} className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all text-sm tracking-widest uppercase">TORNA ALLA HOME</button>
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
      <div className={`fixed inset-0 pointer-events-none z-[400] transition-opacity duration-300 ${visualEffect?.includes('flash-red-heavy') ? 'flash-red-heavy' : visualEffect?.includes('flash-red') ? 'flash-red' : ''} ${visualEffect?.includes('flash-blue') ? 'flash-blue' : ''}`} />
      
      {explosions.map(exp => (
        <div key={exp.id} className="fixed inset-0 pointer-events-none z-[450]" style={{ left: `${exp.x}%`, top: `${exp.y}%` }}>
          <div className="shockwave" style={{ borderColor: exp.color }} />
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

      <div className={`flex-1 flex flex-col max-w-6xl mx-auto w-full transition-transform duration-300 ${currentEffectClass || ''}`}>
        <HUD state={gameState} effectClass={currentEffectClass} />
        <Room cards={gameState.room} selectedId={gameState.selectedCardId} onSelect={(id) => setGameState(prev => ({ ...prev, selectedCardId: id === prev.selectedCardId ? null : id }))} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 sticky bottom-8 bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-700 shadow-2xl z-40">
          <button onClick={() => applyAction("UNARMED")} className="py-4 bg-orange-600 hover:bg-orange-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-orange-900 active:border-b-0 active:translate-y-1">MANI NUDE</button>
          <button onClick={() => applyAction("WEAPON")} className="py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-blue-900 active:border-b-0 active:translate-y-1">USA/EQUIP ARMA</button>
          <button onClick={() => {
              const selectedCard = gameState.room.find(c => c.id === gameState.selectedCardId);
              if (selectedCard?.suit === "Cuori") applyAction("POTION_ROOM");
              else applyAction("POTION_STOCK");
            }} className="py-4 bg-emerald-600 hover:bg-emerald-500 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1">USA POZIONE</button>
          <button onClick={() => applyAction("FUGA")} className={`py-4 transition-all rounded-xl font-black uppercase text-xs tracking-widest border-b-4 active:border-b-0 active:translate-y-1 ${gameState.fugaDisponibile && gameState.room.length > 1 ? 'bg-slate-700 border-slate-900 hover:bg-slate-600' : 'bg-slate-900 text-slate-600 border-black cursor-not-allowed opacity-50'}`} disabled={!gameState.fugaDisponibile || gameState.room.length < 2}>{gameState.fugaDisponibile ? "RITIRATA" : "COOLDOWN"}</button>
        </div>
      </div>

      <button onClick={() => setShowRules(true)} className="fixed bottom-6 right-6 bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg border-2 border-red-400 hover:scale-110 transition-transform z-50 text-xl font-black">📖</button>
      
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-[100] pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} kind={t.kind} />)}
      </div>
    </div>
  );
};

export default App;
