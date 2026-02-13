
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameState, Card, ActionType, ProfilesData, UserProfile, Difficulty, RankEntry, ProfileStats, RunSummary } from './types';
import { createDeck, getBackgroundByRoom, GAME_RULES, AVATARS, HERO_CLASSES, DIFFICULTY_CONFIG, ACHIEVEMENTS } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import StatsModal from './components/StatsModal';
import TutorialOverlay from './components/TutorialOverlay';
import Toast from './components/Toast';
import ProfileManagerUI from './components/ProfileManagerUI';
import DifficultySelector from './components/DifficultySelector';

// Updated EMPTY_STATS with missing required fields to prevent type errors and runtime undefined values
const EMPTY_STATS: ProfileStats = { 
  wins: 0, 
  losses: 0, 
  totalGames: 0, 
  bestScore: 0,
  totalRoomsCleared: 0,
  totalDamageTaken: 0,
  totalHealingDone: 0,
  bestRun: { rooms: 0, enemies: 0 }
};

const App: React.FC = () => {
  // Navigation
  const [view, setView] = useState<'profile-selection' | 'difficulty-selection' | 'main-menu' | 'playing'>('profile-selection');
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);

  // Persistent Data
  const [profilesData, setProfilesData] = useState<ProfilesData>({ activeProfileId: null, profiles: {} });

  // Gameplay Engine
  const [isFleeing, setIsFleeing] = useState(false);
  const [dyingCardId, setDyingCardId] = useState<string | null>(null);
  const [isHitStopped, setIsHitStopped] = useState(false); 
  const [showHitFlash, setShowHitFlash] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    status: "start", difficulty: "normal", health: GAME_RULES.INITIAL_HEALTH, maxHealth: GAME_RULES.INITIAL_HEALTH,
    equippedWeapon: null, weaponDurability: null, deck: [], room: [], selectedCardId: null, fugaDisponibile: true,
    fugaUsataUltimaStanza: false, roomIndex: 0, enemiesDefeated: 0, startTime: 0,
    sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, weaponsEquipped: 0, potionsUsed: 0 }
  });

  const activeProfile = useMemo(() => 
    profilesData.activeProfileId ? profilesData.profiles[profilesData.activeProfileId] : null
  , [profilesData]);

  const addToast = (message: string, kind: string = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // --- PERSISTENCE ---

  useEffect(() => {
    const saved = localStorage.getItem(GAME_RULES.PROFILES_KEY);
    if (saved) try { setProfilesData(JSON.parse(saved)); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    localStorage.setItem(GAME_RULES.PROFILES_KEY, JSON.stringify(profilesData));
  }, [profilesData]);

  useEffect(() => {
    if (activeProfile && gameState.status === 'playing') {
      updateActiveProfile({ currentGame: gameState });
    }
  }, [gameState]);

  const updateActiveProfile = (updates: Partial<UserProfile>) => {
    if (!profilesData.activeProfileId) return;
    setProfilesData(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [prev.activeProfileId!]: { ...prev.profiles[prev.activeProfileId!], ...updates, lastActivity: new Date().toLocaleString() }
      }
    }));
  };

  // --- META ACTIONS ---

  const handleCreateProfile = (name: string, nickname: string, heroClass: string, avatar: string) => {
    const id = `profile_${Date.now()}`;
    const newProfile: UserProfile = {
      id, name, nickname, heroClass, avatar,
      version: GAME_RULES.VERSION, lastActivity: "Adesso",
      unlocks: { hard: false, inferno: false },
      achievements: {},
      rankings: { normal: null, hard: null, inferno: null },
      stats: { normal: {...EMPTY_STATS}, hard: {...EMPTY_STATS}, inferno: {...EMPTY_STATS}, general: {...EMPTY_STATS} },
      currentGame: null,
      lastGame: null
    };
    setProfilesData(prev => ({ ...prev, profiles: { ...prev.profiles, [id]: newProfile }, activeProfileId: id }));
    setView('main-menu');
  };

  const checkAchievements = (finalState: GameState, profile: UserProfile) => {
    const newAchievements: Record<string, boolean> = { ...profile.achievements };
    let toastUnlocked: string[] = [];

    const unlock = (id: string) => {
      if (!newAchievements[id]) {
        newAchievements[id] = true;
        toastUnlocked.push(ACHIEVEMENTS[id].name);
      }
    };

    if (finalState.status === 'won') {
      unlock("FIRST_WIN");
      if (finalState.difficulty === 'hard') unlock("HARD_WIN");
      if (finalState.difficulty === 'inferno') unlock("INFERNO_WIN");
      if (finalState.sessionStats.weaponsEquipped === 0) unlock("NO_WEAPON");
      if (finalState.health === 1) unlock("BERSERKER");
    }

    toastUnlocked.forEach(name => addToast(`Achievement Sbloccato: ${name}`, "success"));
    return newAchievements;
  };

  // --- GAMEPLAY LOGIC ---

  const startNewGame = (diff: Difficulty) => {
    const fullDeck = createDeck();
    const initialRoom = fullDeck.slice(0, 4);
    const remainingDeck = fullDeck.slice(4);

    const newState: GameState = {
      status: "playing", difficulty: diff, health: GAME_RULES.INITIAL_HEALTH, maxHealth: GAME_RULES.INITIAL_HEALTH,
      equippedWeapon: null, 
      weaponDurability: diff === 'inferno' ? GAME_RULES.INFERNO_DURABILITY : null,
      deck: remainingDeck, room: initialRoom, roomIndex: 1,
      selectedCardId: null, fugaDisponibile: true, fugaUsataUltimaStanza: false, enemiesDefeated: 0,
      startTime: Date.now(),
      sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, weaponsEquipped: 0, potionsUsed: 0 }
    };
    setGameState(newState);
    setView('playing');
  };

  // Updated finalizeStats to record detailed metrics for the archive
  const finalizeStats = (finalState: GameState) => {
    if (!activeProfile) return;
    const diff = finalState.difficulty;
    const profile = { ...activeProfile };
    
    // Update both specific difficulty stats and general aggregate stats
    const dStats = profile.stats[diff];
    const gStats = profile.stats.general;
    
    [dStats, gStats].forEach(s => {
      s.totalGames++;
      s.totalRoomsCleared += finalState.roomIndex;
      s.totalDamageTaken += finalState.sessionStats.damageTaken;
      s.totalHealingDone += finalState.sessionStats.healingDone;
      
      if (finalState.status === 'won') {
        s.wins++;
      } else {
        s.losses++;
      }

      if (finalState.roomIndex > s.bestRun.rooms) {
        s.bestRun = { rooms: finalState.roomIndex, enemies: finalState.enemiesDefeated };
      }
    });

    if (finalState.status === 'won') {
      if (diff === 'normal') profile.unlocks.hard = true;
      if (diff === 'hard') profile.unlocks.inferno = true;
    }

    // Ranking and Personal Records
    const score = (finalState.health * 100) + (finalState.enemiesDefeated * 50) + (finalState.roomIndex * 200);
    if (finalState.status === 'won' && (!profile.rankings[diff] || score > profile.rankings[diff]!.score)) {
      profile.rankings[diff] = { score, rooms: finalState.roomIndex, date: new Date().toLocaleDateString() };
      if (score > dStats.bestScore) dStats.bestScore = score;
      if (score > gStats.bestScore) gStats.bestScore = score;
    }

    // Record the current run summary
    profile.lastGame = {
      status: finalState.status,
      rooms: finalState.roomIndex,
      enemies: finalState.enemiesDefeated,
      duration: Math.floor((Date.now() - finalState.startTime) / 1000),
      timestamp: Date.now()
    };

    profile.achievements = checkAchievements(finalState, profile);
    profile.currentGame = null;
    updateActiveProfile(profile);
  };

  const applyAction = () => {
    const selectedCard = gameState.room.find(c => c.id === gameState.selectedCardId);
    if (!selectedCard) return;

    const type = selectedCard.suit === "Cuori" ? "potion" : selectedCard.suit === "Quadri" ? "weapon" : "monster";
    
    setGameState(prev => {
      let next = { ...prev, room: prev.room.filter(c => c.id !== selectedCard.id), selectedCardId: null };
      
      if (type === "monster") {
        const weaponVal = prev.equippedWeapon?.value || 0;
        let damage = 0;

        // Difficulty Rules
        if (prev.difficulty === 'normal') {
          damage = Math.max(0, selectedCard.value - weaponVal);
        } else if (prev.difficulty === 'hard') {
          damage = selectedCard.value > weaponVal ? selectedCard.value : 0;
        } else if (prev.difficulty === 'inferno') {
          if (selectedCard.value > weaponVal) return prev; // Attacco bloccato (UI lo gestisce)
          damage = 0;
        }

        next.health -= damage;
        next.enemiesDefeated++;
        next.sessionStats.enemiesDefeated++;
        next.sessionStats.damageTaken += damage;
        
        // Durability
        if (prev.difficulty === 'inferno' && prev.equippedWeapon) {
          next.weaponDurability = (prev.weaponDurability || 1) - 1;
          if (next.weaponDurability === 0) {
            next.equippedWeapon = null;
            next.weaponDurability = null;
            addToast("La tua arma si è spezzata!", "error");
          }
        }
      } else if (type === "weapon") {
        next.equippedWeapon = selectedCard;
        next.sessionStats.weaponsEquipped++;
        if (prev.difficulty === 'inferno') next.weaponDurability = GAME_RULES.INFERNO_DURABILITY;
      } else if (type === "potion") {
        const multiplier = DIFFICULTY_CONFIG[prev.difficulty].healMultiplier;
        const heal = Math.floor(selectedCard.value * multiplier);
        next.health = Math.min(prev.maxHealth, prev.health + heal);
        next.sessionStats.potionsUsed++;
        next.sessionStats.healingDone += heal;
      }

      if (next.health <= 0) {
        next.status = "lost";
        finalizeStats(next);
        return next;
      }

      const deckSize = next.deck.length;
      const roomSize = next.room.length;
      if (deckSize === 0 && roomSize === 0) {
        next.status = "won";
        finalizeStats(next);
        return next;
      }

      if (roomSize === 1 && deckSize > 0) {
        const deckCopy = [...next.deck];
        const nextCards = deckCopy.splice(0, 3);
        next.sessionStats.roomsReached++;
        return { ...next, deck: deckCopy, room: [...next.room, ...nextCards], roomIndex: next.roomIndex + 1, fugaDisponibile: !next.fugaUsataUltimaStanza, fugaUsataUltimaStanza: false };
      }
      
      return next;
    });
  };

  const handleFuga = () => {
    if (!gameState.fugaDisponibile) return;
    setIsFleeing(true);
    setTimeout(() => {
      setGameState(prev => {
        const updatedDeck = [...prev.deck, ...prev.room];
        const deckCopy = [...updatedDeck];
        const nextCards = deckCopy.splice(0, 4);
        return { ...prev, deck: deckCopy, room: nextCards, roomIndex: prev.roomIndex + 1, fugaDisponibile: false, fugaUsataUltimaStanza: true, selectedCardId: null };
      });
      setIsFleeing(false);
    }, 600);
  };

  const backgroundStyle = useMemo(() => ({
    backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.95)), url('${getBackgroundByRoom(gameState.roomIndex)}')`,
  }), [gameState.roomIndex]);

  // --- VIEWS ---

  if (view === 'profile-selection') {
    return <ProfileManagerUI profiles={profilesData.profiles} onSelect={(id) => { updateActiveProfile({id}); setView('main-menu'); }} onCreate={handleCreateProfile} onDelete={(id) => {}} onImport={() => {}} onExport={() => {}} />;
  }

  if (view === 'difficulty-selection') {
    return <DifficultySelector unlocks={activeProfile?.unlocks!} onSelect={startNewGame} onCancel={() => setView('main-menu')} />;
  }

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden font-sans bg-slate-950 text-slate-50">
      <div className="cinematic-vignette" />
      <div className="film-grain" />
      <div className={`global-game-bg`} style={backgroundStyle} />
      
      <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} kind={t.kind} />)}
      </div>

      {view === 'main-menu' ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in fade-in duration-700">
           <div className="mb-8 flex flex-col items-center">
              <img src={activeProfile?.avatar} className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-xl mb-4" />
              <h2 className="text-xl font-black text-white uppercase">{activeProfile?.nickname}</h2>
              <div className="flex gap-2 mt-2">
                 {Object.entries(activeProfile?.achievements || {}).map(([id]) => (
                   <span key={id} title={ACHIEVEMENTS[id].name} className="text-lg grayscale hover:grayscale-0 cursor-help transition-all">{ACHIEVEMENTS[id].icon}</span>
                 ))}
              </div>
              <div className="mt-6 flex gap-3">
                 <button onClick={() => setShowRules(true)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black rounded-xl border border-white/5 transition-all text-[10px] uppercase tracking-widest">Manuale</button>
                 <button onClick={() => setShowStats(true)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-black rounded-xl border border-white/5 transition-all text-[10px] uppercase tracking-widest">Archivio</button>
              </div>
           </div>
           <h1 className="text-7xl font-black text-red-600 uppercase tracking-tighter mb-8">Scoundrel</h1>
           <div className="flex flex-col gap-4 w-full max-w-xs">
              {activeProfile?.currentGame?.status === 'playing' ? (
                <button onClick={() => { setGameState(activeProfile.currentGame!); setView('playing'); }} className="py-4 bg-emerald-600 text-white font-black rounded-xl border-b-4 border-emerald-900 active:translate-y-1">RIPRENDI INCURSIONE</button>
              ) : (
                <button onClick={() => setView('difficulty-selection')} className="py-4 bg-red-600 text-white font-black rounded-xl border-b-4 border-red-900 active:translate-y-1">NUOVA INCURSIONE</button>
              )}
              <button onClick={() => setView('profile-selection')} className="py-3 bg-slate-800 text-slate-400 font-black rounded-xl uppercase text-[10px] tracking-widest">Cambia Profilo</button>
           </div>
        </div>
      ) : (gameState.status === 'won' || gameState.status === 'lost') ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in zoom-in duration-500">
           <h2 className={`text-6xl font-black uppercase mb-4 ${gameState.status === 'won' ? 'text-emerald-500' : 'text-red-500'}`}>{gameState.status === 'won' ? "Vittoria!" : "Caduto"}</h2>
           <button onClick={() => setView('main-menu')} className="px-8 py-4 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all uppercase tracking-widest text-sm">Torna al Menu</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-2 sm:p-4 z-10">
          <HUD state={gameState} />
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Room cards={gameState.room} selectedId={gameState.selectedCardId} onSelect={(id) => setGameState(p => ({...p, selectedCardId: id === p.selectedCardId ? null : id}))} isExiting={isFleeing} dyingCardId={dyingCardId} />
          </div>
          
          <div className="mt-4 mb-2 grid grid-cols-2 gap-4 hud-glass p-4 rounded-3xl">
             <ContextualActionButton state={gameState} onAction={applyAction} />
             <button disabled={!gameState.fugaDisponibile} onClick={handleFuga} className={`py-4 font-black rounded-xl uppercase tracking-widest border-b-4 ${gameState.fugaDisponibile ? 'bg-slate-700 border-slate-900 text-white' : 'bg-slate-900 text-slate-600 border-slate-950 opacity-40'}`}>Ritirata</button>
          </div>
        </div>
      )}
      
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showStats && activeProfile && (
        <StatsModal 
          stats={{
            ...activeProfile.stats.general,
            lastGame: activeProfile.lastGame
          }} 
          onClose={() => setShowStats(false)} 
        />
      )}
    </div>
  );
};

const ContextualActionButton: React.FC<{ state: GameState, onAction: () => void }> = ({ state, onAction }) => {
  const card = state.room.find(c => c.id === state.selectedCardId);
  const weaponVal = state.equippedWeapon?.value || 0;
  
  if (!card) return <button disabled className="py-4 bg-slate-900 text-slate-600 font-black rounded-xl border-b-4 border-slate-950 uppercase tracking-widest">Seleziona Carta</button>;
  
  const type = card.suit === "Cuori" ? "potion" : card.suit === "Quadri" ? "weapon" : "monster";
  const isTooStrong = state.difficulty === 'inferno' && type === 'monster' && card.value > weaponVal;

  let label = "Interagisci";
  let color = "bg-blue-600 border-blue-900";

  if (type === 'monster') {
     label = isTooStrong ? "Mostro troppo forte!" : "Attacca";
     color = isTooStrong ? "bg-red-950/40 text-red-500 border-red-950 cursor-not-allowed" : "bg-red-700 border-red-950";
  } else if (type === 'weapon') {
     label = "Equipaggia Arma";
     color = "bg-blue-700 border-blue-950";
  } else if (type === 'potion') {
     label = "Bevi Pozione";
     color = "bg-emerald-700 border-emerald-950";
  }

  return (
    <button 
      disabled={isTooStrong} 
      onClick={onAction} 
      className={`py-4 ${color} text-white font-black rounded-xl uppercase tracking-widest border-b-4 active:translate-y-1 transition-all`}
    >
      {label}
    </button>
  );
};

export default App;
