
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
 * Include artefatti glitch e rumore basati su un seed.
 */
export const generatePixelArtSVG = (type: string, value: number): string => {
  const size = 16;
  const pixels: { x: number, y: number, color: string }[] = [];
  
  // Seed deterministico basato su tipo e valore
  const stringSeed = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (stringSeed + value) * 1337;

  const seededRandom = (s: number) => {
    const x = Math.sin(seed + s) * 10000;
    return x - Math.floor(x);
  };

  const drawPixel = (x: number, y: number, color: string) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      pixels.push({ x, y, color });
    }
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

    // Silhouette Base
    for (let y = 4; y <= 12; y++) {
      let width = y < 6 ? 2 : y > 10 ? 3 : 5;
      for (let x = 8 - width; x <= 7; x++) {
        // Aggiunta di rumore nella texture del mostro
        let color = (x + y) % 3 === 0 ? darkColor : mainColor;
        if (seededRandom(x * y) > 0.92) color = "#ffffff22"; // Sottile glitch di texture
        drawSymmetric(x, y, color);
      }
    }

    // Occhi
    drawSymmetric(5, 7, eyeColor);
    if (value > 6) drawSymmetric(4, 7, eyeColor);
    
    // Corna
    if (value > 5) {
      drawSymmetric(3, 3, darkColor);
      drawSymmetric(3, 4, mainColor);
    }
    if (value > 10) {
      drawSymmetric(2, 2, "#facc15");
      drawSymmetric(4, 3, darkColor);
    }
    
    // Denti
    if (value > 8) {
      drawSymmetric(5, 11, eyeColor);
      drawSymmetric(7, 11, eyeColor);
    }

  } else if (type === "weapon") {
    const bladeColor = "#cbd5e1";
    const darkBlade = "#64748b";
    const hiltColor = "#d97706";
    const gemColor = value > 12 ? "#3b82f6" : "#b91c1c";

    const bladeHeight = value;
    const startY = Math.max(1, 12 - bladeHeight);
    for (let y = startY; y <= 11; y++) {
      let bCol = bladeColor;
      if (seededRandom(y) > 0.85) bCol = "#ffffff"; // Glitch di riflesso sulla lama
      drawPixel(7, y, bCol);
      drawPixel(8, y, darkBlade);
    }
    drawPixel(7, startY - 1, bladeColor);

    const guardWidth = value > 10 ? 3 : 2;
    for (let x = 8 - guardWidth; x <= 7 + guardWidth; x++) {
      drawPixel(x, 12, hiltColor);
    }

    drawPixel(7, 13, "#451a03");
    drawPixel(8, 13, "#451a03");
    
    drawPixel(7, 14, gemColor);
    drawPixel(8, 14, gemColor);

  } else if (type === "potion") {
    const glassColor = "#93c5fd";
    const liqColor = value > 10 ? "#ec4899" : "#10b981";
    const liqDark = value > 10 ? "#9d174d" : "#064e3b";

    const isSquare = value % 2 === 0;
    const fillHeight = Math.floor((value / 14) * 8) + 1;

    for (let y = 6; y <= 14; y++) {
      const w = isSquare ? 4 : (y < 8 ? 2 : y > 12 ? 3 : 5);
      for (let x = 8 - w; x <= 7 + w; x++) {
        const isLiquid = y > (14 - fillHeight);
        const isEdge = x === 8 - w || x === 7 + w || y === 14;
        
        let color = isEdge ? glassColor : (isLiquid ? liqColor : "#1e293b");
        if (isLiquid && (x + y) % 4 === 0) color = liqDark;
        
        // Glitch di effervescenza per pozioni forti
        if (isLiquid && value > 9 && seededRandom(x + y * 10) > 0.9) color = "#ffffff";
        
        drawPixel(x, y, color);
      }
    }

    for (let y = 3; y <= 5; y++) {
      drawPixel(7, y, glassColor);
      drawPixel(8, y, glassColor);
    }
    drawPixel(7, 2, "#78350f");
    drawPixel(8, 2, "#78350f");
  }

  // --- AGGIUNTA ARTEFATTI VISIVI (GLITCH / RUMORE) ---
  const artifactCount = 2 + Math.floor(value / 3);
  for (let i = 0; i < artifactCount; i++) {
    const rX = Math.floor(seededRandom(i * 100) * 16);
    const rY = Math.floor(seededRandom(i * 200) * 16);
    
    // Non disegnare glitch sopra il centro se possibile, per mantenere leggibilità
    const isNearCenter = rX >= 6 && rX <= 9 && rY >= 4 && rY <= 12;
    
    if (!isNearCenter || seededRandom(i * 50) > 0.7) {
      const glitchColors = ["#ffffff11", "#ff000022", "#00ff0011", "#0000ff11"];
      const colorIdx = Math.floor(seededRandom(i * 300) * glitchColors.length);
      drawPixel(rX, rY, glitchColors[colorIdx]);
      
      // Linee di scansione glitch orizzontali casuali
      if (seededRandom(i * 400) > 0.9) {
        for (let lx = 0; lx < 4; lx++) {
          drawPixel(rX + lx, rY, "#ffffff08");
        }
      }
    }
  }

  const rects = pixels.map(p => 
    `<rect x="${p.x}" y="${p.y}" width="1" height="1" fill="${p.color}" />`
  ).join("");

  return `
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
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
