
import { Card, Suit, Difficulty } from './types';

export const GAME_RULES = {
  INITIAL_HEALTH: 20,
  CARDS_PER_ROOM: 4,
  PROFILES_KEY: "scoundrel_meta_v2",
  VERSION: "1.2",
};

// Centralized Gameplay Engine Rules
export const DifficultyRules = {
  canAttack: (monsterVal: number, weaponVal: number, diff: Difficulty): boolean => {
    if (diff === 'inferno' || diff === 'god') {
      return weaponVal >= monsterVal;
    }
    return true;
  },
  
  calculateDamage: (monsterVal: number, weaponVal: number, diff: Difficulty): number => {
    if (diff === 'normal') {
      return Math.max(0, monsterVal - weaponVal);
    }
    if (diff === 'hard' || diff === 'inferno' || diff === 'god') {
      return weaponVal >= monsterVal ? 0 : monsterVal;
    }
    return monsterVal;
  },

  getHealMultiplier: (diff: Difficulty): number => {
    const multipliers = { normal: 1, hard: 1, inferno: 0.5, god: 0.25 };
    return multipliers[diff];
  },

  getMaxDurability: (diff: Difficulty): number | null => {
    if (diff === 'inferno') return 3;
    if (diff === 'god') return 2;
    return null;
  },

  getRetreatCost: (diff: Difficulty): number => {
    if (diff === 'god') return 2;
    if (diff === 'inferno') return 1;
    return 0;
  }
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { 
  label: string, 
  color: string, 
  bgClass: string,
  description: string,
}> = {
  normal: { 
    label: "Normale", 
    color: "text-blue-400", 
    bgClass: "bg-blue-500/10 border-blue-500/20",
    description: "Danno = Max(0, Mostro - Arma). Standard Scoundrel."
  },
  hard: { 
    label: "Hardcore", 
    color: "text-orange-500", 
    bgClass: "bg-orange-500/10 border-orange-500/20",
    description: "Se Arma < Mostro: subisci danno pieno dal mostro."
  },
  inferno: { 
    label: "Inferno", 
    color: "text-red-500", 
    bgClass: "bg-red-500/10 border-red-500/20 animate-pulse-slow",
    description: "Blocco attacco se deboli. Arma si rompe (3 usi). Cure -50%."
  },
  god: { 
    label: "GOD MODE", 
    color: "text-yellow-400", 
    bgClass: "god-card-bg border-yellow-500/50",
    description: "Sfida finale. Arma dura 2 colpi. Cure -75%. Costo fuga: 2 HP."
  }
};

export const ACHIEVEMENTS: Record<string, { name: string, desc: string, icon: string, rarity: 'common' | 'rare' | 'epic' | 'god' }> = {
  "FIRST_WIN": { name: "Battesimo del Sangue", desc: "Vinci la tua prima partita.", icon: "🩸", rarity: 'common' },
  "HARD_WIN": { name: "Veterano", desc: "Vinci in modalità Hard.", icon: "⚔️", rarity: 'rare' },
  "INFERNO_WIN": { name: "Eroe Infernale", desc: "Vinci in modalità Inferno.", icon: "🔥", rarity: 'epic' },
  "GOD_WIN": { name: "Divinità del Dungeon", desc: "Completa la modalità GOD.", icon: "👑", rarity: 'god' },
  "NO_WEAPON": { name: "Pugni d'Acciaio", desc: "Vinci senza mai equipaggiare un'arma.", icon: "👊", rarity: 'epic' },
  "BERSERKER": { name: "Furia Cieca", desc: "Vinci con solo 1 HP rimanente.", icon: "💢", rarity: 'rare' }
};

export const HERO_CLASSES = ["Guerriero", "Ladro", "Mago", "Paladino"];
export const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Casper",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo"
];

export const DUNGEON_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615672334841-844463300994?q=80&w=2070&auto=format&fit=crop"
];

export const isRedSuit = (suit: Suit) => suit === "Cuori" || suit === "Quadri";
export const getBackgroundByRoom = (index: number): string => DUNGEON_BACKGROUNDS[Math.floor(index / 5) % DUNGEON_BACKGROUNDS.length];
export const SUITS: Suit[] = ["Cuori", "Quadri", "Fiori", "Picche"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const getCardValue = (rank: string): number => {
  const values: Record<string, number> = { "J": 11, "Q": 12, "K": 13, "A": 14 };
  return values[rank] || parseInt(rank);
};

export const getCardType = (suit: Suit) => {
  if (suit === "Cuori") return "potion";
  if (suit === "Quadri") return "weapon";
  return "monster";
};

export const generatePixelArtSVG = (type: string, value: number, isBroken: boolean = false): string => {
  const size = 16; 
  const pixels: { x: number, y: number, color: string }[] = [];
  const seed = (type.length + value) * 1337;
  const seededRandom = (s: number) => {
    const x = Math.sin(seed + s) * 10000;
    return x - Math.floor(x);
  };

  const drawSymmetric = (x: number, y: number, color: string) => {
    if (isBroken && seededRandom(x * y) > 0.75) return;
    pixels.push({ x, y, color });
    if (x !== 7 && x !== 8) pixels.push({ x: size - 1 - x, y, color });
  };

  if (type === "monster") {
    const mainColor = value > 10 ? "#ef4444" : "#4338ca"; 
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : 4;
      for (let x = 8 - width; x <= 7; x++) drawSymmetric(x, y, mainColor);
    }
  } else if (type === "weapon") {
    const bladeColor = isBroken ? "#475569" : "#cbd5e1";
    for (let y = 2; y <= 11; y++) pixels.push({ x: 7, y, color: bladeColor });
    for (let x = 6; x <= 9; x++) pixels.push({ x, y: 12, color: "#d97706" });
  } else if (type === "potion") {
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    for (let y = 8; y <= 14; y++) {
       for (let x = 6; x <= 9; x++) pixels.push({ x, y, color: liqColor });
    }
  }

  const rects = pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" />`).join("");
  return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      if (!isRedSuit(suit) || !["J", "Q", "K", "A"].includes(rank)) {
        deck.push({
          id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
          suit, rank, value: getCardValue(rank)
        });
      }
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export const getSuitIcon = (suit: Suit) => {
  const icons = { "Cuori": "♥️", "Quadri": "♦️", "Fiori": "♣️", "Picche": "♠️" };
  return icons[suit];
};
