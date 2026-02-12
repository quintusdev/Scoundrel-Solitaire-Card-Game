
import React from 'react';
import { Card as CardType } from '../types';
import { getSuitIcon, getCardType, generatePixelArtSVG } from '../constants';

/**
 * SCOPO DEL FILE: Render della Carta (Atom).
 * RESPONSABILITÀ: Visualizzare dati e arte procedurale, gestire stati visivi (selected, dying).
 * DIPENDENZE: constants.tsx per icone e SVG.
 */

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
  
  // LOGICA RARITÀ: Estetica pura basata sul valore della carta.
  const getRarityClass = () => {
    if (card.value >= 13) return "rarity-leggendaria";
    if (card.value >= 10) return "rarity-rara";
    return "rarity-comune";
  };

  const pixelArt = generatePixelArtSVG(type, card.value);

  return (
    <div 
      // Impediamo interazioni durante le animazioni di morte o uscita
      onClick={isDying || isExiting || isWeaponDeath ? undefined : onClick}
      style={{ animationDelay }}
      className={`
        relative w-full aspect-[2/3] rounded-2xl cursor-pointer 
        transition-all duration-300 transform border-2 
        ${isExiting ? 'card-exit-flee' : isWeaponDeath ? 'card-weapon-death' : isDying ? 'card-defeat' : 'card-animate'}
        ${isSelected ? 'pulse-glow scale-105 -translate-y-4 z-20' : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'}
        ${getRarityClass()}
        flex flex-col items-center justify-between p-4 select-none overflow-hidden
      `}
    >
      {/* HEADER: Rango e Seme */}
      <div className={`w-full flex justify-between font-black text-xl z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>
      
      {/* ART AREA: Iniezione SVG procedurale */}
      <div 
        className={`card-art transition-transform duration-500 w-16 h-16 md:w-20 md:h-20 ${isSelected ? 'scale-110 brightness-125' : ''}`} 
        dangerouslySetInnerHTML={{ __html: pixelArt }} 
      />

      {/* FOOTER INFO: Tipo e Valore Numerico */}
      <div className="flex flex-col items-center text-center z-10">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
          {type === "potion" ? "Cura" : type === "weapon" ? "Arma" : "Mostro"}
        </span>
        <span className={`text-4xl md:text-5xl font-black drop-shadow-lg ${isSelected ? 'text-yellow-400' : 'text-white'}`}>
          {card.value}
        </span>
      </div>

      {/* REVERSE HEADER: Ruotato di 180 gradi (stile mazzo reale) */}
      <div className={`w-full flex justify-between font-black text-xl rotate-180 z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span>{card.rank}</span>
        <span>{getSuitIcon(card.suit)}</span>
      </div>

      {/* OVERLAY TEXTURE: Pixel-art noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
    </div>
  );
};

export default Card;
