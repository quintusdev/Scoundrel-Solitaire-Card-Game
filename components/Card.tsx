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
}

const Card: React.FC<CardProps> = ({ card, isSelected, onClick, animationDelay, isExiting, isDying }) => {
  const isRed = card.suit === "Cuori" || card.suit === "Quadri";
  const type = getCardType(card.suit);
  const typeLabel = type === "potion" ? "Pozione" : type === "weapon" ? "Arma" : "Mostro";
  
  const getRarityClass = () => {
    if (card.value >= 13) return "glow-strong";
    if (card.value >= 10) return "glow-medium";
    if (card.value >= 6) return "glow-soft";
    return "";
  };

  const pixelArt = generatePixelArtSVG(type, card.value);

  return (
    <div 
      onClick={isDying || isExiting ? undefined : onClick}
      style={{ animationDelay }}
      className={`
        relative w-full aspect-[2/3] max-w-[180px] rounded-2xl cursor-pointer 
        transition-all duration-300 transform border-2 
        ${isExiting ? 'card-exit-flee' : isDying ? 'card-defeat' : 'card-animate'}
        card-${type} ${getRarityClass()}
        ${isSelected ? 'card-selected z-20' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}
        flex flex-col items-center justify-between p-4 select-none overflow-hidden
      `}
    >
      {/* VFX Impact Ring inside card */}
      {isDying && <div className="impact-ring" />}

      {/* --- COMMENTO JUNIOR: La parte grafica degli angoli. 
         Ho dovuto ruotare quella sotto sennò era brutta. --- */}
      <div className={`card-corner w-full flex justify-between font-black text-xl z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>
      
      <div 
        className={`card-art transition-transform duration-500 ${isSelected ? 'scale-125 brightness-125' : ''}`} 
        dangerouslySetInnerHTML={{ __html: pixelArt }} 
      />

      <div className="flex flex-col items-center text-center z-10">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">{typeLabel}</span>
        <div className="relative">
          <span className={`text-5xl font-black title-font drop-shadow-lg ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
            {card.value}
          </span>
          {/* Indicatore di potenza visivo (barre) */}
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

      {/* Texture pixelata di sottofondo */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
    </div>
  );
};

export default Card;
