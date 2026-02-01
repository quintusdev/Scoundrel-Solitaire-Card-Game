
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

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      // Regola: Rimuovere J/Q/K/A rossi
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
