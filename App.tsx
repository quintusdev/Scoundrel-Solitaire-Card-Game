
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Card, GameMode, ActionResponse, GameStats, SessionStats, Suit } from './types';
import { createDeck, getCardType, generatePixelArtSVG } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import StatsModal from './components/StatsModal';
import Toast from './components/Toast';
import TutorialOverlay from './components/TutorialOverlay';

const INITIAL_HEALTH = 20;
const STATS_KEY = "scoundrel_react_stats_v1";

const INITIAL_SESSION_STATS: SessionStats = {
  roomsReached: 1,
  enemiesDefeated: 0,
  damageTaken: 0,
  healingDone: 0,
  runsUsed: 0,
  weaponsEquipped: 0,
  potionsUsed: 0,
};

const INITIAL_GLOBAL_STATS: GameStats = {
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
  lastGame: null,
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
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [visualEffect, setVisualEffect] = useState<string | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [slashes, setSlashes] = useState<Slash[]>([]);
  const [isFleeing, setIsFleeing] = useState(false);
  const [dyingCardId, setDyingCardId] = useState<string | null>(null);
  const [weaponDyingCardId, setWeaponDyingCardId] = useState<string | null>(null);
  const [isHitStopped, setIsHitStopped] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const [isTutorial, setIsTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      try {
        setGlobalStats(JSON.parse(saved));
      } catch (e) { 
        console.error("Errore parse statistiche:", e); 
      }
    }
  }, []);

  useEffect(() => {
    if (globalStats.totalGames > 0) {
      localStorage.setItem(STATS_KEY, JSON.stringify(globalStats));
    }
  }, [globalStats]);

  const addToast = (message: string, kind: string = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getRandomOnomatopoeia = (type: string, value: number) => {
    const weaponHits = ["SLASH!", "SWISH!", "SHING!", "CLANG!", "THWACK!"];
    const heavyWeaponHits = ["CRITICAL!", "DECIMATE!", "OBLITERATE!", "SLAUGHTER!", "K.O.!"];
    const unarmedHits = ["BAM!", "POW!", "WHACK!", "THUD!", "WHAM!", "OUCH!"];
    const heavyUnarmedHits = ["CRUSH!", "DESTROY!", "KABOOM!", "REKT!", "FATAL!"];
    const potions = ["SLURP!", "GLUG!", "SPLASH!", "AHHH!", "REFRESH!"];
    const equip = ["CLICK!", "SNAP!", "GOTCHA!", "SHINY!", "READY!"];

    if (type === 'weapon') return (value >= 10 ? heavyWeaponHits : weaponHits)[Math.floor(Math.random() * weaponHits.length)];
    if (type === 'unarmed') return (value >= 10 ? heavyUnarmedHits : unarmedHits)[Math.floor(Math.random() * unarmedHits.length)];
    if (type === 'potion') return potions[Math.floor(Math.random() * potions.length)];
    return equip[Math.floor(Math.random() * equip.length)];
  };

  const addFloatingText = (text: string, type: 'damage' | 'heal' | 'action' | 'equip', isUnarmed: boolean = false, xPos: number = 50) => {
    const id = Math.random();
    setFloatingTexts(prev => [...prev, { id, text, type, x: xPos, y: 45 + Math.random() * 10, isUnarmed }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1200);
  };

  const triggerExplosion = (x: number = 50, y: number = 50, color: string = "#ef4444") => {
    const id = Math.random();
    setExplosions(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== id)), 800);
  };

  const triggerSlash = (x: number = 50, y: number = 50) => {
    const id = Math.random();
    setSlashes(prev => [...prev, { id, x, y }]);
    setTimeout(() => setSlashes(prev => prev.filter(s => s.id !== id)), 450);
  };

  const triggerEffect = (effect: string) => {
    setVisualEffect(effect);
    setTimeout(() => setVisualEffect(null), 800);
  };

  const updateGlobalStats = (result: "won" | "lost", session: SessionStats) => {
    if (isTutorial) return;
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    setGlobalStats(prev => {
      const next = { ...prev };
      next.totalGames += 1;
      if (result === "won") next.wins += 1; else next.losses += 1;
      next.totalRoomsCleared += session.roomsReached;
      next.totalEnemiesDefeated += session.enemiesDefeated;
      next.totalDamageTaken += session.damageTaken;
      next.totalHealingDone += session.healingDone;
      next.totalRunsUsed += session.runsUsed;
      next.totalWeaponsEquipped += session.weaponsEquipped;
      next.totalPotionsUsed += session.potionsUsed;
      if (session.roomsReached > next.bestRun.rooms) next.bestRun.rooms = session.roomsReached;
      if (session.enemiesDefeated > next.bestRun.enemies) next.bestRun.enemies = session.enemiesDefeated;
      next.lastGame = { status: result, rooms: session.roomsReached, enemies: session.enemiesDefeated, duration, timestamp: Date.now() };
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
        addToast("Nuova Stanza!", "success");
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
    setImageError(false);
    setGameStartTime(Date.now());
    let newDeck = createDeck();
    let firstRoom: Card[] = forceTutorial ? [
      { id: 'tut-m1', suit: 'Picche' as Suit, rank: '5', value: 5 },
      { id: 'tut-w1', suit: 'Quadri' as Suit, rank: '8', value: 8 },
      { id: 'tut-p1', suit: 'Cuori' as Suit, rank: '4', value: 4 },
      { id: 'tut-m2', suit: 'Fiori' as Suit, rank: 'J', value: 11 },
    ] : newDeck.splice(0, 4);

    setGameState({
      status: "playing",
      mode,
      health: INITIAL_HEALTH,
      maxHealth: INITIAL_HEALTH,
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
    addToast(forceTutorial ? "Modalità Addestramento" : `Benvenuto nel Dungeon!`, "success");
  };

  const validateAction = (actionType: string): ActionResponse => {
    const { selectedCardId, room, equippedWeapon, health, fugaDisponibile } = gameState;
    const selectedCard = room.find(c => c.id === selectedCardId);
    
    if (isTutorial) {
       if (tutorialStep === 1 && actionType !== "SELECT_CARD") return { ok: false, severity: "block", message: "Seleziona il mostro (Picche)!" };
       if (tutorialStep === 2 && actionType !== "UNARMED") return { ok: false, severity: "block", message: "Devi usare Mani Nude ora!" };
       if (tutorialStep === 3 && actionType !== "SELECT_CARD") return { ok: false, severity: "block", message: "Seleziona l'arma (Quadri)!" };
       if (tutorialStep === 4 && actionType !== "WEAPON") return { ok: false, severity: "block", message: "Equipaggia l'arma!" };
       if (tutorialStep === 5 && actionType !== "SELECT_CARD") return { ok: false, severity: "block", message: "Seleziona la pozione (Cuori)!" };
       if (tutorialStep === 6 && actionType !== "POTION_ROOM") return { ok: false, severity: "block", message: "Usa la pozione della stanza!" };
       if (tutorialStep < 7 && actionType === "FUGA") return { ok: false, severity: "block", message: "Fuggire non è ancora parte del piano." };
    }

    if (actionType === "FUGA") {
      if (!fugaDisponibile) return { ok: false, severity: "block", message: "Ritirata non disponibile!" };
      return { ok: true, severity: "success", message: "Fuga!" };
    }

    if (actionType === "SELECT_CARD") return { ok: true, severity: "success", message: "" };
    if (!selectedCardId) return { ok: false, severity: "block", message: "Scegli una carta!" };
    
    switch (actionType) {
      case "UNARMED":
        if (selectedCard?.suit !== "Fiori" && selectedCard?.suit !== "Picche") return { ok: false, severity: "block", message: "Attacca solo mostri!" };
        return { ok: true, severity: "success", message: "Attacco!" };
      case "WEAPON":
        if (selectedCard?.suit === "Quadri") return { ok: true, severity: "success", message: "Equipaggio..." };
        if (selectedCard?.suit === "Fiori" || selectedCard?.suit === "Picche") {
          if (!equippedWeapon) return { ok: false, severity: "block", message: "Ti serve un'arma!" };
          if (equippedWeapon.value < selectedCard.value && gameState.mode === "normal") return { ok: false, severity: "block", message: "Arma troppo debole!" };
          return { ok: true, severity: "success", message: "Fendente!" };
        }
        return { ok: false, severity: "block", message: "Azione non valida." };
      case "POTION_ROOM":
        if (selectedCard?.suit !== "Cuori") return { ok: false, severity: "block", message: "Non è una pozione." };
        if (health >= 20) return { ok: false, severity: "warn", message: "Salute massima!" };
        return { ok: true, severity: "success", message: "Cura!" };
      default: return { ok: false, severity: "block", message: "Azione ignota." };
    }
  };

  const applyAction = (actionType: string) => {
    const validation = validateAction(actionType);
    if (!validation.ok) {
      addToast(validation.message, validation.severity === "block" ? "error" : "warning");
      return;
    }

    if (isTutorial) {
      if (tutorialStep === 2 && actionType === "UNARMED") setTutorialStep(3);
      if (tutorialStep === 4 && actionType === "WEAPON") setTutorialStep(5);
      if (tutorialStep === 6 && actionType === "POTION_ROOM") setTutorialStep(7);
      if (tutorialStep === 7 && actionType === "FUGA") setTutorialStep(8);
    }

    if (actionType === "FUGA") {
      setIsFleeing(true);
      triggerEffect("flash-blue animate-shake glitch-chromatic");
      addToast("RITIRATA!", "warning");
      // Sincronizzazione con l'animazione card-flee-smoke (600ms)
      setTimeout(() => {
        setGameState(prev => {
          let next = { ...prev };
          next.deck = [...prev.deck, ...prev.room];
          next.room = next.deck.splice(0, 4);
          next.roomIndex += 1;
          next.sessionStats.runsUsed += 1;
          next.fugaDisponibile = false;
          next.selectedCardId = null;
          return next;
        });
        setIsFleeing(false);
      }, 600);
      return;
    }

    const { selectedCardId, room } = gameState;
    const selectedCard = room.find(c => c.id === selectedCardId);
    if (!selectedCard) return;

    const cardIdx = room.findIndex(c => c.id === selectedCardId);
    const xPos = 20 + cardIdx * 20; 

    setIsHitStopped(true);
    setTimeout(() => setIsHitStopped(false), 150);

    if (actionType === "UNARMED") {
      triggerExplosion(xPos, 50, "#ef4444");
      triggerEffect("animate-shake-heavy flash-red-heavy blood-vignette glitch-chromatic");
      addFloatingText(getRandomOnomatopoeia('unarmed', selectedCard.value), "damage", true, xPos);
      if (selectedCard.value >= 11) triggerEffect("screen-crack");
    } else if (actionType === "WEAPON") {
      if (selectedCard.suit === "Quadri") {
        triggerExplosion(xPos, 50, "#facc15");
        triggerEffect("flash-blue animate-weapon-pop glitch-chromatic");
        addFloatingText(getRandomOnomatopoeia('equip', selectedCard.value), "equip", false, xPos);
      } else {
        triggerSlash(xPos, 50);
        triggerExplosion(xPos, 50, "#3b82f6");
        triggerEffect("animate-shake-heavy flash-blue glitch-chromatic");
        setWeaponDyingCardId(selectedCard.id);
        setTimeout(() => setWeaponDyingCardId(null), 500);
        addFloatingText(getRandomOnomatopoeia('weapon', selectedCard.value), "action", false, xPos);
      }
    } else if (actionType === "POTION_ROOM") {
      triggerEffect("animate-heal");
      addFloatingText(getRandomOnomatopoeia('potion', selectedCard.value), "heal", false, xPos);
    }

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
            break;
          case "WEAPON":
            if (card.suit === "Quadri") {
              next.equippedWeapon = card;
              next.sessionStats.weaponsEquipped += 1;
              next.room = prev.room.filter(c => c.id !== selectedCardId);
            } else {
              next.room = prev.room.filter(c => c.id !== selectedCardId);
              next.enemiesDefeated += 1;
              next.sessionStats.enemiesDefeated += 1;
            }
            break;
          case "POTION_ROOM":
            const roomHeal = Math.min(prev.maxHealth - prev.health, card.value);
            next.health += roomHeal;
            next.sessionStats.healingDone += roomHeal;
            next.sessionStats.potionsUsed += 1;
            next.room = prev.room.filter(c => c.id !== selectedCardId);
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
    }, 500);
  };

  const handleSelect = (id: string) => {
    const card = gameState.room.find(c => c.id === id);
    if (!card) return;
    if (isTutorial) {
       if (tutorialStep === 1 && card.suit === 'Picche') setTutorialStep(2);
       if (tutorialStep === 3 && card.suit === 'Quadri') setTutorialStep(4);
       if (tutorialStep === 5 && card.suit === 'Cuori') setTutorialStep(6);
    }
    setGameState(prev => ({ ...prev, selectedCardId: id === prev.selectedCardId ? null : id }));
  };

  const handlePotionButtonClick = () => {
    const selectedCard = gameState.room.find(c => c.id === gameState.selectedCardId);
    if (selectedCard && selectedCard.suit === "Cuori") applyAction("POTION_ROOM");
    else addToast("Seleziona una carta Cuori per curarti!", "warn");
  };

  return (
    <div className={`min-h-screen flex flex-col p-4 md:p-8 relative overflow-hidden transition-all duration-300 ${visualEffect?.includes('blood-vignette') ? 'blood-vignette' : ''}`}>
      <div className={`global-game-bg ${gameState.status === 'playing' ? 'bg-playing' : ''}`} />
      <div className="global-overlay" />

      <div className={`fixed inset-0 pointer-events-none z-[400] transition-opacity duration-300 ${visualEffect?.includes('flash-red-heavy') ? 'flash-red-heavy' : ''} ${visualEffect?.includes('flash-blue') ? 'flash-blue' : ''} ${visualEffect?.includes('glitch-chromatic') ? 'glitch-chromatic' : ''}`} />
      {visualEffect?.includes('screen-crack') && <div className="screen-crack" />}

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
        <div key={ft.id} className={`floating-text fixed pointer-events-none z-[1000] ${ft.type === 'damage' ? 'text-red-500' : ft.type === 'heal' ? 'text-emerald-400' : ft.type === 'equip' ? 'text-yellow-400' : 'text-blue-400'} ${ft.isUnarmed ? 'text-7xl scale-150 font-black italic' : 'text-5xl font-black'}`} style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
          {ft.text}
        </div>
      ))}

      {gameState.status === "start" ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 text-center animate-in fade-in zoom-in duration-700">
          <h1 className="text-8xl md:text-[10rem] title-font font-bold mb-6 text-red-600 tracking-tighter uppercase drop-shadow-[0_0_50px_rgba(220,38,38,0.7)]">Scoundrel</h1>
          <p className="text-slate-200 mb-12 max-w-sm mx-auto italic font-medium bg-black/40 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">Ogni carta è una promessa. Ogni scelta un fendente.</p>
          <div className="flex flex-col gap-4 w-full max-w-sm mx-auto px-4">
            <button onClick={() => startNewGame("normal")} className="py-6 bg-red-600 hover:bg-red-500 font-black rounded-3xl border-b-8 border-red-900 active:border-b-0 active:translate-y-2 text-xl tracking-widest shadow-2xl transition-all">SOPRAVVIVI</button>
            <button onClick={() => startNewGame("normal", true)} className="py-4 bg-blue-600 hover:bg-blue-500 font-black rounded-3xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 text-xs tracking-widest uppercase">🎓 Addestramento</button>
            <div className="flex gap-2">
              <button onClick={() => setShowStats(true)} className="flex-1 py-3 bg-slate-900/90 border border-slate-700 rounded-xl font-bold text-[10px] tracking-widest uppercase backdrop-blur-md">Archivio</button>
              <button onClick={() => setShowRules(true)} className="flex-1 py-3 bg-slate-900/90 border border-slate-700 rounded-xl font-bold text-[10px] tracking-widest uppercase backdrop-blur-md">Manuale</button>
            </div>
          </div>
        </div>
      ) : gameState.status === "won" || gameState.status === "lost" ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 text-white">
          <div className={`p-16 rounded-[60px] border-4 flex flex-col items-center w-full max-w-xl backdrop-blur-xl ${gameState.status === "won" ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'border-red-900 bg-red-950/40 shadow-[0_0_40px_rgba(185,28,28,0.3)]'}`}>
              <h1 className={`text-8xl font-black mb-10 text-center title-font ${gameState.status === "won" ? 'text-emerald-400' : 'text-red-600'}`}>{gameState.status === "won" ? "EROE" : "CADUTO"}</h1>
              
              <div className="w-[200px] h-[200px] mb-10 flex items-center justify-center relative">
                {!imageError ? (
                  <img 
                    src="./assets/images/morte.png" 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse" 
                    alt="Morte"
                    onError={() => {
                      console.warn("Path assets/images/morte.png non risolto. Fallback attivato.");
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full grayscale brightness-75 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-pulse" dangerouslySetInnerHTML={{ __html: generatePixelArtSVG('monster', 14) }} />
                )}
              </div>

              <button onClick={() => setGameState(prev => ({ ...prev, status: "start" }))} className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl hover:scale-105 transition-all uppercase tracking-widest shadow-2xl">RITENTA</button>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col max-w-6xl mx-auto w-full transition-transform duration-300 ${visualEffect || ''} ${isHitStopped ? 'scale-[0.98] grayscale-[0.3]' : ''}`}>
          <HUD state={gameState} effectClass={visualEffect || undefined} />
          <Room 
            cards={gameState.room} 
            selectedId={gameState.selectedCardId} 
            onSelect={handleSelect} 
            isExiting={isFleeing} 
            dyingCardId={dyingCardId} 
            weaponDyingCardId={weaponDyingCardId}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative z-40">
            <button id="unarmed-btn" onClick={() => applyAction("UNARMED")} className="group py-5 bg-orange-700 hover:bg-orange-600 transition-all rounded-2xl font-black uppercase text-xs tracking-widest border-b-4 border-orange-950 active:border-b-0 active:translate-y-1 overflow-hidden relative shadow-lg">
              <span className="relative z-10">Mani Nude</span>
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <button id="weapon-btn" onClick={() => applyAction("WEAPON")} className="group py-5 bg-blue-700 hover:bg-blue-600 transition-all rounded-2xl font-black uppercase text-xs tracking-widest border-b-4 border-blue-950 active:border-b-0 active:translate-y-1 overflow-hidden relative shadow-lg">
              <span className="relative z-10">Attacca/Equip</span>
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <button id="potion-btn" onClick={handlePotionButtonClick} className="group py-5 bg-emerald-700 hover:bg-emerald-600 transition-all rounded-2xl font-black uppercase text-xs tracking-widest border-b-4 border-emerald-950 active:border-b-0 active:translate-y-1 overflow-hidden relative shadow-lg">
              <span className="relative z-10">Cura (Cuori)</span>
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
            <button id="flee-btn" onClick={() => applyAction("FUGA")} className={`py-5 transition-all rounded-2xl font-black uppercase text-xs tracking-widest border-b-4 active:border-b-0 active:translate-y-1 shadow-lg ${gameState.fugaDisponibile && gameState.room.length > 1 ? 'bg-slate-700 border-slate-950 hover:bg-slate-600 text-white' : 'bg-slate-900/50 text-slate-500 border-black opacity-50 cursor-not-allowed'}`} disabled={!gameState.fugaDisponibile || gameState.room.length < 2}>Ritirata</button>
          </div>
        </div>
      )}

      {isTutorial && <TutorialOverlay step={tutorialStep} onNext={() => setTutorialStep(s => s + 1)} onComplete={() => setIsTutorial(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showStats && <StatsModal stats={globalStats} onClose={() => setShowStats(false)} />}
      
      <div className="fixed top-8 right-8 z-[1000] flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} kind={toast.kind} />
        ))}
      </div>
    </div>
  );
};

export default App;
