
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameState, Card, GameStats, ActionType, RunSummary } from './types';
import { createDeck, getBackgroundByRoom, GAME_RULES } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import StatsModal from './components/StatsModal';
import TutorialOverlay from './components/TutorialOverlay';
import Toast from './components/Toast';

const DEFAULT_STATS: GameStats = {
  totalGames: 0, wins: 0, losses: 0, totalRoomsCleared: 0, totalEnemiesDefeated: 0,
  totalDamageTaken: 0, totalHealingDone: 0, totalRunsUsed: 0, totalWeaponsEquipped: 0,
  totalPotionsUsed: 0, bestRun: { rooms: 0, enemies: 0 }, lastGame: null
};

const App: React.FC = () => {
  // UI State
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>(DEFAULT_STATS);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);

  // Game Animation State
  const [isFleeing, setIsFleeing] = useState(false);
  const [dyingCardId, setDyingCardId] = useState<string | null>(null);
  const [isHitStopped, setIsHitStopped] = useState(false); 
  const [showHitFlash, setShowHitFlash] = useState(false);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>({
    status: "start", mode: "normal", health: GAME_RULES.INITIAL_HEALTH, maxHealth: GAME_RULES.INITIAL_HEALTH,
    equippedWeapon: null, deck: [], room: [], selectedCardId: null, fugaDisponibile: true,
    fugaUsataUltimaStanza: false, roomIndex: 0, enemiesDefeated: 0, startTime: 0,
    sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, runsUsed: 0, weaponsEquipped: 0, potionsUsed: 0 }
  });

  const addToast = (message: string, kind: string = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Load Stats
  useEffect(() => {
    const saved = localStorage.getItem(GAME_RULES.STATS_KEY);
    if (saved) try { setGameStats(JSON.parse(saved)); } catch (e) { console.error(e); }
  }, []);

  const backgroundStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.95)), url('${getBackgroundByRoom(gameState.status === "start" ? 1 : gameState.roomIndex)}')`,
  }), [gameState.roomIndex, gameState.status]);

  /**
   * RECOLA UFFICIALE SCOUNDREL: Transizione Stanza
   * La transizione avviene solo quando la stanza è vuota o rimane 1 sola carta (Carry-over).
   */
  const computeNextRoom = useCallback((state: GameState): GameState => {
    const deckSize = state.deck.length;
    const roomSize = state.room.length;

    // Se il mazzo è vuoto e non ci sono più carte in mano -> VITTORIA
    if (deckSize === 0 && roomSize === 0) {
      return { ...state, status: "won" };
    }

    // REGOLA CARRY-OVER: Se rimane 1 carta e c'è ancora un mazzo, automatizziamo la transizione.
    // Se il mazzo è vuoto, permettiamo di giocare l'ultima carta per finire la partita.
    const shouldCarryOver = roomSize === 1 && deckSize > 0;
    const isRoomEmpty = roomSize === 0 && deckSize > 0;

    if (!shouldCarryOver && !isRoomEmpty) return state;

    addToast(shouldCarryOver ? "Nuova Stanza (Carry-over)" : "Nuova Stanza", "success");

    const deckCopy = [...state.deck];
    const cardsToDraw = GAME_RULES.CARDS_PER_ROOM - roomSize;
    const nextCards = deckCopy.splice(0, cardsToDraw);

    return {
      ...state,
      deck: deckCopy,
      room: [...state.room, ...nextCards],
      roomIndex: state.roomIndex + 1,
      fugaDisponibile: !state.fugaUsataUltimaStanza,
      fugaUsataUltimaStanza: false,
      selectedCardId: null
    };
  }, []);

  const finalizeStats = useCallback((finalState: GameState) => {
    const duration = Math.floor((Date.now() - finalState.startTime) / 1000);
    const summary: RunSummary = {
      status: finalState.status as "won" | "lost",
      rooms: finalState.roomIndex,
      enemies: finalState.enemiesDefeated,
      timestamp: Date.now(),
      duration
    };

    setGameStats(prev => {
      const newStats = {
        ...prev,
        totalGames: prev.totalGames + 1,
        wins: prev.wins + (finalState.status === "won" ? 1 : 0),
        losses: prev.losses + (finalState.status === "lost" ? 1 : 0),
        totalRoomsCleared: prev.totalRoomsCleared + finalState.roomIndex,
        totalEnemiesDefeated: prev.totalEnemiesDefeated + finalState.enemiesDefeated,
        bestRun: finalState.roomIndex > prev.bestRun.rooms ? { rooms: finalState.roomIndex, enemies: finalState.enemiesDefeated } : prev.bestRun,
        lastGame: summary
      };
      localStorage.setItem(GAME_RULES.STATS_KEY, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const triggerHitEffects = useCallback(() => {
    setIsHitStopped(true);
    setShowHitFlash(true);
    setTimeout(() => {
      setIsHitStopped(false);
      setShowHitFlash(false);
    }, 300);
  }, []);

  const applyAction = (actionType: ActionType) => {
    // AZIONE RITIRATA (FUGA)
    if (actionType === "FUGA") {
      if (!gameState.fugaDisponibile) return;
      setIsFleeing(true); 
      
      setTimeout(() => {
        setGameState(prev => {
          // 1. Reinserimento: Tutte le carte della stanza tornano in fondo al deck
          const updatedDeck = [...prev.deck, ...prev.room];
          const midState = { 
            ...prev, 
            deck: updatedDeck, 
            room: [], 
            fugaDisponibile: false, 
            fugaUsataUltimaStanza: true,
            selectedCardId: null
          };
          
          addToast("Ritirata: Carte rimesse nel mazzo", "warning");

          // 2. Transizione: Pesca 4 nuove carte
          return computeNextRoom(midState);
        });
        setIsFleeing(false);
      }, 600);
      return;
    }

    const selectedCard = gameState.room.find(c => c.id === gameState.selectedCardId);
    if (!selectedCard) return;

    const weaponValue = gameState.equippedWeapon?.value || 0;
    const isHarmful = actionType === "UNARMED" || (actionType === "WEAPON" && selectedCard.suit !== "Quadri" && selectedCard.value > weaponValue);
    
    if (isHarmful) triggerHitEffects();
    setDyingCardId(selectedCard.id); 

    setTimeout(() => {
      setGameState(prev => {
        // Rimuovi la carta dalla stanza (senza refill immediato)
        let next = { ...prev, room: prev.room.filter(c => c.id !== selectedCard.id), selectedCardId: null };
        
        if (actionType === "UNARMED") {
          next.health -= selectedCard.value;
          next.enemiesDefeated++;
        } else if (actionType === "WEAPON") {
          if (selectedCard.suit === "Quadri") next.equippedWeapon = selectedCard;
          else {
            if (selectedCard.value > weaponValue) next.health -= (selectedCard.value - weaponValue);
            next.enemiesDefeated++;
          }
        } else if (actionType === "POTION_ROOM") {
          next.health = Math.min(next.maxHealth, next.health + selectedCard.value);
        }

        // Controllo morte
        if (next.health <= 0) {
          next.status = "lost";
          finalizeStats(next);
          return next;
        }

        // Controllo transizione stanza (Regole Ufficiali: 0 o 1 carta rimasta)
        const transitioned = computeNextRoom(next);
        
        if (transitioned.status === "won") finalizeStats(transitioned);
        return transitioned;
      });
      setDyingCardId(null);
    }, 400);
  };

  const startNewGame = (isTutorial = false) => {
    const fullDeck = createDeck();
    const initialRoom = fullDeck.slice(0, 4);
    const remainingDeck = fullDeck.slice(4);

    setGameState({
      status: "playing", mode: "normal", health: GAME_RULES.INITIAL_HEALTH, maxHealth: GAME_RULES.INITIAL_HEALTH,
      equippedWeapon: null, deck: remainingDeck, room: initialRoom, roomIndex: 1,
      selectedCardId: null, fugaDisponibile: true, fugaUsataUltimaStanza: false, enemiesDefeated: 0,
      startTime: Date.now(),
      sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, runsUsed: 0, weaponsEquipped: 0, potionsUsed: 0 }
    });
    setTutorialStep(isTutorial ? 0 : null);
  };

  const onSelectCard = (id: string) => {
    setGameState(p => ({ ...p, selectedCardId: id === p.selectedCardId ? null : id }));
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-slate-950 text-slate-50">
      <div className="cinematic-vignette" />
      <div className="film-grain" />
      {showHitFlash && <div className="hit-flash" />}

      <div className={`global-game-bg ${isHitStopped ? 'screen-shake' : ''}`} style={backgroundStyle} />
      
      <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} kind={t.kind} />)}
      </div>

      {gameState.status === "start" ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in fade-in duration-700">
          <h1 className="text-6xl md:text-8xl font-black text-red-600 uppercase tracking-tighter drop-shadow-2xl mb-2 animate-pulse">Scoundrel</h1>
          <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs mb-10">Dungeon Crawling Card Game</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={() => startNewGame()} className="px-10 py-5 bg-red-600 text-white font-black text-xl rounded-2xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all hover:bg-red-500 shadow-xl">INIZIA INCURSIONE</button>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => startNewGame(true)} className="py-3 bg-slate-800 text-slate-200 font-bold rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-700 text-xs uppercase tracking-widest flex items-center justify-center gap-2"><span>⚔️</span> Addestramento</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShowStats(true)} className="py-3 bg-slate-900/80 text-slate-400 font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-all text-[10px] uppercase tracking-widest">Statistiche</button>
                <button onClick={() => setShowRules(true)} className="py-3 bg-slate-900/80 text-slate-400 font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-all text-[10px] uppercase tracking-widest">Regole</button>
              </div>
            </div>
          </div>
        </div>
      ) : (gameState.status === "won" || gameState.status === "lost") ? (
         <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in zoom-in duration-500">
            <img 
              src="/assets/images/victory_or_defeat_ai.png" 
              alt={gameState.status === "won" ? "Vittoria" : "Sconfitta"} 
              className="w-[200px] h-[200px] object-contain mb-6 animate-bounce"
            />
            <h2 className={`text-6xl font-black uppercase mb-4 ${gameState.status === "won" ? 'text-emerald-500' : 'text-red-500'}`}>{gameState.status === "won" ? "Vittoria!" : "Caduto"}</h2>
            <button onClick={() => setGameState(p => ({ ...p, status: "start" }))} className="px-8 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all uppercase tracking-widest text-sm">Torna alla Home</button>
         </div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-2 sm:p-4 z-10">
          <HUD state={gameState} />
          <div className={`flex-1 flex items-center justify-center min-h-0 transition-transform duration-75 ${isHitStopped ? 'screen-shake scale-[0.97] brightness-125' : ''}`}>
            <Room cards={gameState.room} selectedId={gameState.selectedCardId} onSelect={onSelectCard} isExiting={isFleeing} dyingCardId={dyingCardId} />
          </div>
          <div className="mt-2 mb-2 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 hud-glass p-3 sm:p-4 rounded-[24px] sm:rounded-[32px]">
            <button id="unarmed-btn" onClick={() => applyAction("UNARMED")} className="py-3 sm:py-4 bg-orange-700 text-white font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 border-orange-950 active:translate-y-1 transition-all">Mani Nude</button>
            <button id="weapon-btn" onClick={() => applyAction("WEAPON")} className="py-3 sm:py-4 bg-blue-700 text-white font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 border-blue-950 active:translate-y-1 transition-all">Attacca / Equip</button>
            <button id="potion-btn" onClick={() => applyAction("POTION_ROOM")} className="py-3 sm:py-4 bg-emerald-700 text-white font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 border-emerald-950 active:translate-y-1 transition-all">Cura</button>
            <button id="flee-btn" disabled={!gameState.fugaDisponibile} onClick={() => applyAction("FUGA")} className={`py-3 sm:py-4 font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 active:translate-y-1 transition-all ${gameState.fugaDisponibile ? 'bg-slate-700 border-slate-900 text-white' : 'bg-slate-900 text-slate-600 border-slate-950 opacity-40 cursor-not-allowed'}`}>Ritirata</button>
          </div>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showStats && <StatsModal stats={gameStats} onClose={() => setShowStats(false)} />}
      {tutorialStep !== null && <TutorialOverlay step={tutorialStep} onNext={() => setTutorialStep(s => s !== null ? s + 1 : null)} onComplete={() => setTutorialStep(null)} />}
    </div>
  );
};

export default App;
