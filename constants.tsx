
import { Card, Suit } from './types';

/**
 * ASSET VISIVI DEL DUNGEON
 * Una collezione di sfondi che variano per atmosfera.
 */
export const DUNGEON_BACKGROUNDS = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop", // Area 1: Dungeon Oscuro
  "https://images.unsplash.com/photo-1615672334841-844463300994?q=80&w=2070&auto=format&fit=crop", // Area 2: Cripta Alchemica
  "https://images.unsplash.com/photo-1519074063912-ad2d6d51dd27?q=80&w=1974&auto=format&fit=crop", // Area 3: Caverna di Ghiaccio
  "https://images.unsplash.com/photo-1505673542670-a5e3ff5b14a3?q=80&w=1974&auto=format&fit=crop"  // Area 4: Sala del Trono
];

/**
 * LOGICA DI PROGRESSIONE SFONDO
 * @param {number} index - L'indice attuale della stanza (roomIndex).
 * 
 * Implementazione Senior: 
 * Calcoliamo il 'settore' dividendo per 5. 
 * Esempio: 
 * Stanze 1-5 -> Settore 0 (Sfondo 1)
 * Stanze 6-10 -> Settore 1 (Sfondo 2)
 */
export const getBackgroundByRoom = (index: number): string => {
  // roomIndex parte da 1. Sottraiamo 1 per normalizzare a zero-based.
  const normalizedIndex = Math.max(0, index - 1);
  
  // Dividiamo per 5 e arrotondiamo (es: stanza 3 -> 3/5 = 0.6 -> settore 0)
  const sectorIndex = Math.floor(normalizedIndex / 5);
  
  // Usiamo il modulo per riciclare gli sfondi se il giocatore supera la stanza 20
  const bgIndex = sectorIndex % DUNGEON_BACKGROUNDS.length;
  
  return DUNGEON_BACKGROUNDS[bgIndex];
};

export const SUITS: Suit[] = ["Cuori", "Quadri", "Fiori", "Picche"];
export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

export const getCardValue = (rank: string): number => {
  switch (rank) {
    case "J": return 11;
    case "Q": return 12;
    case "K": return 13;
    case "A": return 14;
    default: return parseInt(rank);
  }
};

export const getCardType = (suit: Suit) => {
  if (suit === "Cuori") return "potion";
  if (suit === "Quadri") return "weapon";
  return "monster";
};

export const generatePixelArtSVG = (type: string, value: number): string => {
  const size = 16; 
  const pixels: { x: number, y: number, color: string }[] = [];
  const stringSeed = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (stringSeed + value) * 1337;
  const seededRandom = (s: number) => {
    const x = Math.sin(seed + s) * 10000;
    return x - Math.floor(x);
  };
  const drawPixel = (x: number, y: number, color: string) => {
    if (x >= 0 && x < size && y >= 0 && y < size) pixels.push({ x, y, color });
  };
  const drawSymmetric = (x: number, y: number, color: string) => {
    drawPixel(x, y, color);
    if (x !== 7 && x !== 8) drawPixel(size - 1 - x, y, color);
  };

  if (type === "monster") {
    const mainColor = value > 10 ? "#ef4444" : "#4338ca"; 
    const darkColor = value > 10 ? "#7f1d1d" : "#312e81";
    const eyeColor = "#ffffff";
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : y > 10 ? 3 : 5;
      for (let x = 8 - width; x <= 7; x++) {
        let color = (x + y) % 3 === 0 ? darkColor : mainColor;
        if (seededRandom(x * y) > 0.92) color = "#ffffff22"; 
        drawSymmetric(x, y, color);
      }
    }
    drawSymmetric(5, 7, eyeColor); 
    if (value > 6) drawSymmetric(4, 7, eyeColor);
  } else if (type === "weapon") {
    const bladeColor = "#cbd5e1";
    const hiltColor = "#d97706";
    const gemColor = value > 12 ? "#3b82f6" : "#b91c1c";
    const bladeHeight = value;
    const startY = Math.max(1, 12 - bladeHeight);
    for (let y = startY; y <= 11; y++) {
      drawPixel(7, y, bladeColor);
      drawPixel(8, y, "#64748b");
    }
    const guardWidth = value > 10 ? 3 : 2;
    for (let x = 8 - guardWidth; x <= 7 + guardWidth; x++) drawPixel(x, 12, hiltColor);
    drawPixel(7, 14, gemColor); 
  } else if (type === "potion") {
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    const fillHeight = Math.floor((value / 14) * 8) + 1;
    for (let y = 6; y <= 14; y++) {
      const w = y < 8 ? 2 : y > 12 ? 3 : 4;
      for (let x = 8 - w; x <= 7 + w; x++) {
        const isLiquid = y > (14 - fillHeight);
        drawPixel(x, y, isLiquid ? liqColor : "#1e293b");
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
      const isRedFigure = (suit === "Cuori" || suit === "Quadri") && ["J", "Q", "K", "A"].includes(rank);
      if (!isRedFigure) {
        deck.push({
          id: `${suit}-${rank}-${Math.random().toString(36).substr(2, 9)}`,
          suit,
          rank,
          value: getCardValue(rank)
        });
      }
    });
  });
  return shuffle(deck);
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const getSuitIcon = (suit: Suit) => {
  switch (suit) {
    case "Cuori": return "♥️";
    case "Quadri": return "♦️";
    case "Fiori": return "♣️";
    case "Picche": return "♠️";
  }
};
