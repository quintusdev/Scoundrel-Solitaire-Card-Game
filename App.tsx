
import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Card, ProfilesData, UserProfile, Difficulty, ProfileStats, SignedSave, ChronicleEntry, WorldShift, WorldState } from './types';
import { createDeck, getBackgroundByRoom, GAME_RULES, DIFFICULTY_CONFIG, ACHIEVEMENTS, DifficultyRules, getCardType, ETERNAL_VARIANTS, SIGIL_REWARDS, ALTAR_NODES } from './constants';
import { SaveManager } from './SaveManager';
import { ChronicleManager } from './ChronicleManager';
import { WorldShiftManager } from './WorldShiftManager';
import HUD from './components/HUD';
import Room from './components/Room';
import RulesModal from './components/RulesModal';
import StatsModal from './components/StatsModal';
import SaveModal from './components/SaveModal';
import Toast from './components/Toast';
import ProfileManagerUI from './components/ProfileManagerUI';
import DifficultySelector from './components/DifficultySelector';
import TutorialOverlay from './components/TutorialOverlay';
import VariantSelector from './components/VariantSelector';
import EvolutiveChest from './components/EvolutiveChest';
import BootSequence from './components/BootSequence';
import HallOfEternal from './components/HallOfEternal';

const EMPTY_STATS: ProfileStats = { 
  wins: 0, losses: 0, totalGames: 0, bestScore: 0,
  totalRoomsCleared: 0, totalDamageTaken: 0, totalHealingDone: 0,
  bestRun: { rooms: 0, enemies: 0 }
};

const App: React.FC = () => {
  const [view, setView] = useState<'profile-selection' | 'difficulty-selection' | 'main-menu' | 'playing'>(() => {
    const saved = localStorage.getItem(GAME_RULES.PROFILES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.activeProfileId && parsed.profiles && parsed.profiles[parsed.activeProfileId]) {
          return 'main-menu';
        }
      } catch (e) {}
    }
    return 'profile-selection';
  });
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showHall, setShowHall] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{id: number, message: string, kind: string}[]>([]);
  const [profilesData, setProfilesData] = useState<ProfilesData>(() => {
    const saved = localStorage.getItem(GAME_RULES.PROFILES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Restore activeProfileId only if it exists in profiles
        if (parsed.activeProfileId && (!parsed.profiles || !parsed.profiles[parsed.activeProfileId])) {
          parsed.activeProfileId = null;
        }
        return parsed;
      } catch (e) {
        console.error("Error loading profiles:", e);
      }
    }
    return { activeProfileId: null, profiles: {} };
  });

  const [isBooting, setIsBooting] = useState(false);
  const [isFleeing, setIsFleeing] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    status: "start", difficulty: "normal", health: GAME_RULES.INITIAL_HEALTH, maxHealth: GAME_RULES.INITIAL_HEALTH,
    equippedWeapon: null, weaponDurability: null, deck: [], room: [], selectedCardId: null, fugaDisponibile: true,
    fugaUsataUltimaStanza: false, roomIndex: 0, enemiesDefeated: 0, startTime: 0,
    sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, weaponsEquipped: 0, potionsUsed: 0, retreatsUsed: 0, minHealthReached: GAME_RULES.INITIAL_HEALTH, weaponsBroken: 0, lastDurabilityKill: false, roomMonstersCount: 0, acesInRoom: 0, noWeaponKills10Plus: 0, lowHPStreak: 0, maxLowHPStreak: 0 }
  });

  const activeProfile = useMemo(() => 
    profilesData.activeProfileId ? profilesData.profiles[profilesData.activeProfileId] : null
  , [profilesData]);

  const addToast = (message: string, kind: string = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // 7️⃣ SICUREZZA: Verifica firma worldState al boot (attraverso selezione profilo)
  useEffect(() => {
    if (activeProfile && view === 'main-menu') {
      const verify = async () => {
        const isValid = await WorldShiftManager.verifyWorldState(activeProfile.worldState);
        if (!isValid && activeProfile.worldState.activeShifts.length > 0) {
          console.warn("World State Tampered. Resetting...");
          updateActiveProfile({ worldState: WorldShiftManager.createDefaultState() });
          addToast("Integrità Mondo Compromessa. Stato resettato.", "error");
        }
      };
      verify();
    }
  }, [activeProfile?.id, view]);

  useEffect(() => {
    const dataToSave = { ...profilesData };
    if ((gameState.difficulty === 'god' || gameState.difficulty === 'question') && activeProfile) {
       const p = dataToSave.profiles[activeProfile.id];
       if (p) p.currentGame = null;
    }
    localStorage.setItem(GAME_RULES.PROFILES_KEY, JSON.stringify(dataToSave));
  }, [profilesData, gameState.difficulty]);

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

  const calculateProgressionTier = (profile: UserProfile): number => {
    if (profile.unlocks.god && Object.values(profile.eternalUnlocks).some(u => u.length > 0)) return 3;
    if (profile.unlocks.inferno) return 2;
    if (profile.unlocks.hard) return 1;
    return 0;
  };

  const handleSelectProfile = (id: string) => {
    setProfilesData(prev => ({ ...prev, activeProfileId: id }));
    setIsBooting(true);
    setView('main-menu');
  };

  const handleCreateProfile = (name: string, nickname: string, heroClass: string, avatar: string) => {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newProfile: UserProfile = {
      id, name, nickname, heroClass, avatar,
      version: GAME_RULES.VERSION, lastActivity: "Adesso",
      unlocks: { hard: false, inferno: false, god: false },
      achievements: {},
      rankings: { normal: null, hard: null, inferno: null, god: null, question: null },
      stats: { normal: {...EMPTY_STATS}, hard: {...EMPTY_STATS}, inferno: {...EMPTY_STATS}, god: {...EMPTY_STATS}, question: {...EMPTY_STATS}, general: {...EMPTY_STATS} },
      currentGame: null, lastGame: null,
      saves: { normal: [null, null], hard: [null, null], inferno: [null, null], god: [null, null], question: [null, null] },
      eternalUnlocks: { "Guerriero": [], "Ladro": [], "Mago": [], "Paladino": [] },
      selectedVariant: { "Guerriero": null, "Ladro": null, "Mago": null, "Paladino": null },
      progression: { tier: 0, paradoxUnlocked: false, paradoxSeen: false },
      eternalHall: [],
      worldState: WorldShiftManager.createDefaultState(),
      abyssSigils: 0,
      altarUnlocks: [],
      currentWinStreak: 0,
      totalSigilsSpent: 0
    };
    newProfile.achievements["PROFILE_MILESTONE"] = true;
    setProfilesData(prev => ({ ...prev, profiles: { ...prev.profiles, [id]: newProfile }, activeProfileId: id }));
    setIsBooting(true);
    setView('main-menu');
    setTutorialStep(0);
  };

  const startNewGame = (diff: Difficulty) => {
    if (diff === 'god' || diff === 'question') {
      const msg = diff === 'god' ? "⚠ GOD MODE\nNessun salvataggio permesso.\nProcedere?" : "⚠ THE QUESTION\nLa realtà sta collassando.\nNessun salvataggio o record permesso.\nProcedere?";
      const confirmRun = window.confirm(msg);
      if (!confirmRun) return;
    }

    // 6️⃣ ATTIVAZIONE SHIFT: Solo per "The Question"
    const shifts = diff === 'question' ? activeProfile?.worldState.activeShifts || [] : [];
    const initialHP = shifts.some(s => s.effectId === 'max_hp_plus') ? GAME_RULES.INITIAL_HEALTH + 5 : GAME_RULES.INITIAL_HEALTH;

    const fullDeck = createDeck();
    const newState: GameState = {
      status: "playing", difficulty: diff, health: initialHP, maxHealth: initialHP,
      equippedWeapon: null, 
      weaponDurability: DifficultyRules.getMaxDurability(diff),
      deck: fullDeck.slice(4), room: fullDeck.slice(0, 4), roomIndex: 1,
      selectedCardId: null, fugaDisponibile: true, fugaUsataUltimaStanza: false, enemiesDefeated: 0,
      startTime: Date.now(),
      sessionStats: { roomsReached: 1, enemiesDefeated: 0, damageTaken: 0, healingDone: 0, weaponsEquipped: 0, potionsUsed: 0, retreatsUsed: 0, minHealthReached: initialHP, weaponsBroken: 0, lastDurabilityKill: false, roomMonstersCount: 0, acesInRoom: 0, noWeaponKills10Plus: 0, lowHPStreak: 0, maxLowHPStreak: 0 }
    };
    setGameState(newState);
    setView('playing');
  };

  const handleUnlockAltar = (nodeId: string) => {
    if (!activeProfile) return;
    const node = ALTAR_NODES.find(n => n.id === nodeId);
    if (!node) return;
    
    const sigils = activeProfile.abyssSigils || 0;
    const unlocks = activeProfile.altarUnlocks || [];
    
    if (sigils < node.cost) return;
    if (node.requires && !unlocks.includes(node.requires)) return;
    if (unlocks.includes(nodeId)) return;

    const updatedProfile = { ...activeProfile };
    updatedProfile.abyssSigils = sigils - node.cost;
    updatedProfile.altarUnlocks = [...unlocks, nodeId];
    updatedProfile.totalSigilsSpent = (updatedProfile.totalSigilsSpent || 0) + node.cost;
    
    const unlockAchievement = (p: UserProfile, id: string) => {
      if (p.achievements[id]) return;
      p.achievements[id] = true;
      const ach = ACHIEVEMENTS[id];
      if (ach) {
        const reward = SIGIL_REWARDS[ach.rarity] || 0;
        p.abyssSigils = (p.abyssSigils || 0) + reward;
        addToast(`Achievement: ${ach.name} (+${reward} Sigilli)`, "success");
      }
    };

    unlockAchievement(updatedProfile, "ALTAR_FIRST");
    if (updatedProfile.totalSigilsSpent >= 50) unlockAchievement(updatedProfile, "SPEND_SIGILS_50");
    if (updatedProfile.abyssSigils >= 100) unlockAchievement(updatedProfile, "COLLECT_SIGILS_100");

    const branchNodes = ALTAR_NODES.filter(n => n.branch === node.branch);
    if (branchNodes.every(n => updatedProfile.altarUnlocks.includes(n.id))) {
      unlockAchievement(updatedProfile, "ALTAR_BRANCH_FULL");
    }
    if (ALTAR_NODES.every(n => updatedProfile.altarUnlocks.includes(n.id))) {
      unlockAchievement(updatedProfile, "ALTAR_ALL_FULL");
    }

    updateActiveProfile(updatedProfile);
    addToast(`Potere Sbloccato: ${node.name}`, "success");
  };

  const finalizeStats = async (finalState: GameState) => {
    if (!activeProfile) return;
    const diff: any = finalState.difficulty;
    
    const unlockAchievement = (p: UserProfile, id: string) => {
      if (p.achievements[id]) return;
      p.achievements[id] = true;
      const ach = ACHIEVEMENTS[id];
      if (ach) {
        const reward = SIGIL_REWARDS[ach.rarity] || 0;
        p.abyssSigils = (p.abyssSigils || 0) + reward;
        addToast(`Achievement: ${ach.name} (+${reward} Sigilli)`, "success");
      }
    };

    // 3️⃣ GENERAZIONE SHIFT: Solo dopo vittoria/sconfitta in "The Question"
    if (diff === 'question') {
       if (finalState.status === 'won' || finalState.status === 'lost') {
         const newShift = await WorldShiftManager.generateBalancedShift(activeProfile.worldState.activeShifts);
         let updatedShifts = [newShift, ...activeProfile.worldState.activeShifts];
         if (updatedShifts.length > 7) updatedShifts = updatedShifts.slice(0, 7);
         
         const signature = await WorldShiftManager.signWorldState(updatedShifts);
         updateActiveProfile({ worldState: { activeShifts: updatedShifts, maxShifts: 7, signature } });
         addToast(`Mondo Contaminato: ${newShift.name}`, "info");
       }
       setView('main-menu');
       return;
    }

    const profile = { ...activeProfile };
    const heroClass = profile.heroClass;
    
    [profile.stats[diff], profile.stats.general].forEach(s => {
      s.totalGames++;
      s.totalRoomsCleared += finalState.roomIndex;
      s.totalDamageTaken += finalState.sessionStats.damageTaken;
      s.totalHealingDone += finalState.sessionStats.healingDone;
      if (finalState.status === 'won') s.wins++; else s.losses++;
      if (finalState.roomIndex > s.bestRun.rooms) s.bestRun = { rooms: finalState.roomIndex, enemies: finalState.enemiesDefeated };
    });

    if (finalState.status === 'won') {
      profile.currentWinStreak = (profile.currentWinStreak || 0) + 1;
      
      // STREAKS
      if (profile.currentWinStreak >= 3) unlockAchievement(profile, "TRIPLE_WIN");
      if (profile.currentWinStreak >= 5) unlockAchievement(profile, "STREAK_5");
      
      // COMBAT / SURVIVAL
      if (finalState.health === 1) unlockAchievement(profile, "LOW_HP_WIN");
      if (finalState.enemiesDefeated >= 50) unlockAchievement(profile, "MONSTER_SLAYER");
      if (finalState.sessionStats.healingDone < 10) unlockAchievement(profile, "MINIMAL_HEAL");
      if (finalState.sessionStats.retreatsUsed >= 5) unlockAchievement(profile, "MANY_RETREATS");
      if (finalState.roomIndex >= 13) unlockAchievement(profile, "DEEP_ROOMS");
      
      // WEAPON MASTERY
      if (finalState.sessionStats.weaponsEquipped >= 10) unlockAchievement(profile, "MANY_WEAPONS");
      const totalMonsters = finalState.enemiesDefeated;
      // Approximate check for weapon heavy (this is a bit tricky without full history, but we can use sessionStats)
      // Let's assume if they defeated many enemies and used weapons, they are weapon heavy.
      if (finalState.sessionStats.weaponsEquipped > 0 && finalState.enemiesDefeated > 20) {
         unlockAchievement(profile, "WEAPON_HEAVY");
      }
      
      // POTION / RESOURCE PLAY
      if (finalState.sessionStats.potionsUsed === 0) unlockAchievement(profile, "NO_POTIONS");
      if (finalState.sessionStats.potionsUsed >= 15) unlockAchievement(profile, "MANY_POTIONS");
      
      // FLEE / TACTICAL PLAY
      if (finalState.sessionStats.retreatsUsed === 0) unlockAchievement(profile, "NEVER_FLEE");
      
      // META
      if (profile.worldState.activeShifts.length >= 3) unlockAchievement(profile, "WORLD_SHIFT_ACTIVE");

      // DIFFICULTY
      switch (diff) {
        case 'normal':
          profile.unlocks.hard = true;
          unlockAchievement(profile, "FIRST_WIN");
          unlockAchievement(profile, "NORMAL_WIN");
          break;
        case 'hard':
          profile.unlocks.inferno = true;
          unlockAchievement(profile, "HARD_WIN");
          break;
        case 'inferno':
          unlockAchievement(profile, "INFERNO_WIN");
          if (profile.stats.inferno.wins >= GAME_RULES.INFERNO_WINS_FOR_GOD) {
            profile.unlocks.god = true;
          }
          if (profile.currentWinStreak >= 2) unlockAchievement(profile, "INFERNO_STREAK");
          break;
        case 'god':
          unlockAchievement(profile, "GOD_WIN");
          if (profile.stats.god.wins >= 3) unlockAchievement(profile, "REPEATED_GOD");
          
          const chronicle = ChronicleManager.createEntry(finalState, profile.nickname, profile.heroClass, profile.progression.paradoxUnlocked);
          chronicle.worldShifts = [...profile.worldState.activeShifts];
          
          if (!profile.eternalHall) profile.eternalHall = [];
          profile.eternalHall.unshift(chronicle);
          unlockAchievement(profile, "HALL_ENTRY");

          const classEternal = profile.eternalUnlocks[heroClass] || [];
          if (profile.stats.god.wins >= GAME_RULES.GOD_WINS_FOR_ETERNAL) {
            if (!classEternal.includes('standard')) {
              classEternal.push('standard');
              addToast(`Tier 3 Sbloccato per ${heroClass}!`, "success");
            }
          }
          profile.eternalUnlocks[heroClass] = classEternal;
          break;
        case 'question':
          unlockAchievement(profile, "QUESTION_WIN");
          break;
      }

      // SECRET
      if (finalState.enemiesDefeated === 42) unlockAchievement(profile, "SECRET_42");
      if (finalState.sessionStats.acesInRoom >= 3) unlockAchievement(profile, "WEIRD_LUCK");
      if (finalState.sessionStats.roomMonstersCount >= 4) unlockAchievement(profile, "FULL_ROOM_MONSTERS");
      if (finalState.sessionStats.noWeaponKills10Plus >= 1) unlockAchievement(profile, "EMPTY_HANDS");
      
      // WEAPON
      if (finalState.sessionStats.weaponsBroken >= 5) unlockAchievement(profile, "WEAPON_BREAK");
      if (finalState.sessionStats.lastDurabilityKill) unlockAchievement(profile, "LOW_DURABILITY");

    } else {
      profile.currentWinStreak = 0;
      unlockAchievement(profile, "FIRST_LOSS");
      if (diff === 'normal') {
        // Keep FIRST_LOSS_NORMAL for compatibility if needed, but we have FIRST_LOSS now
      }
      if (ChronicleManager.isSignificantFall(finalState)) {
        const chronicle = ChronicleManager.createEntry(finalState, profile.nickname, profile.heroClass, profile.progression.paradoxUnlocked);
        if (!profile.eternalHall) profile.eternalHall = [];
        profile.eternalHall.unshift(chronicle);
        addToast("Cronaca di una Caduta Memorabile registrata.", "warning");
        unlockAchievement(profile, "HALL_ENTRY");
      }
    }

    if (!profile.progression.paradoxUnlocked && profile.eternalHall.length === 42 && profile.eternalHall.every(e => e.difficulty === 'god' && e.status === 'won')) {
      profile.progression.paradoxUnlocked = true;
      addToast("Il paradosso si è manifestato...", "info");
      unlockAchievement(profile, "PARADOX_UNLOCKED");
    }

    profile.progression.tier = calculateProgressionTier(profile);
    profile.lastGame = {
      status: finalState.status, rooms: finalState.roomIndex, enemies: finalState.enemiesDefeated,
      duration: Math.floor((Date.now() - finalState.startTime) / 1000), timestamp: Date.now()
    };
    profile.currentGame = null;
    updateActiveProfile(profile);
  };

  const handleFlee = () => {
    if (!gameState.fugaDisponibile) return;
    let cost = DifficultyRules.getRetreatCost(gameState.difficulty);
    if (gameState.difficulty === 'question' && activeProfile?.worldState.activeShifts.some(s => s.effectId === 'flee_cost_plus')) {
      cost += 1;
    }

    if (gameState.health <= cost) { addToast("Salute troppo bassa per fuggire!", "error"); return; }

    setIsFleeing(true);
    setTimeout(() => {
      setGameState(prev => {
        const newDeck = [...prev.deck, ...prev.room];
        const nextRoom = newDeck.splice(0, 4);
        return {
          ...prev,
          health: prev.health - cost,
          room: nextRoom,
          deck: newDeck,
          fugaDisponibile: false,
          fugaUsataUltimaStanza: true,
          selectedCardId: null,
          sessionStats: { 
            ...prev.sessionStats, 
            damageTaken: prev.sessionStats.damageTaken + cost,
            retreatsUsed: prev.sessionStats.retreatsUsed + 1,
            minHealthReached: Math.min(prev.sessionStats.minHealthReached, prev.health - cost)
          }
        };
      });
      setIsFleeing(false);
    }, 600);
  };

  const applyAction = () => {
    const card = gameState.room.find(c => c.id === gameState.selectedCardId);
    if (!card) return;

    setGameState(prev => {
      const type = getCardType(card.suit);
      const isQuestion = prev.difficulty === 'question';
      const shifts = isQuestion ? (activeProfile?.worldState.activeShifts || []) : [];
      
      const dmgBonus = shifts.some(s => s.effectId === 'monster_dmg_plus') ? 1 : 0;
      const weaponBonus = shifts.some(s => s.effectId === 'weapon_val_plus') ? 1 : 0;
      const healBonus = shifts.some(s => s.effectId === 'potion_heal_plus') ? 2 : (shifts.some(s => s.effectId === 'potion_heal_minus') ? -2 : 0);

      const valueOffset = isQuestion ? (Math.floor(Math.random() * 3) - 1) : 0;
      let effectiveCardValue = Math.max(1, card.value + valueOffset);
      
      const weaponVal = (prev.equippedWeapon?.value || 0) + weaponBonus;
      let next = { ...prev, room: prev.room.filter(c => c.id !== card.id), selectedCardId: null };

      if (type === "monster") {
        if (!DifficultyRules.canAttack(effectiveCardValue, weaponVal, prev.difficulty)) return prev;
        let damage = DifficultyRules.calculateDamage(effectiveCardValue, weaponVal, prev.difficulty);
        if (damage > 0) damage += dmgBonus;
        
        next.health -= damage;
        next.enemiesDefeated++;
        next.sessionStats.enemiesDefeated++;
        next.sessionStats.damageTaken += damage;
        next.sessionStats.minHealthReached = Math.min(next.sessionStats.minHealthReached, next.health);

        if (isQuestion && shifts.some(s => s.effectId === 'regen_on_kill') && next.enemiesDefeated % 2 === 0) {
          next.health = Math.min(next.maxHealth, next.health + 1);
        }

        if (isQuestion && next.equippedWeapon) {
           const fragilityChance = shifts.some(s => s.effectId === 'weapon_fragile') ? 0.5 : 0.33;
           if (Math.random() < fragilityChance) {
             next.equippedWeapon = null;
             next.weaponDurability = null;
             next.sessionStats.weaponsBroken++;
             addToast("L'arma si è dissolta nel paradosso.", "warning");
           }
        } else if (prev.weaponDurability !== null && prev.equippedWeapon) {
          next.weaponDurability = prev.weaponDurability - 1;
          if (next.weaponDurability <= 0) { 
            next.equippedWeapon = null; 
            next.weaponDurability = null; 
            next.sessionStats.weaponsBroken++;
            next.sessionStats.lastDurabilityKill = true;
          } else {
            next.sessionStats.lastDurabilityKill = false;
          }
        } else if (!prev.equippedWeapon && effectiveCardValue >= 10) {
          next.sessionStats.noWeaponKills10Plus++;
        }
      } else if (type === "weapon") {
        next.equippedWeapon = card;
        next.weaponDurability = DifficultyRules.getMaxDurability(prev.difficulty);
        next.sessionStats.weaponsEquipped++;
      } else if (type === "potion") {
        let heal = Math.floor(effectiveCardValue * DifficultyRules.getHealMultiplier(prev.difficulty));
        heal = Math.max(0, heal + healBonus);
        next.health = Math.min(prev.maxHealth, prev.health + heal);
        next.sessionStats.healingDone += heal;
        next.sessionStats.potionsUsed++;
      }

      if (next.health <= 0) { next.status = "lost"; finalizeStats(next); return next; }
      if (next.deck.length === 0 && next.room.length === 0) { next.status = "won"; finalizeStats(next); return next; }

      if (next.room.length === 1 && next.deck.length > 0) {
        const deckCopy = [...next.deck];
        const newCards = deckCopy.splice(0, 3);
        next.room = [...next.room, ...newCards];
        next.deck = deckCopy;
        next.roomIndex++;
        next.fugaDisponibile = !next.fugaUsataUltimaStanza;
        next.fugaUsataUltimaStanza = false;

        // Track stats for achievements
        const monstersInRoom = next.room.filter(c => getCardType(c.suit) === 'monster').length;
        const acesInRoom = next.room.filter(c => c.rank === 'A').length;
        next.sessionStats.roomMonstersCount = Math.max(next.sessionStats.roomMonstersCount, monstersInRoom);
        next.sessionStats.acesInRoom = Math.max(next.sessionStats.acesInRoom, acesInRoom);

        if (next.health <= 5) {
          next.sessionStats.lowHPStreak++;
          next.sessionStats.maxLowHPStreak = Math.max(next.sessionStats.maxLowHPStreak, next.sessionStats.lowHPStreak);
        } else {
          next.sessionStats.lowHPStreak = 0;
        }

        if (next.roomIndex % 10 === 0 && next.difficulty !== 'god' && next.difficulty !== 'question' && activeProfile) {
           handleAutoSave(next);
        }
      }
      return next;
    });
  };

  const handleAutoSave = async (state: GameState) => {
    const save = await SaveManager.createSignedSave(state, activeProfile!.nickname);
    if (save) {
      const updatedSaves = { ...activeProfile!.saves };
      updatedSaves[state.difficulty][0] = save;
      updateActiveProfile({ saves: updatedSaves });
    }
  };

  const handleManualSave = async (slotIdx: number) => {
    const check = SaveManager.canSave(gameState);
    if (!check.allowed) { addToast(check.reason!, "error"); return; }
    const save = await SaveManager.createSignedSave(gameState, activeProfile!.nickname);
    if (save && activeProfile) {
      const updatedProfile = { ...activeProfile };
      const updatedSaves = { ...updatedProfile.saves };
      updatedSaves[gameState.difficulty][slotIdx] = save;
      updatedProfile.saves = updatedSaves;
      
      if (!updatedProfile.achievements["FIRST_SAVE"]) {
        updatedProfile.achievements["FIRST_SAVE"] = true;
        updatedProfile.abyssSigils = (updatedProfile.abyssSigils || 0) + SIGIL_REWARDS.common;
        addToast(`Achievement: Memoria del Sangue (+${SIGIL_REWARDS.common} Sigilli)`, "success");
      }
      
      updateActiveProfile(updatedProfile);
      addToast(`Slot ${slotIdx + 1} salvato`, "success");
    }
  };

  const handleLoadSave = async (save: SignedSave) => {
    const loadedState = await SaveManager.verifyAndLoadSave(save);
    if (loadedState && activeProfile) {
      setGameState(loadedState);
      setView('playing');
      setShowSave(false);
      
      const updatedProfile = { ...activeProfile };
      if (!updatedProfile.achievements["FIRST_LOAD"]) {
        updatedProfile.achievements["FIRST_LOAD"] = true;
        updatedProfile.abyssSigils = (updatedProfile.abyssSigils || 0) + SIGIL_REWARDS.common;
        updateActiveProfile(updatedProfile);
        addToast(`Achievement: Ritorno dall'Abisso (+${SIGIL_REWARDS.common} Sigilli)`, "success");
      } else {
        addToast("Salvataggio caricato.", "success");
      }
    } else {
      addToast("Integrità compromessa.", "error");
    }
  };

  const handleSelectVariant = (variantId: string | null) => {
    if (!activeProfile) return;
    const heroClass = activeProfile.heroClass;
    const selectedVariant = { ...activeProfile.selectedVariant };
    selectedVariant[heroClass] = variantId;
    updateActiveProfile({ selectedVariant });
    setShowVariants(false);
  };

  const handleImportChronicle = async (code: string) => {
    const entry = await ChronicleManager.verifyChronicle(code);
    if (entry && activeProfile) {
      const updatedProfile = { ...activeProfile };
      const newHall = [...updatedProfile.eternalHall];
      if (newHall.some(e => e.id === entry.id)) {
        addToast("Questa cronaca è già presente nell'archivio.", "info");
      } else {
        newHall.unshift(entry);
        updatedProfile.eternalHall = newHall;
        
        if (!updatedProfile.achievements["CHRONICLE_IMPORT"]) {
          updatedProfile.achievements["CHRONICLE_IMPORT"] = true;
          updatedProfile.abyssSigils = (updatedProfile.abyssSigils || 0) + SIGIL_REWARDS.common;
          addToast(`Achievement: Eco dal Passato (+${SIGIL_REWARDS.common} Sigilli)`, "success");
        }
        
        updateActiveProfile(updatedProfile);
        addToast("Cronaca importata con successo!", "success");
      }
    } else {
      addToast("Codice Cronaca non valido o corrotto.", "error");
    }
  };

  // 5️⃣ IMPORTAZIONE HALL – FUSIONE ORGANICA (B)
  const handleIntegrateWorldShifts = async (importedShifts: WorldShift[]) => {
    if (!activeProfile) return;
    const fused = await WorldShiftManager.fuseOrganicShifts(activeProfile.worldState.activeShifts, importedShifts);
    const signature = await WorldShiftManager.signWorldState(fused);
    updateActiveProfile({ worldState: { ...activeProfile.worldState, activeShifts: fused, signature } });
    addToast("Mondo Contaminato con successo.", "success");
  };

  const handleMarkParadoxSeen = () => {
    if (!activeProfile) return;
    updateActiveProfile({ progression: { ...activeProfile.progression, paradoxSeen: true } });
  };

  const currentEternalVariant = useMemo(() => {
    if (!activeProfile) return null;
    const variantId = activeProfile.selectedVariant[activeProfile.heroClass];
    return variantId ? ETERNAL_VARIANTS[variantId] : null;
  }, [activeProfile]);

  return (
    <div className={`h-dvh w-full flex flex-col relative bg-slate-950 text-slate-50 overflow-hidden ${gameState.difficulty === 'question' && activeProfile?.worldState.activeShifts.some(s => s.effectId === 'cosmetic_blue') ? 'cosmetic-blue' : ''}`}>
      <div className="cinematic-vignette" />
      <div className={`global-game-bg`} style={{ backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.95)), url('${getBackgroundByRoom(gameState.roomIndex)}')` }} />
      
      <div className="fixed top-20 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} kind={t.kind} />)}
      </div>

      {isBooting && activeProfile && (
        <BootSequence tier={activeProfile.progression.tier} onComplete={() => setIsBooting(false)} />
      )}

      {view === 'profile-selection' ? (
        <ProfileManagerUI profiles={profilesData.profiles} onSelect={handleSelectProfile} onCreate={handleCreateProfile} onDelete={(id) => setProfilesData(prev => {
          const newProfiles = { ...prev.profiles };
          delete newProfiles[id];
          return { ...prev, profiles: newProfiles, activeProfileId: prev.activeProfileId === id ? null : prev.activeProfileId };
        })} onImport={() => {}} onExport={() => {}} />
      ) : view === 'difficulty-selection' ? (
        <DifficultySelector activeProfile={activeProfile!} onSelect={startNewGame} onCancel={() => setView('main-menu')} />
      ) : view === 'main-menu' ? (
        <div className={`flex-1 flex flex-col items-center justify-start relative z-10 p-4 sm:p-6 text-center animate-in fade-in duration-700 overflow-y-auto ${isBooting ? 'invisible' : ''}`}>
           <div className="w-full max-w-4xl flex flex-col gap-3 sm:gap-5 lg:gap-6 my-auto py-4">
              {/* Profile & Action Buttons Section */}
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                 <div className="flex flex-col items-center">
                    <div className="relative group mb-2 sm:mb-3">
                      <img src={activeProfile?.avatar} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${activeProfile?.unlocks.god ? 'border-yellow-500 god-border-glow shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'border-slate-800'} shadow-2xl transition-all duration-500`} />
                      {currentEternalVariant && (
                        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-slate-950 border border-yellow-500/50 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-lg shadow-lg animate-bounce">
                          {currentEternalVariant.icon}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                       <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                         {activeProfile?.nickname}
                         {currentEternalVariant && <span className={`text-[8px] sm:text-[10px] font-black uppercase ${currentEternalVariant.color}`}>{currentEternalVariant.name}</span>}
                       </h2>
                       <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{activeProfile?.heroClass}</p>
                    </div>
                 </div>

                 <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    <button onClick={() => setShowRules(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-xl border border-white/5 transition-all text-[8px] sm:text-[9px] uppercase tracking-widest">Manuale</button>
                    <button onClick={() => setShowSave(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-900/40 hover:bg-blue-800 text-blue-400 font-bold rounded-xl border border-blue-500/20 transition-all text-[8px] sm:text-[9px] uppercase tracking-widest">Vault</button>
                    <button onClick={() => setShowHall(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-purple-900/40 hover:bg-purple-800 text-purple-400 font-bold rounded-xl border border-purple-500/20 transition-all text-[8px] sm:text-[9px] uppercase tracking-widest">Hall of Eternal</button>
                    {activeProfile && Object.values(activeProfile.eternalUnlocks).some((u: string[]) => u.length > 0) && (
                      <button onClick={() => setShowVariants(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-yellow-950/20 hover:bg-yellow-900 text-yellow-500 font-bold rounded-xl border border-yellow-500/20 transition-all text-[8px] sm:text-[9px] uppercase tracking-widest">Eternal Variants</button>
                    )}
                 </div>
              </div>

              {/* Chest Section */}
              <div className="flex justify-center">
                 <EvolutiveChest 
                   tier={activeProfile?.progression.tier || 0} 
                   onClick={() => setShowStats(true)} 
                 />
              </div>

              {/* Logo & Start Section */}
              <div className="flex flex-col items-center">
                 <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-red-600 uppercase tracking-tighter mb-3 sm:mb-4 drop-shadow-[0_10px_30px_rgba(220,38,38,0.3)] select-none">Scoundrel</h1>
                 
                 <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button onClick={() => setView('difficulty-selection')} className="py-3 sm:py-4 bg-red-600 text-white font-black rounded-2xl border-b-4 sm:border-b-8 border-red-950 active:translate-y-1 active:border-b-0 transition-all text-lg sm:text-xl uppercase italic shadow-xl shadow-red-900/20">Inizia Spedizione</button>
                    <button onClick={() => { setProfilesData(prev => ({ ...prev, activeProfileId: null })); setView('profile-selection'); }} className="py-2 text-slate-500 hover:text-slate-300 font-bold uppercase text-[8px] sm:text-[10px] tracking-widest transition-colors">Cambia Profilo</button>
                 </div>
              </div>
           </div>
        </div>
      ) : (gameState.status === 'playing') ? (
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto p-2 sm:p-4 relative z-10 overflow-hidden">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
             <button disabled={gameState.difficulty === 'god' || gameState.difficulty === 'question'} onClick={() => setShowSave(true)} className="px-3 py-1.5 bg-slate-800/80 rounded-xl text-[8px] uppercase font-black text-slate-400 hover:text-white border border-white/5 disabled:opacity-20">Menu Salvataggio</button>
             <button onClick={() => { if(window.confirm("Abbandonare?")) setView('main-menu'); }} className="px-3 py-1.5 bg-red-950/40 rounded-xl text-[8px] uppercase font-black text-red-400 hover:text-white border border-red-500/20">Abbandona</button>
          </div>
          <HUD state={gameState} eternalVariant={currentEternalVariant} worldShifts={activeProfile?.worldState.activeShifts || []} />
          <div className="flex-1 flex items-center justify-center min-h-0 py-2">
            <Room cards={gameState.room} selectedId={gameState.selectedCardId} onSelect={(id) => setGameState(p => ({...p, selectedCardId: id === p.selectedCardId ? null : id}))} isExiting={isFleeing} difficulty={gameState.difficulty} activeShifts={activeProfile?.worldState.activeShifts || []} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 hud-glass p-3 sm:p-6 rounded-[24px] sm:rounded-[32px] mt-auto">
             <ContextualActionButton state={gameState} onAction={applyAction} />
             <button disabled={!gameState.fugaDisponibile} onClick={handleFlee} className={`py-3 sm:py-5 font-black rounded-xl sm:rounded-2xl uppercase tracking-widest border-b-4 transition-all text-xs sm:text-base ${gameState.fugaDisponibile ? 'bg-slate-800 border-slate-900 text-white' : 'bg-slate-900 text-slate-700 border-slate-950 opacity-50'}`}>Fuggi</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 text-center animate-in zoom-in duration-500">
           <h2 className={`text-8xl font-black uppercase mb-6 ${gameState.status === 'won' ? 'text-emerald-500' : 'text-red-500'}`}>{gameState.status === 'won' ? "Trionfo!" : "Eroe Caduto"}</h2>
           <button onClick={() => setView('main-menu')} className="px-12 py-5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all uppercase tracking-widest text-lg">Menu Principale</button>
        </div>
      )}

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showStats && activeProfile && <StatsModal stats={{...activeProfile.stats.general, lastGame: activeProfile.lastGame}} onClose={() => setShowStats(false)} />}
      {showSave && activeProfile && (
        <SaveModal 
          activeProfile={activeProfile} 
          gameState={gameState} 
          onClose={() => setShowSave(false)} 
          onSave={handleManualSave} 
          onLoad={handleLoadSave} 
          onUnlockAltar={handleUnlockAltar}
        />
      )}
      {showVariants && activeProfile && (
        <VariantSelector heroClass={activeProfile.heroClass} unlockedVariants={activeProfile.eternalUnlocks[activeProfile.heroClass] || []} selectedVariantId={activeProfile.selectedVariant[activeProfile.heroClass]} onSelect={handleSelectVariant} onClose={() => setShowVariants(false)} />
      )}
      {showHall && activeProfile && (
        <HallOfEternal 
          chronicles={activeProfile.eternalHall || []} 
          worldShifts={activeProfile.worldState.activeShifts || []}
          isParadox={activeProfile.progression.paradoxUnlocked}
          paradoxSeen={activeProfile.progression.paradoxSeen}
          onMarkSeen={handleMarkParadoxSeen}
          onClose={() => setShowHall(false)} 
          onImport={handleImportChronicle}
          onIntegrateShifts={handleIntegrateWorldShifts}
        />
      )}
      {tutorialStep !== null && (
        <TutorialOverlay step={tutorialStep} onNext={() => setTutorialStep(s => s! + 1)} onComplete={() => setTutorialStep(null)} />
      )}
    </div>
  );
};

const ContextualActionButton: React.FC<{ state: GameState, onAction: () => void }> = ({ state, onAction }) => {
  const card = state.room.find(c => c.id === state.selectedCardId);
  const weaponVal = state.equippedWeapon?.value || 0;
  if (!card) return <button disabled className="py-5 bg-slate-900 text-slate-700 font-black rounded-2xl border-b-4 border-slate-950 uppercase tracking-widest opacity-50">Seleziona Bersaglio</button>;
  
  const type = getCardType(card.suit);
  const blocked = type === 'monster' && !DifficultyRules.canAttack(card.value, weaponVal, state.difficulty);
  return <button disabled={blocked} onClick={onAction} className={`py-3 sm:py-5 ${blocked ? 'bg-red-950/40 text-red-500' : 'bg-red-700 text-white'} border-red-950 font-black rounded-xl sm:rounded-2xl uppercase tracking-widest border-b-4 active:translate-y-1 transition-all text-xs sm:text-base`}>{blocked ? 'Troppo Forte' : 'Conferma Azione'}</button>;
};

export default App;
