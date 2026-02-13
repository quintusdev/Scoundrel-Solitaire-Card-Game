
import { Card, Suit, Difficulty, Achievement } from './types';

export const GAME_RULES = {
  INITIAL_HEALTH: 20,
  CARDS_PER_ROOM: 4,
  PROFILES_KEY: "scoundrel_meta_v1",
  VERSION: "1.1",
  INFERNO_DURABILITY: 3
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { 
  label: string, 
  color: string, 
  description: string,
  healMultiplier: number
}> = {
  normal: { 
    label: "Normale", 
    color: "text-blue-400", 
    description: "Danno = Max(0, Mostro - Arma).",
    healMultiplier: 1.0
  },
  hard: { 
    label: "Hardcore", 
    color: "text-orange-500", 
    description: "Se Mostro > Arma: subisci danno PIENO dal mostro.",
    healMultiplier: 1.0
  },
  inferno: { 
    label: "Inferno", 
    color: "text-red-500 animate-pulse", 
    description: "Impossibile attaccare mostri più forti dell'arma. Durabilità arma limitata (3 usi). Cure -50%.",
    healMultiplier: 0.5
  }
};

export const ACHIEVEMENTS: Record<string, { name: string, desc: string, icon: string }> = {
  "FIRST_WIN": { name: "Battesimo del Sangue", desc: "Vinci la tua prima partita.", icon: "🩸" },
  "HARD_WIN": { name: "Veterano", desc: "Vinci in modalità Hard.", icon: "⚔️" },
  "INFERNO_WIN": { name: "Eroe Infernale", desc: "Vinci in modalità Inferno.", icon: "🔥" },
  "NO_WEAPON": { name: "Pugni d'Acciaio", desc: "Vinci senza mai equipaggiare un'arma.", icon: "👊" },
  "BERSERKER": { name: "Furia Cieca", desc: "Vinci con solo 1 HP rimanente.", icon: "💢" }
};

export const HERO_CLASSES = ["Guerriero", "Ladro", "Mago", "Paladino"];

export const AVATARS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Casper",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sassy",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Toby",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Luna",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Oscar",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pepper"
];

export const DUNGEON_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615672334841-844463300994?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519074063912-ad2d6d51dd27?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505673542670-a5e3ff5b14a3?q=80&w=1974&auto=format&fit=crop"
];

export const isRedSuit = (suit: Suit) => suit === "Cuori" || suit === "Quadri";

export const getBackgroundByRoom = (index: number): string => {
  const normalizedIndex = Math.max(0, index - 1);
  const sectorIndex = Math.floor(normalizedIndex / 5);
  return DUNGEON_BACKGROUNDS[sectorIndex % DUNGEON_BACKGROUNDS.length];
};

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

const seededRandom = (seed: number, s: number) => {
  const x = Math.sin(seed + s) * 10000;
  return x - Math.floor(x);
};

export const generatePixelArtSVG = (type: string, value: number, isBroken: boolean = false): string => {
  const size = 16; 
  const pixels: { x: number, y: number, color: string }[] = [];
  const stringSeed = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (stringSeed + value) * 1337;

  const drawSymmetric = (x: number, y: number, color: string) => {
    if (isBroken && seededRandom(seed, x * y) > 0.7) return; // Effetto crepa
    pixels.push({ x, y, color });
    if (x !== 7 && x !== 8) pixels.push({ x: size - 1 - x, y, color });
  };

  if (type === "monster") {
    const isBoss = value > 10;
    const mainColor = isBoss ? "#ef4444" : "#4338ca"; 
    const darkColor = isBoss ? "#7f1d1d" : "#312e81";
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : y > 10 ? 3 : 5;
      for (let x = 8 - width; x <= 7; x++) {
        let color = (x + y) % 3 === 0 ? darkColor : mainColor;
        drawSymmetric(x, y, color);
      }
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
          suit,
          rank,
          value: getCardValue(rank)
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
