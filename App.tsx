
import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Card, GameMode, ActionResponse, GameStats, SessionStats, Suit } from './types';
import { createDeck, getCardType, generatePixelArtSVG, getBackgroundByRoom } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import StatsModal from './components/StatsModal';
import Toast from './components/Toast';
import TutorialOverlay from './components/TutorialOverlay';

const INITIAL_HEALTH = 20;
const STATS_KEY = "scoundrel_react_stats_v1";

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  totalRoomsCleared: 0,
  totalEnemiesDefeated: 0,
  totalDamageTaken: 0,
  totalHealingDone: 0,
  totalRunsUsed: 0,
  totalWeaponsEquipped: 0,
  totalPotionsUsed: 0,
  bestRun: { rooms: 0, enemies: 0 },
  lastGame: null
};

const App: React.FC = () => {
  // --- STATI UI ---
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>(DEFAULT_STATS);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);

  // --- STATO GIOCO ---
  const [gameState, setGameState] = useState<GameState>({
    status: "start", 
    mode: "normal",
    health: INITIAL_HEALTH,
    maxHealth: INITIAL_HEALTH,
    equippedWeapon: null,
    deck: [],
    room: [],
    selectedCardId: null,
    fugaDisponibile: true,
    fugaUsataUltimaStanza: false,
    roomIndex: 0,
    enemiesDefeated: 0,
    sessionStats: {
      roomsReached: 1,
      enemiesDefeated: 0,
      damageTaken: 0,
      healingDone: 0,
      runsUsed: 0,
      weaponsEquipped: 0,
      potionsUsed: 0,
    },
  });

  const [isFleeing, setIsFleeing] = useState(false);
  const [dyingCardId, setDyingCardId] = useState<string | null>(null);
  const [isHitStopped, setIsHitStopped] = useState(false); 
  const [showHitFlash, setShowHitFlash] = useState(false);

  // --- LOGICA SFONDO DINAMICO ---
  const currentBackgroundImage = useMemo(() => {
    return getBackgroundByRoom(gameState.status === "start" ? 1 : gameState.roomIndex);
  }, [gameState.roomIndex, gameState.status]);

  const backgroundStyle = {
    backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.95)), url('${currentBackgroundImage}')`,
  };

  // Caricamento Statistiche
  useEffect(() => {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      try {
        setGameStats(JSON.parse(saved));
      } catch (e) {
        console.error("Errore caricamento statistiche", e);
      }
    }
  }, []);

  const checkGameStateTransitions = (state: GameState): GameState => {
    if (state.room.length <= 1) {
        const deckCopy = [...state.deck];
        const cardsToDraw = 4 - state.room.length;
        const nextCards = deckCopy.splice(0, cardsToDraw);

        if (nextCards.length === 0 && state.room.length === 0) {
            return { ...state, status: "won" };
        }

        const canFleeNextRoom = !state.fugaUsataUltimaStanza;

        return {
          ...state,
          deck: deckCopy,
          room: [...state.room, ...nextCards],
          roomIndex: state.roomIndex + 1,
          fugaDisponibile: canFleeNextRoom,
          fugaUsataUltimaStanza: false,
        };
    }
    return state;
  };

  const applyAction = (actionType: string) => {
    if (actionType === "FUGA") {
      if (!gameState.fugaDisponibile) return;
      
      setIsFleeing(true); 
      setTimeout(() => {
        setGameState(prev => {
          const newDeck = [...prev.deck, ...prev.room];
          const stateAfterFlee: GameState = {
            ...prev,
            deck: newDeck,
            room: [],        
            fugaDisponibile: false, 
            fugaUsataUltimaStanza: true,
            selectedCardId: null
          };
          return checkGameStateTransitions(stateAfterFlee);
        });
        setIsFleeing(false);
      }, 600);
      return;
    }

    const { selectedCardId, room } = gameState;
    const selectedCard = room.find(c => c.id === selectedCardId);
    if (!selectedCard) return;

    const isHarmful = actionType === "UNARMED" || (actionType === "WEAPON" && selectedCard.suit !== "Quadri" && selectedCard.value > (gameState.equippedWeapon?.value || 0));
    
    if (isHarmful) {
      setIsHitStopped(true);
      setShowHitFlash(true);
      setTimeout(() => {
        setIsHitStopped(false);
        setShowHitFlash(false);
      }, 300);
    }

    setDyingCardId(selectedCard.id); 
    setTimeout(() => {
      setGameState(prev => {
        const next = { ...prev };
        if (actionType === "UNARMED") {
          next.health -= selectedCard.value;
        } else if (actionType === "WEAPON") {
          if (selectedCard.suit === "Quadri") {
            next.equippedWeapon = selectedCard;
          } else {
            const weaponValue = prev.equippedWeapon ? prev.equippedWeapon.value : 0;
            if (selectedCard.value > weaponValue) {
               next.health -= (selectedCard.value - weaponValue);
            }
          }
        } else if (actionType === "POTION_ROOM") {
          next.health = Math.min(next.maxHealth, next.health + selectedCard.value);
        }

        next.room = next.room.filter(c => c.id !== selectedCard.id);
        next.selectedCardId = null;
        setDyingCardId(null);

        if (next.health <= 0) {
          next.status = "lost";
          return next;
        }
        
        return checkGameStateTransitions(next);
      });
    }, 400);
  };

  const startNewGame = (isTutorial = false) => {
    const deck = createDeck();
    setGameState({
      status: "playing",
      mode: "normal",
      health: INITIAL_HEALTH,
      maxHealth: INITIAL_HEALTH,
      equippedWeapon: null,
      deck: deck.slice(4),
      room: deck.slice(0, 4),
      roomIndex: 1,
      selectedCardId: null,
      fugaDisponibile: true,
      fugaUsataUltimaStanza: false,
      enemiesDefeated: 0,
      sessionStats: {
        roomsReached: 1,
        enemiesDefeated: 0,
        damageTaken: 0,
        healingDone: 0,
        runsUsed: 0,
        weaponsEquipped: 0,
        potionsUsed: 0,
      },
    });
    if (isTutorial) setTutorialStep(0);
    else setTutorialStep(null);
  };

  const onSelectCard = (id: string) => {
    setGameState(p => ({...p, selectedCardId: id === p.selectedCardId ? null : id}));
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-slate-950 text-slate-50">
      <div className="cinematic-vignette" />
      <div className="film-grain" />
      {showHitFlash && <div className="hit-flash" />}

      <div 
        className={`global-game-bg ${isHitStopped ? 'screen-shake' : ''}`} 
        style={backgroundStyle} 
      />
      
      {gameState.status === "start" ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in fade-in duration-700">
          <h1 className="text-6xl md:text-8xl font-black text-red-600 uppercase tracking-tighter drop-shadow-2xl mb-2 animate-pulse">Scoundrel</h1>
          <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs mb-10">Dungeon Crawling Card Game</p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button 
              onClick={() => startNewGame()}
              className="px-10 py-5 bg-red-600 text-white font-black text-xl rounded-2xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all hover:bg-red-500 shadow-xl shadow-red-900/20"
            >
              INIZIA INCURSIONE
            </button>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => startNewGame(true)}
                className="py-3 bg-slate-800 text-slate-200 font-bold rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all hover:bg-slate-700 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <span>⚔️</span> Addestramento
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setShowStats(true)} className="py-3 bg-slate-900/80 text-slate-400 font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-all text-[10px] uppercase tracking-widest">Statistiche</button>
                <button onClick={() => setShowRules(true)} className="py-3 bg-slate-900/80 text-slate-400 font-bold rounded-xl border border-slate-700 hover:bg-slate-800 hover:text-white transition-all text-[10px] uppercase tracking-widest">Regole</button>
              </div>
            </div>
          </div>
        </div>
      ) : gameState.status === "won" || gameState.status === "lost" ? (
         <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in zoom-in duration-500">
            <h2 className={`text-6xl font-black uppercase mb-4 ${gameState.status === "won" ? 'text-emerald-500' : 'text-red-500'}`}>{gameState.status === "won" ? "Vittoria!" : "Caduto"}</h2>
            <button onClick={() => setGameState(p => ({...p, status: "start"}))} className="px-8 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all uppercase tracking-widest text-sm">Torna alla Home</button>
         </div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-2 sm:p-4 z-10">
          <HUD state={gameState} />
          <div className={`flex-1 flex items-center justify-center min-h-0 transition-transform duration-75 ${isHitStopped ? 'screen-shake scale-[0.97] brightness-125' : ''}`}>
            <Room cards={gameState.room} selectedId={gameState.selectedCardId} onSelect={onSelectCard} isExiting={isFleeing} dyingCardId={dyingCardId} />
          </div>
          <div className="mt-2 mb-2 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 hud-glass p-3 sm:p-4 rounded-[24px] sm:rounded-[32px]">
            <button onClick={() => applyAction("UNARMED")} className="py-3 sm:py-4 bg-orange-700 text-white font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 border-orange-950 active:translate-y-1 transition-all">Mani Nude</button>
            <button onClick={() => applyAction("WEAPON")} className="py-3 sm:py-4 bg-blue-700 text-white font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 border-blue-950 active:translate-y-1 transition-all">Attacca / Equip</button>
            <button onClick={() => applyAction("POTION_ROOM")} className="py-3 sm:py-4 bg-emerald-700 text-white font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 border-emerald-950 active:translate-y-1 transition-all">Cura</button>
            <button disabled={!gameState.fugaDisponibile} onClick={() => applyAction("FUGA")} className={`py-3 sm:py-4 font-bold rounded-xl uppercase text-[10px] sm:text-xs tracking-widest border-b-4 active:translate-y-1 transition-all ${gameState.fugaDisponibile ? 'bg-slate-700 border-slate-900 text-white' : 'bg-slate-900 text-slate-600 border-slate-950 opacity-40 cursor-not-allowed'}`}>Ritirata</button>
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
