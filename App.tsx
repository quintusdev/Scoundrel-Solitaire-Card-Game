
import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Card, ProfilesData, UserProfile, Difficulty, ProfileStats } from './types';
import { createDeck, getBackgroundByRoom, GAME_RULES, DIFFICULTY_CONFIG, ACHIEVEMENTS, DifficultyRules } from './constants';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import StatsModal from './components/StatsModal';
import Toast from './components/Toast';
import ProfileManagerUI from './components/ProfileManagerUI';
import DifficultySelector from './components/DifficultySelector';
import TutorialOverlay from './components/TutorialOverlay';

const EMPTY_STATS: ProfileStats = { 
  wins: 0, losses: 0, totalGames: 0, bestScore: 0,
  totalRoomsCleared: 0, totalDamageTaken: 0, totalHealingDone: 0,
  bestRun: { rooms: 0, enemies: 0 }
};

const App: React.FC = () => {
  const [view, setView] = useState<'profile-selection' | 'difficulty-selection' | 'main-menu' | 'playing'>('profile-selection');
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);
  const [profilesData, setProfilesData] = useState<ProfilesData>({ activeProfileId: null, profiles: {} });

  // Gameplay
  const [isFleeing, setIsFleeing] = useState(false);
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

  useEffect(() => {
    const saved = localStorage.getItem(GAME_RULES.PROFILES_KEY);
    if (saved) try { setProfilesData(JSON.parse(saved)); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    localStorage.setItem(GAME_RULES.PROFILES_KEY, JSON.stringify(profilesData));
  }, [profilesData]);

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

  const handleCreateProfile = (name: string, nickname: string, heroClass: string, avatar: string) => {
    const id = `profile_${Date.now()}`;
    const newProfile: UserProfile = {
      id, name, nickname, heroClass, avatar,
      version: GAME_RULES.VERSION, lastActivity: "Adesso",
      unlocks: { hard: false, inferno: false, god: false },
      achievements: {},
      rankings: { normal: null, hard: null, inferno: null, god: null },
      stats: { normal: {...EMPTY_STATS}, hard: {...EMPTY_STATS}, inferno: {...EMPTY_STATS}, god: {...EMPTY_STATS}, general: {...EMPTY_STATS} },
      currentGame: null, lastGame: null
    };
    setProfilesData(prev => ({ ...prev, profiles: { ...prev.profiles, [id]: newProfile }, activeProfileId: id }));
    setView('main-menu');
    setTutorialStep(0);
  };

  const startNewGame = (diff: Difficulty) => {
    const fullDeck = createDeck();
    const newState: GameState = {
      status: "playing", difficulty: diff, health: GAME_RULES.INITIAL_HEALTH, maxHealth: GAME_RULES.INITIAL_HEALTH,
      equippedWeapon: null, 
      weaponDurability: DifficultyRules.getMaxDurability(diff),
      deck: fullDeck.slice(4), room: fullDeck.slice(0, 4), roomIndex: 1,
      selectedCardId: null, fugaDisponibile: true, fugaUsataUltimaStanza: false, enemiesDefeated: 0,
      startTime: Date.now(),
      sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, weaponsEquipped: 0, potionsUsed: 0 }
    };
    setGameState(newState);
    setView('playing');
  };

  const finalizeStats = (finalState: GameState) => {
    if (!activeProfile) return;
    const diff = finalState.difficulty;
    const profile = { ...activeProfile };
    
    [profile.stats[diff], profile.stats.general].forEach(s => {
      s.totalGames++;
      s.totalRoomsCleared += finalState.roomIndex;
      s.totalDamageTaken += finalState.sessionStats.damageTaken;
      s.totalHealingDone += finalState.sessionStats.healingDone;
      if (finalState.status === 'won') s.wins++; else s.losses++;
      if (finalState.roomIndex > s.bestRun.rooms) s.bestRun = { rooms: finalState.roomIndex, enemies: finalState.enemiesDefeated };
    });

    if (finalState.status === 'won') {
      if (diff === 'normal') profile.unlocks.hard = true;
      if (diff === 'hard') profile.unlocks.inferno = true;
      if (diff === 'inferno') profile.unlocks.god = true;
      
      const achId = (diff.toUpperCase() + "_WIN");
      if (ACHIEVEMENTS[achId]) {
         profile.achievements[achId] = true;
         addToast(`Achievement Sbloccato: ${ACHIEVEMENTS[achId].name}`, "success");
      }
    }

    profile.lastGame = {
      status: finalState.status, rooms: finalState.roomIndex, enemies: finalState.enemiesDefeated,
      duration: Math.floor((Date.now() - finalState.startTime) / 1000), timestamp: Date.now()
    };
    profile.currentGame = null;
    updateActiveProfile(profile);
  };

  const applyAction = () => {
    const card = gameState.room.find(c => c.id === gameState.selectedCardId);
    if (!card) return;

    setGameState(prev => {
      const type = card.suit === "Cuori" ? "potion" : card.suit === "Quadri" ? "weapon" : "monster";
      const weaponVal = prev.equippedWeapon?.value || 0;
      let next = { ...prev, room: prev.room.filter(c => c.id !== card.id), selectedCardId: null };

      if (type === "monster") {
        if (!DifficultyRules.canAttack(card.value, weaponVal, prev.difficulty)) {
           addToast("Il mostro è troppo forte per la tua arma attuale!", "error");
           return prev;
        }
        const damage = DifficultyRules.calculateDamage(card.value, weaponVal, prev.difficulty);
        next.health -= damage;
        next.enemiesDefeated++;
        next.sessionStats.enemiesDefeated++;
        next.sessionStats.damageTaken += damage;

        if (prev.weaponDurability !== null && prev.equippedWeapon) {
          next.weaponDurability = prev.weaponDurability - 1;
          if (next.weaponDurability <= 0) {
            next.equippedWeapon = null;
            next.weaponDurability = null;
            addToast("La tua arma si è spezzata!", "error");
          }
        }
      } else if (type === "weapon") {
        next.equippedWeapon = card;
        next.weaponDurability = DifficultyRules.getMaxDurability(prev.difficulty);
        next.sessionStats.weaponsEquipped++;
      } else if (type === "potion") {
        const heal = Math.floor(card.value * DifficultyRules.getHealMultiplier(prev.difficulty));
        next.health = Math.min(prev.maxHealth, prev.health + heal);
        next.sessionStats.healingDone += heal;
        next.sessionStats.potionsUsed++;
      }

      if (next.health <= 0) { next.status = "lost"; finalizeStats(next); return next; }
      if (next.deck.length === 0 && next.room.length === 0) { next.status = "won"; finalizeStats(next); return next; }

      if (next.room.length === 1 && next.deck.length > 0) {
        const deckCopy = [...next.deck];
        next.room = [...next.room, ...deckCopy.splice(0, 3)];
        next.deck = deckCopy;
        next.roomIndex++;
        next.fugaDisponibile = !next.fugaUsataUltimaStanza;
        next.fugaUsataUltimaStanza = false;
      }
      return next;
    });
  };

  const handleFlee = () => {
    const cost = DifficultyRules.getRetreatCost(gameState.difficulty);
    if (gameState.health <= cost) {
      addToast("Troppo debole per fuggire!", "error");
      return;
    }
    setIsFleeing(true);
    setTimeout(() => {
      setGameState(prev => {
        const updatedDeck = [...prev.deck, ...prev.room];
        const deckCopy = [...updatedDeck];
        return { 
          ...prev, 
          health: prev.health - cost,
          deck: deckCopy.slice(4), 
          room: deckCopy.slice(0, 4), 
          roomIndex: prev.roomIndex + 1, 
          fugaDisponibile: false, 
          fugaUsataUltimaStanza: true, 
          selectedCardId: null 
        };
      });
      setIsFleeing(false);
      if (cost > 0) addToast(`Sei fuggito, ma hai perso ${cost} HP`, "warning");
    }, 600);
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-slate-950 text-slate-50">
      <div className="cinematic-vignette" />
      <div className={`global-game-bg`} style={{ backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.95)), url('${getBackgroundByRoom(gameState.roomIndex)}')` }} />
      
      <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} kind={t.kind} />)}
      </div>

      {view === 'profile-selection' ? (
        <ProfileManagerUI profiles={profilesData.profiles} onSelect={(id) => { updateActiveProfile({id}); setView('main-menu'); }} onCreate={handleCreateProfile} onDelete={() => {}} onImport={() => {}} onExport={() => {}} />
      ) : view === 'difficulty-selection' ? (
        <DifficultySelector unlocks={activeProfile?.unlocks!} onSelect={startNewGame} onCancel={() => setView('main-menu')} />
      ) : view === 'main-menu' ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in fade-in duration-700">
           <div className="mb-8 flex flex-col items-center">
              <div className="relative group">
                <img src={activeProfile?.avatar} className={`w-24 h-24 rounded-full border-4 ${activeProfile?.unlocks.god ? 'border-yellow-500 god-border-glow shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'border-slate-800'} shadow-2xl mb-4 transition-all duration-500`} />
                {activeProfile?.unlocks.god && <div className="absolute -top-2 -right-2 text-2xl animate-bounce">👑</div>}
              </div>
              <h2 className={`text-2xl font-black uppercase tracking-tighter ${activeProfile?.unlocks.god ? 'text-yellow-400' : 'text-white'}`}>{activeProfile?.nickname}</h2>
              <div className="flex gap-2 mt-2">
                 {Object.keys(activeProfile?.achievements || {}).map(id => (
                   <span key={id} title={ACHIEVEMENTS[id].name} className={`text-xl drop-shadow-md ${id === 'GOD_WIN' ? 'animate-pulse' : ''}`}>{ACHIEVEMENTS[id].icon}</span>
                 ))}
              </div>
              <div className="mt-6 flex gap-3">
                 <button onClick={() => setShowRules(true)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl border border-white/5 transition-all text-[10px] uppercase tracking-widest">Manuale</button>
                 <button onClick={() => setShowStats(true)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl border border-white/5 transition-all text-[10px] uppercase tracking-widest">Archivio</button>
              </div>
           </div>
           <h1 className="text-8xl font-black text-red-600 uppercase tracking-tighter mb-10 drop-shadow-2xl">Scoundrel</h1>
           <div className="flex flex-col gap-4 w-full max-w-xs">
              <button onClick={() => setView('difficulty-selection')} className="py-5 bg-red-600 text-white font-black rounded-2xl border-b-8 border-red-950 active:translate-y-2 active:border-b-0 transition-all text-xl uppercase italic">Inizia Spedizione</button>
              <button onClick={() => setView('profile-selection')} className="py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cambia Profilo</button>
           </div>
        </div>
      ) : (gameState.status === 'playing') ? (
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-4 z-10">
          <HUD state={gameState} />
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Room cards={gameState.room} selectedId={gameState.selectedCardId} onSelect={(id) => setGameState(p => ({...p, selectedCardId: id === p.selectedCardId ? null : id}))} isExiting={isFleeing} />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 hud-glass p-6 rounded-[32px]">
             <ContextualActionButton state={gameState} onAction={applyAction} />
             <button disabled={!gameState.fugaDisponibile} onClick={handleFlee} className={`py-5 font-black rounded-2xl uppercase tracking-widest border-b-4 transition-all ${gameState.fugaDisponibile ? 'bg-slate-800 border-slate-900 text-white' : 'bg-slate-900 text-slate-700 border-slate-950 opacity-50'}`}>
                {DifficultyRules.getRetreatCost(gameState.difficulty) > 0 ? `Fuggi (-${DifficultyRules.getRetreatCost(gameState.difficulty)} HP)` : 'Fuggi'}
             </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center z-10 p-6 text-center animate-in zoom-in duration-500 overflow-hidden relative">
           {gameState.status === 'won' && gameState.difficulty === 'god' && <VictoryParticles />}
           <h2 className={`text-8xl font-black uppercase mb-6 ${gameState.status === 'won' ? (gameState.difficulty === 'god' ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse' : 'text-emerald-500') : 'text-red-500'}`}>
             {gameState.status === 'won' ? (gameState.difficulty === 'god' ? "DIVINITÀ!" : "Trionfo!") : "Eroe Caduto"}
           </h2>
           <button onClick={() => setView('main-menu')} className="px-12 py-5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-lg z-20">Menu Principale</button>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showStats && activeProfile && <StatsModal stats={{...activeProfile.stats.general, lastGame: activeProfile.lastGame}} onClose={() => setShowStats(false)} />}
      {tutorialStep !== null && (
        <TutorialOverlay 
          step={tutorialStep} 
          onNext={() => setTutorialStep(s => s! + 1)} 
          onComplete={() => setTutorialStep(null)} 
        />
      )}
    </div>
  );
};

const VictoryParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const tx = (Math.random() - 0.5) * 1000;
        const ty = (Math.random() - 0.5) * 1000;
        const size = Math.random() * 8 + 4;
        return (
          <div 
            key={i} 
            className="particle" 
            style={{ 
              left: '50%', 
              top: '50%', 
              width: `${size}px`, 
              height: `${size}px`,
              '--tw-translate-x': `${tx}px`,
              '--tw-translate-y': `${ty}px`,
              animationDelay: `${Math.random() * 2}s`
            } as any} 
          />
        );
      })}
    </div>
  );
};

const ContextualActionButton: React.FC<{ state: GameState, onAction: () => void }> = ({ state, onAction }) => {
  const card = state.room.find(c => c.id === state.selectedCardId);
  const weaponVal = state.equippedWeapon?.value || 0;
  if (!card) return <button disabled className="py-5 bg-slate-900 text-slate-700 font-black rounded-2xl border-b-4 border-slate-950 uppercase tracking-widest opacity-50">Seleziona Bersaglio</button>;
  
  const type = card.suit === "Cuori" ? "potion" : card.suit === "Quadri" ? "weapon" : "monster";
  const blocked = type === 'monster' && !DifficultyRules.canAttack(card.value, weaponVal, state.difficulty);
  
  let label = "Interagisci";
  let color = "bg-blue-600 border-blue-900 hover:bg-blue-500";

  if (type === 'monster') { label = blocked ? "Troppo Forte!" : "Attacca"; color = blocked ? "bg-red-950/40 text-red-500 border-red-950 cursor-not-allowed" : "bg-red-700 border-red-950 hover:bg-red-600"; }
  else if (type === 'weapon') { label = "Equipaggia"; color = "bg-blue-700 border-blue-950 hover:bg-blue-600"; }
  else if (type === 'potion') { label = "Bevi"; color = "bg-emerald-700 border-emerald-950 hover:bg-emerald-600"; }

  return <button disabled={blocked} onClick={onAction} className={`py-5 ${color} text-white font-black rounded-2xl uppercase tracking-widest border-b-4 active:translate-y-1 transition-all`}>{label}</button>;
};

export default App;
