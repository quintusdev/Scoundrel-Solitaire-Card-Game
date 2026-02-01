
import React from 'react';
import { Card as CardType } from '../types';
import { getSuitIcon, getCardType, generatePixelArtSVG } from '../constants';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  animationDelay?: string;
  isExiting?: boolean;
}

const Card: React.FC<CardProps> = ({ card, isSelected, onClick, animationDelay, isExiting }) => {
  const isRed = card.suit === "Cuori" || card.suit === "Quadri";
  const type = getCardType(card.suit);
  const typeLabel = type === "potion" ? "Pozione" : type === "weapon" ? "Arma" : "Mostro";
  
  // Calcolo Rarity Glow
  const getRarityClass = () => {
    if (card.value >= 13) return "glow-strong";
    if (card.value >= 10) return "glow-medium";
    if (card.value >= 6) return "glow-soft";
    return "";
  };

  const getPowerIndicators = () => {
    const count = card.value <= 5 ? 1 : card.value <= 9 ? 2 : card.value <= 12 ? 3 : 4;
    const symbol = type === "monster" ? "💀" : type === "weapon" ? "⚔️" : "✨";
    return Array(count).fill(symbol).join("");
  };

  const pixelArt = generatePixelArtSVG(type, card.value);

  return (
    <div 
      onClick={onClick}
      style={{ animationDelay }}
      className={`
        relative w-full aspect-[2/3] max-w-[180px] rounded-2xl cursor-pointer 
        transition-all duration-300 transform border-2 
        ${isExiting ? 'card-exit-flee' : 'card-animate'}
        card-${type} ${getRarityClass()}
        ${isSelected ? 'card-selected z-20 scale-105' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}
        flex flex-col items-center justify-between p-4 select-none overflow-hidden
      `}
    >
      {/* Top Corner Info */}
      <div className={`card-corner w-full flex justify-between font-black text-xl ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>
      
      {/* Central Pixel Art */}
      <div 
        className="card-art" 
        dangerouslySetInnerHTML={{ __html: pixelArt }} 
      />

      {/* Power Indicators & Value */}
      <div className="flex flex-col items-center text-center z-10">
        <div className="text-[8px] mb-1 opacity-80 tracking-widest text-white/50">
          {getPowerIndicators()}
        </div>
        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-0.5">{typeLabel}</span>
        <span className={`text-4xl font-black ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
          {card.value}
        </span>
      </div>

      {/* Bottom Corner Info (Inverted) */}
      <div className={`card-corner w-full flex justify-between font-black text-xl rotate-180 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>

      {/* Overlay Background Pattern per tipo */}
      <div className={`absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]`} />
    </div>
  );
};

export default Card;
