
import React from 'react';
import { Card as CardType } from '../types';
import { getSuitIcon } from '../constants';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  animationDelay?: string;
}

const Card: React.FC<CardProps> = ({ card, isSelected, onClick, animationDelay }) => {
  const isRed = card.suit === "Cuori" || card.suit === "Quadri";
  const typeLabel = card.suit === "Cuori" ? "Pozione" : card.suit === "Quadri" ? "Arma" : "Mostro";

  return (
    <div 
      onClick={onClick}
      style={{ animationDelay }}
      className={`
        relative w-full aspect-[2/3] max-w-[180px] rounded-2xl cursor-pointer 
        transition-all duration-300 transform border-2 card-animate
        ${isSelected ? 'card-selected z-10' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}
        flex flex-col items-center justify-between p-4 select-none
      `}
    >
      {/* Top Corner Info */}
      <div className={`w-full flex justify-between font-black text-xl ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>
      
      {/* Center Art/Icon */}
      <div className="flex flex-col items-center text-center">
        <span className={`text-5xl mb-3 drop-shadow-md ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
          {getSuitIcon(card.suit)}
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">{typeLabel}</span>
        <span className={`text-4xl font-black ${isSelected ? 'text-yellow-400' : 'text-white'}`}>{card.value}</span>
      </div>

      {/* Bottom Corner Info (Inverted) */}
      <div className={`w-full flex justify-between font-black text-xl rotate-180 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>

      {/* Selection Glow Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-yellow-400/5 rounded-2xl pointer-events-none" />
      )}
    </div>
  );
};

export default Card;
