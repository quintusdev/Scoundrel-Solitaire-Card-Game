
import React, { useMemo } from 'react';
import { Card as CardType, WorldShift } from '../types';
import { getSuitIcon, getCardType, generatePixelArtSVG, isRedSuit } from '../constants';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  animationDelay?: string;
  isExiting?: boolean; 
  isDying?: boolean;   
  isQuestionMode?: boolean;
  activeShifts?: WorldShift[];
}

const Card: React.FC<CardProps> = ({ card, isSelected, onClick, animationDelay, isExiting, isDying, isQuestionMode, activeShifts = [] }) => {
  const isRed = isRedSuit(card.suit);
  const type = getCardType(card.suit);
  
  const rarityClass = useMemo(() => {
    if (card.value >= 13) return "rarity-leggendaria";
    if (card.value >= 10) return "rarity-rara";
    return "rarity-comune";
  }, [card.value]);

  const pixelArt = useMemo(() => generatePixelArtSVG(type, card.value), [type, card.value]);
  const suitIcon = getSuitIcon(card.suit);

  // World Shift Effects
  const hasDistortNames = isQuestionMode && activeShifts.some(s => s.effectId === 'distort_names');
  const hasDistortAnim = isQuestionMode && activeShifts.some(s => s.effectId === 'distort_anim');

  const distortedRank = useMemo(() => {
    if (!hasDistortNames) return card.rank;
    const chars = "!?#@*&%$0123456789";
    return chars[Math.floor(Math.random() * chars.length)];
  }, [card.rank, hasDistortNames]);

  return (
    <div 
      onClick={isDying || isExiting ? undefined : onClick}
      style={{ animationDelay }}
      className={`
        relative w-full aspect-[2/3] rounded-2xl cursor-pointer 
        transition-all duration-300 transform border-2 
        ${isExiting ? 'card-exit-flee' : isDying ? 'card-defeat' : 'card-animate'}
        ${isSelected ? 'pulse-glow scale-105 -translate-y-4 z-20' : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'}
        ${rarityClass}
        flex flex-col items-center justify-between p-4 select-none overflow-hidden
        ${isQuestionMode ? 'blur-[0.5px]' : ''}
        ${hasDistortAnim ? 'animate-distort' : ''}
      `}
    >
      <div className={`w-full flex justify-between font-black text-xl z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span className={hasDistortNames ? 'animate-pulse' : ''}>{isQuestionMode ? '?' : distortedRank}</span>
        <span>{suitIcon}</span>
      </div>
      
      <div 
        className={`card-art transition-transform duration-500 w-16 h-16 md:w-20 md:h-20 ${isSelected ? 'scale-110 brightness-125' : ''} ${isQuestionMode ? 'animate-pulse' : ''} ${hasDistortAnim ? 'skew-x-12' : ''}`} 
        dangerouslySetInnerHTML={{ __html: pixelArt }} 
      />

      <div className="flex flex-col items-center text-center z-10">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">
          {hasDistortNames ? "???" : (type === "potion" ? "Cura" : type === "weapon" ? "Arma" : "Mostro")}
        </span>
        <span className={`text-4xl md:text-5xl font-black drop-shadow-lg ${isSelected ? 'text-yellow-400' : 'text-white'} ${isQuestionMode ? 'opacity-50' : ''}`}>
          {isQuestionMode ? '~' : ''}{card.value}
        </span>
      </div>

      <div className={`w-full flex justify-between font-black text-xl rotate-180 z-10 ${isRed ? 'text-red-500' : 'text-slate-400'}`}>
        <span className={hasDistortNames ? 'animate-pulse' : ''}>{isQuestionMode ? '?' : distortedRank}</span>
        <span>{suitIcon}</span>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />
      {hasDistortAnim && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-cyan-500/10 to-transparent opacity-30 animate-scanline" />
      )}
    </div>
  );
};

export default Card;
