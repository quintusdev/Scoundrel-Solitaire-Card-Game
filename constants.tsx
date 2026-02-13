
import { Card, Suit } from './types';

export const GAME_RULES = {
  INITIAL_HEALTH: 20,
  CARDS_PER_ROOM: 4,
  STATS_KEY: "scoundrel_react_stats_v1"
};

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

// Refactoring: helper esterni per evitare ri-creazione in loop
const seededRandom = (seed: number, s: number) => {
  const x = Math.sin(seed + s) * 10000;
  return x - Math.floor(x);
};

export const generatePixelArtSVG = (type: string, value: number): string => {
  const size = 16; 
  const pixels: { x: number, y: number, color: string }[] = [];
  const stringSeed = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (stringSeed + value) * 1337;

  const drawSymmetric = (x: number, y: number, color: string) => {
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
        if (seededRandom(seed, x * y) > 0.92) color = "#ffffff22"; 
        drawSymmetric(x, y, color);
      }
    }
    drawSymmetric(5, 7, "#ffffff"); 
    if (value > 6) drawSymmetric(4, 7, "#ffffff");
  } else if (type === "weapon") {
    const bladeHeight = value;
    const startY = Math.max(1, 12 - bladeHeight);
    for (let y = startY; y <= 11; y++) {
      pixels.push({ x: 7, y, color: "#cbd5e1" });
      pixels.push({ x: 8, y, color: "#64748b" });
    }
    const guardWidth = value > 10 ? 3 : 2;
    const hiltColor = "#d97706";
    for (let x = 8 - guardWidth; x <= 7 + guardWidth; x++) pixels.push({ x, y: 12, color: hiltColor });
    pixels.push({ x: 7, y: 14, color: value > 12 ? "#3b82f6" : "#b91c1c" }); 
  } else if (type === "potion") {
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    const fillHeight = Math.floor((value / 14) * 8) + 1;
    for (let y = 6; y <= 14; y++) {
      const w = y < 8 ? 2 : y > 12 ? 3 : 4;
      for (let x = 8 - w; x <= 7 + w; x++) {
        const isLiquid = y > (14 - fillHeight);
        pixels.push({ x, y, color: isLiquid ? liqColor : "#1e293b" });
      }
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
