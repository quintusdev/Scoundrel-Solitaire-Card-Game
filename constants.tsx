
import { Card, Suit } from './types';

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

/**
 * Genera un SVG Pixel Art deterministico basato su tipo e valore.
 * Griglia 16x16
 */
export const generatePixelArtSVG = (type: string, value: number): string => {
  const size = 16;
  const pixels: { x: number, y: number, color: string }[] = [];
  
  const drawPixel = (x: number, y: number, color: string) => {
    // Disegna speculare se necessario per i mostri per simmetria
    pixels.push({ x, y, color });
  };

  const drawSymmetric = (x: number, y: number, color: string) => {
    drawPixel(x, y, color);
    if (x !== 7 && x !== 8) {
      drawPixel(size - 1 - x, y, color);
    }
  };

  if (type === "monster") {
    const mainColor = value > 10 ? "#ef4444" : "#4338ca";
    const darkColor = value > 10 ? "#7f1d1d" : "#312e81";
    const eyeColor = "#ffffff";

    // Silhouette Base (Teschio/Corpo)
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : y > 10 ? 3 : 5;
      for (let x = 8 - width; x <= 7; x++) {
        drawSymmetric(x, y, (x + y) % 3 === 0 ? darkColor : mainColor);
      }
    }

    // Occhi
    drawSymmetric(5, 7, eyeColor);
    if (value > 6) drawSymmetric(4, 7, eyeColor);
    
    // Corna (si evolvono col valore)
    if (value > 5) {
      drawSymmetric(3, 3, darkColor);
      drawSymmetric(3, 4, mainColor);
    }
    if (value > 10) {
      drawSymmetric(2, 2, "#facc15");
      drawSymmetric(4, 3, darkColor);
    }
    
    // Denti/Bocca
    if (value > 8) {
      drawSymmetric(5, 11, eyeColor);
      drawSymmetric(7, 11, eyeColor);
    }

  } else if (type === "weapon") {
    const bladeColor = "#cbd5e1";
    const darkBlade = "#64748b";
    const hiltColor = "#d97706";
    const gemColor = value > 12 ? "#3b82f6" : "#b91c1c";

    // Lama (si allunga col valore)
    const bladeHeight = value; // Da 2 a 14
    const startY = Math.max(1, 12 - bladeHeight);
    for (let y = startY; y <= 11; y++) {
      drawPixel(7, y, bladeColor);
      drawPixel(8, y, darkBlade);
    }
    // Punta
    drawPixel(7, startY - 1, bladeColor);

    // Guardia (elsa)
    const guardWidth = value > 10 ? 3 : 2;
    for (let x = 8 - guardWidth; x <= 7 + guardWidth; x++) {
      drawPixel(x, 12, hiltColor);
    }

    // Impugnatura
    drawPixel(7, 13, "#451a03");
    drawPixel(8, 13, "#451a03");
    
    // Pomolo/Gemma
    drawPixel(7, 14, gemColor);
    drawPixel(8, 14, gemColor);

  } else if (type === "potion") {
    const glassColor = "#93c5fd";
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    const liqDark = value > 10 ? "#9d174d" : "#064e3b";

    // Forma Ampolla
    const isSquare = value % 2 === 0;
    const fillHeight = Math.floor((value / 14) * 8) + 1;

    for (let y = 6; y <= 14; y++) {
      const w = isSquare ? 4 : (y < 8 ? 2 : y > 12 ? 3 : 5);
      for (let x = 8 - w; x <= 7 + w; x++) {
        const isLiquid = y > (14 - fillHeight);
        const isEdge = x === 8 - w || x === 7 + w || y === 14;
        
        let color = isEdge ? glassColor : (isLiquid ? liqColor : "#1e293b");
        if (isLiquid && (x + y) % 4 === 0) color = liqDark;
        drawPixel(x, y, color);
      }
    }

    // Collo
    for (let y = 3; y <= 5; y++) {
      drawPixel(7, y, glassColor);
      drawPixel(8, y, glassColor);
    }
    // Tappo
    drawPixel(7, 2, "#78350f");
    drawPixel(8, 2, "#78350f");
    
    // Bollicine per valori alti
    if (value > 9) {
      drawPixel(5, 4, liqColor);
      drawPixel(10, 3, liqColor);
    }
  }

  const rects = pixels.map(p => 
    `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" />`
  ).join("");

  return `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      ${rects}
    </svg>
  `;
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
