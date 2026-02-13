
import { Card, Suit, Difficulty } from './types';

export const GAME_RULES = {
  INITIAL_HEALTH: 20,
  CARDS_PER_ROOM: 4,
  PROFILES_KEY: "scoundrel_meta_v3",
  VERSION: "1.3",
  INFERNO_WINS_FOR_GOD: 3,
  GOD_WINS_FOR_ETERNAL: 3,
};

export interface ChestConfig {
  icon: string;
  label: string;
  glowClass: string;
  particleColor: string;
  animation: string;
  description: string;
}

export const CHEST_VISUALS: Record<number, ChestConfig> = {
  0: {
    icon: "📦",
    label: "Cassa di Legno",
    glowClass: "border-slate-800 shadow-none",
    particleColor: "transparent",
    animation: "animate-none",
    description: "Un umile baule per un nuovo avventuriero."
  },
  1: {
    icon: "🧳",
    label: "Baule di Ferro",
    glowClass: "border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    particleColor: "#3b82f6",
    animation: "chest-pulse-iron",
    description: "Il metallo protegge i primi successi."
  },
  2: {
    icon: "💰",
    label: "Scrigno Dorato",
    glowClass: "border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.4)]",
    particleColor: "#eab308",
    animation: "chest-pulse-gold",
    description: "Splendente di gloria e vittorie infernali."
  },
  3: {
    icon: "💎",
    label: "Forziere Eterno",
    glowClass: "border-cyan-400 god-border-glow shadow-[0_0_40px_rgba(34,211,238,0.6)]",
    particleColor: "#22d3ee",
    animation: "chest-pulse-eternal",
    description: "Un manufatto divino forgiato nell'Abisso."
  }
};

export interface EternalVariant {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const ETERNAL_VARIANTS: Record<string, EternalVariant> = {
  standard: {
    id: 'standard',
    name: 'Eterno',
    icon: '✨',
    description: 'Completate 3 spedizioni in modalità GOD.',
    color: 'text-yellow-400'
  },
  flawless: {
    id: 'flawless',
    name: 'Immacolato',
    icon: '🛡️',
    description: 'Vittoria GOD senza mai scendere sotto il 50% HP.',
    color: 'text-cyan-400'
  },
  no_potion: {
    id: 'no_potion',
    name: 'Ascetico',
    icon: '🧪',
    description: 'Vittoria GOD senza utilizzare pozioni.',
    color: 'text-purple-400'
  },
  no_retreat: {
    id: 'no_retreat',
    name: 'Incrollabile',
    icon: '🚩',
    description: 'Vittoria GOD senza mai fuggire.',
    color: 'text-red-500'
  }
};

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
    description: "Danno standard Scoundrel. Salute persistente."
  },
  hard: { 
    label: "Hardcore", 
    color: "text-orange-500", 
    bgClass: "bg-orange-500/10 border-orange-500/20",
    description: "Se Arma < Mostro, subisci danno pieno."
  },
  inferno: { 
    label: "Inferno", 
    color: "text-red-500", 
    bgClass: "bg-red-500/10 border-red-500/20 animate-pulse-slow",
    description: "Arma limitata (3 usi). Blocco attacco se deboli."
  },
  god: { 
    label: "GOD MODE", 
    color: "text-yellow-400", 
    bgClass: "god-card-bg border-yellow-500/50",
    description: "Ironman Run. Nessun salvataggio. Arma 2 usi. Cure -75%."
  }
};

export const ACHIEVEMENTS: Record<string, { name: string, desc: string, icon: string, rarity: 'common' | 'rare' | 'epic' | 'god' }> = {
  "FIRST_WIN": { name: "Battesimo del Sangue", desc: "Vinci la tua prima partita.", icon: "🩸", rarity: 'common' },
  "HARD_WIN": { name: "Veterano", desc: "Vinci in modalità Hard.", icon: "⚔️", rarity: 'rare' },
  "INFERNO_WIN": { name: "Eroe Infernale", desc: "Vinci in modalità Inferno.", icon: "🔥", rarity: 'epic' },
  "ABYSS_LORD": { name: "Signore dell'Abisso", desc: "Vinci 3 volte in modalità Inferno.", icon: "🔱", rarity: 'god' },
  "GOD_WIN": { name: "Ascendente", desc: "Completa la modalità GOD.", icon: "👑", rarity: 'god' },
  "ETERNAL_ASCENSION": { name: "Ascensione Eterna", desc: "Sblocca il Tier 3 Eternal per una classe.", icon: "✨", rarity: 'god' }
};

export const HERO_CLASSES = ["Guerriero", "Ladro", "Mago", "Paladino"];
export const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Casper",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo"
];

export const isRedSuit = (suit: Suit) => suit === "Cuori" || suit === "Quadri";
export const getBackgroundByRoom = (index: number): string => "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop";
export const SUITS: Suit[] = ["Cuori", "Quadri", "Fiori", "Picche"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const getCardValue = (rank: string): number => {
  const values: Record<string, number> = { "J": 11, "Q": 12, "K": 13, "A": 14 };
  return values[rank] || parseInt(rank);
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

export const getCardType = (suit: Suit) => {
  if (suit === "Cuori") return "potion";
  if (suit === "Quadri") return "weapon";
  return "monster";
};

export const generatePixelArtSVG = (type: string, value: number, isBroken: boolean = false): string => {
  const size = 16; 
  const pixels: { x: number, y: number, color: string }[] = [];
  const addPixel = (x: number, y: number, color: string) => pixels.push({ x, y, color });
  const addSymmetric = (x: number, y: number, color: string) => {
    addPixel(x, y, color);
    if (x !== 7 && x !== 8) addPixel(size - 1 - x, y, color);
  };

  if (type === "monster") {
    const mainColor = value > 10 ? "#ef4444" : "#4338ca"; 
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : 4;
      for (let x = 8 - width; x <= 7; x++) addSymmetric(x, y, mainColor);
    }
  } else if (type === "weapon") {
    const bladeColor = isBroken ? "#475569" : "#cbd5e1";
    for (let y = 2; y <= 11; y++) addPixel(7, y, bladeColor);
    for (let x = 6; x <= 9; x++) addPixel(x, 12, "#d97706");
  } else if (type === "potion") {
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    for (let y = 6; y <= 14; y++) {
       for (let x = 6; x <= 9; x++) addPixel(x, y, liqColor);
    }
  }

  const rects = pixels.map(p => `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" />`).join("");
  return `<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${rects}</svg>`;
};
