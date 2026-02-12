
import React from 'react';
import { Card as CardType } from '../types';
import { getSuitIcon, getCardType, generatePixelArtSVG } from '../constants';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  animationDelay?: string;
  isExiting?: boolean;
  isDying?: boolean;
  isWeaponDeath?: boolean;
}

const Card: React.FC<CardProps> = ({ card, isSelected, onClick, animationDelay, isExiting, isDying, isWeaponDeath }) => {
  const isRed = card.suit === "Cuori" || card.suit === "Quadri";
  const type = getCardType(card.suit);
  const typeLabel = type === "potion" ? "Pozione" : type === "weapon" ? "Arma" : "Mostro";
  
  const getRarityInfo = () => {
    if (card.value >= 13) return { label: "Leggendaria", class: "rarity-leggendaria" };
    if (card.value >= 10) return { label: "Rara", class: "rarity-rara" };
    return { label: "Comune", class: "rarity-comune" };
  };

  const rarity = getRarityInfo();
  const pixelArt = generatePixelArtSVG(type, card.value);

  return (
    <div 
      id={`card-${card.suit}-${card.value}`}
      onClick={isDying || isExiting ? undefined : onClick}
      style={{ animationDelay }}
      className={`
        relative w-full aspect-[2/3] max-w-[180px] rounded-2xl cursor-pointer 
        transition-all duration-300 transform border-2 
        ${isExiting ? 'card-exit-flee' : isDying ? 'card-defeat' : 'card-animate'}
        ${isWeaponDeath ? 'animate-shake-heavy' : ''}
        card-${type} ${rarity.class}
        ${isSelected ? 'card-selected z-20' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}
        flex flex-col items-center justify-between p-4 select-none overflow-hidden
      `}
    >
      {/* VFX Impact Ring inside card */}
      {isDying && <div className="impact-ring" />}

      <div className={`card-corner w-full flex justify-between font-black text-xl z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>
      
      <div className="flex flex-col items-center gap-1 z-10">
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${rarity.class}-label`}>
          {rarity.label}
        </span>
        <div 
          className={`card-art transition-all duration-500 ${isSelected ? 'scale-125 brightness-125' : ''}`} 
          dangerouslySetInnerHTML={{ __html: pixelArt }} 
        />
      </div>

      <div className="flex flex-col items-center text-center z-10">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">{typeLabel}</span>
        <div className="relative">
          <span className={`text-5xl font-black title-font drop-shadow-lg ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
            {card.value}
          </span>
          <div className="flex gap-0.5 mt-1 justify-center">
            {Array.from({ length: Math.ceil(card.value / 2) }).map((_, i) => (
              <div key={i} className={`w-1 h-2 rounded-sm ${isSelected ? 'bg-yellow-400' : (isRed ? 'bg-red-500' : 'bg-blue-500')}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={`card-corner w-full flex justify-between font-black text-xl rotate-180 z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>

      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
    </div>
  );
};

export default Card;
